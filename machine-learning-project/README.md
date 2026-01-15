# Automated-Book-Tagging-Generator
Capstone Project - Machine Learning/AI Bootcamp

# 📚 Book Dataset Cleaning Pipeline

## Overview
This project focuses on cleaning and preprocessing book datasets from multiple sources (Google Books API and Kaggle datasets). The goal is to produce a unified, high-quality dataset suitable for NLP tasks like **tag generation** and **category prediction**.

---

##  Project Structure
```
book-dataset-cleaning/
│
├─ data/
│ ├─ total_df.csv/ # GOOGLE BOOKS API
│ ├─ Books_Dataset_Abdallah_Wagih_Ibrahim.csv / # Book dataset
│ ├─ GoodReads_100k_books.csv / # Gookreads dataset
├ ├─ google cat csvs / # saved data by category from google API
│
├─ notebooks/
│ ├─ Capstone_Data_Cleaning.ipynb # Python script to clean datasets
│
└─ README.md
```
## Datasets
We use three main sources:

1. **Google Books API**
   - Pulls book metadata (title, authors, description, categories, etc.) using the `subject` query.
   - Provides JSON responses that are parsed into a Pandas DataFrame.

2. **Kaggle Datasets**
   - [Books Dataset by Abdallah Wagih](https://www.kaggle.com/datasets/abdallahwagih/books-dataset)
   - [GoodReads 100k Dataset](https://www.kaggle.com/datasets/mdhamani/goodreads-books-100k)

3. **Combined Dataset**
   - Optional: You can merge all datasets into `total_df.csv` for comprehensive cleaning.

---

## Cleaning Steps

### Step 1: Load Data
```python
import pandas as pd

df_google = pd.read_csv("data/raw/google_books.csv")
df_kaggle_1 = pd.read_csv("data/raw/Books_Dataset_Abdallah_Wagih_Ibrahim.csv")
df_kaggle_2 = pd.read_csv("data/raw/GoodReads_100k_books.csv")

### Step 2: Merge Datasets
Concatenate datasets into a single DataFrame.

Ensure consistent column names.


### Step 3: Remove Duplicates

   Use title + authors as unique identifiers.

### Step 4: Handle Missing Values

   Fill missing descriptions or categories with placeholders ("N/A").

### Step 5: Normalize Text

   Lowercase text

Remove extra whitespace

   Normalize punctuation and special symbols

### Step 6: Standardize Lists

   Convert list-like fields (authors, categories) to consistent strings or lists.

### Step 7: Save Cleaned Dataset

