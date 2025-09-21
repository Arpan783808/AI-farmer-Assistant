import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
// import { sendOtp, verifyOtp } from "../lib/auth_utils";
import { useNavigate } from "react-router-dom";
import { FarmLocationInput } from "./location";
import useDocumentTitle from "../hooks/UseDocumentTitle";
import { auth } from "../firebase"; // Ensure this path is correct
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Link } from "react-router-dom";
// We must explicitly tell TypeScript about the properties we are adding to the window object.
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

function Authentication() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState("");
  // OTP verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [userName, setuserName] = useState("User");
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

  const [loginData, setLoginData] = useState({
    phone: "",
  });
  useDocumentTitle("GetStarted - AIChatApp");
  const [signupData, setSignupData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    farmAddress: "",
    latitude: null as number | null,
    longitude: null as number | null,
    agreeToTerms: false,
    login: false,
    idToken: "",
  });

  const [resetPhone, setResetPhone] = useState("");
  const [resetSent, setResetSent] = useState(false);
  useEffect(() => {
    // 3. This guard clause is the core of the fix.
    // It ensures the code does not run until the ref is attached to the div.
    if (!recaptchaContainerRef.current) {
      return;
    }

    const verifier = new RecaptchaVerifier(
      auth,
      recaptchaContainerRef.current, // 4. Pass the ACTUAL DOM NODE, not a string ID.
      {
        size: "invisible",
        callback: (response: any) => {
          console.log("reCAPTCHA widget rendered and ready.");
        },
      }
    );

    window.recaptchaVerifier = verifier;

    // The cleanup function is critical for preventing memory leaks.
    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

  // --- OTP Logic ---
  const handleSendOtp = async (phone: string, e: FormEvent, login: boolean) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setError(null);
    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA verifier not initialized.");
      }
      // You can add a check here to see if the user exists if isLogin is true
      if (login) {
        const res = await fetch(`${API_BASE}/api/checkphone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Login failed: ${errorData.message}`);
        }
      }
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(
        err?.message || "Failed to send OTP. Check number and try again."
      );
      console.error(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log("User verified successfully:", user);
      const idToken = await user.getIdToken();
      console.log("Firebase ID Token:", idToken);
      setIdToken(idToken);
      setSignupData((prevData) => ({
        ...prevData,
        idToken: idToken,
      }));
      setPhoneVerified(true);
      setOtpSent(false); // Hide OTP form
      setOtp("");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error.code === "auth/invalid-verification-code") {
        alert("Invalid OTP. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  const resetVerification = () => {
    setPhoneVerified(false);
    setOtpSent(false);
    setOtp("");
    setVerifyingOtp(false);
    setError(null);
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      setError("Please verify your phone number first");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, username: "Tester", login: true }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Login failed: ${errorData.message}`);
      }

      const data = await res.json();
      // 1. Store the new username in a constant
      const newUsername = data.user.username;
      console.log(newUsername);
      // 2. Use the new constant for both operations
      setuserName(newUsername);
      localStorage.setItem("currentUser", JSON.stringify(data.user)); // <-- Use the new value directly
      localStorage.setItem("username", newUsername);
      navigate("/agent");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      setError("Please verify your phone number first");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Signup failed (${res.status})`);
      console.log(res);
      const newUsername = signupData.username; // <-- Use the value from your form data
      const data = await res.json();

      setuserName(newUsername);
      localStorage.setItem("currentUser", JSON.stringify(data.user)); // <-- Use the new value directly
      localStorage.setItem("username", newUsername);
      navigate("/agent");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    console.log("Reset password for:", resetPhone);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6)
      return { strength: 1, text: "Weak", color: "#ef4444" };
    if (password.length < 10)
      return { strength: 2, text: "Fair", color: "#f59e0b" };
    return { strength: 3, text: "Strong", color: "#22c55e" };
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  if (showForgotPassword) {
    if (resetSent) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-5 relative">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <div className="cursor-pointer w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center text-2xl shadow">
              🌱
            </div>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Left Panel - Image */}
            <div className="flex-1 relative bg-gradient-to-br from-green-500 to-blue-500 hidden md:block">
              <div className="relative w-full h-full">
                <img
                  src="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Farming"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 flex flex-col justify-between p-10 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-2xl">
                      🌱
                    </div>
                    <div>
                      <h1 className="text-xl font-bold mb-1">
                        AI Farmer Assistant
                      </h1>
                      <p className="text-sm opacity-90">
                        Smart Agriculture Solutions
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-gray-800 max-w-sm">
                    <h2 className="text-2xl font-bold mb-2 leading-tight">
                      Check Your Phone
                    </h2>
                    <p className="text-base opacity-80 leading-relaxed">
                      We've sent a reset code to your number
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Success Message */}
            <div className="flex-1 flex items-start justify-center p-10 bg-white overflow-y-auto">
              <div className="w-full max-w-sm">
                <div className="text-center py-10 px-5">
                  <div className="text-5xl mb-4">📱</div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Check Your Phone
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We've sent a password reset code to
                    <br />
                    <strong>{resetPhone}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Didn't receive the code? Check your messages or try again in
                    a few minutes.
                  </p>
                  <button
                    className="w-full py-3 px-4 bg-white text-green-500 border-2 border-green-500 rounded-lg font-medium hover:bg-green-500 hover:text-white transition-all duration-200"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                      setResetPhone("");
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-5 relative">
        <div ref={recaptchaContainerRef}></div>
        <a
          onClick={() => navigate("/")}
          className="cursor-pointer absolute top-4 left-4 flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <div className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center text-2xl shadow">
            🌱
          </div>
          <span className="text-sm font-medium">Back</span>
        </a>
        <div className="flex w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Panel - Image */}
          <div className="flex-1 relative bg-gradient-to-br from-green-500 to-blue-500 hidden md:block">
            <div className="relative w-full h-full">
              <img
                src="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Farming"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 flex flex-col justify-between p-10 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-2xl">
                    🌱
                  </div>
                  <div>
                    <h1 className="text-xl font-bold mb-1">
                      AI Farmer Assistant
                    </h1>
                    <p className="text-sm opacity-90">
                      Smart Agriculture Solutions
                    </p>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-gray-800 max-w-sm">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">
                    Reset Your Password
                  </h2>
                  <p className="text-base opacity-80 leading-relaxed">
                    Enter your phone number to receive a reset code
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Reset Form */}
          <div className="flex-1 flex items-start justify-center p-10 bg-white overflow-y-auto">
            <div className="w-full max-w-sm">
              <button
                className="text-green-500 text-sm font-medium cursor-pointer mb-6 py-2 hover:text-green-600 transition-colors duration-200"
                onClick={() => setShowForgotPassword(false)}
              >
                ← Back to Login
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-600 text-base">
                  Enter your phone number and we'll send you a code to reset
                  your password.
                </p>
              </div>

              <div onSubmit={handleResetSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-base z-10">📱</span>
                    <input
                      type="tel"
                      placeholder="+91 9999900000"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSubmit}
                  className="w-full py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 mb-6"
                >
                  Send Reset Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-5 relative">
      <div ref={recaptchaContainerRef}></div>
      <a
        onClick={() => navigate("/")}
        className="cursor-pointer absolute top-4 left-4 flex items-center gap-2 text-green-600 hover:text-green-700"
      >
        <div className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center text-2xl shadow">
          🌱
        </div>
        <span className="text-sm font-medium">Back</span>
      </a>
      <div className="flex w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Panel - Image */}
        <div className="flex-1 relative bg-gradient-to-br from-green-500 to-blue-500 hidden md:block">
          <div className="relative w-full h-full">
            <img
              src="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Farming"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 flex flex-col justify-between p-10 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-2xl">
                  🌱
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-1">
                    AI Farmer Assistant
                  </h1>
                  <p className="text-sm opacity-90">
                    Smart Agriculture Solutions
                  </p>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-gray-800 max-w-sm">
                <h2 className="text-2xl font-bold mb-2 leading-tight">
                  Harvesting Insights, Growing Success
                </h2>
                <p className="text-base opacity-80 leading-relaxed">
                  Smart farming solutions for modern agriculture
                </p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm opacity-90">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Crop Monitoring</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm opacity-90">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Weather Insights</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm opacity-90">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Yield Optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="flex-1 flex items-start justify-center p-10 bg-white overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Tab Navigation */}
            <div className="flex bg-green-500/10 rounded-lg p-1 mb-8">
              <button
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                  isLogin
                    ? "bg-white text-green-500 shadow-sm"
                    : "text-gray-600"
                }`}
                onClick={() => {
                  setIsLogin(true);
                  resetVerification();
                }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                  !isLogin
                    ? "bg-white text-green-500 shadow-sm"
                    : "text-gray-600"
                }`}
                onClick={() => {
                  setIsLogin(false);
                  resetVerification();
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-gray-600 text-base">
                {isLogin
                  ? "Sign in to your farming dashboard"
                  : "Join thousands of smart farmers"}
              </p>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>

            {/* Login Form */}
            {isLogin ? (
              <div onSubmit={handleLoginSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-base z-10">📱</span>
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={loginData.phone}
                      onChange={(e) =>
                        setLoginData({ ...loginData, phone: e.target.value })
                      }
                      className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                      required
                      disabled={phoneVerified}
                    />
                  </div>
                </div>

                {!phoneVerified && !otpSent && (
                  <button
                    type="button"
                    onClick={(e) => handleSendOtp(loginData.phone, e, false)}
                    disabled={!loginData.phone || verifyingOtp}
                    className="w-full py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {verifyingOtp ? "Sending..." : "Send OTP"}
                  </button>
                )}

                {otpSent && !phoneVerified && (
                  <>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter OTP
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-base z-10">
                          🔢
                        </span>
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        OTP sent to {loginData.phone}
                      </p>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button
                        type="button"
                        onClick={(e) => handleVerifyOtp(e)}
                        disabled={otp.length !== 6 || verifyingOtp}
                        className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {verifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-300 transition-all duration-200"
                      >
                        Resend
                      </button>
                    </div>
                  </>
                )}

                {phoneVerified && (
                  <>
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between text-green-700">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          <span className="text-sm font-medium">
                            Phone verified successfully!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={resetVerification}
                          className="text-xs text-green-600 hover:text-green-800 underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoginSubmit}
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Logging in..." : "Login"}
                    </button>
                  </>
                )}

                <div className="relative text-center my-6 text-gray-600 text-sm">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
                  <span className="bg-white px-4">Or continue with</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="py-3 px-4 bg-white text-gray-700 border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="font-bold text-base">G</span>
                    Google
                  </button>
                  <button
                    type="button"
                    className="py-3 px-4 bg-white text-gray-700 border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-base">🍎</span>
                    Apple
                  </button>
                </div>
              </div>
            ) : (
              /* Signup Form */
              <div onSubmit={handleSignupSubmit}>
                {!phoneVerified ? (
                  <>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-base z-10">
                          📱
                        </span>
                        <input
                          type="tel"
                          placeholder="+919999900000"
                          value={signupData.phone}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                          required
                        />
                      </div>
                    </div>

                    {!otpSent && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleSendOtp(signupData.phone, e, true)
                        }
                        disabled={!signupData.phone || verifyingOtp}
                        className="w-full py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {verifyingOtp ? "Sending..." : "Verify Phone Number"}
                      </button>
                    )}

                    {otpSent && (
                      <>
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Enter OTP
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-base z-10">
                              🔢
                            </span>
                            <input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                              maxLength={6}
                              required
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            OTP sent to {signupData.phone}
                          </p>
                        </div>

                        <div className="flex gap-3 mb-6">
                          <button
                            type="button"
                            onClick={(e) => handleVerifyOtp(e)}
                            disabled={otp.length !== 6 || verifyingOtp}
                            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {verifyingOtp ? "Verifying..." : "Verify OTP"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtp("");
                            }}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-300 transition-all duration-200"
                          >
                            Resend
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between text-green-700">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          <span className="text-sm font-medium">
                            Phone verified successfully!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={resetVerification}
                          className="text-xs text-green-600 hover:text-green-800 underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-base z-10">
                          👤
                        </span>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={signupData.username}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              username: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-base z-10">
                          🔒
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-12 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-base cursor-pointer p-1 text-gray-500 hover:text-green-500 transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      {signupData.password && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${
                                  (passwordStrength.strength / 3) * 100
                                }%`,
                                backgroundColor: passwordStrength.color,
                              }}
                            ></div>
                          </div>
                          <span
                            className="text-sm"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-base z-10">
                          🔒
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full py-3 pl-10 pr-12 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-base cursor-pointer p-1 text-gray-500 hover:text-green-500 transition-colors duration-200"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>
                    <FarmLocationInput
                      signupData={signupData}
                      setSignupData={setSignupData}
                    />

                    <div className="mb-6">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={signupData.agreeToTerms}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              agreeToTerms: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-green-500"
                          required
                        />
                        I agree to the{" "}
                        <a
                          onClick={() => navigate("/hehe")}
                          className="text-green-500 no-underline hover:underline"
                        >
                          Terms & Conditions
                        </a>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignupSubmit}
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Creating account..." : "Create Account"}
                    </button>

                    <div className="relative text-center my-6 text-gray-600 text-sm">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
                      <span className="bg-white px-4">Or continue with</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        className="py-3 px-4 bg-white text-gray-700 border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span className="font-bold text-base">G</span>
                        Google
                      </button>
                      <button
                        type="button"
                        className="py-3 px-4 bg-white text-gray-700 border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span className="text-base">🍎</span>
                        Apple
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
