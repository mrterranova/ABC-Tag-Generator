import express from "express";
import cors from "cors";
import { openDB } from "./data/database.js"; // openDB points to ./data/books.sqlite
import { seed } from "./seed.js";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed DB
try {
  await seed();
  console.log("Database seeded successfully!");
} catch (err) {
  console.error("Failed to seed database:", err);
}

// READ
app.get("/books", async (req, res) => {
  try {
    const db = await openDB();
    const { title, author, category } = req.query;

    let sql = "SELECT * FROM books WHERE 1=1";
    const params = [];

    if (title) {
      sql += " AND title LIKE ?";
      params.push(`%${title}%`);
    }
    if (author) {
      sql += " AND author LIKE ?";
      params.push(`%${author}%`);
    }
    if (category) {
      sql += " AND usrCategory = ?";
      params.push(category);
    }

    const books = await db.all(sql, params);
    res.json(
      books.map((b) => ({ ...b, mlScore: b.mlScore ? JSON.parse(b.mlScore) : [] }))
    );
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/books/:id", async (req, res) => {
  const db = await openDB();
  const { id } = req.params;
  const book = await db.get(`SELECT * FROM books WHERE id = ?`, id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  res.json({
    ...book,
    mlScore: book.mlScore ? JSON.parse(book.mlScore) : [],
    category:
      book.usrCategory && book.usrCategory.toLowerCase() !== "unknown"
        ? book.usrCategory
        : book.mlCategory || "Unknown",
  });
});

// POST
app.post("/books", async (req, res) => {
  const db = await openDB();

  try {
    const { id, title, author, usrCategory, description } = req.body;

    if (!id || !title || !author || !description) {
      return res.status(400).json({
        message: "id, title, author, and description are required"
      });
    }

    // Ensure mlScore column exists
    const columns = await db.all(`PRAGMA table_info(books)`);
    if (!columns.find(col => col.name === "mlScore")) {
      await db.run(`ALTER TABLE books ADD COLUMN mlScore TEXT`);
      console.log("Added missing mlScore column");
    }

    let mlCategory = "Unknown";
    let mlScore = []; // <- use mlScore everywhere

    // Call ML (server-side only)
    try {
      const mlResult = await predictWithML({ title, author, description });
      mlCategory = mlResult.genre || "Unknown";
      mlScore = Array.isArray(mlResult.mlScore) ? mlResult.mlScore.flat().map(n => Number(n) || 0) : [];
    } catch (mlErr) {
      console.error("ML prediction failed:", mlErr);
    }

    await db.run(
      `INSERT INTO books 
       (id, title, author, mlCategory, usrCategory, description, mlScore)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      title,
      author,
      mlCategory,
      usrCategory || null,
      description,
      JSON.stringify(mlScore)
    );

    res.status(200).json({
      message: "Book added successfully",
      id,
      title,
      author,
      mlCategory,
      usrCategory,
      description,
      mlScore
    });
  } catch (err) {
    console.error("Unexpected error adding book:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
});


// UPDATE
app.patch("/books/:id/category", async (req, res) => {
  try {
    const db = await openDB();
    const { id } = req.params;
    const { category } = req.body;

    if (!category) return res.status(400).json({ error: "Category required" });

    await db.run(`UPDATE books SET usrCategory=? WHERE id=?`, category, id);
    const updatedBook = await db.get(`SELECT * FROM books WHERE id=?`, id);

    res.json(updatedBook);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ML prediction
async function predictWithML({ title, author, description }) {

  console.log("[ML] Starting prediction for:", { title, author });
  console.log(process.env.BASE_ML_URL)

  const startResponse = await fetch(process.env.BASE_ML_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [title, author, description],
    }),
  });

  if (!startResponse.ok) {
    throw new Error("[ML] Failed to start prediction");
  }

  const { event_id } = await startResponse.json();
  console.log("[ML] Received event_id:", event_id);

  const resultResponse = await fetch(`${process.env.BASE_ML_URL}/${event_id}`);
  const text = await resultResponse.text();

  const dataLine = text.split("\n").find(line => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error("[ML] No data line found in response");
  }

  // Parse the JSON array after "data: "
  const [label, probabilities] = JSON.parse(dataLine.replace("data: ", ""));

  console.log("[ML] Predicted label:", label);
  console.log("[ML] Class probabilities:", probabilities);

  return {
    genre: label,
    mlScore: Array.isArray(probabilities) ? probabilities.flat().map(n => Number(n) || 0) : []
  };
}


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
