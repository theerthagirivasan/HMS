package com.example.hospital.appointment.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class SlotDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private Long appointmentId;
    
    public SlotDTO(LocalTime startTime, LocalTime endTime, String status) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }
}