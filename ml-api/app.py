from flask import Flask, request, jsonify
from ml_model import predict_genre_with_scores
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    title = data.get("title", "")
    authors = data.get("authors", "")
    description = data.get("description", "")

    try:
        # Run prediction
        category, probs = predict_genre_with_scores(
            description, title, authors)

        # Ensure probs is a list of numbers
        if not isinstance(probs, list):
            probs = []

        return jsonify({
            "genre": category or "Unknown",
            "scores": probs  # <-- key must match frontend/backend
        })
    except Exception as e:
        print("ML prediction failed:", e)
        # Return fallback values if prediction fails
        return jsonify({
            "genre": "Unknown",
            "scores": []
        })


if __name__ == "__main__":
    app.run(port=5001)
