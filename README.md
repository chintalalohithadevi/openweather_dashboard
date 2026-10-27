# 🌦️ OpenWeather Dashboard

A responsive weather dashboard that allows users to check current weather conditions and forecasts for different cities.

## 🚀 Features

- Search for weather by city.
- View current weather conditions.
- View weather forecasts.
- Responsive frontend interface.
- Python Flask backend with REST API endpoints.
- Frontend and backend maintained separately.

## 🛠️ Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Python
- Flask
- Flask-CORS
- OpenWeather API

## 📁 Project Structure

```text
openweather_dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── assets/
│   │   ├── app.js
│   │   └── styles.css
│   ├── index.html
│   └── README.md
├── .gitignore
└── README.md
```

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/chintalalohithadevi/openweather_dashboard.git
cd openweather_dashboard
```

### 2. Create a Python virtual environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 4. Configure the API key

Create a `.env` file inside the `backend` directory using `.env.example` as a guide.

Add your own OpenWeather API key:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
DEFAULT_CITY=Vijayawada
```

Never commit your real `.env` file or publish your API key.

### 5. Start the backend

From the `backend` directory, run:

```powershell
python run.py
```

The backend should be available at:

`http://127.0.0.1:5000`

### 6. Start the frontend

Open a second terminal at the project root and run:

```powershell
cd frontend
python -m http.server 5500
```

Open this URL in your browser:

`http://127.0.0.1:5500`

## 🔌 Backend API Endpoints

| Endpoint                                | Purpose                   |
| --------------------------------------- | ------------------------- |
| `/api/health`                           | Check backend health      |
| `/api/weather/current?city=Vijayawada`  | Retrieve current weather  |
| `/api/weather/forecast?city=Vijayawada` | Retrieve weather forecast |

## 🔐 Security

- Store your API key in `backend/.env`.
- Keep `.env` excluded from Git.
- Use environment variables for secrets.
- Do not publish private credentials.

## 👨‍💻 Author

**Chintala Lohitha Devi**

GitHub: [chintalalohithadevi](https://github.com/chintalalohithadevi)

## 📄 License

Add a license if you want others to reuse or contribute to this project.
