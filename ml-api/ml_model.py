import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

LOCAL_MODEL_PATH = "./final_model"

print(f"Loading model from local path: {LOCAL_MODEL_PATH}")
tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(LOCAL_MODEL_PATH)
model.eval()

# Load label encoder
le = joblib.load(os.path.join(LOCAL_MODEL_PATH, "label_encoder.pkl"))


def predict_genre_with_scores(description, title="", authors=""):
    text = f"{title} by {authors}: {description}".strip()

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256
    )

    device = torch.device("cpu")
    model.to(device)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1).tolist()[0]
        pred_id = int(torch.argmax(logits, dim=1))
        category = le.inverse_transform([pred_id])[0]

    return category, probs
