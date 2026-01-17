package com.ecommerce.controller;

import com.ecommerce.dto.LogEntryRequest;
import com.ecommerce.service.CloudWatchLoggingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LoggingController {

    private final CloudWatchLoggingService loggingService;

    @PostMapping
    public ResponseEntity<Map<String, String>> log(@Valid @RequestBody LogEntryRequest logEntry) {
        loggingService.sendLog(logEntry);
        return ResponseEntity.ok(Map.of("status", "logged"));
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, String>> logBatch(@RequestBody List<@Valid LogEntryRequest> logEntries) {
        logEntries.forEach(loggingService::sendLog);
        return ResponseEntity.ok(Map.of("status", "logged", "count", String.valueOf(logEntries.size())));
    }
}