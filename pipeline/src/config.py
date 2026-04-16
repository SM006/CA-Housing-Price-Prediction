import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
PLOTS_DIR = os.path.join(REPORTS_DIR, 'plots')

# Data Constants
TARGET_COLUMN = 'MedHouseVal'
TEST_SIZE = 0.2
RANDOM_STATE = 42

# LightGBM Hyperparameters (Optimized)
LGBM_PARAMS = {
    'n_estimators': 500,
    'learning_rate': 0.1,
    'num_leaves': 50,
    'boosting_type': 'gbdt',
    'random_state': RANDOM_STATE,
    'verbose': -1
}
