import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import Authentication from "./components/Authentication.tsx";
import Agent from "./components/Agent.tsx";
import Lctest from "./pages/Lctest.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 font-['Inter'] antialiased relative">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navigation />
              <HeroSection />
            </>
          }
        />
        <Route path="/agent" element={<Agent />} />;
        <Route path="/login" element={<Authentication />} />
        <Route path="/ltest" element={<Lctest />} />
      </Routes>
    </div>
  );
}

export default App;
