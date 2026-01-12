package com.ecommerce.controller;

import com.ecommerce.dto.PaymentIntentRequest;
import com.ecommerce.dto.PaymentIntentResponse;
import com.ecommerce.service.PaymentService;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request) throws StripeException {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request.getOrderId()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmPayment(@RequestBody Map<String, String> payload) {
        String paymentIntentId = payload.get("paymentIntentId");
        paymentService.confirmPayment(paymentIntentId);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
