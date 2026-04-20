import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CalendarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = () => {
  const [appointmentReports, setAppointmentReports] = useState(null);
  const [doctorReports, setDoctorReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { token } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        adminAPI.getAppointmentReports(),
        adminAPI.getDoctorReports()
      ]);

      setAppointmentReports(appointmentsRes.data);
      setDoctorReports(doctorsRes.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const appointmentStatusData = {
    labels: appointmentReports?.appointmentsByStatus 
      ? Object.keys(appointmentReports.appointmentsByStatus)
      : [],
    datasets: [
      {
        label: 'Appointments by Status',
        data: appointmentReports?.appointmentsByStatus 
          ? Object.values(appointmentReports.appointmentsByStatus)
          : [],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',  // BOOKED - Yellow
          'rgba(34, 197, 94, 0.8)',  // CONFIRMED - Green
          'rgba(59, 130, 246, 0.8)', // COMPLETED - Blue
          'rgba(239, 68, 68, 0.8)',  // CANCELLED - Red
        ],
        borderWidth: 1,
      },
    ],
  };

  const doctorPerformanceData = {
    labels: doctorReports.map(d => d.doctorName),
    datasets: [
      {
        label: 'Total Appointments',
        data: doctorReports.map(d => d.totalAppointments),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Monthly Appointments',
        data: doctorReports.map(d => d.monthlyAppointments),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      appointmentReports,
      doctorReports
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Overview of hospital performance</p>
          </div>
          <button
            onClick={handleExportReport}
            className="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Select Period:</span>
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition duration-200 ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {appointmentReports && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-3">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentReports.totalAppointments}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentReports.todayAppointments}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-lg p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Monthly</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointmentReports.monthlyStats?.currentMonth || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-lg p-3">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {doctorReports.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointment Status Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Appointment Status Distribution
            </h2>
            {appointmentReports?.appointmentsByStatus && (
              <div className="h-80">
                <Pie data={appointmentStatusData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Doctor Performance Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Doctor Performance
            </h2>
            {doctorReports.length > 0 && (
              <div className="h-80">
                <Bar data={doctorPerformanceData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Detailed Doctor Reports */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Detailed Doctor Reports
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Breakdown
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctorReports.map((doctor) => (
                  <tr key={doctor.doctorId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {doctor.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {doctor.totalAppointments}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doctor.monthlyAppointments}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {doctor.appointmentsByStatus && 
                          Object.entries(doctor.appointmentsByStatus).map(([status, count]) => (
                            count > 0 && (
                              <span
                                key={status}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                                  status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                  status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {status}: {count}
                              </span>
                            )
                          ))
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReports;