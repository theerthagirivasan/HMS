package com.example.hospital.appointment.dto;

import lombok.Data;

@Data
public class DoctorSearchDTO {
    private Long id;
    private String name;
    private String specialization;
    private String email;
}