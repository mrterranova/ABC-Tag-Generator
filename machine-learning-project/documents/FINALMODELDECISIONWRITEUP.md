# Model Analysis

From the following tuning, it is apparent that the two that should be considered is the BERT model with 3 epochs at a learning rate of 2e-5 and the roBERTa model with 2 epochs at a learning rate of 3e-5. The reason for this is that both contain the greatest separation of the different categories along with both being a reasonable/lesser time to complete the training. This must be taken into account for overall usage. 

## Clustering
Of the two RoBERTa performs better by only slight measure. There is a slightly more distinct separation of classes overall when looking at all the categories. The consistency is also greater with the roBERTa model. The following categories have fewer misclassifications: food, romance, and religion/spirituality. Fantasy/horror  and scifi still remain as the most problematic fields in both models. Despite it being slightly less separated in the BERT model over the roBERTa one, the roBERTa one still shows the greater performance between the two. 

## Performace
An interesting thing to note between the two models is that the BERT model performed better in narrative-led/ story-driven categories such as Thriller, SciFi, Art(which included multiple story-driven forms like comics) and Fantasy/Horror. The roBERTA modelhad an edge t more factual driven categories such as Business/Finance, Food, History, and Science. So the BERT model has an edge on more narrative/stylistic synopsis while BERT has an edge of fact base synopsis. 


## Time
The biggest difference between the two models lies in the timing it takes to train the model. For the BERT model it took 2:12:35 for completion of the model's training. For the roBERTa model it took 1:37:46 which is close to erasing 1/4th of the time that it took the BERT model. This is a significant difference and should be considered in the finalizing of the model for the capstone.

# Comparison with External Sources
## "Book Genre Classification" Repository
[Book Genre Classification Repo](https://github.com/akshaybhatia10/Book-Genre-Classification)

In this repository, we see that dataset and project are similar in nature. The developer according to their [README](https://github.com/akshaybhatia10/Book-Genre-Classification/blob/master/README.md) used real data provided to them which included up to 31 genres. The raw data was not balanced, but instead pulled in and used according to findings inside the repository [here](https://github.com/akshaybhatia10/Book-Genre-Classification/blob/master/learn_embeddings.py). Yet the models that they used were pulling 0.58 - 0.64 overall accuracy which is impressive considering the number of categories they are differentiating books via title into. To see the work in the respository please click [HERE](https://github.com/akshaybhatia10/Book-Genre-Classification/blob/master/Best_TFIDF-Vectorizer_model.ipynb) While this repository does suggest that incorporating title and author may further improve performance, the current project’s roBERTa-based approach already achieves a significantly stronger performance of 0.74 accuracy with fewer classes. As such, the present results are comparable and competitive. This capstone demonstrates effectiveness at the genre classification task under a more constrained label set and the addition of descriptions. Though it should be tested using similar metadata as presented in the classification repository to see if improvements can be made to the 2 models prior to finalization.

## "Book Genre Preditior" Repository
[Book Genre Predictor](https://github.com/obaidtambo/books_genre_predictor/blob/main/Books%20Genre%20Prediction.ipynb)

In this repository, the dataset which was posted on [Kaggle](https://www.kaggle.com/code/lomero/aann-22-23-lab-07-training) is nearly the same project that is being done in this capstone. The metadata included contains analysis of the title and the description which is close to the capstone project presented. Like the previous project, there was no balancing of the data input into the model. The ten classes, similar to my own ten classes, were distributed unevenly prior to running. This resulted in 6 strongly trained classes and 4 weakly trained classes. The final accuracy score after 10 epochs resulted in 0.76 which is slightly higher than the 0.74. The difference in scores suggests that incorporating additional metadata or book information may enhance this project’s final model performance and help boost overall accuracy. However, the the final scoring is similar to that of what this capstone has achieved. The word cloud also was an interest concept that can be applied to this capstone for a clear visualization.



# Conclusion

This study evaluated the performance of two NPL models, **BERT** and **RoBERTa**, for book category or genre classification and was rerun after comparison with other public project achieving similar results. This capstone used titles, authors, and descriptions to determine a single categorization of a book. Both models demonstrated strong predictive capability, achieving an overall accuracy of approximately 75% across ten genres. Precision, recall, and F1-scores demonstrates that results were negligable between the two models as seen in the comparison above. Even after adding more metadata, results did not change greatly from what was initially run

Despite the two model's similar performances, the models differ significantly in training efficiency. BERT required three epochs and over two hours to fully train and reach optimal performance, whereas RoBERTa's time to train only took two epochs, completing training in approximately ~97 minutes. RoBERTa achieved efficiency without making a sacrifice to it's overall accuracy, F1 performance, or categorization predictivity.

In conclusion, while both models are suitable for the classification of genres, RoBERTa offers a more favourable trade-off. Its reduced training time and it's similar accuracy make it the more practical choice. Future research to improve the classification could explore more helpful metadata that might include lengthy reviews on books, perhaps a greater consentration of books that have less multi-categorization or even expanding research to include cover images, chapters in the book, etc which will provide interesting insights to categorization and even lead to a superior recommendation system model to users.

