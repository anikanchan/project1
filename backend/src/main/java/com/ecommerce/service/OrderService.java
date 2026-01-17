package com.ecommerce.service;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CreateOrderRequest;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String userEmail) {
        log.info("Creating order for customer: {}", request.getCustomerEmail());
        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        Order order = Order.builder()
                .user(user)
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingZipCode(request.getShippingZipCode())
                .shippingCountry(request.getShippingCountry())
                .status(Order.OrderStatus.PENDING)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemRequest itemRequest : request.getItems()) {
            Product product = productService.getProductEntity(itemRequest.getProductId());

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                log.error("Insufficient stock for product: {} (requested: {}, available: {})",
                        product.getName(), itemRequest.getQuantity(), product.getStockQuantity());
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            order.addItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with id: {} and total: ${}", savedOrder.getId(), totalAmount);

        return OrderResponse.fromOrder(savedOrder);
    }

    public OrderResponse getOrderById(Long id) {
        log.debug("Fetching order by id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Order not found with id: {}", id);
                    return new RuntimeException("Order not found with id: " + id);
                });
        return OrderResponse.fromOrder(order);
    }

    public Order getOrderEntity(Long id) {
        log.debug("Fetching order entity by id: {}", id);
        return orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Order entity not found with id: {}", id);
                    return new RuntimeException("Order not found with id: " + id);
                });
    }

    public List<OrderResponse> getOrdersByUserEmail(String email) {
        log.info("Fetching orders for email: {}", email);
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email).stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        List<OrderResponse> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
        log.debug("Found {} total orders", orders.size());
        return orders;
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        log.info("Updating order {} status to {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found for status update, id: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        order.setStatus(status);
        log.info("Order {} status updated to {}", orderId, status);
        return OrderResponse.fromOrder(orderRepository.save(order));
    }

    @Transactional
    public void markOrderAsPaid(Long orderId) {
        log.info("Marking order {} as paid", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found for marking as paid, id: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        order.setStatus(Order.OrderStatus.PAID);
        orderRepository.save(order);
        log.info("Order {} marked as paid", orderId);
    }
}
