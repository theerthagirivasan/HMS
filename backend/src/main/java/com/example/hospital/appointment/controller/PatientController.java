package com.hospital.appointment.controller;

import com.hospital.appointment.dto.*;
import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.Role;
import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.entity.AppointmentStatus;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/patient")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @GetMapping("/doctors/search")
    public ResponseEntity<List<DoctorSearchDTO>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization) {
        
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
        
        List<DoctorSearchDTO> doctorDTOs = doctors.stream()
                .filter(doctor -> {
                    if (name != null && !doctor.getName().toLowerCase().contains(name.toLowerCase())) {
                        return false;
                    }
                    if (specialization != null && !doctor.getSpecialization().toLowerCase().contains(specialization.toLowerCase())) {
                        return false;
                    }
                    return true;
                })
                .map(doctor -> {
                    DoctorSearchDTO dto = new DoctorSearchDTO();
                    dto.setId(doctor.getId());
                    dto.setName(doctor.getName());
                    dto.setSpecialization(doctor.getSpecialization());
                    dto.setEmail(doctor.getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(doctorDTOs);
    }
    
    @GetMapping("/doctors/{doctorId}/slots")
    public ResponseEntity<List<SlotDTO>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<SlotDTO> slots = appointmentService.generateTimeSlots(doctorId, date);
        
        return ResponseEntity.ok(slots);
    }
    
    @PostMapping("/appointments/book")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentRequestDTO appointmentRequest) {
        try {
            Appointment appointment = appointmentService.bookAppointment(appointmentRequest);
            AppointmentResponseDTO response = appointmentService.convertToDTO(appointment);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/appointments/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getPatientAppointments(@PathVariable Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<Appointment> appointments = appointmentRepository.findByPatient(patient);
        
        List<AppointmentResponseDTO> appointmentDTOs = appointments.stream()
                .map(appointmentService::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(appointmentDTOs);
    }
    
    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED || 
            appointment.getStatus() == AppointmentStatus.COMPLETED) {
            return ResponseEntity.badRequest().body("Cannot cancel confirmed or completed appointments");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok("Appointment cancelled successfully");
    }
}