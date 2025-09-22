/// <reference types="vite/client" />

// Firebase reCAPTCHA global declarations
declare global {
  interface Window {
    grecaptcha: any;
  }
}
