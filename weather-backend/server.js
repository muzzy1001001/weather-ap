import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 Server starting up...");

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

console.log("📝 Setting up routes...");

// Test database connection
try {
  const testConnection = await db.query("SELECT 1");
  console.log("✅ Database connection successful");
} catch (dbErr) {
  console.error("❌ Database connection failed:", dbErr);
}

// Add history
app.post("/history", async (req, res) => {
  const { city, description } = req.body; // 👈 get both
  if (!city) return res.status(400).json({ error: "City required" });

  try {
    await db.query("INSERT INTO history (city, weather_description) VALUES (?, ?)", [city, description || ""]);
    res.status(201).json({ message: "Added to history" });
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    res.status(500).json({ error: "Failed to add history" });
  }
});


// Get history
app.get("/history", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM history ORDER BY searched_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Delete history
app.delete("/history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM history WHERE id = ?", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Get all notes
app.get("/notes", async (req, res) => {
  console.log("GET /notes endpoint hit");
  try {
    const [rows] = await db.query("SELECT * FROM notes ORDER BY city, created_at DESC");
    console.log("Fetched notes:", rows.length);
    res.json({ notes: rows });
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

console.log("📋 Notes routes registered");

// Get notes for city
app.get("/notes/:city", async (req, res) => {
  const { city } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM notes WHERE LOWER(city) = LOWER(?) ORDER BY created_at DESC", [city]);
    res.json({ notes: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Add note for city
app.post("/notes", async (req, res) => {
  const { city, note } = req.body;
  try {
    await db.query("INSERT INTO notes (city, note) VALUES (?, ?)", [city, note]);
    res.json({ message: "Note added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// Update note
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  try {
    await db.query("UPDATE notes SET note = ? WHERE id = ?", [note, id]);
    res.json({ message: "Note updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete note
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM notes WHERE id = ?", [id]);
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
