const BASE_URL = "http://localhost:5000"; // Node API
const ML_URL = "http://localhost:5001";   // Flask ML API

export async function fetchBooks(query: Record<string, string> = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await fetch(`${BASE_URL}/books?${params}`);
  if (!response.ok) throw new Error("Failed to fetch books");
  return response.json();
}

export async function addBook(book: {
  id: string;
  title: string;
  author: string;
  mlCategory?: string;
  usrCategory?: string;
  description?: string;
  mlScores?: string;
}) {
  const response = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error("Failed to add book");
  return response.json();
}

export async function updateCategory(bookId: string, category: string) {
  const response = await fetch(`${BASE_URL}/books/${bookId}/category`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  if (!response.ok) throw new Error("Failed to update category");
  return response.json();
}

export async function fetchMLCategory(
  title: string,
  authors: string,
  description: string
): Promise<{ genre: string; scores: number[] }> {
  try {
    const response = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, authors, description }),
    });

    if (!response.ok) {
      console.error("ML API error:", await response.text());
      return { genre: "Unknown", scores: [] };
    }

    const data = await response.json();
    return {
      genre: data.genre || "Unknown",
      scores: data.scores || [],
    };
  } catch (err) {
    console.error("Failed to fetch ML category:", err);
    return { genre: "Unknown", scores: [] };
  }
}
