package com.hospital.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
a
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequestDTO {
    private String message;
    private String image; // base64 (optional)
}
