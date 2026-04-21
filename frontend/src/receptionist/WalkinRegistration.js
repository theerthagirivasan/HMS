import React, { useState } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function WalkinRegistration() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await receptionistAPI.registerWalkinPatient(form);
      toast.success('Patient registered successfully');
      setForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Walk-in Patient Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="text" placeholder="Phone" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input type="password" placeholder="Password (default: patient123)" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary w-full">Register</button>
        </form>
      </div>
    </>
  );
}