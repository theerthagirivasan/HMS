import React, { useState } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);

  const handleSearch = async () => {
    const res = await receptionistAPI.searchPatients(query);
    setPatients(res.data);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <h2 className="text-2xl font-bold mb-4">Patient Search</h2>
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Name or Email" className="input-field" value={query} onChange={e => setQuery(e.target.value)} />
          <button onClick={handleSearch} className="btn-primary">Search</button>
        </div>
        <div className="space-y-3">
          {patients.map(p => (
            <div key={p.id} className="bg-white p-4 rounded shadow">
              <p className="font-bold">{p.name}</p>
              <p className="text-gray-600">{p.email}</p>
              {p.phone && <p className="text-sm text-gray-500">Phone: {p.phone}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}