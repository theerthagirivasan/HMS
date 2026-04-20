package com.example.hospital.appointment.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequestDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}