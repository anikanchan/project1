package com.ecommerce.controller;

import com.ecommerce.dto.PaymentIntentRequest;
import com.ecommerce.dto.PaymentIntentResponse;
import com.ecommerce.service.PaymentService;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request) throws StripeException {
        log.info("POST /api/payments/create-intent - order: {}", request.getOrderId());
        return ResponseEntity.ok(paymentService.createPaymentIntent(request.getOrderId()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmPayment(@RequestBody Map<String, String> payload) {
        String paymentIntentId = payload.get("paymentIntentId");
        log.info("POST /api/payments/confirm - intent: {}", paymentIntentId);
        paymentService.confirmPayment(paymentIntentId);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
