##  Tasks Accomplished

- [x] **User Authentication:** Developed a secure, phone-based, passwordless authentication and session management system.
- [x] **Dynamic User Profiles:** Built a persistent data model for user profiles, including critical geospatial and conversational data.
- [x] **Multimodal Chat Interface:** Developed an intuitive, responsive interface for seamless interaction with the AI via text, voice, and imagery.

---

##  Technology Stack

- **[React](https://react.dev/):** Utilized for the frontend to build a declarative, stateful, and component based user interface that is both complex and maintainable.
- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/):** Deployed as the backend runtime and framework to create a robust, scalable, and non blocking API server that orchestrates all services.
- **[MongoDB](https://www.mongodb.com/):** Chosen as the primary database for its flexible, document-based schema, which is ideally suited for storing complex, evolving data like user profiles and chat histories.
- **[Firebase](https://firebase.google.com/):** Leveraged for its Authentication service, providing a secure and scalable foundation for user identity management without reinventing the wheel.
- **[LangChain](https://www.langchain.com/):** Employed as the core framework in our AI agent to chain and orchestrate multiple AI components, transforming raw LLM outputs into structured, reliable data.
- **[Google Gemini](https://deepmind.google/technologies/gemini/):** Serves as the primary large language model, providing the core reasoning and response generation for agricultural queries.
- **[OpenAI Whisper](https://openai.com/research/whisper):** Integrated as the state-of-the-art speech-to-text engine, providing robust and accurate transcription for our voice-first user interface.



---

## Key Features

- **Secure Phone-Based Authentication:** A passwordless, OTP based login system that is both highly secure and accessible to users of all technical abilities.
- **Multimodal Conversational AI:** An advanced chat interface that accepts user input via text, voice, and images for comprehensive problem diagnosis.
- **Geospatial Profile Enrichment:** A GPS powered location capture system that ensures data accuracy for localized, context-aware agricultural advice.
- **Geospatially Targeted Broadcasts:** An admin level feature to push critical, region specific alerts from new policy updates to pest warnings directly to the farmers who need them most.
- **Multilingual Voice Interface:** A voice first design that includes transcription and text to speech capabilities, annihilating literacy and language barriers.
- **Persistent Chat History:** All conversations are securely saved and associated with a user's profile, creating a long-term record of advice and outcomes.


# AI Farmer Assistant Setup

This document provides the complete instructions for establishing this project in a local development environment.
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
   pip install -r requirements.txt #use pip3 for macos
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
<img width="1470" height="921" alt="Screenshot 2025-09-22 at 2 34 44 PM" src="https://github.com/user-attachments/assets/d930e3b4-67eb-48d8-8de9-54a61ad25d66" />

### User Profile
<img width="1470" height="931" alt="Screenshot 2025-09-22 at 7 56 11 PM" src="https://github.com/user-attachments/assets/c54dfc31-a030-4d11-acaf-748b4850f403" />
