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
      return res.status(400).json({ message: "id, title, author, and description are required" });
    }

    // Default values
    let mlCategory = "Unknown";
    let mlScores = "[]"; // always a JSON array string

    // Call ML service
    try {
      const mlResult = await predictWithML({ title, author, description });

      // Use scores only if returned properly
      mlCategory = mlResult.genre || "Unknown";
      mlScores = Array.isArray(mlResult.scores) ? JSON.stringify(mlResult.scores) : "[]";
    } catch (mlErr) {
      console.error("ML prediction failed:", mlErr);
      // Keep mlCategory = "Unknown" and mlScores = "[]"
    }

    // Insert into SQLite
    try {
      await db.run(
        `INSERT INTO books (id, title, author, mlCategory, usrCategory, description, mlScore)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, title, author, mlCategory, usrCategory || null, description, mlScores
      );
    } catch (dbErr) {
      console.error("SQLite insert failed:", dbErr);
      return res.status(500).json({ message: "Database insert failed", error: dbErr.message });
    }

    // Success
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
//   const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:5001/predict";

//   const response = await fetch(mlApiUrl, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ title, authors: author, description }),
//   });

//   const data = await response.json();
//   return data;
// }

// ML prediction with logs
async function predictWithML({ title, author, description }) {
  const baseUrl = process.env.ML_API_URL || "https://mterranova-roberta-book-genre-api.hf.space";
  console.log("ML API Base URL:", baseUrl);
  try {
    console.log("Sending request to ML API:", { title, author, description });

    // Step 1: POST to get event_id
    const postResponse = await fetch(`${baseUrl}/gradio_api/call/predict_gradio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [title, author, description] }),
    });

    const postData = await postResponse.json();
    console.log("POST response from ML API:", postData);

    if (!postData.event_id) throw new Error("No event_id returned from ML API");
    const eventId = postData.event_id;

    // Step 2: GET the result (retry until ready)
    let attempts = 0;
    let maxAttempts = 10;
    let waitTime = 1000; // ms
    let genre = "Unknown";
    let scores = [];

    while (attempts < maxAttempts) {
      attempts++;
      const getResponse = await fetch(`${baseUrl}/gradio_api/call/predict_gradio/${eventId}`);
      const text = await getResponse.text();

      try {
        const eventData = JSON.parse(text);
        if (eventData?.data?.length === 2) {
          [genre, scores] = eventData.data;
          console.log("Prediction received:", { genre, scores });
          break;
        }
      } catch {
        console.log(`Attempt ${attempts}: Prediction not ready yet, retrying in ${waitTime}ms...`);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    return { genre, scores };
  } catch (err) {
    console.error("ML prediction failed:", err);
    return { genre: "Unknown", scores: [] };
  }
}


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
