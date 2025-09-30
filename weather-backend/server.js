import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

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

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
