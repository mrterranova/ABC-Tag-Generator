# Automated-Book- Categorization-Tag-Generator
Capstone Project - Machine Learning/AI Bootcamp

# Book Dataset Cleaning Pipeline

## Overview
This project focuses on cleaning and preprocessing book datasets from multiple sources (Google Books API and Kaggle datasets). The goal is to produce a unified, high-quality dataset suitable for NLP tasks like **tag generation** and **category prediction**.

Please also view full process of building the machine learning model in repository found [HERE](https://github.com/mrterranova/Automated-Book-Tagging-Generator).

-------
## Final Project Link: [HERE](https://abc-tag-generator.netlify.app)
Note: Project is being hosted on free tier on their respective hosting websites, due to larger model/application, the initial call will take longer as the system boots up. Waiting time can last to 5 minutes for first call as tested. 

### For Hugging Face, where machine learning model and gradio API is located, you can also use the UI built on the screen to generate results and/or see when model is running: 
[HERE](https://huggingface.co/spaces/MTerranova/roberta-book-genre-api)
-------

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Summary](#summary)
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
├─ README.md
└─ hf-upload /                  # Gradio API specifically for Hugging Face deployment
     ├─ DOCKER
     ├─ gradio_app.py
     ├─ label_encoder.pkl
     └─ ml_model.py

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
        - REACT_APP_ML_API_URL="http://127.0.0.1:7860/predict"

### Backend(.env)
     Production Env
        - ML_API_URL=
     Local Env
        - ML_API_URL="http://127.0.0.1:7860/predict"

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
| GET    | `/books/:id`          | Get single book by id (not currently used)              |
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
    df = pd.read_csv("final_data_version.csv")

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
        do_eval=True,   
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,   
        metric_for_best_model="f1", 
        greater_is_better=True,
        num_train_epochs=4,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=3e-5,
        weight_decay=0.01,
        warmup_ratio=0.1, 
        logging_dir="./logs",
        logging_steps=100,
        save_total_limit=2,
        report_to="none" 
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

![Roberta Book Genre Classifier](./abc-tag-generator-ui/public/Training_roBERTa.png)


Save Model

```
trainer.save_model("./final_model")
tokenizer.save_pretrained("./final_model")
```

![Roberta Book Genre Classifier](./abc-tag-generator-ui/public/Saving_roBERTa.png)

Final Model structure expected return: 
final_model/
├── config.json
├── pytorch_model.bin
├── tokenizer.json
├── tokenizer_config.json
└── vocab.json

Please see top structure for where to place this file inside the repository once it is saved.

For a full version of model completed to analyze: 
[Python Script Final Model](https://github.com/mrterranova/Automated-Book-Tagging-Generator/blob/main/notebooks/Capstone_Final_Model.ipynb)

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
1. Create a new Web Service on Render.
2. Connect your GitHub repo.
3. Set the build command:
`npm install`

4. Start command:
`npm run server`

5. Add environment variables on Render listed above.


### Frontend on Netlify
1. Connect frontend repo (ABC-Tag-Generator-UI).
2. Build command: `npm run build`
3. Publish directory: `build`

4. Add environment variables listed above in Netlify configuration under "Environment Variables".

### Machine Learning Model
1. Complete the build of your machine learning model so that it saves as a folder. Folder should include the following structure: 
     final_model/
       ├─ config.json
       ├─ tokenizer.json
       ├─ vocab.json
       └─ model.safetensors
2. Save the `label_encoder.pkl` file and place as seen above. You will need to include for the API.
3. Go to [Hugging Face Spaces](https://huggingface.co/), login and click Create new Space.
4. Clone the repo locally:
```git clone https://huggingface.co/<your-username>/roberta-book-genre
cd roberta-book-genre
```
5. Copy your model files into the cloned repo.
6. Push the model to Hugging Face using git commands and it should automatically start deployment.
7. Now you can directly access your model. Be sure to update your gradio_app.py folder to your new model on Hugging Face, `<your-username>-<space-name>`.

### Gradio API
1. Make sure your ML model is ready (e.g., ml_model.py, trained model weights label_encoder.pkl, etc.).
2. Create a Gradio app script (e.g., gradio_app.py) that exposes a prediction function. Please view inside the hf-upload folder for how to build.
3. Go to [Hugging Face Spaces](https://huggingface.co/), login and click Create new Space. Choose a Python Space (or optional Docker).
4. (Optional) Create a Docker file as seen above. Make sure that it points to port:7860 as this is what Hugging face recognizes.
5. Upload your project files: gradio_app.py, ml_model.py (and model weights), requirements.txt (list all Python dependencies, e.g., gradio, torch, etc.)
6. Hugging Face will automatically detect gradio_app.py and serve it or if docker file, will spin up the image. 
7. Once deployed, your app will have a public URL, e.g.:
`https://<your-username>-<space-name>.hf.space`
8. Now test that Gradio is working on your user interface created. IE see the one for this repository: [MTerranova/roberta-book-genre-api](https://huggingface.co/spaces/MTerranova/roberta-book-genre-api)
9. Ensure that API is working using cURL cmds in either the terminal or in POSTMAN.

EXAMPLES OF TESTING USED:
 ```
 curl -s -X POST "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio" \
-H "Content-Type: application/json" \
-d '{
  "data": [
    "Good to Great",
    "Jim Collins",
    "An analysis of how companies transition from average performance to sustained excellence through disciplined leadership and strategy"
  ]
}' | jq -r '.event_id' | xargs -I {} curl -s "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio/{}"
 ```
 should see returned (event & data):
 ```
event: complete
data: ["business/finance", [0.00011174344399478287, 0.9969701766967773, 0.0001264417514903471, 0.0011111185885965824, 0.00021374489006120712, 0.00026981779956258833, 0.0005156140541657805, 0.00045898358803242445, 0.00022248538152780384]]
 ```
 ```
 curl -s -X POST "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio" \
-H "Content-Type: application/json" \
-d '{
  "data": [
    "The Guns of August",
    "Barbara W. Tuchman",
    "A detailed account of the opening month of World War I and the political and military decisions that shaped the conflict"
  ]
}' | jq -r '.event_id' | xargs -I {} curl -s "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio/{}"
 ```
should see return (event & data):
```
event: complete
data: ["history", [0.00021246539836283773, 0.006904317066073418, 0.00010260281123919412, 0.00134474562946707, 0.9877997636795044, 0.00225885771214962, 0.0001367704098811373, 0.0009381313575431705, 0.0003023376048076898]]
```
 ```
 curl -s -X POST "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio" \
-H "Content-Type: application/json" \
-d '{
  "data": [
    "The Da Vinci Code",
    "Dan Brown",
    "A symbologist is drawn into a deadly conspiracy involving secret societies, cryptic clues, and a race against time across Europe"
  ]
}' | jq -r '.event_id' | xargs -I {} curl -s "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio/{}"
 ```
 should see return (event & data):
 ```
event: complete
data: ["thriller", [0.005067174322903156, 0.0004816255532205105, 0.03581446036696434, 0.0002398443320998922, 0.0008293546852655709, 0.0006465901387855411, 0.0029014581814408302, 0.0006776368245482445, 0.9533419013023376]]
 ```

## Contributing
1. Fork the repo
2. Create a branch (git switch -c feature/xyz)
3. Commit your changes (git commit -m 'Add feature')
4. Push (git push origin feature/xyz)
5. Open a Pull Request

## License
This project is licensed under the MIT License © 2026 Michal Terranova
