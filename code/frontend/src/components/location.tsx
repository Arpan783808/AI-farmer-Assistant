import { useState } from "react";

// Assuming you pass these from your parent component
// const [signupData, setSignupData] = useState({ farmLocation: '' });
interface ISignupData {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  farmAddress: string;
  latitude: number | null;
  longitude: number | null;
  agreeToTerms: boolean;
  login: boolean;
  idToken: string;
}

interface FarmLocationInputProps {
  signupData: ISignupData;
  setSignupData: React.Dispatch<React.SetStateAction<ISignupData>>;
}
export function FarmLocationInput({
  signupData,
  setSignupData,
}: FarmLocationInputProps) {
  // State to manage the fetching process
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const handleFetchLocation = async () => {
    // 1. Check if the browser supports the Geolocation API
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetching(true);
    setError("");

    // 2. Request the user's current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 3. Use a reverse geocoding API to get the address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error("Failed to fetch address.");

          const data = await response.json();
          const address = data.display_name;

          if (address) {
            // 4. Update the state with the fetched location
            setSignupData({
              ...signupData,
              farmAddress: address || "Address not found",
              latitude: latitude,
              longitude: longitude,
            });
          } else {
            setError("Could not determine address from your location.");
          }
        } catch (err) {
          setError("Failed to fetch address. Please enter manually.");
        } finally {
          setIsFetching(false);
        }
      },
      (err) => {
        // 5. Handle errors (like user denying permission)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("You denied the request for Geolocation.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
            break;
        }
        setIsFetching(false);
      }
    );
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Farm Location
      </label>
      <div className="relative flex items-center">
        {/* Location Pin Icon */}
        <span className="absolute left-3 text-base z-10">📍</span>
        <input
          type="text"
          placeholder="e.g., Rohtak,Harayana "
          value={signupData.farmAddress}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              farmAddress: e.target.value,
            })
          }
          className="w-full py-3 pl-10 pr-12 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
          required
        />
        {/* Fetch Location Button */}
        <button
          type="button"
          onClick={handleFetchLocation}
          disabled={isFetching}
          className="absolute right-1.5 h-9 w-9 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          title="Get current location"
        >
          {isFetching ? (
            // Loading Spinner SVG
            <svg
              className="animate-spin h-5 w-5 text-green-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            // Target Icon SVG
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
      {signupData.latitude && signupData.longitude && (
        <p className="text-xs text-gray-500 mt-1">
          Coordinates captured: {signupData.latitude.toFixed(4)},{" "}
          {signupData.longitude.toFixed(4)}
        </p>
      )}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
