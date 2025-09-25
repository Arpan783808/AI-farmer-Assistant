import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export const Navigation = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);
  // change for deployment 
  const handleLogout = async () => {
    try {
      const logoutResponse = await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
      });
      await signOut(auth);
      setIsLoggedIn(false);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userName");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-200/30 shadow-lg px-6 py-3 max-w-4xl w-full mx-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              AI Farmer Assistant
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 cursor-pointer">
            <a
              onClick={() => navigate("/hehe")}
              className="cursor-pointer text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-sm"
            >
              Features
            </a>
            <a
              onClick={() => navigate("/hehe")}
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-sm"
            >
              How It Works
            </a>
            <a
              onClick={() => navigate("/hehe")}
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-sm"
            >
              Pricing
            </a>
            <a
              onClick={() => navigate("/hehe")}
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-sm"
            >
              Testimonials
            </a>
          </div>

          {/* Authentication / Agent Buttons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <a
                  onClick={() => navigate("/agent")}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-sm"
                >
                  Agent
                </a>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  onClick={() => navigate("/login")}
                  className="cursor-pointer text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 text-sm"
                >
                  Log In
                </a>
                <a
                  onClick={() => navigate("/login")}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-sm"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
