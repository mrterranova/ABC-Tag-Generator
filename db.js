import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDB() {
  return open({
    filename: "./books.sqlite",
    driver: sqlite3.Database
  });
}

// Initialize table
async function init() {
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      mlCategory TEXT,
      usrCategory TEXT,
      description TEXT,
      mlScores TEXT
    );
  `);
}
init();
