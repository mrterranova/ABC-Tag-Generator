import React, { useState, useEffect } from "react";
import { useBookDescription } from "../components/scraper";
import Results from "../pages/Results";

// Props for the form
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
  mlScore?: number[]; // keep as array for charts
}

// BookFetcher button
interface BookFetcherProps {
  title: string;
  author: string;
  onDescriptionFetched: (desc: string) => void;
}

const BookFetcher: React.FC<BookFetcherProps> = ({ title, author, onDescriptionFetched }) => {
  const { description, fetchDescription, loading } = useBookDescription();

  useEffect(() => {
    if (description) onDescriptionFetched(description);
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

const SimpleForm: React.FC<SimpleFormProps> = ({ title = "", author = "", description = "" }) => {
  const [bookTitle, setBookTitle] = useState(title);
  const [bookAuthor, setBookAuthor] = useState(author);
  const [bookDescription, setBookDescription] = useState(description);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [mlLoading, setMLLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor) return;

    try {
      setMLLoading(true);

      // Get ML predictions

      const tempBook: Book = {
        id: crypto.randomUUID(),
        title: bookTitle,
        author: bookAuthor,
        description: bookDescription || "",
      };

      // POST
      const response = await fetch(`${process.env.REACT_APP_API_URL}books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tempBook
        }),
      });
      console.log('RES', response)

      if (!response.ok) {
        try {
          const error = await response.json();
          console.error("Backend error:", error);
        } catch {
          console.error("Backend returned invalid JSON");
        }
        alert("Failed to save book. See console for details.");
      } else {
        console.log("Book saved successfully!");
      }

      const savedBookRes = await fetch(`${process.env.REACT_APP_API_URL}books/${tempBook.id}`);
      if (!savedBookRes.ok) {
        console.error("Failed to fetch saved book");
        setMLLoading(false);
        return;
      }

      const savedBook: Book = await savedBookRes.json();

      // Add to state
      setAllBooks((prev) => [...prev, savedBook]);

      // Reset form
      setBookTitle("");
      setBookAuthor("");
      setBookDescription("");
      setMLLoading(false);
    } catch (err) {
      setMLLoading(false);
      console.error("Error during submission:", err);
      alert("Something went wrong during submission.");
    }
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setAllBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === updatedBook.id
          ? {
              ...updatedBook,
              category:
                updatedBook.usrCategory && updatedBook.usrCategory.toLowerCase() !== "unknown"
                  ? updatedBook.usrCategory
                  : updatedBook.mlCategory || "Unknown",
            }
          : b
      )
    );
  };

  return (
    <>
      <form className="simple-form" onSubmit={handleSubmit}>
        <label>
          <span className="form-labels">Title</span>
          <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required />
        </label>

        <label>
          <span className="form-labels">Author</span>
          <input type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} required />
        </label>

        <label>
          <span className="form-labels">Book Description</span>
          <textarea rows={6} value={bookDescription} onChange={(e) => setBookDescription(e.target.value)} />
        </label>

        <BookFetcher title={bookTitle} author={bookAuthor} onDescriptionFetched={setBookDescription} />

        <button className="form-btn" type="submit" disabled={mlLoading}>
          {mlLoading ? "Predicting Category..." : "Submit"}
        </button>
      </form>

      {allBooks.length > 0 && <Results books={allBooks} onUpdateBook={handleUpdateBook} />}
    </>
  );
};

export default SimpleForm;
