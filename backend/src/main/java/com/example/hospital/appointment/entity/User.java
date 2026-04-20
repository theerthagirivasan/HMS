package com.hospital.appointment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    private String specialization;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DoctorAvailability> availabilities;
    
    @OneToMany(mappedBy = "doctor")
    @JsonIgnore
    private List<Appointment> doctorAppointments;
    
    @OneToMany(mappedBy = "patient")
    @JsonIgnore
    private List<Appointment> patientAppointments;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}