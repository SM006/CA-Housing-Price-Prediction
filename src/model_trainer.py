import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from lightgbm import LGBMRegressor
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from src.config import RANDOM_STATE, LGBM_PARAMS

class ModelTrainer:
    def __init__(self):
        self.models = {
            'LinearRegression': LinearRegression(),
            'RandomForest': RandomForestRegressor(random_state=RANDOM_STATE),
            'LightGBM': LGBMRegressor(**LGBM_PARAMS)
        }
        self.best_model = None
        self.results = {}

    def train_and_tune(self, X_train, y_train):
        """
        Trains baseline models and performs hyperparameter tuning for LightGBM.
        """
        # Baseline: Linear Regression
        lr = self.models['LinearRegression']
        lr.fit(X_train, y_train)
        
        # Baseline: Random Forest
        rf = self.models['RandomForest']
        rf.fit(X_train, y_train)

        # Baseline: LightGBM (Default)
        lgbm_base = self.models['LightGBM']
        lgbm_base.fit(X_train, y_train)

        # LightGBM Tuning (Primary Model)
        param_grid = {
            'n_estimators': [100, 500],
            'learning_rate': [0.01, 0.1],
            'num_leaves': [31, 50],
            'boosting_type': ['gbdt']
        }
        
        grid_search = GridSearchCV(LGBMRegressor(random_state=42, verbose=-1), param_grid, cv=3, scoring='neg_mean_squared_error', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        
        self.best_model = grid_search.best_estimator_
        self.models['LightGBM_Tuned'] = self.best_model

    def evaluate_all(self, X_test, y_test):
        """
        Evaluates all trained models and returns a comparison table.
        """
        evaluation_metrics = []
        
        for name, model in self.models.items():
            try:
                preds = model.predict(X_test)
                rmse = np.sqrt(mean_squared_error(y_test, preds))
                mae = mean_absolute_error(y_test, preds)
                r2 = r2_score(y_test, preds)
                
                evaluation_metrics.append({
                    'Model': name,
                    'RMSE': round(rmse, 4),
                    'MAE': round(mae, 4),
                    'R2': round(r2, 4)
                })
            except Exception as e:
                print(f"Skipping model {name} as it might not be fitted: {e}")
        
        self.results = pd.DataFrame(evaluation_metrics)
        return self.results

    def save_model(self, model, filename='best_model.joblib'):
        joblib.dump(model, filename)
        print(f"Model saved to {filename}")

def load_saved_model(filename='best_model.joblib'):
    return joblib.load(filename)
