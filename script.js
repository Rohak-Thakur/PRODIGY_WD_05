const apiKey = "631599aa83ca59c2b8fb9ef71a05fba8"; // Replace with your key

async function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name.");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  await fetchWeather(url);
  await fetchForecast(city);
  await fetch5DayForecast(city);
}

async function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        fetchWeather(url);
      },
      () => {
        alert("Location access denied.");
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

function getIcon(condition) {
  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "images/images/clear.png";
  if (condition.includes("cloud")) return "images/images/clouds.png";
  if (condition.includes("rain")) return "images/images/rain.png";
  if (condition.includes("drizzle")) return "images/images/drizzle.png";
  if (
    condition.includes("thunderstorm") ||
    condition.includes("storm") ||
    condition.includes("thunderstorm with rain")
  )
    return "images/images/storm.png";
  if (condition.includes("snow")) return "images/images/snow.png";
  if (condition.includes("mist")) return "images/images/mist.png";
  if (condition.includes("haze")) return "images/images/haze.png";
  if (condition.includes("fog")) return "images/images/fog.png";
  return "images/default.jpg"; // fallback
}

async function fetchWeather(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    const condition = data.weather[0].main;
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = `${data.main.temp}°C`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind").textContent = `${data.wind.speed} km/h`;

    const iconPath = getIcon(condition);
    document.getElementById("weatherIcon").src = iconPath;
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();

    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = ""; // Clear old forecast

    for (let i = 0; i < 6; i++) {
      const forecast = data.list[i];
      const time = new Date(forecast.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const temp = Math.round(forecast.main.temp);
      const condition = forecast.weather[0].main;
      const icon = getIcon(condition);

      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
        <div>${time}</div>
        <img src="${icon}" alt="${condition}" />
        <div>${temp}°C</div>
      `;
      forecastContainer.appendChild(card);
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetch5DayForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();

    const dailyData = [];
    const usedDays = new Set();

    for (let item of data.list) {
      const dateTime = item.dt_txt; // e.g., "2025-06-25 12:00:00"
      const day = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (dateTime.includes("12:00:00") && !usedDays.has(day)) {
        usedDays.add(day);
        dailyData.push({
          day,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
        });
        if (dailyData.length === 5) break;
      }
    }

    console.log("5-day forecast data:", dailyData);
    render5DayForecast(dailyData);
  } catch (error) {
    console.error("Error fetching 5-day forecast:", error);
  }
}

function render5DayForecast(data) {
  const container = document.getElementById("weekly-forecast");
  container.innerHTML = "";

  data.forEach((item) => {
    const icon = getIcon(item.condition);
    const card = document.createElement("div");
    card.className = "weekly-card";
    card.innerHTML = `
      <div>${item.day}</div>
      <img src="${icon}" alt="${item.condition}" />
      <div>${item.temp}°C</div>
    `;
    container.appendChild(card);
  });
}
