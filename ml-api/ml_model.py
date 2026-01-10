import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import boto3
import tarfile

S3_BUCKET = "my-abc-ml-capstone-model-bucket"
S3_TARBALL_KEY = "model.tar.gz"
LOCAL_MODEL_DIR = "final_model"
LOCAL_TARBALL = "model.tar.gz"

if not os.path.exists(LOCAL_MODEL_DIR):
    print("Downloading model tarball from S3...")
    s3 = boto3.client("s3")
    s3.download_file(S3_BUCKET, S3_TARBALL_KEY, LOCAL_TARBALL)

    print("Extracting tarball...")
    with tarfile.open(LOCAL_TARBALL, "r:gz") as tar:
        tar.extractall(LOCAL_MODEL_DIR)
    print("Model ready!")

tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(LOCAL_MODEL_DIR)
model.eval()

# Load label encoder
le = joblib.load(os.path.join(LOCAL_MODEL_DIR, "label_encoder.pkl"))


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
