import pandas as pd
import numpy as np
import os
import joblib

# Internal Imports
from src.data_processor import load_and_preprocess_data, get_preprocessing_pipeline
from src.model_trainer import ModelTrainer
from src.visualizer import (
    style_plots, plot_correlation_heatmap, plot_distributions,
    plot_residuals, plot_actual_vs_predicted, plot_feature_importance
)
from src.config import MODELS_DIR, PLOTS_DIR, TARGET_COLUMN

def run_pipeline():
    print("🚀 Starting Professional ML Pipeline...")
    
    # Ensure directories exist
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(PLOTS_DIR, exist_ok=True)
    
    # 1. Load & Preprocess
    print("📥 Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, feature_names = load_and_preprocess_data()
    
    # Create full dataset for EDA
    df_full = X_train.copy()
    df_full[TARGET_COLUMN] = y_train
    
    # 2. EDA & Visualization
    style_plots()
    print("📊 Generating professional visualizations...")
    plot_correlation_heatmap(df_full, save_path=os.path.join(PLOTS_DIR, 'correlation_heatmap.png'))
    plot_distributions(df_full, list(feature_names) + [TARGET_COLUMN], save_path=os.path.join(PLOTS_DIR, 'feature_distributions.png'))
    
    # 3. Pipeline Execution
    print("⚙️ Executing preprocessing pipeline...")
    prep_pipeline = get_preprocessing_pipeline()
    X_train_processed = prep_pipeline.fit_transform(X_train)
    X_test_processed = prep_pipeline.transform(X_test)
    
    # 4. Training
    print("🏋️ Training models...")
    trainer = ModelTrainer()
    trainer.train_and_tune(X_train_processed, y_train)
    
    # 5. Evaluation
    print("📈 Evaluating model performance...")
    results = trainer.evaluate_all(X_test_processed, y_test)
    print("\nModel Benchmark Comparison:")
    print(results)
    
    # 6. Deep Analysis of Best Model (Tuned LGBM)
    best_model = trainer.models['LightGBM_Tuned']
    y_pred = best_model.predict(X_test_processed)
    
    plot_actual_vs_predicted(y_test, y_pred, "Tuned LightGBM", save_path=os.path.join(PLOTS_DIR, 'actual_vs_predicted.png'))
    plot_residuals(y_test, y_pred, "Tuned LightGBM", save_path=os.path.join(PLOTS_DIR, 'residuals.png'))
    plot_feature_importance(best_model, list(X_train_processed.columns), save_path=os.path.join(PLOTS_DIR, 'feature_importance.png'))
    
    # 7. Persistence
    print("💾 Finalizing model persistence...")
    joblib.dump(best_model, os.path.join(MODELS_DIR, 'best_lgbm_model.joblib'))
    joblib.dump(prep_pipeline, os.path.join(MODELS_DIR, 'preprocessing_pipeline.joblib'))
    
    print("\n✅ Pipeline complete! Assets saved successfully.")
    return results

if __name__ == "__main__":
    run_pipeline()
