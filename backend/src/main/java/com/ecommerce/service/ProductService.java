package com.ecommerce.service;

import com.ecommerce.dto.ProductResponse;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllActiveProducts() {
        log.info("Fetching all active products");
        List<ProductResponse> products = productRepository.findByActiveTrue().stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
        log.debug("Found {} active products", products.size());
        return products;
    }

    public List<ProductResponse> getAllProducts() {
        log.info("Fetching all products (including inactive)");
        List<ProductResponse> products = productRepository.findAll().stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
        log.debug("Found {} total products", products.size());
        return products;
    }

    public ProductResponse getProductById(Long id) {
        log.info("Fetching product by id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Product not found with id: {}", id);
                    return new RuntimeException("Product not found with id: " + id);
                });
        return ProductResponse.fromProduct(product);
    }

    public Product getProductEntity(Long id) {
        log.debug("Fetching product entity by id: {}", id);
        return productRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Product entity not found with id: {}", id);
                    return new RuntimeException("Product not found with id: " + id);
                });
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        log.info("Fetching products by category: {}", category);
        List<ProductResponse> products = productRepository.findByCategoryAndActiveTrue(category).stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
        log.debug("Found {} products in category: {}", products.size(), category);
        return products;
    }
}
