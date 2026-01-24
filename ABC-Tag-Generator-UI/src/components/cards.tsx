import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryDropdown from "../components/dropdown";
import { categoryLabels } from "../utils/constants";

interface Book {
  id: string;
  title: string;
  author: string;
  usrCategory?: string;
  mlCategory?: string;
  description?: string;
  mlScore?: number[];
}

interface CardsProps {
  book: Book;
  onUpdateBook: (book: Book) => void;
}

const Cards: React.FC<CardsProps> = ({ book, onUpdateBook }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // editable user category only
  const [usrCategory, setUsrCategory] = useState(book.usrCategory ?? "");

  // keep local state in sync with parent updates
  useEffect(() => {
    setUsrCategory(book.usrCategory ?? "");
  }, [book.usrCategory]);

  // display logic: validated user > ml > fallback
  const displayCategory = (() => {
    if (usrCategory && categoryLabels.includes(usrCategory.toLowerCase())) {
      return usrCategory;
    }
    if (book.mlCategory) {
      return book.mlCategory;
    }
    return "Uncategorized";
  })();

  const handleViewChart = () => {
    navigate("/chart", {
      state: {
        title: book.title,
        author: book.author,
        scores: book.mlScore,
        description: book.description,
        category: displayCategory,
        usrCategory: usrCategory || null,
        mlCategory: book.mlCategory,
      },
    });
  };

  const handleSaveCategory = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}books/${book.id}/category`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: usrCategory }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedBook = await response.json();

      setIsEditing(false);

      // update parent state (single source of truth)
      onUpdateBook({
        ...book,
        usrCategory: updatedBook.usrCategory ?? "",
        mlCategory: updatedBook.mlCategory,
      });
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  return (
    <div className="book-result-card">
      <p>
        <b>{book.title}</b> by <i>{book.author}</i>
      </p>

      {!isEditing && (
        <p>
          Categorized: <b>{displayCategory}</b>
        </p>
      )}

      {isEditing && (
        <CategoryDropdown
          value={usrCategory}
          onChange={setUsrCategory}
        />
      )}

      <button onClick={handleViewChart}>View Chart</button>

      {!isEditing && (
        <button onClick={() => setIsEditing(true)}>
          Update Category
        </button>
      )}

      {isEditing && (
        <button
          onClick={handleSaveCategory}
          disabled={usrCategory === (book.usrCategory ?? "")}
        >
          Save
        </button>
      )}
    </div>
  );
};

export default Cards;
