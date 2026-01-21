from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import uuid
from datetime import datetime

# ML imports
import tensorflow as tf
import numpy as np
import base64
from PIL import Image
from io import BytesIO

# ---------------- APP SETUP ----------------

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blockaid.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------------- LOAD MODEL ----------------

model = tf.keras.models.load_model("floodmodel.keras")
print("✅ Model loaded successfully")

CLASSES = ["Low", "Medium", "High"]  # MUST match training order

# ---------------- IMAGE PREPROCESSING ----------------

def preprocess_image(base64_image):
    image_data = base64.b64decode(base64_image.split(',')[-1])
    image = Image.open(BytesIO(image_data)).convert("RGB")
    image = image.resize((224, 224))  # change if your model uses another size

    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    return img_array

# ---------------- DATABASE MODELS ----------------

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(20))  # User / Admin

class Report(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    type = db.Column(db.String(50))
    state = db.Column(db.String(100))
    district = db.Column(db.String(100))
    area = db.Column(db.String(100))
    date = db.Column(db.String(20))

    affected_population = db.Column(db.Integer)
    infrastructure_damage = db.Column(db.Text)

    flood_days = db.Column(db.Integer)            # ✅ ADD
    flood_start_date = db.Column(db.String(20))   # ✅ ADD

    image_url = db.Column(db.Text)
    severity_ai = db.Column(db.String(20))
    severity_final = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Pending")
    fund_status = db.Column(db.String(20), default="Pending")
    blockchain_hash = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(50))
    user_name = db.Column(db.String(100))


# Create DB tables
with app.app_context():
    db.create_all()

def rule_based_severity(population, flood_days):
    if population >= 1000 or flood_days >= 50:
        return "High"
    elif population >= 300 or flood_days >= 10:
        return "Medium"
    else:
        return "Low"

# ---------------- BASIC TEST ROUTE ----------------

@app.route("/")
def home():
    return jsonify({"status": "Backend + AI running"})

# ---------------- AI ANALYSIS API ----------------

@app.route("/api/ai/analyze", methods=["POST"])
def analyze_image():
    data = request.json

    image = data["image"]
    population = int(data.get("affectedPopulation", 0))
    flood_days = int(data.get("floodDays", 0))

    # 1️⃣ MODEL PREDICTION
    img = preprocess_image(image)
    preds = model.predict(img)[0]
    model_severity = CLASSES[int(np.argmax(preds))]
    confidence = float(np.max(preds))

    # 2️⃣ RULE-BASED SEVERITY
    rule_severity = rule_based_severity(population, flood_days)

    # 3️⃣ FINAL DECISION (take the higher one)
    priority = {"Low": 1, "Medium": 2, "High": 3}

    final_severity = (
        rule_severity
        if priority[rule_severity] > priority[model_severity]
        else model_severity
    )

    return jsonify({
        "severity_model": model_severity,
        "severity_rule": rule_severity,
        "severity_final": final_severity,
        "confidence": round(confidence, 2),
        "reasoning": f"Model: {model_severity}, Rules: {rule_severity}"
    })

# ---------------- AUTH APIs ----------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=data["name"],
        email=data["email"],
        password=data["password"],
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()
    return jsonify({"status": "registered"})

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(
        email=data["email"],
        password=data["password"]
    ).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })

# ---------------- REPORT APIs ----------------
@app.route("/api/reports", methods=["POST"])
def create_report():
    data = request.json

    report = Report(
        id=data["id"],
        type=data["type"],
        state=data["location"]["state"],
        district=data["location"]["district"],
        area=data["location"]["area"],
        date=data["date"],

        affected_population=data["affectedPopulation"],
        infrastructure_damage=data.get("infrastructureDamage", ""),

        flood_days=data["details"].get("floodDays"),            # ✅
        flood_start_date=data["details"].get("floodStartDate"), # ✅

        image_url=data["images"][0],
        severity_ai=data["severityAI"],
        user_id=data["userId"],
        user_name=data["userName"]
    )

    db.session.add(report)
    db.session.commit()
    return jsonify({"status": "report created"})


@app.route("/api/reports", methods=["GET"])
def get_reports():
    reports = Report.query.order_by(Report.timestamp.desc()).all()

    return jsonify([
        {
            "id": r.id,
            "type": r.type,
            "location": {
                "state": r.state,
                "district": r.district,
                "area": r.area
            },
            "date": r.date,
            "affectedPopulation": r.affected_population,
            "infrastructureDamage": r.infrastructure_damage,

            "details": {                              # ✅ ADD
                "floodDays": r.flood_days,
                "floodStartDate": r.flood_start_date
            },

            "images": [r.image_url],
            "severityAI": r.severity_ai,
            "severityFinal": r.severity_final,
            "status": r.status,
            "fundStatus": r.fund_status,
            "blockchainHash": r.blockchain_hash,
            "timestamp": r.timestamp.isoformat(),
            "userId": r.user_id,
            "userName": r.user_name
        }
        for r in reports
    ])


@app.route("/api/reports/<id>", methods=["PUT"])
def update_report(id):
    data = request.json
    report = Report.query.get(id)

    if not report:
        return jsonify({"error": "Report not found"}), 404

    if "severityFinal" in data:
        report.severity_final = data["severityFinal"]
    if "status" in data:
        report.status = data["status"]
    if "fundStatus" in data:
        report.fund_status = data["fundStatus"]
    if "blockchainHash" in data:
        report.blockchain_hash = data["blockchainHash"]

    db.session.commit()
    return jsonify({"status": "updated"})

# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
