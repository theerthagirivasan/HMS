package com.hospital.appointment.controller;

import com.hospital.appointment.dto.LoginRequest;
import com.hospital.appointment.dto.RegisterRequest;
import com.hospital.appointment.dto.AuthResponse;
import com.hospital.appointment.entity.User;
import com.hospital.appointment.entity.Role;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.JwtUtils;
import com.hospital.appointment.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            
            return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getId(), 
                    userDetails.getName(), userDetails.getEmail(), role));
        } catch (AuthenticationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, String> response = new HashMap<>();
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            response.put("message", "Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        
        if (registerRequest.getRole() == Role.DOCTOR) {
            if (registerRequest.getSpecialization() == null || registerRequest.getSpecialization().trim().isEmpty()) {
                response.put("message", "Specialization is required for doctors");
                return ResponseEntity.badRequest().body(response);
            }
            user.setSpecialization(registerRequest.getSpecialization());
        }
        
        try {
            User savedUser = userRepository.save(user);
            response.put("message", "User registered successfully!");
            response.put("userId", savedUser.getId().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}