# Alf — AWS Cloud Club PUP Chatbot

Alf Chatbot is an AI-powered  built for personal project by Me (Hanji). This is not a Official Platform or All data are fictional.  It helps students quickly find information about the organization: upcoming events, membership, departments, officer leads, and more , without having to message the officers directly.

---

## Preview

Full-page dark UI with a sidebar, typewriter hero animation, and real-time AI responses written in casual responds can be ask as tagalog, english or bisaya (Slight).

---

## Tech Stack
Frontend (React + Vite), Backend (FastAPI), AI Model (Groq API - LLaMA3)

---

## Features

- AI-powered responses using Groq API and LLaMA 3
- Custom personality prompt that makes Alf respond in Tagalog, English and Bisaya
- Letter-by-letter typing animation for bot replies
- Clickable links and bold text formatting inside chat responses
- Live typing indicator while waiting for a response
- Quickly find information about the organization

---

## Project Structure

```
AWS-chatbot/
├── backend/
│   ├── main.py            # FastAPI server and API routes
│   ├── org_info.py        # Organization data and Alf's personality prompt
│   ├── feedbacks.json     # Saved feedback submissions (auto-generated)
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
│   ├── public/
│   └── src/
│       ├── assets/
│       │   ├── Logo.png
│       │   └── Pfp.png
│       ├── chatbot.jsx    # Main chatbot component
│       ├── chatbot.css    # Styling
│       ├── App.jsx
│       └── main.jsx
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Python 3.10 or higher
- A Groq API key — available for free at https://console.groq.com

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/AWS-chatbot.git
cd AWS-chatbot
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the development server:

```bash
uvicorn main:app --port 8000 --reload
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| POST   | /chat        | Send a message and get a reply     |
| POST   | /feedback    | Submit a review or feedback        |
| GET    | /feedbacks   | Retrieve all submitted feedbacks   |

---

## Environment Variables

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| GROQ_API_KEY   | Your Groq API key from https://console.groq.com  |

Never commit your `.env` file. It is already included in `.gitignore`.


## License

This project is built for personal project not official paltform of AWS Cloud Club - PUP.
