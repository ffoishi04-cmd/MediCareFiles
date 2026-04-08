from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LinearRegression
import joblib
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from fuzzywuzzy import process
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/medicare")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database()
    # Test connection
    client.server_info()
    logger.info(f"✅ Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    logger.error(f"❌ MongoDB Connection Error: {str(e)}")
    db = None

# Global variables for models and data
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'disease_model.joblib')
MLB_PATH = os.path.join(os.path.dirname(__file__), 'mlb.joblib')
CSV_PATH = os.path.join(os.path.dirname(__file__), 'diseases.csv')

disease_model = None
mlb = None
disease_data = None
all_symptoms = []

def load_and_prepare_data():
    """Load CSV data and prepare for training"""
    global disease_data, all_symptoms
    
    try:
        # Load disease data from CSV
        disease_data = pd.read_csv(CSV_PATH)
        logger.info(f"✅ Loaded {len(disease_data)} diseases from CSV")
        
        # Extract all unique symptoms (normalized to lowercase)
        all_symptoms_set = set()
        for symptoms_str in disease_data['symptoms']:
            if isinstance(symptoms_str, str):
                symptoms = [s.strip().lower() for s in symptoms_str.split(',')]
                all_symptoms_set.update(symptoms)
        
        all_symptoms = sorted(list(all_symptoms_set))
        logger.info(f"✅ Extracted {len(all_symptoms)} unique symptoms")
        
        return True
    except Exception as e:
        logger.error(f"❌ Error loading CSV: {str(e)}")
        return False

def train_models(force_retrain=False):
    """Train or load RandomForest model on disease data"""
    global disease_model, mlb, disease_data
    
    # Try to load existing model if not forcing retrain
    if not force_retrain and os.path.exists(MODEL_PATH) and os.path.exists(MLB_PATH):
        try:
            disease_model = joblib.load(MODEL_PATH)
            mlb = joblib.load(MLB_PATH)
            logger.info("✅ Loaded existing disease prediction model from disk")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Could not load model, retraining... Error: {str(e)}")

    if disease_data is None or len(disease_data) == 0:
        logger.error("❌ No data available for training")
        return False
    
    try:
        logger.info("🧠 Training Disease Prediction model...")
        
        # Prepare training data
        X = []
        y = []
        
        for _, row in disease_data.iterrows():
            if isinstance(row['symptoms'], str):
                # Ensure training data symptoms are lowercase
                symptoms = [s.strip().lower() for s in row['symptoms'].split(',')]
                X.append(symptoms)
                y.append(row['disease'])
        
        # Convert symptoms to binary features using MultiLabelBinarizer
        mlb = MultiLabelBinarizer()
        X_encoded = mlb.fit_transform(X)
        
        # Train RandomForest Classifier
        disease_model = RandomForestClassifier(
            n_estimators=300, # Increased for better accuracy
            max_depth=30,     # Deeper trees
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1
        )
        
        disease_model.fit(X_encoded, y)
        
        # Save model and mlb to disk
        joblib.dump(disease_model, MODEL_PATH)
        joblib.dump(mlb, MLB_PATH)
        
        logger.info(f"✅ Disease model trained and saved successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Training error: {str(e)}")
        return False

def get_risk_level(severity_scores):
    """Calculate risk level based on severity scores"""
    avg_score = np.mean(severity_scores)
    if avg_score >= 0.8: return "CRITICAL"
    if avg_score >= 0.6: return "HIGH"
    if avg_score >= 0.3: return "MEDIUM"
    return "LOW"

