import express from "express";
import cors from "cors";
import { openDB } from "./data/database.js"; // openDB points to ./data/books.sqlite
import { seed } from "./seed.js";
import fetch from "node-fetch";

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

    // Ensure 'mlScore' column exists
    const columns = await db.all(`PRAGMA table_info(books)`);
    if (!columns.find(col => col.name === "mlScore")) {
      await db.run(`ALTER TABLE books ADD COLUMN mlScore TEXT`);
      console.log("Added missing 'mlScore' column to books table.");
    }

    // Default ML values
    let mlCategory = "Unknown";
    let mlScores = "[]";

    // Call ML service
    try {
      const mlResult = await predictWithML({ title, author, description });

      mlCategory = mlResult.genre || "Unknown";
      mlScores = Array.isArray(mlResult.scores) ? JSON.stringify(mlResult.scores) : "[]";
    } catch (mlErr) {
      console.error("ML prediction failed:", mlErr);
      // Keep defaults
    }

    // Insert into SQLite
    try {
      await db.run(
        `INSERT INTO books 
         (id, title, author, mlCategory, usrCategory, description, mlScore)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, title, author, mlCategory, usrCategory || null, description, mlScores
      );
    } catch (dbErr) {
      console.error("SQLite insert failed:", dbErr);
      return res.status(500).json({ message: "Database insert failed", error: dbErr.message });
    }

    res.status(200).json({ message: "Book added successfully", mlCategory, mlScores });
  } catch (err) {
    console.error("Unexpected error adding book:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
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
// async function predictWithML({ title, author, description }) {
//   const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:7860/predict";

//   const response = await fetch(mlApiUrl, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ title, authors: author, description }),
//   });

//   const data = await response.json();
//   return data;
// }

// ML prediction (Gradio API) with logs
// ML prediction (Gradio API) with streaming logs
// ML prediction (Gradio API) with proper SSE parsing
// ML prediction (Gradio API – final form)
async function predictWithML({ title, author, description }) {
  const baseUrl =
    "https://mterranova-roberta-book-genre-api.hf.space/gradio_api/call/predict_gradio";

  console.log("[ML] Starting prediction for:", { title, author });

  // STEP 1: Start prediction
  const startResponse = await fetch(baseUrl, {
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

  // STEP 2: Fetch final result (SSE text)
  const resultResponse = await fetch(`${baseUrl}/${event_id}`);
  const text = await resultResponse.text();

  // Extract the line starting with "data:"
  const dataLine = text
    .split("\n")
    .find(line => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error("[ML] No data line found in response");
  }

  // Parse the JSON array after "data: "
  const [label, probabilities] = JSON.parse(
    dataLine.replace("data: ", "")
  );

  console.log("[ML] Predicted label:", label);
  console.log("[ML] Class probabilities:", probabilities);

  return {
    mlCategory: label,
    scores: Math.max(...probabilities)
  };
}



// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
