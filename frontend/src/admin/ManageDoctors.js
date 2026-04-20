import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await adminAPI.deleteDoctor(doctorId);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Could not delete doctor');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-gray-600 mt-1">View, edit and delete doctor accounts.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
            </button>
            <button
              onClick={() => navigate('/admin/create-doctor')}
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add Doctor
            </button>
          </div>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No doctors found.</td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-t">
                        <td className="px-4 py-3">{doctor.name}</td>
                        <td className="px-4 py-3">{doctor.email}</td>
                        <td className="px-4 py-3">{doctor.specialization || 'N/A'}</td>
                        <td className="px-4 py-3">{doctor.role}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteDoctor(doctor.id)}
                            className="btn-danger inline-flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" /> Delete
                          </button>
                        </td>
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

export default ManageDoctors;
