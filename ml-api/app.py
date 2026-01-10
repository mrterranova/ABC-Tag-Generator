from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import predict_genre_with_scores
import os

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    title = data.get("title", "")
    authors = data.get("authors", "")
    description = data.get("description", "")

    try:
        category, probs = predict_genre_with_scores(
            description, title, authors)
        return jsonify({
            "genre": category or "Unknown",
            "scores": probs
        })
    except Exception as e:
        print("ML prediction failed:", e)
        return jsonify({
            "genre": "Unknown",
            "scores": []
        })


if __name__ == "__main__":
    # Render uses $PORT automatically
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
