# WeatherHub – Live Weather Dashboard

A web-based weather application that provides current weather conditions and a five-day forecast for cities around the world.

## Live Demo
https://openweather-dashboard-1.onrender.com/

## Features
- Search for weather by city and country code
- View current temperature and weather conditions
- View a five-day weather forecast
- Save and manage favourite cities
- Switch between Celsius and Fahrenheit
- Toggle dark and light themes
- Responsive dashboard interface

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask, Flask-CORS
- **Weather Data:** OpenWeather API
- **Deployment:** Render
- **Version Control:** Git and GitHub

## Project Structure
```text
openweather_dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── requirements.txt
│   ├── run.py
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── index.html
│   ├── README.md
│   └── assets/
│       ├── app.js
│       └── styles.css
├── .gitignore
└── README.md
```

## Setup Instructions

1. Clone the repository:
   `git clone https://github.com/chintalalohithadevi/openweather_dashboard.git`

2. Install backend dependencies:
   `cd openweather_dashboard/backend`
   `pip install -r requirements.txt`

3. Create a `.env` file in the backend directory and configure your OpenWeather API key:
   `OPENWEATHER_API_KEY=your_openweather_api_key_here`

4. Start the backend:
   `python run.py`

5. In a separate terminal, serve the frontend:
   `cd frontend`
   `python -m http.server 5500`

6. Open `http://127.0.0.1:5500` in your browser.

## Security
Keep API keys private. Never commit your real `.env` file or API credentials to GitHub.

## Author
Developer | Python | Flask | Web Development
