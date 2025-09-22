# PS Chosen -25076 (AI-Based Farmer Query Support And Advisory System)

This README provides an overview of the project, including team details, relevant links, tasks completed, tech stack, key features, and steps to run the project locally.

## Team Details

**Team Name:** StarWeb

**Team Leader:** [@Arpan783808](https://github.com/Arpan783808)

**Team Members:**

- **MEMBER_1** - 2022UCM2341 - [@Arpan783808](https://github.com/Arpan783808)
- **MEMBER_2** - 2022UCM2327 - [@AlphaSimar](https://github.com/AlphaSimar)
- **MEMBER_3** - 2022UCM2320 - [@ananyak84](https://github.com/ananyak84)
- **MEMBER_4** - 2022UCM2348 - [@HemantGupta04](https://github.com/HemantGupta04)
- **MEMBER_5** - 2022UCM2386 - [@thisisaman408](https://github.com/thisisaman408)
- **MEMBER_6** - 2022UCM2318 - [@dhananjaysingh10](https://github.com/dhananjaysingh10)

### NOTE - To test the application, directly login using the credentials mentioned in the placeholder.
## Project Links

- **SIH Presentation:** [Final SIH Presentation](https://docs.google.com/presentation/d/1iwkoVMSm3qXhAQRaVnPnF1KQZeodOK3E/edit?usp=sharing&ouid=101763291021260312893&rtpof=true&sd=true)
- **Video Demonstration:** [Watch Video]
- **Live Deployment:** [View Deployment](https://ai-farmer-assistant-seven.vercel.app/)
- **Source Code:** [GitHub Repository](https://github.com/Arpan783808/AI-farmer-Assistant)
- **Additional Resources:** [Other Relevant Links](ANY OTHER RELEVANT LINKS)


# AI Farmer Assistant 🧑‍🌾

This is the central operational hub for the AI Farmer Assistant platform. This document provides the complete instructions for establishing a local development environment.
---

## I.Prerequisites

- **Git:** For version control..
- **Node.js:** `v18.x` or later.
- **Python:** `v3.9` or later.
- **`pip` & `venv`:** The standard Python package manager and virtual environment tool.

---

## II. Local Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Arpan783808/AI-farmer-Assistant.git  
```

### Step 2: Configure the Backend

#### A. The Node.js API Server (`node-server`)

This server handles user authentication, chat persistence, and acts as the primary gateway for the frontend.

1. **Navigate to the Server Directory.** Note the structure: the `package.json` is in `node-server`, but the entry point is in `node-server/server`.
   ```bash
   cd backend/node-server
   ```
2. **Install Dependencies.**
   ```bash
   npm install
   ```
3. **Configure Environment Variables.** This is a critical security step. You will create a local environment file.
   ```bash
   cd server
   cp .env.example .env
   ```
   Now, **you must open the newly created `.env` file** and populate it with your actual credentials for MongoDB, Firebase, etc.

#### B. The Python AI Agent (`ai-agent`)

This service contains the core intelligence: the LLM chains, transcription, and text-to-speech logic. It must be isolated in its own environment.

1. **Navigate to the Agent Directory.**
   ```bash
   cd backend/ai-agent  # Ensure you are in the correct directory from the project root
   ```
2. **Install Python Dependencies.**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables.** This service requires API keys for OpenAI and Google.
   ```bash
   cp .env.example .env
   ```
   **Open the `.env` file** and populate it with your API keys.

### Step 3: Configure the Frontend

The frontend is the user-facing React application.

1. **Navigate to the Frontend Directory.**
   ```bash
   cd frontend # Or your specific frontend directory name
   ```
2. **Install Dependencies.**
   ```bash
   npm install
   ```
3. **Configure Environment Variables.** The frontend needs to know the address of your local Node.js server.
   ```bash
   cp .env.example .env
   ```
   Open `.env` and ensure `VITE_API_BASE_URL` is correctly set to your local Node server's address (e.g., `http://localhost:10000`).

---

## III. The Command: Running the Application

To operate the application, you must launch all services concurrently.

1. **Start the Node.js API Server:**
   ```bash
   # In terminal 1, from the `backend/node-server/server` directory
   node index.js or nodemon index.js
   ```
2. **Start the Frontend Development Server:**
   ```bash
   # In terminal 2, from the `frontend` directory
   npm run dev
   ```
Once all services are running, you can access the application at the URL provided by the frontend development server (typically `http://localhost:5173`).

---

## IV. The Blueprint: Environment Variable Guide

### `backend/node-server/server/.env`

```env
PORT=10000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="generate_a_new_strong_secret_key_here"
MONGO_URI="your_mongodb_connection_string_here"
FIREBASE_SERVICE_ACCOUNT_KEY_PATH="./config/your-firebase-service-account-file.json"
FIREBASE_API_KEY="your_firebase_web_api_key_here"
FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain_here"
TWILIO_ACCOUNT_SID="your_twilio_account_sid_here"
TWILIO_AUTH_TOKEN="your_twilio_auth_token_here"
OPENAI_API_KEY="your_openai_api_key_here"
```

### `backend/ai-agent/.env`
```env
# --- Google AI ---
GOOGLE_API_KEY="your_google_ai_api_key_for_gemini_here"

# --- OpenAI (for Whisper) ---
OPENAI_API_KEY="your_openai_api_key"

```
### `frontend/.env`
```env
# --- API Configuration ---
VITE_API_BASE_URL="http://localhost:10000"

# --- Firebase Client SDK Configuration ---
VITE_FIRBASE_API_KEY="your_firebase_web_api_key_here"
VITE_FIRBASE_AUTH_DOMAIN="your_firebase_auth_domain_here"
VITE_FIRBASE_PROJECT_ID="your_firebase_project_id_here"
VITE_FIRBASE_STORAGE_BUCKET="your_firebase_storage_bucket_here"
VITE_FIRBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id_here"
VITE_FIRBASE_APP_ID="your_firebase_app_id_here"
VITE_FIRBASE_MEASUREMENT_ID="your_firebase_measurement_id_here"
```

### Login/signup
<img width="1469" height="913" alt="Screenshot 2025-09-21 at 8 17 19 PM" src="https://github.com/user-attachments/assets/668257d7-2c73-4e32-afae-07e48f17208b" />

### Landing Page
<img width="1463" height="894" alt="Screenshot 2025-09-21 at 9 18 40 PM" src="https://github.com/user-attachments/assets/ad34b69c-8e0a-4856-a214-aa5b575c1fe3" />

### Ask a simple query
<img width="1463" height="900" alt="Screenshot 2025-09-21 at 8 11 25 PM" src="https://github.com/user-attachments/assets/214c51c2-f004-48a0-8714-0cfbddcebadf" />

### Output with Audio
<img width="1459" height="905" alt="Screenshot 2025-09-21 at 8 12 06 PM" src="https://github.com/user-attachments/assets/ef9a30bf-15c6-4b7e-abec-c3c373c8c1df" />

### Ask a multimodal query 
<img width="1466" height="900" alt="Screenshot 2025-09-21 at 8 13 59 PM" src="https://github.com/user-attachments/assets/5dd30c3f-91ab-4de2-8918-548fda82be88" />

### Chat history
<img width="1470" height="912" alt="Screenshot 2025-09-21 at 9 24 53 PM" src="https://github.com/user-attachments/assets/a361deaa-d952-46c4-8f63-e4f1fcba117d" />

### User Profile
<img width="1470" height="922" alt="Screenshot 2025-09-22 at 2 30 42 PM" src="https://github.com/user-attachments/assets/499b79ce-9530-49cf-aa6b-109657781486" />

