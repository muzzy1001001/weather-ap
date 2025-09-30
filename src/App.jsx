import { useState, useEffect } from "react";
import "./index.css";
import Switch from "./components/Switch";

// Import icons
import locationIcon from "./assets/location.png";
import sunnyIcon from "./assets/sunny.png";
import cloudyIcon from "./assets/cloudy.png";
import rainyIcon from "./assets/rainy.png";
import windyIcon from "./assets/windy.png";
import thunderIcon from "./assets/thunder.png";

// Fonts
import "@fontsource/inter";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

function App() {
  // ------------------ STATE ------------------
  const [city, setCity] = useState("Davao"); // default city
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

  const API_URL = "https://goweather.herokuapp.com/weather/";

  // ------------------ ICONS ------------------
  const getWeatherIcon = (desc = "") => {
    desc = desc.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return sunnyIcon;
    if (desc.includes("cloud")) return cloudyIcon;
    if (desc.includes("rain")) return rainyIcon;
    if (desc.includes("wind")) return windyIcon;
    if (desc.includes("thunder")) return thunderIcon;
    return cloudyIcon; // fallback
  };

  // ------------------ FETCH WEATHER ------------------
  const fetchWeather = async (cityName) => {
    try {
      const res = await fetch(`${API_URL}${cityName}`);
      const data = await res.json();

      if (!data.temperature) {
        setError("City does not exist");
        return;
      }

      setWeather(data);
      setForecast(data.forecast || []);

      // Update background based on description
      const desc = data.description?.toLowerCase() || "";
      if (desc.includes("sun") || desc.includes("clear")) setBgClass("sunny-bg");
      else if (desc.includes("rain")) setBgClass("rainy-bg");
      else if (desc.includes("cloud")) setBgClass("cloudy-bg");
      else setBgClass("default-bg");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Failed to fetch weather");
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

  // ------------------ LOAD WEATHER + HISTORY ------------------
  useEffect(() => {
    if (!city) return;
    const loadWeatherAndHistory = async () => {
      setLoadingMessage("Loading.....");
      await new Promise(resolve => setTimeout(resolve, 500)); // shorter loading delay

      setLoadingMessage("Fetching weather data....");
      await fetchWeather(city);
      setLoadingMessage(null);

      try {
        // Save to backend search history
        await fetch("http://localhost:5000/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });
        fetchHistory(); // refresh after saving
      } catch (err) {
        console.error("Error saving history:", err);
      }
    };

    loadWeatherAndHistory();
  }, [city]); // run when city changes

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

          {/* PLACE NOTES */}
          <section>
            <h3>Place Notes</h3>
            <p>Coming soon...</p>
          </section>

          {/* ABOUT DEVELOPER */}
          <section>
            <h3>About Developer</h3>
            <p>Coming soon...</p>
          </section>
        </div>
      </div>

      {/* RECENT SEARCHES POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Recent Searches</h2>
            {history.length > 0 ? (
              isClearing ? (
                <p style={{ textAlign: 'center', margin: '40px 0', color: '#666', fontStyle: 'italic' }}>
                  Clearing....<span className="loading-dots"></span>
                </p>
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
            <button className="close-btn" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="main" onClick={() => menuOpen && setMenuOpen(false)}>
        {/* MENU TOGGLE BUTTON */}
        {!menuOpen && (
          <button className="menu-toggle" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
            ☰
          </button>
        )}

        {/* THEME TOGGLE */}
        <div className="theme-toggle">
          <Switch checked={darkMode} onChange={(e) => {
            const newMode = e.target.checked;
            setDarkMode(newMode);
            localStorage.setItem('darkMode', JSON.stringify(newMode));
          }} />
        </div>

        {/* TOP LEFT - Weather Info */}
        <div className="top-left">
          {error ? (
            <>
              <h2>{error}</h2>
              <p className="tagline">Did you misspell it? Try again.</p>
            </>
          ) : loadingMessage ? (
            <h2 className="loading-text">{loadingMessage}<span className="loading-dots"></span></h2>
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
              <p className="location">
                <img src={locationIcon} alt="location" className="location-icon" />{" "}
                {city}
              </p>
            </>
          ) : (
            <p>Loading...</p>
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
              placeholder="Search city..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  const formatted = input
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ");
  
                  const cityName = formatted.endsWith("City") ? formatted : `${formatted} City`;
  
                  console.log("📤 Sending to backend:", cityName); // 👈 debug line
  
                  setError(null); // clear previous error
                  setCity(cityName);
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
              // Show loading placeholders
              [1, 2, 3].map((day) => (
                <div key={day} className="forecast-loading">
                  <p className="loading-text">Loading...</p>
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
