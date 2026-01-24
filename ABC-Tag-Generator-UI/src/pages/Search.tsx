import React, { useState, useEffect } from "react";
import Results from "./Results";
import { categoryLabels } from "../utils/constants";

interface Book {
  id: string;
  title: string;
  author: string;
  usrCategory?: string;
  mlCategory?: string;
  category?: string; // derived for search/display
  description?: string;
  mlScore?: number[];
}

// Helper: resolve category for search/display
const resolveCategory = (usrCategory?: string, mlCategory?: string) => {
  if (usrCategory && categoryLabels.includes(usrCategory.toLowerCase())) {
    return usrCategory;
  }
  return mlCategory || "Unknown";
};

const Search: React.FC = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [results, setResults] = useState<Book[]>([]);

  // Fetch books from backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}books`)
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Expected JSON but got:", text);
          throw new Error("Invalid JSON response"); 
        }
        return res.json(); 
      })
      .then((data) => {
        if (!data) return;

        const parsedBooks: Book[] = data.map((b: any) => {
          const resolvedCategory = resolveCategory(b.usrCategory, b.mlCategory);

          return {
            ...b,
            usrCategory: b.usrCategory,
            mlCategory: b.mlCategory,
            category: resolvedCategory,
            mlScore: Array.isArray(b.mlScore)
              ? b.mlScore
              : b.mlScore
              ? JSON.parse(b.mlScore)
              : [],
          };
        });

        setBooks(parsedBooks);
        setResults(parsedBooks);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  // Handle search form
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filteredBooks = books.filter((book) => {
      const matchesTitle = title
        ? book.title.toLowerCase().includes(title.toLowerCase())
        : true;

      const matchesAuthor = author
        ? book.author.toLowerCase().includes(author.toLowerCase())
        : true;

      const matchesCategory = category
        ? book.category?.toLowerCase() === category.toLowerCase()
        : true;

      return matchesTitle && matchesAuthor && matchesCategory;
    });

    setResults(filteredBooks);
  };

  // Callback to update a book when category changes
  const handleUpdateBook = (updatedBook: Book) => {
    const resolvedCategory = resolveCategory(
      updatedBook.usrCategory,
      updatedBook.mlCategory
    );

    const normalizedBook = {
      ...updatedBook,
      category: resolvedCategory,
    };

    setBooks((prev) =>
      prev.map((b) => (b.id === normalizedBook.id ? normalizedBook : b))
    );
    setResults((prev) =>
      prev.map((b) => (b.id === normalizedBook.id ? normalizedBook : b))
    );
  };

  return (
    <>
      <div className="simple-form">
        <div className="parallax-layer">
          <img
            className="parallax-layer-i"
            src="imgs/book-row.jpg"
            alt="Bookshelf"
          />
        </div>

        <form onSubmit={handleSearch}>
          <label className="form-labels">
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="form-labels">
            Author:
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </label>

          <label className="form-labels">
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categoryLabels.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <span className="btn-container-r">
            <button type="submit" className="form-btn">
              Search
            </button>
          </span>
        </form>
      </div>

      <Results books={results} onUpdateBook={handleUpdateBook} />
    </>
  );
};

export default Search;
