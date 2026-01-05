import express from "express";
import cors from "cors";
import { openDB } from "./db.js";
import fetch from "node-fetch";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

    // Convert mlScore from string to array
    const booksWithScores = books.map(book => ({
      ...book,
      mlScore: book.mlScore ? JSON.parse(book.mlScore) : [],
    }));

    res.json(booksWithScores);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST
app.post("/books", async (req, res) => {
  try {
    const db = await openDB();

    const {
      id,
      title,
      author,
      usrCategory,
      description
    } = req.body;

    if (!id || !title || !author || !description) {
      return res.status(400).json({
        message: "id, title, author, and description are required"
      });
    }

    // 🔮 Call ML service
    const mlResult = await predictWithML({
      title,
      author,
      description
    });

    const mlCategory = mlResult.genre;
    const mlScores = mlResult.scores
      ? JSON.stringify(mlResult.scores)
      : null;

    await db.run(
      `
      INSERT INTO books (
        id,
        title,
        author,
        mlCategory,
        usrCategory,
        description,
        mlScore
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      title,
      author,
      mlCategory,
      usrCategory || null,
      description,
      mlScores
    );

    res.status(201).json({
      message: "Book added successfully",
      mlCategory
    });

  } catch (err) {
    console.error("Error inserting book:", err);
    res.status(500).json({ message: "Failed to add book" });
  }
});

// UPDATE
app.patch("/books/:id/category", async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const db = await openDB();
    await db.run(
      `UPDATE books SET usrCategory = ? WHERE id = ?`,
      category,
      id
    );

    const updatedBook = await db.get(`SELECT * FROM books WHERE id = ?`, id);

    res.json(updatedBook);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ML Prediction Function
async function predictWithML({ title, author, description }) {
  const response = await fetch(process.env.REACT_APP_ML_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      authors: author,
      description
    })
  });

  if (!response.ok) {
    throw new Error("ML service error");
  }

  return response.json(); // { genre, scores? }
}




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
