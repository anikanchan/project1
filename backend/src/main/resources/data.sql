-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, image_url, category, active, created_at) VALUES
('Wireless Bluetooth Headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life', 149.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Electronics', true, CURRENT_TIMESTAMP),
('Smart Watch Pro', 'Advanced fitness tracking with heart rate monitor and GPS', 299.99, 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Electronics', true, CURRENT_TIMESTAMP),
('Laptop Stand', 'Ergonomic aluminum laptop stand with adjustable height', 59.99, 100, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 'Accessories', true, CURRENT_TIMESTAMP),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 129.99, 40, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', 'Electronics', true, CURRENT_TIMESTAMP),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, SD card reader, and USB 3.0 ports', 49.99, 75, 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400', 'Accessories', true, CURRENT_TIMESTAMP),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 39.99, 60, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 'Electronics', true, CURRENT_TIMESTAMP),
('4K Webcam', 'Professional 4K webcam with autofocus and noise reduction', 179.99, 25, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', 'Electronics', true, CURRENT_TIMESTAMP),
('Desk Organizer', 'Minimalist desk organizer with phone stand and pen holder', 29.99, 120, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Accessories', true, CURRENT_TIMESTAMP);

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, created_at) VALUES
('admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsC0KedtjGn/bGkdSa', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP);

-- Insert test user (password: user123)
INSERT INTO users (email, password, first_name, last_name, role, created_at) VALUES
('user@example.com', '$2a$10$YMpL0kNcVy.Nw4r8OZGX8.4xHuMY8sLlvB7u8vS0vQ3TQnLbMCqWK', 'Test', 'User', 'USER', CURRENT_TIMESTAMP);
