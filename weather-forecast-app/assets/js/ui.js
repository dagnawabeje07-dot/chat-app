import { getWeatherDescription, getWeatherIcon } from "./weather.js";

const statusMessage = document.querySelector("#statusMessage");
const locationForm = document.querySelector("#locationForm");
const locationSelect = document.querySelector("#locationSelect");
const weatherResults = document.querySelector("#weatherResults");
const forecastGrid = document.querySelector("#forecastGrid");
const searchButton = document.querySelector("#searchButton");
const searchButtonLabel = searchButton.querySelector("span");

function setStatus(message, state = "idle") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function setLoading(message) {
  setStatus(message, "loading");
  weatherResults.hidden = true;
  searchButton.disabled = true;
  searchButtonLabel.textContent = "Loading…";
}

function finishLoading() {
  searchButton.disabled = false;
  searchButtonLabel.textContent = "Search weather";
}

function showError(message) {
  finishLoading();
  weatherResults.hidden = true;
  locationForm.hidden = true;
  setStatus(message, "error");
}

function formatPlace(place) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function showLocationChoices(places) {
  locationSelect.replaceChildren();

  places.forEach((place, index) => {
    const option = document.createElement("option");
    const region = [place.admin1, place.country].filter(Boolean).join(", ");
    option.value = String(index);
    option.textContent = region ? `${place.name} — ${region}` : place.name;
    locationSelect.append(option);
  });

  locationForm.hidden = false;
  setStatus(`${places.length} places matched. Choose one to see its forecast.`);
}

function hideLocationChoices() {
  locationForm.hidden = true;
  locationSelect.replaceChildren();
}

function formatTemperature(value) {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}°C` : "—";
}

function formatDate(dateString, options) {
  if (typeof dateString !== "string") {
    return "Unavailable";
  }
  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : new Intl.DateTimeFormat(undefined, options).format(date);
}

function appendForecastCard(day, index) {
  const card = document.createElement("article");
  card.className = "forecast-card";

  const date = document.createElement("p");
  date.className = "forecast-day";
  date.textContent = index === 0
    ? "Today"
    : formatDate(day.date, { weekday: "short" });

  const icon = document.createElement("span");
  icon.className = "forecast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = getWeatherIcon(day.weatherCode);

  const condition = document.createElement("p");
  condition.className = "forecast-condition";
  condition.textContent = getWeatherDescription(day.weatherCode);

  const temperatures = document.createElement("p");
  temperatures.className = "forecast-temperatures";

  const high = document.createElement("span");
  high.textContent = formatTemperature(day.high);
  high.setAttribute("aria-label", `High ${high.textContent}`);

  const low = document.createElement("span");
  low.className = "forecast-low";
  low.textContent = formatTemperature(day.low);
  low.setAttribute("aria-label", `Low ${low.textContent}`);

  temperatures.append(high, low);

  const precipitation = document.createElement("p");
  precipitation.className = "precipitation";
  precipitation.textContent = typeof day.precipitation === "number" && Number.isFinite(day.precipitation)
    ? `☂ ${Math.round(day.precipitation)}% rain`
    : "Rain chance —";

  card.append(date, icon, condition, temperatures, precipitation);
  forecastGrid.append(card);
}

function renderForecast(place, forecast) {
  const current = forecast.current;
  const daily = forecast.daily;

  document.querySelector("#placeName").textContent = place.name;
  document.querySelector("#placeRegion").textContent = [place.admin1, place.country].filter(Boolean).join(", ");
  document.querySelector("#currentTemperature").textContent = formatTemperature(current.temperature_2m);
  document.querySelector("#currentIcon").textContent = getWeatherIcon(current.weather_code);
  document.querySelector("#currentCondition").textContent = getWeatherDescription(current.weather_code);
  document.querySelector("#feelsLike").textContent = formatTemperature(current.apparent_temperature);
  document.querySelector("#humidity").textContent = typeof current.relative_humidity_2m === "number"
    ? `${Math.round(current.relative_humidity_2m)}%`
    : "—";
  document.querySelector("#windSpeed").textContent = typeof current.wind_speed_10m === "number"
    ? `${Math.round(current.wind_speed_10m)} km/h`
    : "—";
  document.querySelector("#updatedLabel").textContent = typeof current.time === "string"
    ? `Updated ${current.time.replace("T", " ")}`
    : "";

  forecastGrid.replaceChildren();
  const dayCount = Math.min(daily.time.length, 5);
  for (let index = 0; index < dayCount; index += 1) {
    appendForecastCard({
      date: daily.time[index],
      weatherCode: daily.weather_code?.[index],
      high: daily.temperature_2m_max?.[index],
      low: daily.temperature_2m_min?.[index],
      precipitation: daily.precipitation_probability_max?.[index]
    }, index);
  }

  weatherResults.hidden = false;
  hideLocationChoices();
  finishLoading();
  setStatus(`Showing the forecast for ${formatPlace(place)}.`);
}

export {
  finishLoading,
  hideLocationChoices,
  renderForecast,
  setLoading,
  setStatus,
  showError,
  showLocationChoices
};
