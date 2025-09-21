import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Top Badge */}

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight animate-slide-up">
              Cultivate Success
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                with Smart AI
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed animate-slide-up max-w-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              Our AI assistant provides real-time insights on soil health, pest
              detection, and yield optimization. Make smarter decisions from
              planting to harvest, effortlessly.
            </p>

            {/* Primary CTA Button */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <button onClick={() => navigate("/agent")} className="group bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center space-x-3 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 shadow-lg">
                <span>Start My Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Right Column - Image from public folder */}
          {/* <div
            className="flex justify-center lg:justify-end animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <img
              src="/ai-technology-robot-cyborg-illustrations.png"
              alt="AI Technology Robot"
              className="max-w-full h-auto w-[520px] lg:w-[600px] drop-shadow-2xl"
              loading="eager"
              decoding="async"
            />
          </div> */}
          <div className="flex justify-center lg:justify-end">
           <div className="relative">
             <img
               src="/kerala-farmer-using-smartphone-in-rice-field-with-.jpg"
               alt="Kerala farmer using AI assistant on smartphone"
               className="max-w-full h-auto w-full sm:w-[400px] lg:w-[500px] object-cover rounded-lg shadow-xl"
               loading="eager"
               decoding="async"
             />
             {/* Floating Chat Bubble */}
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

        {/* Scroll Hint
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce lg:block hidden">
          <ChevronDown className="w-6 h-6 text-emerald-400" />
        </div> */}
      </div>
    </section>
  );
};