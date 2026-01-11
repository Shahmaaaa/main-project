import React, { useState } from 'react';
import { useDisasterStore } from '../store';
import { FiUpload, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    disaster_type: '',
    location: '',
    rainfall_mm: '',
    water_level_cm: '',
    population_affected: '',
    infrastructure_damage: '',
    impact_area: '',
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const createEvent = useDisasterStore((state) => state.createEvent);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });
      if (image) {
        fd.append('image', image);
      }

      const result = await createEvent(fd);
      toast.success(`Event created with severity: ${result.severity_level}`);
      
      setFormData({
        disaster_type: '',
        location: '',
        rainfall_mm: '',
        water_level_cm: '',
        population_affected: '',
        infrastructure_damage: '',
        impact_area: '',
      });
      setImage(null);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <FiAlertTriangle className="w-8 h-8 text-red-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Report Disaster Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Disaster Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disaster Type
            </label>
            <select
              name="disaster_type"
              value={formData.disaster_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select disaster type</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="cyclone">Cyclone</option>
              <option value="landslide">Landslide</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter affected location"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disaster Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="hidden"
                />
              </label>
            </div>
            {image && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <FiCheckCircle className="mr-2" />
                {image.name}
              </p>
            )}
          </div>

          {/* Rainfall Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rainfall Intensity (mm)
            </label>
            <input
              type="number"
              name="rainfall_mm"
              value={formData.rainfall_mm}
              onChange={handleInputChange}
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Water Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Level (cm)
            </label>
            <input
              type="number"
              name="water_level_cm"
              value={formData.water_level_cm}
              onChange={handleInputChange}
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Population Affected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Population Affected
            </label>
            <input
              type="number"
              name="population_affected"
              value={formData.population_affected}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Infrastructure Damage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infrastructure Damage (%)
            </label>
            <input
              type="number"
              name="infrastructure_damage"
              value={formData.infrastructure_damage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Impact Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact Area (sq km)
            </label>
            <input
              type="number"
              name="impact_area"
              value={formData.impact_area}
              onChange={handleInputChange}
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Processing...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
