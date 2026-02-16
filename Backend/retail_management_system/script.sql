-- Create database
CREATE DATABASE retail_management_db;
USE retail_management_db;

-- Users table (basic structure for now, will expand in Week 2)
CREATE TABLE users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('WHOLESALER', 'LOCAL_SELLER', 'SALESMAN') NOT NULL,
                       business_name VARCHAR(255),
                       phone VARCHAR(20),
                       address TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE products (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          category VARCHAR(100),
                          price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
                          stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
                          wholesaler_id BIGINT NOT NULL,
                          sku_code VARCHAR(50) UNIQUE,
                          unit VARCHAR(20) DEFAULT 'piece',
                          image_url VARCHAR(500),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          is_active BOOLEAN DEFAULT TRUE,
                          FOREIGN KEY (wholesaler_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample wholesaler user
INSERT INTO users (username, email, password, role, business_name, phone)
VALUES ('wholesaler1', 'wholesaler@example.com', '$2a$10$hashedPasswordHere', 'WHOLESALER', 'Super Wholesale Mart', '+919876543210');

-- Insert sample products
INSERT INTO products (name, description, category, price, stock_quantity, wholesaler_id, sku_code, unit) VALUES
                                                                                                             ('Premium Basmati Rice', '5kg pack, aged basmati rice', 'Groceries', 650.00, 100, 1, 'PRD-001', 'pack'),
                                                                                                             ('Luxury Soap', 'Lavender scented, 100g each', 'Personal Care', 45.00, 500, 1, 'PRD-002', 'piece'),
                                                                                                             ('Energy Drink', '250ml can, 6-pack', 'Beverages', 300.00, 200, 1, 'PRD-003', 'carton'),
                                                                                                             ('Toothpaste', '100g tube, fluoride protection', 'Personal Care', 85.00, 300, 1, 'PRD-004', 'piece');

-- Create indexes for better performance
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_product_wholesaler ON products(wholesaler_id);
CREATE INDEX idx_product_name ON products(name);