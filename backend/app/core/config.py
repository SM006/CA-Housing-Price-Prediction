import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CA Housing Intelligence API"
    PROJECT_VERSION: str = "2.0.0"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    PROJECT_ROOT: str = os.path.dirname(BASE_DIR)
    ARTIFACTS_DIR: str = os.path.join(PROJECT_ROOT, "artifacts")
    MODEL_PATH: str = os.path.join(ARTIFACTS_DIR, "model_binaries", "best_lgbm_model.joblib")
    PIPELINE_PATH: str = os.path.join(ARTIFACTS_DIR, "model_binaries", "preprocessing_pipeline.joblib")

    # API Security
    API_V1_STR: str = "/api/v1"
    
    class Config:
        case_sensitive = True

settings = Settings()
