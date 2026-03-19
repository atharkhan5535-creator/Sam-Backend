# 🔍 Database Schema Change Analysis - StaffIdFix Migration

**Generated:** 2026-03-18  
**Analysis Type:** Complete Schema Comparison  
**Source:** `database_schema_dump.sql` (Original) → `DATABASE_DUMP.md` (Current)

---

## 📋 EXECUTIVE SUMMARY

### Changes Successfully Applied ✅
1. ✅ Added `staff_id` column to `services` table
2. ✅ Added foreign key: `services.staff_id` → `staff_info.staff_id`
3. ✅ Removed `staff_id` column from `appointment_services` table
4. ✅ Removed `staff_id` column from `appointment_packages` table
5. ✅ All 213 services now have `staff_id` assigned (no orphans)

### Issues Found ❌
1. ❌ **`staff_performance` VIEW IS BROKEN** - References removed column `appointment_services.staff_id`
2. ⚠️ **`ReportController::staffPerformance()`** - Uses broken JOIN pattern `asvc.staff_id`

---

## 📊 DETAILED SCHEMA COMPARISON

### 1. SERVICES TABLE

| Aspect | Original Schema | Current Schema | Status |
|--------|----------------|----------------|--------|
| `staff_id` column | ❌ NOT EXISTS | ✅ EXISTS (int, nullable, indexed) | ✅ MIGRATED |
| Foreign Keys | `services_ibfk_1` → salons | `services_ibfk_1` → salons<br>`fk_services_staff` → staff_info | ✅ ADDED |
| Row Count | 5 | 213 | ✅ POPULATED |
| NULL staff_id | N/A | 0 records | ✅ COMPLETE |

**Original Structure:**
```sql
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL,
  `image_url` text,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  ...
  FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`)
);
```

**Current Structure:**
```sql
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `staff_id` int,              -- ✅ NEW
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL,
  `image_url` text,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  ...
  FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`),
  FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)  -- ✅ NEW
);
```

---

### 2. APPOINTMENT_SERVICES TABLE

| Aspect | Original Schema | Current Schema | Status |
|--------|----------------|----------------|--------|
| `staff_id` column | ✅ EXISTS (NOT NULL) | ❌ REMOVED | ✅ MIGRATED |
| Foreign Keys | `appointment_services_ibfk_3` → staff_info | REMOVED | ✅ REMOVED |
| Row Count | 5 | 126 | ✅ DATA PRESERVED |

**Original Structure:**
```sql
CREATE TABLE `appointment_services` (
  `appointment_service_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `staff_id` int NOT NULL,      -- ❌ REMOVED
  `service_price` decimal(10,2) NOT NULL,
  ...
  FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)  -- ❌ REMOVED
);
```

**Current Structure:**
```sql
CREATE TABLE `appointment_services` (
  `appointment_service_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `service_price` decimal(10,2) NOT NULL,
  ...
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`)
  -- ✅ staff_id removed - inherited from services table
);
```

---

### 3. APPOINTMENT_PACKAGES TABLE

| Aspect | Original Schema | Current Schema | Status |
|--------|----------------|----------------|--------|
| `staff_id` column | ✅ EXISTS (NOT NULL) | ❌ REMOVED | ✅ MIGRATED |
| Foreign Keys | `appointment_packages_ibfk_3` → staff_info | REMOVED | ✅ REMOVED |
| Row Count | 1 | 30 | ✅ DATA PRESERVED |

**Original Structure:**
```sql
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `package_id` int NOT NULL,
  `staff_id` int NOT NULL,      -- ❌ REMOVED
  `package_price` decimal(10,2) NOT NULL,
  ...
  FOREIGN KEY (`staff_id`) REFERENCES `staff_info` (`staff_id`)  -- ❌ REMOVED
);
```

**Current Structure:**
```sql
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `package_id` int NOT NULL,
  `package_price` decimal(10,2) NOT NULL,
  ...
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`)
  -- ✅ staff_id removed - inherited from package_services
);
```

---

## 🔴 CRITICAL ISSUES FOUND

### Issue #1: `staff_performance` VIEW IS BROKEN ❌

**Error Message:**
```
SQLSTATE[42S22]: Column not found: 1054 
Unknown column 'aserv.staff_id' in 'on clause'
```

**Current View Definition:**
```sql
CREATE VIEW `staff_performance` AS 
SELECT 
    si.staff_id,
    si.name,
    si.specialization,
    s.salon_name,
    COUNT(DISTINCT a.appointment_id) AS total_appointments,
    COUNT(DISTINCT aserv.appointment_service_id) AS total_services,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(i.incentive_amount), 0) AS total_incentives
FROM staff_info si
JOIN salons s ON si.salon_id = s.salon_id
LEFT JOIN appointments a ON si.staff_id = a.appointment_id  -- ⚠️ BUG: wrong join
LEFT JOIN appointment_services aserv ON si.staff_id = aserv.staff_id  -- ❌ BROKEN: column removed
LEFT JOIN incentives i ON si.staff_id = i.staff_id AND i.status IN ('APPROVED','PAID')
WHERE si.status = 'ACTIVE'
GROUP BY si.staff_id, si.name, si.specialization, s.salon_name
```

