# Database Dump

**Generated:** 2026-03-19 03:40:48

## Summary

**Total Tables:** 39
**Total Views:** 2

### Tables List

- `appointment_feedback`
- `appointment_packages`
- `appointment_services`
- `appointments`
- `billing_audit_logs`
- `billing_calculation_logs`
- `credit_notes`
- `customer_authentication`
- `customer_payments`
- `customers`
- `email_simulator`
- `incentive_payouts`
- `incentives`
- `invoice_customer`
- `invoice_salon`
- `invoice_salon_items`
- `leave_requests`
- `package_services`
- `packages`
- `password_reset_tokens`
- `payments_salon`
- `products`
- `refresh_tokens`
- `salon_subscriptions`
- `salons`
- `services`
- `staff_documents`
- `staff_info`
- `stock`
- `stock_transactions`
- `subscription_billing_cycles`
- `subscription_expiration_log`
- `subscription_plans`
- `subscription_renewal_reminders`
- `subscription_renewals`
- `super_admin_login`
- `user_activity_log`
- `user_password_history`
- `users`

### Views List

- `salon_dashboard`
- `staff_performance`

---

## Table: `appointment_feedback`

### Structure

```sql
CREATE TABLE `appointment_feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `appointment_feedback_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `appointment_feedback_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `appointment_feedback_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `appointment_packages`

### Structure

```sql
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `package_id` int NOT NULL,
  `package_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_package_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `appointment_packages_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `appointment_packages_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 31

### Data (SQL INSERT Statements)

```sql
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('3', '53', '4', '4000.00', '0.00', '4000.00', 'PENDING', '2026-02-26 18:13:25', '2026-02-26 18:13:25');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('4', '53', '3', '3000.00', '0.00', '3000.00', 'PENDING', '2026-02-26 18:13:25', '2026-02-26 18:13:25');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('5', '54', '2', '5000.00', '0.00', '5000.00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('6', '54', '1', '15000.00', '0.00', '15000.00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('7', '54', '3', '3000.00', '0.00', '3000.00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('8', '54', '4', '4000.00', '0.00', '4000.00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('9', '56', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('10', '56', '1', '15000.00', '0.00', '15000.00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('11', '56', '2', '5000.00', '0.00', '5000.00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('16', '52', '2', '5000.00', '0.00', '5000.00', 'PENDING', '2026-02-27 17:37:38', '2026-02-27 17:37:38');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('17', '59', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-02-28 23:41:25', '2026-02-28 23:41:25');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('19', '60', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-03-06 14:30:52', '2026-03-06 14:30:52');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('21', '61', '1', '15000.00', '0.00', '15000.00', 'PENDING', '2026-03-08 06:49:01', '2026-03-08 06:49:01');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('22', '14', '5', '6000.00', '0.00', '6000.00', 'PENDING', '2026-03-08 06:57:28', '2026-03-08 06:57:28');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('23', '62', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-03-08 07:05:47', '2026-03-08 07:05:47');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('24', '62', '13', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 07:14:52', '2026-03-08 07:14:52');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('25', '63', '4', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 07:16:09', '2026-03-08 07:16:09');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('26', '64', '4', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 07:16:38', '2026-03-08 07:16:38');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('27', '65', '13', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 08:05:52', '2026-03-08 08:05:52');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('28', '65', '11', '0.00', '0.00', '0.00', 'PENDING', '2026-03-08 08:07:00', '2026-03-08 08:09:09');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('29', '65', '1', '0.00', '0.00', '0.00', 'PENDING', '2026-03-08 08:08:03', '2026-03-08 08:09:09');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('30', '68', '13', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 10:05:52', '2026-03-08 10:05:52');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('31', '69', '13', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-08 11:06:52', '2026-03-08 11:06:52');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('33', '69', '11', '0.00', '0.00', '0.00', 'PENDING', '2026-03-08 11:07:51', '2026-03-08 11:07:51');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('34', '70', '14', '3900.00', '0.00', '3900.00', 'PENDING', '2026-03-10 06:44:22', '2026-03-10 06:44:22');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('35', '70', '13', '4000.00', '0.00', '4000.00', 'PENDING', '2026-03-10 06:44:22', '2026-03-10 06:44:22');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('39', '71', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-03-11 09:27:12', '2026-03-11 09:27:12');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('40', '62', '15', '9500.00', '0.00', '9500.00', 'PENDING', '2026-03-12 07:00:06', '2026-03-12 07:00:06');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('42', '77', '14', '3900.00', '0.00', '3900.00', 'PENDING', '2026-03-12 09:15:58', '2026-03-12 09:15:58');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('43', '78', '14', '3900.00', '0.00', '3900.00', 'PENDING', '2026-03-12 09:17:50', '2026-03-12 09:17:50');
INSERT INTO `appointment_packages` (`appointment_package_id`, `appointment_id`, `package_id`, `package_price`, `discount_amount`, `final_price`, `status`, `created_at`, `updated_at`) VALUES ('45', '80', '11', '10000.00', '0.00', '10000.00', 'PENDING', '2026-03-19 07:46:24', '2026-03-19 07:46:24');

-- Total INSERT statements: 31
```

---

## Table: `appointment_services`

### Structure

```sql
CREATE TABLE `appointment_services` (
  `appointment_service_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `service_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_service_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `appointment_services_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `appointment_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 128

### Data (SQL INSERT Statements)

```sql
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '500.00', '0.00', '500.00', '10:00:00', '10:30:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('2', '2', '2', '1500.00', '100.00', '1400.00', '11:00:00', '12:30:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('3', '3', '1', '500.00', '50.00', '450.00', '09:00:00', '09:30:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('4', '4', '3', '1200.00', '0.00', '1200.00', '14:00:00', '15:00:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('5', '5', '4', '800.00', '0.00', '800.00', '10:30:00', '11:15:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('6', '6', '8', '2000.00', '200.00', '1800.00', '15:00:00', '16:00:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('7', '7', '1', '500.00', '0.00', '500.00', '11:00:00', '11:30:00', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('8', '8', '3', '1200.00', '0.00', '1200.00', '16:00:00', '17:00:00', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('9', '9', '1', '500.00', '0.00', '500.00', '10:00:00', '10:30:00', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('10', '10', '8', '5000.00', '500.00', '4500.00', '14:00:00', '16:00:00', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('11', '11', '1', '500.00', '0.00', '500.00', '09:00:00', '09:30:00', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('12', '12', '1', '500.00', '0.00', '500.00', '10:00:00', '10:30:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('13', '13', '6', '500.00', '0.00', '500.00', '15:00:00', '15:40:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('14', '14', '5', '400.00', '0.00', '400.00', '11:00:00', '11:30:00', 'COMPLETED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('15', '15', '4', '800.00', '0.00', '800.00', '14:00:00', '14:45:00', 'CANCELLED', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('16', '16', '11', '300.00', '0.00', '300.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('17', '17', '12', '450.00', '50.00', '400.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('18', '18', '13', '200.00', '0.00', '200.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('19', '19', '14', '600.00', '0.00', '600.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('20', '20', '15', '350.00', '0.00', '350.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('21', '21', '11', '300.00', '0.00', '300.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('22', '22', '11', '300.00', '0.00', '300.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('23', '23', '12', '450.00', '0.00', '450.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('24', '24', '16', '700.00', '0.00', '700.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('25', '25', '17', '4000.00', '400.00', '3600.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('26', '26', '18', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('27', '27', '19', '3000.00', '300.00', '2700.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('28', '28', '20', '800.00', '0.00', '800.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('29', '29', '21', '150.00', '0.00', '150.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('30', '30', '16', '700.00', '0.00', '700.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('31', '31', '16', '700.00', '0.00', '700.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('32', '32', '18', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('33', '33', '21', '150.00', '0.00', '150.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('34', '34', '22', '200.00', '0.00', '200.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('35', '35', '23', '400.00', '0.00', '400.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('36', '36', '24', '350.00', '0.00', '350.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('37', '37', '25', '1000.00', '100.00', '900.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('38', '38', '26', '600.00', '0.00', '600.00', NULL, NULL, 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('39', '39', '1', '500.00', '50.00', '450.00', NULL, NULL, 'PENDING', '2026-02-26 13:35:56', '2026-02-26 13:35:56');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('40', '51', '122', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-26 18:09:15', '2026-02-26 18:09:15');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('44', '53', '163', '1200.00', '0.00', '1200.00', '09:00:00', '10:00:00', 'PENDING', '2026-02-26 18:13:25', '2026-02-26 18:13:25');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('45', '54', '188', '1500.00', '0.00', '1500.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('46', '54', '187', '500.00', '0.00', '500.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('47', '54', '189', '1200.00', '0.00', '1200.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('48', '54', '190', '800.00', '0.00', '800.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('49', '54', '191', '400.00', '0.00', '400.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('50', '54', '192', '500.00', '0.00', '500.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('51', '54', '193', '5000.00', '0.00', '5000.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('52', '54', '194', '2000.00', '0.00', '2000.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('53', '54', '195', '2500.00', '0.00', '2500.00', '12:00:00', '13:00:00', 'PENDING', '2026-02-26 18:20:21', '2026-02-26 18:20:21');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('54', '55', '139', '1500.00', '0.00', '1500.00', '09:00:00', NULL, 'PENDING', '2026-02-27 07:03:09', '2026-02-27 07:03:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('55', '56', '147', '3500.00', '0.00', '3500.00', '18:00:00', '19:10:00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('56', '56', '146', '2500.00', '0.00', '2500.00', '18:00:00', '19:10:00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('57', '56', '145', '2000.00', '0.00', '2000.00', '18:00:00', '19:10:00', 'PENDING', '2026-02-27 14:20:27', '2026-02-27 14:20:27');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('58', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:17:50', '2026-02-27 15:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('59', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:17:50', '2026-02-27 15:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('60', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:17:50', '2026-02-27 15:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('61', '56', '115', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:17:50', '2026-02-27 15:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('62', '56', '116', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 15:17:50', '2026-02-27 15:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('63', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('64', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('65', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('66', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('67', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('68', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('69', '56', '115', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('70', '56', '116', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('71', '56', '187', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('72', '56', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 15:19:22', '2026-02-27 15:19:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('75', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('76', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('77', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('78', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('79', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('80', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:09', '2026-02-27 15:35:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('81', '56', '115', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('82', '56', '116', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('83', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('84', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('85', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('86', '56', '147', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('87', '56', '146', '2500.00', '0.00', '2500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('88', '56', '145', '2000.00', '0.00', '2000.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('89', '56', '115', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('90', '56', '116', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('91', '56', '187', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('92', '56', '189', '1200.00', '0.00', '1200.00', NULL, NULL, 'PENDING', '2026-02-27 15:35:10', '2026-02-27 15:35:10');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('93', '55', '138', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 15:42:34', '2026-02-27 15:42:34');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('94', '55', '170', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:42:34', '2026-02-27 15:42:34');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('95', '55', '170', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 15:50:54', '2026-02-27 15:50:54');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('96', '54', '196', '3500.00', '0.00', '3500.00', NULL, NULL, 'PENDING', '2026-02-27 16:06:07', '2026-02-27 16:06:07');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('97', '54', '161', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-02-27 16:06:07', '2026-02-27 16:06:07');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('98', '54', '164', '800.00', '0.00', '800.00', NULL, NULL, 'PENDING', '2026-02-27 16:06:38', '2026-02-27 16:06:38');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('99', '54', '165', '400.00', '0.00', '400.00', NULL, NULL, 'PENDING', '2026-02-27 16:06:38', '2026-02-27 16:06:38');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('101', '52', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-02-27 17:37:38', '2026-02-27 17:37:38');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('102', '59', '192', '500.00', '0.00', '500.00', '09:00:00', '10:20:00', 'PENDING', '2026-02-28 23:41:25', '2026-02-28 23:41:25');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('103', '59', '191', '400.00', '0.00', '400.00', '09:00:00', '10:20:00', 'PENDING', '2026-02-28 23:41:25', '2026-02-28 23:41:25');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('105', '60', '189', '1200.00', '0.00', '1200.00', NULL, NULL, 'PENDING', '2026-03-06 14:30:52', '2026-03-06 14:30:52');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('109', '61', '191', '400.00', '0.00', '400.00', NULL, NULL, 'PENDING', '2026-03-08 06:49:01', '2026-03-08 06:49:01');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('110', '14', '187', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-03-08 06:57:28', '2026-03-08 06:57:28');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('111', '62', '187', '500.00', '0.00', '500.00', '10:00:00', NULL, 'PENDING', '2026-03-08 07:05:47', '2026-03-08 07:05:47');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('112', '62', '188', '1500.00', '0.00', '1500.00', '10:00:00', NULL, 'PENDING', '2026-03-08 07:05:47', '2026-03-08 07:05:47');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('113', '62', '190', '800.00', '0.00', '800.00', '10:00:00', NULL, 'PENDING', '2026-03-08 07:05:47', '2026-03-08 07:05:47');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('114', '63', '187', '500.00', '0.00', '500.00', '09:00:00', NULL, 'PENDING', '2026-03-08 07:16:09', '2026-03-08 07:16:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('115', '64', '187', '500.00', '0.00', '500.00', '09:00:00', NULL, 'PENDING', '2026-03-08 07:16:38', '2026-03-08 07:16:38');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('116', '65', '190', '800.00', '0.00', '800.00', '09:00:00', NULL, 'PENDING', '2026-03-08 08:05:52', '2026-03-08 08:05:52');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('117', '65', '189', '1200.00', '0.00', '1200.00', '09:00:00', NULL, 'PENDING', '2026-03-08 08:05:52', '2026-03-08 08:09:09');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('118', '68', '189', '1200.00', '0.00', '1200.00', '09:00:00', NULL, 'PENDING', '2026-03-08 10:05:52', '2026-03-08 10:05:52');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('119', '68', '188', '0.00', '0.00', '0.00', NULL, NULL, 'PENDING', '2026-03-08 10:06:35', '2026-03-08 10:06:35');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('120', '68', '187', '0.00', '0.00', '0.00', NULL, NULL, 'PENDING', '2026-03-08 10:06:35', '2026-03-08 10:06:35');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('121', '68', '193', '0.00', '0.00', '0.00', NULL, NULL, 'PENDING', '2026-03-08 10:06:35', '2026-03-08 10:06:35');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('122', '62', '191', '0.00', '0.00', '0.00', NULL, NULL, 'PENDING', '2026-03-08 10:23:15', '2026-03-08 10:23:15');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('123', '69', '188', '1500.00', '0.00', '1500.00', '09:00:00', NULL, 'PENDING', '2026-03-08 11:06:52', '2026-03-08 11:06:52');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('125', '69', '190', '800.00', '0.00', '800.00', '09:00:00', NULL, 'PENDING', '2026-03-08 11:06:52', '2026-03-08 11:06:52');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('126', '69', '187', '0.00', '0.00', '0.00', NULL, NULL, 'PENDING', '2026-03-08 11:07:51', '2026-03-08 11:07:51');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('127', '70', '188', '1500.00', '0.00', '1500.00', '09:00:00', NULL, 'PENDING', '2026-03-10 06:44:22', '2026-03-10 06:44:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('128', '70', '189', '1200.00', '0.00', '1200.00', '09:00:00', NULL, 'PENDING', '2026-03-10 06:44:22', '2026-03-10 06:44:22');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('134', '71', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-03-11 08:32:16', '2026-03-11 08:32:16');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('135', '71', '189', '1200.00', '0.00', '1200.00', NULL, NULL, 'PENDING', '2026-03-11 09:27:12', '2026-03-11 09:27:12');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('136', '71', '190', '800.00', '0.00', '800.00', NULL, NULL, 'PENDING', '2026-03-11 16:07:26', '2026-03-11 16:07:26');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('137', '62', '192', '500.00', '0.00', '500.00', NULL, NULL, 'PENDING', '2026-03-12 07:00:05', '2026-03-12 07:00:05');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('138', '62', '189', '1200.00', '0.00', '1200.00', NULL, NULL, 'PENDING', '2026-03-12 07:00:05', '2026-03-12 07:00:05');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('139', '72', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-03-12 08:44:20', '2026-03-12 08:44:20');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('148', '77', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-03-12 09:15:39', '2026-03-12 09:15:39');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('149', '78', '188', '1500.00', '0.00', '1500.00', NULL, NULL, 'PENDING', '2026-03-12 09:17:50', '2026-03-12 09:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('150', '78', '189', '1200.00', '0.00', '1200.00', NULL, NULL, 'PENDING', '2026-03-12 09:17:50', '2026-03-12 09:17:50');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('155', '80', '191', '400.00', '0.00', '400.00', NULL, NULL, 'PENDING', '2026-03-19 07:46:24', '2026-03-19 07:46:24');
INSERT INTO `appointment_services` (`appointment_service_id`, `appointment_id`, `service_id`, `service_price`, `discount_amount`, `final_price`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES ('156', '80', '190', '800.00', '0.00', '800.00', NULL, NULL, 'PENDING', '2026-03-19 07:46:24', '2026-03-19 07:46:24');

-- Total INSERT statements: 128
```

---

## Table: `appointments`

### Structure

```sql
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `estimated_duration` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'PENDING',
  `cancellation_reason` text,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `salon_id` (`salon_id`),
  KEY `idx_appointments_date` (`appointment_date`,`salon_id`),
  KEY `idx_appointments_customer` (`customer_id`,`salon_id`),
  KEY `idx_appointments_status` (`status`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 60

### Data (SQL INSERT Statements)

```sql
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '2025-02-20', '10:00:00', '10:30:00', '30', '500.00', '0.00', '500.00', 'COMPLETED', NULL, 'Regular haircut', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('2', '1', '2', '2025-02-20', '11:00:00', '12:30:00', '90', '1500.00', '100.00', '1400.00', 'COMPLETED', NULL, 'Hair coloring - dark brown', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('3', '1', '3', '2025-02-21', '09:00:00', '09:30:00', '30', '500.00', '50.00', '450.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('4', '1', '4', '2025-02-21', '14:00:00', '15:00:00', '60', '1200.00', '0.00', '1200.00', 'COMPLETED', NULL, 'Hair spa treatment', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('5', '1', '5', '2025-02-22', '10:30:00', '11:15:00', '45', '800.00', '0.00', '800.00', 'COMPLETED', NULL, 'Facial', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('6', '1', '6', '2025-02-22', '15:00:00', '16:00:00', '60', '2000.00', '200.00', '1800.00', 'COMPLETED', NULL, 'Party makeup', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('7', '1', '7', '2025-02-23', '11:00:00', '11:30:00', '30', '500.00', '0.00', '500.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-03-06 18:13:47');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('8', '1', '8', '2025-02-23', '16:00:00', '17:00:00', '60', '1200.00', '0.00', '1200.00', 'CONFIRMED', NULL, 'Monthly hair spa', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('9', '1', '9', '2025-02-24', '10:00:00', '10:40:00', '40', '500.00', '0.00', '500.00', 'PENDING', NULL, 'First time visit', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('10', '1', '10', '2025-02-24', '14:00:00', '16:00:00', '120', '5000.00', '500.00', '4500.00', 'CONFIRMED', NULL, 'Bridal makeup consultation', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('11', '1', '1', '2025-02-25', '09:00:00', '09:30:00', '30', '500.00', '0.00', '500.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-03-06 17:44:20');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('12', '1', '2', '2025-02-19', '10:00:00', '10:30:00', '30', '500.00', '0.00', '500.00', 'COMPLETED', NULL, 'Regular trim', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('13', '1', '4', '2025-02-18', '15:00:00', '15:40:00', '40', '500.00', '0.00', '500.00', 'COMPLETED', NULL, 'Pedicure', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('14', '1', '6', '2025-02-17', '11:00:00', '11:30:00', '30', '6900.00', '100.00', '6900.00', 'COMPLETED', NULL, 'Manicure', '2026-02-25 22:21:36', '2026-03-08 06:57:28');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('15', '1', '8', '2025-02-16', '14:00:00', '14:45:00', '45', '800.00', '0.00', '800.00', 'CANCELLED', NULL, 'Customer cancelled - emergency', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('16', '2', '11', '2025-02-20', '10:00:00', '10:25:00', '25', '300.00', '0.00', '300.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('17', '2', '12', '2025-02-20', '14:00:00', '14:35:00', '35', '450.00', '50.00', '400.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('18', '2', '13', '2025-02-21', '09:00:00', '09:15:00', '15', '200.00', '0.00', '200.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('19', '2', '14', '2025-02-21', '11:00:00', '11:45:00', '45', '600.00', '0.00', '600.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('20', '2', '15', '2025-02-22', '15:00:00', '15:30:00', '30', '350.00', '0.00', '350.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('21', '2', '11', '2025-02-23', '10:00:00', '10:25:00', '25', '300.00', '0.00', '300.00', 'PENDING', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('22', '2', '12', '2025-02-19', '11:00:00', '11:25:00', '25', '300.00', '0.00', '300.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('23', '2', '14', '2025-02-18', '14:00:00', '14:35:00', '35', '450.00', '0.00', '450.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('24', '3', '16', '2025-02-20', '10:00:00', '10:40:00', '40', '700.00', '0.00', '700.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('25', '3', '17', '2025-02-20', '11:00:00', '14:00:00', '180', '4000.00', '400.00', '3600.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('26', '3', '18', '2025-02-21', '09:00:00', '10:00:00', '60', '2500.00', '0.00', '2500.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('27', '3', '19', '2025-02-21', '14:00:00', '15:30:00', '90', '3000.00', '300.00', '2700.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('28', '3', '20', '2025-02-22', '10:00:00', '10:45:00', '45', '800.00', '0.00', '800.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('29', '3', '21', '2025-02-22', '15:00:00', '15:15:00', '15', '150.00', '0.00', '150.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('30', '3', '16', '2025-02-23', '11:00:00', '11:40:00', '40', '700.00', '0.00', '700.00', 'PENDING', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('31', '3', '17', '2025-02-19', '10:00:00', '10:40:00', '40', '700.00', '0.00', '700.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('32', '3', '19', '2025-02-18', '14:00:00', '15:00:00', '60', '2500.00', '0.00', '2500.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('33', '3', '20', '2025-02-17', '11:00:00', '11:15:00', '15', '150.00', '0.00', '150.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('34', '4', '22', '2025-02-20', '10:00:00', '10:20:00', '20', '200.00', '0.00', '200.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('35', '4', '23', '2025-02-21', '11:00:00', '11:30:00', '30', '400.00', '0.00', '400.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('36', '6', '24', '2025-02-22', '10:00:00', '10:30:00', '30', '350.00', '0.00', '350.00', 'PENDING', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('37', '6', '25', '2025-02-23', '14:00:00', '15:00:00', '60', '1000.00', '100.00', '900.00', 'CONFIRMED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('38', '6', '26', '2025-02-20', '11:00:00', '11:40:00', '40', '600.00', '0.00', '600.00', 'COMPLETED', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('39', '1', '1', '2025-03-02', '11:30:00', '12:30:00', '60', '450.00', '0.00', '450.00', 'CANCELLED', 'Customer requested cancellation', 'Rescheduled', '2026-02-26 13:35:56', '2026-02-26 13:44:08');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('51', '1', '10', '2026-02-26', '09:00:00', '10:00:00', '60', '2000.00', '300.00', '2000.00', 'CONFIRMED', NULL, '', '2026-02-26 18:09:15', '2026-02-27 16:55:19');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('52', '1', '7', '2026-02-26', '09:00:00', '13:20:00', '260', '6500.00', '100.00', '6500.00', 'COMPLETED', NULL, 'fillannnnyyy', '2026-02-26 18:12:48', '2026-02-27 17:38:02');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('53', '1', '6', '2026-02-26', '09:00:00', '10:00:00', '60', '8200.00', '100.00', '8100.00', 'CANCELLED', 'idk i was just bored', NULL, '2026-02-26 18:13:25', '2026-02-27 17:38:26');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('54', '1', '3', '2026-02-26', '12:00:00', '13:00:00', '60', '41400.00', '1000.00', '40400.00', 'COMPLETED', NULL, 'i am happy  ok', '2026-02-26 18:20:21', '2026-02-27 16:54:09');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('55', '1', '6', '2026-02-27', '09:00:00', '10:00:00', '60', '1500.00', '0.00', '1500.00', 'CONFIRMED', NULL, 'hello ji sir', '2026-02-27 07:03:09', '2026-02-27 15:50:54');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('56', '1', '10', '2026-02-27', '18:00:00', '19:10:00', '90', '38000.00', '1000.00', '37000.00', 'CONFIRMED', NULL, 'have a nice day sir ji ha ok na', '2026-02-27 14:20:27', '2026-03-05 23:58:42');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('59', '1', '5', '2026-02-28', '09:00:00', '10:20:00', '80', '10900.00', '1000.00', '9900.00', 'CONFIRMED', NULL, 'lol', '2026-02-28 23:41:25', '2026-02-28 23:41:25');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('60', '1', '1', '2026-03-05', '09:00:00', '10:00:00', '80', '11200.00', '100.00', '11200.00', 'COMPLETED', NULL, 'ok', '2026-03-06 00:48:10', '2026-03-06 14:31:24');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('61', '1', '3', '2026-03-08', '09:00:00', '10:00:00', '60', '15400.00', '1000.00', '15400.00', 'CANCELLED', 'ok', '', '2026-03-08 05:09:54', '2026-03-08 11:08:42');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('62', '1', '2', '2026-03-08', '10:00:00', '11:20:00', '80', '28000.00', '1000.00', '27000.00', 'COMPLETED', NULL, '', '2026-03-08 07:05:47', '2026-03-12 07:49:43');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('63', '1', '7', '2026-03-08', '09:00:00', '10:00:00', '60', '4500.00', '2000.00', '3500.00', 'CANCELLED', 'lol', '', '2026-03-08 07:16:09', '2026-03-08 10:23:37');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('64', '1', '6', '2026-03-08', '09:00:00', '10:00:00', '60', '4500.00', '1000.00', '3500.00', 'CANCELLED', 'idk lol', NULL, '2026-03-08 07:16:38', '2026-03-08 08:35:44');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('65', '1', '1', '2026-03-08', '09:00:00', '10:00:00', '60', '6000.00', '2000.00', '6000.00', 'COMPLETED', NULL, '', '2026-03-08 08:05:52', '2026-03-08 08:12:33');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('68', '1', '4', '2026-03-08', '09:00:00', '10:00:00', '60', '5200.00', '1000.00', '4200.00', 'CONFIRMED', NULL, '', '2026-03-08 10:05:52', '2026-03-08 10:06:35');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('69', '1', '10', '2026-03-08', '09:00:00', '10:00:00', '60', '2300.00', '1000.00', '2300.00', 'COMPLETED', NULL, 'ok', '2026-03-08 11:06:52', '2026-03-08 11:08:03');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('70', '1', '2', '2026-03-10', '09:00:00', '10:00:00', '60', '10600.00', '1000.00', '9600.00', 'CONFIRMED', NULL, NULL, '2026-03-10 06:44:22', '2026-03-10 06:44:22');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('71', '1', '27', '2026-03-11', '09:00:00', '11:00:00', '120', '13500.00', '1000.00', '12500.00', 'COMPLETED', NULL, '', '2026-03-11 07:09:59', '2026-03-11 16:07:26');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('72', '1', '27', '2026-03-12', '09:00:00', '10:00:00', '60', '1500.00', '0.00', '1500.00', 'CONFIRMED', NULL, NULL, '2026-03-12 08:44:20', '2026-03-12 08:44:20');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('77', '1', '5', '2026-03-12', '09:00:00', '10:00:00', '60', '5400.00', '0.00', '5400.00', 'CONFIRMED', NULL, '', '2026-03-12 09:15:39', '2026-03-12 09:15:58');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('78', '1', '1', '2026-03-12', '09:00:00', '10:00:00', '60', '6600.00', '100.00', '6500.00', 'CONFIRMED', NULL, NULL, '2026-03-12 09:17:50', '2026-03-12 09:17:50');
INSERT INTO `appointments` (`appointment_id`, `salon_id`, `customer_id`, `appointment_date`, `start_time`, `end_time`, `estimated_duration`, `total_amount`, `discount_amount`, `final_amount`, `status`, `cancellation_reason`, `notes`, `created_at`, `updated_at`) VALUES ('80', '1', '29', '2026-03-19', '09:00:00', '10:00:00', '60', '11200.00', '100.00', '11200.00', 'CONFIRMED', NULL, '', '2026-03-19 06:56:08', '2026-03-19 07:46:24');

-- Total INSERT statements: 60
```

---

## Table: `billing_audit_logs`

### Structure

```sql
CREATE TABLE `billing_audit_logs` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `user_type` enum('SUPER_ADMIN','ADMIN','STAFF','CUSTOMER') NOT NULL,
  `user_id` int NOT NULL,
  `salon_id` int DEFAULT NULL,
  `subscription_id` int DEFAULT NULL,
  `billing_month` varchar(7) DEFAULT NULL,
  `request_data` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `billing_calculation_logs`

### Structure

```sql
CREATE TABLE `billing_calculation_logs` (
  `calculation_id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `billing_month` varchar(7) NOT NULL,
  `plan_type` enum('flat','per_appointment','percentage') NOT NULL,
  `total_appointments` int DEFAULT '0',
  `total_revenue` decimal(10,2) DEFAULT '0.00',
  `base_amount` decimal(10,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '18.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `calculation_metadata` json DEFAULT NULL,
  `calculated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `calculated_by` int DEFAULT NULL,
  `invoice_salon_id` bigint DEFAULT NULL,
  PRIMARY KEY (`calculation_id`),
  UNIQUE KEY `uk_subscription_month` (`subscription_id`,`billing_month`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 1

### Data (SQL INSERT Statements)

```sql
INSERT INTO `billing_calculation_logs` (`calculation_id`, `subscription_id`, `billing_month`, `plan_type`, `total_appointments`, `total_revenue`, `base_amount`, `tax_rate`, `tax_amount`, `total_amount`, `calculation_metadata`, `calculated_at`, `calculated_by`, `invoice_salon_id`) VALUES ('1', '21', '2024-01', 'flat', '0', '0.00', '1999.00', '18.00', '359.82', '2358.82', '{"plan_rate": 1999, "calculated_at": "2026-03-12 10:47:44", "appointment_ids": []}', '2026-03-12 15:17:44', '1', NULL);

-- Total INSERT statements: 1
```

---

## Table: `credit_notes`

### Structure

```sql
CREATE TABLE `credit_notes` (
  `credit_note_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_salon_id` bigint NOT NULL,
  `credit_note_number` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` text,
  `status` enum('PENDING','APPLIED','REFUNDED','CANCELLED') DEFAULT 'PENDING',
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`credit_note_id`),
  UNIQUE KEY `credit_note_number` (`credit_note_number`),
  KEY `idx_invoice` (`invoice_salon_id`),
  CONSTRAINT `fk_credit_invoice` FOREIGN KEY (`invoice_salon_id`) REFERENCES `invoice_salon` (`invoice_salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `customer_authentication`

### Structure

```sql
CREATE TABLE `customer_authentication` (
  `auth_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_id`),
  UNIQUE KEY `uk_customer_salon` (`customer_id`,`salon_id`),
  UNIQUE KEY `uk_salon_email` (`salon_id`,`email`),
  CONSTRAINT `customer_authentication_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `customer_authentication_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 26

### Data (SQL INSERT Statements)

```sql
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'amit.patel@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('2', '2', '1', 'neha.singh@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('3', '3', '1', 'rajesh.k@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('4', '4', '1', 'pooja.reddy@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('5', '5', '1', 'vikram.m@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('6', '6', '1', 'anita.desai@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('7', '7', '1', 'suresh.nair@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('8', '8', '1', 'kavita.j@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('9', '9', '1', 'deepak.v@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('10', '10', '1', 'meera.iyer@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('11', '11', '2', 'karthik.g@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('12', '12', '2', 'lakshmi.h@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('13', '13', '2', 'mohan.d@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('14', '14', '2', 'nisha.b@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('15', '15', '2', 'prakash.s@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('16', '16', '3', 'sanjay.m@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('17', '17', '3', 'ritu.c@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('18', '18', '3', 'tarun.b@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('19', '19', '3', 'usha.k@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('20', '20', '3', 'varun.s@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('21', '21', '3', 'willson.d@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('22', '22', '4', 'test1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('23', '23', '4', 'test2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('24', '24', '6', 'hk1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('25', '25', '6', 'hk2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_authentication` (`auth_id`, `customer_id`, `salon_id`, `email`, `password_hash`, `last_login`, `status`, `created_at`, `updated_at`) VALUES ('26', '26', '6', 'hk3@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');

-- Total INSERT statements: 26
```

---

## Table: `customer_payments`

### Structure

```sql
CREATE TABLE `customer_payments` (
  `customer_payment_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_customer_id` bigint NOT NULL,
  `payment_mode` enum('CASH','CARD','UPI','NET_BANKING','WALLET') NOT NULL,
  `transaction_no` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `status` enum('SUCCESS','FAILED','PENDING','REFUNDED') DEFAULT 'PENDING',
  `refund_reason` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_payment_id`),
  UNIQUE KEY `transaction_no` (`transaction_no`),
  KEY `invoice_customer_id` (`invoice_customer_id`),
  KEY `idx_payment_status` (`status`),
  CONSTRAINT `customer_payments_ibfk_1` FOREIGN KEY (`invoice_customer_id`) REFERENCES `invoice_customer` (`invoice_customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 38

### Data (SQL INSERT Statements)

```sql
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('1', '1', 'UPI', 'UPI123456789', '500.00', '2025-02-20 10:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('2', '2', 'CARD', 'CARD987654321', '1400.00', '2025-02-20 12:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('3', '3', 'CASH', NULL, '450.00', '2025-02-21 09:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('4', '4', 'UPI', 'UPI234567890', '1200.00', '2025-02-21 15:05:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('5', '5', 'NET_BANKING', 'NB345678901', '800.00', '2025-02-22 11:20:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('6', '6', 'CARD', 'CARD456789012', '900.00', '2025-02-22 16:05:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('7', '7', 'UPI', 'UPI567890123', '500.00', '2025-02-19 10:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('8', '8', 'CASH', NULL, '500.00', '2025-02-18 15:45:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('9', '9', 'UPI', 'UPI678901234', '400.00', '2025-02-17 11:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('10', '10', 'UPI', 'UPI789012345', '300.00', '2025-02-20 10:30:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('11', '11', 'CASH', NULL, '400.00', '2025-02-20 14:40:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('12', '12', 'UPI', 'UPI890123456', '200.00', '2025-02-21 09:20:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('13', '13', 'CARD', 'CARD567890123', '600.00', '2025-02-21 11:50:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('14', '14', 'UPI', 'UPI901234567', '300.00', '2025-02-19 11:30:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('15', '15', 'CASH', NULL, '450.00', '2025-02-18 14:40:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('16', '16', 'CARD', 'CARD111222333', '700.00', '2025-02-20 10:45:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('17', '17', 'UPI', 'UPI222333444', '2000.00', '2025-02-20 14:05:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('18', '18', 'NET_BANKING', 'NB333444555', '2500.00', '2025-02-21 10:05:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('19', '19', 'CARD', 'CARD444555666', '2700.00', '2025-02-21 15:35:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('20', '20', 'UPI', 'UPI555666777', '700.00', '2025-02-19 10:45:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('21', '21', 'CASH', NULL, '2500.00', '2025-02-18 15:05:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('22', '22', 'UPI', 'UPI666777888', '150.00', '2025-02-17 11:20:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('23', '23', 'UPI', 'UPI777888999', '600.00', '2025-02-20 11:45:00', 'SUCCESS', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('25', '24', 'UPI', 'UPI123456780', '5400.00', '2025-02-24 15:30:00', 'SUCCESS', NULL, '2026-02-26 15:16:22', '2026-02-26 15:16:22');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('26', '24', 'UPI', 'UPI123456788', '545.00', '2025-02-24 15:30:00', 'SUCCESS', NULL, '2026-02-26 15:16:57', '2026-02-26 15:16:57');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('27', '25', 'UPI', 'TXN12344', '1000.00', '2026-02-27 00:00:00', 'SUCCESS', NULL, '2026-02-27 07:05:01', '2026-02-27 07:05:01');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('28', '28', 'CASH', 'TXN12348', '11200.00', '2026-03-06 00:00:00', 'SUCCESS', NULL, '2026-03-06 14:33:34', '2026-03-06 14:33:34');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('29', '25', 'NET_BANKING', 'TXN12340', '100.00', '2026-03-06 00:00:00', 'SUCCESS', NULL, '2026-03-06 14:42:28', '2026-03-06 14:42:28');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('31', '25', 'UPI', 'TXN12300', '310.00', '2026-03-06 00:00:00', 'SUCCESS', NULL, '2026-03-06 17:36:51', '2026-03-06 17:36:51');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('32', '30', 'CASH', NULL, '100.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 08:13:30', '2026-03-08 08:13:30');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('33', '30', 'UPI', 'TXN12333', '3000.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 08:14:00', '2026-03-08 08:14:00');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('34', '30', 'NET_BANKING', 'TXN18888', '1000.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 08:14:29', '2026-03-08 08:14:29');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('35', '31', 'CASH', NULL, '10.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 10:24:43', '2026-03-08 10:24:43');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('36', '31', 'UPI', 'TXN12222', '5000.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 10:25:26', '2026-03-08 10:25:26');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('37', '31', 'CASH', NULL, '10000.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 10:26:22', '2026-03-08 10:26:22');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('38', '32', 'CASH', NULL, '400.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 11:10:25', '2026-03-08 11:10:25');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('39', '32', 'UPI', 'TXN11111', '1000.00', '2026-03-08 00:00:00', 'SUCCESS', NULL, '2026-03-08 11:13:03', '2026-03-08 11:13:03');
INSERT INTO `customer_payments` (`customer_payment_id`, `invoice_customer_id`, `payment_mode`, `transaction_no`, `amount`, `payment_date`, `status`, `refund_reason`, `created_at`, `updated_at`) VALUES ('40', '33', 'CASH', NULL, '3700.00', '2026-03-11 00:00:00', 'SUCCESS', NULL, '2026-03-11 09:30:14', '2026-03-11 09:30:14');

-- Total INSERT statements: 38
```

---

## Table: `customers`

### Structure

```sql
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `anniversary_date` date DEFAULT NULL,
  `address` text,
  `preferences` text,
  `total_visits` int DEFAULT '0',
  `last_visit_date` date DEFAULT NULL,
  `customer_since` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `uk_salon_phone` (`salon_id`,`phone`),
  UNIQUE KEY `uk_salon_email` (`salon_id`,`email`),
  KEY `idx_customers_phone` (`phone`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 29

### Data (SQL INSERT Statements)

```sql
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', 'Amit Patel', '9123456789', 'amit.patel@email.com', 'MALE', '1990-05-15', NULL, '123 MG Road, Bangalore', 'Prefers morning appointments', '1', '2025-02-20', '2024-01-10', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', 'Neha Singh', '9123456790', 'neha.singh@email.com', 'FEMALE', '1992-08-20', '2015-06-10', '456 Park Street, Bangalore', 'Allergic to certain products', '2', '2025-02-20', '2024-02-15', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('3', '1', 'Rajesh Kumar', '9123456791', 'rajesh.k@email.com', 'MALE', '1988-03-25', '2012-12-01', '789 Brigade Road, Bangalore', NULL, '1', '2025-02-21', '2024-03-20', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('4', '1', 'Pooja Reddy', '9123456792', 'pooja.reddy@email.com', 'FEMALE', '1995-11-30', NULL, '321 Residency Road, Bangalore', 'Prefers female staff', '2', '2025-02-21', '2024-01-05', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('5', '1', 'Vikram Mehta', '9123456793', 'vikram.m@email.com', 'MALE', '1985-07-12', '2010-03-15', '654 Commercial Street, Bangalore', NULL, '1', '2025-02-22', '2024-04-10', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('6', '1', 'Anita Desai', '9123456794', 'anita.desai@email.com', 'FEMALE', '1993-02-28', '2018-09-20', '987 Indiranagar, Bangalore', 'Weekend appointments only', '2', '2025-02-22', '2024-02-28', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('7', '1', 'Suresh Nair', '9123456795', 'suresh.nair@email.com', 'MALE', '1991-09-18', NULL, '147 Koramangala, Bangalore', NULL, '0', NULL, '2024-05-15', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('8', '1', 'Kavita Joshi', '9123456796', 'kavita.j@email.com', 'FEMALE', '1989-12-05', '2014-04-25', '258 Whitefield, Bangalore', 'Prefers evening slots', '0', NULL, '2024-01-20', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('9', '1', 'Deepak Verma', '9123456797', 'deepak.v@email.com', 'MALE', '1987-06-22', '2011-11-30', '369 HSR Layout, Bangalore', NULL, '0', NULL, '2024-03-05', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('10', '1', 'Meera Iyer', '9123456798', 'meera.iyer@email.com', 'FEMALE', '1994-04-10', NULL, '741 Jayanagar, Bangalore', 'Monthly facial routine', '0', NULL, '2024-01-02', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('11', '2', 'Karthik Gowda', '9111222333', 'karthik.g@email.com', 'MALE', '1991-04-12', NULL, NULL, NULL, '1', '2025-02-20', '2024-02-10', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('12', '2', 'Lakshmi Hegde', '9111222444', 'lakshmi.h@email.com', 'FEMALE', '1993-07-18', NULL, NULL, NULL, '2', '2025-02-20', '2024-01-25', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('13', '2', 'Mohan Das', '9111222555', 'mohan.d@email.com', 'MALE', '1989-11-22', NULL, NULL, NULL, '1', '2025-02-21', '2024-03-15', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('14', '2', 'Nisha Bhat', '9111222666', 'nisha.b@email.com', 'FEMALE', '1995-02-28', NULL, NULL, NULL, '2', '2025-02-21', '2024-01-08', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('15', '2', 'Prakash Shetty', '9111222777', 'prakash.s@email.com', 'MALE', '1987-08-05', NULL, NULL, NULL, '0', NULL, '2024-04-20', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('16', '3', 'Sanjay Malhotra', '9222333444', 'sanjay.m@email.com', 'MALE', '1986-03-10', '2009-05-15', NULL, NULL, '1', '2025-02-20', '2023-11-20', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('17', '3', 'Ritu Chopra', '9222333555', 'ritu.c@email.com', 'FEMALE', '1990-06-25', '2013-11-20', NULL, NULL, '2', '2025-02-20', '2023-10-15', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('18', '3', 'Tarun Bhat', '9222333666', 'tarun.b@email.com', 'MALE', '1988-09-12', NULL, NULL, NULL, '1', '2025-02-21', '2024-01-05', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('19', '3', 'Usha Kini', '9222333777', 'usha.k@email.com', 'FEMALE', '1994-01-30', '2017-04-10', NULL, NULL, '2', '2025-02-21', '2023-12-01', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('20', '3', 'Varun Saxena', '9222333888', 'varun.s@email.com', 'MALE', '1991-07-18', NULL, NULL, NULL, '1', '2025-02-17', '2024-02-10', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('21', '3', 'Willson Dsouza', '9222333999', 'willson.d@email.com', 'MALE', '1993-04-22', '2019-08-30', NULL, NULL, '0', NULL, '2024-03-01', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('22', '4', 'Test Customer 1', '9000000001', 'test1@test.com', 'MALE', NULL, NULL, NULL, NULL, '1', '2025-02-20', '2025-01-01', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('23', '4', 'Test Customer 2', '9000000002', 'test2@test.com', 'FEMALE', NULL, NULL, NULL, NULL, '0', NULL, '2025-01-15', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('24', '6', 'HK Customer 1', '9100000001', 'hk1@test.com', 'FEMALE', NULL, NULL, NULL, NULL, '0', NULL, '2025-02-01', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('25', '6', 'HK Customer 2', '9100000002', 'hk2@test.com', 'MALE', NULL, NULL, NULL, NULL, '0', NULL, '2025-02-05', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('26', '6', 'HK Customer 3', '9100000003', 'hk3@test.com', 'FEMALE', NULL, NULL, NULL, NULL, '1', '2025-02-20', '2025-02-10', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('27', '1', 'gaurav', '8433557913', 'gaurav@gmail.com', 'MALE', '2000-02-23', '2022-02-12', NULL, NULL, '0', NULL, '2026-03-08', 'ACTIVE', '2026-03-08 08:28:04', '2026-03-08 08:28:04');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('28', '13', 'gaurav', '8433557913', 'gaurav@gmail.com', 'FEMALE', '2004-03-24', '2000-03-23', NULL, NULL, '0', NULL, '2026-03-08', 'ACTIVE', '2026-03-08 09:55:38', '2026-03-08 09:55:38');
INSERT INTO `customers` (`customer_id`, `salon_id`, `name`, `phone`, `email`, `gender`, `date_of_birth`, `anniversary_date`, `address`, `preferences`, `total_visits`, `last_visit_date`, `customer_since`, `status`, `created_at`, `updated_at`) VALUES ('29', '1', 'ali', '8433557912', 'ali@gmail.com', 'MALE', '2004-08-24', '2023-06-23', NULL, NULL, '0', NULL, '2026-03-08', 'ACTIVE', '2026-03-08 11:02:42', '2026-03-08 11:02:42');

-- Total INSERT statements: 29
```

---

## Table: `email_simulator`

### Structure

```sql
CREATE TABLE `email_simulator` (
  `id` int NOT NULL AUTO_INCREMENT,
  `to_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 4

### Data (SQL INSERT Statements)

```sql
INSERT INTO `email_simulator` (`id`, `to_email`, `subject`, `body`, `created_at`, `is_read`) VALUES ('1', 'adminlola@gmail.com', 'Welcome to SAM - Your Admin Account Created', '
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .credentials strong { color: #856404; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class=\'container\'>
        <div class=\'header\'>
            <h1>Welcome to SAM</h1>
            <p>Salon Appointment Management</p>
        </div>
        
        <div class=\'content\'>
            <h2>Hi lola,</h2>
            
            <p>You\'ve been added as the administrator for <strong>lola salon</strong>.</p>
            
            <p>Here are your login credentials:</p>
            
            <div class=\'credentials\'>
                <p><strong>Username:</strong> lola</p>
                <p><strong>Temporary Password:</strong> 1</p>
                <p><strong>Login URL:</strong> <a href=\'http://localhost/Sam-Backend/FRONTED/ADMIN/html/login.html\'>Click here to login</a></p>
            </div>
            
            <p><strong>⚠️ Important:</strong> You will be required to change this password on your first login.</p>
            
            <p>Best regards,<br>SAM Team</p>
        </div>
        
        <div class=\'footer\'>
            © 2026 SAM - Salon Appointment Management
        </div>
    </div>
</body>
</html>
        ', '2026-03-16 17:17:57', '0');
INSERT INTO `email_simulator` (`id`, `to_email`, `subject`, `body`, `created_at`, `is_read`) VALUES ('2', 'adminlola@gmail.com', 'Welcome to SAM - Your Admin Account Created', '
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .credentials strong { color: #856404; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class=\'container\'>
        <div class=\'header\'>
            <h1>Welcome to SAM</h1>
            <p>Salon Appointment Management</p>
        </div>
        
        <div class=\'content\'>
            <h2>Hi lola,</h2>
            
            <p>You\'ve been added as the administrator for <strong>lola salon</strong>.</p>
            
            <p>Here are your login credentials:</p>
            
            <div class=\'credentials\'>
                <p><strong>Username:</strong> lola</p>
                <p><strong>Temporary Password:</strong> GHEevuJbX|nR3;3!</p>
                <p><strong>Login URL:</strong> <a href=\'http://localhost/Sam-Backend/FRONTED/ADMIN/html/login.html\'>Click here to login</a></p>
            </div>
            
            <p><strong>⚠️ Important:</strong> You will be required to change this password on your first login.</p>
            
            <p>Best regards,<br>SAM Team</p>
        </div>
        
        <div class=\'footer\'>
            © 2026 SAM - Salon Appointment Management
        </div>
    </div>
</body>
</html>
        ', '2026-03-16 17:23:35', '0');
INSERT INTO `email_simulator` (`id`, `to_email`, `subject`, `body`, `created_at`, `is_read`) VALUES ('3', 'adminlola@gmail.com', 'Welcome to SAM - Your Admin Account Created', '
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .credentials strong { color: #856404; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class=\'container\'>
        <div class=\'header\'>
            <h1>Welcome to SAM</h1>
            <p>Salon Appointment Management</p>
        </div>
        
        <div class=\'content\'>
            <h2>Hi lola,</h2>
            
            <p>You\'ve been added as the administrator for <strong>lola salon</strong>.</p>
            
            <p>Here are your login credentials:</p>
            
            <div class=\'credentials\'>
                <p><strong>Username:</strong> lola</p>
                <p><strong>Temporary Password:</strong> A&c&_|FMeb8@ceZh</p>
                <p><strong>Login URL:</strong> <a href=\'http://localhost/Sam-Backend/FRONTED/ADMIN/html/login.html\'>Click here to login</a></p>
            </div>
            
            <p><strong>⚠️ Important:</strong> You will be required to change this password on your first login.</p>
            
            <p>Best regards,<br>SAM Team</p>
        </div>
        
        <div class=\'footer\'>
            © 2026 SAM - Salon Appointment Management
        </div>
    </div>
</body>
</html>
        ', '2026-03-16 17:35:25', '0');
INSERT INTO `email_simulator` (`id`, `to_email`, `subject`, `body`, `created_at`, `is_read`) VALUES ('4', 'adminindi@gmail.com', 'Welcome to SAM - Your Admin Account Created', '
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .credentials strong { color: #856404; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class=\'container\'>
        <div class=\'header\'>
            <h1>Welcome to SAM</h1>
            <p>Salon Appointment Management</p>
        </div>
        
        <div class=\'content\'>
            <h2>Hi indi,</h2>
            
            <p>You\'ve been added as the administrator for <strong>indisalon</strong>.</p>
            
            <p>Here are your login credentials:</p>
            
            <div class=\'credentials\'>
                <p><strong>Username:</strong> indi</p>
                <p><strong>Temporary Password:</strong> DAtXb7J<uDYMa3zD</p>
                <p><strong>Login URL:</strong> <a href=\'http://localhost/Sam-Backend/FRONTED/ADMIN/html/login.html\'>Click here to login</a></p>
            </div>
            
            <p><strong>⚠️ Important:</strong> You will be required to change this password on your first login.</p>
            
            <p>Best regards,<br>SAM Team</p>
        </div>
        
        <div class=\'footer\'>
            © 2026 SAM - Salon Appointment Management
        </div>
    </div>
</body>
</html>
        ', '2026-03-17 07:11:51', '0');

-- Total INSERT statements: 4
```

---

## Table: `incentive_payouts`

### Structure

```sql
CREATE TABLE `incentive_payouts` (
  `payout_id` int NOT NULL AUTO_INCREMENT,
  `incentive_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `payout_amount` decimal(10,2) NOT NULL,
  `payout_date` date NOT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payout_id`),
  KEY `incentive_id` (`incentive_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `incentive_payouts_ibfk_1` FOREIGN KEY (`incentive_id`) REFERENCES `incentives` (`incentive_id`),
  CONSTRAINT `incentive_payouts_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 7

### Data (SQL INSERT Statements)

```sql
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '50.00', '2025-02-28', 'BANK', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('2', '2', '1', '150.00', '2025-02-28', 'BANK', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('3', '3', '2', '200.00', '2025-02-28', 'BANK', NULL, NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('4', '6', '10', '500.00', '2025-02-24', 'BANK', 'TXN123456', 'Monthly payout', '2026-02-26 14:34:20', '2026-02-26 14:34:20');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('5', '6', '8', '500.00', '2025-02-24', 'BANK', 'TXN123456', 'Monthly payout', '2026-02-26 14:34:31', '2026-02-26 14:34:31');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('6', '7', '10', '500.00', '2025-02-24', 'BANK', 'TXN123456', 'bonus', '2026-02-26 14:43:38', '2026-02-26 14:43:38');
INSERT INTO `incentive_payouts` (`payout_id`, `incentive_id`, `staff_id`, `payout_amount`, `payout_date`, `payment_mode`, `transaction_reference`, `remarks`, `created_at`, `updated_at`) VALUES ('7', '10', '1', '1000.00', '2026-02-26', 'UPI', 'TXN123456', 'idk lol', '2026-02-27 00:11:16', '2026-02-27 00:11:16');

-- Total INSERT statements: 7
```

---

## Table: `incentives`

### Structure

```sql
CREATE TABLE `incentives` (
  `incentive_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `incentive_type` enum('SERVICE_COMMISSION','BONUS','TARGET_ACHIEVEMENT') NOT NULL,
  `calculation_type` enum('PERCENTAGE','FIXED') NOT NULL,
  `percentage_rate` decimal(5,2) DEFAULT NULL,
  `fixed_amount` decimal(10,2) DEFAULT NULL,
  `base_amount` decimal(10,2) DEFAULT NULL,
  `incentive_amount` decimal(10,2) NOT NULL,
  `remarks` text,
  `status` enum('PENDING','APPROVED','PAID') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`incentive_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `incentives_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 15

### Data (SQL INSERT Statements)

```sql
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'SERVICE_COMMISSION', 'FIXED', NULL, NULL, NULL, '50.00', 'Haircut commission', 'PAID', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', '2', 'SERVICE_COMMISSION', 'FIXED', NULL, NULL, NULL, '150.00', 'Hair coloring commission', 'PAID', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('3', '2', '6', 'SERVICE_COMMISSION', 'FIXED', NULL, NULL, NULL, '200.00', 'Party makeup commission', 'PAID', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('4', '3', '5', 'SERVICE_COMMISSION', 'FIXED', NULL, NULL, NULL, '80.00', 'Facial commission', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('5', '1', NULL, 'BONUS', 'FIXED', NULL, '1000.00', NULL, '1000.00', 'Monthly performance bonus', 'PENDING', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('6', '10', NULL, 'BONUS', 'FIXED', NULL, '500.00', NULL, '500.00', 'Excellent performance', 'PAID', '2026-02-26 14:30:51', '2026-02-26 14:34:31');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('7', '10', NULL, 'BONUS', 'FIXED', NULL, '500.00', NULL, '500.00', 'Excellent performance', 'PAID', '2026-02-26 14:42:23', '2026-02-26 14:43:38');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('8', '10', NULL, 'BONUS', 'FIXED', NULL, '500.00', '1000.00', '500.00', NULL, 'PENDING', '2026-02-26 23:36:55', '2026-02-26 23:36:55');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('9', '10', NULL, 'BONUS', 'FIXED', NULL, '1000.00', NULL, '1000.00', 'Test incentive - can be deleted', 'PENDING', '2026-02-26 23:52:28', '2026-02-26 23:52:28');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('10', '1', NULL, 'BONUS', 'FIXED', NULL, '1000.00', NULL, '1000.00', 'idk lol', 'PAID', '2026-02-27 00:11:16', '2026-02-27 00:11:16');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('11', '1', NULL, 'BONUS', 'PERCENTAGE', '10.00', NULL, '10000.00', '1000.00', 'lolol', 'PENDING', '2026-02-27 00:19:11', '2026-02-27 00:19:11');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('12', '1', NULL, 'BONUS', 'FIXED', NULL, '80.00', '1000.00', '20.00', NULL, 'PENDING', '2026-02-27 00:20:05', '2026-02-27 00:20:05');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('13', '10', NULL, 'BONUS', 'FIXED', NULL, '50.00', '1000.00', '50.00', NULL, 'PENDING', '2026-02-27 00:21:25', '2026-02-27 00:21:25');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('14', '12', NULL, 'SERVICE_COMMISSION', 'FIXED', NULL, '200.00', '10000.00', '200.00', NULL, 'PENDING', '2026-03-08 08:17:47', '2026-03-08 08:17:47');
INSERT INTO `incentives` (`incentive_id`, `staff_id`, `appointment_id`, `incentive_type`, `calculation_type`, `percentage_rate`, `fixed_amount`, `base_amount`, `incentive_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES ('15', '12', NULL, 'BONUS', 'FIXED', NULL, NULL, NULL, '10000.00', NULL, 'PENDING', '2026-03-08 08:22:35', '2026-03-08 08:22:35');

-- Total INSERT statements: 15
```

---

## Table: `invoice_customer`

### Structure

```sql
CREATE TABLE `invoice_customer` (
  `invoice_customer_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `subtotal_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('UNPAID','PARTIAL','PAID','REFUNDED') DEFAULT 'UNPAID',
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_customer_id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `salon_id` (`salon_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_invoice_date` (`invoice_date`),
  CONSTRAINT `invoice_customer_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `invoice_customer_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  CONSTRAINT `invoice_customer_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 31

### Data (SQL INSERT Statements)

```sql
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '1', 'INV-1-20250220-0001', '500.00', '0.00', '0.00', '500.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('2', '2', '1', '2', 'INV-1-20250220-0002', '1500.00', '0.00', '100.00', '1400.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('3', '3', '1', '3', 'INV-1-20250221-0001', '500.00', '0.00', '50.00', '450.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('4', '4', '1', '4', 'INV-1-20250221-0002', '1200.00', '0.00', '0.00', '1200.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('5', '5', '1', '5', 'INV-1-20250222-0001', '800.00', '0.00', '0.00', '800.00', 'PAID', '2025-02-22', '2025-03-01', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('6', '6', '1', '6', 'INV-1-20250222-0002', '2000.00', '0.00', '200.00', '1800.00', 'PARTIAL', '2025-02-22', '2025-03-01', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('7', '12', '1', '2', 'INV-1-20250219-0001', '500.00', '0.00', '0.00', '500.00', 'PAID', '2025-02-19', '2025-02-26', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('8', '13', '1', '4', 'INV-1-20250218-0001', '500.00', '0.00', '0.00', '500.00', 'PAID', '2025-02-18', '2025-02-25', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('9', '14', '1', '6', 'INV-1-20250217-0001', '400.00', '0.00', '0.00', '400.00', 'PAID', '2025-02-17', '2025-02-24', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('10', '16', '2', '11', 'INV-2-20250220-0001', '300.00', '0.00', '0.00', '300.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('11', '17', '2', '12', 'INV-2-20250220-0002', '450.00', '0.00', '50.00', '400.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('12', '18', '2', '13', 'INV-2-20250221-0001', '200.00', '0.00', '0.00', '200.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('13', '19', '2', '14', 'INV-2-20250221-0002', '600.00', '0.00', '0.00', '600.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('14', '22', '2', '11', 'INV-2-20250219-0001', '300.00', '0.00', '0.00', '300.00', 'PAID', '2025-02-19', '2025-02-26', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('15', '23', '2', '14', 'INV-2-20250218-0001', '450.00', '0.00', '0.00', '450.00', 'PAID', '2025-02-18', '2025-02-25', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('16', '24', '3', '16', 'INV-3-20250220-0001', '700.00', '0.00', '0.00', '700.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('17', '25', '3', '17', 'INV-3-20250220-0002', '4000.00', '0.00', '400.00', '3600.00', 'PARTIAL', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('18', '26', '3', '18', 'INV-3-20250221-0001', '2500.00', '0.00', '0.00', '2500.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('19', '27', '3', '19', 'INV-3-20250221-0002', '3000.00', '0.00', '300.00', '2700.00', 'PAID', '2025-02-21', '2025-02-28', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('20', '31', '3', '17', 'INV-3-20250219-0001', '700.00', '0.00', '0.00', '700.00', 'PAID', '2025-02-19', '2025-02-26', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('21', '32', '3', '19', 'INV-3-20250218-0001', '2500.00', '0.00', '0.00', '2500.00', 'PAID', '2025-02-18', '2025-02-25', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('22', '33', '3', '20', 'INV-3-20250217-0001', '150.00', '0.00', '0.00', '150.00', 'PAID', '2025-02-17', '2025-02-24', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('23', '38', '6', '26', 'INV-6-20250220-0001', '600.00', '0.00', '0.00', '600.00', 'PAID', '2025-02-20', '2025-02-27', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('24', '10', '1', '10', 'INV-1-20260226-1267', '5555.00', '990.00', '600.00', '5945.00', 'PAID', '2026-02-26', '2025-03-15', 'Thank you for your business', '2026-02-26 15:00:19', '2026-02-26 15:16:57');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('25', '55', '1', '6', 'INV-C-1-20260227-9534', '1500.00', '10.00', '100.00', '1410.00', 'PAID', '2026-02-27', '2026-02-27', '', '2026-02-27 07:04:05', '2026-03-06 17:36:51');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('28', '60', '1', '1', 'INV-C-1-20260306-9870', '11200.00', '100.00', '100.00', '11200.00', 'PAID', '2026-03-06', '2026-03-06', 'ok', '2026-03-06 14:32:05', '2026-03-06 14:33:35');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('29', '61', '1', '3', 'INV-C-1-20260308-7160', '5200.00', '1.00', '100.00', '5101.00', 'UNPAID', '2026-03-08', '2026-03-14', '', '2026-03-08 05:12:04', '2026-03-08 05:12:04');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('30', '65', '1', '1', 'INV-C-1-20260308-1219', '6000.00', '100.00', '2000.00', '4100.00', 'PAID', '2026-03-08', '2026-03-15', '', '2026-03-08 08:13:03', '2026-03-08 08:14:29');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('31', '62', '1', '2', 'INV-C-1-20260308-4908', '16000.00', '10.00', '1000.00', '15010.00', 'PAID', '2026-03-08', '2026-03-15', '', '2026-03-08 10:24:06', '2026-03-08 10:26:22');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('32', '69', '1', '10', 'INV-C-1-20260308-7354', '2300.00', '100.00', '1000.00', '1400.00', 'PAID', '2026-03-08', '2026-03-15', 'ok', '2026-03-08 11:09:15', '2026-03-08 11:13:03');
INSERT INTO `invoice_customer` (`invoice_customer_id`, `appointment_id`, `salon_id`, `customer_id`, `invoice_number`, `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount`, `payment_status`, `invoice_date`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES ('33', '71', '1', '27', 'INV-C-1-20260311-4699', '12700.00', '2000.00', '1000.00', '13700.00', 'PARTIAL', '2026-03-11', '2026-03-18', '', '2026-03-11 09:29:39', '2026-03-11 09:30:14');

-- Total INSERT statements: 31
```

---

## Table: `invoice_salon`

### Structure

```sql
CREATE TABLE `invoice_salon` (
  `invoice_salon_id` bigint NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `subscription_id` int NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('UNPAID','PARTIAL','PAID','REFUNDED') DEFAULT 'UNPAID',
  `due_date` date NOT NULL,
  `invoice_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_salon_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `salon_id` (`salon_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `invoice_salon_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  CONSTRAINT `invoice_salon_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `salon_subscriptions` (`subscription_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 1

### Data (SQL INSERT Statements)

```sql
INSERT INTO `invoice_salon` (`invoice_salon_id`, `salon_id`, `subscription_id`, `invoice_number`, `amount`, `tax_amount`, `total_amount`, `payment_status`, `due_date`, `invoice_date`, `created_at`, `updated_at`) VALUES ('21', '1', '22', 'INV-SUB-1-20260313-9749', '0.00', '0.00', '0.00', 'UNPAID', '2026-03-20', '2026-03-13', '2026-03-13 14:58:27', '2026-03-13 14:58:27');

-- Total INSERT statements: 1
```

---

## Table: `invoice_salon_items`

### Structure

```sql
CREATE TABLE `invoice_salon_items` (
  `invoice_item_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_salon_id` bigint NOT NULL,
  `item_type` enum('subscription_fee','appointment_charge','percentage_charge','tax') NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) DEFAULT '1.00',
  `unit_price` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_item_id`),
  KEY `idx_invoice_salon` (`invoice_salon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `leave_requests`

### Structure

```sql
CREATE TABLE `leave_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `leave_type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text,
  `status` varchar(20) DEFAULT 'PENDING',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `package_services`

### Structure

```sql
CREATE TABLE `package_services` (
  `package_id` int NOT NULL,
  `service_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`,`service_id`),
  KEY `service_id` (`service_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `package_services_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`),
  CONSTRAINT `package_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  CONSTRAINT `package_services_ibfk_3` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 44

### Data (SQL INSERT Statements)

```sql
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('1', '1', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('1', '2', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('1', '3', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('1', '4', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('1', '8', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('2', '1', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('2', '8', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('3', '1', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('3', '2', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('3', '3', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('4', '4', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('5', '1', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('5', '4', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('5', '5', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('5', '6', '1', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('6', '11', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('6', '13', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('6', '15', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('7', '11', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('7', '12', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('7', '14', '2', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('8', '18', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('8', '19', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('8', '20', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('9', '18', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('9', '21', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('10', '16', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('10', '17', '3', '2026-02-25 22:21:36');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('11', '138', '1', '2026-02-27 06:40:32');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('11', '146', '1', '2026-02-27 06:40:32');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('11', '187', '1', '2026-02-27 06:40:32');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('11', '190', '1', '2026-02-27 06:40:32');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('12', '187', '1', '2026-02-27 17:41:31');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('12', '190', '1', '2026-02-27 17:41:31');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('13', '187', '1', '2026-02-27 17:53:29');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('13', '188', '1', '2026-02-27 17:53:29');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('13', '189', '1', '2026-02-27 17:53:29');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('14', '188', '1', '2026-03-08 10:28:17');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('14', '189', '1', '2026-03-08 10:28:17');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('14', '190', '1', '2026-03-08 10:28:17');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('14', '191', '1', '2026-03-08 10:28:17');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('15', '193', '1', '2026-03-08 11:25:00');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('15', '194', '1', '2026-03-08 11:25:00');
INSERT INTO `package_services` (`package_id`, `service_id`, `salon_id`, `created_at`) VALUES ('15', '195', '1', '2026-03-08 11:25:00');

-- Total INSERT statements: 44
```

---

## Table: `packages`

### Structure

```sql
CREATE TABLE `packages` (
  `package_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `description` text,
  `total_price` decimal(10,2) NOT NULL,
  `validity_days` int NOT NULL,
  `image_url` text,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 15

### Data (SQL INSERT Statements)

```sql
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', 'Bridal Package', 'Complete bridal makeover with all services', '15000.00', '30', 'uploads/packages/bridal.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-06 18:31:07');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', 'Party Package', 'Makeup and hair styling for parties', '5000.00', '15', 'uploads/packages/party.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('3', '1', 'Hair Care Package', 'Haircut, coloring, and spa', '3000.00', '30', 'uploads/packages/haircare.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('4', '1', 'Skin Care Package', 'Multiple facial sessions', '4000.00', '45', 'uploads/packages/skincare.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-06 18:17:48');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('5', '1', 'Complete Grooming', 'Full body grooming package', '6000.00', '30', 'uploads/packages/grooming.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('6', '2', 'Men\'s Grooming', 'Haircut + Beard Trim + Massage', '800.00', '30', 'uploads/packages/mens-grooming.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('7', '2', 'Women\'s Special', 'Haircut + Styling + Facial', '1200.00', '30', 'uploads/packages/womens-special.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('8', '3', 'Luxury Spa Day', 'Full body massage + facial + nail care', '6000.00', '30', 'uploads/packages/spa-day.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('9', '3', 'Bridal Glow', 'Pre-bridal skincare package', '8000.00', '60', 'uploads/packages/bridal-glow.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('10', '3', 'Hair Transformation', 'Complete hair makeover', '5000.00', '45', 'uploads/packages/hair-transform.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('11', '1', 'Eid Package', 'make over for eid', '10000.00', '30', NULL, 'INACTIVE', '2026-02-27 06:40:32', '2026-02-27 06:48:54');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('12', '1', 'kids package', 'full make over for kids', '0.00', '70', NULL, 'ACTIVE', '2026-02-27 17:41:31', '2026-02-27 17:41:31');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('13', '1', 'hair make over', NULL, '4000.00', '20', NULL, 'ACTIVE', '2026-02-27 17:53:29', '2026-02-27 17:53:29');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('14', '1', 'gaurav special', NULL, '3900.00', '90', NULL, 'INACTIVE', '2026-03-08 10:28:17', '2026-03-08 10:35:47');
INSERT INTO `packages` (`package_id`, `salon_id`, `package_name`, `description`, `total_price`, `validity_days`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('15', '1', 'test', NULL, '9500.00', '90', NULL, 'ACTIVE', '2026-03-08 11:25:00', '2026-03-08 11:25:00');

-- Total INSERT statements: 15
```

---

## Table: `password_reset_tokens`

### Structure

```sql
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL COMMENT 'Bcrypt hash of the reset token',
  `expires_at` datetime NOT NULL COMMENT 'Token expiration timestamp (1 hour from creation)',
  `used` tinyint(1) DEFAULT '0' COMMENT 'Whether token has been used',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_hash` (`token_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_reset_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Secure password reset tokens'
```

### Row Count: 1

### Data (SQL INSERT Statements)

```sql
INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `used`, `created_at`) VALUES ('2', '12', '$2y$10$K/Ua76ekUs6sXg0fZZK96eOqR9Xbb0PZUcjLe5CLfLnmWhBLhKuEC', '2026-03-17 05:13:59', '0', '2026-03-17 08:43:59');

-- Total INSERT statements: 1
```

---

## Table: `payments_salon`

### Structure

```sql
CREATE TABLE `payments_salon` (
  `payment_salon_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_salon_id` bigint NOT NULL,
  `payment_mode` enum('CASH','CARD','UPI','NET_BANKING','CHEQUE') NOT NULL,
  `transaction_no` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_salon_id`),
  KEY `invoice_salon_id` (`invoice_salon_id`),
  CONSTRAINT `payments_salon_ibfk_1` FOREIGN KEY (`invoice_salon_id`) REFERENCES `invoice_salon` (`invoice_salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `products`

### Structure

```sql
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `category` enum('product','equipment') NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 20

### Data (SQL INSERT Statements)

```sql
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('1', '1', 'Shampoo', 'L\'Oreal', 'product', 'Professional shampoo for all hair types', '2026-02-25 22:21:36', '2026-03-11 10:35:42');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('2', '1', 'Conditioner', 'L\'Oreal', 'product', 'Deep conditioning treatment', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('3', '1', 'Hair Color', 'Schwarzkopf', 'product', 'Permanent hair color range', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('4', '1', 'Face Cream', 'Olay', 'product', 'Moisturizing face cream', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('5', '1', 'Hair Dryer', 'Philips', 'equipment', 'Professional hair dryer', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('6', '1', 'Facial Kit', 'Garnier', 'product', 'Complete facial kit', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('7', '1', 'Hair Oil', 'Parachute', 'product', 'Coconut hair oil', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('8', '1', 'Hair Straightener', 'Philips', 'equipment', 'Ceramic hair straightener', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('9', '2', 'Hair Gel', 'Gatsby', 'product', 'Strong hold hair gel', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('10', '2', 'Beard Oil', 'Beardo', 'product', 'Nourishing beard oil', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('11', '2', 'Hair Wax', 'Ustraa', 'product', 'Matte finish hair wax', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('12', '2', 'Aftershave', 'Nivea', 'product', 'Soothing aftershave lotion', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('13', '3', 'Keratin Shampoo', 'L\'Oreal Professional', 'product', 'Post-keratin treatment shampoo', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('14', '3', 'Face Mask', 'Forest Essentials', 'product', 'Luxury face mask', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('15', '3', 'Massage Oil', 'Kama Ayurveda', 'product', 'Ayurvedic massage oil', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('16', '3', 'Nail Polish', 'OPI', 'product', 'Professional nail polish range', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('17', '3', 'Hair Serum', 'Schwarzkopf', 'product', 'Smoothing hair serum', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('18', '3', 'Body Lotion', 'The Body Shop', 'product', 'Hydrating body lotion', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('19', '1', 'hair drier', 'panasonic', 'equipment', 'for drying hair obviusly bruh', '2026-02-27 06:56:56', '2026-02-27 06:56:56');
INSERT INTO `products` (`product_id`, `salon_id`, `product_name`, `brand`, `category`, `description`, `created_at`, `updated_at`) VALUES ('20', '1', 'soap', 'lux', 'product', NULL, '2026-03-08 11:25:40', '2026-03-08 11:25:40');

-- Total INSERT statements: 20
```

---

## Table: `refresh_tokens`

### Structure

```sql
CREATE TABLE `refresh_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `user_type` enum('SUPER_ADMIN','ADMIN','STAFF','CUSTOMER') NOT NULL,
  `user_id` int NOT NULL,
  `salon_id` int DEFAULT NULL,
  `token_hash` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `replaced_by` varchar(128) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`token_id`),
  KEY `idx_user_type_user_id` (`user_type`,`user_id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_user_lookup` (`user_type`,`user_id`),
  KEY `idx_user_context` (`user_type`,`user_id`,`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 112

### Data (SQL INSERT Statements)

```sql
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('1', 'SUPER_ADMIN', '4', NULL, '5bfedbd5f8f1e7acd87778783d00d588c8db5c6dc7fb5e17ab29f73c98a57e6c', '2026-03-04 19:36:38', '0', NULL, '2026-02-26 00:06:38', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('2', 'ADMIN', '12', '1', '4e8152a0200fa65507fb914470f616ef03a05da457da24528dd2a007ee5492cf', '2026-03-04 19:39:58', '0', NULL, '2026-02-26 00:09:58', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('3', 'ADMIN', '12', '1', 'b0d85718e9d2e2bddad6b9876fe345585db290e31e9bd72fc89341c3ad94b54a', '2026-03-04 20:02:23', '0', NULL, '2026-02-26 00:32:23', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('4', 'SUPER_ADMIN', '4', NULL, 'b8b5cea85022835132ccf79306f30c2ef4a2c692589558f15124d14842e61ba7', '2026-03-05 00:40:42', '0', NULL, '2026-02-26 05:10:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('5', 'ADMIN', '12', '1', '508464f204433be27a7d39bb2bf646d941fb63fd2c88093ebaa796e28213acdf', '2026-03-05 00:42:01', '0', NULL, '2026-02-26 05:12:01', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('6', 'ADMIN', '12', '1', 'e4f1c9c09bd6796fb7b229b2189f2afeeb852d47147fb54df300be2127fd1b9a', '2026-03-05 12:29:59', '0', NULL, '2026-02-26 16:59:59', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('7', 'ADMIN', '12', '1', 'eccda0eddaaf58e9e5788fdc026921baac185e2da25e810465a545e0c81a76e4', '2026-03-05 12:33:58', '1', NULL, '2026-02-26 17:03:58', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('8', 'ADMIN', '12', '1', '81219bff98008e457763e734b6e95c6d850af0d619225814ea62f929e7a086f4', '2026-03-05 12:35:49', '1', NULL, '2026-02-26 17:05:49', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('9', 'ADMIN', '12', '1', '0abd977d4f230cca60a0a2d30122bdf2c0fd9567e8e83637e55216178deaee47', '2026-03-05 12:42:54', '0', NULL, '2026-02-26 17:12:54', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('10', 'ADMIN', '12', '1', 'bed20432180dd5848e3aa42b91d7747541bbdb00543ba28a2e4921c76360313a', '2026-03-05 12:43:14', '0', NULL, '2026-02-26 17:13:14', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('11', 'ADMIN', '12', '1', '83ab49c018a53c60f442914b70defa634152b74b790966ba93965c575c923cd6', '2026-03-05 12:44:22', '0', NULL, '2026-02-26 17:14:22', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('12', 'ADMIN', '12', '1', '2d13ef3d387b3ca4770478db91af5d180ab69e9724ef2a0e3551ce66d8120d92', '2026-03-05 12:44:31', '0', NULL, '2026-02-26 17:14:31', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('13', 'ADMIN', '12', '1', '2f3e632723b620a96ce851718bffe50e5d0b3c4a439f65a3a1a89aba41dabb2e', '2026-03-05 12:48:47', '0', NULL, '2026-02-26 17:18:47', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('14', 'ADMIN', '12', '1', 'd8ff3df0dd7153ce0e891b12afce36c9078ac688e19739e9be961e72c612e5cc', '2026-03-05 12:48:52', '0', NULL, '2026-02-26 17:18:52', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('15', 'ADMIN', '12', '1', '7e93cc1cdb0523dd0eacab2e293ba6e170b9915598591cc9327b82f5f57e03e5', '2026-03-05 12:51:42', '0', NULL, '2026-02-26 17:21:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('16', 'ADMIN', '12', '1', '3524c820b2667bcf51adc1889b0199861b940aa078e41bd9e248bc8832fdcc32', '2026-03-05 12:52:47', '1', NULL, '2026-02-26 17:22:47', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('17', 'ADMIN', '12', '1', 'e93cd6fe31e7452995a765fff5542e631a417d6ba2bf64601adff8df8a242945', '2026-03-06 13:52:09', '1', NULL, '2026-02-27 18:22:09', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('18', 'ADMIN', '12', '1', 'e0c0529364e5bd76b1c5a5b79d8ed4f75d6fc3d975ac45a0ba9c7e73307b2e08', '2026-03-06 14:07:32', '0', NULL, '2026-02-27 18:37:32', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('19', 'SUPER_ADMIN', '4', NULL, '6adc5f98d96d6a1a077ffc5552b887dcb84ade5ed3502a988e49c25c5b6f2153', '2026-03-09 10:21:53', '0', NULL, '2026-03-02 14:51:53', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('20', 'ADMIN', '12', '1', 'd0a1803c7ab661421a21054b9a95a1330ec5ec1ec5d5c9ee781b12332bd7e2e5', '2026-03-09 10:28:36', '0', NULL, '2026-03-02 14:58:37', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('21', 'SUPER_ADMIN', '4', NULL, '50a3cb1e60a8128d91860465b591c59da34abddbd625d16faf374acaa6b77c95', '2026-03-09 10:35:48', '1', NULL, '2026-03-02 15:05:48', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('22', 'SUPER_ADMIN', '4', NULL, '7b74678085b0b91f4d4b30962566d800211225e9797edc1d83aeaf12ea49be83', '2026-03-09 10:39:28', '1', NULL, '2026-03-02 15:09:28', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('23', 'SUPER_ADMIN', '4', NULL, 'cb47987bdf77a7ab01d854056061a32bb326116e962325e491ea08b64febcc73', '2026-03-09 10:39:43', '1', NULL, '2026-03-02 15:09:43', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('24', 'SUPER_ADMIN', '4', NULL, 'c3c70dae34b42602ca4ea99ccb7f4b805dfeb03bd68ed0e638fa1ae56319408a', '2026-03-09 10:39:52', '1', NULL, '2026-03-02 15:09:52', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('25', 'SUPER_ADMIN', '4', NULL, '49dda8161ec3de039bb62457462965f29318cde3f7d3ccdb9a71b1731a68943b', '2026-03-09 10:46:58', '1', NULL, '2026-03-02 15:16:58', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('26', 'SUPER_ADMIN', '4', NULL, 'c26d94e91a1d12fe87573be8d83267f9ae38c73db04e5f5d8d5dea211cdf1710', '2026-03-09 10:55:06', '0', NULL, '2026-03-02 15:25:06', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('27', 'SUPER_ADMIN', '4', NULL, '92386a7bfc537df0d0e1adcb46faae1b5bd1aa4db690a140c3e62f97c213ea0b', '2026-03-09 11:12:42', '0', NULL, '2026-03-02 15:42:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('28', 'SUPER_ADMIN', '4', NULL, '76336d70bf9961fae752ee8ddf878784b5b4f551005d1013f374685d45d93407', '2026-03-09 11:13:37', '0', NULL, '2026-03-02 15:43:37', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('29', 'SUPER_ADMIN', '4', NULL, 'b0dc70943917895ba5cd9b33ce7d2e7daa40a57d93eae8d66ce468db7851d2ce', '2026-03-09 12:22:42', '0', NULL, '2026-03-02 16:52:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('30', 'SUPER_ADMIN', '4', NULL, 'dc7fc32aa80a9e8a5270de5efcd6ac834b767aa1fae3564b0afa609a25d31141', '2026-03-09 12:23:39', '0', NULL, '2026-03-02 16:53:39', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('31', 'SUPER_ADMIN', '4', NULL, '9fe7222cf9c2498a2ed1a4b4df2ecc8dacf09886ba084a6e9c7df0a083f0b7d1', '2026-03-09 12:23:48', '0', NULL, '2026-03-02 16:53:48', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('32', 'SUPER_ADMIN', '4', NULL, 'a05991db3f0a969718f135270623880388490b9fa114d0b78bd3731166dff862', '2026-03-09 12:23:53', '0', NULL, '2026-03-02 16:53:53', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('33', 'SUPER_ADMIN', '4', NULL, '82494d1cdfb1d69de7038ad357f043adf07877aaae9c80dc12a97ea9a1e4913e', '2026-03-09 12:28:06', '0', NULL, '2026-03-02 16:58:06', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('34', 'SUPER_ADMIN', '4', NULL, '4680b6ace12dc99ee0b774e5509f4228bc2bef8e3519f3cc39814aa57a24322c', '2026-03-09 12:28:17', '0', NULL, '2026-03-02 16:58:17', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('35', 'SUPER_ADMIN', '4', NULL, 'fdd7a406c74f0016a3a93c6b3c5f055b89116cd5d76fc1eb3cc4e222ede9d6ea', '2026-03-09 12:28:25', '0', NULL, '2026-03-02 16:58:25', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('36', 'SUPER_ADMIN', '4', NULL, 'd0859de6fe453a0652cc402ffea8e87a457e0abf7df7d4415c023de45ee9a2dc', '2026-03-09 12:28:34', '0', NULL, '2026-03-02 16:58:34', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('37', 'SUPER_ADMIN', '4', NULL, '104880c87e2527d5d881ae1002c9ca6a537effa29d6eb15e68edd5dceee3790c', '2026-03-09 12:28:44', '0', NULL, '2026-03-02 16:58:44', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('38', 'SUPER_ADMIN', '4', NULL, '11e15066672c9576ee63ac9c5747b14eb9ae26c4bffa3c53a3e769c10edc247f', '2026-03-09 12:28:51', '0', NULL, '2026-03-02 16:58:51', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('39', 'SUPER_ADMIN', '4', NULL, 'b010df9e17dc3a4c5267296b6baf70c62797e7f3d10fe8e32bda24277ab2e1fe', '2026-03-09 12:33:30', '0', NULL, '2026-03-02 17:03:30', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('40', 'SUPER_ADMIN', '4', NULL, '97f2ed8a0fa55f7451a8b5087a9fcaef44c42a74b95b574c659b6cb54e158061', '2026-03-09 12:36:14', '0', NULL, '2026-03-02 17:06:14', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('41', 'SUPER_ADMIN', '4', NULL, 'b74e5ecc3fd0601d1849748b0c5247ed541f596ad374590be3f2c21178e2b96a', '2026-03-09 12:41:23', '0', NULL, '2026-03-02 17:11:23', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('42', 'SUPER_ADMIN', '4', NULL, '810ff9c918b9a3cad6710796a621d1bda30edfddba967a80160b26e952abeef0', '2026-03-09 12:42:29', '0', NULL, '2026-03-02 17:12:29', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('43', 'SUPER_ADMIN', '4', NULL, '0c38564a73d6f683040ebe9b4e6e019d8de5a5f6d5c88414eb1d8974ee0f5ae9', '2026-03-09 12:43:48', '0', NULL, '2026-03-02 17:13:48', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('44', 'ADMIN', '12', '1', 'b9ed83553976904f9f002c3b7940806041c6309d3690c338a31d180a28c65d90', '2026-03-09 12:50:28', '0', NULL, '2026-03-02 17:20:28', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('45', 'ADMIN', '12', '1', 'a2a395938d27a951afd19ee6a3cdf49c24973252c54f289414451a2a252c69d1', '2026-03-09 12:50:46', '0', NULL, '2026-03-02 17:20:46', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('46', 'ADMIN', '12', '1', '71bb28c953bd50a75543a23d72bf17101634526f8ac506806c38e95a50270a90', '2026-03-09 19:50:02', '0', NULL, '2026-03-03 00:20:02', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('47', 'ADMIN', '12', '1', '00eec49155e37f37965543c22e38eb1e0ea103c19d0b7065c03677306c25bd8d', '2026-03-09 19:53:01', '1', NULL, '2026-03-03 00:23:01', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('48', 'ADMIN', '12', '1', 'fa7a4bc33c1e1f40afdc91406cfd87cabd87a3de19a382767b6a5435930fcd7b', '2026-03-10 09:54:01', '0', NULL, '2026-03-03 14:24:01', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('49', 'ADMIN', '12', '1', 'b357fcaa06f53abe6618fce386779b7d240bb9b99d14fb379b53beccec511ed2', '2026-03-10 10:29:43', '0', NULL, '2026-03-03 14:59:43', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('50', 'ADMIN', '12', '1', 'c32182451d28b1f422bf0897e10fbdff4db29005dfcd5fa14cdc29ee544cd756', '2026-03-10 10:54:42', '0', NULL, '2026-03-03 15:24:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('51', 'ADMIN', '12', '1', 'aec09362af9b851ceb1ee5b157431808b1e3a5651d1c4d7430b2e4d835b23499', '2026-03-10 13:02:34', '0', NULL, '2026-03-03 17:32:34', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('52', 'SUPER_ADMIN', '3', NULL, 'e536a4b3186b46e265a4135429fdca8438be9fd10c0d44740a3e6d20a2e6632a', '2026-03-12 11:10:37', '0', NULL, '2026-03-05 15:40:37', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('53', 'STAFF', '18', '1', '1821a90037a8e8a369f812a8ee93c772df37a452e00569ccd2eec1d978a20197', '2026-03-12 19:23:23', '1', NULL, '2026-03-05 23:53:23', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('54', 'ADMIN', '12', '1', 'e597bd3d7b2abb48fd1918d328faa60437ef1b2a95d84326aa342d7ca71abc06', '2026-03-12 19:28:07', '0', NULL, '2026-03-05 23:58:07', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('55', 'ADMIN', '1', '1', 'aeefe56ef3ccb43def1f8b1be6d6aa8edb3f0e20c82c13b654827e04776c94d9', '2026-03-12 19:35:51', '0', NULL, '2026-03-06 00:05:51', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('56', 'ADMIN', '12', '1', 'a87e2a79f106a0f4c9e7482cc86064255b217efbfc6021c2d39993928de6435f', '2026-03-12 19:35:51', '0', NULL, '2026-03-06 00:05:51', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('57', 'SUPER_ADMIN', '4', NULL, 'ba503acb50707f5d5cda5fccf5fc2eb14be1bce4f798caf5bc2c1fb10b1bd048', '2026-03-14 02:51:19', '0', NULL, '2026-03-07 07:21:19', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('58', 'SUPER_ADMIN', '4', NULL, 'd8b685f5f72160fc00b5e0cdfed766bb0d96924ba3294b5bb42633538c7292b2', '2026-03-14 02:53:01', '1', NULL, '2026-03-07 07:23:01', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('59', 'SUPER_ADMIN', '4', NULL, '8c1ceff0b86ea9858b7ceae513a00225e0bbdf02446b7435e6d34834a19662dc', '2026-03-14 03:00:58', '1', NULL, '2026-03-07 07:30:58', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('60', 'SUPER_ADMIN', '4', NULL, 'b37b32fac616e4369df725c8d95ad5cf08a5c12be04ddd0f04f44d80e1407321', '2026-03-14 03:02:31', '1', NULL, '2026-03-07 07:32:31', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('61', 'SUPER_ADMIN', '4', NULL, '613174c90201ef020eb5751d23a3c1c6c0249a64bd89189104360d2d0c22ff21', '2026-03-14 03:05:42', '1', NULL, '2026-03-07 07:35:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('62', 'SUPER_ADMIN', '4', NULL, '794b34b350f26dd52116f81e44163d135366d760d63380f2d3e9c41ddb9331d9', '2026-03-14 03:06:05', '0', NULL, '2026-03-07 07:36:05', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('63', 'SUPER_ADMIN', '4', NULL, '29aa2d1d7c3f46984189fdb45ebc20ef40c687cbe9cabfa03125f7fac5ce6986', '2026-03-14 06:19:55', '0', NULL, '2026-03-07 10:49:55', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('64', 'SUPER_ADMIN', '4', NULL, '7df7a453632ed97033fd324658bb74eeee1313ea6caa914fb7539d64c3c4b5e5', '2026-03-14 06:34:15', '0', NULL, '2026-03-07 11:04:15', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('65', 'SUPER_ADMIN', '4', NULL, '04894a913d945ae1be73974e7f7d8da8d8f6ce0f5209e911fed85b442695fb58', '2026-03-14 06:36:38', '0', NULL, '2026-03-07 11:06:38', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('66', 'SUPER_ADMIN', '4', NULL, '7325872c660883954ebdbc6bfca291487c75480bc005f4753cf904f0a078fd6a', '2026-03-14 06:36:49', '0', NULL, '2026-03-07 11:06:49', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('67', 'SUPER_ADMIN', '4', NULL, '6b49a89b3d50bfe25a9d55271d7389071e5b5987e3e2ad0cf0916ffca6af8e51', '2026-03-14 06:37:54', '0', NULL, '2026-03-07 11:07:54', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('68', 'ADMIN', '1', '1', '85307d2b40b2d0b4aba45b807bb25bcb98716d46314017bf99a16f5097a62a11', '2026-03-14 06:37:55', '0', NULL, '2026-03-07 11:07:55', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('69', 'CUSTOMER', '1', '1', '9a9ef22950516a8f16e60bbb24a4478da243286097c33425831f9da6f38f7b7e', '2026-03-14 06:37:55', '0', NULL, '2026-03-07 11:07:55', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('70', 'ADMIN', '1', '1', 'de44426677814f7ab0616efc50e76384a247c211813e2bc7751465b73dbe14b7', '2026-03-14 06:38:48', '0', NULL, '2026-03-07 11:08:48', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('71', 'SUPER_ADMIN', '4', NULL, '8029436780653803ac78357f53ae62d91caccf40396ff7bd5a77f4dc77d79b8d', '2026-03-14 06:39:28', '0', NULL, '2026-03-07 11:09:28', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('72', 'ADMIN', '1', '1', '42305c0093051dbd48e7eca3aae4e3658763cc757bcbab97be334a41bcaffcc9', '2026-03-14 06:39:28', '0', NULL, '2026-03-07 11:09:28', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('73', 'CUSTOMER', '1', '1', '9d2ba40f7fc6f37edafc6194dc353e200a055849936ef3d56cbf32238431b05c', '2026-03-14 06:39:29', '0', NULL, '2026-03-07 11:09:29', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('74', 'SUPER_ADMIN', '4', NULL, 'e1ff42cae24613af0c97bb2d4299a2ef5e3ccb7f574f9af7a0a2c1b9800e8190', '2026-03-14 06:43:52', '0', NULL, '2026-03-07 11:13:52', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('75', 'ADMIN', '1', '1', '1a11b4f250faa6e28a18a62c315275402142e76d2d19e2c0f8b6bde3ddd6b137', '2026-03-14 06:43:52', '0', NULL, '2026-03-07 11:13:52', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('76', 'CUSTOMER', '1', '1', 'ae9f741315c2c51cb4ffd9f0759108e7a73eacea821319bd6ebb59d5e4fafcf7', '2026-03-14 06:43:53', '0', NULL, '2026-03-07 11:13:53', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('77', 'SUPER_ADMIN', '4', NULL, '70c6dfd73dc42774b82663d267774e1b58df6a7dfa67868ce0488e781ee63159', '2026-03-14 06:44:30', '0', NULL, '2026-03-07 11:14:30', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('78', 'SUPER_ADMIN', '4', NULL, '249bde421b9c14f7c65a7900525fd076b05e4b008a36e924fb6aeb0ede3892ab', '2026-03-14 06:45:42', '0', NULL, '2026-03-07 11:15:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('79', 'SUPER_ADMIN', '4', NULL, '14d51bf4a8e5ce7d8fc63e903380ae4f1159d8c58ee8c5ee24b625d9ad3b5dc7', '2026-03-14 06:46:12', '0', NULL, '2026-03-07 11:16:12', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('80', 'SUPER_ADMIN', '4', NULL, 'f1fc3745a834df52d6c8a0c8ff043b49e71ed3d86285824ed6f0387cb508d175', '2026-03-14 06:46:30', '0', NULL, '2026-03-07 11:16:30', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('81', 'SUPER_ADMIN', '4', NULL, 'c2e9c1072070cdc7cadb2cdafb6c6296cbc954f2c42bf605e9e25c7c5e9b6681', '2026-03-14 09:32:54', '0', NULL, '2026-03-07 14:02:54', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('82', 'SUPER_ADMIN', '4', NULL, '0cc141a17b81ddcd66ac03fa76957102fff895d9b60b4bd972ccfb71546df24b', '2026-03-14 10:58:55', '1', NULL, '2026-03-07 15:28:55', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('83', 'STAFF', '18', '1', 'c552a656addad68392c8e6e716fd313f9cc8c6cc072174b9ef4676b4cb964ae6', '2026-03-14 19:26:47', '0', NULL, '2026-03-07 23:56:47', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('84', 'ADMIN', '12', '1', '7696ae9c3d388eaee86b5e198ac8c17fa0df624261c4ff5ec2da10714f3ee899', '2026-03-14 19:56:32', '0', NULL, '2026-03-08 00:26:32', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('85', 'ADMIN', '12', '1', '868d9d500a09bb77bf6ffcffc528e1c404f42d8d749b1c70f521c398fd74cf91', '2026-03-15 04:01:34', '0', NULL, '2026-03-08 08:31:34', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('86', 'STAFF', '18', '1', '6f45e2d6858aa36b151e023b34dd4e4bf7b357a75eb22a04da760afc0db4443b', '2026-03-15 04:05:04', '0', NULL, '2026-03-08 08:35:04', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('87', 'ADMIN', '12', '1', '3e672145d63e21b68602388b872e7775ee4e15cfd7572f66470e3740a106aac2', '2026-03-15 04:10:59', '0', NULL, '2026-03-08 08:40:59', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('88', 'SUPER_ADMIN', '4', NULL, 'bc88e156db6e9ecd6d39f0a31dcf2e28aad963a406c02daab76edf836c83680c', '2026-03-15 05:14:15', '0', NULL, '2026-03-08 09:44:15', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('89', 'ADMIN', '12', '1', '38c2b95da290175ff753a3d3622cec58b0e9089979d7df9847ca6a535859a1d5', '2026-03-15 05:15:50', '0', NULL, '2026-03-08 09:45:50', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('90', 'SUPER_ADMIN', '4', NULL, '8e014ec4337ca65a4f4e2b4d4430044e02512eddff95d837658284152c1a40e8', '2026-03-15 05:19:36', '0', NULL, '2026-03-08 09:49:36', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('91', 'SUPER_ADMIN', '4', NULL, 'e27b91828ba2a2263edd8b6b63d46d5278896ba0fdc6f84cc276ddcd39223e78', '2026-03-15 05:21:36', '0', NULL, '2026-03-08 09:51:36', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('92', 'ADMIN', '28', '13', 'ba1abe13b57c043c3a8d613c692a2720569b54ba91961fe999708f5c73206176', '2026-03-15 05:22:20', '0', NULL, '2026-03-08 09:52:20', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('93', 'ADMIN', '12', '1', '4adb586b40a8a3eebc8a85d9d5eaee6da7a9cd1e748f44739b0a013e3c4b8191', '2026-03-15 05:34:47', '0', NULL, '2026-03-08 10:04:47', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('94', 'ADMIN', '12', '1', '884b3d978621b3b24a325f052cffbdde949b7905438ac827d362cb535bc80ec6', '2026-03-15 05:51:01', '0', NULL, '2026-03-08 10:21:01', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('95', 'ADMIN', '12', '1', 'b84ebca8ea4320122f2f52e6c0490b0cd889dc4f724fb09f15e6636287ec8116', '2026-03-15 06:21:27', '0', NULL, '2026-03-08 10:51:27', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('96', 'ADMIN', '12', '1', 'e505fcc85b0a1d5fb4e57dd448cbc4be7d5c0d7e0db4cc8477e4bd07c5f275bd', '2026-03-15 06:22:08', '1', NULL, '2026-03-08 10:52:08', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('97', 'STAFF', '18', '1', '7009e654e576d57f571399049c34e8db3e2a77e2b58b8b1e185abc85b780f630', '2026-03-15 06:59:08', '1', NULL, '2026-03-08 11:29:08', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('98', 'SUPER_ADMIN', '4', NULL, '57c2c3b5831ce9b77c74247abb8aaf190b840280d5a1609761e6818ca22314b4', '2026-03-15 07:05:42', '0', NULL, '2026-03-08 11:35:42', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('99', 'ADMIN', '30', '13', '7343c0f411c233a814380e74c249e73828721dacb0aa58118d14b02e20d4ba5b', '2026-03-15 07:09:45', '0', NULL, '2026-03-08 11:39:45', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('100', 'SUPER_ADMIN', '4', NULL, 'f46a0f1af28aed6a54682729e2429d790b59b1b214db5c7967e73ba14e274f6c', '2026-03-15 07:10:35', '0', NULL, '2026-03-08 11:40:35', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('101', 'ADMIN', '12', '1', 'b8b7ba94fe74a801710c0bd2da2faac2e3e7df13447dfb67dd436e2dcd4ede00', '2026-03-17 02:13:38', '0', NULL, '2026-03-10 06:43:38', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('102', 'STAFF', '18', '1', '7ad8f60d5cfef15f9c7384a8ca569b8f62d98a4a6a5bd3537f21a0f56b30c461', '2026-03-18 05:45:39', '1', NULL, '2026-03-11 10:15:39', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('103', 'ADMIN', '12', '1', '75172d0e4c8564b1fa67e427bcf4fa4cf8b396d6606fb657ac6b46a50a7339dd', '2026-03-18 05:48:22', '0', NULL, '2026-03-11 10:18:22', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('104', 'STAFF', '18', '1', '133909212d8ac9a6ea092ca882414599f32b52b513cb31fb741ee3792bb7684b', '2026-03-18 06:07:23', '0', NULL, '2026-03-11 10:37:23', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('105', 'ADMIN', '12', '1', '2311844d6ddf9011079b670b06c2a366019a740d74734a262222bb87d4afd494', '2026-03-18 11:37:12', '0', NULL, '2026-03-11 16:07:12', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('106', 'STAFF', '18', '1', '9dad56f75fe62e32c91e1cd940555fee01bb0bd814fad39c07e73dfd1e49e896', '2026-03-19 02:19:18', '0', NULL, '2026-03-12 06:49:18', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('107', 'ADMIN', '12', '1', 'f0757cfca452f1ce79c9e6ad927252f89ce1914c525034f35d93c15b3b9ab9fe', '2026-03-19 04:32:57', '0', NULL, '2026-03-12 09:02:57', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('108', 'STAFF', '18', '1', '6c79b38e125b7422ea96cf4920100f54731d2ac6ef45d9b7a5ae10e432bb130f', '2026-03-19 04:47:08', '0', NULL, '2026-03-12 09:17:08', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('109', 'SUPER_ADMIN', '4', NULL, '92192523b50351e320e0ee97d9646f12acb88b111e028c643749dd9e9be3105a', '2026-03-19 05:12:16', '0', NULL, '2026-03-12 09:42:16', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('110', 'SUPER_ADMIN', '4', NULL, '0cfcfc10b5f85c427a5396d03760980cc5594fb7e8ea097f5970b0f2bf8517f6', '2026-03-19 05:13:51', '0', NULL, '2026-03-12 09:43:51', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('111', 'SUPER_ADMIN', '4', NULL, '4f28610e5aa1b3c952c0d312d4193c83d9b3ef31813910d2ecea7abd7474e89b', '2026-03-19 10:32:49', '0', NULL, '2026-03-12 15:02:49', NULL);
INSERT INTO `refresh_tokens` (`token_id`, `user_type`, `user_id`, `salon_id`, `token_hash`, `expires_at`, `is_revoked`, `replaced_by`, `created_at`, `last_used_at`) VALUES ('112', 'SUPER_ADMIN', '4', NULL, '1cab645e326a99d4366c07cf748332491dbdc307be83f9e77167bcfb294e32d7', '2026-03-19 10:36:32', '0', NULL, '2026-03-12 15:06:32', NULL);

-- Total INSERT statements: 112
```

---

## Table: `salon_subscriptions`

### Structure

```sql
CREATE TABLE `salon_subscriptions` (
  `subscription_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`subscription_id`),
  KEY `salon_id` (`salon_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `salon_subscriptions_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  CONSTRAINT `salon_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 2

### Data (SQL INSERT Statements)

```sql
INSERT INTO `salon_subscriptions` (`subscription_id`, `salon_id`, `plan_id`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES ('21', '13', '1', '2024-01-01', '2024-12-31', 'ACTIVE', '2026-03-12 15:12:04', '2026-03-12 15:12:04');
INSERT INTO `salon_subscriptions` (`subscription_id`, `salon_id`, `plan_id`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES ('22', '1', '3', '2026-01-13', '2027-01-13', 'ACTIVE', '2026-03-13 14:58:27', '2026-03-13 14:58:27');

-- Total INSERT statements: 2
```

---

## Table: `salons`

### Structure

```sql
CREATE TABLE `salons` (
  `salon_id` int NOT NULL AUTO_INCREMENT,
  `salon_name` varchar(100) NOT NULL,
  `salon_ownername` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `gst_num` varchar(15) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `country` varchar(50) DEFAULT 'India',
  `salon_logo` varchar(255) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`salon_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 11

### Data (SQL INSERT Statements)

```sql
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('1', 'Elite Beauty Salon', 'Rajesh Kumar', 'elite@example.com', '9876543220', 'GSTIN123456789', '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '/logos/elite.png', '1', '2026-02-12 16:42:10', '2026-03-07 07:39:51');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('2', 'Style Zone', 'Priya Sharma', 'stylezone@example.com', '9876543221', 'GSTIN987654321', '456 Park Avenue', 'Delhi', 'Delhi', 'India', '/logos/stylezone.png', '1', '2026-02-12 16:42:10', '2026-03-07 07:41:05');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('3', 'Glamour Lounge', 'Vikram Singh', 'glamour@example.com', '9876543222', 'GSTIN456789123', '789 Mall Road', 'Bangalore', 'Karnataka', 'India', '/logos/glamour.png', '1', '2026-02-12 16:42:10', '2026-02-12 16:42:10');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('4', 'Test Salon', 'Test Owner', 'test@salon.com', '9876543210', NULL, 'Test Address', 'Bangalore', 'Karnataka', 'India', NULL, '0', '2026-02-25 14:12:02', '2026-03-02 14:52:06');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('6', 'hk Salon', 'John Smith', 'contact@luxurysalon.com', '9876000000', '29ABCDE1234F1Z5', '124 Main Street', 'Bangalore', 'Karnataka', 'India', 'uploads/salons/logo.jpg', '1', '2026-02-25 17:09:58', '2026-03-07 15:39:13');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('8', 'Updated Test Salon 1772862373', 'Test Owner', 'test1772862373@test.com', '9987673212', NULL, 'Test Address', 'Test City', 'Test State', 'India', NULL, '0', '2026-03-07 11:16:13', '2026-03-07 11:16:13');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('9', 'Updated Test Salon 1772862391', 'Test Owner', 'test1772862391@test.com', '9222641200', NULL, 'Test Address', 'Test City', 'Test State', 'India', NULL, '0', '2026-03-07 11:16:31', '2026-03-07 11:16:31');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('10', 'Debug Test Salon', 'Test Owner', 'debug1772872318@test.com', '9923951470', NULL, 'Test Address', 'Test City', 'Test State', 'India', NULL, '1', '2026-03-07 14:01:58', '2026-03-07 14:01:58');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('11', 'Test Salon 1772872375', 'Test Owner', 'test1772872375@test.com', '9135515676', '', 'Test Address', 'Test City', 'Test State', 'India', NULL, '1', '2026-03-07 14:02:55', '2026-03-07 15:38:48');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('12', 'Test Salon 2 1772872375', 'Test Owner 2', 'test21772872375@test.com', '9716890851', NULL, 'Test Address 2', 'Test City 2', 'Test State 2', 'India', NULL, '1', '2026-03-07 14:02:55', '2026-03-07 14:02:55');
INSERT INTO `salons` (`salon_id`, `salon_name`, `salon_ownername`, `email`, `phone`, `gst_num`, `address`, `city`, `state`, `country`, `salon_logo`, `status`, `created_at`, `updated_at`) VALUES ('13', 'sammy salon', 'sammual', 'samu@gmail.com', '8433557913', '06ABCDE1234F1Z9', 'near home etc etc', 'kalwa', 'manarashtra', 'India', NULL, '1', '2026-03-08 09:50:06', '2026-03-08 09:50:06');

-- Total INSERT statements: 11
```

---

## Table: `services`

### Structure

```sql
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL COMMENT 'Duration in minutes',
  `image_url` text,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `idx_services_salon` (`salon_id`,`status`),
  KEY `fk_services_staff` (`staff_id`),
  CONSTRAINT `fk_services_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`) ON DELETE SET NULL,
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 213

### Data (SQL INSERT Statements)

```sql
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'Haircut', 'Professional haircut for men and women', '300.00', '30', NULL, 'ACTIVE', '2026-02-12 16:42:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', '1', 'Hair Color', 'Full hair coloring service', '1500.00', '120', NULL, 'ACTIVE', '2026-02-12 16:42:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('3', '1', '1', 'Manicure', 'Basic nail care and polishing', '400.00', '45', NULL, 'ACTIVE', '2026-02-12 16:42:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('4', '1', '1', 'Facial creaming', 'Basic facial creaming', '300.00', '10', '', 'INACTIVE', '2026-02-12 16:42:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('5', '2', '4', 'Hair Spa', 'Complete hair treatment', '1200.00', '90', NULL, 'ACTIVE', '2026-02-12 16:42:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('6', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:12:06', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('7', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:14:41', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('8', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:15:28', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('9', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:16:13', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('10', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:21:38', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('11', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:25:58', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('12', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'ACTIVE', '2026-02-24 18:28:35', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('13', '1', '1', 'Updated Haircut', 'Test service description', '600.00', '30', 'uploads/services/test.jpg', 'INACTIVE', '2026-02-24 18:29:53', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('14', '1', '1', 'Haircut', 'Professional haircut service', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-24 23:34:09', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('15', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('16', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('17', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('18', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('19', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('20', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('21', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('22', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('23', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('24', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:21:03', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('25', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('26', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('27', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('28', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('29', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('30', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('31', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('32', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('33', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('34', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:24:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('35', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('36', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('37', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('38', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('39', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('40', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('41', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('42', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('43', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('44', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('45', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('46', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('47', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('48', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('49', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 18:27:34', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('50', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('51', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('52', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('53', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('54', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('55', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('56', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('57', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('58', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('59', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:28:46', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('60', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('61', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('62', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('63', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('64', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'INACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('65', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('66', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('67', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('68', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('69', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:30:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('70', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('71', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('72', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('73', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('74', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('75', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('76', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('77', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('78', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('79', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:31:49', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('80', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('81', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('82', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('83', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('84', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('85', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('86', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('87', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('88', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('89', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 18:32:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('90', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('91', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('92', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('93', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('94', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('95', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('96', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('97', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('98', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('99', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:16:00', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('100', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('101', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('102', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('103', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('104', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('105', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('106', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('107', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('108', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('109', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('110', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('111', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('112', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('113', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('114', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 22:17:32', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('115', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('116', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('117', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('118', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('119', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('120', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('121', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('122', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('123', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('124', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('125', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('126', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('127', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('128', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('129', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('130', '3', '6', 'Deluxe Haircut', 'Premium haircut with wash', '700.00', '40', 'uploads/services/deluxe-cut.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('131', '3', '6', 'Keratin Treatment', 'Hair smoothing treatment', '4000.00', '180', 'uploads/services/keratin.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('132', '3', '6', 'Gold Facial', 'Luxury gold facial', '2500.00', '60', 'uploads/services/gold-facial.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('133', '3', '6', 'Thai Massage', 'Full body Thai massage', '3000.00', '90', 'uploads/services/thai-massage.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('134', '3', '6', 'Nail Art', 'Designer nail art', '800.00', '45', 'uploads/services/nailart.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('135', '3', '6', 'Eyebrow Threading', 'Professional threading', '150.00', '15', 'uploads/services/threading.jpg', 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('136', '4', '1', 'Basic Haircut', 'Simple haircut', '200.00', '20', NULL, 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('137', '4', '1', 'Quick Facial', 'Express facial', '400.00', '30', NULL, 'ACTIVE', '2026-02-25 22:19:25', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('138', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('139', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('140', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('141', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('142', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('143', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('144', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('145', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('146', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('147', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:20:23', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('148', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('149', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('150', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('151', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('152', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('153', '3', '6', 'Deluxe Haircut', 'Premium haircut with wash', '700.00', '40', 'uploads/services/deluxe-cut.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('154', '3', '6', 'Keratin Treatment', 'Hair smoothing treatment', '4000.00', '180', 'uploads/services/keratin.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('155', '3', '6', 'Gold Facial', 'Luxury gold facial', '2500.00', '60', 'uploads/services/gold-facial.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('156', '3', '6', 'Thai Massage', 'Full body Thai massage', '3000.00', '90', 'uploads/services/thai-massage.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('157', '3', '6', 'Nail Art', 'Designer nail art', '800.00', '45', 'uploads/services/nailart.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('158', '3', '6', 'Eyebrow Threading', 'Professional threading', '150.00', '15', 'uploads/services/threading.jpg', 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('159', '4', '1', 'Basic Haircut', 'Simple haircut', '200.00', '20', NULL, 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('160', '4', '1', 'Quick Facial', 'Express facial', '400.00', '30', NULL, 'ACTIVE', '2026-02-25 22:20:24', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('161', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('162', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('163', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('164', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('165', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('166', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('167', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('168', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('169', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('170', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('171', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('172', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('173', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('174', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('175', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('176', '3', '6', 'Deluxe Haircut', 'Premium haircut with wash', '700.00', '40', 'uploads/services/deluxe-cut.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('177', '3', '6', 'Keratin Treatment', 'Hair smoothing treatment', '4000.00', '180', 'uploads/services/keratin.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('178', '3', '6', 'Gold Facial', 'Luxury gold facial', '2500.00', '60', 'uploads/services/gold-facial.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('179', '3', '6', 'Thai Massage', 'Full body Thai massage', '3000.00', '90', 'uploads/services/thai-massage.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('180', '3', '6', 'Nail Art', 'Designer nail art', '800.00', '45', 'uploads/services/nailart.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('181', '3', '6', 'Eyebrow Threading', 'Professional threading', '150.00', '15', 'uploads/services/threading.jpg', 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('182', '4', '1', 'Basic Haircut', 'Simple haircut', '200.00', '20', NULL, 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('183', '4', '1', 'Quick Facial', 'Express facial', '400.00', '30', NULL, 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('184', '6', '1', 'Standard Cut', 'Professional haircut', '350.00', '30', NULL, 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('185', '6', '1', 'Color Service', 'Hair coloring', '1000.00', '60', NULL, 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('186', '6', '1', 'Basic Facial', 'Cleansing facial', '600.00', '40', NULL, 'ACTIVE', '2026-02-25 22:20:48', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('187', '1', '1', 'Haircut', 'Professional haircut and styling', '500.00', '30', 'uploads/services/haircut.jpg', 'INACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('188', '1', '1', 'Hair Coloring', 'Full hair coloring service', '1500.00', '90', 'uploads/services/coloring.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('189', '1', '1', 'Hair Spa', 'Deep conditioning hair treatment', '1200.00', '60', 'uploads/services/hairspa.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('190', '1', '1', 'Facial', 'Premium facial treatment', '800.00', '45', 'uploads/services/facial.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('191', '1', '1', 'Manicure', 'Complete hand care', '400.00', '30', 'uploads/services/manicure.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('192', '1', '1', 'Pedicure', 'Complete foot care', '500.00', '40', 'uploads/services/pedicure.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('193', '1', '1', 'Bridal Makeup', 'Complete bridal makeup', '5000.00', '120', 'uploads/services/bridal.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('194', '1', '1', 'Party Makeup', 'Party and event makeup', '2000.00', '60', 'uploads/services/party.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('195', '1', '1', 'Hair Straightening', 'Professional hair straightening', '2500.00', '90', 'uploads/services/straightening.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('196', '1', '1', 'Hair Rebonding', 'Permanent hair rebonding', '3500.00', '150', 'uploads/services/rebonding.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('197', '2', '4', 'Men\'s Haircut', 'Classic men\'s haircut', '300.00', '25', 'uploads/services/mens-cut.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('198', '2', '4', 'Women\'s Haircut', 'Stylish women\'s haircut', '450.00', '35', 'uploads/services/womens-cut.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('199', '2', '4', 'Beard Trim', 'Professional beard grooming', '200.00', '15', 'uploads/services/beard.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('200', '2', '4', 'Hair Styling', 'Special occasion styling', '600.00', '45', 'uploads/services/styling.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('201', '2', '4', 'Head Massage', 'Relaxing head massage', '350.00', '30', 'uploads/services/massage.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('202', '3', '6', 'Deluxe Haircut', 'Premium haircut with wash', '700.00', '40', 'uploads/services/deluxe-cut.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('203', '3', '6', 'Keratin Treatment', 'Hair smoothing treatment', '4000.00', '180', 'uploads/services/keratin.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('204', '3', '6', 'Gold Facial', 'Luxury gold facial', '2500.00', '60', 'uploads/services/gold-facial.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('205', '3', '6', 'Thai Massage', 'Full body Thai massage', '3000.00', '90', 'uploads/services/thai-massage.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('206', '3', '6', 'Nail Art', 'Designer nail art', '800.00', '45', 'uploads/services/nailart.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('207', '3', '6', 'Eyebrow Threading', 'Professional threading', '150.00', '15', 'uploads/services/threading.jpg', 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 18:41:11');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('208', '4', '1', 'Basic Haircut', 'Simple haircut', '200.00', '20', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('209', '4', '1', 'Quick Facial', 'Express facial', '400.00', '30', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('210', '6', '1', 'Standard Cut', 'Professional haircut', '350.00', '30', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('211', '6', '1', 'Color Service', 'Hair coloring', '1000.00', '60', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('212', '6', '1', 'Basic Facial', 'Cleansing facial', '600.00', '40', NULL, 'ACTIVE', '2026-02-25 22:21:36', '2026-03-18 22:28:35');
INSERT INTO `services` (`service_id`, `salon_id`, `staff_id`, `service_name`, `description`, `price`, `duration`, `image_url`, `status`, `created_at`, `updated_at`) VALUES ('213', '13', '1', 'Facial creaming', 'facial creaming the face on face', '1000.00', '30', NULL, 'INACTIVE', '2026-03-08 09:53:31', '2026-03-18 22:28:35');

-- Total INSERT statements: 213
```

---

## Table: `staff_documents`

### Structure

```sql
CREATE TABLE `staff_documents` (
  `doc_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `doc_type` enum('CERTIFICATION','ID_PROOF','CONTRACT','RESUME','OTHER') NOT NULL,
  `document_name` varchar(100) NOT NULL,
  `file_path` text NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expiry_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`doc_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `staff_documents_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 1

### Data (SQL INSERT Statements)

```sql
INSERT INTO `staff_documents` (`doc_id`, `staff_id`, `doc_type`, `document_name`, `file_path`, `file_size`, `uploaded_at`, `expiry_date`, `created_at`, `updated_at`) VALUES ('1', '10', 'CERTIFICATION', 'Hair Styling Certificate', 'uploads/staff/docs/cert_001.pdf', '102400', '2026-02-26 13:56:15', '2027-12-31', '2026-02-26 13:56:15', '2026-02-26 13:56:15');

-- Total INSERT statements: 1
```

---

## Table: `staff_info`

### Structure

```sql
CREATE TABLE `staff_info` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `salary` decimal(10,2) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','ON_LEAVE','TERMINATED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `uk_salon_phone` (`salon_id`,`phone`),
  UNIQUE KEY `uk_salon_email` (`salon_id`,`email`),
  KEY `idx_staff_salon` (`salon_id`,`status`),
  CONSTRAINT `staff_info_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  CONSTRAINT `staff_info_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 12

### Data (SQL INSERT Statements)

```sql
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'Priya Sharma', '9876543210', 'priya@elite.com', '1995-03-15', '2023-01-10', 'Hair Stylist', '5', '25000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', '2', 'Rahul Kumar', '9876543211', 'rahul@elite.com', '1993-07-20', '2022-06-15', 'Makeup Artist', '7', '30000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('3', '1', '3', 'Sneha Patel', '9876543212', 'sneha@elite.com', '1997-11-05', '2023-08-01', 'Skin Specialist', '3', '22000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('4', '2', '4', 'Arjun Reddy', '9876540001', 'arjun@stylezone.com', '1994-06-10', '2023-03-01', 'Hair Stylist', '4', '23000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('5', '2', '5', 'Divya Rao', '9876540002', 'divya@stylezone.com', '1996-09-25', '2023-05-15', 'Makeup Artist', '3', '21000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('6', '3', '6', 'Kavya Nambiar', '9876550001', 'kavya@glamourlounge.com', '1992-05-20', '2022-08-10', 'Senior Stylist', '8', '35000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('7', '3', '7', 'Rohan Kapoor', '9876550002', 'rohan@glamourlounge.com', '1990-12-15', '2021-11-01', 'Spa Therapist', '10', '32000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('8', '3', '8', 'Ananya Menon', '9876550003', 'ananya@glamourlounge.com', '1995-08-08', '2023-02-20', 'Nail Artist', '4', '24000.00', 'ACTIVE', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('10', '1', '15', 'kurma woman lol Updated', '9999922222', 'kurlaman@salon.com', '1995-03-10', '2026-02-15', 'Hair Stylist', '5', '30000.00', 'INACTIVE', '2026-02-26 13:51:30', '2026-02-27 05:03:52');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('11', '1', '18', 'sam steff', '1222111122', 'sammy@gmail.com', '2003-03-24', '2026-03-03', 'hair cutter', '40', '10000.00', 'ACTIVE', '2026-03-03 15:38:46', '2026-03-03 15:38:46');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('12', '1', '26', 'athar', '8433557913', 'atharkhan5535@gmail.com', '2004-03-24', '2026-03-08', 'hair stylist', '5', '10000.00', 'ACTIVE', '2026-03-08 08:16:17', '2026-03-08 08:20:01');
INSERT INTO `staff_info` (`staff_id`, `salon_id`, `user_id`, `name`, `phone`, `email`, `date_of_birth`, `date_of_joining`, `specialization`, `experience_years`, `salary`, `status`, `created_at`, `updated_at`) VALUES ('13', '1', '29', 'asad c', '8433557777', 'asad@gmail.com', '2009-09-23', '2026-03-08', 'hair stylist', '12', '20000.00', 'ACTIVE', '2026-03-08 11:16:51', '2026-03-08 11:17:12');

-- Total INSERT statements: 12
```

---

## Table: `stock`

### Structure

```sql
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `current_quantity` int DEFAULT '0',
  `minimum_quantity` int DEFAULT '5',
  `maximum_quantity` int DEFAULT '100',
  `last_restocked` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `uk_product_salon` (`product_id`,`salon_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `stock_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 20

### Data (SQL INSERT Statements)

```sql
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '65', '10', '50', '2026-03-08 00:25:23', '2026-02-25 22:21:36', '2026-03-08 00:25:23');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('2', '2', '1', '18', '10', '40', '2025-02-15 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('3', '3', '1', '12', '5', '30', '2025-02-10 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('4', '4', '1', '30', '15', '60', '2025-02-18 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('5', '5', '1', '5', '3', '10', '2025-01-20 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('6', '6', '1', '20', '10', '40', '2025-02-12 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('7', '7', '1', '40', '20', '80', '2025-02-01 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('8', '8', '1', '4', '3', '8', '2025-01-25 00:00:00', '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('9', '9', '2', '20', '10', '40', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('10', '10', '2', '15', '8', '30', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('11', '11', '2', '12', '5', '25', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('12', '12', '2', '25', '10', '50', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('13', '13', '3', '15', '8', '30', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('14', '14', '3', '20', '10', '40', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('15', '15', '3', '10', '5', '25', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('16', '16', '3', '30', '15', '50', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('17', '17', '3', '18', '10', '35', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('18', '18', '3', '25', '12', '45', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('19', '19', '1', '13', '10', '100', '2026-02-27 18:01:00', '2026-02-27 06:56:56', '2026-02-27 18:01:00');
INSERT INTO `stock` (`stock_id`, `product_id`, `salon_id`, `current_quantity`, `minimum_quantity`, `maximum_quantity`, `last_restocked`, `created_at`, `updated_at`) VALUES ('20', '20', '1', '10', '10', '100', '2026-03-08 11:28:03', '2026-03-08 11:25:40', '2026-03-08 11:28:03');

-- Total INSERT statements: 20
```

---

## Table: `stock_transactions`

### Structure

```sql
CREATE TABLE `stock_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int NOT NULL,
  `user_id` int NOT NULL,
  `transaction_type` enum('IN','OUT','ADJUSTMENT') NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `stock_id` (`stock_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`),
  CONSTRAINT `stock_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 14

### Data (SQL INSERT Statements)

```sql
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('1', '1', '1', 'IN', '30', '150.00', '4500.00', NULL, NULL, 'Initial stock', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('2', '1', '1', 'OUT', '5', '150.00', '750.00', NULL, NULL, 'Used for services', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('3', '2', '1', 'IN', '25', '180.00', '4500.00', NULL, NULL, 'Initial stock', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('4', '2', '1', 'OUT', '7', '180.00', '1260.00', NULL, NULL, 'Used for services', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('5', '3', '1', 'IN', '15', '350.00', '5250.00', NULL, NULL, 'Initial stock', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('6', '3', '1', 'OUT', '3', '350.00', '1050.00', NULL, NULL, 'Used for coloring', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('7', '4', '1', 'IN', '35', '120.00', '4200.00', NULL, NULL, 'Initial stock', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('8', '4', '1', 'OUT', '5', '120.00', '600.00', NULL, NULL, 'Used for facials', '2026-02-25 22:21:36');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('9', '19', '12', 'IN', '1', '10000.00', '10000.00', NULL, NULL, NULL, '2026-02-27 06:57:31');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('10', '19', '12', 'IN', '10', '5000.00', '50000.00', NULL, NULL, 'thats alot of hair driers', '2026-02-27 17:57:21');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('11', '19', '12', 'ADJUSTMENT', '13', '0.00', '0.00', NULL, NULL, 'just forgot a few', '2026-02-27 18:01:00');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('12', '1', '18', 'IN', '40', '1000.00', '40000.00', NULL, NULL, NULL, '2026-03-08 00:25:22');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('13', '20', '12', 'IN', '20', '20.00', '400.00', NULL, NULL, NULL, '2026-03-08 11:27:27');
INSERT INTO `stock_transactions` (`transaction_id`, `stock_id`, `user_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES ('14', '20', '12', 'OUT', '10', '20.00', '200.00', NULL, NULL, NULL, '2026-03-08 11:28:03');

-- Total INSERT statements: 14
```

---

## Table: `subscription_billing_cycles`

### Structure

```sql
CREATE TABLE `subscription_billing_cycles` (
  `cycle_id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `billing_month` varchar(7) NOT NULL,
  `cycle_start_date` date NOT NULL,
  `cycle_end_date` date NOT NULL,
  `status` enum('OPEN','CALCULATED','INVOICED','PAID','CLOSED') DEFAULT 'OPEN',
  `invoice_salon_id` bigint DEFAULT NULL,
  `calculation_log_id` bigint DEFAULT NULL,
  `total_appointments` int DEFAULT '0',
  `total_revenue` decimal(10,2) DEFAULT '0.00',
  `amount_due` decimal(10,2) DEFAULT '0.00',
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `amount_remaining` decimal(10,2) DEFAULT '0.00',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`cycle_id`),
  UNIQUE KEY `uk_subscription_cycle` (`subscription_id`,`billing_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `subscription_expiration_log`

### Structure

```sql
CREATE TABLE `subscription_expiration_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `expired_date` date NOT NULL,
  `subscriptions_expired` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_expired_date` (`expired_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `subscription_plans`

### Structure

```sql
CREATE TABLE `subscription_plans` (
  `plan_id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `duration_days` int NOT NULL,
  `status` tinyint DEFAULT '1',
  `plan_type` enum('flat','per-appointments','Percentage-per-appointments') NOT NULL,
  `flat_price` decimal(10,2) DEFAULT NULL,
  `rate_per_appointment` decimal(10,2) DEFAULT NULL,
  `percentage_rate` decimal(5,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 19

### Data (SQL INSERT Statements)

```sql
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('1', 'Basic Plan', '30', '1', 'flat', '1999.00', NULL, NULL, '2026-02-12 16:41:52', '2026-02-12 16:41:52');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('2', 'Premium Plan', '30', '1', 'per-appointments', NULL, '50.00', NULL, '2026-02-12 16:41:52', '2026-02-12 16:41:52');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('3', 'Enterprise Plan', '365', '1', 'Percentage-per-appointments', '0.00', '0.00', '10.00', '2026-02-12 16:41:52', '2026-03-13 14:57:01');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('4', 'Test', '30', '1', 'flat', '100.00', NULL, NULL, '2026-02-24 18:15:41', '2026-02-24 18:15:41');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('5', 'Updated Plan', '30', '0', 'flat', '6000.00', NULL, NULL, '2026-02-24 18:16:16', '2026-02-24 18:16:16');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('6', 'Updated Plan', '30', '0', 'flat', '6000.00', NULL, NULL, '2026-02-24 18:21:40', '2026-02-24 18:21:40');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('7', 'Active Plan 1771937500', '365', '1', 'flat', '1000.00', '0.00', NULL, '2026-02-24 18:21:40', '2026-03-13 14:40:31');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('8', 'Updated Plan', '30', '0', 'flat', '6000.00', NULL, NULL, '2026-02-24 18:26:02', '2026-02-24 18:26:03');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('9', 'Active Plan 1771937763', '365', '1', 'flat', '10000.00', NULL, NULL, '2026-02-24 18:26:03', '2026-02-24 18:26:03');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('10', 'Updated Plan', '30', '0', 'flat', '6000.00', NULL, NULL, '2026-02-24 18:28:38', '2026-02-24 18:28:38');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('11', 'Active Plan 1771937918', '365', '1', 'flat', '10000.00', NULL, NULL, '2026-02-24 18:28:38', '2026-02-24 18:28:38');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('12', 'Updated Plan', '30', '0', 'flat', '6000.00', NULL, NULL, '2026-02-24 18:29:56', '2026-02-24 18:29:56');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('13', 'Active Plan 1771937996', '365', '1', 'flat', '10000.00', NULL, NULL, '2026-02-24 18:29:56', '2026-02-24 18:29:56');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('14', 'premium plan', '20', '1', 'flat', '20.00', NULL, NULL, '2026-03-07 07:21:57', '2026-03-07 07:21:57');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('15', 'premium plan', '20', '1', 'flat', '20.00', NULL, NULL, '2026-03-07 07:41:42', '2026-03-07 07:41:42');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('16', 'Test Plan 1772862271', '30', '0', 'flat', '1000.00', NULL, NULL, '2026-03-07 11:14:31', '2026-03-07 11:14:32');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('17', 'Test Plan 1772862342', '30', '0', 'flat', '1000.00', NULL, NULL, '2026-03-07 11:15:43', '2026-03-07 11:15:43');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('18', 'Test Plan 1772862373', '30', '0', 'flat', '1000.00', NULL, NULL, '2026-03-07 11:16:13', '2026-03-07 11:16:14');
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `duration_days`, `status`, `plan_type`, `flat_price`, `rate_per_appointment`, `percentage_rate`, `created_at`, `updated_at`) VALUES ('19', 'Updated Test Plan 1772862391', '45', '0', 'flat', '1500.00', NULL, NULL, '2026-03-07 11:16:31', '2026-03-07 11:16:32');

-- Total INSERT statements: 19
```

---

## Table: `subscription_renewal_reminders`

### Structure

```sql
CREATE TABLE `subscription_renewal_reminders` (
  `reminder_id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `reminder_type` enum('EMAIL','IN_APP','SMS') DEFAULT 'IN_APP',
  `days_before_expiry` int NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `recipient_user_id` int DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `status` enum('SENT','FAILED','PENDING') DEFAULT 'PENDING',
  `error_message` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reminder_id`),
  KEY `idx_subscription` (`subscription_id`),
  CONSTRAINT `fk_reminder_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `salon_subscriptions` (`subscription_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 0

---

## Table: `subscription_renewals`

### Structure

```sql
CREATE TABLE `subscription_renewals` (
  `renewal_id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `previous_end_date` date NOT NULL,
  `new_end_date` date NOT NULL,
  `renewal_type` enum('AUTO','MANUAL') NOT NULL,
  `renewed_by` int DEFAULT NULL,
  `duration_days` int NOT NULL,
  `plan_changed` tinyint(1) DEFAULT '0',
  `old_plan_id` int DEFAULT NULL,
  `new_plan_id` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`renewal_id`),
  KEY `idx_subscription` (`subscription_id`),
  CONSTRAINT `fk_renewal_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `salon_subscriptions` (`subscription_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 1

### Data (SQL INSERT Statements)

```sql
INSERT INTO `subscription_renewals` (`renewal_id`, `subscription_id`, `previous_end_date`, `new_end_date`, `renewal_type`, `renewed_by`, `duration_days`, `plan_changed`, `old_plan_id`, `new_plan_id`, `notes`, `created_at`) VALUES ('4', '58', '2025-03-15', '2028-03-14', 'MANUAL', '4', '730', '0', NULL, NULL, '', '2026-03-15 11:44:11');

-- Total INSERT statements: 1
```

---

## Table: `super_admin_login`

### Structure

```sql
CREATE TABLE `super_admin_login` (
  `super_admin_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`super_admin_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 4

### Data (SQL INSERT Statements)

```sql
INSERT INTO `super_admin_login` (`super_admin_id`, `name`, `email`, `password_hash`, `phone`, `last_login`, `status`, `created_at`) VALUES ('1', 'John Doe', 'john@salonmaster.com', '$2y$10$YourHashedPassword123', '9876543210', '2026-02-12 16:41:40', '1', '2026-02-12 16:41:40');
INSERT INTO `super_admin_login` (`super_admin_id`, `name`, `email`, `password_hash`, `phone`, `last_login`, `status`, `created_at`) VALUES ('2', 'Jane Smith', 'jane@salonmaster.com', '$2y$10$YourHashedPassword456', '9876543211', '2026-02-12 16:41:40', '1', '2026-02-12 16:41:40');
INSERT INTO `super_admin_login` (`super_admin_id`, `name`, `email`, `password_hash`, `phone`, `last_login`, `status`, `created_at`) VALUES ('3', 'Test Super Admin', 'testsuper@sam.com', '$2y$10$ex.dHsSWUp9Z.X5zZbymzu1kjfQv7CgPJuHnmfXQS8mtHBCkk0TIe', '9000000001', NULL, '1', '2026-02-13 17:51:27');
INSERT INTO `super_admin_login` (`super_admin_id`, `name`, `email`, `password_hash`, `phone`, `last_login`, `status`, `created_at`) VALUES ('4', 'Super Admin', 'super@gmail.com', '$2y$10$ydzZfgcTrxul.r2aXPH9TOuQGg10rvjwFZYhQrPUtmIsyjnND0yCi', '1234567890', NULL, '1', '2026-02-16 17:06:08');

-- Total INSERT statements: 4
```

---

## Table: `user_activity_log`

### Structure

```sql
CREATE TABLE `user_activity_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(50) NOT NULL COMMENT 'Action performed: LOGIN, LOGOUT, PASSWORD_CHANGE, PASSWORD_RESET, etc.',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address of the user',
  `user_agent` text COMMENT 'Browser user agent',
  `details` json DEFAULT NULL COMMENT 'Additional action details',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_activity_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Audit trail for user activities'
```

### Row Count: 2

### Data (SQL INSERT Statements)

```sql
INSERT INTO `user_activity_log` (`id`, `user_id`, `action`, `ip_address`, `user_agent`, `details`, `created_at`) VALUES ('2', '12', 'PASSWORD_RESET_REQUESTED', '::1', NULL, '{"message": "IP: ::1"}', '2026-03-17 08:43:59');
INSERT INTO `user_activity_log` (`id`, `user_id`, `action`, `ip_address`, `user_agent`, `details`, `created_at`) VALUES ('3', '12', 'PASSWORD_CHANGED_FORCED', '::1', NULL, '{"message": "IP: ::1"}', '2026-03-17 08:43:59');

-- Total INSERT statements: 2
```

---

## Table: `user_password_history`

### Structure

```sql
CREATE TABLE `user_password_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_password_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores password history to prevent reuse'
```

### Row Count: 0

---

## Table: `users`

### Structure

```sql
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` enum('ADMIN','STAFF') NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') DEFAULT 'ACTIVE',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_salon_email` (`salon_id`,`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

### Row Count: 27

### Data (SQL INSERT Statements)

```sql
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('1', '1', 'updated_admin', 'ADMIN', 'admin@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-03-07 11:16:31');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('2', '1', 'priya_staff', 'STAFF', 'priya@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('3', '1', 'rahul_staff', 'STAFF', 'rahul@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('4', '1', 'sneha_staff', 'STAFF', 'sneha@elite.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('5', '2', 'admin_stylezone', 'ADMIN', 'admin@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('6', '2', 'arjun_staff', 'STAFF', 'arjun@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('7', '2', 'divya_staff', 'STAFF', 'divya@stylezone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('8', '3', 'admin_glamour', 'ADMIN', 'admin@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('9', '3', 'kavya_staff', 'STAFF', 'kavya@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('10', '3', 'rohan_staff', 'STAFF', 'rohan@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BLOCKED', NULL, '2026-02-25 22:21:36', '2026-02-25 23:05:05');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('11', '3', 'ananya_staff', 'STAFF', 'ananya@glamourlounge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ACTIVE', NULL, '2026-02-25 22:21:36', '2026-02-25 22:21:36');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('12', '1', 'suresh', 'ADMIN', 'admin@gmail.com', '$2y$10$AVA02zkegahQNImgfgn.QO9cLGjuA7p/HUonSpdMafxiL1Lskd88a', 'ACTIVE', NULL, '2026-02-26 00:09:15', '2026-02-26 00:09:15');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('13', '1', 'mugesh', 'ADMIN', 'admin2@gmail.com', '$2y$10$F9z.YL6xtfJWy.bkbju9e.H4rawMOQbaUSWThsPDx7AxDde0ALMi.', 'ACTIVE', NULL, '2026-02-26 00:31:45', '2026-02-26 00:31:45');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('15', '1', 'kurlaman', 'STAFF', 'kurlaman@salon.com', '$2y$10$42mvyKrRn61uazkknwTxT.0BFNhT3KqRoc8xcd7N12X9M4.xsQfFe', 'INACTIVE', NULL, '2026-02-26 13:51:30', '2026-02-27 05:03:52');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('18', '1', 'sammy', 'STAFF', 'sammy@gmail.com', '$2y$10$xeIGlWub8MKaMqXyJoH3B.US/CWW3/gkIPL1TZ.TJNZ106Re0MLve', 'ACTIVE', NULL, '2026-03-03 15:38:46', '2026-03-03 15:38:46');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('19', '1', 'test_admin_1772862271', 'ADMIN', 'testadmin1772862271@test.com', '$2y$10$groGDsrDaHVnRbQHJL3nTeSBqsqsYa1DNc33lmGiY9NnxrVUOSqeW', 'ACTIVE', NULL, '2026-03-07 11:14:31', '2026-03-07 11:14:31');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('20', '1', 'test_admin_1772862342', 'ADMIN', 'testadmin1772862342@test.com', '$2y$10$V1w8K5LqUHqvugvP4BJqT.zckR6djDjCN78B6dLiZVlwT.vxSbDey', 'ACTIVE', NULL, '2026-03-07 11:15:42', '2026-03-07 11:15:42');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('21', '1', 'test_admin_1772862373', 'ADMIN', 'testadmin1772862373@test.com', '$2y$10$TL.BOUnqghPM4jthdCSCceFfNSN2WQ286PCtXdR5SjjVr85LNPtBy', 'ACTIVE', NULL, '2026-03-07 11:16:13', '2026-03-07 11:16:13');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('22', '1', 'test_admin_1772862391', 'ADMIN', 'testadmin1772862391@test.com', '$2y$10$51jwxE0QljIm935ej92IcOrr64.bmoF8NfGm6HZJYPuBnygxVT0F2', 'ACTIVE', NULL, '2026-03-07 11:16:31', '2026-03-07 11:16:31');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('23', '10', 'admin_debug', 'ADMIN', 'debug@salon.com', '$2y$10$tKRtp46NcSUgHEPMJkarNu.Y1hXLGvHkTtsAmd2PM5tW0ONgVNTZu', 'ACTIVE', NULL, '2026-03-07 14:01:58', '2026-03-07 14:01:58');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('24', '11', 'admin_test_salon_1772872375', 'ADMIN', 'admin.testsalon1772872375@salon.com', '$2y$10$N0nXyKHrRFfnWwFgLth.4u9ZjmlNTVKuHAM9UNfny44raCr/xspOK', 'ACTIVE', NULL, '2026-03-07 14:02:55', '2026-03-07 14:02:55');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('25', '12', 'custom_admin', 'ADMIN', 'custom@admin.com', '$2y$10$z45xc9g9mOHf.HZMrlmKL.W3dNXcnfOVxE08pU0gKHKQ1mOj6GLGG', 'ACTIVE', NULL, '2026-03-07 14:02:55', '2026-03-07 14:02:55');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('26', '1', 'atharkhan5535', 'STAFF', 'atharkhan5535@gmail.com', '$2y$10$aRSebCLChLcBEFDFeWuSIODU9DNyC.AxRxJlC5j02ZhDLHIcRNVta', 'ACTIVE', NULL, '2026-03-08 08:16:17', '2026-03-08 08:20:01');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('27', '13', 'admin_sammy_salon', 'ADMIN', 'admin.sammysalon@salon.com', '$2y$10$h/YITDYUpA3sKNdRF0ClxOqm/dPdGt0ajfcrOaEoZXnxms3TGNpWG', 'ACTIVE', NULL, '2026-03-08 09:50:06', '2026-03-08 09:50:06');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('28', '13', 'sammy', 'ADMIN', 'sam@gmail.com', '$2y$10$ILxQkbyG5wPt/WSZ7IpVRup3wQNZchWkW.IYQKnb9PUN2OwwjKlqO', 'ACTIVE', NULL, '2026-03-08 09:50:53', '2026-03-08 09:50:53');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('29', '1', 'asad5535', 'STAFF', 'asad@gmail.com', '$2y$10$uxZe51rGU76t/XWKp3Qb8u985n0Vr5nnmVM2c3/yI99oE9KPcvaTi', 'ACTIVE', NULL, '2026-03-08 11:16:51', '2026-03-08 11:17:12');
INSERT INTO `users` (`user_id`, `salon_id`, `username`, `role`, `email`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES ('30', '13', 'altamash', 'ADMIN', 'alta@gmail.com', '$2y$10$0GqLEJCnXc9yP6o2e2jJv.f.fb2fAqljm4RE9TOyCVdeEKn4ZM3P2', 'ACTIVE', NULL, '2026-03-08 11:39:17', '2026-03-08 11:39:17');

-- Total INSERT statements: 27
```

---

## Views

### View: `salon_dashboard`

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `salon_dashboard` AS select `s`.`salon_id` AS `salon_id`,`s`.`salon_name` AS `salon_name`,`s`.`city` AS `city`,`s`.`status` AS `salon_status`,`ss`.`status` AS `subscription_status`,`ss`.`end_date` AS `subscription_end_date`,count(distinct `st`.`staff_id`) AS `total_staff`,count(distinct `c`.`customer_id`) AS `total_customers`,count(distinct `a`.`appointment_id`) AS `total_appointments`,coalesce(sum((case when (`a`.`status` = 'COMPLETED') then `a`.`final_amount` else 0 end)),0) AS `total_revenue` from ((((`salons` `s` left join `salon_subscriptions` `ss` on((`s`.`salon_id` = `ss`.`salon_id`))) left join `staff_info` `st` on(((`s`.`salon_id` = `st`.`salon_id`) and (`st`.`status` = 'ACTIVE')))) left join `customers` `c` on(((`s`.`salon_id` = `c`.`salon_id`) and (`c`.`status` = 'ACTIVE')))) left join `appointments` `a` on((`s`.`salon_id` = `a`.`salon_id`))) group by `s`.`salon_id`,`s`.`salon_name`,`s`.`city`,`s`.`status`,`ss`.`status`,`ss`.`end_date`
```

### View: `staff_performance`

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `staff_performance` AS select `si`.`staff_id` AS `staff_id`,`si`.`name` AS `name`,`si`.`specialization` AS `specialization`,`s`.`salon_name` AS `salon_name`,count(distinct `a`.`appointment_id`) AS `total_appointments`,count(distinct `aserv`.`appointment_service_id`) AS `total_services`,coalesce(sum((case when (`a`.`status` = 'COMPLETED') then `a`.`final_amount` else 0 end)),0) AS `total_revenue`,coalesce(sum(`i`.`incentive_amount`),0) AS `total_incentives` from (((((`staff_info` `si` join `salons` `s` on((`si`.`salon_id` = `s`.`salon_id`))) left join `appointments` `a` on((`si`.`salon_id` = `a`.`salon_id`))) left join `appointment_services` `aserv` on((`a`.`appointment_id` = `aserv`.`appointment_id`))) left join `services` `svc` on(((`aserv`.`service_id` = `svc`.`service_id`) and (`svc`.`staff_id` = `si`.`staff_id`)))) left join `incentives` `i` on(((`si`.`staff_id` = `i`.`staff_id`) and (`i`.`status` in ('APPROVED','PAID'))))) where (`si`.`status` = 'ACTIVE') group by `si`.`staff_id`,`si`.`name`,`si`.`specialization`,`s`.`salon_name`
```

