# Use a lightweight Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy all files into container
COPY . .

# Upgrade pip and install all dependencies
RUN pip install --upgrade pip && \
    pip install flask flask-cors torch transformers gradio scikit-learn joblib requests

# Expose the port your Flask app will run on
EXPOSE 7860

# Command to run your Flask app
CMD ["python", "gradio_app.py"]
