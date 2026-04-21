import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

import ReceptionistDashboard from './pages/receptionist/Dashboard';
import WalkinRegistration from './pages/receptionist/WalkinRegistration';
import BookAppointmentForPatient from './pages/receptionist/BookAppointmentForPatient';
import Billing from './pages/receptionist/Billing';
import PrescriptionDispense from './pages/receptionist/PrescriptionDispense';
import QueueManagement from './pages/receptionist/QueueManagement';
import LabTestBooking from './pages/receptionist/LabTestBooking';
import PatientSearch from './pages/receptionist/PatientSearch';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import AddAvailability from './pages/doctor/AddAvailability';
import DoctorAppointments from './pages/doctor/Appointments';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CreateDoctor from './pages/admin/CreateDoctor';
import AdminReports from './pages/admin/Reports';
import ManageDoctors from './pages/admin/ManageDoctors';
import SystemLogs from './pages/admin/SystemLogs';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={
            <PrivateRoute role="PATIENT">
              <PatientDashboard />
            </PrivateRoute>
          } />
          <Route path="/patient/search" element={
            <PrivateRoute role="PATIENT">
              <DoctorSearch />
            </PrivateRoute>
          } />
          <Route path="/patient/book/:doctorId" element={
            <PrivateRoute role="PATIENT">
              <BookAppointment />
            </PrivateRoute>
          } />
          <Route path="/patient/appointments" element={
            <PrivateRoute role="PATIENT">
              <MyAppointments />
            </PrivateRoute>
          } />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <PrivateRoute role="DOCTOR">
              <DoctorDashboard />
            </PrivateRoute>
          } />
          <Route path="/doctor/availability" element={
            <PrivateRoute role="DOCTOR">
              <AddAvailability />
            </PrivateRoute>
          } />
          <Route path="/doctor/appointments" element={
            <PrivateRoute role="DOCTOR">
              <DoctorAppointments />
            </PrivateRoute>
          } />

          {/* Receptionist Routes */}
<Route path="/receptionist" element={<PrivateRoute role="RECEPTIONIST"><ReceptionistDashboard /></PrivateRoute>} />
<Route path="/receptionist/register" element={<PrivateRoute role="RECEPTIONIST"><WalkinRegistration /></PrivateRoute>} />
<Route path="/receptionist/book-appointment" element={<PrivateRoute role="RECEPTIONIST"><BookAppointmentForPatient /></PrivateRoute>} />
<Route path="/receptionist/billing" element={<PrivateRoute role="RECEPTIONIST"><Billing /></PrivateRoute>} />
<Route path="/receptionist/prescriptions" element={<PrivateRoute role="RECEPTIONIST"><PrescriptionDispense /></PrivateRoute>} />
<Route path="/receptionist/queue" element={<PrivateRoute role="RECEPTIONIST"><QueueManagement /></PrivateRoute>} />
<Route path="/receptionist/lab-tests" element={<PrivateRoute role="RECEPTIONIST"><LabTestBooking /></PrivateRoute>} />
<Route path="/receptionist/patients" element={<PrivateRoute role="RECEPTIONIST"><PatientSearch /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute role="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/create-doctor" element={
            <PrivateRoute role="ADMIN">
              <CreateDoctor />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute role="ADMIN">
              <AdminReports />
            </PrivateRoute>
          } />
          <Route path="/admin/doctors" element={
            <PrivateRoute role="ADMIN">
              <ManageDoctors />
            </PrivateRoute>
          } />
          <Route path="/admin/logs" element={
            <PrivateRoute role="ADMIN">
              <SystemLogs />
            </PrivateRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;