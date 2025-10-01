-- Weather App Database Schema for Supabase (PostgreSQL)

-- History table for search history
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    weather_description TEXT,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table for city notes
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Images table for note images
CREATE TABLE IF NOT EXISTS note_images (
    id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- City photos table for city-specific photos
CREATE TABLE IF NOT EXISTS city_photos (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_history_city ON history(city);
CREATE INDEX IF NOT EXISTS idx_history_searched_at ON history(searched_at);
CREATE INDEX IF NOT EXISTS idx_notes_city ON notes(city);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_note_images_note_id ON note_images(note_id);
CREATE INDEX IF NOT EXISTS idx_city_photos_city ON city_photos(city);