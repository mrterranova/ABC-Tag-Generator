# Automated-Book- Categorization-Tag-Generator
Capstone Project - Machine Learning/AI Bootcamp

# 📚 Book Dataset Cleaning Pipeline

## Overview
This project focuses on cleaning and preprocessing book datasets from multiple sources (Google Books API and Kaggle datasets). The goal is to produce a unified, high-quality dataset suitable for NLP tasks like **tag generation** and **category prediction**.

-------

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone & Install](#clone--install)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
- [Database Setup](#database-setup)
- [Frontend](#frontend)
- [API Endpoints](#api-endpoints)
- [Machine Learning](#machine-learning)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

-------

## Features

- Post, update, and query books with ML-generated category predictions.

- Search by title, author, or category.

- ML-powered categorization integrated via a separate ML service.

- Fully deployed backend on Render and frontend on Netlify.

- User-friendly React frontend with TypeScript.

- Data persisted in SQLite.
-----

## Tech Stack

- Frontend: React, TypeScript

- Backend: Node.js, Express, SQLite, Node Fetch

- Machine Learning: Python ML service (separate)

- Deployment: Render (backend), Netlify (frontend)
-----

## Project Structure

ABC-Tag-Generator/
├─ ABC-Tag-Generator-UI/        # React with Typescript
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ App.tsx
|  |  └─ etc.
│  └─ package.json
├─ ml-api/                      # Python Flask API
|   ├─ app.py
|   ├─ label_encoder.pkl
|   ├─ ml_model.py
|   └─ final_model/             # ML Model folder
|       ├─ config.json
|       ├─ tokenizer.json
|       ├─ vocab.json
|       └─ model.safetensors
|
├─ data/                       # SQLite database
│  ├─ books.sqlite
|  └─ database.js
├─ server.js                    # Express backend entry
├─ seed.js                      # Database seeding script
├─ db.js                        # Database connection helper
├─ package.json                 # Backend dependencies & scripts
└─ README.md

## Clone & Install

### Clone repository
`git clone https://github.com/mrterranova/ABC-Tag-Generator.git`
`cd ABC-Tag-Generator`

### Install backend dependencies
`npm install`

### Install frontend dependencies
`cd ABC-Tag-Generator-UI`
`npm install`

## Environment Variables

Create a .env file in the frontend and backend directories:
### Frontend (ABC-Tag-Generator-UI/.env)
    Production Env
        - REACT_APP_API_URL=https://abc-tag-generator.onrender.com
        - REACT_APP_ML_API_URL=
    Local Env
        - REACT_APP_API_URL="http://localhost:5000/"
        - REACT_APP_ML_API_URL="http://127.0.0.1:5001/predict"

### Backend(.env)
     Production Env
        - ML_API_URL=
     Local Env
        - ML_API_URL="http://127.0.0.1:5001/predict"

Note: Do not commit .env files to GitHub. Use deployment environment variables on Render/Netlify.

## Run Locally
 - `npm run server` to run node server.js file separately
 - `cd abc-tag-generator-ui` and `npm run start` to run react.js separately

 - `npm run dev` to run both node server.js file AND react.js
 
 - `cd ml-api` and `python app.py` to run python flask api

 all 3 (react, node, and flask) must be be full functional.

 ## Database Setup
 Seed your database with sample books:
 `node seed.js`

## Frontend
React + TypeScript frontend

Fetches books via /books endpoint

Displays ML predictions and user categories

Includes search and filter functionality


## API Endpoints
| Method | Endpoint              | Description                                             |
| ------ | --------------------- | ------------------------------------------------------- |
| GET    | `/books`              | Get all books (filter by `title`, `author`, `category`) |
| POST   | `/books`              | Add a new book (calls ML service)                       |
| PATCH  | `/books/:id/category` | Update user category for a book                         |

## Machine Learning Requirements

### Prerequisites
You need Python 3.9+ and the following packages installed:
 - pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
 - pip install transformers datasets accelerate scikit-learn pandas seaborn matplotlib ipywidgets jupyterlab_widgets

 ### Prepare Your Data
 Use either your own trained data in csv format with the following criteria: 
 - title — the book title
 - authors — author name(s)
 - description — book description (should be over 30 characters)
 - category — the label/category to predict (must be single category)

 Or you can use data in csv provided: [final_data_version.csv](https://github.com/mrterranova/Automated-Book-Tagging-Generator/blob/main/data/final_data_version.csv)

Load and preprocess the dataset:

```
    import pandas as pd
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from datasets import Dataset

    # Load CSV
    df = pd.read_csv("books.csv")

    # Encode labels
    le = LabelEncoder()
    df['label'] = le.fit_transform(df['category'])

    # Combine text features
    df['full_text'] = df['title'] + ' by ' + df['authors'] + ': ' + df['description']

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        df['full_text'], df['label'], test_size=0.2, stratify=df['label'], random_state=42
    )

    # Convert to Hugging Face datasets
    train_dataset = Dataset.from_dict({'text': X_train.tolist(), 'label': y_train.tolist()})
    test_dataset  = Dataset.from_dict({'text': X_test.tolist(), 'label': y_test.tolist()})
```
Add tokenizer:

```
    from transformers import AutoTokenizer

    model_name = "roberta-base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    def tokenize(batch):
        return tokenizer(batch['text'], padding='max_length', truncation=True, max_length=256)

    train_dataset = train_dataset.map(tokenize, batched=True)
    test_dataset = test_dataset.map(tokenize, batched=True)

    train_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])
    test_dataset.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])
```

Load model:

```
    from transformers import AutoModelForSequenceClassification

    num_labels = len(le.classes_)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
```

Fine tune model:

```
    from transformers import TrainingArguments

    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=4,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_dir="./logs",
        report_to="none",
        save_total_limit=2
    )
```

Train model 

```
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    trainer.train()
```
Save Mdoel

```
trainer.save_model("./final_model")
tokenizer.save_pretrained("./final_model")
```

Final Model structure should return: 
final_model/
├── config.json
├── pytorch_model.bin
├── tokenizer.json
├── tokenizer_config.json
└── vocab.json

Please see top structure for where to place this file in the repository.

### Flask API
ML API (Flask)

The machine learning API is built using Flask and exposes a /predict endpoint to return book categories and prediction scores.
Request:
```
{
  "title": "Book Title",
  "authors": "Author Name",
  "description": "Book description here"
}
```
Response:
```
{
  "genre": "Predicted category",
  "scores": [0.33, 0.12, 0.55, ...]  // Probabilities per category
}
```

## Deployment
### Backend on Render
Create a new Web Service on Render.
Connect your GitHub repo.
Set the build command:
`npm install`

Start command:
`npm run server`

Add environment variables on Render listed above.


### Frontend on Netlify
Connect frontend repo (ABC-Tag-Generator-UI).
Build command: `npm run build`
Publish directory: `build`

Add environment variables listed above in Netlify configuration under "Environment Variables".

### Flask API
Navigate to your ml-api folder.

## Contributing
Fork the repo
Create a branch (git switch -c feature/xyz)
Commit your changes (git commit -m 'Add feature')
Push (git push origin feature/xyz)
Open a Pull Request

## License
This project is licensed under the MIT License © 2026 Michal Terranova