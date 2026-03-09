-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: sam-db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment_feedback`
--

DROP TABLE IF EXISTS `appointment_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_feedback`
--

LOCK TABLES `appointment_feedback` WRITE;
/*!40000 ALTER TABLE `appointment_feedback` DISABLE KEYS */;
INSERT INTO `appointment_feedback` VALUES (1,1,1,5,'Excellent service! Very professional staff.',0,'2026-02-12 16:44:42','2026-02-12 16:44:42'),(2,2,2,4,'Good service but had to wait for 10 minutes.',0,'2026-02-12 16:44:42','2026-02-12 16:44:42'),(3,4,4,5,'Loved the hair spa treatment!',0,'2026-02-12 16:44:42','2026-02-12 16:44:42');
/*!40000 ALTER TABLE `appointment_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_packages`
--

DROP TABLE IF EXISTS `appointment_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `package_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `package_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_package_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `package_id` (`package_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `appointment_packages_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `appointment_packages_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`),
  CONSTRAINT `appointment_packages_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_packages`
--

LOCK TABLES `appointment_packages` WRITE;
/*!40000 ALTER TABLE `appointment_packages` DISABLE KEYS */;
INSERT INTO `appointment_packages` VALUES (1,2,1,1,5000.00,200.00,4800.00,'COMPLETED','2026-02-12 16:44:31','2026-02-12 16:44:31');
/*!40000 ALTER TABLE `appointment_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_services`
--

DROP TABLE IF EXISTS `appointment_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_services` (
  `appointment_service_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `staff_id` int NOT NULL,
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
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `appointment_services_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `appointment_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  CONSTRAINT `appointment_services_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_services`
--

LOCK TABLES `appointment_services` WRITE;
/*!40000 ALTER TABLE `appointment_services` DISABLE KEYS */;
INSERT INTO `appointment_services` VALUES (1,1,4,2,800.00,100.00,700.00,NULL,NULL,'COMPLETED','2026-02-12 16:44:23','2026-02-12 16:44:23'),(2,2,1,1,300.00,50.00,250.00,NULL,NULL,'COMPLETED','2026-02-12 16:44:23','2026-02-12 16:44:23'),(3,2,2,1,1500.00,150.00,1350.00,NULL,NULL,'COMPLETED','2026-02-12 16:44:23','2026-02-12 16:44:23'),(4,3,1,1,300.00,0.00,300.00,NULL,NULL,'PENDING','2026-02-12 16:44:23','2026-02-12 16:44:23'),(5,4,5,3,1200.00,0.00,1200.00,NULL,NULL,'COMPLETED','2026-02-12 16:44:23','2026-02-12 16:44:23');
/*!40000 ALTER TABLE `appointment_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','NO_SHOW','CANCELLED') DEFAULT 'PENDING',
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,'2024-01-15','10:00:00','11:00:00',60,800.00,100.00,700.00,'COMPLETED',NULL,'Regular customer','2026-02-12 16:44:14','2026-02-12 16:44:14'),(2,1,2,'2024-01-20','14:00:00','16:30:00',150,2500.00,200.00,2300.00,'COMPLETED',NULL,'Hair color and haircut','2026-02-12 16:44:14','2026-02-12 16:44:14'),(3,1,3,'2024-01-25','11:00:00','12:00:00',60,300.00,0.00,300.00,'CONFIRMED',NULL,NULL,'2026-02-12 16:44:14','2026-02-12 16:44:14'),(4,2,4,'2024-01-18','15:00:00','16:30:00',90,1200.00,0.00,1200.00,'COMPLETED',NULL,'Hair spa treatment','2026-02-12 16:44:14','2026-02-12 16:44:14');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_authentication`
--

DROP TABLE IF EXISTS `customer_authentication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_authentication`
--

LOCK TABLES `customer_authentication` WRITE;
/*!40000 ALTER TABLE `customer_authentication` DISABLE KEYS */;
INSERT INTO `customer_authentication` VALUES (1,1,1,'amit@email.com','$2y$10$CustomerHash123',NULL,'ACTIVE','2026-02-12 16:44:06','2026-02-12 16:44:06'),(2,2,1,'priya@email.com','$2y$10$CustomerHash456',NULL,'ACTIVE','2026-02-12 16:44:06','2026-02-12 16:44:06'),(3,4,2,'sneha@email.com','$2y$10$CustomerHash789',NULL,'ACTIVE','2026-02-12 16:44:06','2026-02-12 16:44:06'),(4,5,1,'testcustomer@elite.com','$2y$10$ex.dHsSWUp9Z.X5zZbymzu1kjfQv7CgPJuHnmfXQS8mtHBCkk0TIe',NULL,'ACTIVE','2026-02-13 17:51:28','2026-02-13 17:51:28'),(5,9,1,NULL,'$2y$10$jlK1J0RyDJzFWPCF0sBNOOCG.kWOK30.XxPgaaOF9QlFSQkmLP7b2',NULL,'ACTIVE','2026-02-14 06:58:13','2026-02-14 06:58:13');
/*!40000 ALTER TABLE `customer_authentication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_payments`
--

DROP TABLE IF EXISTS `customer_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_payments`
--

LOCK TABLES `customer_payments` WRITE;
/*!40000 ALTER TABLE `customer_payments` DISABLE KEYS */;
INSERT INTO `customer_payments` VALUES (1,1,'UPI','TXN987654',844.00,'2024-01-15 11:00:00','SUCCESS',NULL,'2026-02-12 16:44:56','2026-02-12 16:44:56'),(2,2,'CARD','TXN987655',2750.00,'2024-01-20 16:30:00','SUCCESS',NULL,'2026-02-12 16:44:56','2026-02-12 16:44:56'),(3,4,'CASH',NULL,1416.00,'2024-01-18 16:30:00','SUCCESS',NULL,'2026-02-12 16:44:56','2026-02-12 16:44:56');
/*!40000 ALTER TABLE `customer_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,1,'Amit Verma','9876543240','amit@email.com','MALE','1985-07-20',NULL,NULL,NULL,5,'2024-01-15','2023-12-01','ACTIVE','2026-02-12 16:43:52','2026-02-12 16:43:52'),(2,1,'Priya Singh','9876543241','priya@email.com','FEMALE','1990-11-05','2018-06-10',NULL,NULL,12,'2024-01-20','2023-10-15','ACTIVE','2026-02-12 16:43:52','2026-02-12 16:43:52'),(3,1,'Rahul Mehta','9876543242','rahul@email.com','MALE','1988-03-15',NULL,NULL,NULL,3,'2023-12-10','2023-11-01','ACTIVE','2026-02-12 16:43:52','2026-02-12 16:43:52'),(4,2,'Sneha Kapoor','9876543243','sneha@email.com','FEMALE','1992-09-28','2019-02-14',NULL,NULL,8,'2024-01-18','2023-09-01','ACTIVE','2026-02-12 16:43:52','2026-02-12 16:43:52'),(5,1,'Test Customer','9000000003','testcustomer@elite.com','MALE',NULL,NULL,NULL,NULL,0,NULL,'2026-02-13','ACTIVE','2026-02-13 17:51:28','2026-02-13 17:51:28'),(9,1,'Athar','9999999999',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-02-14','ACTIVE','2026-02-14 06:58:12','2026-02-14 06:58:12');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incentive_payouts`
--

DROP TABLE IF EXISTS `incentive_payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incentive_payouts`
--

LOCK TABLES `incentive_payouts` WRITE;
/*!40000 ALTER TABLE `incentive_payouts` DISABLE KEYS */;
INSERT INTO `incentive_payouts` VALUES (1,2,2,70.00,'2024-01-31','CASH','PAYOUT-001',NULL,'2026-02-12 16:45:11','2026-02-12 16:45:11');
/*!40000 ALTER TABLE `incentive_payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incentives`
--

DROP TABLE IF EXISTS `incentives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incentives` (
  `incentive_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `appointment_id` int NOT NULL,
  `incentive_type` enum('SERVICE_COMMISSION','BONUS','TARGET_ACHIEVEMENT') NOT NULL,
  `calculation_type` enum('PERCENTAGE','FIXED') NOT NULL,
  `percentage_rate` decimal(5,2) DEFAULT NULL,
  `fixed_amount` decimal(10,2) DEFAULT NULL,
  `base_amount` decimal(10,2) NOT NULL,
  `incentive_amount` decimal(10,2) NOT NULL,
  `remarks` text,
  `status` enum('PENDING','APPROVED','PAID') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`incentive_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `incentives_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incentives`
--

LOCK TABLES `incentives` WRITE;
/*!40000 ALTER TABLE `incentives` DISABLE KEYS */;
INSERT INTO `incentives` VALUES (1,1,2,'SERVICE_COMMISSION','PERCENTAGE',10.00,NULL,1600.00,160.00,NULL,'APPROVED','2026-02-12 16:45:01','2026-02-12 16:45:01'),(2,2,1,'SERVICE_COMMISSION','PERCENTAGE',10.00,NULL,700.00,70.00,NULL,'PAID','2026-02-12 16:45:01','2026-02-12 16:45:01'),(3,3,4,'SERVICE_COMMISSION','PERCENTAGE',10.00,NULL,1200.00,120.00,NULL,'APPROVED','2026-02-12 16:45:01','2026-02-12 16:45:01');
/*!40000 ALTER TABLE `incentives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_customer`
--

DROP TABLE IF EXISTS `invoice_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_customer`
--

LOCK TABLES `invoice_customer` WRITE;
/*!40000 ALTER TABLE `invoice_customer` DISABLE KEYS */;
INSERT INTO `invoice_customer` VALUES (1,1,1,1,'INV-001',800.00,144.00,100.00,844.00,'PAID','2024-01-15','2024-01-22',NULL,'2026-02-12 16:44:50','2026-02-12 16:44:50'),(2,2,1,2,'INV-002',2500.00,450.00,200.00,2750.00,'PAID','2024-01-20','2024-01-27',NULL,'2026-02-12 16:44:50','2026-02-12 16:44:50'),(3,3,1,3,'INV-003',300.00,54.00,0.00,354.00,'UNPAID','2024-01-25','2024-02-01',NULL,'2026-02-12 16:44:50','2026-02-12 16:44:50'),(4,4,2,4,'INV-004',1200.00,216.00,0.00,1416.00,'PAID','2024-01-18','2024-01-25',NULL,'2026-02-12 16:44:50','2026-02-12 16:44:50');
/*!40000 ALTER TABLE `invoice_customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_salon`
--

DROP TABLE IF EXISTS `invoice_salon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_salon`
--

LOCK TABLES `invoice_salon` WRITE;
/*!40000 ALTER TABLE `invoice_salon` DISABLE KEYS */;
INSERT INTO `invoice_salon` VALUES (1,1,1,'INV-SALON-001',1999.00,360.00,2359.00,'PAID','2024-01-10','2024-01-01','2026-02-12 16:42:26','2026-02-12 16:42:26'),(2,2,2,'INV-SALON-002',2500.00,450.00,2950.00,'PAID','2024-02-10','2024-02-01','2026-02-12 16:42:26','2026-02-12 16:42:26'),(3,3,3,'INV-SALON-003',15000.00,2700.00,17700.00,'PARTIAL','2024-03-10','2024-03-01','2026-02-12 16:42:26','2026-02-12 16:42:26');
/*!40000 ALTER TABLE `invoice_salon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_services`
--

DROP TABLE IF EXISTS `package_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_services`
--

LOCK TABLES `package_services` WRITE;
/*!40000 ALTER TABLE `package_services` DISABLE KEYS */;
INSERT INTO `package_services` VALUES (1,1,1,'2026-02-12 16:43:05'),(1,2,1,'2026-02-12 16:43:05'),(1,4,1,'2026-02-12 16:43:05'),(2,1,1,'2026-02-12 16:43:05'),(2,4,1,'2026-02-12 16:43:05');
/*!40000 ALTER TABLE `package_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,1,'Bridal Package','Complete bridal makeover package',5000.00,365,NULL,'ACTIVE','2026-02-12 16:42:57','2026-02-12 16:42:57'),(2,1,'Monthly Maintenance','Monthly hair and skin care',2500.00,30,NULL,'ACTIVE','2026-02-12 16:42:57','2026-02-12 16:42:57'),(3,2,'Party Makeover','Evening party makeover',3000.00,7,NULL,'ACTIVE','2026-02-12 16:42:57','2026-02-12 16:42:57');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments_salon`
--

DROP TABLE IF EXISTS `payments_salon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments_salon`
--

LOCK TABLES `payments_salon` WRITE;
/*!40000 ALTER TABLE `payments_salon` DISABLE KEYS */;
INSERT INTO `payments_salon` VALUES (1,1,'UPI','TXN123456',2359.00,'2024-01-01 10:30:00','2026-02-12 16:42:33'),(2,2,'CARD','TXN123457',2950.00,'2024-02-01 11:00:00','2026-02-12 16:42:33'),(3,3,'CASH','TXN123458',5000.00,'2024-03-01 12:00:00','2026-02-12 16:42:33');
/*!40000 ALTER TABLE `payments_salon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Shampoo','L\'Oreal','product','Professional shampoo','2026-02-12 16:43:13','2026-02-12 16:43:13'),(2,1,'Hair Color','Wella','product','Permanent hair color','2026-02-12 16:43:13','2026-02-12 16:43:13'),(3,1,'Hair Dryer','Philips','equipment','Professional hair dryer','2026-02-12 16:43:13','2026-02-12 16:43:13'),(4,1,'Scissors','Kent','equipment','Professional haircutting scissors','2026-02-12 16:43:13','2026-02-12 16:43:13');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,'SUPER_ADMIN',1,NULL,'super_admin_token_123','2026-02-19 16:45:23',0,NULL,'2026-02-12 16:45:23',NULL),(2,'ADMIN',1,NULL,'admin_token_123','2026-02-19 16:45:23',0,NULL,'2026-02-12 16:45:23',NULL),(3,'STAFF',2,NULL,'staff_token_123','2026-02-19 16:45:23',0,NULL,'2026-02-12 16:45:23',NULL),(4,'CUSTOMER',1,NULL,'customer_token_123','2026-02-19 16:45:23',0,NULL,'2026-02-12 16:45:23',NULL),(5,'STAFF',6,NULL,'274caddff0e01ed15018996ff529c51899da213fab047a6ae5c7951b4563fcc7','2026-02-20 13:30:24',0,NULL,'2026-02-13 18:00:24',NULL),(6,'STAFF',6,NULL,'b5d2e36d6d0734ca381969687c1303ff2a477d03e10989479a31723e3d1805c8','2026-02-20 17:47:48',0,NULL,'2026-02-13 22:17:48',NULL),(7,'STAFF',6,1,'46cae98cb5115330d9b95fbb22cd53b5fe24b8b67374526a11b547c7e4195fdc','2026-02-20 18:16:59',0,NULL,'2026-02-13 22:46:59',NULL);
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `salon_dashboard`
--

DROP TABLE IF EXISTS `salon_dashboard`;
/*!50001 DROP VIEW IF EXISTS `salon_dashboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `salon_dashboard` AS SELECT 
 1 AS `salon_id`,
 1 AS `salon_name`,
 1 AS `city`,
 1 AS `salon_status`,
 1 AS `subscription_status`,
 1 AS `subscription_end_date`,
 1 AS `total_staff`,
 1 AS `total_customers`,
 1 AS `total_appointments`,
 1 AS `total_revenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `salon_subscriptions`
--

DROP TABLE IF EXISTS `salon_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_subscriptions`
--

LOCK TABLES `salon_subscriptions` WRITE;
/*!40000 ALTER TABLE `salon_subscriptions` DISABLE KEYS */;
INSERT INTO `salon_subscriptions` VALUES (1,1,1,'2024-01-01','2024-12-31','ACTIVE','2026-02-12 16:42:20','2026-02-12 16:42:20'),(2,2,2,'2024-02-01','2024-07-31','ACTIVE','2026-02-12 16:42:20','2026-02-12 16:42:20'),(3,3,3,'2024-03-01','2025-02-28','ACTIVE','2026-02-12 16:42:20','2026-02-12 16:42:20');
/*!40000 ALTER TABLE `salon_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salons`
--

DROP TABLE IF EXISTS `salons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salons`
--

LOCK TABLES `salons` WRITE;
/*!40000 ALTER TABLE `salons` DISABLE KEYS */;
INSERT INTO `salons` VALUES (1,'Elite Beauty Salon','Rajesh Kumar','elite@example.com','9876543220','GSTIN123456789','123 Main Street','Mumbai','Maharashtra','India','/logos/elite.png',1,'2026-02-12 16:42:10','2026-02-12 16:42:10'),(2,'Style Zone','Priya Sharma','stylezone@example.com','9876543221','GSTIN987654321','456 Park Avenue','Delhi','Delhi','India','/logos/stylezone.png',1,'2026-02-12 16:42:10','2026-02-12 16:42:10'),(3,'Glamour Lounge','Vikram Singh','glamour@example.com','9876543222','GSTIN456789123','789 Mall Road','Bangalore','Karnataka','India','/logos/glamour.png',1,'2026-02-12 16:42:10','2026-02-12 16:42:10');
/*!40000 ALTER TABLE `salons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
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
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'Haircut','Professional haircut for men and women',300.00,30,NULL,'ACTIVE','2026-02-12 16:42:48','2026-02-12 16:42:48'),(2,1,'Hair Color','Full hair coloring service',1500.00,120,NULL,'ACTIVE','2026-02-12 16:42:48','2026-02-12 16:42:48'),(3,1,'Manicure','Basic nail care and polishing',400.00,45,NULL,'ACTIVE','2026-02-12 16:42:48','2026-02-12 16:42:48'),(4,1,'Facial','Basic facial treatment',800.00,60,NULL,'ACTIVE','2026-02-12 16:42:48','2026-02-12 16:42:48'),(5,2,'Hair Spa','Complete hair treatment',1200.00,90,NULL,'ACTIVE','2026-02-12 16:42:48','2026-02-12 16:42:48');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_documents`
--

DROP TABLE IF EXISTS `staff_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_documents`
--

LOCK TABLES `staff_documents` WRITE;
/*!40000 ALTER TABLE `staff_documents` DISABLE KEYS */;
INSERT INTO `staff_documents` VALUES (1,1,'ID_PROOF','Aadhar Card','/docs/aadhar_rohit.pdf',NULL,'2026-02-12 16:43:43',NULL,'2026-02-12 16:43:43','2026-02-12 16:43:43'),(2,1,'CERTIFICATION','Hair Styling Certificate','/docs/cert_rohit.pdf',NULL,'2026-02-12 16:43:43','2026-12-31','2026-02-12 16:43:43','2026-02-12 16:43:43'),(3,2,'ID_PROOF','PAN Card','/docs/pan_neha.pdf',NULL,'2026-02-12 16:43:43',NULL,'2026-02-12 16:43:43','2026-02-12 16:43:43');
/*!40000 ALTER TABLE `staff_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_info`
--

DROP TABLE IF EXISTS `staff_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_info`
--

LOCK TABLES `staff_info` WRITE;
/*!40000 ALTER TABLE `staff_info` DISABLE KEYS */;
INSERT INTO `staff_info` VALUES (1,1,2,'Rohit Sharma','9876543230','rohit@elite.com','1990-05-15','2023-01-15','Hair Stylist',8,35000.00,'ACTIVE','2026-02-12 16:43:35','2026-02-12 16:43:35'),(2,1,3,'Neha Patel','9876543231','neha@elite.com','1992-08-22','2023-03-20','Beautician',6,30000.00,'ACTIVE','2026-02-12 16:43:35','2026-02-12 16:43:35'),(3,2,4,'Anjali Mehta','9876543232','anjali@stylezone.com','1995-03-10','2024-01-10','Makeup Artist',4,28000.00,'ACTIVE','2026-02-12 16:43:35','2026-02-12 16:43:35'),(4,1,5,'Test Staff','9000000002','newstaff@elite.com',NULL,'2024-01-01','Hair Stylist',3,25000.00,'ACTIVE','2026-02-13 17:51:28','2026-02-13 17:51:28');
/*!40000 ALTER TABLE `staff_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `staff_performance`
--

DROP TABLE IF EXISTS `staff_performance`;
/*!50001 DROP VIEW IF EXISTS `staff_performance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `staff_performance` AS SELECT 
 1 AS `staff_id`,
 1 AS `name`,
 1 AS `specialization`,
 1 AS `salon_name`,
 1 AS `total_appointments`,
 1 AS `total_services`,
 1 AS `total_revenue`,
 1 AS `total_incentives`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,1,1,50,10,100,'2026-02-12 16:43:18','2026-02-12 16:43:18','2026-02-12 16:43:18'),(2,2,1,25,5,50,'2026-02-12 16:43:18','2026-02-12 16:43:18','2026-02-12 16:43:18'),(3,3,1,5,2,10,'2026-02-12 16:43:18','2026-02-12 16:43:18','2026-02-12 16:43:18'),(4,4,1,10,3,15,'2026-02-12 16:43:18','2026-02-12 16:43:18','2026-02-12 16:43:18');
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
INSERT INTO `stock_transactions` VALUES (1,1,1,'IN',100,150.00,15000.00,'PURCHASE',NULL,NULL,'2026-02-12 16:43:24'),(2,2,1,'IN',50,200.00,10000.00,'PURCHASE',NULL,NULL,'2026-02-12 16:43:24'),(3,1,2,'OUT',2,150.00,300.00,'USAGE',NULL,NULL,'2026-02-12 16:43:24');
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `plan_id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `duration_days` int NOT NULL,
  `status` tinyint DEFAULT '1',
  `plan_type` enum('flat','per-appointments','Percentage-per-appointments') NOT NULL,
  `flat_price` decimal(10,2) DEFAULT NULL,
  `per_appointments_price` decimal(10,2) DEFAULT NULL,
  `percentage_per_appointments` decimal(5,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Basic Plan',30,1,'flat',1999.00,NULL,NULL,'2026-02-12 16:41:52','2026-02-12 16:41:52'),(2,'Premium Plan',30,1,'per-appointments',NULL,50.00,NULL,'2026-02-12 16:41:52','2026-02-12 16:41:52'),(3,'Enterprise Plan',365,1,'Percentage-per-appointments',NULL,NULL,5.00,'2026-02-12 16:41:52','2026-02-12 16:41:52');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_admin_login`
--

DROP TABLE IF EXISTS `super_admin_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admin_login`
--

LOCK TABLES `super_admin_login` WRITE;
/*!40000 ALTER TABLE `super_admin_login` DISABLE KEYS */;
INSERT INTO `super_admin_login` VALUES (1,'John Doe','john@salonmaster.com','$2y$10$YourHashedPassword123','9876543210','2026-02-12 16:41:40',1,'2026-02-12 16:41:40'),(2,'Jane Smith','jane@salonmaster.com','$2y$10$YourHashedPassword456','9876543211','2026-02-12 16:41:40',1,'2026-02-12 16:41:40'),(3,'Test Super Admin','testsuper@sam.com','$2y$10$ex.dHsSWUp9Z.X5zZbymzu1kjfQv7CgPJuHnmfXQS8mtHBCkk0TIe','9000000001',NULL,1,'2026-02-13 17:51:27');
/*!40000 ALTER TABLE `super_admin_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'elite_admin','ADMIN','admin@elite.com','$2y$10$AdminHash123','ACTIVE',NULL,'2026-02-12 16:42:42','2026-02-12 16:42:42'),(2,1,'rohit_staff','STAFF','rohit@elite.com','$2y$10$StaffHash123','ACTIVE',NULL,'2026-02-12 16:42:42','2026-02-12 16:42:42'),(3,1,'neha_staff','STAFF','neha@elite.com','$2y$10$StaffHash456','ACTIVE',NULL,'2026-02-12 16:42:42','2026-02-12 16:42:42'),(4,2,'style_admin','ADMIN','admin@stylezone.com','$2y$10$AdminHash456','ACTIVE',NULL,'2026-02-12 16:42:42','2026-02-12 16:42:42'),(5,1,'new_admin_elite','ADMIN','newadmin@elite.com','$2y$10$ex.dHsSWUp9Z.X5zZbymzu1kjfQv7CgPJuHnmfXQS8mtHBCkk0TIe','ACTIVE',NULL,'2026-02-13 17:51:28','2026-02-13 17:51:28'),(6,1,'new_staff_elite','STAFF','newstaff@elite.com','$2y$10$ex.dHsSWUp9Z.X5zZbymzu1kjfQv7CgPJuHnmfXQS8mtHBCkk0TIe','ACTIVE',NULL,'2026-02-13 17:51:28','2026-02-13 17:51:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `salon_dashboard`
--

/*!50001 DROP VIEW IF EXISTS `salon_dashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `salon_dashboard` AS select `s`.`salon_id` AS `salon_id`,`s`.`salon_name` AS `salon_name`,`s`.`city` AS `city`,`s`.`status` AS `salon_status`,`ss`.`status` AS `subscription_status`,`ss`.`end_date` AS `subscription_end_date`,count(distinct `st`.`staff_id`) AS `total_staff`,count(distinct `c`.`customer_id`) AS `total_customers`,count(distinct `a`.`appointment_id`) AS `total_appointments`,coalesce(sum((case when (`a`.`status` = 'COMPLETED') then `a`.`final_amount` else 0 end)),0) AS `total_revenue` from ((((`salons` `s` left join `salon_subscriptions` `ss` on((`s`.`salon_id` = `ss`.`salon_id`))) left join `staff_info` `st` on(((`s`.`salon_id` = `st`.`salon_id`) and (`st`.`status` = 'ACTIVE')))) left join `customers` `c` on(((`s`.`salon_id` = `c`.`salon_id`) and (`c`.`status` = 'ACTIVE')))) left join `appointments` `a` on((`s`.`salon_id` = `a`.`salon_id`))) group by `s`.`salon_id`,`s`.`salon_name`,`s`.`city`,`s`.`status`,`ss`.`status`,`ss`.`end_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `staff_performance`
--

/*!50001 DROP VIEW IF EXISTS `staff_performance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `staff_performance` AS select `si`.`staff_id` AS `staff_id`,`si`.`name` AS `name`,`si`.`specialization` AS `specialization`,`s`.`salon_name` AS `salon_name`,count(distinct `a`.`appointment_id`) AS `total_appointments`,count(distinct `aserv`.`appointment_service_id`) AS `total_services`,coalesce(sum((case when (`a`.`status` = 'COMPLETED') then `a`.`final_amount` else 0 end)),0) AS `total_revenue`,coalesce(sum(`i`.`incentive_amount`),0) AS `total_incentives` from ((((`staff_info` `si` join `salons` `s` on((`si`.`salon_id` = `s`.`salon_id`))) left join `appointments` `a` on((`si`.`staff_id` = `a`.`appointment_id`))) left join `appointment_services` `aserv` on((`si`.`staff_id` = `aserv`.`staff_id`))) left join `incentives` `i` on(((`si`.`staff_id` = `i`.`staff_id`) and (`i`.`status` in ('APPROVED','PAID'))))) where (`si`.`status` = 'ACTIVE') group by `si`.`staff_id`,`si`.`name`,`si`.`specialization`,`s`.`salon_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-14  7:04:16
