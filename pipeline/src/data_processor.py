import pandas as pd
import numpy as np
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin
from .config import TARGET_COLUMN, TEST_SIZE, RANDOM_STATE

class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom transformer for California Housing dataset feature engineering.
    """
    def __init__(self, add_rooms_per_household=True):
        self.add_rooms_per_household = add_rooms_per_household

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        if self.add_rooms_per_household:
            X['Rooms_per_HH'] = X['AveRooms'] / X['AveOccup']
            X['Bedrooms_per_Room'] = X['AveBedrms'] / X['AveRooms']
        return X

    def get_feature_names_out(self, input_features=None):
        if self.add_rooms_per_household:
            return np.concatenate([input_features, ['Rooms_per_HH', 'Bedrooms_per_Room']])
        return input_features

def load_and_preprocess_data():
    """
    Loads California housing data, performs basic cleaning and splitting.
    """
    # Load dataset
    housing = fetch_california_housing()
    df = pd.DataFrame(housing.data, columns=housing.feature_names)
    df['MedHouseVal'] = housing.target

    # Check for missing values
    if df.isnull().values.any():
        df = df.dropna()

    # Outlier handling using IQR for the target variable primarily
    Q1 = df[TARGET_COLUMN].quantile(0.25)
    Q3 = df[TARGET_COLUMN].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    df_clean = df[(df[TARGET_COLUMN] >= lower_bound) & (df[TARGET_COLUMN] <= upper_bound)]

    # Split features and target
    X = df_clean.drop(TARGET_COLUMN, axis=1)
    y = df_clean[TARGET_COLUMN]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE)

    return X_train, X_test, y_train, y_test, housing.feature_names

def get_preprocessing_pipeline():
    """
    Returns a production-ready sklearn pipeline for preprocessing.
    """
    pipeline = Pipeline([
        ('feature_engineering', FeatureEngineer()),
        ('scaler', StandardScaler())
    ])
    # Ensure the pipeline output is a DataFrame to maintain feature names
    pipeline.set_output(transform="pandas")
    return pipeline
