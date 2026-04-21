import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Billing() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [bills, setBills] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentBillId, setPaymentBillId] = useState('');

  useEffect(() => {
    receptionistAPI.searchPatients('').then(res => setPatients(res.data));
  }, []);

  const generateBill = async () => {
    if (!selectedPatient || !amount) return toast.error('Patient and amount required');
    try {
      await receptionistAPI.generateBill({ patientId: selectedPatient, amount, description });
      toast.success('Bill generated');
      setAmount('');
      setDescription('');
      // refresh bills list (optional)
    } catch (err) {
      toast.error('Failed to generate bill');
    }
  };

  const processPayment = async () => {
    if (!paymentBillId) return toast.error('Enter Bill ID');
    try {
      await receptionistAPI.processPayment({ billId: paymentBillId, amount, method: paymentMethod });
      toast.success('Payment recorded');
      setPaymentBillId('');
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Billing</h2>
        <div className="space-y-4">
          <select className="input-field" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Amount" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} />
          <input type="text" placeholder="Description" className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
          <button onClick={generateBill} className="btn-primary w-full">Generate Bill</button>

          <hr className="my-4" />
          <h3 className="text-xl font-semibold">Process Payment</h3>
          <input type="text" placeholder="Bill ID" className="input-field" value={paymentBillId} onChange={e => setPaymentBillId(e.target.value)} />
          <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>
          <button onClick={processPayment} className="btn-secondary w-full">Record Payment</button>
        </div>
      </div>
    </>
  );
}