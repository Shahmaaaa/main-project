"""
Block-Aid Backend API
Flask application for disaster relief management
"""

import os
import hashlib
from datetime import datetime
from functools import wraps
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import numpy as np
from web3 import Web3
import logging

# Import AI modules
import sys
sys.path.insert(0, '../ai-model')
try:
    from disaster_model import DisasterSeverityModel
    from severity_calculator import SeverityScoreCalculator
    AI_MODEL_AVAILABLE = True
except Exception as e:
    AI_MODEL_AVAILABLE = False
    logging.warning(f"AI model not available: {e}")

load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///block_aid.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Extensions
db = SQLAlchemy(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Web3 setup for blockchain interaction
W3_PROVIDER = os.getenv('WEB3_PROVIDER_URL', 'http://localhost:8545')
w3 = Web3(Web3.HTTPProvider(W3_PROVIDER))
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '')
CONTRACT_ABI = json.loads(os.getenv('CONTRACT_ABI', '[]'))

# Load AI models
try:
    disaster_model = DisasterSeverityModel()
    model_path = os.getenv('MODEL_PATH', 'best_model.h5')
    if os.path.exists(model_path):
        disaster_model.load_model(model_path)
    else:
        logger.warning(f"Model not found at {model_path}")
except Exception as e:
    logger.error(f"Failed to load AI model: {e}")
    disaster_model = None

try:
    severity_calculator = SeverityScoreCalculator()
except Exception as e:
    logger.error(f"Failed to load severity calculator: {e}")
    severity_calculator = None

# ==================== Database Models ====================

class User(db.Model):
    """User model"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='donor')  # donor, official, ngo
    is_authorized = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.username}>'

class DisasterEvent(db.Model):
    """Disaster event model"""
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, unique=True)  # Blockchain event ID
    disaster_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    image_hash = db.Column(db.String(256), unique=True)
    severity_score = db.Column(db.Float, nullable=False)
    severity_level = db.Column(db.String(20), nullable=False)
    ai_predictions = db.Column(db.JSON)
    reported_by = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=False)
    blockchain_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'disaster_type': self.disaster_type,
            'location': self.location,
            'severity_score': self.severity_score,
            'severity_level': self.severity_level,
            'ai_predictions': self.ai_predictions,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class DisasterFund(db.Model):
    """Disaster fund model"""
    id = db.Column(db.Integer, primary_key=True)
    fund_id = db.Column(db.Integer, unique=True)  # Blockchain fund ID
    event_id = db.Column(db.Integer, db.ForeignKey('disaster_event.id'))
    total_amount = db.Column(db.Float, nullable=False)
    distributed_amount = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='PENDING')  # PENDING, APPROVED, DISTRIBUTED
    approved_by = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fund_id': self.fund_id,
            'event_id': self.event_id,
            'total_amount': self.total_amount,
            'distributed_amount': self.distributed_amount,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AuditLog(db.Model):
    """Audit log for all operations"""
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    user = db.Column(db.String(255))
    details = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'user': self.user,
            'timestamp': self.timestamp.isoformat()
        }

# ==================== Authentication ====================

def require_auth(roles=None):
    """Decorator for route authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'Missing authorization header'}), 401
            
            # In production, validate JWT token
            # For now, basic validation
            try:
                token = auth_header.split(' ')[1]
                # TODO: Validate JWT token
            except IndexError:
                return jsonify({'error': 'Invalid authorization header'}), 401
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ==================== Utility Functions ====================

def calculate_image_hash(image_data):
    """Calculate SHA-256 hash of image"""
    return hashlib.sha256(image_data).hexdigest()

def log_action(action, entity_type, entity_id, user, details=None):
    """Log action to audit trail"""
    log_entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        user=user,
        details=details
    )
    db.session.add(log_entry)
    db.session.commit()

# ==================== API Routes ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'blockchain_connected': w3.is_connected() if w3 else False
    })

