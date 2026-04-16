import pandas as pd
import numpy as np
import os
import joblib
import logging

# Module Imports (assuming pipeline folder is in system path)
import sys
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from .src.data_processor import load_and_preprocess_data, get_preprocessing_pipeline
from .src.model_trainer import ModelTrainer
from .src.visualizer import (
    style_plots, plot_correlation_heatmap, plot_distributions,
    plot_residuals, plot_actual_vs_predicted, plot_feature_importance
)
from .src.config import TARGET_COLUMN

# Global Paths
ARTIFACTS_DIR = os.path.join(project_root, "artifacts")
MODELS_DIR = os.path.join(ARTIFACTS_DIR, "model_binaries")
PLOTS_DIR = os.path.join(ARTIFACTS_DIR, "evaluation_plots")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_training_pipeline():
    logger.info("🚀 Starting Production ML Pipeline (Training Environment)...")
    
    # Ensure directories exist
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(PLOTS_DIR, exist_ok=True)
    
    # 1. Load & Preprocess
    logger.info("📥 Ingesting and cleaning raw census data...")
    X_train, X_test, y_train, y_test, feature_names = load_and_preprocess_data()
    
    df_full = X_train.copy()
    df_full[TARGET_COLUMN] = y_train
    
    # 2. Visualization & EDA
    style_plots()
    logger.info("📊 Generating and saving model evaluation artifacts...")
    plot_correlation_heatmap(df_full, save_path=os.path.join(PLOTS_DIR, 'correlation_heatmap.png'))
    plot_distributions(df_full, list(feature_names) + [TARGET_COLUMN], save_path=os.path.join(PLOTS_DIR, 'feature_distributions.png'))
    
    # 3. Training & Tuning
    logger.info("🏋️ Running hyperparameter search and model training...")
    prep_pipeline = get_preprocessing_pipeline()
    X_train_processed = prep_pipeline.fit_transform(X_train)
    X_test_processed = prep_pipeline.transform(X_test)
    
    trainer = ModelTrainer()
    trainer.train_and_tune(X_train_processed, y_train)
    
    # 4. Final Analysis & Metric Capture
    best_model = trainer.models['LightGBM_Tuned']
    results = trainer.evaluate_all(X_test_processed, y_test)
    logger.info(f"\nModel Performance Benchmark:\n{results}")
    
    y_pred = best_model.predict(X_test_processed)
    plot_actual_vs_predicted(y_test, y_pred, "Tuned LightGBM", save_path=os.path.join(PLOTS_DIR, 'actual_vs_predicted.png'))
    plot_residuals(y_test, y_pred, "Tuned LightGBM", save_path=os.path.join(PLOTS_DIR, 'residuals.png'))
    plot_feature_importance(best_model, list(X_train_processed.columns), save_path=os.path.join(PLOTS_DIR, 'feature_importance.png'))
    
    # 5. Model Serialization
    logger.info("💾 Serializing model artifacts to storage...")
    joblib.dump(best_model, os.path.join(MODELS_DIR, 'best_lgbm_model.joblib'))
    joblib.dump(prep_pipeline, os.path.join(MODELS_DIR, 'preprocessing_pipeline.joblib'))
    
    logger.info(f"✅ Training Pipeline Completed. Artifacts stored in: {ARTIFACTS_DIR}")

if __name__ == "__main__":
    run_training_pipeline()
