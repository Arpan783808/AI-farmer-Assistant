import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const HeroSection1 = () => {
  const navigate = useNavigate();

  const languages = [
    "Malayalam",
    "English",
    "Hindi"
  ];
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  useEffect(() => {
    const currentPhrase = languages[index];
    let typingTimeout;

    if (isTyping) {
      if (charIndex < currentPhrase.length) {
        typingTimeout = setTimeout(() => {
          setCurrentLanguage((prev) => prev + currentPhrase.charAt(charIndex));
          setCharIndex((prev) => prev + 1);
        }, 100); 
      } else {
        typingTimeout = setTimeout(() => {
          setIsTyping(false);
          setCharIndex(currentPhrase.length - 1);
        }, 1000); 
      }
    } else {
      if (charIndex >= 0) {
        typingTimeout = setTimeout(() => {
          setCurrentLanguage((prev) => prev.slice(0, -1));
          setCharIndex((prev) => prev - 1);
        }, 50); 
      } else {
        setIsTyping(true);
        setCharIndex(0);
        setIndex((prev) => (prev + 1) % languages.length);
      }
    }

    return () => clearTimeout(typingTimeout);
  }, [charIndex, isTyping, index, languages]);

  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-800">
              Powered by Government of Kerala
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight animate-slide-up">
              Your Digital Krishi Officer
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Ask in {currentLanguage}
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed animate-slide-up max-w-2xl mx-auto lg:mx-0"
              style={{ animationDelay: "0.2s" }}
            >
              From pests in your banana crop to weather updates and subsidies, our AI assistant answers in Malayalam—via text, voice, or photos. Always here for Kerala’s farmers.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <button
                onClick={() => navigate("/agent")}
                className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg inline-flex items-center space-x-2 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <span>Try It Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/kerala-farmer-using-smartphone-in-rice-field-with-.jpg"
                alt="Kerala farmer using AI assistant on smartphone"
                className="max-w-full h-auto w-full sm:w-[400px] lg:w-[500px] object-cover rounded-lg shadow-xl"
                loading="eager"
                decoding="async"
              />
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  "വാഴയിലെ ഇലപ്പുള്ളി രോഗത്തിന് ഏത് കീടനാശിനി?"
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span>AI preparing answer...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};