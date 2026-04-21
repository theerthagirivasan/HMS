import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { patientAPI } from '../../services/api';
import { CalendarIcon, MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await patientAPI.getMyAppointments(user.id);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = response.data
        .filter(apt => apt.appointmentDate >= today && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Appointments',
      value: upcomingAppointments.length,
      icon: CalendarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Available Doctors',
      value: '24+',
      icon: MagnifyingGlassIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Quick Booking',
      value: '30 min',
      icon: ClockIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your appointments and find the best doctors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/patient/search"
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white hover:from-primary-600 hover:to-primary-700 transition duration-200"
          >
            <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
            <p className="text-primary-100">Search for doctors by name or specialization</p>
          </Link>
          
          <Link
            to="/patient/appointments"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white hover:from-green-600 hover:to-green-700 transition duration-200"
          >
            <h3 className="text-xl font-semibold mb-2">My Appointments</h3>
            <p className="text-green-100">View and manage your upcoming appointments</p>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                to="/patient/search"
                className="inline-block mt-4 btn-primary"
              >
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Dr. {appointment.doctorName}
                      </h3>
                      <p className="text-sm text-primary-600">{appointment.doctorSpecialization}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                        <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                        {appointment.startTime.substring(0, 5)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;