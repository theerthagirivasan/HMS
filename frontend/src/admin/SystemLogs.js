import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await adminAPI.getSystemLogs();
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError('System logs are unavailable from the backend. Showing local demo logs.');
        setLogs([
          { id: 1, time: '2026-03-17 10:02:34', level: 'INFO', message: 'System started successfully' },
          { id: 2, time: '2026-03-17 10:15:12', level: 'WARN', message: 'Doctor drsmith@hospital.com had a failed login attempt' },
          { id: 3, time: '2026-03-17 11:01:05', level: 'INFO', message: 'Appointment #A43 booked by patient John Patient' },
          { id: 4, time: '2026-03-17 11:20:18', level: 'ERROR', message: 'Failed to send email notification for appointment #A45' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-1">Monitor key application events and audit log entries.</p>
          {error && <div className="mt-3 text-sm text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">{error}</div>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-gray-500">No logs available.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id || `${log.time}-${log.level}`} className="border-t">
                        <td className="px-4 py-3 text-sm text-gray-700">{log.time}</td>
                        <td className={`px-4 py-3 text-sm font-semibold ${
                          log.level === 'ERROR' ? 'text-red-600' : log.level === 'WARN' ? 'text-yellow-700' : 'text-green-700'
                        }`}>{log.level}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{log.message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SystemLogs;
