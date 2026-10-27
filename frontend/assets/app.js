const API_BASE = "http://127.0.0.1:5000";
const $ = (selector) => document.querySelector(selector);
const statusBox = $("#status");
let currentCity = "Vijayawada";
let currentCountry = "IN";
let favourites = JSON.parse(localStorage.getItem("weatherhub-favourites") || "null") || [
  { city: "Vijayawada", country: "IN" },
  { city: "Hyderabad", country: "IN" },
  { city: "Bengaluru", country: "IN" },
  { city: "New Delhi", country: "IN" },
  { city: "Mumbai", country: "IN" }
];
const worldCities = [
  { city: "New York", country: "US", label: "New York, US", photo: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=180&q=80" },
  { city: "London", country: "GB", label: "London, GB", photo: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=180&q=80" },
  { city: "Tokyo", country: "JP", label: "Tokyo, JP", photo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=180&q=80" },
  { city: "Sydney", country: "AU", label: "Sydney, AU", photo: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=180&q=80" }
];
const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon || "01d"}@2x.png`;
const round = (value) => Number.isFinite(Number(value)) ? Math.round(Number(value)) : "--";
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[char]));
function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.add("show");
  statusBox.classList.toggle("error", isError);
}
function clearStatus() { statusBox.classList.remove("show", "error"); }
async function api(path) {
  const response = await fetch(`${API_BASE}${path}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === "error") throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data;
}
function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(date);
}
function updateClock() {
  $("#clock").textContent = new Date().toLocaleString([], { weekday:"short", day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function renderCurrent(data) {
  currentCity = data.city || currentCity;
  currentCountry = data.country || currentCountry;
  $("#hero-city").textContent = `${currentCity}, ${currentCountry}`;
  $("#hero-location").textContent = `${currentCity}${currentCountry ? `, ${currentCountry}` : ""}`;
  $("#hero-date").textContent = formatDate(new Date());
  $("#temperature").textContent = Number(data.temperature_c).toFixed(1);
  $("#description").textContent = (data.description || "Unknown").replace(/\b\w/g, c => c.toUpperCase());
  $("#feels-like").textContent = `${Number(data.feels_like_c).toFixed(1)}°C`;
  $("#metric-feels").textContent = `${Number(data.feels_like_c).toFixed(1)}°C`;
  $("#metric-humidity").textContent = `${round(data.humidity_percent)}%`;
  $("#metric-wind").textContent = `${Number(data.wind_speed_mps || 0).toFixed(1)} m/s`;
  $("#metric-pressure").textContent = `${round(data.pressure_hpa)} hPa`;
  $("#metric-visibility").textContent = data.visibility_m == null ? "N/A" : `${(data.visibility_m / 1000).toFixed(1)} km`;
  $("#hero-icon").src = iconUrl(data.icon);
  $("#hero-icon").alt = data.description || "Weather";
}
function dailySummaries(entries) {
  const days = new Map();
  entries.forEach(entry => {
    const day = (entry.forecast_time_utc || "").slice(0, 10);
    if (!day) return;
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(entry);
  });
  return [...days.entries()].slice(0, 5).map(([date, items]) => {
    const temps = items.map(item => Number(item.temperature_c)).filter(Number.isFinite);
    const representative = items.reduce((best, item) => {
      const hour = Number((item.forecast_time_utc || "").slice(11, 13));
      const bestHour = Number((best.forecast_time_utc || "").slice(11, 13));
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? item : best;
    }, items[0]);
    return {
      date, high: temps.length ? Math.max(...temps) : null,
      low: temps.length ? Math.min(...temps) : null,
      description: representative.description, icon: representative.icon,
      rain: Math.max(...items.map(item => Number(item.precipitation_probability_percent || 0)))
    };
  });
}
function renderForecast(data) {
  const days = dailySummaries(data.forecast || []);
  $("#forecast-cards").innerHTML = days.map((day, index) => {
    const date = new Date(`${day.date}T12:00:00`);
    const weekday = index === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday:"short" });
    return `<article class="forecast-card">
      <strong>${safe(weekday)}</strong><span class="muted">${safe(date.toLocaleDateString(undefined,{day:"numeric",month:"short"}))}</span>
      <img src="${iconUrl(day.icon)}" alt="${safe(day.description)}">
      <div class="range">${round(day.high)}° <span class="low">/ ${round(day.low)}°</span></div>
      <p>${safe(day.description || "Forecast")}</p><div class="rain">💧 ${round(day.rain)}%</div>
    </article>`;
  }).join("") || '<p class="muted">No forecast data available.</p>';
}
function saveFavourites() {
  localStorage.setItem("weatherhub-favourites", JSON.stringify(favourites));
  renderFavourites();
}
async function renderFavourites() {
  const list = $("#favourites-list");
  list.innerHTML = "";
  for (const [index, item] of favourites.entries()) {
    const row = document.createElement("div");
    row.className = "city-row";
    row.innerHTML = `<img class="city-weather-icon" src="${iconUrl("01d")}" alt="">
      <div><div class="city-name">${safe(item.city)}</div><div class="city-sub">${safe(item.country)}</div></div>
      <img class="city-weather-icon actual-icon" src="${iconUrl("01d")}" alt="">
      <div><div class="city-temp">--°C</div><div class="city-sub">Loading…</div></div>
      <div class="city-actions"><button class="icon-button" title="Search city" aria-label="Search ${safe(item.city)}">↗</button><button class="icon-button delete" title="Remove favourite" aria-label="Remove ${safe(item.city)}">×</button></div>`;
    row.querySelector(".icon-button").addEventListener("click", () => searchCity(item.city, item.country));
    row.querySelector(".delete").addEventListener("click", () => {
      favourites = favourites.filter((_, i) => i !== index); saveFavourites();
    });
    list.appendChild(row);
    try {
      const data = await api(`/api/weather/current?city=${encodeURIComponent(item.city)}&country=${encodeURIComponent(item.country)}`);
      row.querySelector(".actual-icon").src = iconUrl(data.icon);
      row.querySelector(".city-temp").textContent = `${round(data.temperature_c)}°C`;
      row.querySelector(".city-sub:last-child")?.remove();
      row.querySelectorAll(".city-sub")[1].textContent = data.description;
      row.querySelector(".city-name").textContent = data.city;
    } catch (_) {
      row.querySelectorAll(".city-sub")[1].textContent = "Unavailable";
    }
  }
}
async function renderWorld() {
  const list = $("#world-list");
  list.innerHTML = "";
  for (const item of worldCities) {
    const row = document.createElement("div");
    row.className = "world-row";
    row.innerHTML = `<img src="${item.photo}" alt="${safe(item.city)}" loading="lazy">
      <div><div class="city-name">${safe(item.label)}</div><div class="city-sub">Live conditions</div></div>
      <img class="city-weather-icon" src="${iconUrl("01d")}" alt="">
      <div><div class="city-temp">--°C</div><div class="city-sub">Loading…</div></div><span>›</span>`;
    row.addEventListener("click", () => searchCity(item.city, item.country));
    row.style.cursor = "pointer";
    list.appendChild(row);
    try {
      const data = await api(`/api/weather/current?city=${encodeURIComponent(item.city)}&country=${encodeURIComponent(item.country)}`);
      row.querySelector(".city-weather-icon").src = iconUrl(data.icon);
      row.querySelector(".city-temp").textContent = `${round(data.temperature_c)}°C`;
      row.querySelectorAll(".city-sub")[1].textContent = data.description;
    } catch (_) {
      row.querySelectorAll(".city-sub")[1].textContent = "Unavailable";
    }
  }
}
async function searchCity(city, country = "IN") {
  $("#city-input").value = city;
  $("#country-input").value = country;
  showStatus(`Loading weather for ${city}…`);
  try {
    const query = `city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
    const [current, forecast] = await Promise.all([
      api(`/api/weather/current?${query}`), api(`/api/weather/forecast?${query}`)
    ]);
    renderCurrent(current);
    renderForecast(forecast);
    clearStatus();
    document.title = `WeatherHub — ${current.city}`;
  } catch (error) {
    showStatus(error.message || "Unable to load weather. Check that the backend is running.", true);
  }
}
$("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  searchCity($("#city-input").value.trim(), $("#country-input").value.trim().toUpperCase());
});
$("#add-favourite").addEventListener("click", () => {
  const city = prompt("Enter a city name to add to favourites:");
  if (!city || !city.trim()) return;
  const country = (prompt("Enter its 2-letter country code (for example IN):", "IN") || "IN").trim().toUpperCase();
  const exists = favourites.some(item => item.city.toLowerCase() === city.trim().toLowerCase() && item.country === country);
  if (exists) { showStatus("That city is already in your favourites."); return; }
  favourites.unshift({ city: city.trim(), country });
  saveFavourites();
});
$("#view-favourites").addEventListener("click", () => $("#favourites-section").scrollIntoView({ behavior:"smooth" }));
$("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("weatherhub-theme", document.body.classList.contains("light") ? "light" : "dark");
});
if (localStorage.getItem("weatherhub-theme") === "light") document.body.classList.add("light");
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  const target = {
    home: document.querySelector(".hero"),
    current: document.querySelector(".metrics"),
    forecast: $("#forecast-section"),
    favourites: $("#favourites-section"),
    about: $("#about-section")
  }[button.dataset.section];
  if (target) { target.scrollIntoView({ behavior:"smooth", block:"start" }); if (button.dataset.section === "about") $("#about-section").style.display = "block"; }
}));
updateClock();
setInterval(updateClock, 30000);
searchCity(currentCity, currentCountry);
renderFavourites();
renderWorld();
