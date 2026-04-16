import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

# Set page config
st.set_page_config(
    page_title="CA Housing Price Predictor",
    page_icon="🏠",
    layout="centered"
)

# Custom CSS for premium look
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        height: 3em;
        background-color: #4CAF50;
        color: white;
    }
    .prediction-card {
        padding: 20px;
        border-radius: 10px;
        background-color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
    }
    </style>
    """, unsafe_allow_html=True)

@st.cache_resource
def load_models():
    if os.path.exists('models/best_lgbm_model.joblib') and os.path.exists('models/preprocessing_pipeline.joblib'):
        model = joblib.load('models/best_lgbm_model.joblib')
        pipeline = joblib.load('models/preprocessing_pipeline.joblib')
        return model, pipeline
    return None, None

def main():
    st.title("🏠 California Housing Price Predictor")
    st.write("A professional machine learning application using LightGBM.")

    # Load models
    model, pipeline = load_models()

    if model is None:
        st.error("⚠️ Models not found. Please run 'python main.py' first to train and save the models.")
        return

    # User Input Sidebar
    st.sidebar.header("Input Features")
    
    med_inc = st.sidebar.slider("Median Income", 0.5, 15.0, 3.5)
    house_age = st.sidebar.slider("House Age", 1, 52, 28)
    ave_rooms = st.sidebar.slider("Average Rooms", 1.0, 10.0, 5.0)
    ave_bedrms = st.sidebar.slider("Average Bedrooms", 0.5, 5.0, 1.0)
    pop = st.sidebar.number_input("Population", 1, 35000, 1400)
    ave_occup = st.sidebar.slider("Average Occupation", 1.0, 10.0, 3.0)
    lat = st.sidebar.slider("Latitude", 32.5, 42.0, 35.6)
    lon = st.sidebar.slider("Longitude", -124.3, -114.3, -119.5)

    # Prediction Button
    if st.button("Predict House Value"):
        # Prepare input data
        input_data = pd.DataFrame({
            'MedInc': [med_inc],
            'HouseAge': [house_age],
            'AveRooms': [ave_rooms],
            'AveBedrms': [ave_bedrms],
            'Population': [pop],
            'AveOccup': [ave_occup],
            'Latitude': [lat],
            'Longitude': [lon]
        })

        # Preprocess
        processed_data = pipeline.transform(input_data)
        
        # Predict
        prediction = model.predict(processed_data)[0]
        
        # Format prediction (it's in $100,000s)
        final_price = prediction * 100000
        
        # Display Result
        st.markdown("<div class='prediction-card'>", unsafe_allow_html=True)
        st.subheader("Predicted House Value")
        st.header(f"${final_price:,.2f}")
        st.write("Calculated using a tuned LightGBM regressor.")
        st.markdown("</div>", unsafe_allow_html=True)
        
        st.info("Note: Prediction is based on 1990 census data adjusted for model parameters.")

if __name__ == "__main__":
    main()
