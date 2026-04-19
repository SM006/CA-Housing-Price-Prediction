from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from ..services.inference import inference_service

router = APIRouter()

class HousingFeatures(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float

    @field_validator('Latitude')
    def validate_latitude(cls, v):
        if not (32.5 <= v <= 42.0):
            raise ValueError('Latitude must be within California (32.5 to 42.0)')
        return v

    @field_validator('Longitude')
    def validate_longitude(cls, v):
        if not (-124.5 <= v <= -114.1):
            raise ValueError('Longitude must be within California (-124.5 to -114.1)')
        return v

@router.post("/predict")
def get_prediction(features: HousingFeatures):
    try:
        result = inference_service.predict(features.dict())
        return result
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal inference error.")

@router.get("/explain")
def get_model_explanation():
    try:
        explanation = inference_service.get_explanations()
        return explanation
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating model explanation.")
