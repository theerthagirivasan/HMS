import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  UserPlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    monthlyAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        adminAPI.getAllDoctors(),
        adminAPI.getAppointmentReports()
      ]);

      setStats({
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointmentsRes.data.totalAppointments || 0,
        todayAppointments: appointmentsRes.data.todayAppointments || 0,
        monthlyAppointments: appointmentsRes.data.monthlyStats?.currentMonth || 0
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Doctor',
      description: 'Add a new doctor to the system',
      icon: UserPlusIcon,
      path: '/admin/create-doctor',
      color: 'bg-primary-500',
    },
    {
      title: 'View Reports',
      description: 'Access detailed analytics and reports',
      icon: ChartBarIcon,
      path: '/admin/reports',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Doctors',
      description: 'View and manage doctor accounts',
      icon: UserGroupIcon,
      path: '/admin/doctors',
      color: 'bg-purple-500',
    },
  ];

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: CalendarIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Monthly Appointments',
      value: stats.monthlyAppointments,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">Manage your hospital system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
