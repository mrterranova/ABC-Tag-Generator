// src/api.ts

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; 
const ML_API_URL = process.env.REACT_APP_ML_API_URL || "http://127.0.0.1:7860/predict";

// Fetch books from backend
export async function fetchBooks(query: Record<string, string> = {}) {
  try {
    const params = new URLSearchParams(query).toString();
    const response = await fetch(`${BASE_URL}/books?${params}`);
    if (!response.ok) {
      console.error("Failed to fetch books:", response.statusText);
      return []; 
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching books:", err);
    return []; 
  }
}

// Fetch ML category and scores from ML API
export async function fetchMLCategory(
  title: string,
  authors: string,
  description: string
): Promise<{ genre: string; scores: number[] }> {
  try {
    const response = await fetch(ML_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, authors, description }),
    });

    console.log('your response!!!', response)

    if (!response.ok) {
      console.error("ML API error:", await response.text());
      return { genre: "Unknown", scores: [] };
    }
    const data = await response.json();
    return {
      genre: data.genre || "Unknown",
      scores: Array.isArray(data.scores) ? data.scores : [],
    };
  } catch (err) {
    console.error("Failed to fetch ML category:", err);
    return { genre: "Unknown", scores: [] };
  }
}
