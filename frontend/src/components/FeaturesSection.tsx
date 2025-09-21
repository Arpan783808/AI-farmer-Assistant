import { Mic, Camera, MapPin, Clock, MessageCircle, Users } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Mic className="w-8 h-8 text-green-600" />,
      title: "Speak in Malayalam",
      description: "Ask questions in Malayalam using voice. No typing needed—just talk about your crops.",
      example: "E.g., What is a leaf spot on a banana?",
    },
    {
      icon: <Camera className="w-8 h-8 text-green-600" />,
      title: "Photo Disease Detection",
      description: "Upload a photo of your crop to identify pests or diseases and get instant treatment advice.",
      example: "E.g., Send a photo of affected paddy leaves",
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: "Local Crop Advice",
      description: "Get tailored advice based on your district’s weather, soil, and crop calendar in Kerala.",
      example: "E.g., Coconut farming tips for Thrissur",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Always Available",
      description: "Ask any time, day or night. Your digital Krishi Sahayi is ready to help 24/7.",
      example: "E.g., Get help for urgent pest issues",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      title: "Expert Guidance",
      description: "Powered by Kerala Agricultural University and Krishibhavan expertise, delivered instantly.",
      example: "E.g., Subsidies for banana farming",
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Connect with Farmers",
      description: "Learn from other Kerala farmers’ experiences and share your own farming tips.",
      example: "E.g., Join discussions on paddy yields",
    },
  ];

  return (
    <section
      id="features"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Support for Every Farmer
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            From planting to harvest, Krishi Sahayi helps Kerala farmers with instant, trusted advice in Malayalam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                <p className="text-sm text-green-700 font-medium malayalam-text">
                  {feature.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};