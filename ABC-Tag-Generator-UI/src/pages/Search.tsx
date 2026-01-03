import React, { useState, useEffect } from "react";
import Results from "./Results";
import { categoryLabels } from "../components/constants";

interface Book {
  id: string;
  title: string;
  author: string;
  category?: string;
  description?: string;
  mlScore?: number[];
}

const Search: React.FC = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [results, setResults] = useState<Book[]>([]);
  const [updateResults, setUpdateResults] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch books from backend
  useEffect(() => {
    fetch(`${BASE_URL}/books`)
      .then((res) => res.json())
      .then((data) => {
        const parsedBooks = data.map((b: any) => ({
          ...b,
          category: b.usrCategory, // map to user category
          mlScore: b.mlScore
            ? b.mlScore.map((num: number) => (num < 0 ? 0 : num))
            : [],
        }));
        setBooks(parsedBooks);
        setResults(parsedBooks);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  // Handle search form
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filteredBooks = books.filter((book) => {
      const matchesTitle = title ? book.title.toLowerCase().includes(title.toLowerCase()) : true;
      const matchesAuthor = author ? book.author.toLowerCase().includes(author.toLowerCase()) : true;
      const matchesCategory = category ? book.category === category : true;
      return matchesTitle && matchesAuthor && matchesCategory;
    });
    setResults(filteredBooks);
    setUpdateResults(true);
  };

  // Callback to update a book when category changes
  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setResults(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  return (
    <>
      <div className="simple-form">
      <div className="parallax-layer">
        <img
          className="parallax-layer-i"
          src="book-row.jpg"
          alt="Bookshelf"
        />
      </div>
        <form onSubmit={handleSearch}>
          <label className="form-labels">
            Title:
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
          </label>
          <label className="form-labels">
            Author:
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} />
          </label>
          <label className="form-labels">
            Category:
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categoryLabels.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
          <span className="btn-container-r">
            <button type="submit" className="form-btn">Search</button>
          </span>
        </form>
      </div>

      {updateResults && <Results books={results} onUpdateBook={handleUpdateBook} />}
    </>
  );
};

export default Search;
