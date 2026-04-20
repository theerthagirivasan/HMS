import React, { useState } from 'react';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { PlusIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../../utils/dateUtils';

const AddAvailability = () => {
  const { user, token } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [formData, setFormData] = useState({
    availableDate: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    
    if (!formData.availableDate || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate time range
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const availabilityData = {
        doctorId: user.id,
        availableDate: formData.availableDate,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00'
      };

      await doctorAPI.addAvailability(availabilityData);

      toast.success('Availability added successfully');
      setAvailabilities([...availabilities, availabilityData]);
      setFormData({ availableDate: '', startTime: '', endTime: '' });
    } catch (error) {
      toast.error(error.response?.data || 'Failed to add availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
          <p className="text-gray-600 mt-2">Add your available time slots for appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Availability Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-primary-600" />
              Add New Availability
            </h2>
            
            <form onSubmit={handleAddAvailability} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="availableDate"
                  value={formData.availableDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Availability
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Availabilities */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
              Your Availabilities
            </h2>
            
            {availabilities.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No availabilities added yet</p>
                <p className="text-sm text-gray-400 mt-1">Use the form to add your available slots</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availabilities.map((avail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDisplayDate(avail.availableDate)}
                      </p>
                      <p className="text-sm text-primary-600">
                        {avail.startTime.substring(0, 5)} - {avail.endTime.substring(0, 5)}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="font-semibold text-primary-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Appointments are automatically generated in 30-minute slots</li>
            <li>• You can add availability for any future date</li>
            <li>• Patients can only book within your available time slots</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AddAvailability;