import { useState, useEffect } from "react";
import "./index.css";

// Import your icons
import locationIcon from "./assets/location.png";
import sunnyIcon from "./assets/sunny.png";
import cloudyIcon from "./assets/cloudy.png";
import rainyIcon from "./assets/rainy.png";
import windyIcon from "./assets/windy.png";
import thunderIcon from "./assets/thunder.png";

function App() {
  const [city, setCity] = useState("Davao");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [input, setInput] = useState("");
  const [bgClass, setBgClass] = useState("default-bg");

  const API_URL = "https://goweather.herokuapp.com/weather/";

  // Weather icons mapping
  const getWeatherIcon = (desc = "") => {
    desc = desc.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return sunnyIcon;
    if (desc.includes("cloud")) return cloudyIcon;
    if (desc.includes("rain")) return rainyIcon;
    if (desc.includes("wind")) return windyIcon;
    if (desc.includes("thunder")) return thunderIcon;
    return cloudyIcon; // fallback
  };

  // Fetch weather
  const fetchWeather = async (cityName) => {
    try {
      const res = await fetch(`${API_URL}${cityName}`);
      const data = await res.json();
      setWeather(data);
      setForecast(data.forecast || []);

      // Dynamic background
      const desc = data.description?.toLowerCase() || "";
      if (desc.includes("sun") || desc.includes("clear")) {
        setBgClass("sunny-bg");
      } else if (desc.includes("rain")) {
        setBgClass("rainy-bg");
      } else if (desc.includes("cloud")) {
        setBgClass("cloudy-bg");
      } else {
        setBgClass("default-bg");
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  // Default load
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  // Date & Time
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

  return (
    <div className={`app ${bgClass}`}>
      {/* TOP LEFT */}
      <div className="top-left">
        {weather ? (
          <>
            <div className="temp-row">
                <h1 className="temperature">
                  {weather.temperature}
                </h1>
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

      {/* TOP RIGHT */}
      <div className="top-right">
        <div className="search-bar">
          <img src={locationIcon} alt="search location" className="search-icon" />
          <input
            type="text"
            placeholder="Search city..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setCity(input)}
          />
        </div>

        <div className="datetime">
          <p className="time">{dateTime.toLocaleTimeString()}</p>
          <p className="date">{formattedDate}</p>
        </div>

        <div className="forecast">
          {forecast.length > 0 ? (
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
          ) : (
            <p>No forecast available</p>
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
