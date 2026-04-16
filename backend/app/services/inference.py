import joblib
import pandas as pd
import os
import logging
import sys
from ..core.config import settings

# --- Module Aliasing (Mandatory for unpickling legacy 'src' references) ---
import pipeline.src.data_processor
sys.modules['src'] = pipeline.src
sys.modules['src.data_processor'] = pipeline.src.data_processor
# --------------------------------------------------------------------------

logger = logging.getLogger(__name__)

class InferenceService:
    def __init__(self):
        self.model = None
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.PIPELINE_PATH):
                self.model = joblib.load(settings.MODEL_PATH)
                self.pipeline = joblib.load(settings.PIPELINE_PATH)
                logger.info("Successfully loaded ML model and pipeline.")
            else:
                logger.warning(f"Model or pipeline not found at {settings.MODEL_PATH}. Prediction service disabled.")
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}")

    def predict(self, features_dict: dict):
        if self.model is None or self.pipeline is None:
            raise ValueError("Model artifacts are not loaded.")
        
        # Convert to DataFrame
        df = pd.DataFrame([features_dict])
        
        # Preprocess
        processed_data = self.pipeline.transform(df)
        
        # Predict
        prediction = self.model.predict(processed_data)[0]
        
        return {
            "prediction_raw": float(prediction),
            "predicted_price": float(prediction * 100000),
            "currency": "USD"
        }

# Singleton instance
inference_service = InferenceService()
