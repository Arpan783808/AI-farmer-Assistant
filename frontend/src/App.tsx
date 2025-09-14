import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import Authentication from "./components/Authentication.tsx";
import Agent from "./components/Agent.tsx";
import NotFound from "./components/NotFound.tsx";
import { useEffect, useState, useRef } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import PrivateRoute from "./components/PrivateRoute.tsx";
import AdminOnlyPrivateRoute from "./components/AdminRoute.tsx";
import PublicRoute from "./components/PublicRoute.tsx";

interface UserProfileProps {
  username: string;
}

const UserProfile = ({ username }: UserProfileProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-3 bg-white hover:bg-gray-100 rounded-md py-2 px-3 shadow-md transition-all duration-200 ease-in-out"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-gray-700 font-medium hidden sm:block">
          {username}
        </span>
      </button>

    </div>
  );
};

function App() {
  const [username, setUsername] = useState("User");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsername(localStorage.getItem("username") || "User");
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 font-['Inter'] antialiased relative">
      <Routes>
        <Route
          path="/"
          element={
            <>
              {isLoggedIn && (
                <div className="absolute top-8 right-4 z-10">
                  <UserProfile username={username} />
                </div>
              )}
              <Navigation />
              <HeroSection />
            </>
          }
        />

        <Route element={<PrivateRoute/>}>
            {/* list protected routes, that must be available for loggedin user only  */}
            <Route path="/agent" element={<Agent />} />;
        </Route>

        <Route element={<AdminOnlyPrivateRoute/>}>
            {/* list routes only for admins */}
            { /* <Route path="/agent" element={<AdminDashboard />} />; */}
        </Route>

        <Route element={<PublicRoute/>}>
            {/* routes that must be available for logged out user */}
            <Route path="/login" element={<Authentication />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

