import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import logging

MODEL_ID = "MTerranova/roberta-book-genre"

tokenizer = None
model = None
le = None

logging.basicConfig(level=logging.INFO)

def load_model():
    global tokenizer, model, le
    if tokenizer is None or model is None or le is None:
        logging.info("Loading model and tokenizer...")
        try:
            tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)
            model.eval()
            le = joblib.load("label_encoder.pkl")
            logging.info("Model loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load model: {e}")
            raise e

def predict_genre_with_scores(description, title="", authors=""):
    if tokenizer is None or model is None or le is None:
        load_model()

    device = torch.device("cpu")
    model.to(device)

    text = f"{title} by {authors}: {description}".strip()
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1).tolist()[0]
        pred_id = int(torch.argmax(logits, dim=1))
        try:
            category = le.inverse_transform([pred_id])[0]
        except ValueError:
            category = "Unknown"

    return category, probs
