"""
Authentication blueprint for Email Automation application
Handles both Microsoft OAuth and traditional email/password authentication
"""
import os
import logging
from datetime import datetime, timedelta
from functools import wraps

import requests
import jwt as pyjwt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from msal import ConfidentialClientApplication

from models import db, User, LoginEvent
from middleware import get_client_ip, get_user_agent

# Import WebSocket broadcast function (lazy import to avoid circular dependency)
def broadcast_login_event_if_available(event, user_id):
    """Broadcast login event via WebSocket if available"""
    try:
        from websocket_events import broadcast_login_event
        broadcast_login_event(event, user_id)
    except Exception as e:
        logger.debug(f"WebSocket broadcast not available: {e}")

logger = logging.getLogger(__name__)

# Create auth blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Microsoft OAuth configuration
MICROSOFT_CLIENT_ID = os.getenv('MICROSOFT_CLIENT_ID')
MICROSOFT_CLIENT_SECRET = os.getenv('MICROSOFT_CLIENT_SECRET')
MICROSOFT_TENANT_ID = os.getenv('MICROSOFT_TENANT_ID')
MICROSOFT_AUTHORITY = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}"
MICROSOFT_SCOPE = ["User.Read"]


def get_msal_app():
    """Create MSAL confidential client application"""
    return ConfidentialClientApplication(
        MICROSOFT_CLIENT_ID,
        authority=MICROSOFT_AUTHORITY,
        client_credential=MICROSOFT_CLIENT_SECRET,
    )


def verify_microsoft_token(access_token):
    """
    Verify Microsoft access token and get user info
    Returns user info dict or None if invalid
    """
    try:
        # Call Microsoft Graph API to get user info
        graph_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {access_token}"}

        response = requests.get(graph_url, headers=headers, timeout=10)

        if response.status_code == 200:
            user_info = response.json()
            return {
                'microsoft_id': user_info.get('id'),
                'email': user_info.get('mail') or user_info.get('userPrincipalName'),
                'name': user_info.get('displayName'),
                'job_title': user_info.get('jobTitle'),
                'department': user_info.get('department'),
            }
        else:
            logger.error(f"Microsoft Graph API error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        logger.error(f"Error verifying Microsoft token: {e}")
        return None


# ============ Traditional Authentication Endpoints ============

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user with email and password

    Request body:
    {
        "email": "user@example.com",
        "password": "securepassword",
        "name": "John Doe"
    }
    """
    try:
        data = request.get_json()

        # Validate input
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        if not email or not password or not name:
            return jsonify({
                'success': False,
                'error': 'Email, password, and name are required'
            }), 400

        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400

        # Validate password strength
        if len(password) < 8:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 409

        # Create new user
        new_user = User(
            email=email,
            name=name,
            auth_provider='email',
            email_verified=False,  # TODO: Implement email verification
            is_active=True
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Generate JWT tokens (convert ID to string for JWT)
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))

        logger.info(f"New user registered: {email}")

        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in register: {e}")
        return jsonify({
            'success': False,
            'error': 'Registration failed',
            'message': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login with email and password

    Request body:
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    """
    try:
        data = request.get_json()

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user:
            # Log failed login attempt
            LoginEvent.log_event(
                event_type='login_failed',
                auth_method='email',
                email_attempted=email,
                ip_address=get_client_ip(),
                user_agent=get_user_agent(),
                success=False,
                failure_reason='User not found'
            )
            db.session.commit()

            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401

        # Check if user registered with Microsoft OAuth
        if user.auth_provider == 'microsoft':
            return jsonify({
                'success': False,
                'error': 'This account uses Microsoft login. Please sign in with Microsoft.'
            }), 401

        # Verify password
        if not user.check_password(password):
            # Log failed login attempt
            LoginEvent.log_event(
                event_type='login_failed',
                auth_method='email',
                user_id=user.id,
                email_attempted=email,
                ip_address=get_client_ip(),
                user_agent=get_user_agent(),
                success=False,
                failure_reason='Invalid password'
            )
            db.session.commit()

            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401

        # Check if account is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'error': 'Account is deactivated. Please contact support.'
            }), 403

        # Update last login
        user.last_login = datetime.utcnow()

        # Log successful login
        login_event = LoginEvent.log_event(
            event_type='login_success',
            auth_method='email',
            user_id=user.id,
            email_attempted=email,
            ip_address=get_client_ip(),
            user_agent=get_user_agent(),
            success=True
        )

        db.session.commit()

        # Broadcast login event via WebSocket
        broadcast_login_event_if_available(login_event, user.id)

        # Generate JWT tokens (convert ID to string for JWT)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        logger.info(f"User logged in: {email}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({
            'success': False,
            'error': 'Login failed',
            'message': str(e)
        }), 500


