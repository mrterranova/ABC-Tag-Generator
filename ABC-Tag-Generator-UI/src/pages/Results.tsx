import React from "react";
import Cards from "../components/cards";

interface Book {
  id: string;
  title: string;
  author: string;
  category?: string;
  description?: string;
  mlScore?: number[];
}

interface ResultsProps {
  books: Book[];
  onUpdateBook: (book: Book) => void;
}

const Results: React.FC<ResultsProps> = ({ books, onUpdateBook }) => {
  return (
    <div className="results-container">
      {books.map(book => (
        <Cards key={book.id} book={book} onUpdateBook={onUpdateBook} />
      ))}
    </div>
  );
};

export default Results;
