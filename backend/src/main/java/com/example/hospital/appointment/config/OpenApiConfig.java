package com.example.hospital.appointment.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info()
                        .title("Hospital Appointment API")
                        .version("1.0.0")
                        .description("Hospital appointment system APIs")
                        .contact(new Contact().name("Hospital API Team").email("support@hospital.com"))
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
