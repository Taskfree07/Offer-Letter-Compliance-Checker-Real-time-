"""
Database models for Email Automation application
Supports both Microsoft OAuth and traditional email/password authentication
"""
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import secrets
import hashlib

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """User model - supports both OAuth and traditional auth"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Null for OAuth users

    # Authentication metadata
    auth_provider = db.Column(db.String(50), nullable=False, default='email')  # 'email' or 'microsoft'
    microsoft_id = db.Column(db.String(255), unique=True, nullable=True, index=True)  # Microsoft user ID

    # Profile information
    profile_picture = db.Column(db.String(500), nullable=True)
    job_title = db.Column(db.String(255), nullable=True)
    department = db.Column(db.String(255), nullable=True)

    # Account status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents = db.relationship('Document', back_populates='user', cascade='all, delete-orphan')
    templates = db.relationship('Template', back_populates='user', cascade='all, delete-orphan')
    api_keys = db.relationship('ApiKey', back_populates='user', cascade='all, delete-orphan')
    login_events = db.relationship('LoginEvent', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set password (for traditional auth)"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verify password (for traditional auth)"""
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert user to dictionary (for API responses)"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'auth_provider': self.auth_provider,
            'profile_picture': self.profile_picture,
            'job_title': self.job_title,
            'department': self.department,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        return f'<User {self.email}>'


class Document(db.Model):
    """Document model - stores user documents"""
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Document metadata
    filename = db.Column(db.String(500), nullable=False)
    doc_id = db.Column(db.String(255), unique=True, nullable=False, index=True)  # Hash ID
    file_path = db.Column(db.String(1000), nullable=False)
    template_path = db.Column(db.String(1000), nullable=True)

    # Document status
    is_modified = db.Column(db.Boolean, default=False, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='documents')
    variables = db.relationship('DocumentVariable', back_populates='document', cascade='all, delete-orphan')

    def to_dict(self):
        """Convert document to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'doc_id': self.doc_id,
            'is_modified': self.is_modified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'variables_count': len(self.variables)
        }

    def __repr__(self):
        return f'<Document {self.filename}>'


class DocumentVariable(db.Model):
    """Document variables - stores extracted variables for each document"""
    __tablename__ = 'document_variables'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False, index=True)

    # Variable data
    variable_name = db.Column(db.String(255), nullable=False)
    variable_value = db.Column(db.Text, nullable=True)
    entity_type = db.Column(db.String(100), nullable=True)  # From GLiNER
    suggested_value = db.Column(db.Text, nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    document = db.relationship('Document', back_populates='variables')

    def to_dict(self):
        """Convert variable to dictionary"""
        return {
            'id': self.id,
            'variable_name': self.variable_name,
            'variable_value': self.variable_value,
            'entity_type': self.entity_type,
            'suggested_value': self.suggested_value
        }

    def __repr__(self):
        return f'<Variable {self.variable_name}>'


class Template(db.Model):
    """Template model - stores email/document templates"""
    __tablename__ = 'templates'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # Null for system templates

    # Template metadata
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=False, default='other')
    content = db.Column(db.Text, nullable=False)

    # Template status
    is_system_template = db.Column(db.Boolean, default=False, nullable=False)  # System templates visible to all
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Usage tracking
    usage_count = db.Column(db.Integer, default=0, nullable=False)

    # Compliance
    compliance_status = db.Column(db.String(50), default='pending')  # verified, pending, review

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='templates')

    def to_dict(self):
        """Convert template to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'content': self.content,
            'is_system_template': self.is_system_template,
            'is_active': self.is_active,
            'usage_count': self.usage_count,
            'compliance_status': self.compliance_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Template {self.title}>'


# Helper function to initialize default system templates
def create_system_templates():
    """Create default system templates (run once on initial setup)"""
    system_templates = [
        {
            'title': 'Offer Letter Template',
            'description': 'Standard employment offer letter with customizable clauses',
            'category': 'hiring',
            'content': '''Dear [Candidate Name],

We are pleased to offer you the position of [Job Title] at [Company Name]. This offer is contingent upon your acceptance of the following terms and conditions:

Position: [Job Title]
Department: [Department]
Start Date: [Start Date]
Salary: $[Amount] per [Period]
Benefits: [List of Benefits]

This offer is valid for [Number] days from the date of this letter. Please sign and return a copy of this letter to indicate your acceptance.

We look forward to welcoming you to our team.

Sincerely,
[Hiring Manager Name]
[Company Name]''',
            'compliance_status': 'verified',
            'is_system_template': True,
            'user_id': None
        },
        {
            'title': 'Welcome Email',
            'description': 'New employee welcome and onboarding email',
            'category': 'onboarding',
            'content': '''Welcome to [Company Name]!

We are excited to have you join our team as [Job Title]. Your first day will be [Start Date] at [Time].

Please bring the following documents:
- Government-issued ID
- Social Security Card
- Direct Deposit Form
- Emergency Contact Information

If you have any questions, please don't hesitate to reach out.

Best regards,
[HR Team]''',
            'compliance_status': 'verified',
            'is_system_template': True,
            'user_id': None
        }
    ]

    for template_data in system_templates:
        # Check if template already exists
        existing = Template.query.filter_by(
            title=template_data['title'],
            is_system_template=True
        ).first()

        if not existing:
            template = Template(**template_data)
            db.session.add(template)

    db.session.commit()
    print(f"[OK] Created {len(system_templates)} system templates")


