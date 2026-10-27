# WeatherHub

A weather dashboard with a separated frontend and Flask backend.

## Project structure

```text
weatherhub-separated/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── styles.css
│   │   └── app.js
│   └── README.md
└── README.md
```

## Requirements

- Python 3.10+
- A modern browser
- An OpenWeather API key for live weather data

## 1. Configure the backend

Open a terminal in `backend/`:

**Windows PowerShell**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and add your own API key. Never commit `.env`.

Start the API:

```powershell
python run.py
```

The API runs at `http://127.0.0.1:5000`.

## 2. Start the frontend

With the backend running, open another terminal at `frontend/` and run:

```powershell
python -m http.server 5500
```

Open `http://127.0.0.1:5500`.

The frontend uses `http://127.0.0.1:5000` as its API base by default. You can change `API_BASE` at the top of `frontend/assets/app.js` if needed.

## API endpoints

- `GET /api/health`
- `GET /api/weather/current?city=Vijayawada&country=IN`
- `GET /api/weather/forecast?city=Vijayawada&country=IN`

## Notes

- Favourite cities and theme preference are stored in the browser's local storage.
- Weather is retrieved live from OpenWeather; API key activation, quota, and network availability affect results.
- The current forecast cards use daily summaries derived from OpenWeather's 3-hour forecast feed.
