import React, { useState } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function PrescriptionDispense() {
  const [code, setCode] = useState('');
  const [dispensedInfo, setDispensedInfo] = useState(null);

  const handleDispense = async () => {
    if (!code) return toast.error('Enter prescription code');
    try {
      const res = await receptionistAPI.dispensePrescription({ prescriptionCode: code });
      toast.success('Medicine dispensed');
      setDispensedInfo(res.data);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or already dispensed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Pharmacy – Dispense Medicine</h2>
        <input type="text" placeholder="Enter Prescription Code" className="input-field mb-4" value={code} onChange={e => setCode(e.target.value)} />
        <button onClick={handleDispense} className="btn-primary w-full">Verify & Dispense</button>
        {dispensedInfo && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="font-semibold">Dispensed: {dispensedInfo.medicines}</p>
          </div>
        )}
      </div>
    </>
  );
}