# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy everything into container
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install torch transformers flask flask-cors joblib

# Expose port
EXPOSE 7860

# Run your Flask API
CMD ["python", "app.py"]
