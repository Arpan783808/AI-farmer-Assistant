import React, { useEffect, useState } from 'react';

interface Crop {
  cropId: string;
  name: string;
  variety: string;
  scientificName: string;
  description: string;
  category: string;
  season: string;
  region: string[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const CropManagement: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    scientificName: '',
    description: '',
    category: '',
    season: '',
    region: '',
    imageUrl: '',
  });
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";

  useEffect(() => {
    fetchCrops();
  }, [page]);

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/crop/paginated?page=${page}&limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setCrops(data.data);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      const body = {
        ...formData,
        region: formData.region.split(',').map((r) => r.trim()).filter(Boolean),
      };

      if (modalMode === 'add') {
        response = await fetch(`${API_BASE}/api/crops/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
      } else if (selectedCrop) {
        response = await fetch(`${API_BASE}/api/crops/${selectedCrop.cropId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
      }

      if (response && response.ok) {
        closeModal();
        fetchCrops();
      }
    } catch (error) {
      console.error('Error saving crop:', error);
    }
  };

  const handleEdit = (crop: Crop) => {
    setFormData({
      name: crop.name,
      variety: crop.variety,
      scientificName: crop.scientificName || '',
      description: crop.description,
      category: crop.category || '',
      season: crop.season || '',
      region: crop.region.join(', '),
      imageUrl: crop.imageUrl || '',
    });
    setSelectedCrop(crop);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (cropId: string) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        const response = await fetch(`${API_BASE}/api/crops/${cropId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          fetchCrops();
        }
      } catch (error) {
        console.error('Error deleting crop:', error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      variety: '',
      scientificName: '',
      description: '',
      category: '',
      season: '',
      region: '',
      imageUrl: '',
    });
    setSelectedCrop(null);
    setModalMode('add');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 ">Crop Management</h2>
      <button
        onClick={openAddModal}
        className="mb-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add New Crop
      </button>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Crop ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Scientific Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Season</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {crops.map((crop) => (
                <tr
                  key={crop.cropId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{crop.cropId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.variety}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.scientificName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.category || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.season || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{crop.region.join(', ') || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(crop)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(crop.cropId)}
                        className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ease-in-out"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M7 7h10"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {pages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
          disabled={page === pages}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          Next
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Add Crop' : 'Edit Crop'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter crop name"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variety</label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="Enter variety"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scientific Name</label>
                  <input
                    type="text"
                    name="scientificName"
                    value={formData.scientificName}
                    onChange={handleInputChange}
                    placeholder="Enter scientific name"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                    rows={4}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    placeholder="Enter season"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region (comma separated)</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Enter regions"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  />
                </div>
              </form>
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              >
                {modalMode === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};