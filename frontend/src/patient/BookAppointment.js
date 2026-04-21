import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import SlotGrid from '../../components/SlotGrid';
import { CalendarIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchDoctorAndAvailability();
  }, [doctorId]);

  const fetchDoctorAndAvailability = async () => {
    try {
      setLoading(true);
      const doctorResponse = await patientAPI.searchDoctors();
      const foundDoctor = doctorResponse.data.find(d => d.id === parseInt(doctorId));
      
      if (!foundDoctor) {
        toast.error('Doctor not found');
        navigate('/patient/search');
        return;
      }
      
      setDoctor(foundDoctor);
      
      // Fetch availability for next 30 days
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
      }

      const availabilityData = [];
      for (const date of dates) {
        try {
          const slotsResponse = await patientAPI.getAvailableSlots(doctorId, date);
          if (slotsResponse.data && slotsResponse.data.length > 0) {
            availabilityData.push({
              date: date,
              slots: slotsResponse.data
            });
          }
        } catch (error) {
          // Continue if no slots available for this date
          continue;
        }
      }

      setAvailability(availabilityData);
      
      // Set default date to first available date
      if (availabilityData.length > 0) {
        setSelectedDate(availabilityData[0].date);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor information');
      navigate('/patient/search');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot); // Store the entire slot object
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    try {
      setBooking(true);
      
      const appointmentData = {
        doctorId: parseInt(doctorId),
        patientId: user.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason: reason.trim()
      };

      await patientAPI.bookAppointment(appointmentData);
      
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Booking error:', error);
      const message = error.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Doctor information could not be loaded</p>
        </div>
      </div>
    );
  }

  const slots = selectedDate 
    ? availability.find(a => a.date === selectedDate)?.slots || []
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-500">ID: {doctor.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Book an Appointment</h3>

          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-5 h-5 inline mr-2" />
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a date</option>
                {availability.map((avail) => (
                  <option key={avail.date} value={avail.date}>
                    {new Date(avail.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && slots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <ClockIcon className="w-5 h-5 inline mr-2" />
                  Select Time Slot
                </label>
                <SlotGrid 
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                />
              </div>
            )}

            {selectedDate && slots.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">No available time slots for the selected date.</p>
              </div>
            )}

            {/* Reason for Appointment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Appointment
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Booking Summary */}
            {selectedSlot && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Doctor:</strong> {doctor.name}</li>
                  <li><strong>Specialization:</strong> {doctor.specialization}</li>
                  <li><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</li>
                  <li><strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/patient/search')}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSlot || booking}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
