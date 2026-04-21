import React, { useState, useEffect } from 'react';
import { receptionistAPI, patientAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function QueueManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    patientAPI.searchDoctors().then(res => setDoctors(res.data));
    receptionistAPI.searchPatients('').then(res => setPatients(res.data));
  }, []);

  const fetchQueue = async () => {
    if (!selectedDoctor) return toast.error('Select a doctor');
    const res = await receptionistAPI.getCurrentQueue(selectedDoctor);
    setQueue(res.data);
  };

  const generateToken = async () => {
    if (!selectedPatient || !selectedDoctor) return toast.error('Select patient and doctor');
    const res = await receptionistAPI.generateToken(selectedPatient, selectedDoctor);
    toast.success(`Token ${res.data.tokenNumber} generated. Est. wait ${res.data.estimatedWaitMinutes} min`);
    fetchQueue();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <h2 className="text-2xl font-bold mb-4">Queue Management</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <select className="input-field mb-2" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input-field mb-2" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={generateToken} className="btn-primary">Generate Token</button>
            <button onClick={fetchQueue} className="btn-secondary">Refresh Queue</button>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Current Queue</h3>
          {queue.length === 0 && <p className="text-gray-500">No patients waiting</p>}
          {queue.map((q, idx) => (
            <div key={idx} className="border-b py-2 flex justify-between">
              <span>Token #{q.token}</span>
              <span>{q.patientName}</span>
              <span className="text-yellow-600">{q.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}