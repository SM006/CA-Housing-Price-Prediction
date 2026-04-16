import os
import sys

# Add project root to path for imports to work
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from fastapi.middleware.cors import CORSMiddleware
from src.config import MODELS_DIR

app = FastAPI(title="CA Housing Price Predictor API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and pipeline
MODEL_PATH = os.path.join(MODELS_DIR, "best_lgbm_model.joblib")
PIPELINE_PATH = os.path.join(MODELS_DIR, "preprocessing_pipeline.joblib")

if os.path.exists(MODEL_PATH) and os.path.exists(PIPELINE_PATH):
    model = joblib.load(MODEL_PATH)
    pipeline = joblib.load(PIPELINE_PATH)
else:
    model = None
    pipeline = None

class HousingFeatures(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float

    @validator('Latitude')
    def validate_latitude(cls, v):
        if not (32.5 <= v <= 42.0):
            raise ValueError('Latitude must be within California (32.5 to 42.0)')
        return v

    @validator('Longitude')
    def validate_longitude(cls, v):
        if not (-124.5 <= v <= -114.1):
            raise ValueError('Longitude must be within California (-124.5 to -114.1)')
        return v

@app.get("/")
def read_root():
    return {"message": "California Housing Prediction API is running"}

@app.post("/predict")
def predict(features: HousingFeatures):
    if model is None or pipeline is None:
        raise HTTPException(status_code=500, detail="Models not loaded. Train the model first.")
    
    # Create DataFrame
    df = pd.DataFrame([features.dict()])
    
    # Preprocess
    processed_data = pipeline.transform(df)
    
    # Predict
    prediction = model.predict(processed_data)[0]
    
    # Return formatted result
    return {
        "prediction_raw": float(prediction),
        "predicted_price": float(prediction * 100000),
        "currency": "USD"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
