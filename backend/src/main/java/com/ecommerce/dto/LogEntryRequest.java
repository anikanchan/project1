package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogEntryRequest {
    @NotBlank
    private String level;

    @NotBlank
    private String message;

    private String source;
    private String userAgent;
    private String url;
    private Long timestamp;
}
