
import os
from datetime import datetime, timezone

import requests
from flask import Blueprint, jsonify, request

api = Blueprint("api", __name__, url_prefix="/api")

API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()

GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

PLACEHOLDER_KEYS = {
    "",
    "your_openweather_api_key_here",
    "replace_me",
}


def error(message, status):
    return jsonify({
        "status": "error",
        "message": message,
    }), status


def get_coordinates(city, country=""):
    query = f"{city},{country}" if country else city

    response = requests.get(
        GEO_URL,
        params={
            "q": query,
            "limit": 1,
            "appid": API_KEY,
        },
        timeout=10,
    )

    if response.status_code == 401:
        raise ValueError(
            "OpenWeather rejected the API key. "
            "Check the key and activation status."
        )

    if response.status_code == 429:
        raise RuntimeError("OpenWeather rate limit reached.")

    response.raise_for_status()

    locations = response.json()

    if not locations:
        return None

    return locations[0]["lat"], locations[0]["lon"]


def validate_city_args():
    city = request.args.get("city", "").strip()
    country = request.args.get("country", "").strip().upper()

    if not city:
        return None, None, error(
            "Please provide a city name.", 400
        )

    if len(city) > 100 or len(country) > 3:
        return None, None, error(
            "City or country value is too long.", 400
        )

    return city, country, None


def api_failure(exc):
    if isinstance(exc, requests.Timeout):
        return error(
            "The weather service took too long to respond.", 504
        )

    if isinstance(exc, requests.RequestException):
        return error(
            "Unable to connect to the weather service.", 502
        )

    if isinstance(exc, ValueError):
        return error(str(exc), 502)

    if isinstance(exc, RuntimeError):
        return error(str(exc), 503)

    return error(
        "Received an invalid response from the weather service.",
        502,
    )


def check_api_key():
    return API_KEY.lower() in PLACEHOLDER_KEYS


@api.get("/")
def api_home():
    return jsonify({
        "status": "success",
        "message": "Welcome to WeatherHub API",
        "endpoints": {
            "health": "/api/health",
            "current_weather":
                "/api/weather/current?city=Vijayawada&country=IN",
            "forecast":
                "/api/weather/forecast?city=Vijayawada&country=IN",
        },
    })


@api.get("/health")
def health():
    return jsonify({
        "status": "success",
        "message": "WeatherHub backend is running",
    })


@api.get("/weather/current")
def current_weather():
    if check_api_key():
        return error(
            "OpenWeather API key is not configured. "
            "Set OPENWEATHER_API_KEY in backend/.env.",
            500,
        )

    city, country, validation_error = validate_city_args()

    if validation_error:
        return validation_error

    try:
        coordinates = get_coordinates(city, country)

        if not coordinates:
            return error(
                "City not found. Please check the city name.", 404
            )

        lat, lon = coordinates

        response = requests.get(
            CURRENT_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": API_KEY,
                "units": "metric",
            },
            timeout=10,
        )

        if response.status_code == 401:
            return error(
                "OpenWeather rejected the API key. "
                "Check the key and activation status.",
                502,
            )

        if response.status_code == 429:
            return error("OpenWeather rate limit reached.", 503)

        response.raise_for_status()

        weather = response.json()
        main = weather["main"]
        condition = weather["weather"][0]
        wind = weather.get("wind", {})
        system = weather.get("sys", {})

        return jsonify({
            "status": "success",
            "data": {
                "city": weather.get("name", city),
                "country": system.get("country", country),
                "latitude": lat,
                "longitude": lon,
                "temperature_c": main.get("temp"),
                "feels_like_c": main.get("feels_like"),
                "minimum_temperature_c": main.get("temp_min"),
                "maximum_temperature_c": main.get("temp_max"),
                "humidity_percent": main.get("humidity"),
                "pressure_hpa": main.get("pressure"),
                "wind_speed_mps": wind.get("speed"),
                "visibility_m": weather.get("visibility"),
                "description": condition.get(
                    "description", "Unknown"
                ),
                "icon": condition.get("icon", "01d"),
                "sunrise": system.get("sunrise"),
                "sunset": system.get("sunset"),
                "observed_at": weather.get("dt"),
                "timezone_offset_seconds": weather.get(
                    "timezone", 0
                ),
            },
        })

    except Exception as exc:
        return api_failure(exc)


@api.get("/weather/forecast")
def weather_forecast():
    if check_api_key():
        return error(
            "OpenWeather API key is not configured. "
            "Set OPENWEATHER_API_KEY in backend/.env.",
            500,
        )

    city, country, validation_error = validate_city_args()

    if validation_error:
        return validation_error

    try:
        coordinates = get_coordinates(city, country)

        if not coordinates:
            return error(
                "City not found. Please check the city name.", 404
            )

        lat, lon = coordinates

        response = requests.get(
            FORECAST_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": API_KEY,
                "units": "metric",
            },
            timeout=10,
        )

        if response.status_code == 401:
            return error(
                "OpenWeather rejected the API key. "
                "Check the key and activation status.",
                502,
            )

        if response.status_code == 429:
            return error("OpenWeather rate limit reached.", 503)

        response.raise_for_status()

        payload = response.json()
        entries = []

        for item in payload.get("list", []):
            info = item.get("weather", [{}])[0]
            main = item.get("main", {})

            entries.append({
                "forecast_time_utc": item.get("dt_txt"),
                "temperature_c": main.get("temp"),
                "feels_like_c": main.get("feels_like"),
                "minimum_temperature_c": main.get("temp_min"),
                "maximum_temperature_c": main.get("temp_max"),
                "humidity_percent": main.get("humidity"),
                "description": info.get("description", "Unknown"),
                "icon": info.get("icon", "01d"),
                "wind_speed_mps": item.get(
                    "wind", {}
                ).get("speed"),
                "precipitation_probability_percent": round(
                    item.get("pop", 0) * 100
                ),
            })

        return jsonify({
            "status": "success",
            "data": {
                "city": payload.get(
                    "city", {}
                ).get("name", city),
                "country": payload.get(
                    "city", {}
                ).get("country", country),
                "timezone_offset_seconds": payload.get(
                    "city", {}
                ).get("timezone", 0),
                "forecast_count": len(entries),
                "forecast": entries,
            },
        })

    except Exception as exc:
        return api_failure(exc)