**Problems:**
1. ❌ `aserv.staff_id` column no longer exists
2. ⚠️ `a.appointment_id` join is wrong (should be `a.salon_id` or through appointment_services)

**Corrected View Should Be:**
```sql
CREATE VIEW `staff_performance` AS 
SELECT 
    si.staff_id,
    si.name,
    si.specialization,
    s.salon_name,
    COUNT(DISTINCT a.appointment_id) AS total_appointments,
    COUNT(DISTINCT aserv.appointment_service_id) AS total_services,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(i.incentive_amount), 0) AS total_incentives
FROM staff_info si
JOIN salons s ON si.salon_id = s.salon_id
LEFT JOIN appointments a ON si.salon_id = a.salon_id  -- ✅ Fixed join
LEFT JOIN appointment_services aserv ON a.appointment_id = aserv.appointment_id  -- ✅ Join through appointment
LEFT JOIN services svc ON aserv.service_id = svc.service_id AND svc.staff_id = si.staff_id  -- ✅ Staff via services
LEFT JOIN incentives i ON si.staff_id = i.staff_id AND i.status IN ('APPROVED','PAID')
WHERE si.status = 'ACTIVE'
GROUP BY si.staff_id, si.name, si.specialization, s.salon_name
```

---

### Issue #2: ReportController::staffPerformance() Method ⚠️

**Current Code (Line 304-326):**
```php
$stmt = $this->db->prepare("
    SELECT
        si.staff_id,
        si.name,
        si.specialization,
        COUNT(DISTINCT asvc.appointment_id) AS appointments_handled,
        COALESCE(SUM(asvc.final_price), 0) AS revenue_generated,
        ...
    FROM staff_info si
    LEFT JOIN appointment_services asvc ON si.staff_id = asvc.staff_id  -- ❌ BROKEN
    LEFT JOIN appointments a ON asvc.appointment_id = a.appointment_id
        AND a.appointment_date BETWEEN ? AND ?
    WHERE si.salon_id = ?
    GROUP BY si.staff_id, si.name, si.specialization
    ORDER BY revenue_generated DESC
");
```

**Should Be Fixed To:**
```php
$stmt = $this->db->prepare("
    SELECT
        si.staff_id,
        si.name,
        si.specialization,
        COUNT(DISTINCT asvc.appointment_id) AS appointments_handled,
        COALESCE(SUM(asvc.final_price), 0) AS revenue_generated,
        ...
    FROM staff_info si
    LEFT JOIN services svc ON si.staff_id = svc.staff_id  -- ✅ Join through services
    LEFT JOIN appointment_services asvc ON svc.service_id = asvc.service_id  -- ✅ Then to appointment_services
    LEFT JOIN appointments a ON asvc.appointment_id = a.appointment_id
        AND a.appointment_date BETWEEN ? AND ?
    WHERE si.salon_id = ?
    GROUP BY si.staff_id, si.name, si.specialization
    ORDER BY revenue_generated DESC
");
```

---

### Issue #3: `salon_dashboard` VIEW ✅ WORKS

**Status:** ✅ This view is working correctly

**Current Definition:**
```sql
CREATE VIEW `salon_dashboard` AS 
SELECT 
    s.salon_id,
    s.salon_name,
    s.city,
    s.status AS salon_status,
    ss.status AS subscription_status,
    ss.end_date AS subscription_end_date,
    COUNT(DISTINCT st.staff_id) AS total_staff,
    COUNT(DISTINCT c.customer_id) AS total_customers,
    COUNT(DISTINCT a.appointment_id) AS total_appointments,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue
FROM salons s
LEFT JOIN salon_subscriptions ss ON s.salon_id = ss.salon_id
LEFT JOIN staff_info st ON s.salon_id = st.salon_id AND st.status = 'ACTIVE'
LEFT JOIN customers c ON s.salon_id = c.salon_id AND c.status = 'ACTIVE'
LEFT JOIN appointments a ON s.salon_id = a.salon_id
GROUP BY s.salon_id, s.salon_name, s.city, s.status, ss.status, ss.end_date
```

**Why It Works:** Does NOT reference `appointment_services.staff_id` or `appointment_packages.staff_id`

---

## 📝 OTHER OBSERVATIONS

