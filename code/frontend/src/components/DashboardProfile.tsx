import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Storage, ID } from 'appwrite';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import debounce from 'lodash/debounce';
import Loading from './Loading';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

interface User {
  id: string;
  username: string;
  primaryPhone?: string;
  profilePicture?: string;
  farmAddress?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  crops?: string[];
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const DashboardProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    primaryPhone: '',
    profilePicture: '',
    farmAddress: '',
    location: { type: 'Point', coordinates: [0, 0] },
    crops: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
  const searchInputRef = useRef<HTMLInputElement>(null);

  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
  const storage = new Storage(client);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (!parsedUser.id) {
          throw new Error('User ID missing in localStorage');
        }
        setUser(parsedUser);
        fetchUser(parsedUser.id);
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        setError('Failed to load user data');
        setIsLoading(false);
        navigate('/login');
      }
    } else {
      setError('No user data found in localStorage');
      setIsLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUser = async (userId: string) => {
    setIsLoading(true); 
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}`, {
        credentials: 'include',
      });
      const result: ApiResponse<User> = await response.json();
      if (result.success && result.data) {
        setFormData({
          username: result.data.username || '',
          primaryPhone: result.data.primaryPhone || '',
          profilePicture: result.data.profilePicture || '',
          farmAddress: result.data.farmAddress || '',
          location: result.data.location || { type: 'Point', coordinates: [0, 0] },
          crops: result.data.crops || [],
        });
        setUser({ ...result.data, id: userId });
        localStorage.setItem('currentUser', JSON.stringify({ ...result.data, id: userId }));
      } else {
        setError(result.error || 'Failed to fetch user data');
      }
    } catch (err) {
      setError('Error fetching user data');
    } finally {
      setIsLoading(false); 
    }
  };

  const MapUpdater: React.FC<{ coordinates: [number, number] | null }> = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
        map.setView([coordinates[1], coordinates[0]], 13);
      }
    }, [coordinates, map]);
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'crops') {
      setFormData((prev) => ({ ...prev, crops: value.split(',').map((crop) => crop.trim()).filter(Boolean) }));
    } else if (name === 'farmAddress') {
      setFormData((prev) => ({ ...prev, farmAddress: value }));
      debouncedAddressSearch(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageUploadError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImageUploadError(null);
      setImageUploadSuccess(null);
      const tempUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profilePicture: tempUrl }));
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );
      const fileUrl = storage.getFileView(import.meta.env.VITE_APPWRITE_BUCKET_ID, response.$id).href;
      setFormData((prev) => ({ ...prev, profilePicture: fileUrl }));
      localStorage.setItem('profilePicture', fileUrl);
      setImageUploadSuccess('Profile picture uploaded successfully!');
      setImageFile(null);
    } catch (error: any) {
      console.error('Image upload failed:', error);
      setImageUploadError(error.message || 'Failed to upload image');
      setFormData((prev) => ({ ...prev, profilePicture: user?.profilePicture || '' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('No user data available');
      return;
    }
    if (isUploading) {
      setError('Please wait for the image to finish uploading');
      return;
    }
    const [lng, lat] = formData.location?.coordinates || [0, 0];
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid latitude or longitude values');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const result: ApiResponse<User> = await response.json();
      if (result.success && result.data) {
        setSuccess('Profile updated successfully');
        localStorage.setItem('currentUser', JSON.stringify({ ...result.data, id: user.id }));
        setUser({ ...result.data, id: user.id });
        navigate('/dashboard?tab=profile');
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleDelete = async () => {
    if (!user) {
      setError('No user data available');
      return;
    }
    if (!window.confirm('Are you sure you want to delete your profile?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/user/delete/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result: ApiResponse<null> = await response.json();
      if (result.success) {
        setSuccess('Profile deleted successfully');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profilePicture');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setError(result.error || 'Failed to delete profile');
      }
    } catch (err) {
      setError('Error deleting profile');
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: { type: 'Point', coordinates: [longitude, latitude] },
          }));
          setGeolocationError(null);
          fetchAddressFromCoordinates(longitude, latitude);
        },
        (error) => {
          setGeolocationError('Unable to fetch current location: ' + error.message);
        }
      );
    } else {
      setGeolocationError('Geolocation is not supported by this browser.');
    }
  };

  const fetchAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=in`
      );
      const data = await response.json();
      if (data.display_name) {
        setFormData((prev) => ({ ...prev, farmAddress: data.display_name }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setError('Failed to fetch address from coordinates');
    }
  };

  const handleAddressSearch = async (address: string) => {
    if (!address || address.length < 4) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=in&viewbox=68,8,97,37&bounded=0`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowSuggestions(data.length > 0);
      if (data.length === 0) {
        setError('No results found. Try a more specific address (e.g., "Farm in Delhi, India") or use the map.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setError('Failed to fetch locations. Check your connection or try again.');
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const debouncedAddressSearch = debounce(handleAddressSearch, 500);

  const handleSuggestionSelect = (result: SearchResult) => {
    setFormData((prev) => ({
      ...prev,
      farmAddress: result.display_name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
      },
    }));
    setSearchResults([]);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.value = result.display_name;
      searchInputRef.current.focus();
    }
    setError(null);
  };

  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click(e) {
        const { lng, lat } = e.latlng;
        setFormData((prev) => ({
          ...prev,
          location: { type: 'Point', coordinates: [lng, lat] },
        }));
        fetchAddressFromCoordinates(lng, lat);
        setSearchResults([]);
        setShowSuggestions(false);
      },
    });
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">User Profile</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}
          {imageUploadError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {imageUploadError}
            </div>
          )}
          {imageUploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {imageUploadSuccess}
            </div>
          )}
          {geolocationError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {geolocationError}
            </div>
          )}

          {user ? (
            <div className="space-y-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <img
                      src={formData.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Username</span>
                      <p className="text-lg text-gray-800">{formData.username || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone</span>
                      <p className="text-lg text-gray-800">{formData.primaryPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Farm Address</span>
                      <p className="text-lg text-gray-800">{formData.farmAddress || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location</span>
                      <p className="text-lg text-gray-800">
                        {formData.location?.coordinates ? `(${formData.location.coordinates[0].toFixed(4)}, ${formData.location.coordinates[1].toFixed(4)})` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Crops</span>
                      <p className="text-lg text-gray-800">{formData.crops?.join(', ') || 'None'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Role</span>
                      <p className="text-lg text-gray-800">{user.role === 'admin' ? 'Admin' : 'Farmer'}</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <MapContainer
                      center={formData.location?.coordinates?.[1] && formData.location?.coordinates?.[0] ? [formData.location.coordinates[1], formData.location.coordinates[0]] : [20.5937, 78.9629]}
                      zoom={formData.location?.coordinates ? 13 : 5}
                      style={{ height: '100%', width: '100%' }}
                      className="rounded-lg shadow-md"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {formData.location?.coordinates?.[1] && formData.location?.coordinates?.[0] && (
                        <Marker position={[formData.location.coordinates[1], formData.location.coordinates[0]]} />
                      )}
                      <MapUpdater coordinates={formData.location?.coordinates || null} />
                    </MapContainer>
                  </div>
                  {(user.id === user.id || user.role === 'admin') && (
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete Profile
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={formData.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                      />
                      <label
                        htmlFor="profilePicture"
                        className={`absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </label>
                      <input
                        title="pp"
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        title="username"
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        title="phone"
                        type="text"
                        name="primaryPhone"
                        value={formData.primaryPhone || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="sm:col-span-2 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address (India)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="farmAddress"
                          value={formData.farmAddress || ''}
                          onChange={handleInputChange}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                          placeholder="e.g., Farm in Delhi, India or Mumbai village"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          ref={searchInputRef}
                        />
                        <button
                          type="button"
                          onClick={handleGeolocation}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          Use Current Location
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Tip: Include city or "India" for better results.</p>
                      {showSuggestions && searchResults.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                          {searchResults.map((result, index) => (
                            <li
                              key={index}
                              onMouseDown={() => handleSuggestionSelect(result)}
                              className="p-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                            >
                              {result.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map (India-focused)</label>
                      <div className="h-64 relative z-0">
                        <MapContainer
                          center={formData.location?.coordinates?.[1] && formData.location?.coordinates?.[0] ? [formData.location.coordinates[1], formData.location.coordinates[0]] : [20.5937, 78.9629]}
                          zoom={formData.location?.coordinates ? 13 : 5}
                          style={{ height: '100%', width: '100%' }}
                          className="rounded-lg shadow-md"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          {formData.location?.coordinates?.[1] && formData.location?.coordinates?.[0] && (
                            <Marker position={[formData.location.coordinates[1], formData.location.coordinates[0]]} />
                          )}
                          <MapUpdater coordinates={formData.location?.coordinates || null} />
                          <MapClickHandler />
                        </MapContainer>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Click on the map to set the farm location (zoom/pan to India if needed).</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Crops (comma-separated)</label>
                      <input
                        type="text"
                        name="crops"
                        value={formData.crops?.join(', ') || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Wheat, Rice, Cotton"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="submit"
                      className={`bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isUploading}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData((prev) => ({ ...prev, profilePicture: user?.profilePicture || '' }));
                        setImageFile(null);
                        setSearchResults([]);
                        setShowSuggestions(false);
                        setError(null);
                      }}
                      className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No user data available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardProfile;