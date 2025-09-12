import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import Authentication from "./components/Authentication.tsx";
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
        <Route path="/login" element={<Authentication />} />
      </Routes>
    </div>
  );
}

export default App;
