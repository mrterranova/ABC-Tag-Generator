import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Categories for ML/User predictions
const categoryLabels = [
  "art",
  "business/finance",
  "fantasy/science fiction",
  "food",
  "history",
  "religion/spirituality",
  "romance",
  "science",
  "thriller",
];

// Utility: generate random ML score array summing roughly to 1
const generateMlScore = () => {
  const scores = Array.from({ length: categoryLabels.length }, () =>
    parseFloat((Math.random()).toFixed(2))
  );
  const sum = scores.reduce((a, b) => a + b, 0);
  return scores.map((s) => parseFloat((s / sum).toFixed(2)));
};

export async function seed() {
  const dataDir = path.resolve("./data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const dbPath = path.join(dataDir, "books.sqlite");
  const db = new sqlite3.Database(dbPath);

  const fakeBooks = [
    {
      title: "Art of War",
      author: "Sun Tzu",
      mlCategory: "history",
      usrCategory: "history",
      description: "Classic military strategy book from ancient China.",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      mlCategory: "romance",
      usrCategory: "romance",
      description: "A tragic story of love and wealth in the Jazz Age.",
    },
    {
      title: "Introduction to Quantum Physics",
      author: "David J. Griffiths",
      mlCategory: "science",
      description: "A university-level textbook on quantum mechanics.",
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      mlCategory: "fantasy/science fiction",
      usrCategory: "fantasy/science fiction",
      description: "Bilbo Baggins’ epic adventure in Middle-earth.",
    },
    {
      title: "The Joy of Cooking",
      author: "Irma S. Rombauer",
      mlCategory: "food",
      description: "A comprehensive cookbook for home cooks.",
    },
    {
      title: "The Bible",
      author: "Various",
      mlCategory: "religion/spirituality",
      description: "A foundational text of Christianity with spiritual teachings.",
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      mlCategory: "thriller",
      usrCategory: "thriller",
      description: "A fast-paced conspiracy thriller involving art and history.",
    },
    {
      title: "Principles of Economics",
      author: "N. Gregory Mankiw",
      mlCategory: "business/finance",
      description: "Widely used textbook introducing economic principles.",
    },
    {
      title: "The Story of Art",
      author: "E.H. Gombrich",
      mlCategory: "art",
      usrCategory: "art",
      description: "A visual history of art from prehistoric to modern times.",
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      mlCategory: "romance",
      description: "A classic novel of manners, love, and society in England.",
    },
  ];

  db.serialize(() => {
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
        book.usrCategory || null,
        book.description,
        JSON.stringify(generateMlScore())
      );
    });

    stmt.finalize();
  });

  db.close(() => {
    console.log("Database seeded successfully with realistic data!");
  });
}
