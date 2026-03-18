-- ============================================
-- Staff ID Architecture Migration
-- Moving staff assignment from appointment to service level
-- ============================================
-- Date: March 18, 2026
-- Purpose: Fix the "staff_id not found" error by moving staff_id 
--          from appointment_services/appointment_packages to services table
-- ============================================

-- STEP 1: Add staff_id to services table
-- ============================================
ALTER TABLE `services`
ADD COLUMN `staff_id` int AFTER `salon_id`,
ADD CONSTRAINT `fk_services_staff`
FOREIGN KEY (`staff_id`) REFERENCES `staff_info`(`staff_id`)
ON DELETE SET NULL;

-- STEP 2: Update existing services with first active staff per salon
-- ============================================
UPDATE `services` s
SET `staff_id` = (
    SELECT `staff_id` FROM `staff_info`
    WHERE `salon_id` = s.`salon_id`
    AND `status` = 'ACTIVE'
    LIMIT 1
)
WHERE `staff_id` IS NULL;

-- STEP 3: Remove staff_id from appointment_services table
-- ============================================
-- First, drop the foreign key constraint
ALTER TABLE `appointment_services`
DROP FOREIGN KEY `appointment_services_ibfk_3`;

-- Then drop the staff_id column
ALTER TABLE `appointment_services`
DROP COLUMN `staff_id`;

-- STEP 4: Remove staff_id from appointment_packages table
-- ============================================
-- First, drop the foreign key constraint
ALTER TABLE `appointment_packages`
DROP FOREIGN KEY `appointment_packages_ibfk_3`;

-- Then drop the staff_id column
ALTER TABLE `appointment_packages`
DROP COLUMN `staff_id`;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify services.staff_id exists
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'staff_id';

-- Verify appointment_services.staff_id is removed
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'appointment_services' AND COLUMN_NAME = 'staff_id';
-- Expected: 0 rows

-- Verify appointment_packages.staff_id is removed
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'appointment_packages' AND COLUMN_NAME = 'staff_id';
-- Expected: 0 rows

-- Verify all services have staff assigned
SELECT service_id, service_name, salon_id, staff_id 
FROM services 
WHERE staff_id IS NULL;
-- Expected: 0 rows (all services should have staff_id)

-- Test join to verify staff inheritance works
SELECT 
    s.service_id,
    s.service_name,
    s.staff_id,
    si.name AS staff_name
FROM services s
LEFT JOIN staff_info si ON s.staff_id = si.staff_id
LIMIT 10;
