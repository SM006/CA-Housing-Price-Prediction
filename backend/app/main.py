from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router as api_router
from .core.config import settings
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Mount Static Files for Evaluation Plots
plots_path = os.path.join(settings.PROJECT_ROOT, "artifacts", "evaluation_plots")
if os.path.exists(plots_path):
    app.mount("/plots", StaticFiles(directory=plots_path), name="plots")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
