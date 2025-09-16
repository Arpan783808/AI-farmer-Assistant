"use client";

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface Alert {
  _id: string;
  title: string;
  content: string;
  range: number;
  location: {
    coordinates: [number, number];
  };
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

interface AlertFormData {
  title: string;
  content: string;
  range: number;
  location: {
    coordinates: [number, number];
  };
  expiresAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export const CreateAlert: React.FC = () => {
  const [formData, setFormData] = useState<AlertFormData>({
    title: '',
    content: '',
    range: 1000,
    location: { coordinates: [0, 0] },
    expiresAt: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
      const index = name === 'location.coordinates[0]' ? 0 : 1;
      setFormData((prev) => ({
        ...prev,
        location: {
          coordinates: [
            index === 0 ? parseFloat(value) || 0 : prev.location.coordinates[0],
            index === 1 ? parseFloat(value) || 0 : prev.location.coordinates[1],
          ],
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const result: ApiResponse<Alert> = await response.json();
      if (result.success) {
        setSuccess('Alert created successfully');
        setFormData({
          title: '',
          content: '',
          range: 1000,
          location: { coordinates: [0, 0] },
          expiresAt: '',
        });
        setTimeout(() => navigate('/dashboard?tab=active-alerts'), 1000);
      } else {
        setError(result.error || 'Failed to create alert');
      }
    } catch (err) {
      setError('Error creating alert');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Alert</h2>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Range (meters)</label>
            <input
              type="number"
              name="range"
              value={formData.range}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              min="1"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                name="location.coordinates[0]"
                value={formData.location.coordinates[0]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                step="any"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                name="location.coordinates[1]"
                value={formData.location.coordinates[1]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                step="any"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Create Alert
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard?tab=active-alerts')}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UpdateAlert: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AlertFormData>({
    title: '',
    content: '',
    range: 1000,
    location: { coordinates: [0, 0] },
    expiresAt: '',
  });
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id');
    if (!id) {
      setError('No alert ID provided');
      return;
    }

    const fetchAlert = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/alerts/active`, {
          credentials: 'include',
        });
        const result: ApiResponse<Alert[]> = await response.json();
        if (result.success) {
          const alert = result.data?.find((a) => a._id === id);
          if (alert) {
            setFormData({
              title: alert.title,
              content: alert.content,
              range: alert.range,
              location: alert.location,
              expiresAt: alert.expiresAt.split('.')[0],
            });
          } else {
            setError('Alert not found');
          }
        } else {
          setError(result.error || 'Failed to fetch alert');
        }
      } catch (err) {
        setError('Error fetching alert');
      }
    };
    fetchAlert();
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
      const index = name === 'location.coordinates[0]' ? 0 : 1;
      setFormData((prev) => ({
        ...prev,
        location: {
          coordinates: [
            index === 0 ? parseFloat(value) || 0 : prev.location.coordinates[0],
            index === 1 ? parseFloat(value) || 0 : prev.location.coordinates[1],
          ],
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id');
    if (!id) {
      setError('No alert ID provided');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const result: ApiResponse<Alert> = await response.json();
      if (result.success) {
        setSuccess('Alert updated successfully');
        setTimeout(() => navigate('/dashboard?tab=active-alerts'), 1000);
      } else {
        setError(result.error || 'Failed to update alert');
      }
    } catch (err) {
      setError('Error updating alert');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Update Alert</h2>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Range (meters)</label>
            <input
              type="number"
              name="range"
              value={formData.range}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              min="1"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                name="location.coordinates[0]"
                value={formData.location.coordinates[0]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                step="any"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                name="location.coordinates[1]"
                value={formData.location.coordinates[1]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                step="any"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Update Alert
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard?tab=active-alerts')}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ListAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/active`, {
        credentials: 'include',
      });
      const result: ApiResponse<Alert[]> = await response.json();
      if (result.success) {
        setAlerts(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError('Error fetching alerts');
    }
  };

  const handleSendNotifications = async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}/send`, {
        method: 'POST',
        credentials: 'include',
      });
      const result: ApiResponse<{ alertId: string; sent: number; failed: number }> = await response.json();
      if (result.success) {
        setSuccess(`Notifications sent: ${result.data?.sent} succeeded, ${result.data?.failed} failed`);
      } else {
        setError(result.error || 'Failed to send notifications');
      }
    } catch (err) {
      setError('Error sending notifications');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result: ApiResponse<null> = await response.json();
      if (result.success) {
        setSuccess('Alert deleted successfully');
        fetchActiveAlerts();
      } else {
        setError(result.error || 'Failed to delete alert');
      }
    } catch (err) {
      setError('Error deleting alert');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Active Alerts</h2>
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
        {alerts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No active alerts found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{alert.title}</h3>
                <p className="text-gray-600 mb-4">{alert.content}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">Range:</span> {alert.range}m
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> ({alert.location.coordinates[0].toFixed(4)},{' '}
                    {alert.location.coordinates[1].toFixed(4)})
                  </p>
                  <p>
                    <span className="font-medium">Expires:</span>{' '}
                    {new Date(alert.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSendNotifications(alert._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Send Notifications
                  </button>
                  <Link
                    to={`/dashboard?tab=update-alert&id=${alert._id}`}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-full font-medium hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Update
                  </Link>
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// interface Alert {
//   _id: string;
//   title: string;
//   content: string;
//   range: number;
//   location: {
//     coordinates: [number, number];
//   };
//   expiresAt: string;
//   active: boolean;
//   createdAt: string;
// }

// interface AlertFormData {
//   title: string;
//   content: string;
//   range: number;
//   location: {
//     coordinates: [number, number];
//   };
//   expiresAt: string;
// }

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   error?: string;
//   count?: number;
// }
// export const CreateAlert: React.FC = () => {
//   const [formData, setFormData] = useState<AlertFormData>({
//     title: '',
//     content: '',
//     range: 1000,
//     location: { coordinates: [0, 0] },
//     expiresAt: '',
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
//       const index = name === 'location.coordinates[0]' ? 0 : 1;
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           coordinates: [
//             index === 0 ? parseFloat(value) : prev.location.coordinates[0],
//             index === 1 ? parseFloat(value) : prev.location.coordinates[1],
//           ],
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });
//       const result: ApiResponse<Alert> = await response.json();
//       if (result.success) {
//         setSuccess('Alert created successfully');
//         setFormData({
//           title: '',
//           content: '',
//           range: 1000,
//           location: { coordinates: [0, 0] },
//           expiresAt: '',
//         });
//         setTimeout(() => navigate('/dashboard?tab=active-alerts'), 1000);
//       } else {
//         setError(result.error || 'Failed to create alert');
//       }
//     } catch (err) {
//       setError('Error creating alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Create New Alert</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Content</label>
//           <textarea
//             name="content"
//             value={formData.content}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             rows={4}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Range (meters)</label>
//           <input
//             type="number"
//             name="range"
//             value={formData.range}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             min="1"
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Latitude</label>
//             <input
//               type="number"
//               name="location.coordinates[0]"
//               value={formData.location.coordinates[0]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Longitude</label>
//             <input
//               type="number"
//               name="location.coordinates[1]"
//               value={formData.location.coordinates[1]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Expires At</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             value={formData.expiresAt}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
//         >
//           Create Alert
//         </button>
//       </form>
//     </div>
//   );
// };

// export const UpdateAlert: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<AlertFormData>({
//     title: '',
//     content: '',
//     range: 1000,
//     location: { coordinates: [0, 0] },
//     expiresAt: '',
//   });
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search);
//     const id = urlParams.get('id');
//     if (!id) {
//       setError('No alert ID provided');
//       return;
//     }

//     const fetchAlert = async () => {
//       try {
//         const response = await fetch(`${API_BASE}/api/alerts/active`);
//         const result: ApiResponse<Alert[]> = await response.json();
//         if (result.success) {
//           const alert = result.data?.find((a) => a._id === id);
//           if (alert) {
//             setFormData({
//               title: alert.title,
//               content: alert.content,
//               range: alert.range,
//               location: alert.location,
//               expiresAt: alert.expiresAt.split('.')[0],
//             });
//           } else {
//             setError('Alert not found');
//           }
//         } else {
//           setError(result.error || 'Failed to fetch alert');
//         }
//       } catch (err) {
//         setError('Error fetching alert');
//       }
//     };
//     fetchAlert();
//   }, [location.search]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
//       const index = name === 'location.coordinates[0]' ? 0 : 1;
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           coordinates: [
//             index === 0 ? parseFloat(value) : prev.location.coordinates[0],
//             index === 1 ? parseFloat(value) : prev.location.coordinates[1],
//           ],
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const urlParams = new URLSearchParams(location.search);
//     const id = urlParams.get('id');
//     if (!id) {
//       setError('No alert ID provided');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });
//       const result: ApiResponse<Alert> = await response.json();
//       if (result.success) {
//         setSuccess('Alert updated successfully');
//         setTimeout(() => navigate('/dashboard?tab=active-alerts'), 1000);
//       } else {
//         setError(result.error || 'Failed to update alert');
//       }
//     } catch (err) {
//       setError('Error updating alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Update Alert</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Content</label>
//           <textarea
//             name="content"
//             value={formData.content}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             rows={4}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Range (meters)</label>
//           <input
//             type="number"
//             name="range"
//             value={formData.range}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             min="1"
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Latitude</label>
//             <input
//               type="number"
//               name="location.coordinates[0]"
//               value={formData.location.coordinates[0]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Longitude</label>
//             <input
//               type="number"
//               name="location.coordinates[1]"
//               value={formData.location.coordinates[1]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Expires At</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             value={formData.expiresAt}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
//         >
//           Update Alert
//         </button>
//       </form>
//     </div>
//   );
// };

// export const ListAlerts: React.FC = () => {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

//   useEffect(() => {
//     fetchActiveAlerts();
//   }, []);

//   const fetchActiveAlerts = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/active`);
//       const result: ApiResponse<Alert[]> = await response.json();
//       if (result.success) {
//         setAlerts(result.data || []);
//       } else {
//         setError(result.error || 'Failed to fetch alerts');
//       }
//     } catch (err) {
//       setError('Error fetching alerts');
//     }
//   };

//   const handleSendNotifications = async (alertId: string) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}/send`, {
//         method: 'POST',
//       });
//       const result: ApiResponse<{ alertId: string; sent: number; failed: number }> = await response.json();
//       if (result.success) {
//         setSuccess(`Notifications sent: ${result.data?.sent} succeeded, ${result.data?.failed} failed`);
//       } else {
//         setError(result.error || 'Failed to send notifications');
//       }
//     } catch (err) {
//       setError('Error sending notifications');
//     }
//   };

//   const handleDeleteAlert = async (alertId: string) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
//         method: 'DELETE',
//       });
//       const result: ApiResponse<null> = await response.json();
//       if (result.success) {
//         setSuccess('Alert deleted successfully');
//         fetchActiveAlerts();
//       } else {
//         setError(result.error || 'Failed to delete alert');
//       }
//     } catch (err) {
//       setError('Error deleting alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       {alerts.length === 0 ? (
//         <p className="text-gray-500">No active alerts found.</p>
//       ) : (
//         <div className="space-y-4">
//           {alerts.map((alert) => (
//             <div key={alert._id} className="border p-4 rounded-md bg-white shadow-sm">
//               <h3 className="text-lg font-medium">{alert.title}</h3>
//               <p className="text-gray-600">{alert.content}</p>
//               <p className="text-sm text-gray-500">
//                 Range: {alert.range}m | Location: ({alert.location.coordinates[0]},{' '}
//                 {alert.location.coordinates[1]}) | Expires:{' '}
//                 {new Date(alert.expiresAt).toLocaleString()}
//               </p>
//               <div className="mt-2 space-x-2">
//                 <button
//                   onClick={() => handleSendNotifications(alert._id)}
//                   className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//                 >
//                   Send Notifications
//                 </button>
//                 <Link
//                   to={`/dashboard?tab=update-alert&id=${alert._id}`}
//                   className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
//                 >
//                   Update
//                 </Link>
//                 <button
//                   onClick={() => handleDeleteAlert(alert._id)}
//                   className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };



// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// // Define interfaces for type safety
// interface Alert {
//   _id: string;
//   title: string;
//   content: string;
//   range: number;
//   location: {
//     coordinates: [number, number];
//   };
//   expiresAt: string;
//   active: boolean;
//   createdAt: string;
// }

// interface AlertFormData {
//   title: string;
//   content: string;
//   range: number;
//   location: {
//     coordinates: [number, number];
//   };
//   expiresAt: string;
// }

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   error?: string;
//   count?: number;
// }

// // Create Alert Component
// const CreateAlert: React.FC = () => {
//   const [formData, setFormData] = useState<AlertFormData>({
//     title: '',
//     content: '',
//     range: 1000,
//     location: { coordinates: [0, 0] },
//     expiresAt: '',
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const navigate = useNavigate();
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
//       const index = name === 'location.coordinates[0]' ? 0 : 1;
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           coordinates: [
//             index === 0 ? parseFloat(value) : prev.location.coordinates[0],
//             index === 1 ? parseFloat(value) : prev.location.coordinates[1],
//           ],
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });
//       const result: ApiResponse<Alert> = await response.json();
//       if (result.success) {
//         setSuccess('Alert created successfully');
//         setFormData({
//           title: '',
//           content: '',
//           range: 1000,
//           location: { coordinates: [0, 0] },
//           expiresAt: '',
//         });
//         setTimeout(() => navigate('/alert'), 1000);
//       } else {
//         setError(result.error || 'Failed to create alert');
//       }
//     } catch (err) {
//       setError('Error creating alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Create New Alert</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Content</label>
//           <textarea
//             name="content"
//             value={formData.content}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             rows={4}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Range (meters)</label>
//           <input
//             type="number"
//             name="range"
//             value={formData.range}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             min="1"
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Latitude</label>
//             <input
//               type="number"
//               name="location.coordinates[0]"
//               value={formData.location.coordinates[0]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Longitude</label>
//             <input
//               type="number"
//               name="location.coordinates[1]"
//               value={formData.location.coordinates[1]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Expires At</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             value={formData.expiresAt}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
//         >
//           Create Alert
//         </button>
//       </form>
//     </div>
//   );
// };

// // Update Alert Component
// const UpdateAlert: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<AlertFormData>({
//     title: '',
//     content: '',
//     range: 1000,
//     location: { coordinates: [0, 0] },
//     expiresAt: '',
//   });
//   const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchAlert = async () => {
//       try {
//         const response = await fetch(`${API_BASE}/api/alerts/active`);
//         const result: ApiResponse<Alert[]> = await response.json();
//         if (result.success) {
//           const alert = result.data?.find((a) => a._id === id);
//           if (alert) {
//             setFormData({
//               title: alert.title,
//               content: alert.content,
//               range: alert.range,
//               location: alert.location,
//               expiresAt: alert.expiresAt.split('.')[0],
//             });
//           } else {
//             setError('Alert not found');
//           }
//         } else {
//           setError(result.error || 'Failed to fetch alert');
//         }
//       } catch (err) {
//         setError('Error fetching alert');
//       }
//     };
//     fetchAlert();
//   }, [id]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     if (name === 'location.coordinates[0]' || name === 'location.coordinates[1]') {
//       const index = name === 'location.coordinates[0]' ? 0 : 1;
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           coordinates: [
//             index === 0 ? parseFloat(value) : prev.location.coordinates[0],
//             index === 1 ? parseFloat(value) : prev.location.coordinates[1],
//           ],
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });
//       const result: ApiResponse<Alert> = await response.json();
//       if (result.success) {
//         setSuccess('Alert updated successfully');
//         setTimeout(() => navigate('/alert'), 1000);
//       } else {
//         setError(result.error || 'Failed to update alert');
//       }
//     } catch (err) {
//       setError('Error updating alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Update Alert</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Content</label>
//           <textarea
//             name="content"
//             value={formData.content}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             rows={4}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Range (meters)</label>
//           <input
//             type="number"
//             name="range"
//             value={formData.range}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//             min="1"
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Latitude</label>
//             <input
//               type="number"
//               name="location.coordinates[0]"
//               value={formData.location.coordinates[0]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700">Longitude</label>
//             <input
//               type="number"
//               name="location.coordinates[1]"
//               value={formData.location.coordinates[1]}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border rounded-md"
//               step="any"
//               required
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Expires At</label>
//           <input
//             type="datetime-local"
//             name="expiresAt"
//             value={formData.expiresAt}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border rounded-md"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
//         >
//           Update Alert
//         </button>
//       </form>
//     </div>
//   );
// };

// // List Alerts Component
// const ListAlerts: React.FC = () => {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
// const API_BASE =
//     (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
//   useEffect(() => {
//     fetchActiveAlerts();
//   }, []);

//   const fetchActiveAlerts = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/active`);
//       const result: ApiResponse<Alert[]> = await response.json();
//       if (result.success) {
//         setAlerts(result.data || []);
//       } else {
//         setError(result.error || 'Failed to fetch alerts');
//       }
//     } catch (err) {
//       setError('Error fetching alerts');
//     }
//   };

//   const handleSendNotifications = async (alertId: string) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}/send`, {
//         method: 'POST',
//       });
//       const result: ApiResponse<{ alertId: string; sent: number; failed: number }> = await response.json();
//       if (result.success) {
//         setSuccess(`Notifications sent: ${result.data?.sent} succeeded, ${result.data?.failed} failed`);
//       } else {
//         setError(result.error || 'Failed to send notifications');
//       }
//     } catch (err) {
//       setError('Error sending notifications');
//     }
//   };

//   const handleDeleteAlert = async (alertId: string) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
//         method: 'DELETE',
//       });
//       const result: ApiResponse<null> = await response.json();
//       if (result.success) {
//         setSuccess('Alert deleted successfully');
//         fetchActiveAlerts();
//       } else {
//         setError(result.error || 'Failed to delete alert');
//       }
//     } catch (err) {
//       setError('Error deleting alert');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
//       {alerts.length === 0 ? (
//         <p className="text-gray-500">No active alerts found.</p>
//       ) : (
//         <div className="space-y-4">
//           {alerts.map((alert) => (
//             <div key={alert._id} className="border p-4 rounded-md bg-white shadow-sm">
//               <h3 className="text-lg font-medium">{alert.title}</h3>
//               <p className="text-gray-600">{alert.content}</p>
//               <p className="text-sm text-gray-500">
//                 Range: {alert.range}m | Location: ({alert.location.coordinates[0]},{' '}
//                 {alert.location.coordinates[1]}) | Expires:{' '}
//                 {new Date(alert.expiresAt).toLocaleString()}
//               </p>
//               <div className="mt-2 space-x-2">
//                 <button
//                   onClick={() => handleSendNotifications(alert._id)}
//                   className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//                 >
//                   Send Notifications
//                 </button>
//                 <Link
//                   to={`/alert/update/${alert._id}`}
//                   className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
//                 >
//                   Update
//                 </Link>
//                 <button
//                   onClick={() => handleDeleteAlert(alert._id)}
//                   className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Dashboard NotFound Component
// const DashboardNotFound: React.FC = () => {
//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
//       <p className="text-gray-600">The requested page does not exist within the Alert Dashboard.</p>
//       <Link to="/alert" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//         Back to Alerts
//       </Link>
//     </div>
//   );
// };

// // Main Dashboard Component
// const Dashboard: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-blue-800 text-white p-6">
//         <h1 className="text-2xl font-bold mb-6">Alert Dashboard</h1>
//         <nav className="space-y-2">
//           <Link
//             to="/alert"
//             className="block p-2 rounded-md hover:bg-blue-700"
//           >
//             View Alerts
//           </Link>
//           <Link
//             to="/alert/create"
//             className="block p-2 rounded-md hover:bg-blue-700"
//           >
//             Create Alert
//           </Link>
//         </nav>
//       </div>
//       {/* Main Content */}
//       <div className="flex-1">
//         <Routes>
//           <Route path="/" element={<ListAlerts />} />
//           <Route path="/create" element={<CreateAlert />} />
//           <Route path="/update/:id" element={<UpdateAlert />} />
//           <Route path="*" element={<DashboardNotFound />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;