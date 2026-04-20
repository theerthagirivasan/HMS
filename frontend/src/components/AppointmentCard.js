import React from 'react';
import { CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const AppointmentCard = ({ appointment, onConfirm, onComplete, onCancel, showActions = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
      appointment.status === 'BOOKED' ? 'border-yellow-500' :
      appointment.status === 'CONFIRMED' ? 'border-green-500' :
      appointment.status === 'COMPLETED' ? 'border-blue-500' :
      'border-red-500'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.doctorName || appointment.patientName}
              </h3>
              {appointment.doctorSpecialization && (
                <p className="text-sm text-primary-600">{appointment.doctorSpecialization}</p>
              )}
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="text-sm font-medium">{appointment.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{appointment.startTime.substring(0, 5)} - {appointment.endTime.substring(0, 5)}</span>
          </div>
        </div>

        {appointment.reason && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason for Visit:</p>
            <p className="text-sm text-gray-600">{appointment.reason}</p>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
            {appointment.status === 'BOOKED' && (
              <button
                onClick={() => onConfirm(appointment.id)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                Confirm
              </button>
            )}
            {appointment.status === 'CONFIRMED' && (
              <button
                onClick={() => onComplete(appointment.id)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Complete
              </button>
            )}
            {appointment.status === 'BOOKED' && (
              <button
                onClick={() => onCancel(appointment.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;