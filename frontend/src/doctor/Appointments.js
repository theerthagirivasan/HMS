import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AppointmentCard from '../../components/AppointmentCard';
import { CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, dateFilter, appointments]);

  const fetchAppointments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await doctorAPI.getAppointments(user.id);
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments. Please reload and login again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'ALL') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      if (dateFilter === 'TODAY') {
        filtered = filtered.filter(apt => apt.appointmentDate === today);
      } else if (dateFilter === 'TOMORROW') {
        filtered = filtered.filter(apt => apt.appointmentDate === tomorrow);
      } else if (dateFilter === 'UPCOMING') {
        filtered = filtered.filter(apt => apt.appointmentDate >= today);
      }
    }

    setFilteredAppointments(filtered);
  };

  const handleConfirm = async (appointmentId) => {
    try {
      await doctorAPI.confirmAppointment(appointmentId);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to confirm appointment');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await doctorAPI.completeAppointment(appointmentId);
      toast.success('Appointment completed');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      await doctorAPI.cancelAppointment(appointmentId);
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to reject appointment');
    }
  };

  const statuses = ['ALL', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const dates = ['ALL', 'TODAY', 'TOMORROW', 'UPCOMING'];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage all your appointments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                      statusFilter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <div className="flex flex-wrap gap-2">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                      dateFilter === date
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <CalendarIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {statusFilter === 'ALL' 
                ? "You don't have any appointments yet"
                : `No ${statusFilter.toLowerCase()} appointments`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
                onCancel={handleReject}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorAppointments;