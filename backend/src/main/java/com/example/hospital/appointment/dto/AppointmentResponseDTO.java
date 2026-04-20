package com.example.hospital.appointment.dto;

import lombok.Data;
import com.example.hospital.appointment.entity.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class AppointmentResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String reason;
    private LocalDateTime createdAt;
}