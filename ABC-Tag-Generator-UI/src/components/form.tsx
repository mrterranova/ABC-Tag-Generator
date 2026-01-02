import React, { useState, useEffect } from "react";
import { useBookDescription } from "../components/scraper";
import Results from "../pages/Results";


// Props for the SimpleForm component
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
  category?: string;
  description?: string;
  mlScore?: number[];
}

// Props for BookFetcher button component
interface BookFetcherProps {
  title: string;
  author: string;
  onDescriptionFetched: (desc: string) => void;
}


// BookFetcher Component: fetches description using custom hook
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

// Main form component
const SimpleForm: React.FC<SimpleFormProps> = ({
  title = "",
  author = "",
  description = "",
}) => {
  const [bookTitle, setBookTitle] = useState(title);
  const [bookAuthor, setBookAuthor] = useState(author);
  const [bookDescription, setBookDescription] = useState(description);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Handle form submission and POST to backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor) return;

    const newBook = {
      id: crypto.randomUUID(),     // required
      title: bookTitle,            // required
      author: bookAuthor,          // required
      mlCategory: "Art",           // required
      usrCategory: "",             // optional
      description: bookDescription || "",  // optional
      mlScores: JSON.stringify([0.9,0.9,0.9,0.5,0.4,0.4,0.3,0.8,0.9]) // optional
    };

    // Add to local state immediately for UI
    setAllBooks((prev) => [...prev, newBook]);

    // POST to backend
    try {
      const response = await fetch("http://localhost:5000/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Backend error:", error);
        alert("Failed to save book: " + error.message);
      } else {
        console.log("Book saved to backend successfully!");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to connect to backend.");
    }

    // Reset form fields
    setBookTitle("");
    setBookAuthor("");
    setBookDescription("");
  };

  function handleUpdateBook(book: Book): void {
    throw new Error("Function not implemented.");
  }

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

        <button className="form-btn" type="submit">
          Submit
        </button>
      </form>

      {allBooks.length > 0 && (
        <Results books={allBooks} onUpdateBook={handleUpdateBook} />
      )}
    </>
  );
};

export default SimpleForm;
