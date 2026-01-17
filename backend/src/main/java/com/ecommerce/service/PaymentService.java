package com.ecommerce.service;

import com.ecommerce.dto.PaymentIntentResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("Stripe API initialized");
    }

    @Transactional
    public PaymentIntentResponse createPaymentIntent(Long orderId) throws StripeException {
        log.info("Creating payment intent for order: {}", orderId);
        Order order = orderService.getOrderEntity(orderId);

        if (order.getPayment() != null &&
            order.getPayment().getStatus() == Payment.PaymentStatus.SUCCEEDED) {
            log.warn("Attempted to pay for already paid order: {}", orderId);
            throw new RuntimeException("Order has already been paid");
        }

        long amountInCents = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("orderId", orderId.toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .order(order)
                .stripePaymentIntentId(paymentIntent.getId())
                .amount(order.getTotalAmount())
                .currency("usd")
                .status(Payment.PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);
        log.info("Payment intent created: {} for order: {} amount: ${}", paymentIntent.getId(), orderId, order.getTotalAmount());

        return PaymentIntentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentIntentId(paymentIntent.getId())
                .amount(amountInCents)
                .currency("usd")
                .build();
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        log.info("Confirming payment for intent: {}", paymentIntentId);
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> {
                    log.error("Payment not found for intent: {}", paymentIntentId);
                    return new RuntimeException("Payment not found for intent: " + paymentIntentId);
                });

        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        log.info("Payment confirmed for order: {}", payment.getOrder().getId());

        orderService.markOrderAsPaid(payment.getOrder().getId());
    }

    @Transactional
    public void failPayment(String paymentIntentId) {
        log.warn("Failing payment for intent: {}", paymentIntentId);
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> {
                    log.error("Payment not found for failing, intent: {}", paymentIntentId);
                    return new RuntimeException("Payment not found for intent: " + paymentIntentId);
                });

        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);
        log.warn("Payment failed for order: {}", payment.getOrder().getId());
    }
}
