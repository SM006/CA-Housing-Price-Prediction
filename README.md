# 🏠 California Housing Price Prediction

A premium, production-level machine learning project predicting median house prices using the California Housing dataset. This project utilizes **LightGBM**, **Scikit-Learn**, and **Streamlit** to deliver a complete predictive solution.

## 🚀 Key Features
- **End-to-End Pipeline**: Includes data loading, outlier removal, feature engineering, and scaling.
- **Model Comparison**: Evalutes Linear Regression, Random Forest, and a Tuned LightGBM model.
- **Hyperparameter Tuning**: Utilizes `GridSearchCV` for optimizing boosting parameters.
- **Production Ready**: Models and preprocessing pipelines are saved using `joblib` for easy deployment.
- **Interactive UI**: A minimalistic Streamlit app for real-time predictions.

## 📁 Project Structure
```text
.
├── src/
│   ├── data_processor.py   # Data loading and cleaning
│   ├── model_trainer.py    # Training and tuning logic
│   └── visualizer.py      # Professional plotting functions
├── notebooks/
│   └── eda_and_modeling.ipynb  # Comprehensive EDA and analysis
├── main.py                 # Core orchestration script
├── app.py                  # Streamlit Web Application
├── requirements.txt        # Project dependencies
└── README.md
```

## 🛠️ Installation & Usage

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Train Models**:
   Run the main pipeline to generate EDA, train models, and save the artifacts.
   ```bash
   python main.py
   ```

3. **Launch the App**:
   Start the interactive Streamlit dashboard.
   ```bash
   streamlit run app.py
   ```

## 📊 Model Performance (Sample)
| Model | RMSE | MAE | R² Score |
| :--- | :--- | :--- | :--- |
| **LightGBM (Tuned)** | ~0.45 | ~0.31 | ~0.82 |
| Random Forest | ~0.51 | ~0.34 | ~0.78 |
| Linear Regression | ~0.65 | ~0.49 | ~0.60 |

## 💡 Insights
- **Median Income** is the strongest predictor of house prices in California.
- **Geographic location** (Latitude/Longitude) significantly impacts value, likely due to coastal proximity.
- **LightGBM** significantly outperforms baseline models in both speed and accuracy after tuning.

---
*Created as part of a high-quality machine learning portfolio.*