# ============ Microsoft OAuth Endpoints ============

@auth_bp.route('/microsoft/verify', methods=['POST'])
def microsoft_verify():
    """
    Verify Microsoft access token from frontend
    Creates or updates user account

    Request body:
    {
        "access_token": "microsoft_access_token_from_msal"
    }
    """
    try:
        data = request.get_json()
        access_token = data.get('access_token')

        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Access token is required'
            }), 400

        # Verify token and get user info from Microsoft
        user_info = verify_microsoft_token(access_token)

        if not user_info:
            return jsonify({
                'success': False,
                'error': 'Invalid Microsoft access token'
            }), 401

        email = user_info['email']
        microsoft_id = user_info['microsoft_id']

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if user:
            # Update existing user
            if user.auth_provider != 'microsoft':
                return jsonify({
                    'success': False,
                    'error': 'This email is registered with password login. Please use password to login.'
                }), 409

            # Update user info from Microsoft
            user.microsoft_id = microsoft_id
            user.name = user_info['name'] or user.name
            user.job_title = user_info.get('job_title')
            user.department = user_info.get('department')
            user.last_login = datetime.utcnow()
            user.email_verified = True

        else:
            # Create new user
            user = User(
                email=email,
                name=user_info['name'] or email.split('@')[0],
                auth_provider='microsoft',
                microsoft_id=microsoft_id,
                job_title=user_info.get('job_title'),
                department=user_info.get('department'),
                email_verified=True,
                is_active=True
            )
            db.session.add(user)

        # Log successful Microsoft login
        login_event = LoginEvent.log_event(
            event_type='login_success',
            auth_method='microsoft',
            user_id=user.id,
            email_attempted=email,
            ip_address=get_client_ip(),
            user_agent=get_user_agent(),
            success=True
        )

        db.session.commit()

        # Broadcast login event via WebSocket
        broadcast_login_event_if_available(login_event, user.id)

        # Generate JWT tokens (convert ID to string for JWT)
        access_token_jwt = create_access_token(identity=str(user.id))
        refresh_token_jwt = create_refresh_token(identity=str(user.id))

        logger.info(f"Microsoft OAuth user authenticated: {email}")

        return jsonify({
            'success': True,
            'message': 'Microsoft authentication successful',
            'user': user.to_dict(),
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in microsoft_verify: {e}")
        return jsonify({
            'success': False,
            'error': 'Microsoft authentication failed',
            'message': str(e)
        }), 500


# ============ Token Management ============

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token
    Requires valid refresh token in Authorization header
    """
    try:
        current_user_id = get_jwt_identity()

        # Generate new access token (current_user_id is already a string from JWT)
        new_access_token = create_access_token(identity=current_user_id)

        return jsonify({
            'success': True,
            'access_token': new_access_token
        }), 200

    except Exception as e:
        logger.error(f"Error in refresh: {e}")
        return jsonify({
            'success': False,
            'error': 'Token refresh failed',
            'message': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (optional - frontend can just delete tokens)
    Could be used to blacklist tokens if needed
    """
    try:
        # TODO: Implement token blacklist if needed
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200

    except Exception as e:
        logger.error(f"Error in logout: {e}")
        return jsonify({
            'success': False,
            'error': 'Logout failed',
            'message': str(e)
        }), 500


# ============ User Info Endpoints ============

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user's information
    Requires valid access token in Authorization header: Bearer <token>
    """
    try:
        current_user_id = get_jwt_identity()

        # Convert back to int since we store it as string in JWT
        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get user info',
            'message': str(e)
        }), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """
    Update current user's profile information

    Request body:
    {
        "name": "New Name",
        "job_title": "New Title",
        "department": "New Department"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Convert back to int since we store it as string in JWT
        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        # Update allowed fields
        if 'name' in data:
            user.name = data['name'].strip()
        if 'job_title' in data:
            user.job_title = data['job_title'].strip()
        if 'department' in data:
            user.department = data['department'].strip()

        db.session.commit()

        logger.info(f"User profile updated: {user.email}")

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in update_current_user: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to update profile',
            'message': str(e)
        }), 500


# ============ Helper Decorator ============

def get_current_user():
    """
    Helper function to get current user object from JWT token
    Use this in other blueprints that need user context
    """
    try:
        current_user_id = get_jwt_identity()
        # Convert back to int since we store it as string in JWT
        return User.query.get(int(current_user_id))
    except:
        return None
