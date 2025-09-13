# Frontend Setup Guide

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# Firebase Configuration
VITE_FIRBASE_API_KEY=your_api_key_here
VITE_FIRBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIRBASE_PROJECT_ID=your_project_id
VITE_FIRBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIRBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIRBASE_APP_ID=your_app_id
VITE_FIRBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
VITE_API_BASE_URL=http://localhost:10000
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication and Phone Authentication
4. Add your domain to authorized domains
5. Copy the configuration values to your `.env` file

## reCAPTCHA Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Phone authentication
3. Add your domain to the authorized domains list
4. The reCAPTCHA will work automatically with the invisible mode

## Running the Application

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- OTP-based authentication with Firebase
- reCAPTCHA verification for security
- Phone number verification
- Responsive design with Tailwind CSS
- React Router for navigation
- TypeScript support
