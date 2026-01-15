# Automated-Book-Tagging-Generator
Capstone Project - Machine Learning/AI Bootcamp

# Book Dataset Cleaning Pipeline

## Overview
This project focuses on cleaning, preprocessing, and unifying book datasets from multiple sources, including the Google Books API and publicly available Kaggle datasets. The end goal is to produce a high-quality, machine-learning-ready dataset suitable for downstream NLP tasks such as automated tag generation and book category prediction.

This dataset serves as the foundation for training a RoBERTa-based text classification model used in the larger Automated Book Categorization system.

---

##  Project Structure
```
book-dataset-cleaning/
│
├─ data/
│ ├─ final_data_version.csv/ # complete list of data used for training and testing purposes
│ ├─ Books_Dataset_Abdallah_Wagih_Ibrahim.csv / # Kaggle Book dataset
│ ├─ GoodReads_100k_books.csv / # Gookreads dataset
| ├─ google cat csvs/ # saved data by category from GOOGLE API
| ├─ json_tests/ # testing folder for final model
|
├─ documents
| ├─ FINALMODELDECISIONWRITEUP.md # document of final decision/write up on NPL model
│
├─ notebooks/
│ ├─ progression-step-1-data-cleaning # cleaning and curating the data
| ├─ progression-step-2-experimentation # experimenting with various models
| ├─ progression-step-3-baseline # developing a baseline
| ├─ progression-step-4-fine-tuning # reviewing fine tuning for selected deep-learning model
| ├─ progression-step-5-final-model # completed and saved model deployed
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


## Progression Step 1: Data Cleaning
### Overview
The goal of the data cleaning pipeline is to merge, clean, and standardize book datasets from multiple sources to produce a high-quality, machine-learning-ready dataset. This dataset forms the foundation for downstream NLP tasks, such as automated book tag generation and category prediction.  

### Step 1: Load Data
```
import pandas as pd
```

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

    Save final data set can be found: [HERE]().
    When running future notebooks you can either need this dataset to duplicate results, or use your own curated dataset. Please note the training done at this step for the data to be run in the final (roBERTa NPL model).
## Progression Step 2: Baseline (Optional)
### Overview
The baseline step provides a simple benchmark for book category prediction before using deep learning models. It helps identify category-specific patterns in the text and sets expectations for more advanced models.

### Count Vectorizer + Naive Bayes
- **Purpose:** Extract the most common words per category and evaluate their predictive power.
- **Method:**  
  - Text data (book descriptions) was vectorized using `CountVectorizer`.
  - A Multinomial Naive Bayes classifier was trained on the resulting word counts.
- **Findings:**  
  - Strong distinguishing words were found in categories such as **business/finance**, **food**, **romance**, and **thriller**.  
  - Categories like **psychology** and **humanities** shared overlapping vocabulary, making them harder to predict accurately.
- **Conclusion:**  
  - This baseline shows that simple word-frequency methods can capture some category-specific signals.  
  - However, overlap between categories and nuanced text patterns indicates the need for more advanced models like BERT and RoBERTa for better accuracy.


## Progression Step 3: Experimentation
### Overview: 
In this phase, we explored multiple machine learning and deep learning models to predict book categories from descriptions. The goal was to identify meaningful patterns in the text and evaluate which models could accurately separate categories.

### Data Preparation
Text descriptions were cleaned:
- Converted to lowercase
- Removed extra whitespace and special characters
- Normalized punctuation
- TF-IDF and Count Vectorizer features were generated with varying max_features and ngram_range.
- The dataset was split into training (80%) and testing (20%) sets.

### Logistic Regression
Tested multiple TF-IDF configurations:
- Max features: 5,000 → 20,000
- N-gram ranges: (1,2) → (1,5)
- Sublinear term frequency weighting
- Best configuration: max_features=20,000, ngram_range=(1,3)

Observations:
- Strongest performance: business/finance, food, romance, thriller
- Weakest performance: psychology, humanities, history
- Confusion persisted between fantasy/horror and science fiction, likely due to overlapping descriptive words.

### Random Forest
Explored TF-IDF with 10,000–20,000 features and n-gram ranges (1–5)
Classifier: 200–300 estimators, class_weight='balanced'

Findings:
- Random Forest improved separation for most categories but struggled with psychology and religion/spirituality.
- Increasing features and n-gram range improved results marginally

### XGBoost
Trained with 300 estimators, max depth=6, learning rate=0.1
Label encoding used for multi-class classification

Observations:
- Better distinction between categories than Random Forest and Logistic Regression
- Persisting difficulty in separating psychology from religion/spirituality
- Some overlap between fantasy/horror and science fiction

### Transformer Models (BERT / DistilBERT)
Tokenization and fine-tuning performed on balanced subsets (~500 samples per category)

Results:
- Accuracy: 61–62%
- Macro F1 score: ~0.62–0.63
- Strong separation for business/finance, food, and romance
- Remaining challenges: psychology, slice of life, and some overlap between fantasy/horror and science fiction
- Conclusion: Transformer-based models learn semantic patterns more effectively, indicating that deep learning is necessary for high-accuracy classification.

**Note: Categories were rearranged at this stage and the data was updated**

## Progression Step 4: Fine Tuning
In this phase, we focused on optimizing transformer-based models (BERT and RoBERTa) to improve book category classification. The goal was to identify the best-performing model while balancing accuracy, category separation, and training time.

### 1. BERT Fine-Tuning
- **Base model:** `bert-base-uncased`
- **Training experiments:**
  - 3–5 epochs
  - Learning rate: 2e-5
  - Batch size: 8
- **Observations:**
  - Best performance achieved at 3 epochs with a learning rate of 2e-5
  - Accuracy: ~0.74
  - Macro F1 score: 0.74
  - Categories with highest precision: `business/finance`, `food`, `romance`, `thriller`
  - Challenges remained in `fantasy/horror` and `science fiction` due to overlapping narrative-style descriptions
  - Narrative-driven categories (Thriller, SciFi, Art, Fantasy/Horror) were handled slightly better by BERT

### 2. RoBERTa Fine-Tuning
- **Base model:** `roberta-base`
- **Training experiments:**
  - 2–4 epochs
  - Learning rates: 2e-5 → 3e-5
  - Batch size: 8
- **Observations:**
  - Best performance at 2 epochs, learning rate 3e-5
  - Accuracy: ~0.74
  - Macro F1 score: 0.74
  - Slightly better category separation than BERT overall
  - Fact-based categories (Business/Finance, Food, History, Science) were better predicted by RoBERTa
  - Training time: ~1:37:46 — ~25% faster than BERT

### 3. Model Comparison

| Model   | Best Epochs | Learning Rate | Accuracy | Notes |
|---------|------------|---------------|----------|-------|
| BERT    | 3          | 2e-5          | 0.74     | Stronger in narrative/story-driven categories; longer training time |
| RoBERTa | 2          | 3e-5          | 0.74     | Slightly better separation overall; faster training; excels in factual categories |

**Insights:**
- BERT handles narrative-driven categories better.
- RoBERTa excels in factual, structured categories.
- Both models still face challenges distinguishing `fantasy/horror` from `science fiction`.
- RoBERTa is slightly preferred due to faster training and consistent separation across categories.


### 4. External Comparisons

- **[Book Genre Classification](https://github.com/akshaybhatia10/Book-Genre-Classification)**  
  - Original dataset: 31 genres, unbalanced
  - Accuracy: 0.58–0.64
  - Our RoBERTa model achieves 0.74 accuracy with fewer categories, showing competitive performance.
  
- **[Book Genre Predictor](https://github.com/obaidtambo/books_genre_predictor/blob/main/Books%20Genre%20Prediction.ipynb)**  
  - Similar dataset structure with title + description
  - Accuracy: 0.76 (slightly higher due to 10 epochs and additional metadata)
  - Our model achieves comparable results, demonstrating effectiveness on a balanced dataset with a simplified label set.

### 5. Conclusion
- RoBERTa with 2 epochs and a learning rate of 3e-5 is the final recommended model for the final.
- BERT remains strong for narrative-heavy categories but is slower to train.
- Both models achieve ~0.74 accuracy and macro F1, providing a strong foundation for automated book category prediction.
- Future improvements could include leveraging additional metadata (e.g., title, author) to further boost performance.


**NOTE: retested and adjusted to fit new parameters and clean data once more at this stage**

## Progression Step 5: Final Model

In the final stage, the RoBERTa model was fine-tuned using the cleaned and balanced dataset (`final_data_version.csv`). This stage incorporates additional metadata (title and authors) concatenated with the book description to improve classification performance.

### 1. Dataset Preparation
- The dataset was split into training and testing sets (80/20 split) stratified by category.
- A new `full_text` column was created for each book: `title by author : description`
- Labels were encoded using `LabelEncoder`.
- The Hugging Face `Dataset` format was used for compatibility with the `Trainer` API.

### 2. RoBERTa Fine-Tuning
- **Base model:** `roberta-base`
- **Training configuration:**
- Epochs: 4
- Learning rate: 3e-5
- Batch size: 8
- Weight decay: 0.01
- Warmup ratio: 0.1
- Evaluation and checkpoint saving performed at each epoch
- Metric for best model: weighted F1
- **Tokenization:** Maximum sequence length of 256, with padding and truncation

### 3. Performance Metrics

| Category                  | Precision | Recall | F1-score | Support |
|---------------------------|-----------|--------|----------|--------|
| Art                       | 0.74      | 0.67   | 0.70     | 900    |
| Business/Finance          | 0.82      | 0.83   | 0.82     | 900    |
| Fantasy/Science Fiction   | 0.82      | 0.77   | 0.79     | 900    |
| Food                      | 0.83      | 0.87   | 0.85     | 879    |
| History                   | 0.71      | 0.70   | 0.70     | 900    |
| Religion/Spirituality     | 0.76      | 0.75   | 0.76     | 900    |
| Romance                   | 0.86      | 0.85   | 0.86     | 900    |
| Science                   | 0.69      | 0.76   | 0.72     | 900    |
| Thriller                  | 0.79      | 0.83   | 0.81     | 827    |
| **Overall**               |           |        |          | 8006   |
| **Accuracy**              |           |        | 0.78     |        |
| **Macro Average F1**      |           |        | 0.78     |        |
| **Weighted Average F1**   |           |        | 0.78     |        |

### 4. Insights
- Incorporating **title and author metadata** significantly improved classification, especially for genres like `Romance`, `Food`, and `Business/Finance`.
- Most challenging categories remained `Art` and `Fantasy/Science Fiction`, which share overlapping descriptive styles.
- Overall accuracy improved to **0.78**, with a macro F1-score of 0.78 — an improvement over previous fine-tuning experiments.
- RoBERTa demonstrates strong performance for factual and narrative-driven categories alike.
- Training time remained efficient, making this model suitable for production deployment in the capstone project.


### 5. Conclusion
The final RoBERTa-based model, trained with four epochs and enhanced metadata, is the recommended model for automated book category prediction. It balances accuracy, category separation, and computational efficiency while leveraging richer text input for improved predictions.

