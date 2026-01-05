import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// export an async function
export async function seed() {
  const dataDir = path.resolve("./data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const dbPath = path.join(dataDir, "books.sqlite");
  const db = new sqlite3.Database(dbPath);

  const fakeBooks = [
    {
      title: "Art of War",
      author: "Sun Tzu",
      mlCategory: "Art",
      usrCategory: "Art",
      description: "Classic military strategy book",
      mlScore: [0.1, 0.1, -0.3, 0.5, -0.1, 0.5, 0.1, 0.9, 0.2],
    },
    // ... other books
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
        book.usrCategory,
        book.description,
        JSON.stringify(book.mlScore)
      );
    });

    stmt.finalize();
  });

  db.close(() => {
    console.log("Database seeded successfully!");
  });
}
