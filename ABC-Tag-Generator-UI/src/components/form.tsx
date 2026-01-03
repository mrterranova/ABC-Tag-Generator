import React, { useState, useEffect } from "react";
import { useBookDescription } from "../components/scraper";
import Results from "../pages/Results";
import { fetchMLCategory } from "../services/flask";

// SimpleForm interface
interface SimpleFormProps {
  title?: string;
  author?: string;
  description?: string;
}

// Book interface
export interface Book {
  id: string;
  title: string;
  author: string;
  mlCategory?: string;
  usrCategory?: string;
  category?: string; 
  description?: string;
  mlScore?: number[];
}

interface BookFetcherProps {
  title: string;
  author: string;
  onDescriptionFetched: (desc: string) => void;
}

const BookFetcher: React.FC<BookFetcherProps> = ({
  title,
  author,
  onDescriptionFetched,
}) => {
  const { description, fetchDescription, loading } = useBookDescription();

  useEffect(() => {
    if (description) {
      onDescriptionFetched(description);
    }
  }, [description, onDescriptionFetched]);

  return (
    <div className="btn-container-r">
      <button
        className="form-btn"
        type="button"
        onClick={() => fetchDescription(title, author)}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Find Description"}
      </button>
    </div>
  );
};

const SimpleForm: React.FC<SimpleFormProps> = ({
  title = "",
  author = "",
  description = "",
}) => {
  const [bookTitle, setBookTitle] = useState(title);
  const [bookAuthor, setBookAuthor] = useState(author);
  const [bookDescription, setBookDescription] = useState(description);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [mlLoading, setMLLoading] = useState(false);

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor) return;

    try {
      // Fetch ML field
      setMLLoading(true);
      const {genre: mlCategory, scores} = await fetchMLCategory(
        bookTitle,
        bookAuthor,
        bookDescription || ""
      );

      console.log("ML Prediction:", mlCategory, scores);
      setMLLoading(false);

      const newBook: Book = {
        id: crypto.randomUUID(),
        title: bookTitle,
        author: bookAuthor,
        mlCategory: mlCategory,
        usrCategory: mlCategory, 
        category: mlCategory,
        description: bookDescription || "",
        mlScore: scores,
      };

      setAllBooks((prev) => [...prev, newBook]);

      // Post the results
      const response = await fetch("http://localhost:5000/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Backend error:", error);
        alert("Failed to save book: " + error.message);
      } else {
        console.log("Book saved successfully!", mlCategory);
      }

      // Reset fields on post
      setBookTitle("");
      setBookAuthor("");
      setBookDescription("");
    } catch (err) {
      setMLLoading(false);
      console.error("Error during submission:", err);
      alert("Something went wrong during submission.");
    }
  };

  const handleUpdateBook = (updatedBook: Book): void => {
    setAllBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === updatedBook.id
          ? { ...updatedBook, category: updatedBook.usrCategory || updatedBook.mlCategory }
          : b
      )
    );
  };

  return (
    <>
      <form className="simple-form" onSubmit={handleSubmit}>
        <label>
          <span className="form-labels">Title</span>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            required
          />
        </label>

        <label>
          <span className="form-labels">Author</span>
          <input
            type="text"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            required
          />
        </label>

        <label>
          <span className="form-labels">Book Description</span>
          <textarea
            rows={6}
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
          />
        </label>

        <BookFetcher
          title={bookTitle}
          author={bookAuthor}
          onDescriptionFetched={setBookDescription}
        />

        <button className="form-btn" type="submit" disabled={mlLoading}>
          {mlLoading ? "Predicting Category..." : "Submit"}
        </button>
      </form>

      {allBooks.length > 0 && (
        <Results books={allBooks} onUpdateBook={handleUpdateBook} />
      )}
    </>
  );
};

export default SimpleForm;
