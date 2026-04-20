package com.example.hospital.appointment.config;

import com.example.hospital.appointment.entity.User;
import com.example.hospital.appointment.entity.Role;
import com.example.hospital.appointment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            System.out.println("=== Starting Data Initialization ===");
            
            // Create Admin
            if (userRepository.findByEmail("admin@hospital.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@hospital.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("✓ Admin user created");
            }
            
            // Create Doctors
            if (userRepository.findByEmail("drsmith@hospital.com").isEmpty()) {
                User doctor = new User();
                doctor.setName("Dr. Smith");
                doctor.setEmail("drsmith@hospital.com");
                doctor.setPassword(passwordEncoder.encode("doctor123"));
                doctor.setRole(Role.DOCTOR);
                doctor.setSpecialization("Cardiology");
                userRepository.save(doctor);
                System.out.println("✓ Dr. Smith created");
            }
            
            if (userRepository.findByEmail("drjohnson@hospital.com").isEmpty()) {
                User doctor2 = new User();
                doctor2.setName("Dr. Johnson");
                doctor2.setEmail("drjohnson@hospital.com");
                doctor2.setPassword(passwordEncoder.encode("doctor123"));
                doctor2.setRole(Role.DOCTOR);
                doctor2.setSpecialization("Neurology");
                userRepository.save(doctor2);
                System.out.println("✓ Dr. Johnson created");
            }
            
            // Create Patients
            if (userRepository.findByEmail("john@email.com").isEmpty()) {
                User patient = new User();
                patient.setName("John Patient");
                patient.setEmail("john@email.com");
                patient.setPassword(passwordEncoder.encode("patient123"));
                patient.setRole(Role.PATIENT);
                userRepository.save(patient);
                System.out.println("✓ John Patient created");
            }
            
            if (userRepository.findByEmail("jane@email.com").isEmpty()) {
                User patient2 = new User();
                patient2.setName("Jane Doe");
                patient2.setEmail("jane@email.com");
                patient2.setPassword(passwordEncoder.encode("patient123"));
                patient2.setRole(Role.PATIENT);
                userRepository.save(patient2);
                System.out.println("✓ Jane Doe created");
            }
            
            // Display all users
            System.out.println("\n=== Users in Database ===");
            userRepository.findAll().forEach(user -> {
                System.out.println("ID: " + user.getId() + 
                                 ", Name: " + user.getName() + 
                                 ", Email: " + user.getEmail() + 
                                 ", Role: " + user.getRole() +
                                 (user.getSpecialization() != null ? ", Spec: " + user.getSpecialization() : ""));
            });
            
            System.out.println("=== Data Initialization Complete ===\n");
        };
    }
}