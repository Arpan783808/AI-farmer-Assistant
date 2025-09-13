import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
    grecaptcha: any;
  }
}

// This function needs to be accessible in the scope where you'll call it
const setupRecaptcha = () => {
  // Ensure you have a window.recaptchaVerifier instance to avoid re-rendering
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible", // Can be 'normal' or 'invisible'
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // In many cases, you can trigger OTP sending here.
        console.log("reCAPTCHA verified");
      },
    }
  );
};

export const sendOtp = async (phoneNumber: string) => {
  try {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    // The phone number must be in E.164 format (e.g., +919876543210)
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

    // SMS sent. Save the confirmation result to be used in the next step.
    window.confirmationResult = confirmationResult;
    console.log("OTP has been sent");
    return { confirmationResult, ok: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    // It's good practice to reset the reCAPTCHA on error
    if (window.grecaptcha && window.recaptchaVerifier) {
      window.grecaptcha.reset(window.recaptchaVerifier.widgetId);
    }
    throw error;
  }
};

export const verifyOtp = async (otp: string) => {
  try {
    if (!window.confirmationResult) {
      throw new Error(
        "Confirmation result not available. Please send OTP first."
      );
    }

    const result = await window.confirmationResult.confirm(otp);

    // User signed in successfully.
    const user = result.user;
    console.log("User verified successfully:", user);

    // Get the ID token
    const idToken = await user.getIdToken();
    console.log("Firebase ID Token:", idToken);

    // You can now send this token to your backend for verification
    return { user, idToken, ok: true };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    // Handle errors like auth/invalid-verification-code or auth/code-expired
    if (error.code === "auth/invalid-verification-code") {
      alert("Invalid OTP. Please try again.");
    }
    // Return null or throw the error to be handled by the caller
    return { ok: false };
  }
};
