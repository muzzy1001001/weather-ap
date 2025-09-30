import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./index.css";

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
      await fetchWeather(city);

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
    <div className={`app ${bgClass}`}>
      {/* TOP LEFT - Weather Info */}
      <div className="top-left">
        {error ? (
          <>
            <h2>{error}</h2>
            <p className="tagline">Did you misspell it? Try again.</p>
          </>
        ) : weather ? (
          <>
            <div className="temp-row">
              <h1 className="temperature">{weather.temperature}</h1>
              <motion.img
                animate={{ scale: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
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

      {/* SEARCH HISTORY */}
      <div className="history">
        <h3>Search History</h3>
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              {item.city} - {new Date(item.searched_at).toLocaleString()}
              <button
                onClick={() => deleteHistory(item.id)}
                className="delete-btn"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
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
          {error || !forecast.length ? (
            // Show placeholders if no forecast
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
  );
}

export default App;
