package com.hospital.appointment.controller;

import com.hospital.appointment.dto.RegisterRequest;
import com.hospital.appointment.dto.DoctorSearchDTO;
import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.Role;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ReportService reportService;
    
    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(@Valid @RequestBody RegisterRequest doctorRequest) {
        if (userRepository.existsByEmail(doctorRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }
        
        User doctor = new User();
        doctor.setName(doctorRequest.getName());
        doctor.setEmail(doctorRequest.getEmail());
        doctor.setPassword(passwordEncoder.encode(doctorRequest.getPassword()));
        doctor.setRole(Role.DOCTOR);
        doctor.setSpecialization(doctorRequest.getSpecialization());
        
        userRepository.save(doctor);
        
        return ResponseEntity.ok("Doctor created successfully!");
    }
    
    @PostMapping("/receptionists")
    public ResponseEntity<?> createReceptionist(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }
        
        User receptionist = new User();
        receptionist.setName(request.getName());
        receptionist.setEmail(request.getEmail());
        receptionist.setPassword(passwordEncoder.encode(request.getPassword()));
        receptionist.setRole(Role.RECEPTIONIST);
        
        userRepository.save(receptionist);
        
        return ResponseEntity.ok("Receptionist created successfully!");
    }
    
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorSearchDTO>> getAllDoctors() {
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
        
        List<DoctorSearchDTO> doctorDTOs = doctors.stream()
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
    
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        User doctor = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        if (doctor.getRole() != Role.DOCTOR) {
            return ResponseEntity.badRequest().body("User is not a doctor");
        }
        
        userRepository.delete(doctor);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
    
    @GetMapping("/reports/appointments")
    public ResponseEntity<Map<String, Object>> getAppointmentReports() {
        return ResponseEntity.ok(reportService.getAppointmentReports());
    }
    
    @GetMapping("/reports/doctors")
    public ResponseEntity<List<Map<String, Object>>> getDoctorReports() {
        return ResponseEntity.ok(reportService.getDoctorReports());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, String>>> getSystemLogs() {
        List<Map<String, String>> logs = List.of(
            Map.of("id", "1", "time", "2026-03-17 10:02:34", "level", "INFO", "message", "System started successfully"),
            Map.of("id", "2", "time", "2026-03-17 10:15:12", "level", "WARN", "message", "Doctor drsmith@hospital.com had failed login attempt"),
            Map.of("id", "3", "time", "2026-03-17 11:01:05", "level", "INFO", "message", "Appointment #A43 booked by patient John Patient"),
            Map.of("id", "4", "time", "2026-03-17 11:20:18", "level", "ERROR", "message", "Failed to send email notification for appointment #A45")
        );
        return ResponseEntity.ok(logs);
    }
}