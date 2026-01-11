import { useState, useCallback } from "react";

export function useBookDescription() {
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDescription = useCallback(async (title: string, author: string) => {
    setLoading(true);
    setError(null);
    setDescription(null); // reset previous description

    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`
      );
      console.log(res)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (data.items && data.items.length > 0) {
        setDescription(data.items[0].volumeInfo.description || "No description found.");
      } else {
        setDescription("No description found.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching description.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { description, fetchDescription, loading, error };
}
