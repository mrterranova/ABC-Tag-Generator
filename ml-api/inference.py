import torch
import joblib
import json
from transformers import AutoTokenizer, AutoModelForSequenceClassification

DEVICE = torch.device("cpu")


def model_fn(model_dir):
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.to(DEVICE)
    model.eval()

    le = joblib.load(f"{model_dir}/label_encoder.pkl")

    return {
        "model": model,
        "tokenizer": tokenizer,
        "label_encoder": le
    }


def input_fn(request_body, content_type):
    if content_type == "application/json":
        return json.loads(request_body)["inputs"]
    raise ValueError("Unsupported content type")


def predict_fn(text, artifacts):
    tokenizer = artifacts["tokenizer"]
    model = artifacts["model"]
    le = artifacts["label_encoder"]

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256
    ).to(DEVICE)

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1)[0]

    results = [
        {
            "label": le.inverse_transform([i])[0],
            "score": float(probs[i])
        }
        for i in range(len(probs))
    ]

    results.sort(key=lambda x: x["score"], reverse=True)
    return results


def output_fn(prediction, accept):
    return json.dumps(prediction), accept