class ApiKey(db.Model):
    """API Key model - for programmatic access"""
    __tablename__ = 'api_keys'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # API Key data (we store hashed version for security)
    name = db.Column(db.String(255), nullable=False)  # User-friendly name
    key_prefix = db.Column(db.String(10), nullable=False, index=True)  # First 8 chars for identification
    key_hash = db.Column(db.String(255), nullable=False, unique=True, index=True)  # SHA-256 hash

    # Permissions and limits
    scopes = db.Column(db.String(500), nullable=False, default='read')  # Comma-separated: read,write,admin
    rate_limit = db.Column(db.Integer, default=1000)  # Requests per hour

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Usage tracking
    last_used_at = db.Column(db.DateTime, nullable=True)
    request_count = db.Column(db.Integer, default=0, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)  # Null = never expires
    revoked_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='api_keys')

    @staticmethod
    def generate_key():
        """
        Generate a secure API key
        Format: ea_live_[32_random_chars] or ea_test_[32_random_chars]
        """
        prefix = 'ea_live_'  # Email Automation Live
        random_part = secrets.token_urlsafe(32)[:32]  # 32 chars
        return f"{prefix}{random_part}"

    @staticmethod
    def hash_key(api_key):
        """Hash API key using SHA-256"""
        return hashlib.sha256(api_key.encode()).hexdigest()

    @classmethod
    def create_key(cls, user_id, name, scopes='read', expires_in_days=None):
        """
        Create and store a new API key
        Returns: (api_key_object, plain_text_key)
        """
        # Generate plain text key
        plain_key = cls.generate_key()

        # Extract prefix for identification (first 8 chars)
        key_prefix = plain_key[:8]

        # Hash the key for storage
        key_hash = cls.hash_key(plain_key)

        # Calculate expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

        # Create API key object
        api_key = cls(
            user_id=user_id,
            name=name,
            key_prefix=key_prefix,
            key_hash=key_hash,
            scopes=scopes,
            expires_at=expires_at
        )

        return api_key, plain_key

    def verify_key(self, plain_key):
        """Verify if provided key matches this API key"""
        return self.key_hash == self.hash_key(plain_key)

    def is_valid(self):
        """Check if API key is valid (active and not expired)"""
        if not self.is_active or self.revoked_at:
            return False

        if self.expires_at and self.expires_at < datetime.utcnow():
            return False

        return True

    def has_scope(self, required_scope):
        """Check if API key has required scope"""
        api_scopes = [s.strip() for s in self.scopes.split(',')]
        return required_scope in api_scopes or 'admin' in api_scopes

    def record_usage(self):
        """Record API key usage"""
        self.last_used_at = datetime.utcnow()
        self.request_count += 1

    def to_dict(self, include_key=False, plain_key=None):
        """Convert to dictionary (never expose hash)"""
        data = {
            'id': self.id,
            'name': self.name,
            'key_prefix': self.key_prefix,
            'scopes': self.scopes.split(',') if self.scopes else [],
            'is_active': self.is_active,
            'rate_limit': self.rate_limit,
            'request_count': self.request_count,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None
        }

        # Only include plain key when first created
        if include_key and plain_key:
            data['api_key'] = plain_key

        return data

    def __repr__(self):
        return f'<ApiKey {self.key_prefix}... ({self.name})>'


class LoginEvent(db.Model):
    """Login Event model - tracks all login attempts"""
    __tablename__ = 'login_events'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # Null for failed logins

    # Event details
    event_type = db.Column(db.String(50), nullable=False, index=True)  # login_success, login_failed, logout, token_refresh
    auth_method = db.Column(db.String(50), nullable=False)  # email, microsoft, api_key

    # User info (for failed attempts without user_id)
    email_attempted = db.Column(db.String(255), nullable=True, index=True)

    # Request metadata
    ip_address = db.Column(db.String(45), nullable=True)  # IPv6 compatible
    user_agent = db.Column(db.String(500), nullable=True)
    location = db.Column(db.String(255), nullable=True)  # City, Country (optional geolocation)

    # API Key info (if applicable)
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.id'), nullable=True)

    # Failure details
    failure_reason = db.Column(db.String(255), nullable=True)

    # Status
    success = db.Column(db.Boolean, nullable=False, default=True)

    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = db.relationship('User', back_populates='login_events')
    api_key = db.relationship('ApiKey')

    @classmethod
    def log_event(cls, event_type, auth_method, user_id=None, email_attempted=None,
                  ip_address=None, user_agent=None, success=True, failure_reason=None,
                  api_key_id=None):
        """
        Log a login event
        """
        event = cls(
            user_id=user_id,
            event_type=event_type,
            auth_method=auth_method,
            email_attempted=email_attempted,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason,
            api_key_id=api_key_id
        )

        db.session.add(event)
        return event

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_type': self.event_type,
            'auth_method': self.auth_method,
            'email_attempted': self.email_attempted,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'location': self.location,
            'success': self.success,
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<LoginEvent {self.event_type} - {self.email_attempted or self.user_id}>'
