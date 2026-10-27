
from dotenv import load_dotenv

# Load environment variables before importing the Flask routes.
load_dotenv()

from app import create_app

app = create_app()


@app.route("/", methods=["GET"])
def index():
    return {
        "status": "success",
        "message": "Welcome to WeatherHub API",
        "endpoints": {
            "health": "/api/health",
            "current_weather": "/api/weather/current?city=Vijayawada&country=IN",
            "forecast": "/api/weather/forecast?city=Vijayawada&country=IN"
        }
    }, 200


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