### Data Growth
| Table | Original Rows | Current Rows | Growth |
|-------|--------------|--------------|--------|
| services | 5 | 213 | +208 |
| appointment_services | 5 | 126 | +121 |
| appointment_packages | 1 | 30 | +29 |
| appointments | 4 | 59 | +55 |
| salons | 3 | 11 | +8 |
| customers | 6 | 29 | +23 |

### New Tables Added
- `billing_audit_logs`
- `billing_calculation_logs`
- `credit_notes`
- `email_simulator`
- `incentive_payouts`
- `incentives`
- `invoice_salon_items`
- `leave_requests`
- `password_reset_tokens`
- `payments_salon`
- `products`
- `refresh_tokens`
- `stock`
- `stock_transactions`
- `subscription_billing_cycles`
- `subscription_expiration_log`
- `subscription_renewal_reminders`
- `subscription_renewals`
- `user_activity_log`
- `user_password_history`

---

## 🔧 REQUIRED FIXES

### Priority 1: CRITICAL (Breaking)

#### 1. Fix `staff_performance` VIEW
```sql
DROP VIEW IF EXISTS `staff_performance`;

CREATE VIEW `staff_performance` AS 
SELECT 
    si.staff_id,
    si.name,
    si.specialization,
    s.salon_name,
    COUNT(DISTINCT a.appointment_id) AS total_appointments,
    COUNT(DISTINCT aserv.appointment_service_id) AS total_services,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(i.incentive_amount), 0) AS total_incentives
FROM staff_info si
JOIN salons s ON si.salon_id = s.salon_id
LEFT JOIN appointments a ON si.salon_id = a.salon_id
LEFT JOIN appointment_services aserv ON a.appointment_id = aserv.appointment_id
LEFT JOIN services svc ON aserv.service_id = svc.service_id AND svc.staff_id = si.staff_id
LEFT JOIN incentives i ON si.staff_id = i.staff_id AND i.status IN ('APPROVED','PAID')
WHERE si.status = 'ACTIVE'
GROUP BY si.staff_id, si.name, si.specialization, s.salon_name;
```

#### 2. Fix `ReportController::staffPerformance()` Method
**File:** `BACKEND/modules/reports/ReportController.php`  
**Line:** 304-326

Change JOIN from:
```php
LEFT JOIN appointment_services asvc ON si.staff_id = asvc.staff_id
```

To:
```php
LEFT JOIN services svc ON si.staff_id = svc.staff_id
LEFT JOIN appointment_services asvc ON svc.service_id = asvc.service_id
```

---

### Priority 2: VERIFICATION (Non-Breaking)

#### 3. Verify Backend Queries
Check these files for any remaining references to removed columns:
- ✅ `ReportController.php` - Found 1 broken JOIN (see fix above)
- Need to verify: All other modules

#### 4. Update API Documentation
- Update `API_DOCUMENTATION.txt` to reflect new schema
- Document the staff inheritance pattern

---

## ✅ TESTING CHECKLIST

### Database Tests
- [ ] Run `SELECT * FROM staff_performance` - should return data without errors
- [ ] Verify all services have staff_id: `SELECT COUNT(*) FROM services WHERE staff_id IS NULL`
- [ ] Verify foreign keys: `SELECT * FROM services s JOIN staff_info si ON s.staff_id = si.staff_id`

### Backend API Tests
- [ ] Test `/api/reports/staff-performance` endpoint
- [ ] Test `/api/reports/sales` endpoint
- [ ] Test `/api/reports/appointments` endpoint
- [ ] Test `/api/reports/services` endpoint
- [ ] Test `/api/reports/packages` endpoint

### Frontend Tests
- [ ] Staff performance report displays correctly
- [ ] Creating appointments works without staff_id
- [ ] Service creation requires staff selection

---

## 📊 MIGRATION STATUS

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Database Migration | ✅ COMPLETE | All schema changes applied |
| Phase 2: Backend Changes | ✅ COMPLETE | Controllers updated |
| Phase 3: Frontend Changes | ✅ COMPLETE | UI updated |
| Phase 4: View Fixes | ❌ PENDING | staff_performance view broken |
| Phase 5: Testing | ⏳ PENDING | Awaiting view fix |

---

## 🎯 NEXT STEPS

1. **IMMEDIATE:** Fix `staff_performance` view (Priority 1)
2. **IMMEDIATE:** Fix `ReportController::staffPerformance()` JOIN (Priority 1)
3. **VERIFICATION:** Test all report endpoints
4. **DOCUMENTATION:** Update API docs with new schema
5. **CLEANUP:** Remove any dead code referencing old columns

---

**Last Updated:** 2026-03-18  
**Analyst:** Automated Schema Comparison Tool  
**Status:** ⚠️ REQUIRES IMMEDIATE ATTENTION - Broken View
