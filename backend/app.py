from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
import traceback
import json

# Load environment variables from frontend's .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env.local"))

# ---------------- GEMINI SETUP ----------------
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()
if GEMINI_KEY and GEMINI_KEY != "PLACEHOLDER_API_KEY":
    genai.configure(api_key=GEMINI_KEY)
    print(f"[INFO] Gemini AI Configured (Key: {GEMINI_KEY[:4]}...{GEMINI_KEY[-4:]})")
else:
    print("[WARN] GEMINI_API_KEY NOT FOUND or is Placeholder")


# ML imports
import tensorflow as tf
import numpy as np
import base64
from PIL import Image
from io import BytesIO
from blockchain import approve_on_chain, load_contract

# ---------------- APP SETUP ----------------

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blockaid_v3.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------------- LOAD MODEL ----------------

model = tf.keras.models.load_model("floodmodel.keras")
print("[SUCCESS] Model loaded successfully")

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

    flood_days = db.Column(db.Integer)
    flood_start_date = db.Column(db.String(20))

    images = db.Column(db.Text) # Stored as JSON string
    news_url = db.Column(db.Text)
    video_url = db.Column(db.Text)
    recovery_updates = db.Column(db.Text)
    recipient_wallet = db.Column(db.String(50))

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

    # --- Duplicate Detection ---
    existing = Report.query.filter_by(
        type=data["type"],
        state=data["location"]["state"],
        district=data["location"]["district"],
        area=data["location"]["area"],
        date=data["date"]
    ).first()

    if existing:
        return jsonify({
            "error": "Duplicate detected",
            "details": f"A {data['type']} report already exists for {data['location']['area']} on {data['date']}."
        }), 400

    report = Report(
        id=data["id"],
        type=data["type"],
        state=data["location"]["state"],
        district=data["location"]["district"],
        area=data["location"]["area"],
        date=data["date"],

        affected_population=data["affectedPopulation"],
        infrastructure_damage=data.get("infrastructureDamage", ""),

        flood_days=data["details"].get("floodDays"),
        flood_start_date=data["details"].get("floodStartDate"),

        images=json.dumps(data["images"]),
        news_url=data.get("evidenceUrls", {}).get("news"),
        video_url=data.get("evidenceUrls", {}).get("video"),
        recovery_updates=json.dumps(data.get("recoveryUpdates", [])),
        recipient_wallet=data.get("userWallet", ""),

        severity_ai=data["severityAI"],
        user_id=data["userId"],
        user_name=data["userName"]
    )

    db.session.add(report)
    db.session.commit()

    # --- Blockchain: Record the recipient wallet immediately ---
    if report.recipient_wallet:
        from blockchain import create_on_chain
        create_on_chain(report.id, report.recipient_wallet)
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

            "details": {
                "floodDays": r.flood_days,
                "floodStartDate": r.flood_start_date
            },

            "images": json.loads(r.images) if r.images else [],
            "evidenceUrls": {
                "news": r.news_url,
                "video": r.video_url
            },
            "recoveryUpdates": json.loads(r.recovery_updates) if r.recovery_updates else [],
            "userWallet": r.recipient_wallet,
            
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
        
    # --- Blockchain Integration ---
    if report.status == "Approved" and report.fund_status != "Released":
        print(f"[BLOCKCHAIN] Attempting to record Report {report.id} to Blockchain...")
        
        # 1. Determine Fund Amount
        # Priority: Admin defined in 'data' > Default based on severity
        amount = data.get("amount")
        if amount is None:
            severity_funds = {"Low": 0.1, "Medium": 0.5, "High": 1.0}
            amount = severity_funds.get(report.severity_final, 0.1)
            
        print(f"[BLOCKCHAIN] Releasing {amount} ETH for {report.severity_final} severity disaster.")

        # 2. Ensure contract is loaded
        load_contract()
        
        # 3. Call Smart Contract
        tx_hash = approve_on_chain(report.id, report.severity_final, amount_eth=float(amount))
        
        if tx_hash:
            report.blockchain_hash = tx_hash
            report.fund_status = "Released"
            print(f"[SUCCESS] Recorded on Blockchain: {tx_hash}")
        else:
            print("[WARN] Failed to record on blockchain")

    db.session.commit()
    return jsonify({
        "status": "updated", 
        "blockchainHash": report.blockchain_hash,
        "fundStatus": report.fund_status
    })
    
@app.route("/api/blockchain/config", methods=["GET"])
def get_blockchain_config():
    from blockchain import contract
    if contract:
        return jsonify({
            "address": contract.address,
            "url": "http://127.0.0.1:7545" # Ganache
        })
    return jsonify({"error": "Contract not loaded"}), 404

@app.route("/api/reports/<id>", methods=["DELETE"])
def delete_report(id):
    report = Report.query.get(id)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    db.session.delete(report)
    db.session.commit()
    return jsonify({"status": "deleted"})

@app.route("/api/reports/<id>/verify", methods=["GET"])
def verify_with_gemini(id):
    print(f"[INFO] AI Audit Request for Report ID: {id}")
    report = Report.query.get(id)
    if not report:
        print(f"[ERROR] Report {id} not found in DB")
        return jsonify({"error": "Report not found"}), 404
        
    try:
        # 1. Prep Gemini
        print("[INFO] Initializing Gemini Model...")
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # 2. Extract multiple images
        print("[INFO] Processing Image Evidence (Multiple)...")
        image_list = json.loads(report.images) if report.images else []
        gemini_images = []

        for img_url in image_list[:5]: # Max 5 for better performance
            if img_url.startswith("http"):
                import requests
                img_res = requests.get(img_url)
                img_data = img_res.content
            elif img_url.startswith("data:image"):
                header, encoded = img_url.split(",", 1)
                img_data = base64.b64decode(encoded)
            else:
                img_data = base64.b64decode(img_url)
            
            gemini_images.append(Image.open(BytesIO(img_data)).convert("RGB"))
        
        # 3. Prompt Gemini
        extra_evidence = f"\n- Additional News: {report.news_url}" if report.news_url else ""
        extra_evidence += f"\n- Video Evidence: {report.video_url}" if report.video_url else ""

        prompt = f"""
        Act as a professional disaster relief inspector. Analyze these multiple images and compare them with the reported data:
        - Reported Disaster: {report.type}
        - Reported Location: {report.area}, {report.district}, {report.state}
        - Affected People: {report.affected_population}
        - AI initial Severity Score: {report.severity_ai}{extra_evidence}

        Tasks:
        1. Consolidate evidence from all images to verify if this is a genuine {report.type}.
        2. ANTI-FRAUD ANALYSIS: Check for stock images, manipulated photos, or clear mismatches between visual terrain and reported location ({report.area}).
        3. cross-reference with provided news/video links if mentioned ({extra_evidence}).
        4. Rate the visual severity (Low, Medium, or High).

        Return ONLY a JSON object in this format:
        {{
            "verified": true/false,
            "reasoning": "Explain your finding, focusing on both event validity and fraud analysis.",
            "visualSeverity": "Low/Medium/High",
            "fraudRisk": "Low/Medium/High",
            "confidence": 0-100
        }}
        """
        
        response = model.generate_content([prompt] + gemini_images)
        text = response.text.strip()
        
        # Cleanup JSON formatting if Gemini adds markdown blocks
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        return jsonify(json.loads(text))
        
    except Exception as e:
        print(f"[ERROR] Gemini Verification Error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "error": "AI Verification failed",
            "details": str(e)
        }), 500

# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
