package com.example.hospital.appointment.controller;

import com.example.hospital.appointment.dto.DoctorAvailabilityDTO;
import com.example.hospital.appointment.dto.AppointmentResponseDTO;
import com.example.hospital.appointment.entity.DoctorAvailability;
import com.example.hospital.appointment.entity.User;
import com.example.hospital.appointment.entity.Appointment;
import com.example.hospital.appointment.entity.AppointmentStatus;
import com.example.hospital.appointment.repository.UserRepository;
import com.example.hospital.appointment.repository.DoctorAvailabilityRepository;
import com.example.hospital.appointment.repository.AppointmentRepository;
import com.example.hospital.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctor")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @PostMapping("/availability")
    public ResponseEntity<?> addAvailability(@Valid @RequestBody DoctorAvailabilityDTO availabilityDTO) {
        User doctor = userRepository.findById(availabilityDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        boolean exists = availabilityRepository.existsByDoctorAndAvailableDateAndStartTimeAndEndTime(
                doctor, availabilityDTO.getAvailableDate(), 
                availabilityDTO.getStartTime(), availabilityDTO.getEndTime());
        
        if (exists) {
            return ResponseEntity.badRequest().body("Availability slot already exists");
        }
        
        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setAvailableDate(availabilityDTO.getAvailableDate());
        availability.setStartTime(availabilityDTO.getStartTime());
        availability.setEndTime(availabilityDTO.getEndTime());
        availability.setIsBooked(false);
        
        availabilityRepository.save(availability);
        
        return ResponseEntity.ok("Availability added successfully");
    }
    
    @GetMapping("/availability/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> getAvailability(
            @PathVariable Long doctorId, 
            @RequestParam(required = false) LocalDate date) {
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<DoctorAvailability> availabilities;
        if (date != null) {
            availabilities = availabilityRepository.findByDoctorAndAvailableDateOrderByStartTime(doctor, date);
        } else {
            availabilities = availabilityRepository.findByDoctorAndAvailableDateOrderByStartTime(doctor, LocalDate.now());
        }
        
        return ResponseEntity.ok(availabilities);
    }
    
    @GetMapping("/appointments/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointments(@PathVariable Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);
        
        List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                .map(appointmentService::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(appointmentDTOs);
    }
    
    @PutMapping("/appointments/{appointmentId}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            return ResponseEntity.badRequest().body("Appointment cannot be confirmed");
        }
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok("Appointment confirmed successfully");
    }
    
    @PutMapping("/appointments/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            return ResponseEntity.badRequest().body("Only confirmed appointments can be completed");
        }
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok("Appointment completed successfully");
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CONFIRMED ||
            appointment.getStatus() == AppointmentStatus.COMPLETED) {
            return ResponseEntity.badRequest().body("Cannot reject confirmed or completed appointments");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok("Appointment rejected successfully");
    }
}