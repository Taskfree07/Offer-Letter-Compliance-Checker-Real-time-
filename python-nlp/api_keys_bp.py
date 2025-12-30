"""
API Keys and Analytics Blueprint
Handles API key management and login event tracking
"""
import logging
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, and_

from models import db, User, ApiKey, LoginEvent
from middleware import jwt_or_api_key_required, admin_required, get_client_ip, get_user_agent

logger = logging.getLogger(__name__)

# Create blueprint
api_keys_bp = Blueprint('api_keys', __name__, url_prefix='/api/keys')
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


# ============ API Key Management Endpoints ============

@api_keys_bp.route('/', methods=['POST'])
@jwt_required()
def create_api_key():
    """
    Create a new API key for the authenticated user

    Request body:
    {
        "name": "My Integration Key",
        "scopes": "read,write",  // Optional, defaults to "read"
        "expires_in_days": 90  // Optional, null = never expires
    }

    Response:
    {
        "success": true,
        "api_key": {
            "id": 1,
            "name": "My Integration Key",
            "api_key": "ea_live_xxxxxxxxxxxxxxxxxxxxx",  // ONLY shown once!
            "key_prefix": "ea_live_",
            "scopes": ["read", "write"],
            ...
        },
        "message": "API key created successfully. Save this key - it won't be shown again!"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user or not user.is_active:
            return jsonify({
                'success': False,
                'error': 'User not found or inactive'
            }), 404

        data = request.get_json()

        # Validate input
        name = data.get('name', '').strip()
        if not name:
            return jsonify({
                'success': False,
                'error': 'API key name is required'
            }), 400

        scopes = data.get('scopes', 'read').strip()
        expires_in_days = data.get('expires_in_days')

        # Validate scopes
        valid_scopes = {'read', 'write', 'admin'}
        requested_scopes = set(s.strip() for s in scopes.split(','))

        if not requested_scopes.issubset(valid_scopes):
            return jsonify({
                'success': False,
                'error': f'Invalid scopes. Valid values: {", ".join(valid_scopes)}'
            }), 400

        # Only admins can create admin-scoped keys
        if 'admin' in requested_scopes and not user.is_admin:
            return jsonify({
                'success': False,
                'error': 'Only administrators can create admin-scoped API keys'
            }), 403

        # Limit number of API keys per user
        existing_keys = ApiKey.query.filter_by(user_id=user.id, is_active=True).count()
        if existing_keys >= 10:
            return jsonify({
                'success': False,
                'error': 'Maximum number of API keys reached (10)',
                'message': 'Please revoke unused keys before creating new ones'
            }), 400

        # Create API key
        api_key, plain_key = ApiKey.create_key(
            user_id=user.id,
            name=name,
            scopes=scopes,
            expires_in_days=expires_in_days
        )

        db.session.add(api_key)
        db.session.commit()

        logger.info(f"API key created: {api_key.key_prefix}... for user {user.email}")

        return jsonify({
            'success': True,
            'api_key': api_key.to_dict(include_key=True, plain_key=plain_key),
            'message': 'API key created successfully. Save this key - it won\'t be shown again!',
            'warning': 'Store this API key securely. You will not be able to see it again.'
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating API key: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to create API key',
            'message': str(e)
        }), 500


@api_keys_bp.route('/', methods=['GET'])
@jwt_required()
def list_api_keys():
    """
    List all API keys for the authenticated user

    Query params:
    - include_revoked: Include revoked keys (default: false)

    Response:
    {
        "success": true,
        "api_keys": [...],
        "total": 3,
        "active": 2
    }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        include_revoked = request.args.get('include_revoked', 'false').lower() == 'true'

        # Build query
        query = ApiKey.query.filter_by(user_id=user.id)

        if not include_revoked:
            query = query.filter(ApiKey.revoked_at.is_(None))

        api_keys = query.order_by(desc(ApiKey.created_at)).all()

        active_count = sum(1 for key in api_keys if key.is_valid())

        return jsonify({
            'success': True,
            'api_keys': [key.to_dict() for key in api_keys],
            'total': len(api_keys),
            'active': active_count
        }), 200

    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to list API keys',
            'message': str(e)
        }), 500


