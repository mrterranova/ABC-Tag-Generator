import express from "express";
import cors from "cors";
import { openDB } from "./db.js";

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
// POST
app.post("/books", async (req, res) => {
  try {
    const db = await openDB(); // <-- get database connection
    const { id, title, author, mlCategory, usrCategory, description, mlScores } = req.body;

    if (!id || !title || !author || !mlCategory) {
      return res.status(400).json({ message: "id, title, author, and mlCategory are required" });
    }

    await db.run(
      `
      INSERT INTO books (id, title, author, mlCategory, usrCategory, description, mlScore)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      title,
      author,
      mlCategory,
      usrCategory || null,
      description || null,
      mlScores || null
    );

    res.status(201).json({ message: "Book added successfully!" });
  } catch (err) {
    console.error("Error inserting book:", err);
    res.status(500).json({ message: err.message });
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




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
