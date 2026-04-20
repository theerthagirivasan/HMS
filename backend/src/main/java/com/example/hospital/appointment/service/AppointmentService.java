package com.example.hospital.appointment.service;

import com.example.hospital.appointment.dto.AppointmentRequestDTO;
import com.example.hospital.appointment.dto.AppointmentResponseDTO;
import com.example.hospital.appointment.dto.SlotDTO;
import com.example.hospital.appointment.entity.*;
import com.example.hospital.appointment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    private static final int SLOT_DURATION_MINUTES = 30;
    
    @Transactional
    public Appointment bookAppointment(AppointmentRequestDTO request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        LocalDate appointmentDate = request.getAppointmentDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = startTime.plusMinutes(SLOT_DURATION_MINUTES);
        
        // Check if patient has any overlapping appointment
        boolean patientOverlap = appointmentRepository.existsOverlappingAppointment(
                request.getPatientId(), appointmentDate, startTime, endTime);
        
        if (patientOverlap) {
            throw new RuntimeException("Patient already has an appointment at this time");
        }
        
        // Check if doctor has any overlapping appointment
        boolean doctorOverlap = appointmentRepository.existsOverlappingAppointment(
                request.getDoctorId(), appointmentDate, startTime, endTime);
        
        if (doctorOverlap) {
            throw new RuntimeException("Doctor already has an appointment at this time");
        }
        
        // Check if doctor is available at this time
        List<DoctorAvailability> availabilities = availabilityRepository
                .findByDoctorIdAndDate(request.getDoctorId(), appointmentDate);
        
        boolean isAvailable = availabilities.stream()
                .anyMatch(avail -> 
                    !avail.getIsBooked() &&
                    !startTime.isBefore(avail.getStartTime()) &&
                    !endTime.isAfter(avail.getEndTime()));
        
        if (!isAvailable) {
            throw new RuntimeException("Doctor is not available at this time");
        }
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.BOOKED);
        
        return appointmentRepository.save(appointment);
    }
    
    public List<SlotDTO> generateTimeSlots(Long doctorId, LocalDate date) {
        List<SlotDTO> slots = new ArrayList<>();
        
        List<DoctorAvailability> availabilities = availabilityRepository
                .findByDoctorIdAndDate(doctorId, date);
        
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndDate(doctorId, date);
        
        for (DoctorAvailability availability : availabilities) {
            LocalTime currentTime = availability.getStartTime();
            
            while (currentTime.isBefore(availability.getEndTime())) {
                LocalTime slotEnd = currentTime.plusMinutes(SLOT_DURATION_MINUTES);
                
                if (!slotEnd.isAfter(availability.getEndTime())) {
                    String status = "AVAILABLE";
                    
                    for (Appointment appointment : appointments) {
                        if (appointment.getStartTime().equals(currentTime) && 
                            appointment.getStatus() != AppointmentStatus.CANCELLED) {
                            status = "BOOKED";
                            break;
                        }
                    }
                    
                    slots.add(new SlotDTO(currentTime, slotEnd, status));
                }
                
                currentTime = slotEnd;
            }
        }
        
        return slots;
    }
    
    public AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getName());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getName());
        dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setCreatedAt(appointment.getCreatedAt());
        return dto;
    }
}