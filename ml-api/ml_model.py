import os
import tarfile
import boto3
import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Environment variables from Render
BUCKET = os.environ["S3_BUCKET"]
KEY = os.environ["S3_TARBALL_KEY"]

# Download and extract tarball
if not os.path.exists("model"):
    os.makedirs("model")

s3 = boto3.client("s3")
tar_path = "model/model.tar.gz"
s3.download_file(BUCKET, KEY, tar_path)

with tarfile.open(tar_path, "r:gz") as tar:
    tar.extractall(path="model")

MODEL_PATH = "model/final_model"  # folder inside tarball
LABEL_ENCODER_PATH = "model/label_encoder.pkl"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

# Load label encoder
le = joblib.load(LABEL_ENCODER_PATH)


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