@api_keys_bp.route('/<int:key_id>', methods=['GET'])
@jwt_required()
def get_api_key(key_id):
    """Get details of a specific API key"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        api_key = ApiKey.query.filter_by(id=key_id, user_id=user.id).first()

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key not found'
            }), 404

        return jsonify({
            'success': True,
            'api_key': api_key.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error getting API key: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get API key',
            'message': str(e)
        }), 500


@api_keys_bp.route('/<int:key_id>', methods=['PATCH'])
@jwt_required()
def update_api_key(key_id):
    """
    Update API key (name, scopes, status)

    Request body:
    {
        "name": "Updated Name",  // Optional
        "scopes": "read,write",  // Optional
        "is_active": true  // Optional
    }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        api_key = ApiKey.query.filter_by(id=key_id, user_id=user.id).first()

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key not found'
            }), 404

        data = request.get_json()

        # Update name
        if 'name' in data:
            name = data['name'].strip()
            if name:
                api_key.name = name

        # Update scopes
        if 'scopes' in data:
            scopes = data['scopes'].strip()
            valid_scopes = {'read', 'write', 'admin'}
            requested_scopes = set(s.strip() for s in scopes.split(','))

            if not requested_scopes.issubset(valid_scopes):
                return jsonify({
                    'success': False,
                    'error': f'Invalid scopes. Valid values: {", ".join(valid_scopes)}'
                }), 400

            # Only admins can set admin scope
            if 'admin' in requested_scopes and not user.is_admin:
                return jsonify({
                    'success': False,
                    'error': 'Only administrators can set admin scope'
                }), 403

            api_key.scopes = scopes

        # Update active status
        if 'is_active' in data:
            api_key.is_active = bool(data['is_active'])

        db.session.commit()

        logger.info(f"API key updated: {api_key.key_prefix}... by user {user.email}")

        return jsonify({
            'success': True,
            'api_key': api_key.to_dict(),
            'message': 'API key updated successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating API key: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to update API key',
            'message': str(e)
        }), 500


