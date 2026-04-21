import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import { ChartBarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    receptionistAPI.getDailyDashboard()
      .then(res => setStats(res.data))
      .catch(err => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Receptionist Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-gray-500">Patients Today</p>
            <p className="text-2xl font-bold">{stats?.totalPatientsToday || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <CurrencyDollarIcon className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-gray-500">Pending Payments</p>
            <p className="text-2xl font-bold">{stats?.pendingPayments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <ChartBarIcon className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-gray-500">Completed Appointments</p>
            <p className="text-2xl font-bold">{stats?.completedAppointments || 0}</p>
          </div>
        </div>
      </div>
    </>
  );
}