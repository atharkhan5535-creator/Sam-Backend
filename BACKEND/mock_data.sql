-- ================================================================
-- SAM Backend - Comprehensive Mock Data Generator (FINAL Version)
-- Clears existing data and inserts fresh mock data for all salons
-- ================================================================

USE sam-db;

-- ================================================================
-- FIRST: Clear existing transactional data (keep salons)
-- ================================================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE appointment_feedback;
TRUNCATE TABLE customer_payments;
TRUNCATE TABLE invoice_customer;
TRUNCATE TABLE appointment_services;
TRUNCATE TABLE appointment_packages;
TRUNCATE TABLE appointments;
TRUNCATE TABLE customer_authentication;
TRUNCATE TABLE customers;
TRUNCATE TABLE incentive_payouts;
TRUNCATE TABLE incentives;
TRUNCATE TABLE invoice_salon;
TRUNCATE TABLE package_services;
TRUNCATE TABLE packages;
TRUNCATE TABLE payments_salon;
TRUNCATE TABLE stock_transactions;
TRUNCATE TABLE stock;
TRUNCATE TABLE products;
TRUNCATE TABLE staff_documents;
TRUNCATE TABLE staff_info;
TRUNCATE TABLE salon_subscriptions;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;

-- Reset auto-increment counters
ALTER TABLE appointment_feedback AUTO_INCREMENT = 1;
ALTER TABLE customer_payments AUTO_INCREMENT = 1;
ALTER TABLE invoice_customer AUTO_INCREMENT = 1;
ALTER TABLE appointment_services AUTO_INCREMENT = 1;
ALTER TABLE appointment_packages AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE customer_authentication AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE incentive_payouts AUTO_INCREMENT = 1;
ALTER TABLE incentives AUTO_INCREMENT = 1;
ALTER TABLE invoice_salon AUTO_INCREMENT = 1;
ALTER TABLE package_services AUTO_INCREMENT = 1;
ALTER TABLE packages AUTO_INCREMENT = 1;
ALTER TABLE payments_salon AUTO_INCREMENT = 1;
ALTER TABLE stock_transactions AUTO_INCREMENT = 1;
ALTER TABLE stock AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE staff_documents AUTO_INCREMENT = 1;
ALTER TABLE staff_info AUTO_INCREMENT = 1;
ALTER TABLE salon_subscriptions AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- SALON 1: Elite Beauty Salon
-- ================================================================

-- Services for Salon 1
INSERT INTO services (salon_id, service_name, description, price, duration, image_url, status) VALUES
(1, 'Haircut', 'Professional haircut and styling', 500.00, 30, 'uploads/services/haircut.jpg', 'ACTIVE'),
(1, 'Hair Coloring', 'Full hair coloring service', 1500.00, 90, 'uploads/services/coloring.jpg', 'ACTIVE'),
(1, 'Hair Spa', 'Deep conditioning hair treatment', 1200.00, 60, 'uploads/services/hairspa.jpg', 'ACTIVE'),
(1, 'Facial', 'Premium facial treatment', 800.00, 45, 'uploads/services/facial.jpg', 'ACTIVE'),
(1, 'Manicure', 'Complete hand care', 400.00, 30, 'uploads/services/manicure.jpg', 'ACTIVE'),
(1, 'Pedicure', 'Complete foot care', 500.00, 40, 'uploads/services/pedicure.jpg', 'ACTIVE'),
(1, 'Bridal Makeup', 'Complete bridal makeup', 5000.00, 120, 'uploads/services/bridal.jpg', 'ACTIVE'),
(1, 'Party Makeup', 'Party and event makeup', 2000.00, 60, 'uploads/services/party.jpg', 'ACTIVE'),
(1, 'Hair Straightening', 'Professional hair straightening', 2500.00, 90, 'uploads/services/straightening.jpg', 'ACTIVE'),
(1, 'Hair Rebonding', 'Permanent hair rebonding', 3500.00, 150, 'uploads/services/rebonding.jpg', 'ACTIVE');

-- Packages for Salon 1
INSERT INTO packages (salon_id, package_name, description, total_price, validity_days, image_url, status) VALUES
(1, 'Bridal Package', 'Complete bridal makeover with all services', 15000.00, 30, 'uploads/packages/bridal.jpg', 'ACTIVE'),
(1, 'Party Package', 'Makeup and hair styling for parties', 5000.00, 15, 'uploads/packages/party.jpg', 'ACTIVE'),
(1, 'Hair Care Package', 'Haircut, coloring, and spa', 3000.00, 30, 'uploads/packages/haircare.jpg', 'ACTIVE'),
(1, 'Skin Care Package', 'Multiple facial sessions', 4000.00, 45, 'uploads/packages/skincare.jpg', 'ACTIVE'),
(1, 'Complete Grooming', 'Full body grooming package', 6000.00, 30, 'uploads/packages/grooming.jpg', 'ACTIVE');

-- Link packages to services for Salon 1
INSERT INTO package_services (package_id, service_id, salon_id) VALUES
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 8, 1),
(2, 1, 1), (2, 8, 1),
(3, 1, 1), (3, 2, 1), (3, 3, 1),
(4, 4, 1),
(5, 1, 1), (5, 4, 1), (5, 5, 1), (5, 6, 1);