@api_keys_bp.route('/<int:key_id>', methods=['DELETE'])
@jwt_required()
def revoke_api_key(key_id):
    """
    Revoke (soft delete) an API key
    The key will no longer work but history is preserved
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        api_key = ApiKey.query.filter_by(id=key_id, user_id=user.id).first()

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key not found'
            }), 404

        # Revoke the key
        api_key.revoked_at = datetime.utcnow()
        api_key.is_active = False

        db.session.commit()

        logger.info(f"API key revoked: {api_key.key_prefix}... by user {user.email}")

        return jsonify({
            'success': True,
            'message': 'API key revoked successfully',
            'api_key': api_key.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error revoking API key: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to revoke API key',
            'message': str(e)
        }), 500


# ============ Login Events / Analytics Endpoints ============

@analytics_bp.route('/login-events', methods=['GET'])
@jwt_or_api_key_required(scopes=['read'])
def get_login_events():
    """
    Get login events for the authenticated user

    Query params:
    - limit: Max number of events (default: 50, max: 500)
    - offset: Pagination offset (default: 0)
    - event_type: Filter by event type (login_success, login_failed, etc.)
    - auth_method: Filter by auth method (email, microsoft, api_key)
    - success: Filter by success status (true/false)
    - from_date: ISO format date (e.g., 2024-01-01T00:00:00)
    - to_date: ISO format date

    Response:
    {
        "success": true,
        "events": [...],
        "total": 150,
        "limit": 50,
        "offset": 0,
        "stats": {
            "total_logins": 120,
            "failed_logins": 30,
            "success_rate": 0.8
        }
    }
    """
    try:
        user = g.current_user

        # Parse query params
        limit = min(int(request.args.get('limit', 50)), 500)
        offset = int(request.args.get('offset', 0))
        event_type = request.args.get('event_type')
        auth_method = request.args.get('auth_method')
        success_filter = request.args.get('success')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')

        # Build query
        query = LoginEvent.query.filter_by(user_id=user.id)

        # Apply filters
        if event_type:
            query = query.filter_by(event_type=event_type)

        if auth_method:
            query = query.filter_by(auth_method=auth_method)

        if success_filter is not None:
            success_bool = success_filter.lower() == 'true'
            query = query.filter_by(success=success_bool)

        if from_date:
            try:
                from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                query = query.filter(LoginEvent.created_at >= from_dt)
            except ValueError:
                pass

        if to_date:
            try:
                to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                query = query.filter(LoginEvent.created_at <= to_dt)
            except ValueError:
                pass

        # Get total count
        total = query.count()

        # Get paginated results
        events = query.order_by(desc(LoginEvent.created_at)).limit(limit).offset(offset).all()

        # Calculate stats
        stats_query = LoginEvent.query.filter_by(user_id=user.id)
        total_events = stats_query.count()
        failed_events = stats_query.filter_by(success=False).count()
        success_rate = (total_events - failed_events) / total_events if total_events > 0 else 1.0

        return jsonify({
            'success': True,
            'events': [event.to_dict() for event in events],
            'total': total,
            'limit': limit,
            'offset': offset,
            'stats': {
                'total_events': total_events,
                'failed_events': failed_events,
                'success_rate': round(success_rate, 3)
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching login events: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch login events',
            'message': str(e)
        }), 500


@analytics_bp.route('/login-events/recent', methods=['GET'])
@jwt_or_api_key_required(scopes=['read'])
def get_recent_login_events():
    """
    Get most recent login events (last 24 hours)
    Optimized endpoint for dashboards
    """
    try:
        user = g.current_user

        # Last 24 hours
        since = datetime.utcnow() - timedelta(hours=24)

        events = LoginEvent.query.filter(
            and_(
                LoginEvent.user_id == user.id,
                LoginEvent.created_at >= since
            )
        ).order_by(desc(LoginEvent.created_at)).limit(20).all()

        return jsonify({
            'success': True,
            'events': [event.to_dict() for event in events],
            'count': len(events),
            'period': '24h'
        }), 200

    except Exception as e:
        logger.error(f"Error fetching recent login events: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch recent login events',
            'message': str(e)
        }), 500


@analytics_bp.route('/login-events/stats', methods=['GET'])
@jwt_or_api_key_required(scopes=['read'])
def get_login_stats():
    """
    Get aggregated login statistics

    Query params:
    - period: hour, day, week, month (default: week)

    Response:
    {
        "success": true,
        "stats": {
            "total_logins": 150,
            "successful_logins": 140,
            "failed_logins": 10,
            "success_rate": 0.933,
            "by_method": {
                "email": 100,
                "microsoft": 40,
                "api_key": 10
            },
            "by_event_type": {...},
            "unique_ips": 5,
            "period": "week"
        }
    }
    """
    try:
        user = g.current_user

        period = request.args.get('period', 'week')

        # Calculate time range
        now = datetime.utcnow()
        period_map = {
            'hour': timedelta(hours=1),
            'day': timedelta(days=1),
            'week': timedelta(weeks=1),
            'month': timedelta(days=30)
        }

        since = now - period_map.get(period, timedelta(weeks=1))

        # Get events in period
        events = LoginEvent.query.filter(
            and_(
                LoginEvent.user_id == user.id,
                LoginEvent.created_at >= since
            )
        ).all()

        total = len(events)
        successful = sum(1 for e in events if e.success)
        failed = total - successful

        # Group by method
        by_method = {}
        for event in events:
            method = event.auth_method
            by_method[method] = by_method.get(method, 0) + 1

        # Group by event type
        by_event_type = {}
        for event in events:
            event_type = event.event_type
            by_event_type[event_type] = by_event_type.get(event_type, 0) + 1

        # Unique IPs
        unique_ips = len(set(e.ip_address for e in events if e.ip_address))

        return jsonify({
            'success': True,
            'stats': {
                'total_logins': total,
                'successful_logins': successful,
                'failed_logins': failed,
                'success_rate': round(successful / total, 3) if total > 0 else 1.0,
                'by_method': by_method,
                'by_event_type': by_event_type,
                'unique_ips': unique_ips,
                'period': period,
                'since': since.isoformat(),
                'until': now.isoformat()
            }
        }), 200

    except Exception as e:
        logger.error(f"Error calculating login stats: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate login stats',
            'message': str(e)
        }), 500


# ============ Admin Endpoints ============

@analytics_bp.route('/admin/all-events', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_login_events():
    """
    Get all login events (admin only)
    Supports all same filters as regular endpoint
    """
    try:
        # Parse query params
        limit = min(int(request.args.get('limit', 100)), 1000)
        offset = int(request.args.get('offset', 0))
        user_id = request.args.get('user_id')
        event_type = request.args.get('event_type')
        auth_method = request.args.get('auth_method')
        success_filter = request.args.get('success')

        # Build query
        query = LoginEvent.query

        if user_id:
            query = query.filter_by(user_id=int(user_id))

        if event_type:
            query = query.filter_by(event_type=event_type)

        if auth_method:
            query = query.filter_by(auth_method=auth_method)

        if success_filter is not None:
            success_bool = success_filter.lower() == 'true'
            query = query.filter_by(success=success_bool)

        # Get total count
        total = query.count()

        # Get paginated results
        events = query.order_by(desc(LoginEvent.created_at)).limit(limit).offset(offset).all()

        return jsonify({
            'success': True,
            'events': [event.to_dict() for event in events],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200

    except Exception as e:
        logger.error(f"Error fetching all login events: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch login events',
            'message': str(e)
        }), 500
