package com.hospital.appointment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class AIService {

    @Value("${google.ai.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AIService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = objectMapper;
    }

    private final String SYSTEM_PROMPT = """
            You are a helpful medical assistant chatbot integrated into a hospital system.
            Your job is to provide useful, practical, and easy-to-understand health guidance.

            Rules:
            - If the user greets you (e.g., "Hi", "Hello"), respond politely and ask how you can help with their health concerns.
            - Primarily focus on health and medical-related queries.
            - For non-medical questions that are not greetings, politely explain that you are a medical assistant and can only help with health-related topics.

            - DO provide general explanations about symptoms and possible causes.
            - DO suggest simple precautions (rest, hydration, hygiene).
            - DO ask 1–2 follow-up questions if needed to understand the user's situation better.

            - DO NOT provide exact diagnoses.
            - DO NOT prescribe specific medicines or dosages.

            - When responding to a medical query:
              1. Explain possible causes (without diagnosing)
              2. Give simple advice (rest, see a doctor, etc.)
              3. Ask follow-up questions
              4. End with: "Please consult a doctor for proper diagnosis."

            - If an image is provided:
              - Describe what you see in general terms.
              - Ask clarifying questions (e.g., "Is it itchy?", "How long has it been there?").
            """;

    public String getChatResponse(String userMessage, String base64Image) {
        try {
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return "How can I help you today? Please describe your symptoms or ask a health-related question.";
            }

            Map<String, Object> requestBody = new HashMap<>();

//            // System instruction
//            Map<String, Object> systemInstruction = new HashMap<>();
//            List<Map<String, Object>> systemParts = new ArrayList<>();
//            Map<String, Object> systemText = new HashMap<>();
//            systemText.put("text", SYSTEM_PROMPT);
//            systemParts.add(systemText);
//            systemInstruction.put("parts", systemParts);
//            requestBody.put("systemInstruction", systemInstruction);

            // User content
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();

            Map<String, Object> userText = new HashMap<>();
            userText.put("text", userMessage);
            parts.add(userText);

            if (base64Image != null && !base64Image.isEmpty()) {
                Map<String, Object> imagePart = new HashMap<>();
                Map<String, Object> inlineData = new HashMap<>();
                String mimeType = "image/jpeg";
                String data = base64Image;

                if (base64Image.startsWith("data:")) {
                    mimeType = base64Image.substring(5, base64Image.indexOf(";"));
                    data = base64Image.substring(base64Image.indexOf(",") + 1);
                }

                inlineData.put("mime_type", mimeType);
                inlineData.put("data", data);
                imagePart.put("inline_data", inlineData);
                parts.add(imagePart);
            }

            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Call Gemini API - try v1 endpoint for better compatibility
            String jsonResponse = webClient.post()
                    .uri("/v1beta/models/gemini-flash-latest:generateContent")
                    .header("X-goog-api-key", apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");

            if (!candidates.isArray() || candidates.size() == 0) {
                System.err.println("Gemini API Error: " + jsonResponse);
                return "I'm having trouble connecting to my knowledge base. Please try again in a moment.";
            }

            String aiText = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

//            if (aiText.toLowerCase().contains("mg") || aiText.toLowerCase().contains("tablet") || aiText.toLowerCase().contains("prescribe")) {
//                System.out.println("AI tried to prescribe: " + aiText);
//                return "For safety reasons, I cannot provide specific medication dosages or prescriptions. Please consult a qualified physician for a proper prescription.";
//            }

            return aiText;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("AI Service Error: " + e.getMessage());
            
            // Fallback: Provide a helpful response based on user message
            // return provideFallbackResponse(userMessage);
            return "API ERROR: " + e.getMessage();
        }
    }

    private String provideFallbackResponse(String userMessage) {
        // Fallback responses to maintain chatbot functionality when API is unavailable
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("fever") || lowerMessage.contains("temperature")) {
            return "Based on your concern about fever, here are some general suggestions:\n\n" +
                    "1. Keep yourself hydrated - drink plenty of water and fluids\n" +
                    "2. Get adequate rest to help your body recover\n" +
                    "3. Maintain a cool environment and wear light clothing\n" +
                    "4. Monitor your temperature regularly\n\n" +
                    "If your fever persists for more than 3 days or reaches 103°F (39.4°C), please consult a doctor immediately.\n\n"
                    +
                    "Is there anything else about your symptoms?";
        } else if (lowerMessage.contains("cold") || lowerMessage.contains("cough")) {
            return "For cold and cough symptoms, consider these general steps:\n\n" +
                    "1. Stay hydrated - drink warm water, herbal tea, and chicken broth\n" +
                    "2. Get plenty of rest to support your immune system\n" +
                    "3. Use a humidifier to ease congestion\n" +
                    "4. Gargle with warm salt water for sore throat relief\n" +
                    "5. Maintain good hygiene to prevent spreading to others\n\n" +
                    "If symptoms worsen or persist for more than a week, please see a doctor.\n\n" +
                    "Any other health concerns I can help with?";
        } else if (lowerMessage.contains("headache")) {
            return "For headache relief, here are some general recommendations:\n\n" +
                    "1. Rest in a quiet, dark room\n" +
                    "2. Apply a cold or warm compress to your temples\n" +
                    "3. Stay well-hydrated - dehydration often causes headaches\n" +
                    "4. Avoid stressful situations when possible\n" +
                    "5. Try gentle neck and shoulder stretches\n\n" +
                    "If headaches are severe, frequent, or accompanied by other symptoms, consult a healthcare provider.\n\n"
                    +
                    "Can I help you with anything else?";
        } else if (lowerMessage.contains("sleep") || lowerMessage.contains("insomnia")) {
            return "For better sleep, consider these general suggestions:\n\n" +
                    "1. Maintain a consistent sleep schedule - go to bed and wake up at the same time daily\n" +
                    "2. Create a comfortable sleeping environment - cool, dark, and quiet\n" +
                    "3. Avoid screens 30-60 minutes before bedtime\n" +
                    "4. Limit caffeine intake, especially in the afternoon\n" +
                    "5. Try relaxation techniques like deep breathing or meditation\n\n" +
                    "If sleep problems persist, please consult a sleep specialist or doctor.\n\n" +
                    "Any other health questions?";
        } else if (lowerMessage.contains("hi") || lowerMessage.contains("hello") || lowerMessage.contains("hey")) {
            return "Hello! I'm your hospital medical assistant. I'm here to provide general health information and guidance.\n\n"
                    +
                    "I can help you with:\n" +
                    "• General information about common symptoms\n" +
                    "• Health and wellness tips\n" +
                    "• Preventive care suggestions\n\n" +
                    "What health concerns or questions do you have today?";
        } else {
            return "I'm a medical assistant chatbot designed to provide general health information. " +
                    "While I'd love to help with your question, I work best with health-related topics.\n\n" +
                    "Could you please describe any health concerns or symptoms you're experiencing? " +
                    "I can then provide relevant guidance and recommendations.\n\n" +
                    "Remember: Always consult a qualified healthcare provider for diagnosis and treatment.";
        }
    }
}