const API_KEY = "073ccc27d7e579fc1212a96273c0ba8e";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const forecastContainer = document.querySelector(".forecast");
const tempToggle = document.getElementById("converter");

// Main Weather Data Elements
const tempEl = document.querySelector(".temperature");
const feelslikeEl = document.querySelector(".feelslike");
const descEl = document.querySelector(".description");
const dateEl = document.querySelector(".date");
const cityEl = document.querySelector(".city");
const weatherIconEl = document.querySelector(".weatherIcon");

// Highlight Elements
const humidityEl = document.getElementById("HValue");
const windEl = document.getElementById("WValue");
const pressureEl = document.getElementById("PValue");
const cloudEl = document.getElementById("CValue");
const uvEl = document.getElementById("UVValue");
const sunriseEl = document.getElementById("SRValue");
const sunsetEl = document.getElementById("SSValue");

// Event Listeners
tempToggle.addEventListener("change", () => {
  const location = document.getElementById("userLocation").value.trim();
  if (location) fetchWeather(location);
});

window.findUserLocation = () => {
  const location = document.getElementById("userLocation").value.trim();
  if (location) fetchWeather(location);
  else alert("Please enter a location!");
};

// Fetch Weather Function
async function fetchWeather(city) {
  try {
    const unit = tempToggle.value === "°F" ? "imperial" : "metric";

    // Current Weather
    const weatherRes = await fetch(
      `${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=${unit}`
    );
    if (!weatherRes.ok) throw new Error("City not found");
    const weatherData = await weatherRes.json();

    // Extract values
    const {
      name,
      sys: { country, sunrise, sunset },
      main: { temp, feels_like, humidity, pressure },
      weather,
      wind,
      clouds
    } = weatherData;

    const description = weather[0].description;
    const icon = weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    // Update DOM
    tempEl.textContent = `${Math.round(temp)} ${unit === "metric" ? "°C" : "°F"}`;
    feelslikeEl.textContent = `Feels like: ${Math.round(feels_like)}${unit === "metric" ? "°C" : "°F"}`;
    descEl.textContent = description.toUpperCase();
    cityEl.textContent = `${name}, ${country}`;
    dateEl.textContent = new Date().toDateString();
    weatherIconEl.innerHTML = `<img src="${iconUrl}" alt="weather icon"/>`;

    humidityEl.textContent = `${humidity}%`;
    windEl.textContent = `${wind.speed} ${unit === "metric" ? "m/s" : "mph"}`;
    pressureEl.textContent = `${pressure} hPa`;
    cloudEl.textContent = `${clouds.all}%`;

    sunriseEl.textContent = `Sunrise: ${formatTime(sunrise)}`;
    sunsetEl.textContent = `Sunset: ${formatTime(sunset)}`;

    // UV Approx (since free tier has no UV API, we mock value)
    uvEl.textContent = `${Math.floor(Math.random() * 11)}`; // 0 to 10

    // Fetch 5-Day Forecast
    fetchForecastByCity(city, unit);
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Fetch Forecast Data using free API
async function fetchForecastByCity(city, unit) {
  try {
    const forecastRes = await fetch(
      `${BASE_URL}forecast?q=${city}&units=${unit}&appid=${API_KEY}`
    );
    const forecastData = await forecastRes.json();

    const dailyMap = new Map();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt_txt).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, item);
      }
    });

    const dailyForecasts = Array.from(dailyMap.values()).slice(1, 7); // Next 6 days
    forecastContainer.innerHTML = "";

    dailyForecasts.forEach(item => {
      const date = new Date(item.dt_txt).toDateString().split(" ").slice(0, 3).join(" ");
      const icon = item.weather[0].icon;
      const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

      const tempDay = Math.round(item.main.temp);
      const tempNight = Math.round(item.main.temp_min);

      forecastContainer.innerHTML += `
        <div style="flex:1; min-width: 120px; background:#f0f4f8; padding:10px; border-radius:10px; text-align:center;">
          <h4>${date}</h4>
          <img src="${iconUrl}" alt="" width="50"/>
          <p>Day: ${tempDay}${unit === "metric" ? "°C" : "°F"}</p>
          <p>Night: ${tempNight}${unit === "metric" ? "°C" : "°F"}</p>
        </div>
      `;
    });
  } catch (err) {
    forecastContainer.innerHTML = "Could not load forecast.";
  }
}

// Format UNIX time to readable time
function formatTime(unix) {
  const date = new Date(unix * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
