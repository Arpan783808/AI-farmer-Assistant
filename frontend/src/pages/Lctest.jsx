// lctest.jsx
import React, { useState } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { app } from "../firebase.js";

export default function LCTest() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");

  const auth = getAuth(app);

  
  // Step 1: Setup invisible reCAPTCHA
function setupRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  }
}


  // Step 2: Send OTP
  async function sendOtp() {
    setupRecaptcha();
    try {
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(result);
      setMessage("✅ OTP sent (use test OTP if using test number)");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error sending OTP");
    }
  }

  // Step 3: Verify OTP
  async function verifyOtp() {
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken(true);

      setMessage("✅ OTP verified, sending to backend...");

      // Call backend
      const resp = await fetch("http://localhost:10000/api/v1/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await resp.json();
      console.log(data);

      setMessage("🎉 Backend verified, user created/logged in");
    } catch (err) {
      console.error(err);
      setMessage("❌ Invalid OTP");
    }
  }

  return (
    <div>
      <h1>Phone Auth Demo</h1>

      {/* Phone Input */}
      <div>
        <input
          placeholder="+91XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={sendOtp}>Send OTP</button>
      </div>

      {/* OTP Input */}
      {confirmationResult && (
        <div>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </div>
      )}

      {/* Recaptcha container */}
      <div id="recaptcha-container"></div>

      <p>{message}</p>
    </div>
  );
}
