import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new sqlite3.Database("./books.sqlite");

const fakeBooks = [
  {
    title: "Art of War",
    author: "Sun Tzu",
    mlCategory: "Art",
    usrCategory: "Art",
    description: "Classic military strategy book",
    mlScore: [0.1, 0.1, -0.3, 0.5, -0.1, 0.5, 0.1, 0.9, 0.2],
  },
  {
    title: "Business 101",
    author: "John Doe",
    mlCategory: "Business/Finance",
    usrCategory: "Business/Finance",
    description: "Basics of business",
    mlScore: [0.1, 0.1, 0.3, 0.2, 0.9, 0.2, 0.4, 0.1, 0.2],
  },
  {
    title: "The Fantasy Tale",
    author: "Jane Smith",
    mlCategory: "Fantasy/Science Fiction",
    usrCategory: "Fantasy/Science Fiction",
    description: "Epic fantasy story",
    mlScore: [0.2, 0.1, 0.3, -0.2, -0.1, 0.8, -0.1, 0.1, -0.2],
  },
  {
    title: "Romantic Stories",
    author: "Author X",
    mlCategory: "Romance",
    usrCategory: "Romance",
    description: "Love and relationships",
    mlScore: [0.7, 0.1, -0.3, 0.2, -0.1, 0.5, 0.1, 0.1, 0.2],
  },
];

db.serialize(() => {
  // Drop table if you want to reset DB
  db.run("DROP TABLE IF EXISTS books");

  db.run(`CREATE TABLE books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    mlCategory TEXT,
    usrCategory TEXT,
    description TEXT,
    mlScore TEXT
  )`);

  const stmt = db.prepare(
    `INSERT INTO books (id, title, author, mlCategory, usrCategory, description, mlScore) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  fakeBooks.forEach((book) => {
    stmt.run(
      uuidv4(),
      book.title,
      book.author,
      book.mlCategory,
      book.usrCategory,
      book.description,
      JSON.stringify(book.mlScore) // store as JSON string
    );
  });

  stmt.finalize();
});

db.close(() => {
  console.log("Database seeded successfully!");
});