@app.route('/api/events/create', methods=['POST'])
@require_auth(roles=['official', 'ngo'])
@limiter.limit("10 per hour")
def create_disaster_event():
    """Create a new disaster event"""
    try:
        data = request.form
        image_file = request.files.get('image')
        
        if not image_file:
            return jsonify({'error': 'Image file required'}), 400
        
        # Validate required fields
        required_fields = ['disaster_type', 'location', 'rainfall_mm', 
                          'water_level_cm', 'population_affected', 
                          'infrastructure_damage', 'impact_area']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Calculate image hash
        image_data = image_file.read()
        image_hash = calculate_image_hash(image_data)
        
        # Check for duplicate
        existing = DisasterEvent.query.filter_by(image_hash=image_hash).first()
        if existing:
            return jsonify({'error': 'Duplicate disaster event detected'}), 409
        
        # Get AI prediction
        if disaster_model is None:
            return jsonify({'error': 'AI model not available'}), 503
        
        # Save image temporarily
        image_path = f"/tmp/{image_hash}.jpg"
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        try:
            prediction = disaster_model.predict_severity(image_path)
            ai_predictions = prediction['predictions']
        except Exception as e:
            logger.error(f"AI prediction failed: {e}")
            return jsonify({'error': 'AI prediction failed'}), 500
        
        # Calculate severity score
        try:
            severity_result = severity_calculator.calculate_total_score(
                ai_predictions=ai_predictions,
                rainfall_mm=float(data.get('rainfall_mm', 0)),
                water_level_cm=float(data.get('water_level_cm', 0)),
                population_affected=int(data.get('population_affected', 0)),
                infrastructure_damage=float(data.get('infrastructure_damage', 0)),
                impact_area=float(data.get('impact_area', 0))
            )
        except Exception as e:
            logger.error(f"Severity calculation failed: {e}")
            return jsonify({'error': 'Severity calculation failed'}), 500
        
        # Save to database
        event = DisasterEvent(
            disaster_type=data['disaster_type'],
            location=data['location'],
            image_hash=image_hash,
            severity_score=severity_result['total_score'],
            severity_level=severity_result['severity_level'],
            ai_predictions=ai_predictions,
            reported_by=request.headers.get('X-User-ID', 'unknown')
        )
        
        db.session.add(event)
        db.session.commit()
        
        # Log action
        log_action('CREATE_EVENT', 'DisasterEvent', event.id, 
                  request.headers.get('X-User-ID'), severity_result)
        
        return jsonify({
            'id': event.id,
            'severity_score': severity_result['total_score'],
            'severity_level': severity_result['severity_level'],
            'confidence': severity_result['confidence'],
            'component_scores': severity_result['component_scores']
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating disaster event: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/events/<int:event_id>', methods=['GET'])
@limiter.limit("100 per hour")
def get_event(event_id):
    """Get disaster event details"""
    event = DisasterEvent.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    return jsonify(event.to_dict())

@app.route('/api/events', methods=['GET'])
@limiter.limit("100 per hour")
def list_events():
    """List all disaster events"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    events = DisasterEvent.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'total': events.total,
        'pages': events.pages,
        'current_page': page,
        'events': [event.to_dict() for event in events.items]
    })

@app.route('/api/events/<int:event_id>/verify', methods=['POST'])
@require_auth(roles=['official'])
@limiter.limit("20 per hour")
def verify_event(event_id):
    """Verify a disaster event"""
    try:
        event = DisasterEvent.query.get(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if event.is_verified:
            return jsonify({'error': 'Event already verified'}), 400
        
        event.is_verified = True
        db.session.commit()
        
        log_action('VERIFY_EVENT', 'DisasterEvent', event_id,
                  request.headers.get('X-User-ID'))
        
        return jsonify({'message': 'Event verified successfully', 'event': event.to_dict()})
    except Exception as e:
        logger.error(f"Error verifying event: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/funds/create', methods=['POST'])
@require_auth(roles=['official'])
@limiter.limit("10 per hour")
def create_fund():
    """Create and approve a fund pool"""
    try:
        data = request.get_json()
        
        if not data or 'event_id' not in data or 'amount' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        event = DisasterEvent.query.get(data['event_id'])
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if not event.is_verified:
            return jsonify({'error': 'Event not verified'}), 400
        
        fund = DisasterFund(
            event_id=event.id,
            total_amount=float(data['amount']),
            status='APPROVED',
            approved_by=request.headers.get('X-User-ID', 'unknown')
        )
        
        db.session.add(fund)
        db.session.commit()
        
        log_action('CREATE_FUND', 'DisasterFund', fund.id,
                  request.headers.get('X-User-ID'), {'amount': data['amount']})
        
        return jsonify({'id': fund.id, 'fund': fund.to_dict()}), 201
    except Exception as e:
        logger.error(f"Error creating fund: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/funds/<int:fund_id>', methods=['GET'])
@limiter.limit("100 per hour")
def get_fund(fund_id):
    """Get fund details"""
    fund = DisasterFund.query.get(fund_id)
    if not fund:
        return jsonify({'error': 'Fund not found'}), 404
    return jsonify(fund.to_dict())

@app.route('/api/audit-logs', methods=['GET'])
@require_auth(roles=['official'])
@limiter.limit("50 per hour")
def get_audit_logs():
    """Get audit logs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    logs = AuditLog.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'total': logs.total,
        'logs': [log.to_dict() for log in logs.items]
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ==================== CLI Commands ====================

@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print("Database initialized")

@app.cli.command()
def seed_db():
    """Seed database with sample data"""
    user = User(
        username='admin',
        email='admin@blockaid.local',
        password_hash='hashed_password',
        role='official',
        is_authorized=True
    )
    db.session.add(user)
    db.session.commit()
    print("Database seeded")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
