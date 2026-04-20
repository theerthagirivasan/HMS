import { format, parse, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const formatTime = (time) => {
  return time.substring(0, 5);
};

export const formatDisplayDate = (date) => {
  return format(new Date(date), 'MMMM d, yyyy');
};

export const formatDisplayTime = (time) => {
  return format(parse(time, 'HH:mm:ss', new Date()), 'h:mm a');
};

export const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  let current = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  while (isBefore(current, end)) {
    const slotEnd = addMinutes(current, duration);
    if (!isAfter(slotEnd, end)) {
      slots.push({
        start: format(current, 'HH:mm'),
        end: format(slotEnd, 'HH:mm'),
      });
    }
    current = slotEnd;
  }

  return slots;
};

export const isTimeSlotOverlapping = (slot1, slot2) => {
  const start1 = parse(slot1.start, 'HH:mm', new Date());
  const end1 = parse(slot1.end, 'HH:mm', new Date());
  const start2 = parse(slot2.start, 'HH:mm', new Date());
  const end2 = parse(slot2.end, 'HH:mm', new Date());

  return (
    (isBefore(start1, end2) && isAfter(end1, start2)) ||
    isEqual(start1, start2)
  );
};

export const getWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEEE'),
      dayNumber: format(date, 'd'),
    });
  }
  
  return days;
};