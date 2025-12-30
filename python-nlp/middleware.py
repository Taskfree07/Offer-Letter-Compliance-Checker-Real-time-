"""
Authentication Middleware for Email Automation API
Handles JWT tokens and API key validation
"""
import logging
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from models import db, User, ApiKey

logger = logging.getLogger(__name__)


def get_client_ip():
    """Extract client IP address from request"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    return request.remote_addr


def get_user_agent():
    """Extract user agent from request"""
    return request.headers.get('User-Agent', 'Unknown')


def api_key_required(scopes=None):
    """
    Decorator to require valid API key for endpoint

    Args:
        scopes (list): Required scopes (e.g., ['read'], ['write', 'admin'])

    Usage:
        @api_key_required(scopes=['read'])
        def my_endpoint():
            # Access current_api_key and current_user from g object
            pass
    """
    if scopes is None:
        scopes = ['read']

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Get API key from header
            auth_header = request.headers.get('Authorization', '')

            if not auth_header.startswith('Bearer '):
                return jsonify({
                    'success': False,
                    'error': 'Missing API key',
                    'message': 'API key required in Authorization header: Bearer ea_live_...'
                }), 401

            # Extract API key
            api_key_value = auth_header.replace('Bearer ', '').strip()

            if not api_key_value.startswith('ea_'):
                return jsonify({
                    'success': False,
                    'error': 'Invalid API key format',
                    'message': 'API key must start with ea_live_ or ea_test_'
                }), 401

            # Hash the provided key
            key_hash = ApiKey.hash_key(api_key_value)

            # Find API key in database
            api_key = ApiKey.query.filter_by(key_hash=key_hash).first()

            if not api_key:
                logger.warning(f"Invalid API key attempt from IP: {get_client_ip()}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid API key',
                    'message': 'The provided API key does not exist'
                }), 401

            # Check if key is valid
            if not api_key.is_valid():
                reason = 'revoked' if api_key.revoked_at else 'expired' if api_key.expires_at else 'inactive'
                logger.warning(f"Inactive API key attempt ({reason}): {api_key.key_prefix}... from IP: {get_client_ip()}")
                return jsonify({
                    'success': False,
                    'error': f'API key {reason}',
                    'message': f'This API key has been {reason}'
                }), 401

            # Check scopes
            for required_scope in scopes:
                if not api_key.has_scope(required_scope):
                    logger.warning(f"Insufficient scope for API key {api_key.key_prefix}... - required: {required_scope}")
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient permissions',
                        'message': f'This API key does not have required scope: {required_scope}'
                    }), 403

            # Get user
            user = User.query.get(api_key.user_id)
            if not user or not user.is_active:
                return jsonify({
                    'success': False,
                    'error': 'User account inactive',
                    'message': 'The user account associated with this API key is inactive'
                }), 403

            # Record usage
            api_key.record_usage()
            db.session.commit()

            # Store in request context
            from flask import g
            g.current_api_key = api_key
            g.current_user = user
            g.auth_method = 'api_key'

            logger.info(f"API key authenticated: {api_key.key_prefix}... ({user.email})")

            return fn(*args, **kwargs)

        return wrapper
    return decorator


def jwt_or_api_key_required(scopes=None):
    """
    Decorator that accepts either JWT token or API key
    Flexible authentication for endpoints

    Usage:
        @jwt_or_api_key_required(scopes=['read'])
        def my_endpoint():
            # Access current_user from g object
            pass
    """
    if scopes is None:
        scopes = ['read']

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            from flask import g

            # Check for API key first
            auth_header = request.headers.get('Authorization', '')

            if auth_header.startswith('Bearer ea_'):
                # Use API key authentication
                api_key_value = auth_header.replace('Bearer ', '').strip()
                key_hash = ApiKey.hash_key(api_key_value)
                api_key = ApiKey.query.filter_by(key_hash=key_hash).first()

                if api_key and api_key.is_valid():
                    # Check scopes
                    for required_scope in scopes:
                        if not api_key.has_scope(required_scope):
                            return jsonify({
                                'success': False,
                                'error': 'Insufficient permissions'
                            }), 403

                    # Get user
                    user = User.query.get(api_key.user_id)
                    if user and user.is_active:
                        api_key.record_usage()
                        db.session.commit()

                        g.current_api_key = api_key
                        g.current_user = user
                        g.auth_method = 'api_key'

                        return fn(*args, **kwargs)

            # Fall back to JWT authentication
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                user = User.query.get(int(user_id))

                if not user or not user.is_active:
                    return jsonify({
                        'success': False,
                        'error': 'User not found or inactive'
                    }), 401

                g.current_user = user
                g.auth_method = 'jwt'

                return fn(*args, **kwargs)

            except Exception as e:
                logger.error(f"Authentication failed: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Authentication required',
                    'message': 'Valid JWT token or API key required'
                }), 401

        return wrapper
    return decorator


def admin_required():
    """
    Decorator to require admin privileges
    Must be used after jwt_required or api_key_required
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            from flask import g

            # Check if user is authenticated
            if not hasattr(g, 'current_user'):
                return jsonify({
                    'success': False,
                    'error': 'Authentication required'
                }), 401

            # Check admin status
            if not g.current_user.is_admin:
                logger.warning(f"Unauthorized admin access attempt by user: {g.current_user.email}")
                return jsonify({
                    'success': False,
                    'error': 'Admin privileges required',
                    'message': 'You do not have permission to access this resource'
                }), 403

            return fn(*args, **kwargs)

        return wrapper
    return decorator


# Rate limiting helper (basic implementation)
class RateLimiter:
    """Simple in-memory rate limiter for API keys"""

    def __init__(self):
        self.requests = {}  # {api_key_id: [(timestamp, count), ...]}

    def is_rate_limited(self, api_key):
        """Check if API key has exceeded rate limit"""
        from datetime import datetime, timedelta

        now = datetime.utcnow()
        hour_ago = now - timedelta(hours=1)

        # Clean old entries
        if api_key.id in self.requests:
            self.requests[api_key.id] = [
                (ts, count) for ts, count in self.requests[api_key.id]
                if ts > hour_ago
            ]

        # Count requests in last hour
        total_requests = sum(
            count for ts, count in self.requests.get(api_key.id, [])
        )

        if total_requests >= api_key.rate_limit:
            return True

        # Record this request
        if api_key.id not in self.requests:
            self.requests[api_key.id] = []

        self.requests[api_key.id].append((now, 1))

        return False


# Global rate limiter instance
rate_limiter = RateLimiter()
