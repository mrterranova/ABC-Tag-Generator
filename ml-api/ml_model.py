import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

model_path = "./final_model"

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

le = joblib.load("label_encoder.pkl")


def predict_genre_with_scores(description, title="", authors=""):
    text = f"{title} by {authors}: {description}".strip()
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256
    )
    with torch.no_grad():
        logits = model(**inputs).logits
        # convert to list of probabilities
        probs = torch.softmax(logits, dim=1).tolist()[0]
        pred_id = int(torch.argmax(logits, dim=1))
    category = le.inverse_transform([pred_id])[0]
    return category, probs


def predict_genre(description, title="", authors=""):
    category, _ = predict_genre_with_scores(description, title, authors)
    return category
