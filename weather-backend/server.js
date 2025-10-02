import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import db from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

console.log("🚀 Server starting up...");

// Normalize city name: lowercase and remove trailing " city"
const normalizeCity = (city) => {
  return city.toLowerCase().replace(/\s+city$/, '');
};

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

console.log("📝 Setting up routes...");

// Test database connection
try {
  const { data, error } = await db.from('history').select('id').limit(1);
  if (error) throw error;
  console.log("✅ Database connection successful");
} catch (dbErr) {
  console.error("❌ Database connection failed:", dbErr);
}

// Add history
app.post("/history", async (req, res) => {
  const { city, description } = req.body;
  if (!city) return res.status(400).json({ error: "City required" });

  try {
    const { error } = await db.from('history').insert([{ city, weather_description: description || "" }]);
    if (error) throw error;
    res.status(201).json({ message: "Added to history" });
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    res.status(500).json({ error: "Failed to add history" });
  }
});


// Get history
app.get("/history", async (req, res) => {
  try {
    const { data, error } = await db.from('history').select('*').order('searched_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Delete history
app.delete("/history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await db.from('history').delete().eq('id', id);
    if (error) throw error;
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
    const { data, error } = await db.from('notes').select('*').order('city').order('created_at', { ascending: false });
    if (error) throw error;
    console.log("Fetched notes:", data.length);
    res.json({ notes: data });
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
    const { data, error } = await db.from('notes').select('*').ilike('city', city).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ notes: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Add note for city
app.post("/notes", async (req, res) => {
  const { city, note } = req.body;
  try {
    const { error } = await db.from('notes').insert([{ city, note }]);
    if (error) throw error;
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
    const { error } = await db.from('notes').update({ note }).eq('id', id);
    if (error) throw error;
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
    const { error } = await db.from('notes').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Upload image for note
app.post("/notes/:noteId/images", upload.single('image'), async (req, res) => {
  const { noteId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    // Upload to Supabase storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await db.storage
      .from('city-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = db.storage
      .from('city-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Save to database
    const { error: dbError } = await db.from('note_images').insert([{
      note_id: noteId,
      image_url: imageUrl,
    }]);

    if (dbError) throw dbError;

    res.json({ message: "Image uploaded", imageUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Get images for note
app.get("/notes/:noteId/images", async (req, res) => {
  const { noteId } = req.params;
  try {
    const { data, error } = await db.from('note_images').select('*').eq('note_id', noteId).order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json({ images: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Delete image
app.delete("/images/:imageId", async (req, res) => {
  const { imageId } = req.params;
  try {
    // Get image URL first
    const { data: imageData, error: fetchError } = await db.from('note_images').select('image_url').eq('id', imageId).single();
    if (fetchError) throw fetchError;

    // Delete from storage
    const fileName = imageData.image_url.split('/').pop();
    const { error: storageError } = await db.storage
      .from('city-images')
      .remove([fileName]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await db.from('note_images').delete().eq('id', imageId);
    if (dbError) throw dbError;

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// Upload city photo
app.post("/cities/:city/photos", upload.single('photo'), async (req, res) => {
  const { city } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No photo file provided" });
  }

  try {
    // Upload to Supabase storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await db.storage
      .from('city-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = db.storage
      .from('city-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Save to database
    const { error: dbError } = await db.from('city_photos').insert([{
      city: city,
      image_url: imageUrl,
    }]);

    if (dbError) throw dbError;

    res.json({ message: "Photo uploaded", imageUrl });
  } catch (err) {
    console.error("Error uploading photo:", err);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

// Get photos for city
app.get("/cities/:city/photos", async (req, res) => {
  const { city } = req.params;
  try {
    const { data, error } = await db.from('city_photos').select('*').ilike('city', city).order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json({ photos: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// Delete city photo
app.delete("/photos/:photoId", async (req, res) => {
  const { photoId } = req.params;
  try {
    // Get photo URL first
    const { data: photoData, error: fetchError } = await db.from('city_photos').select('image_url').eq('id', photoId).single();
    if (fetchError) throw fetchError;

    // Delete from storage
    const fileName = photoData.image_url.split('/').pop();
    const { error: storageError } = await db.storage
      .from('city-images')
      .remove([fileName]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await db.from('city_photos').delete().eq('id', photoId);
    if (dbError) throw dbError;

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
