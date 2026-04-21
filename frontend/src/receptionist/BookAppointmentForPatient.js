import React, { useState, useEffect } from 'react';
import { receptionistAPI, patientAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import SlotGrid from '../../components/SlotGrid';
import toast from 'react-hot-toast';

export default function BookAppointmentForPatient() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    receptionistAPI.searchPatients('').then(res => setPatients(res.data));
    patientAPI.searchDoctors().then(res => setDoctors(res.data));
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      patientAPI.getAvailableSlots(selectedDoctor, selectedDate)
        .then(res => setSlots(res.data))
        .catch(() => setSlots([]));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please fill all fields and select a slot');
      return;
    }
    setLoading(true);
    try {
      await receptionistAPI.bookAppointmentForPatient({
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason
      });
      toast.success('Appointment booked');
      setSelectedSlot(null);
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Book Appointment for Patient</h2>
        <div className="space-y-4">
          <select className="input-field" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
          </select>
          <select className="input-field" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
          </select>
          <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          {slots.length > 0 && (
            <div>
              <label className="block font-medium mb-2">Select Time Slot</label>
              <SlotGrid slots={slots} selectedSlot={selectedSlot} onSlotSelect={setSelectedSlot} />
            </div>
          )}
          <textarea placeholder="Reason (optional)" className="input-field" value={reason} onChange={e => setReason(e.target.value)} />
          <button onClick={handleBook} disabled={loading} className="btn-primary w-full">Book Appointment</button>
        </div>
      </div>
    </>
  );
}