import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryDropdown from "../components/dropdown";


interface Book {
  id: string;
  title: string;
  author: string;
  category?: string;
  mlCategory?: string;
  description?: string;
  mlScore?: number[];
}

interface CardsProps {
  book: Book;
  onUpdateBook: (book: Book) => void; // new prop
}

const Cards: React.FC<CardsProps> = ({ book, onUpdateBook }) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState(book.category ?? "");
  const [mlCategory, setMlCategory] = useState(book.mlCategory ?? "");

  const handleViewChart = () => {
    navigate("/chart", { state: { title: book.title, author: book.author, scores: book.mlScore, description: book.description, category: category, mlCategory: mlCategory } });
  };

  const handleSaveCategory = async () => {
    
    try {
      const response = await fetch(`${BASE_URL}/books/${book.id}/category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!response.ok) throw new Error("Failed to update category");
      const updatedBook = await response.json();
      setCategory(updatedBook.usrCategory);
      setMlCategory(updatedBook.mlCategory);
      setIsEditing(false);

      // **Update parent state immediately**
      onUpdateBook({ ...book, category: updatedBook.usrCategory });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="book-result-card">
      <p><b>{book.title}</b> by <i>{book.author}</i></p>

      {!isEditing && <p>Categorized: {category || "Uncategorized"}</p>}
      {isEditing && <CategoryDropdown value={category} onChange={setCategory} />}

      <button onClick={handleViewChart}>View Chart</button>

      {!isEditing && <button onClick={() => setIsEditing(true)}>Update Category</button>}
      {isEditing && <button onClick={handleSaveCategory}>Update</button>}
    </div>
  );
};

export default Cards;
