from flask import Flask, request, jsonify
from ml_model import predict_genre_with_scores
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    title = data.get("title", "")
    authors = data.get("authors", "")
    description = data.get("description", "")

    # Run prediction
    category, probs = predict_genre_with_scores(description, title, authors)

    return jsonify({
        "genre": category,
        "scores": probs  # list of probabilities per category
    })


if __name__ == "__main__":
    app.run(port=5001)
