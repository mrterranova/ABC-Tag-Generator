import gradio as gr
from ml_model import predict_genre_with_scores, load_model
import logging

logging.basicConfig(level=logging.INFO)

def predict_gradio(title, authors, description):
    if not description:
        return "Description is required", []

    try:
        load_model() 
        category, probs = predict_genre_with_scores(description, title, authors)
        return category or "Unknown", probs
    except Exception as e:
        logging.error(f"Prediction failed: {e}")
        return "Model not ready", []

iface = gr.Interface(
    fn=predict_gradio,
    inputs=[
        gr.Textbox(label="Title", placeholder="Book title"),
        gr.Textbox(label="Authors", placeholder="Book authors"),
        gr.Textbox(label="Description", placeholder="Book description")
    ],
    outputs=[
        gr.Textbox(label="Predicted Genre"),
        gr.JSON(label="Scores")
    ],
    title="Roberta Book Category Classifier",
    description="Predicts book genre from title, authors, and description."
)

iface.launch(
    server_name="0.0.0.0",
    server_port=7860,
    share=False,
    debug=True
)
