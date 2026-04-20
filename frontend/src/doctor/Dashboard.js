import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { doctorAPI } from '../../services/api';
import { CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    confirmed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments(user.id);
      const today = new Date().toISOString().split('T')[0];
      const todayApps = response.data.filter(
        apt => apt.appointmentDate === today && apt.status !== 'CANCELLED'
      );
      
      setTodayAppointments(todayApps);
      setStats({
        totalToday: todayApps.length,
        confirmed: todayApps.filter(apt => apt.status === 'CONFIRMED').length,
        pending: todayApps.filter(apt => apt.status === 'BOOKED').length
      });
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Today's Appointments",
      value: stats.totalToday,
      icon: CalendarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">Manage your schedule and appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
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
            to="/doctor/availability"
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white hover:from-primary-600 hover:to-primary-700 transition duration-200"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Availability</h3>
            <p className="text-primary-100">Set your available time slots</p>
          </Link>
          
          <Link
            to="/doctor/appointments"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition duration-200"
          >
            <h3 className="text-xl font-semibold mb-2">View Appointments</h3>
            <p className="text-green-100">Manage all your appointments</p>
          </Link>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
              <p className="text-sm text-gray-400 mt-2">Enjoy your day!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {todayAppointments
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {appointment.startTime.substring(0, 5)} - {appointment.endTime.substring(0, 5)}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mt-2">
                          Patient: {appointment.patientName}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
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

export default DoctorDashboard;