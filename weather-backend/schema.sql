-- Weather App Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS weather_app;
USE weather_app;

-- History table for search history
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    weather_description TEXT,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table for city notes
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_history_city ON history(city);
CREATE INDEX idx_history_searched_at ON history(searched_at);
CREATE INDEX idx_notes_city ON notes(city);
CREATE INDEX idx_notes_created_at ON notes(created_at);