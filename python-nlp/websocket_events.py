"""
WebSocket Event Handlers for Real-Time Login Event Streaming
Uses Flask-SocketIO for WebSocket support
"""
import logging
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask import request
from flask_jwt_extended import decode_token
from jwt import ExpiredSignatureError, InvalidTokenError

from models import User, ApiKey

logger = logging.getLogger(__name__)

# SocketIO instance (will be initialized in app.py)
socketio = None


def init_socketio(app):
    """Initialize SocketIO with Flask app"""
    global socketio
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",  # Configure based on your security needs
        async_mode='threading',
        logger=True,
        engineio_logger=True,
        ping_timeout=60,
        ping_interval=25
    )

    logger.info("✅ SocketIO initialized for real-time events")

    # Register event handlers
    register_socketio_events(socketio)

    return socketio


def authenticate_socket(token):
    """
    Authenticate WebSocket connection using JWT or API key

    Args:
        token: JWT token or API key

    Returns:
        User object if authenticated, None otherwise
    """
    try:
        # Try JWT first
        if not token.startswith('ea_'):
            try:
                # Decode JWT token
                decoded = decode_token(token)
                user_id = decoded.get('sub')  # Subject is user_id

                if user_id:
                    user = User.query.get(int(user_id))
                    if user and user.is_active:
                        return user
            except (ExpiredSignatureError, InvalidTokenError) as e:
                logger.warning(f"Invalid JWT token for WebSocket: {e}")

        # Try API key
        if token.startswith('ea_'):
            key_hash = ApiKey.hash_key(token)
            api_key = ApiKey.query.filter_by(key_hash=key_hash).first()

            if api_key and api_key.is_valid():
                user = User.query.get(api_key.user_id)
                if user and user.is_active:
                    # Record API key usage
                    api_key.record_usage()
                    from models import db
                    db.session.commit()
                    return user

    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")

    return None


def register_socketio_events(socketio_instance):
    """Register all WebSocket event handlers"""

    @socketio_instance.on('connect')
    def handle_connect(auth):
        """
        Handle WebSocket connection

        Client must send auth token:
        socket.emit('connect', {auth: {token: 'your_jwt_or_api_key'}})
        """
        try:
            # Get token from auth
            token = None
            if auth and isinstance(auth, dict):
                token = auth.get('token')

            if not token:
                logger.warning("WebSocket connection attempt without token")
                disconnect()
                return False

            # Authenticate user
            user = authenticate_socket(token)

            if not user:
                logger.warning("WebSocket authentication failed")
                disconnect()
                return False

            # Join user's private room
            room = f"user_{user.id}"
            join_room(room)

            logger.info(f"WebSocket connected: User {user.email} (room: {room})")

            # Send connection success
            emit('connected', {
                'success': True,
                'message': f'Connected to login events stream',
                'user_id': user.id,
                'room': room
            })

            return True

        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            disconnect()
            return False

    @socketio_instance.on('disconnect')
    def handle_disconnect():
        """Handle WebSocket disconnection"""
        try:
            logger.info("WebSocket client disconnected")
        except Exception as e:
            logger.error(f"WebSocket disconnection error: {e}")

    @socketio_instance.on('subscribe_events')
    def handle_subscribe_events(data):
        """
        Subscribe to specific event types

        Client sends:
        {
            "event_types": ["login_success", "login_failed"],
            "auth_methods": ["email", "microsoft"]
        }
        """
        try:
            logger.info(f"Client subscribed to filtered events: {data}")

            emit('subscription_confirmed', {
                'success': True,
                'filters': data
            })

        except Exception as e:
            logger.error(f"Error subscribing to events: {e}")
            emit('error', {
                'success': False,
                'error': str(e)
            })

    @socketio_instance.on('ping')
    def handle_ping():
        """Handle ping from client to keep connection alive"""
        emit('pong', {'timestamp': str(datetime.utcnow())})


def broadcast_login_event(event, user_id):
    """
    Broadcast login event to user's WebSocket room

    Args:
        event: LoginEvent object
        user_id: User ID to send event to

    Usage (after a login event):
        from websocket_events import broadcast_login_event
        broadcast_login_event(login_event, user.id)
    """
    if not socketio:
        logger.warning("SocketIO not initialized, cannot broadcast event")
        return

    try:
        room = f"user_{user_id}"

        # Emit event to user's room
        socketio.emit(
            'login_event',
            {
                'event': event.to_dict(),
                'timestamp': event.created_at.isoformat()
            },
            room=room
        )

        logger.info(f"Broadcasted login event to room {room}")

    except Exception as e:
        logger.error(f"Error broadcasting login event: {e}")


def broadcast_api_key_event(event_type, api_key_data, user_id):
    """
    Broadcast API key events (created, revoked, etc.)

    Args:
        event_type: 'api_key_created', 'api_key_revoked', etc.
        api_key_data: API key dict
        user_id: User ID to send event to
    """
    if not socketio:
        return

    try:
        room = f"user_{user_id}"

        socketio.emit(
            'api_key_event',
            {
                'event_type': event_type,
                'api_key': api_key_data,
                'timestamp': datetime.utcnow().isoformat()
            },
            room=room
        )

        logger.info(f"Broadcasted API key event to room {room}")

    except Exception as e:
        logger.error(f"Error broadcasting API key event: {e}")


# Import datetime for timestamps
from datetime import datetime
