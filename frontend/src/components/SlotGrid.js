import React from 'react';

const SlotGrid = ({ slots, selectedSlot, onSlotSelect }) => {
  const getSlotClass = (slot) => {
    if (selectedSlot && selectedSlot.startTime === slot.startTime) {
      return 'slot-selected';
    }
    if (slot.status === 'BOOKED') {
      return 'slot-booked';
    }
    return 'slot-available';
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // Format "HH:MM:SS" to "HH:MM"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {slots.map((slot, index) => (
        <button
          key={index}
          onClick={() => slot.status === 'AVAILABLE' && onSlotSelect(slot)}
          disabled={slot.status === 'BOOKED'}
          className={`p-4 border rounded-lg text-center transition-all duration-200 transform hover:scale-105 ${
            getSlotClass(slot)
          }`}
        >
          <div className="font-semibold">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </div>
          <div className="text-sm mt-2 capitalize">
            {slot.status}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlotGrid;