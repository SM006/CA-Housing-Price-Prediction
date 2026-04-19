import joblib
import pandas as pd
import numpy as np
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
        
        # Calculate Confidence Score before transform
        confidence = self._calculate_confidence(features_dict)
        
        # Convert to DataFrame
        df = pd.DataFrame([features_dict])
        
        # Preprocess
        processed_data = self.pipeline.transform(df)
        
        # Predict
        prediction = self.model.predict(processed_data)[0]
        
        return {
            "prediction_raw": float(prediction),
            "predicted_price": float(prediction * 100000),
            "confidence_score": float(confidence),
            "currency": "USD"
        }

    def get_explanations(self):
        """
        Retrieves actual feature importance weights from the trained model.
        """
        if self.model is None or self.pipeline is None:
            raise ValueError("Model artifacts are not loaded.")

        # Get feature names from the pipeline steps
        try:
            # We use a dummy transform to get the feature names from the pipeline output
            dummy_df = pd.DataFrame([{
                "MedInc": 3.5, "HouseAge": 28, "AveRooms": 5, 
                "AveBedrms": 1, "Population": 1400, "AveOccup": 3, 
                "Latitude": 35.6, "Longitude": -119.5
            }])
            processed_dummy = self.pipeline.transform(dummy_df)
            feature_names = list(processed_dummy.columns)
            
            # Get importance from the model
            importances = self.model.feature_importances_
            
            # Normalize to 0-1 scale (matching frontend expectations)
            max_imp = float(np.max(importances))
            normalized = [float(val / max_imp) for val in importances]
            
            # Map names to scores
            explanation = []
            colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4']
            
            for i, name in enumerate(feature_names):
                explanation.append({
                    "name": name,
                    "value": normalized[i],
                    "color": colors[i % len(colors)]
                })
            
            # Sort by importance
            explanation.sort(key=lambda x: x['value'], reverse=True)
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating explanations: {e}")
            return []

    def _calculate_confidence(self, features: dict) -> float:
        """
        Calculates a dynamic confidence score (0-100) based on 
        feature proximity to the training distribution (Z-scores).
        """
        # Feature Distribution Stats (Approximate for CA Housing Dataset)
        stats = {
            "MedInc": {"mean": 3.87, "std": 1.89},
            "HouseAge": {"mean": 28.6, "std": 12.5},
            "AveRooms": {"mean": 5.42, "std": 2.47},
            "AveOccup": {"mean": 3.07, "std": 10.3},
        }
        
        z_scores = []
        for feat, val in features.items():
            if feat in stats:
                z = abs(val - stats[feat]["mean"]) / stats[feat]["std"]
                z_scores.append(z)
        
        # Average distance from mean (lower is better)
        avg_z = sum(z_scores) / len(z_scores) if z_scores else 0
        
        # Logic: 
        # Baseline = 0.94 (Initial system confidence for high R2 model)
        # Decay: confidence drops as we move away from typical training data
        import math
        decay_factor = math.exp(-avg_z / 4.0) # Soft decay
        
        final_score = 94.2 * decay_factor
        
        # Clamp between 20 and 98
        return max(20.0, min(98.0, final_score))

# Singleton instance
inference_service = InferenceService()
