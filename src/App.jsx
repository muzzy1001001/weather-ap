import { useState, useEffect } from "react";
import "./index.css";
import Switch from "./components/Switch";
import Loader from "./components/Loader";
import PhotoGallery from "./components/PhotoGallery";
import GalleryButton from "./components/GalleryButton";
import Pattern from "./components/Pattern";
import DeveloperCard from "./components/DeveloperCard";
import ProgressLoader from "./components/ProgressLoader";
import ForecastLoader from "./components/ForecastLoader";
import UploadLoader from "./components/UploadLoader";
import lacandulaImage from "./assets/lacandula.png";
import lopeImage from "./assets/lope.png";

// Import icons
import locationIcon from "./assets/location.png";
import sunnyIcon from "./assets/sunny.png";
import cloudyIcon from "./assets/cloudy.png";
import rainyIcon from "./assets/rainy.png";
import windyIcon from "./assets/windy.png";
import thunderIcon from "./assets/thunder.png";
import snowIcon from "./assets/snow.png";

// Fonts
import "@fontsource/inter";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

function App() {
   // ------------------ STATE ------------------
   const [city, setCity] = useState("Davao City"); // default city
  const [weather, setWeather] = useState(null); // current weather
  const [forecast, setForecast] = useState([]); // forecast array
  const [input, setInput] = useState(""); // search input
  const [bgClass, setBgClass] = useState("default-bg"); // dynamic background
  const [error, setError] = useState(null); // error state
  const [history, setHistory] = useState([]); // search history
  const [menuOpen, setMenuOpen] = useState(false); // 👈 for toggling sidebar
  const [showPopup, setShowPopup] = useState(false); // for recent searches popup
  const [loadingMessage, setLoadingMessage] = useState(null); // for loading steps
  const [isClearing, setIsClearing] = useState(false); // for clear animation
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  }); // for dark mode
  const [notes, setNotes] = useState([]); // for current city notes
  const [allNotes, setAllNotes] = useState([]); // for all notes across cities
  const [showNotePopup, setShowNotePopup] = useState(false); // for placed notes popup (view/edit/delete)
  const [showAddNotePopup, setShowAddNotePopup] = useState(false); // for add note popup
  const [newNote, setNewNote] = useState(""); // for new note input
  const [editingNoteId, setEditingNoteId] = useState(null); // for editing notes
  const [editNoteText, setEditNoteText] = useState(""); // for edit note text
  const [activeNoteId, setActiveNoteId] = useState(null); // for showing action buttons on clicked note
  const [noteImages, setNoteImages] = useState({}); // for images per note
  const [cityPhotos, setCityPhotos] = useState([]); // for current city photos
  const [showGalleryPopup, setShowGalleryPopup] = useState(false); // for gallery popup
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false); // for developer popup
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false); // for photo upload loading
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState([]); // for selected photo files
  const [uploadComplete, setUploadComplete] = useState(false); // for upload completion message

  const API_URL = "https://goweather.herokuapp.com/weather/";

  // ------------------ ICONS ------------------
  const getWeatherIcon = (desc = "") => {
    desc = desc.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return sunnyIcon;
    if (desc.includes("cloud")) return cloudyIcon;
    if (desc.includes("rain")) return rainyIcon;
    if (desc.includes("wind")) return windyIcon;
    if (desc.includes("thunder")) return thunderIcon;
    if (desc.includes("snow")) return snowIcon;
    return cloudyIcon; // fallback
  };

  // ------------------ FETCH WEATHER ------------------
  const fetchWeather = async (cityName) => {
    const tryFetch = async (name) => {
      const res = await fetch(`${API_URL}${encodeURIComponent(name)}`);
      const data = await res.json();
      return data;
    };

    try {
      let data = await tryFetch(cityName);

      // If no temperature, try without " City" suffix
      if (!data.temperature && cityName.toLowerCase().endsWith(" city")) {
        const altName = cityName.slice(0, -5).trim(); // Remove " City"
        data = await tryFetch(altName);
      }

      if (!data.temperature) {
        setError("Location does not exist");
        return null;
      }

      setWeather(data);
      setForecast(data.forecast || []);

      // Update background based on description
      const desc = data.description?.toLowerCase() || "";
      if (desc.includes("sun") || desc.includes("clear")) setBgClass("sunny-bg");
      else if (desc.includes("rain")) setBgClass("rainy-bg");
      else if (desc.includes("cloud")) setBgClass("cloudy-bg");
      else if (desc.includes("snow")) setBgClass("snowy-bg");
      else setBgClass("default-bg");

      return data; // Return weather data
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather");
      return null;
    }
  };

  // ------------------ FETCH HISTORY ------------------
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // ------------------ DELETE HISTORY ------------------
  const deleteHistory = async (id) => {
    try {
      await fetch(`http://localhost:5000/history/${id}`, { method: "DELETE" });
      fetchHistory(); // refresh list after delete
    } catch (err) {
      console.error("Error deleting history:", err);
    }
  };

  // ------------------ FETCH ALL NOTES ------------------
  const fetchAllNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/notes");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched all notes:", data.notes); // Debug log
      setAllNotes(data.notes || []);
    } catch (err) {
      console.error("Error fetching all notes:", err);
      setAllNotes([]);
    }
  };

  // ------------------ FETCH IMAGES FOR NOTES ------------------
  const fetchNoteImages = async (noteIds) => {
    const images = {};
    for (const noteId of noteIds) {
      try {
        const res = await fetch(`http://localhost:5000/notes/${noteId}/images`);
        const data = await res.json();
        images[noteId] = data.images || [];
      } catch (err) {
        console.error(`Error fetching images for note ${noteId}:`, err);
        images[noteId] = [];
      }
    }
    setNoteImages(images);
  };

  // ------------------ FETCH PHOTOS FOR CITY ------------------
  const fetchCityPhotos = async (cityName) => {
    try {
      const res = await fetch(`http://localhost:5000/cities/${encodeURIComponent(cityName)}/photos`);
      const data = await res.json();
      setCityPhotos(data.photos || []);
    } catch (err) {
      console.error(`Error fetching photos for city ${cityName}:`, err);
      setCityPhotos([]);
    }
  };

  // ------------------ LOAD WEATHER + HISTORY ------------------
  useEffect(() => {
    if (!city) return;
    const loadWeatherAndHistory = async () => {
      setLoadingMessage("Fetching weather data....");
      const weatherData = await fetchWeather(city);
      setLoadingMessage(null);

      // Fetch place notes
      try {
        const res = await fetch(`http://localhost:5000/notes/${city}`);
        const data = await res.json();
        const fetchedNotes = data.notes || [];
        setNotes(fetchedNotes);
        // Fetch images for these notes
        if (fetchedNotes.length > 0) {
          await fetchNoteImages(fetchedNotes.map(note => note.id));
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setNotes([]); // reset if fetch fails
      }

      // Fetch city photos
      await fetchCityPhotos(city);

      try {
        // Save to backend search history (skip default city on first load)
        if (city !== "Davao City" && weatherData) {
          await fetch("http://localhost:5000/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city, description: weatherData.description || "Weather data" }),
          });
          fetchHistory(); // refresh after saving
        }
      } catch (err) {
        console.error("Error saving history:", err);
      }
    };

    loadWeatherAndHistory();
  }, [city]); // run when city changes

  // ------------------ FETCH ALL NOTES AND HISTORY ON MOUNT ------------------
  useEffect(() => {
    fetchAllNotes();
    fetchHistory();
  }, []);

  // ------------------ DATE & TIME ------------------
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  

  // ------------------ RENDER ------------------
  return (

    <div className={`app ${bgClass} ${darkMode ? 'dark-mode' : ''}`} style={{ transition: 'all 0.3s ease' }}>
      {/* SIDEBAR */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="menu-content">
          <h2>Menu</h2>

          {/* RECENT SEARCHES */}
          <section onClick={() => setShowPopup(true)}>
            <h3>Recent Searches</h3>
          </section>


          {/* THE DEVELOPERS */}
          <section onClick={() => setShowDeveloperPopup(true)}>
            <h3>The Developers</h3>
            <p>Click to view</p>
          </section>

          {/* THEME TOGGLE */}
          <div className="theme-section">
            <div className="sidebar-theme-toggle">
              <Switch checked={darkMode} onChange={(e) => {
                const newMode = e.target.checked;
                setDarkMode(newMode);
                localStorage.setItem('darkMode', JSON.stringify(newMode));
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* RECENT SEARCHES POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-top" onClick={() => setShowPopup(false)}>×</button>
            <h2>Recent Searches</h2>
            {history.length > 0 ? (
              isClearing ? (
                <ProgressLoader />
              ) : (
                <>
                  <button
                    className="clear-btn-top"
                    onClick={async () => {
                      setIsClearing(true);
                      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 second animation
                      await Promise.all(
                        history.map((item) =>
                          fetch(`http://localhost:5000/history/${item.id}`, { method: "DELETE" })
                        )
                      );
                      fetchHistory();
                      setIsClearing(false);
                    }}
                  >
                    Clear All
                  </button>
                  <ul className="history-list">
                    {history.map((item) => (
                      <li key={item.id} onClick={() => { setCity(item.city); setShowPopup(false); }}>
                        <strong>{item.city}</strong> <br />
                        {new Date(item.searched_at).toLocaleDateString()} -{" "}
                        {new Date(item.searched_at).toLocaleTimeString()} <br />
                        <em>{item.weather_description || "No description"}</em>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHistory(item.id); }}
                          className="delete-btn"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )
            ) : (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No recent searches</p>
            )}
          </div>
        </div>
      )}

      {/* GALLERY POPUP */}
      {showGalleryPopup && (
        <div className="popup-overlay">
          <div className="popup-content gallery-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-top" onClick={() => setShowGalleryPopup(false)}>×</button>
            <h2>Photo Gallery - {city}</h2>
            <PhotoGallery
              photos={cityPhotos}
              onDelete={async (photoId) => {
                try {
                  await fetch(`http://localhost:5000/photos/${photoId}`, { method: 'DELETE' });
                  await fetchCityPhotos(city);
                } catch (err) {
                  console.error('Error deleting photo:', err);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* DEVELOPER POPUP */}
      {showDeveloperPopup && (
        <div className="popup-overlay">
          <div className="popup-content developer-popup" onClick={(e) => e.stopPropagation()}>
            <Pattern />
            <div style={{ position: 'relative', zIndex: 2, padding: '20px', color: 'white' }}>
              <button className="close-btn-top" onClick={() => setShowDeveloperPopup(false)}>×</button>
              <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>The Developers</h2>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                <DeveloperCard
                  name=""
                  role=""
                  description=""
                  bgImage={lacandulaImage}
                  cornerColor="#ff4757"
                  hoverText="Backend Developer"
                  cardName="Christian Elle Lacandula"
                />
                <DeveloperCard
                  name=""
                  role=""
                  description=""
                  bgImage={lopeImage}
                  cornerColor="#3742fa"
                  hoverText="Frontend Developer"
                  cardName="Rose Angelie Lope"
                />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'white', paddingTop: '80px' }}>
              <p>Built with React, Node.js, Express, and Supabase</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Thanks to the open-source community!</p>
            </div>
          </div>
        </div>
      )}

      {/* PLACED NOTES POPUP */}
      {showNotePopup && (
        <div className="popup-overlay">
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>All Placed Notes</h2>

            {/* All notes in a single list */}
            {allNotes.length > 0 ? (
              <div style={{ marginBottom: '20px' }}>
                {allNotes.map(note => (
                  <div key={note.id} style={{ marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    {editingNoteId === note.id ? (
                      <div>
                        <textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`http://localhost:5000/notes/${note.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ note: editNoteText }),
                                });
                                setEditingNoteId(null);
                                setEditNoteText("");
                                fetchAllNotes(); // Refresh all notes
                              } catch (err) {
                                console.error("Error updating note:", err);
                              }
                            }}
                            style={{ background: 'green', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditNoteText("");
                            }}
                            style={{ background: 'gray', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: '0 0 10px 0', lineHeight: '1.4' }}>{note.note}</p>
                        <small style={{ color: '#666', fontSize: '0.8rem' }}>
                          📍 {note.city} • {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                        </small>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditNoteText(note.note);
                            }}
                            style={{ background: 'blue', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`http://localhost:5000/notes/${note.id}`, { method: "DELETE" });
                                fetchAllNotes(); // Refresh all notes
                              } catch (err) {
                                console.error("Error deleting note:", err);
                              }
                            }}
                            style={{ background: 'red', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', margin: '40px 0' }}>
                No notes found. Use the "+ Note" button to add notes for different cities!
              </p>
            )}

            <button className="close-btn" onClick={() => { setShowNotePopup(false); setEditingNoteId(null); setEditNoteText(""); }}>Close</button>
          </div>
        </div>
      )}

      {/* ADD NOTE POPUP */}
      {showAddNotePopup && (
        <div className="popup-overlay">
          <div className="popup-content add-note-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Notes for {city}</h2>

            {/* Add New Note */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px', marginBottom: '15px', color: '#333' }}>
                Add New Note
              </h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note..."
                rows={4}
                style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="close-btn" onClick={() => { setShowAddNotePopup(false); setNewNote(""); setEditingNoteId(null); setEditNoteText(""); }}>Close</button>
              <button
                className="clear-btn"
                onClick={async () => {
                  if (!newNote.trim()) return;
                  try {
                    await fetch("http://localhost:5000/notes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ city, note: newNote }),
                    });
                    setNewNote("");
                    setShowAddNotePopup(false);
                    // Refresh notes
                    const res = await fetch(`http://localhost:5000/notes/${city}`);
                    const data = await res.json();
                    setNotes(data.notes || []);
                    fetchAllNotes(); // Also refresh all notes for sidebar
                  } catch (err) {
                    console.error("Error saving note:", err);
                  }
                }}
              >
                Add Note
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="main" onClick={(e) => {
        if (menuOpen) setMenuOpen(false);
        if (activeNoteId) setActiveNoteId(null);
      }}>
        {/* MENU TOGGLE BUTTON */}
        {!menuOpen && (
          <button className="menu-toggle" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
            ☰
          </button>
        )}

        {/* TOP LEFT - Weather Info */}
        <div className="top-left">
          {error ? (
            <>
              <h2>{error}</h2>
              <p className="tagline">Did you misspell it? Try again.</p>
            </>
          ) : loadingMessage ? (
            <Loader darkMode={darkMode} />
          ) : weather ? (
            <>
              <div className="temp-row">
                <h1 className="temperature">{weather.temperature}</h1>
                <img
                  src={getWeatherIcon(weather.description)}
                  alt="weather icon"
                  className="weather-icon"
                />
              </div>
              <h2>{city}</h2>
              <p>{weather.description}</p>
              <div className="location-and-note-row">
                <p className="location">
                  <img src={locationIcon} alt="location" className="location-icon" />{" "}
                  {city}
                </p>
                <div className="action-buttons">
                  <button className="add-note-btn" onClick={() => setShowAddNotePopup(true)}>+ Note</button>
                  <GalleryButton onClick={() => setShowGalleryPopup(true)} bgClass={bgClass} />
                </div>
              </div>

              {notes.length > 0 && (
                <div className="notes-row">
                  {notes.map(note => (
                    <div key={note.id} className="note-container">
                      <div className="note-chip">
                        <span
                          onClick={() => setActiveNoteId(activeNoteId === note.id ? null : note.id)}
                          style={{ cursor: 'pointer', display: 'block' }}
                        >
                          {note.note}
                        </span>
                        {activeNoteId === note.id && (
                          <div className="action-buttons">
                            <button
                              className="delete-btn"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this note?')) {
                                  try {
                                    await fetch(`http://localhost:5000/notes/${note.id}`, { method: "DELETE" });
                                    // Refresh notes
                                    const res = await fetch(`http://localhost:5000/notes/${city}`);
                                    const data = await res.json();
                                    setNotes(data.notes || []);
                                    fetchAllNotes(); // Also refresh all notes for sidebar
                                    setActiveNoteId(null);
                                  } catch (err) {
                                    console.error("Error deleting note:", err);
                                  }
                                }
                              }}
                              title="Delete note"
                            >
                              ×
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => {
                                // Simple inline edit: prompt for new text
                                const newText = prompt('Edit note:', note.note);
                                if (newText && newText.trim() && newText !== note.note) {
                                  // Update the note
                                  fetch(`http://localhost:5000/notes/${note.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ note: newText.trim() }),
                                  })
                                  .then(() => {
                                    // Refresh notes
                                    fetch(`http://localhost:5000/notes/${city}`)
                                      .then(res => res.json())
                                      .then(data => {
                                        setNotes(data.notes || []);
                                        fetchAllNotes();
                                        setActiveNoteId(null);
                                      });
                                  })
                                  .catch(err => console.error("Error updating note:", err));
                                }
                              }}
                              title="Edit note"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {/* CITY PHOTO UPLOAD - BOTTOM LEFT */}
          {weather && (
            <div className="city-photo-section">
              <p className="photo-prompt">Share photos of {city}</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={(e) => setSelectedPhotoFiles(Array.from(e.target.files))}
                className="photo-upload"
              />
              {(selectedPhotoFiles.length > 0 || isUploadingPhotos || uploadComplete) && (
                isUploadingPhotos ? (
                  <div className="upload-loader-container">
                    <UploadLoader />
                    <div className="uploading-text">Uploading</div>
                  </div>
                ) : uploadComplete ? (
                  <div className="upload-complete">Upload Complete</div>
                ) : (
                  <button
                    className="upload-photo-btn"
                    onClick={async () => {
                      if (selectedPhotoFiles.length > 0) {
                        setIsUploadingPhotos(true);
                        // Perform uploads
                        const uploadPromises = selectedPhotoFiles.map(async (file) => {
                          const formData = new FormData();
                          formData.append('photo', file);
                          try {
                            await fetch(`http://localhost:5000/cities/${encodeURIComponent(city)}/photos`, {
                              method: 'POST',
                              body: formData,
                            });
                          } catch (err) {
                            console.error('Error uploading photo:', err);
                          }
                        });
                        await Promise.all(uploadPromises);
                        // Refresh photos
                        await fetchCityPhotos(city);
                        setIsUploadingPhotos(false);
                        setUploadComplete(true);
                        setSelectedPhotoFiles([]);
                        // Reset input
                        const input = document.querySelector('.photo-upload');
                        if (input) input.value = '';
                        setTimeout(() => setUploadComplete(false), 2000);
                      }
                    }}
                  >
                    Upload Selected Photo
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* TOP RIGHT - Search + Forecast */}
        <div className="top-right">
          {/* Search Bar */}
          <div className="search-bar">
            <img
              src={locationIcon}
              alt="search location"
              className="search-icon"
            />
            <input
              type="text"
              placeholder="Search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  const formatted = input
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ");

                  console.log("📤 Sending to backend:", formatted); // 👈 debug line

                  setError(null); // clear previous error
                  setCity(formatted);
                  setInput("");
                }
              }}
            />
          </div>

          {/* Date & Time */}
          <div className="datetime">
            <p className="time">{dateTime.toLocaleTimeString()}</p>
            <p className="date">{formattedDate}</p>
          </div>

          {/* Forecast */}
          <div className="forecast">
            {loadingMessage ? (
              // Show loading spinners during fetch
              [1, 2, 3].map((day) => (
                <div key={day} className="forecast-card">
                  <ForecastLoader />
                </div>
              ))
            ) : error || !forecast.length ? (
              // Show error placeholders
              [1, 2, 3].map((day) => (
                <div key={day} className="forecast-card">
                  <p>Day {day}</p>
                  <p>--</p>
                  <p>--</p>
                </div>
              ))
            ) : (
              forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <p>Day {index + 1}</p>
                  <img
                    src={getWeatherIcon(day.temperature + " " + day.wind)}
                    alt="forecast"
                    className="forecast-icon"
                  />
                  <p>{day.temperature}</p>
                  <p>{day.wind}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM RIGHT */}
        <div className="bottom-right">
          Developed by Lacandula & Lope using{" "}
          <a
            href="https://github.com/robertoduessmann/weather-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            weather-api
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
