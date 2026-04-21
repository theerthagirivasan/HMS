import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function LabTestBooking() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', labTestId: '', bookingDate: '' });

  useEffect(() => {
    receptionistAPI.getAllLabTests().then(res => setTests(res.data));
    receptionistAPI.searchPatients('').then(res => setPatients(res.data));
  }, []);

  const handleBook = async () => {
    if (!form.patientId || !form.labTestId || !form.bookingDate) {
      return toast.error('All fields required');
    }
    try {
      await receptionistAPI.bookLabTest(form);
      toast.success('Lab test booked');
      setForm({ patientId: '', labTestId: '', bookingDate: '' });
    } catch (err) {
      toast.error('Booking failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Book Lab Test</h2>
        <select className="input-field mb-3" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
          <option value="">Select Patient</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input-field mb-3" value={form.labTestId} onChange={e => setForm({...form, labTestId: e.target.value})}>
          <option value="">Select Test</option>
          {tests.map(t => <option key={t.id} value={t.id}>{t.name} - ₹{t.price}</option>)}
        </select>
        <input type="date" className="input-field mb-3" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} />
        <button onClick={handleBook} className="btn-primary w-full">Book</button>
      </div>
    </>
  );
}