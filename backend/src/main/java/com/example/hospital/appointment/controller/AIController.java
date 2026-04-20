package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AIRequestDTO;
import com.hospital.appointment.dto.AIResponseDTO;
import com.hospital.appointment.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AIResponseDTO> chat(@RequestBody AIRequestDTO request) {
        String reply = aiService.getChatResponse(request.getMessage(), request.getImage());
        return ResponseEntity.ok(new AIResponseDTO(reply));
    }
}
