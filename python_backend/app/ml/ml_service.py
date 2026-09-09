import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier
import os
import joblib


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class PricePredictor:
    def __init__(self):
        self.model_path = os.path.join(MODEL_DIR, "price_model.pkl")
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.model = self._train_dummy()

    def _train_dummy(self):
        X = np.array([
            [100, 1, 0], [200, 2, 1], [150, 1, 0], [300, 3, 1],
            [120, 1, 0], [250, 2, 1], [180, 1, 0], [350, 3, 1],
            [90, 1, 0], [280, 2, 1], [160, 1, 0], [320, 3, 1],
        ])
        y = np.array([40, 80, 55, 120, 45, 95, 65, 140, 35, 110, 58, 130])
        model = LinearRegression()
        model.fit(X, y)
        joblib.dump(model, self.model_path)
        return model

    def predict(self, quantity: float, category_encoded: int, season: int) -> float:
        features = np.array([[quantity, category_encoded, season]])
        prediction = self.model.predict(features)[0]
        return round(max(prediction, 1), 2)


class CropRecommender:
    def __init__(self):
        self.model_path = os.path.join(MODEL_DIR, "crop_model.pkl")
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.model = self._train_dummy()

    def _train_dummy(self):
        X = np.array([
            [7.0, 200, 80, 25], [6.5, 150, 70, 22], [7.2, 250, 85, 28],
            [6.0, 100, 60, 20], [7.5, 300, 90, 30], [6.8, 180, 75, 24],
            [5.5, 120, 55, 18], [7.0, 220, 82, 26], [6.2, 140, 65, 21],
        ])
        y = [0, 1, 2, 3, 2, 0, 4, 1, 3]
        model = DecisionTreeClassifier(random_state=42)
        model.fit(X, y)
        joblib.dump(model, self.model_path)
        return model

    def recommend(self, soil_ph: float, rainfall: float, humidity: float, temperature: float) -> str:
        crops = {0: "Rice", 1: "Wheat", 2: "Cotton", 3: "Sugarcane", 4: "Maize"}
        features = np.array([[soil_ph, rainfall, humidity, temperature]])
        prediction = self.model.predict(features)[0]
        return crops.get(prediction, "Unknown")


price_predictor = PricePredictor()
crop_recommender = CropRecommender()