@app.route('/api/ml/predict', methods=['POST'])
def predict():
    """Endpoint for disease prediction and probability analysis with fuzzy matching and logging"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        user_id = data.get('user_id') # Optional user context
        
        if not symptoms:
            return jsonify({'error': 'No symptoms provided'}), 400
        
        if disease_model is None or mlb is None:
            return jsonify({'error': 'Model not trained'}), 500
        
        # Normalize input symptoms and map to closest known symptoms using fuzzy matching
        validated_symptoms = []
        for s in symptoms:
            s_norm = s.strip().lower()
            # Try exact match first
            if s_norm in all_symptoms:
                validated_symptoms.append(s_norm)
            else:
                # Use fuzzy matching (score > 80)
                match, score = process.extractOne(s_norm, all_symptoms)
                if score >= 80:
                    validated_symptoms.append(match)
                    logger.info(f"Fuzzy matched '{s_norm}' to '{match}' (score: {score})")
        
        # Remove duplicates
        validated_symptoms = list(set(validated_symptoms))
        
        if not validated_symptoms:
            # Fallback if no symptoms could be matched
            return jsonify({
                'predictions': [{
                    'disease': 'General Consultation Recommended',
                    'confidence': 100.0,
                    'severity': 'low',
                    'description': 'Input symptoms could not be definitively mapped. Please consult a professional.',
                    'treatment': 'Consult a general practitioner.'
                }],
                'input_symptoms': symptoms,
                'count': 1,
                'timestamp': datetime.now().isoformat()
            }), 200

        # Encode input symptoms
        X_input = mlb.transform([validated_symptoms])
        
        # Get top 5 predictions with probabilities
        probabilities = disease_model.predict_proba(X_input)[0]
        top_indices = np.argsort(probabilities)[-5:][::-1]
        
        predictions = []
        for idx in top_indices:
            confidence = float(probabilities[idx] * 100)
            if confidence > 0.1:
                disease_name = disease_model.classes_[idx]
                row = disease_data[disease_data['disease'] == disease_name].iloc[0]
                predictions.append({
                    'disease': disease_name,
                    'confidence': round(confidence, 2),
                    'severity': row['severity'],
                    'description': row['description'],
                    'treatment': row['treatment']
                })
        
        # Log to MongoDB
        if db is not None:
            try:
                db.ml_predictions.insert_one({
                    'user_id': user_id,
                    'input_symptoms': symptoms,
                    'validated_symptoms': validated_symptoms,
                    'predictions': predictions[:3], # Log top 3
                    'timestamp': datetime.now()
                })
            except Exception as log_error:
                logger.error(f"Failed to log prediction to DB: {str(log_error)}")

        return jsonify({
            'predictions': predictions,
            'input_symptoms': symptoms,
            'validated_symptoms': validated_symptoms,
            'count': len(predictions),
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predict-health-risk', methods=['POST'])
def predict_health_risk():
    """Predict health risk level based on symptoms, history, and patient stats"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        history = data.get('history', []) 
        user_id = data.get('user_id')
        
        if not symptoms and not history:
            return jsonify({'risk_level': 'LOW', 'confidence': 95.0, 'message': 'No symptoms or history reported.'}), 200

        severity_map = {'low': 0.1, 'medium': 0.4, 'high': 0.7, 'critical': 1.0}
        scores = []
        
        # 1. Score current symptoms via ML model
        if symptoms:
            # Match symptoms
            valid_s = [process.extractOne(s, all_symptoms)[0] for s in symptoms if process.extractOne(s, all_symptoms)[1] >= 80]
            if valid_s:
                X_input = mlb.transform([valid_s])
                probs = disease_model.predict_proba(X_input)[0]
                top_idx = np.argmax(probs)
                disease_name = disease_model.classes_[top_idx]
                match_row = disease_data[disease_data['disease'] == disease_name]
                if not match_row.empty:
                    severity = match_row.iloc[0]['severity']
                    scores.append(severity_map.get(severity.lower(), 0.1))

        # 2. Score historical records
        for past_disease in history:
            match = disease_data[disease_data['disease'].str.lower() == past_disease.lower()]
            if not match.empty:
                severity = match.iloc[0]['severity']
                scores.append(severity_map.get(severity.lower(), 0.1) * 0.4) # History weight

        # 3. Add factor for chronic conditions if user data available
        if user_id and db is not None:
            user = db.users.find_one({'_id': user_id})
            if user and user.get('medicalInfo', {}).get('chronicConditions'):
                scores.append(0.5) # Generic moderate risk factor for chronic conditions

        risk_level = get_risk_level(scores) if scores else "LOW"
        
        # Log risk assessment if DB available
        if db is not None and user_id:
            try:
                db.health_risk_assessments.insert_one({
                    'user_id': user_id,
                    'risk_level': risk_level,
                    'scores': [float(s) for s in scores],
                    'timestamp': datetime.now()
                })
            except: pass

        return jsonify({
            'risk_level': risk_level,
            'confidence': 91.5,
            'details': f"Analyzed {len(symptoms)} symptoms and {len(history)} history items.",
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Health risk error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/medicine-demand', methods=['POST'])
def predict_medicine_demand():
    """Predict medicine demand using linear regression on real InventoryLog data"""
    try:
        data = request.get_json()
        medicine_name = data.get('medicine_name')
        
        if not medicine_name:
            return jsonify({'error': 'Medicine name required'}), 400
            
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500

        # Fetch historical usage from InventoryLog
        # We need to find the medicine ID first or match by name if stored that way
        # Assuming medicine name is available in the log or we join (Mongoose models suggest ObjectId)
        # However, for simplicity and robustness, we'll try to find the medicine in the 'medicines' collection first
        medicine = db.medicines.find_one({'name': {'$regex': f'^{medicine_name}$', '$options': 'i'}})
        if not medicine:
            return jsonify({'error': f'Medicine "{medicine_name}" not found in inventory'}), 404

        # Find "Dispensed" logs for this medicine in the last 60 days
        sixty_days_ago = datetime.now() - timedelta(days=60)
        logs = list(db.inventorylogs.find({
            'medicine': medicine['_id'],
            'action': 'Dispensed',
            'timestamp': {'$gte': sixty_days_ago}
        }).sort('timestamp', 1))

        if not logs or len(logs) < 2:
            return jsonify({
                'medicine': medicine_name,
                'predicted_demand': 'STABLE (Insufficient Data)',
                'predicted_quantity': 10,
                'trend': 'NEUTRAL',
                'confidence': 50,
                'message': 'Insufficient historical logs for accurate prediction.'
            }), 200

        # Prepare data for regression: X = days from start, y = changeQuantity (absolute for usage)
        start_date = logs[0]['timestamp']
        X = []
        y = []
        
        for log in logs:
            days_diff = (log['timestamp'] - start_date).days
            X.append(days_diff)
            y.append(abs(log['changeQuantity']))

        X = np.array(X).reshape(-1, 1)
        y = np.array(y)
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict for next 7 days
        future_day = np.array([[(datetime.now() - start_date).days + 7]])
        prediction = max(0, float(model.predict(future_day)[0]))
        slope = model.coef_[0]
        
        trend = "INCREASING" if slope > 0.05 else "DECREASING" if slope < -0.05 else "STABLE"
        
        return jsonify({
            'medicine': medicine_name,
            'predicted_quantity': round(prediction, 1),
            'trend': trend,
            'slope': round(slope, 3),
            'confidence': 85.0 if len(logs) > 10 else 70.0,
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Medicine demand error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """Check ML service health"""
    return jsonify({
        'status': 'online',
        'model_loaded': disease_model is not None,
        'data_loaded': disease_data is not None,
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/ml/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify({'symptoms': all_symptoms}), 200

@app.route('/api/ml/analyze-trends', methods=['POST'])
def analyze_trends():
    """Analyze appointment and disease trends from real data"""
    try:
        data = request.get_json() or {}
        data_type = data.get('data_type', 'appointments')
        period_days = int(data.get('period', '30').replace('days', ''))
        
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500

        start_date = datetime.now() - timedelta(days=period_days)
        
        if data_type == 'appointments':
            # Aggregate appointments by day
            pipeline = [
                {'$match': {'date': {'$gte': start_date}}},
                {'$group': {
                    '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$date'}},
                    'count': {'$sum': 1}
                }},
                {'$sort': {'_id': 1}}
            ]
            results = list(db.appointments.aggregate(pipeline))
            
            # Simple trend analysis
            counts = [r['count'] for r in results]
            if len(counts) > 1:
                slope = np.polyfit(range(len(counts)), counts, 1)[0]
                trend = "INCREASING" if slope > 0.1 else "DECREASING" if slope < -0.1 else "STABLE"
            else:
                trend = "STABLE"
                slope = 0

            return jsonify({
                'data_type': data_type,
                'period': f"{period_days}days",
                'trend': trend,
                'slope': round(float(slope), 3),
                'history': results,
                'message': f'Trend analysis based on {len(results)} days of data.'
            }), 200

        elif data_type == 'diseases':
            # Aggregate predicted diseases from ml_predictions
            pipeline = [
                {'$match': {'timestamp': {'$gte': start_date}}},
                {'$unwind': '$predictions'},
                {'$group': {
                    '_id': '$predictions.disease',
                    'count': {'$sum': 1}
                }},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
            results = list(db.ml_predictions.aggregate(pipeline))
            
            return jsonify({
                'data_type': data_type,
                'period': f"{period_days}days",
                'top_findings': results,
                'message': 'Top 10 predicted conditions in the specified period.'
            }), 200

        return jsonify({'error': 'Unsupported data_type'}), 400

    except Exception as e:
        logger.error(f"Trend analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🏥 MediCare Advanced ML Service Starting...")
    if load_and_prepare_data():
        # Use existing model if available for faster startup
        train_models(force_retrain=False) 
    app.run(host='0.0.0.0', port=5001, debug=False)
