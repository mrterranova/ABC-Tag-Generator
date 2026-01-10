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

    if not description:
        return jsonify({"genre": "Unknown", "scores": []})

    try:
        category, probs = predict_genre_with_scores(
            description, title, authors)
        return jsonify({
            "genre": category or "Unknown",
            "scores": probs
        })
    except Exception as e:
        print("ML prediction failed:", e)
        return jsonify({"genre": "Unknown", "scores": []})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