-- Staff for Salon 1 (user_id will be 1,2,3,4 - admin + 3 staff)
INSERT INTO users (salon_id, username, role, email, password_hash, status) VALUES
(1, 'admin_elite', 'ADMIN', 'admin@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(1, 'priya_staff', 'STAFF', 'priya@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(1, 'rahul_staff', 'STAFF', 'rahul@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(1, 'sneha_staff', 'STAFF', 'sneha@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

INSERT INTO staff_info (salon_id, user_id, name, phone, email, date_of_birth, date_of_joining, specialization, experience_years, salary, status) VALUES
(1, 1, 'Priya Sharma', '9876543210', 'priya@elite.com', '1995-03-15', '2023-01-10', 'Hair Stylist', 5, 25000.00, 'ACTIVE'),
(1, 2, 'Rahul Kumar', '9876543211', 'rahul@elite.com', '1993-07-20', '2022-06-15', 'Makeup Artist', 7, 30000.00, 'ACTIVE'),
(1, 3, 'Sneha Patel', '9876543212', 'sneha@elite.com', '1997-11-05', '2023-08-01', 'Skin Specialist', 3, 22000.00, 'ACTIVE');

-- Customers for Salon 1
INSERT INTO customers (salon_id, name, phone, email, gender, date_of_birth, anniversary_date, address, preferences, total_visits, status, customer_since) VALUES
(1, 'Amit Patel', '9123456789', 'amit.patel@email.com', 'MALE', '1990-05-15', NULL, '123 MG Road, Bangalore', 'Prefers morning appointments', 15, 'ACTIVE', '2024-01-10'),
(1, 'Neha Singh', '9123456790', 'neha.singh@email.com', 'FEMALE', '1992-08-20', '2015-06-10', '456 Park Street, Bangalore', 'Allergic to certain products', 22, 'ACTIVE', '2024-02-15'),
(1, 'Rajesh Kumar', '9123456791', 'rajesh.k@email.com', 'MALE', '1988-03-25', '2012-12-01', '789 Brigade Road, Bangalore', NULL, 8, 'ACTIVE', '2024-03-20'),
(1, 'Pooja Reddy', '9123456792', 'pooja.reddy@email.com', 'FEMALE', '1995-11-30', NULL, '321 Residency Road, Bangalore', 'Prefers female staff', 30, 'ACTIVE', '2024-01-05'),
(1, 'Vikram Mehta', '9123456793', 'vikram.m@email.com', 'MALE', '1985-07-12', '2010-03-15', '654 Commercial Street, Bangalore', NULL, 12, 'ACTIVE', '2024-04-10'),
(1, 'Anita Desai', '9123456794', 'anita.desai@email.com', 'FEMALE', '1993-02-28', '2018-09-20', '987 Indiranagar, Bangalore', 'Weekend appointments only', 18, 'ACTIVE', '2024-02-28'),
(1, 'Suresh Nair', '9123456795', 'suresh.nair@email.com', 'MALE', '1991-09-18', NULL, '147 Koramangala, Bangalore', NULL, 5, 'ACTIVE', '2024-05-15'),
(1, 'Kavita Joshi', '9123456796', 'kavita.j@email.com', 'FEMALE', '1989-12-05', '2014-04-25', '258 Whitefield, Bangalore', 'Prefers evening slots', 25, 'ACTIVE', '2024-01-20'),
(1, 'Deepak Verma', '9123456797', 'deepak.v@email.com', 'MALE', '1987-06-22', '2011-11-30', '369 HSR Layout, Bangalore', NULL, 10, 'ACTIVE', '2024-03-05'),
(1, 'Meera Iyer', '9123456798', 'meera.iyer@email.com', 'FEMALE', '1994-04-10', NULL, '741 Jayanagar, Bangalore', 'Monthly facial routine', 35, 'ACTIVE', '2024-01-02');

INSERT INTO customer_authentication (customer_id, salon_id, email, password_hash, status) VALUES
(1, 1, 'amit.patel@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(2, 1, 'neha.singh@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(3, 1, 'rajesh.k@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(4, 1, 'pooja.reddy@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(5, 1, 'vikram.m@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(6, 1, 'anita.desai@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(7, 1, 'suresh.nair@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(8, 1, 'kavita.j@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(9, 1, 'deepak.v@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(10, 1, 'meera.iyer@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

-- Appointments for Salon 1
INSERT INTO appointments (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, total_amount, discount_amount, final_amount, status, notes) VALUES
(1, 1, '2025-02-20', '10:00:00', '10:30:00', 30, 500.00, 0, 500.00, 'COMPLETED', 'Regular haircut'),
(1, 2, '2025-02-20', '11:00:00', '12:30:00', 90, 1500.00, 100, 1400.00, 'COMPLETED', 'Hair coloring - dark brown'),
(1, 3, '2025-02-21', '09:00:00', '09:30:00', 30, 500.00, 50, 450.00, 'COMPLETED', NULL),
(1, 4, '2025-02-21', '14:00:00', '15:00:00', 60, 1200.00, 0, 1200.00, 'COMPLETED', 'Hair spa treatment'),
(1, 5, '2025-02-22', '10:30:00', '11:15:00', 45, 800.00, 0, 800.00, 'COMPLETED', 'Facial'),
(1, 6, '2025-02-22', '15:00:00', '16:00:00', 60, 2000.00, 200, 1800.00, 'COMPLETED', 'Party makeup'),
(1, 7, '2025-02-23', '11:00:00', '11:30:00', 30, 500.00, 0, 500.00, 'CONFIRMED', NULL),
(1, 8, '2025-02-23', '16:00:00', '17:00:00', 60, 1200.00, 0, 1200.00, 'CONFIRMED', 'Monthly hair spa'),
(1, 9, '2025-02-24', '10:00:00', '10:40:00', 40, 500.00, 0, 500.00, 'PENDING', 'First time visit'),
(1, 10, '2025-02-24', '14:00:00', '16:00:00', 120, 5000.00, 500, 4500.00, 'CONFIRMED', 'Bridal makeup consultation'),
(1, 1, '2025-02-25', '09:00:00', '09:30:00', 30, 500.00, 0, 500.00, 'PENDING', NULL),
(1, 2, '2025-02-19', '10:00:00', '10:30:00', 30, 500.00, 0, 500.00, 'COMPLETED', 'Regular trim'),
(1, 4, '2025-02-18', '15:00:00', '15:40:00', 40, 500.00, 0, 500.00, 'COMPLETED', 'Pedicure'),
(1, 6, '2025-02-17', '11:00:00', '11:30:00', 30, 400.00, 0, 400.00, 'COMPLETED', 'Manicure'),
(1, 8, '2025-02-16', '14:00:00', '14:45:00', 45, 800.00, 0, 800.00, 'CANCELLED', 'Customer cancelled - emergency');

-- Appointment Services for Salon 1
INSERT INTO appointment_services (appointment_id, service_id, staff_id, service_price, discount_amount, final_price, start_time, end_time, status) VALUES
(1, 1, 1, 500.00, 0, 500.00, '10:00:00', '10:30:00', 'COMPLETED'),
(2, 2, 1, 1500.00, 100, 1400.00, '11:00:00', '12:30:00', 'COMPLETED'),
(3, 1, 2, 500.00, 50, 450.00, '09:00:00', '09:30:00', 'COMPLETED'),
(4, 3, 1, 1200.00, 0, 1200.00, '14:00:00', '15:00:00', 'COMPLETED'),
(5, 4, 3, 800.00, 0, 800.00, '10:30:00', '11:15:00', 'COMPLETED'),
(6, 8, 2, 2000.00, 200, 1800.00, '15:00:00', '16:00:00', 'COMPLETED'),
(7, 1, 1, 500.00, 0, 500.00, '11:00:00', '11:30:00', 'PENDING'),
(8, 3, 1, 1200.00, 0, 1200.00, '16:00:00', '17:00:00', 'PENDING'),
(9, 1, 2, 500.00, 0, 500.00, '10:00:00', '10:30:00', 'PENDING'),
(10, 8, 2, 5000.00, 500, 4500.00, '14:00:00', '16:00:00', 'PENDING'),
(11, 1, 1, 500.00, 0, 500.00, '09:00:00', '09:30:00', 'PENDING'),
(12, 1, 1, 500.00, 0, 500.00, '10:00:00', '10:30:00', 'COMPLETED'),
(13, 6, 3, 500.00, 0, 500.00, '15:00:00', '15:40:00', 'COMPLETED'),
(14, 5, 3, 400.00, 0, 400.00, '11:00:00', '11:30:00', 'COMPLETED'),
(15, 4, 3, 800.00, 0, 800.00, '14:00:00', '14:45:00', 'CANCELLED');

-- Invoices for Salon 1
INSERT INTO invoice_customer (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount, payment_status, invoice_date, due_date) VALUES
(1, 1, 1, 'INV-1-20250220-0001', 500.00, 0, 0, 500.00, 'PAID', '2025-02-20', '2025-02-27'),
(2, 1, 2, 'INV-1-20250220-0002', 1500.00, 0, 100, 1400.00, 'PAID', '2025-02-20', '2025-02-27'),
(3, 1, 3, 'INV-1-20250221-0001', 500.00, 0, 50, 450.00, 'PAID', '2025-02-21', '2025-02-28'),
(4, 1, 4, 'INV-1-20250221-0002', 1200.00, 0, 0, 1200.00, 'PAID', '2025-02-21', '2025-02-28'),
(5, 1, 5, 'INV-1-20250222-0001', 800.00, 0, 0, 800.00, 'PAID', '2025-02-22', '2025-03-01'),
(6, 1, 6, 'INV-1-20250222-0002', 2000.00, 0, 200, 1800.00, 'PARTIAL', '2025-02-22', '2025-03-01'),
(12, 1, 2, 'INV-1-20250219-0001', 500.00, 0, 0, 500.00, 'PAID', '2025-02-19', '2025-02-26'),
(13, 1, 4, 'INV-1-20250218-0001', 500.00, 0, 0, 500.00, 'PAID', '2025-02-18', '2025-02-25'),
(14, 1, 6, 'INV-1-20250217-0001', 400.00, 0, 0, 400.00, 'PAID', '2025-02-17', '2025-02-24');

-- Payments for Salon 1
INSERT INTO customer_payments (invoice_customer_id, payment_mode, transaction_no, amount, payment_date, status) VALUES
(1, 'UPI', 'UPI123456789', 500.00, '2025-02-20 10:35:00', 'SUCCESS'),
(2, 'CARD', 'CARD987654321', 1400.00, '2025-02-20 12:35:00', 'SUCCESS'),
(3, 'CASH', NULL, 450.00, '2025-02-21 09:35:00', 'SUCCESS'),
(4, 'UPI', 'UPI234567890', 1200.00, '2025-02-21 15:05:00', 'SUCCESS'),
(5, 'NET_BANKING', 'NB345678901', 800.00, '2025-02-22 11:20:00', 'SUCCESS'),
(6, 'CARD', 'CARD456789012', 900.00, '2025-02-22 16:05:00', 'SUCCESS'),
(7, 'UPI', 'UPI567890123', 500.00, '2025-02-19 10:35:00', 'SUCCESS'),
(8, 'CASH', NULL, 500.00, '2025-02-18 15:45:00', 'SUCCESS'),
(9, 'UPI', 'UPI678901234', 400.00, '2025-02-17 11:35:00', 'SUCCESS');

-- Products & Stock for Salon 1
INSERT INTO products (salon_id, product_name, brand, category, description) VALUES
(1, 'Shampoo', 'L''Oreal', 'product', 'Professional shampoo for all hair types'),
(1, 'Conditioner', 'L''Oreal', 'product', 'Deep conditioning treatment'),
(1, 'Hair Color', 'Schwarzkopf', 'product', 'Permanent hair color range'),
(1, 'Face Cream', 'Olay', 'product', 'Moisturizing face cream'),
(1, 'Hair Dryer', 'Philips', 'equipment', 'Professional hair dryer'),
(1, 'Facial Kit', 'Garnier', 'product', 'Complete facial kit'),
(1, 'Hair Oil', 'Parachute', 'product', 'Coconut hair oil'),
(1, 'Hair Straightener', 'Philips', 'equipment', 'Ceramic hair straightener');

INSERT INTO stock (product_id, salon_id, current_quantity, minimum_quantity, maximum_quantity, last_restocked) VALUES
(1, 1, 25, 10, 50, '2025-02-15'),
(2, 1, 18, 10, 40, '2025-02-15'),
(3, 1, 12, 5, 30, '2025-02-10'),
(4, 1, 30, 15, 60, '2025-02-18'),
(5, 1, 5, 3, 10, '2025-01-20'),
(6, 1, 20, 10, 40, '2025-02-12'),
(7, 1, 40, 20, 80, '2025-02-01'),
(8, 1, 4, 3, 8, '2025-01-25');

-- Stock Transactions for Salon 1
INSERT INTO stock_transactions (stock_id, user_id, transaction_type, quantity, unit_price, total_amount, notes) VALUES
(1, 1, 'IN', 30, 150.00, 4500.00, 'Initial stock'),
(1, 1, 'OUT', 5, 150.00, 750.00, 'Used for services'),
(2, 1, 'IN', 25, 180.00, 4500.00, 'Initial stock'),
(2, 1, 'OUT', 7, 180.00, 1260.00, 'Used for services'),
(3, 1, 'IN', 15, 350.00, 5250.00, 'Initial stock'),
(3, 1, 'OUT', 3, 350.00, 1050.00, 'Used for coloring'),
(4, 1, 'IN', 35, 120.00, 4200.00, 'Initial stock'),
(4, 1, 'OUT', 5, 120.00, 600.00, 'Used for facials');

-- Incentives for Salon 1 Staff
INSERT INTO incentives (staff_id, appointment_id, incentive_type, calculation_type, fixed_amount, incentive_amount, remarks, status) VALUES
(1, 1, 'SERVICE_COMMISSION', 'FIXED', NULL, 50.00, 'Haircut commission', 'PAID'),
(1, 2, 'SERVICE_COMMISSION', 'FIXED', NULL, 150.00, 'Hair coloring commission', 'PAID'),
(2, 6, 'SERVICE_COMMISSION', 'FIXED', NULL, 200.00, 'Party makeup commission', 'PAID'),
(3, 5, 'SERVICE_COMMISSION', 'FIXED', NULL, 80.00, 'Facial commission', 'PENDING'),
(1, NULL, 'BONUS', 'FIXED', 1000.00, 1000.00, 'Monthly performance bonus', 'PENDING');

-- Incentive Payouts for Salon 1
INSERT INTO incentive_payouts (incentive_id, staff_id, payout_amount, payout_date, payment_mode) VALUES
(1, 1, 50.00, '2025-02-28', 'BANK'),
(2, 1, 150.00, '2025-02-28', 'BANK'),
(3, 2, 200.00, '2025-02-28', 'BANK');

-- ================================================================
-- ALL SALON SUBSCRIPTIONS (must be before invoice_salon)
-- ================================================================
INSERT INTO salon_subscriptions (salon_id, plan_id, start_date, end_date, status) VALUES
(1, 1, '2025-01-01', '2025-12-31', 'ACTIVE'),
(2, 2, '2025-01-15', '2026-01-14', 'ACTIVE'),
(3, 3, '2024-12-01', '2025-11-30', 'ACTIVE');

-- ================================================================
-- SALON INVOICES
-- ================================================================
INSERT INTO invoice_salon (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount, payment_status, invoice_date, due_date)
VALUES (1, 1, 'INV-S-1-20250101-0001', 9999.00, 1800.00, 11799.00, 'PAID', '2025-01-01', '2025-01-08');

INSERT INTO invoice_salon (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount, payment_status, invoice_date, due_date)
VALUES (2, 2, 'INV-S-2-20250115-0001', 14999.00, 2700.00, 17699.00, 'PARTIAL', '2025-01-15', '2025-01-22');

INSERT INTO invoice_salon (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount, payment_status, invoice_date, due_date)
VALUES (3, 3, 'INV-S-3-20241201-0001', 19999.00, 3600.00, 23599.00, 'PAID', '2024-12-01', '2024-12-08');

INSERT INTO payments_salon (invoice_salon_id, payment_mode, transaction_no, amount, payment_date)
VALUES (1, 'NET_BANKING', 'NB123456789', 11799.00, '2025-01-05 14:30:00');

INSERT INTO payments_salon (invoice_salon_id, payment_mode, transaction_no, amount, payment_date)
VALUES (2, 'CARD', 'CARD123456', 10000.00, '2025-01-20 11:00:00');

INSERT INTO payments_salon (invoice_salon_id, payment_mode, transaction_no, amount, payment_date)
VALUES (3, 'NET_BANKING', 'NB987654321', 23599.00, '2024-12-05 10:30:00');

-- ================================================================
-- SALON 2: Style Zone
-- ================================================================

-- Services for Salon 2
INSERT INTO services (salon_id, service_name, description, price, duration, image_url, status) VALUES
(2, 'Men''s Haircut', 'Classic men''s haircut', 300.00, 25, 'uploads/services/mens-cut.jpg', 'ACTIVE'),
(2, 'Women''s Haircut', 'Stylish women''s haircut', 450.00, 35, 'uploads/services/womens-cut.jpg', 'ACTIVE'),
(2, 'Beard Trim', 'Professional beard grooming', 200.00, 15, 'uploads/services/beard.jpg', 'ACTIVE'),
(2, 'Hair Styling', 'Special occasion styling', 600.00, 45, 'uploads/services/styling.jpg', 'ACTIVE'),
(2, 'Head Massage', 'Relaxing head massage', 350.00, 30, 'uploads/services/massage.jpg', 'ACTIVE');

-- Packages for Salon 2
INSERT INTO packages (salon_id, package_name, description, total_price, validity_days, image_url, status) VALUES
(2, 'Men''s Grooming', 'Haircut + Beard Trim + Massage', 800.00, 30, 'uploads/packages/mens-grooming.jpg', 'ACTIVE'),
(2, 'Women''s Special', 'Haircut + Styling + Facial', 1200.00, 30, 'uploads/packages/womens-special.jpg', 'ACTIVE');

INSERT INTO package_services (package_id, service_id, salon_id) VALUES
(6, 11, 2), (6, 13, 2), (6, 15, 2),
(7, 12, 2), (7, 14, 2), (7, 11, 2);

-- Staff for Salon 2
INSERT INTO users (salon_id, username, role, email, password_hash, status) VALUES
(2, 'admin_stylezone', 'ADMIN', 'admin@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(2, 'arjun_staff', 'STAFF', 'arjun@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(2, 'divya_staff', 'STAFF', 'divya@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

INSERT INTO staff_info (salon_id, user_id, name, phone, email, date_of_birth, date_of_joining, specialization, experience_years, salary, status) VALUES
(2, 4, 'Arjun Reddy', '9876540001', 'arjun@stylezone.com', '1994-06-10', '2023-03-01', 'Hair Stylist', 4, 23000.00, 'ACTIVE'),
(2, 5, 'Divya Rao', '9876540002', 'divya@stylezone.com', '1996-09-25', '2023-05-15', 'Makeup Artist', 3, 21000.00, 'ACTIVE');

-- Customers for Salon 2
INSERT INTO customers (salon_id, name, phone, email, gender, date_of_birth, total_visits, status, customer_since) VALUES
(2, 'Karthik Gowda', '9111222333', 'karthik.g@email.com', 'MALE', '1991-04-12', 10, 'ACTIVE', '2024-02-10'),
(2, 'Lakshmi Hegde', '9111222444', 'lakshmi.h@email.com', 'FEMALE', '1993-07-18', 14, 'ACTIVE', '2024-01-25'),
(2, 'Mohan Das', '9111222555', 'mohan.d@email.com', 'MALE', '1989-11-22', 8, 'ACTIVE', '2024-03-15'),
(2, 'Nisha Bhat', '9111222666', 'nisha.b@email.com', 'FEMALE', '1995-02-28', 20, 'ACTIVE', '2024-01-08'),
(2, 'Prakash Shetty', '9111222777', 'prakash.s@email.com', 'MALE', '1987-08-05', 6, 'ACTIVE', '2024-04-20');

INSERT INTO customer_authentication (customer_id, salon_id, email, password_hash, status) VALUES
(11, 2, 'karthik.g@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(12, 2, 'lakshmi.h@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(13, 2, 'mohan.d@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(14, 2, 'nisha.b@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(15, 2, 'prakash.s@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

-- Appointments for Salon 2
INSERT INTO appointments (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, total_amount, discount_amount, final_amount, status) VALUES
(2, 11, '2025-02-20', '10:00:00', '10:25:00', 25, 300.00, 0, 300.00, 'COMPLETED'),
(2, 12, '2025-02-20', '14:00:00', '14:35:00', 35, 450.00, 50, 400.00, 'COMPLETED'),
(2, 13, '2025-02-21', '09:00:00', '09:15:00', 15, 200.00, 0, 200.00, 'COMPLETED'),
(2, 14, '2025-02-21', '11:00:00', '11:45:00', 45, 600.00, 0, 600.00, 'COMPLETED'),
(2, 15, '2025-02-22', '15:00:00', '15:30:00', 30, 350.00, 0, 350.00, 'CONFIRMED'),
(2, 11, '2025-02-23', '10:00:00', '10:25:00', 25, 300.00, 0, 300.00, 'PENDING'),
(2, 12, '2025-02-19', '11:00:00', '11:25:00', 25, 300.00, 0, 300.00, 'COMPLETED'),
(2, 14, '2025-02-18', '14:00:00', '14:35:00', 35, 450.00, 0, 450.00, 'COMPLETED');

-- Appointment Services for Salon 2
INSERT INTO appointment_services (appointment_id, service_id, staff_id, service_price, discount_amount, final_price) VALUES
(16, 11, 4, 300.00, 0, 300.00),
(17, 12, 5, 450.00, 50, 400.00),
(18, 13, 4, 200.00, 0, 200.00),
(19, 14, 5, 600.00, 0, 600.00),
(20, 15, 4, 350.00, 0, 350.00),
(21, 11, 4, 300.00, 0, 300.00),
(22, 11, 4, 300.00, 0, 300.00),
(23, 12, 5, 450.00, 0, 450.00);

-- Invoices & Payments for Salon 2
INSERT INTO invoice_customer (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount, payment_status, invoice_date, due_date) VALUES
(16, 2, 11, 'INV-2-20250220-0001', 300.00, 0, 0, 300.00, 'PAID', '2025-02-20', '2025-02-27'),
(17, 2, 12, 'INV-2-20250220-0002', 450.00, 0, 50, 400.00, 'PAID', '2025-02-20', '2025-02-27'),
(18, 2, 13, 'INV-2-20250221-0001', 200.00, 0, 0, 200.00, 'PAID', '2025-02-21', '2025-02-28'),
(19, 2, 14, 'INV-2-20250221-0002', 600.00, 0, 0, 600.00, 'PAID', '2025-02-21', '2025-02-28'),
(22, 2, 11, 'INV-2-20250219-0001', 300.00, 0, 0, 300.00, 'PAID', '2025-02-19', '2025-02-26'),
(23, 2, 14, 'INV-2-20250218-0001', 450.00, 0, 0, 450.00, 'PAID', '2025-02-18', '2025-02-25');

INSERT INTO customer_payments (invoice_customer_id, payment_mode, transaction_no, amount, payment_date, status) VALUES
(10, 'UPI', 'UPI789012345', 300.00, '2025-02-20 10:30:00', 'SUCCESS'),
(11, 'CASH', NULL, 400.00, '2025-02-20 14:40:00', 'SUCCESS'),
(12, 'UPI', 'UPI890123456', 200.00, '2025-02-21 09:20:00', 'SUCCESS'),
(13, 'CARD', 'CARD567890123', 600.00, '2025-02-21 11:50:00', 'SUCCESS'),
(14, 'UPI', 'UPI901234567', 300.00, '2025-02-19 11:30:00', 'SUCCESS'),
(15, 'CASH', NULL, 450.00, '2025-02-18 14:40:00', 'SUCCESS');

-- Products & Stock for Salon 2
INSERT INTO products (salon_id, product_name, brand, category, description) VALUES
(2, 'Hair Gel', 'Gatsby', 'product', 'Strong hold hair gel'),
(2, 'Beard Oil', 'Beardo', 'product', 'Nourishing beard oil'),
(2, 'Hair Wax', 'Ustraa', 'product', 'Matte finish hair wax'),
(2, 'Aftershave', 'Nivea', 'product', 'Soothing aftershave lotion');

INSERT INTO stock (product_id, salon_id, current_quantity, minimum_quantity, maximum_quantity) VALUES
(9, 2, 20, 10, 40),
(10, 2, 15, 8, 30),
(11, 2, 12, 5, 25),
(12, 2, 25, 10, 50);

-- ================================================================
-- SALON 3: Glamour Lounge
-- ================================================================

-- Services for Salon 3
INSERT INTO services (salon_id, service_name, description, price, duration, image_url, status) VALUES
(3, 'Deluxe Haircut', 'Premium haircut with wash', 700.00, 40, 'uploads/services/deluxe-cut.jpg', 'ACTIVE'),
(3, 'Keratin Treatment', 'Hair smoothing treatment', 4000.00, 180, 'uploads/services/keratin.jpg', 'ACTIVE'),
(3, 'Gold Facial', 'Luxury gold facial', 2500.00, 60, 'uploads/services/gold-facial.jpg', 'ACTIVE'),
(3, 'Thai Massage', 'Full body Thai massage', 3000.00, 90, 'uploads/services/thai-massage.jpg', 'ACTIVE'),
(3, 'Nail Art', 'Designer nail art', 800.00, 45, 'uploads/services/nailart.jpg', 'ACTIVE'),
(3, 'Eyebrow Threading', 'Professional threading', 150.00, 15, 'uploads/services/threading.jpg', 'ACTIVE');

-- Packages for Salon 3
INSERT INTO packages (salon_id, package_name, description, total_price, validity_days, image_url, status) VALUES
(3, 'Luxury Spa Day', 'Full body massage + facial + nail care', 6000.00, 30, 'uploads/packages/spa-day.jpg', 'ACTIVE'),
(3, 'Bridal Glow', 'Pre-bridal skincare package', 8000.00, 60, 'uploads/packages/bridal-glow.jpg', 'ACTIVE'),
(3, 'Hair Transformation', 'Complete hair makeover', 5000.00, 45, 'uploads/packages/hair-transform.jpg', 'ACTIVE');

INSERT INTO package_services (package_id, service_id, salon_id) VALUES
(8, 19, 3), (8, 18, 3), (8, 20, 3),
(9, 18, 3), (9, 21, 3),
(10, 16, 3), (10, 17, 3);

-- Staff for Salon 3
INSERT INTO users (salon_id, username, role, email, password_hash, status) VALUES
(3, 'admin_glamour', 'ADMIN', 'admin@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(3, 'kavya_staff', 'STAFF', 'kavya@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(3, 'rohan_staff', 'STAFF', 'rohan@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(3, 'ananya_staff', 'STAFF', 'ananya@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

INSERT INTO staff_info (salon_id, user_id, name, phone, email, date_of_birth, date_of_joining, specialization, experience_years, salary, status) VALUES
(3, 6, 'Kavya Nambiar', '9876550001', 'kavya@glamourlounge.com', '1992-05-20', '2022-08-10', 'Senior Stylist', 8, 35000.00, 'ACTIVE'),
(3, 7, 'Rohan Kapoor', '9876550002', 'rohan@glamourlounge.com', '1990-12-15', '2021-11-01', 'Spa Therapist', 10, 32000.00, 'ACTIVE'),
(3, 8, 'Ananya Menon', '9876550003', 'ananya@glamourlounge.com', '1995-08-08', '2023-02-20', 'Nail Artist', 4, 24000.00, 'ACTIVE');

-- Customers for Salon 3
INSERT INTO customers (salon_id, name, phone, email, gender, date_of_birth, anniversary_date, total_visits, status, customer_since) VALUES
(3, 'Sanjay Malhotra', '9222333444', 'sanjay.m@email.com', 'MALE', '1986-03-10', '2009-05-15', 25, 'ACTIVE', '2023-11-20'),
(3, 'Ritu Chopra', '9222333555', 'ritu.c@email.com', 'FEMALE', '1990-06-25', '2013-11-20', 32, 'ACTIVE', '2023-10-15'),
(3, 'Tarun Bhat', '9222333666', 'tarun.b@email.com', 'MALE', '1988-09-12', NULL, 18, 'ACTIVE', '2024-01-05'),
(3, 'Usha Kini', '9222333777', 'usha.k@email.com', 'FEMALE', '1994-01-30', '2017-04-10', 28, 'ACTIVE', '2023-12-01'),
(3, 'Varun Saxena', '9222333888', 'varun.s@email.com', 'MALE', '1991-07-18', NULL, 15, 'ACTIVE', '2024-02-10'),
(3, 'Willson Dsouza', '9222333999', 'willson.d@email.com', 'MALE', '1993-04-22', '2019-08-30', 12, 'ACTIVE', '2024-03-01');

INSERT INTO customer_authentication (customer_id, salon_id, email, password_hash, status) VALUES
(16, 3, 'sanjay.m@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(17, 3, 'ritu.c@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(18, 3, 'tarun.b@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(19, 3, 'usha.k@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(20, 3, 'varun.s@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(21, 3, 'willson.d@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

-- Appointments for Salon 3
INSERT INTO appointments (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, total_amount, discount_amount, final_amount, status) VALUES
(3, 16, '2025-02-20', '10:00:00', '10:40:00', 40, 700.00, 0, 700.00, 'COMPLETED'),
(3, 17, '2025-02-20', '11:00:00', '14:00:00', 180, 4000.00, 400, 3600.00, 'COMPLETED'),
(3, 18, '2025-02-21', '09:00:00', '10:00:00', 60, 2500.00, 0, 2500.00, 'COMPLETED'),
(3, 19, '2025-02-21', '14:00:00', '15:30:00', 90, 3000.00, 300, 2700.00, 'COMPLETED'),
(3, 20, '2025-02-22', '10:00:00', '10:45:00', 45, 800.00, 0, 800.00, 'CONFIRMED'),
(3, 21, '2025-02-22', '15:00:00', '15:15:00', 15, 150.00, 0, 150.00, 'CONFIRMED'),
(3, 16, '2025-02-23', '11:00:00', '11:40:00', 40, 700.00, 0, 700.00, 'PENDING'),
(3, 17, '2025-02-19', '10:00:00', '10:40:00', 40, 700.00, 0, 700.00, 'COMPLETED'),
(3, 19, '2025-02-18', '14:00:00', '15:00:00', 60, 2500.00, 0, 2500.00, 'COMPLETED'),
(3, 20, '2025-02-17', '11:00:00', '11:15:00', 15, 150.00, 0, 150.00, 'COMPLETED');

-- Appointment Services for Salon 3
INSERT INTO appointment_services (appointment_id, service_id, staff_id, service_price, discount_amount, final_price) VALUES
(24, 16, 6, 700.00, 0, 700.00),
(25, 17, 6, 4000.00, 400, 3600.00),
(26, 18, 7, 2500.00, 0, 2500.00),
(27, 19, 7, 3000.00, 300, 2700.00),
(28, 20, 8, 800.00, 0, 800.00),
(29, 21, 6, 150.00, 0, 150.00),
(30, 16, 6, 700.00, 0, 700.00),
(31, 16, 6, 700.00, 0, 700.00),
(32, 18, 7, 2500.00, 0, 2500.00),
(33, 21, 6, 150.00, 0, 150.00);

-- Invoices & Payments for Salon 3
INSERT INTO invoice_customer (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount, payment_status, invoice_date, due_date) VALUES
(24, 3, 16, 'INV-3-20250220-0001', 700.00, 0, 0, 700.00, 'PAID', '2025-02-20', '2025-02-27'),
(25, 3, 17, 'INV-3-20250220-0002', 4000.00, 0, 400, 3600.00, 'PARTIAL', '2025-02-20', '2025-02-27'),
(26, 3, 18, 'INV-3-20250221-0001', 2500.00, 0, 0, 2500.00, 'PAID', '2025-02-21', '2025-02-28'),
(27, 3, 19, 'INV-3-20250221-0002', 3000.00, 0, 300, 2700.00, 'PAID', '2025-02-21', '2025-02-28'),
(31, 3, 17, 'INV-3-20250219-0001', 700.00, 0, 0, 700.00, 'PAID', '2025-02-19', '2025-02-26'),
(32, 3, 19, 'INV-3-20250218-0001', 2500.00, 0, 0, 2500.00, 'PAID', '2025-02-18', '2025-02-25'),
(33, 3, 20, 'INV-3-20250217-0001', 150.00, 0, 0, 150.00, 'PAID', '2025-02-17', '2025-02-24');

INSERT INTO customer_payments (invoice_customer_id, payment_mode, transaction_no, amount, payment_date, status) VALUES
(16, 'CARD', 'CARD111222333', 700.00, '2025-02-20 10:45:00', 'SUCCESS'),
(17, 'UPI', 'UPI222333444', 2000.00, '2025-02-20 14:05:00', 'SUCCESS'),
(18, 'NET_BANKING', 'NB333444555', 2500.00, '2025-02-21 10:05:00', 'SUCCESS'),
(19, 'CARD', 'CARD444555666', 2700.00, '2025-02-21 15:35:00', 'SUCCESS'),
(20, 'UPI', 'UPI555666777', 700.00, '2025-02-19 10:45:00', 'SUCCESS'),
(21, 'CASH', NULL, 2500.00, '2025-02-18 15:05:00', 'SUCCESS'),
(22, 'UPI', 'UPI666777888', 150.00, '2025-02-17 11:20:00', 'SUCCESS');

-- Products & Stock for Salon 3
INSERT INTO products (salon_id, product_name, brand, category, description) VALUES
(3, 'Keratin Shampoo', 'L''Oreal Professional', 'product', 'Post-keratin treatment shampoo'),
(3, 'Face Mask', 'Forest Essentials', 'product', 'Luxury face mask'),
(3, 'Massage Oil', 'Kama Ayurveda', 'product', 'Ayurvedic massage oil'),
(3, 'Nail Polish', 'OPI', 'product', 'Professional nail polish range'),
(3, 'Hair Serum', 'Schwarzkopf', 'product', 'Smoothing hair serum'),
(3, 'Body Lotion', 'The Body Shop', 'product', 'Hydrating body lotion');

INSERT INTO stock (product_id, salon_id, current_quantity, minimum_quantity, maximum_quantity) VALUES
(13, 3, 15, 8, 30),
(14, 3, 20, 10, 40),
(15, 3, 10, 5, 25),
(16, 3, 30, 15, 50),
(17, 3, 18, 10, 35),
(18, 3, 25, 12, 45);

-- ================================================================
-- SALON 4: Test Salon (Minimal Data)
-- ================================================================

INSERT INTO services (salon_id, service_name, description, price, duration, status) VALUES
(4, 'Basic Haircut', 'Simple haircut', 200.00, 20, 'ACTIVE'),
(4, 'Quick Facial', 'Express facial', 400.00, 30, 'ACTIVE');

INSERT INTO customers (salon_id, name, phone, email, gender, status, customer_since) VALUES
(4, 'Test Customer 1', '9000000001', 'test1@test.com', 'MALE', 'ACTIVE', '2025-01-01'),
(4, 'Test Customer 2', '9000000002', 'test2@test.com', 'FEMALE', 'ACTIVE', '2025-01-15');

INSERT INTO customer_authentication (customer_id, salon_id, email, password_hash, status) VALUES
(22, 4, 'test1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(23, 4, 'test2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

INSERT INTO appointments (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, total_amount, discount_amount, final_amount, status) VALUES
(4, 22, '2025-02-20', '10:00:00', '10:20:00', 20, 200.00, 0, 200.00, 'COMPLETED'),
(4, 23, '2025-02-21', '11:00:00', '11:30:00', 30, 400.00, 0, 400.00, 'CONFIRMED');

INSERT INTO appointment_services (appointment_id, service_id, staff_id, service_price, discount_amount, final_price) VALUES
(34, 22, 1, 200.00, 0, 200.00),
(35, 23, 1, 400.00, 0, 400.00);

-- ================================================================
-- SALON 6: hk Salon (Minimal Data)
-- ================================================================

INSERT INTO services (salon_id, service_name, description, price, duration, status) VALUES
(6, 'Standard Cut', 'Professional haircut', 350.00, 30, 'ACTIVE'),
(6, 'Color Service', 'Hair coloring', 1000.00, 60, 'ACTIVE'),
(6, 'Basic Facial', 'Cleansing facial', 600.00, 40, 'ACTIVE');

INSERT INTO customers (salon_id, name, phone, email, gender, status, customer_since) VALUES
(6, 'HK Customer 1', '9100000001', 'hk1@test.com', 'FEMALE', 'ACTIVE', '2025-02-01'),
(6, 'HK Customer 2', '9100000002', 'hk2@test.com', 'MALE', 'ACTIVE', '2025-02-05'),
(6, 'HK Customer 3', '9100000003', 'hk3@test.com', 'FEMALE', 'ACTIVE', '2025-02-10');

INSERT INTO customer_authentication (customer_id, salon_id, email, password_hash, status) VALUES
(24, 6, 'hk1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(25, 6, 'hk2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE'),
(26, 6, 'hk3@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE');

INSERT INTO appointments (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, total_amount, discount_amount, final_amount, status) VALUES
(6, 24, '2025-02-22', '10:00:00', '10:30:00', 30, 350.00, 0, 350.00, 'PENDING'),
(6, 25, '2025-02-23', '14:00:00', '15:00:00', 60, 1000.00, 100, 900.00, 'CONFIRMED'),
(6, 26, '2025-02-20', '11:00:00', '11:40:00', 40, 600.00, 0, 600.00, 'COMPLETED');

INSERT INTO appointment_services (appointment_id, service_id, staff_id, service_price, discount_amount, final_price) VALUES
(36, 24, 1, 350.00, 0, 350.00),
(37, 25, 1, 1000.00, 100, 900.00),
(38, 26, 1, 600.00, 0, 600.00);

INSERT INTO invoice_customer (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount, payment_status, invoice_date, due_date) VALUES
(38, 6, 26, 'INV-6-20250220-0001', 600.00, 0, 0, 600.00, 'PAID', '2025-02-20', '2025-02-27');

INSERT INTO customer_payments (invoice_customer_id, payment_mode, transaction_no, amount, payment_date, status) VALUES
(23, 'UPI', 'UPI777888999', 600.00, '2025-02-20 11:45:00', 'SUCCESS');

-- ================================================================
-- Update Customer Visit Counts
-- ================================================================

UPDATE customers c SET 
    total_visits = (SELECT COUNT(*) FROM appointments a WHERE a.customer_id = c.customer_id AND a.status = 'COMPLETED'),
    last_visit_date = (SELECT MAX(a.appointment_date) FROM appointments a WHERE a.customer_id = c.customer_id AND a.status = 'COMPLETED');

-- ================================================================
-- Summary of Mock Data
-- ================================================================
-- Salon 1 (Elite Beauty Salon): 10 services, 5 packages, 3 staff, 10 customers, 15 appointments
-- Salon 2 (Style Zone): 5 services, 2 packages, 2 staff, 5 customers, 8 appointments
-- Salon 3 (Glamour Lounge): 6 services, 3 packages, 3 staff, 6 customers, 10 appointments
-- Salon 4 (Test Salon): 2 services, 0 packages, 0 staff, 2 customers, 2 appointments
-- Salon 6 (hk Salon): 3 services, 0 packages, 0 staff, 3 customers, 3 appointments
-- ================================================================
