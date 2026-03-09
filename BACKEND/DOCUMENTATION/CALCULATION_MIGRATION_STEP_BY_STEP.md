# 🎯 COMPREHENSIVE CALCULATION MIGRATION PLAN
## Moving ALL Calculations from Frontend to Backend

**Database Version:** sam-db (MySQL 8.0.40)  
**Date Created:** March 9, 2026  
**Status:** Ready for Implementation  

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Database Schema Reference](#database-schema-reference)
3. [Current Frontend Calculations (BROKEN)](#current-frontend-calculations-broken)
4. [Phase 1: Stock & Dashboard (ZERO RISK)](#phase-1-stock--dashboard-zero-risk)
5. [Phase 2: Package Pricing (LOW RISK)](#phase-2-package-pricing-low-risk)
6. [Phase 3: Payment Calculations (MEDIUM RISK)](#phase-3-payment-calculations-medium-risk)
7. [Phase 4: Appointment Calculations (HIGH RISK)](#phase-4-appointment-calculations-high-risk)
8. [Testing Checklist](#testing-checklist)
9. [Rollback Procedures](#rollback-procedures)

---

## EXECUTIVE SUMMARY

### Current Problem

The frontend JavaScript contains **6 critical calculation functions** that:
- ❌ Give wrong results
- ❌ Can be bypassed/manipulated
- ❌ Don't match backend calculations
- ❌ Create data inconsistency

### Solution

**Move ALL calculations to backend PHP controllers** where they belong:
- ✅ Single source of truth
- ✅ Proper validation
- ✅ Database integrity
- ✅ Audit trail

### Implementation Strategy

**4 Phases, Lowest to Highest Risk:**
1. **Week 1:** Stock status + Dashboard stats (Zero risk)
2. **Week 2:** Package pricing (Low risk)
3. **Week 3:** Payment calculations (Medium risk)
4. **Week 4:** Appointment calculations (High risk - most complex)

---

## DATABASE SCHEMA REFERENCE

### Key Tables for Calculations

#### 1. `appointments` Table
```sql
CREATE TABLE `appointments` (
  `appointment_id` int PRIMARY KEY AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,           -- ⚠️ CALCULATED in backend
  `estimated_duration` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,  -- ⚠️ CALCULATED in backend
  `discount_amount` decimal(10,2) DEFAULT '0.00', -- ⚠️ CALCULATED in backend
  `final_amount` decimal(10,2) NOT NULL,  -- ⚠️ CALCULATED in backend
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','NO_SHOW','CANCELLED'),
  ...
);
```

**Fields Calculated by Backend:**
- `end_time` = `start_time` + `estimated_duration`
- `total_amount` = SUM(service_prices) + SUM(package_prices)
- `discount_amount` = SUM(service_discounts) + SUM(package_discounts) + appointment_discount
- `final_amount` = `total_amount` - `discount_amount`

---

#### 2. `appointment_services` Table
```sql
CREATE TABLE `appointment_services` (
  `appointment_service_id` int PRIMARY KEY AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `service_price` decimal(10,2) NOT NULL,    -- ⚠️ From database OR custom
  `discount_amount` decimal(10,2) DEFAULT '0.00', -- ⚠️ Validated in backend
  `final_price` decimal(10,2) NOT NULL,      -- ⚠️ CALCULATED: price - discount
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED'),
  ...
);
```

**Fields Calculated by Backend:**
- `final_price` = `service_price` - `discount_amount`
- `end_time` = `start_time` + service duration (if provided)

---

#### 3. `appointment_packages` Table
```sql
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int PRIMARY KEY AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `package_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `package_price` decimal(10,2) NOT NULL,    -- ⚠️ From database OR custom
  `discount_amount` decimal(10,2) DEFAULT '0.00', -- ⚠️ Validated in backend
  `final_price` decimal(10,2) NOT NULL,      -- ⚠️ CALCULATED: price - discount
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED'),
  ...
);
```

**Fields Calculated by Backend:**
- `final_price` = `package_price` - `discount_amount`

---

#### 4. `packages` Table
```sql
CREATE TABLE `packages` (
  `package_id` int PRIMARY KEY AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `description` text,
  `total_price` decimal(10,2) NOT NULL,      -- ⚠️ Should match SUM of services
  `validity_days` int NOT NULL,
  ...
);
```

**Business Rule:**
- `total_price` SHOULD equal SUM of associated service prices (but can be customized for discounts)

---

#### 5. `invoice_customer` Table
```sql
CREATE TABLE `invoice_customer` (
  `invoice_customer_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `subtotal_amount` decimal(10,2) NOT NULL,  -- ⚠️ From appointment.final_amount
  `tax_amount` decimal(10,2) DEFAULT '0.00', -- ⚠️ CALCULATED: tax rate * subtotal
  `discount_amount` decimal(10,2) DEFAULT '0.00', -- ⚠️ From appointment or manual
  `total_amount` decimal(10,2) NOT NULL,     -- ⚠️ CALCULATED: subtotal + tax - discount
  `payment_status` enum('UNPAID','PARTIAL','PAID','REFUNDED'), -- ⚠️ CALCULATED from payments
  ...
);
```

**Fields Calculated by Backend:**
- `total_amount` = `subtotal_amount` + `tax_amount` - `discount_amount`
- `payment_status` = 'PAID' if total_paid >= total_amount, 'PARTIAL' if > 0, else 'UNPAID'

---

#### 6. `customer_payments` Table
```sql
CREATE TABLE `customer_payments` (
  `customer_payment_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `invoice_customer_id` bigint NOT NULL,
  `payment_mode` enum('CASH','CARD','UPI','NET_BANKING','WALLET'),
  `transaction_no` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,           -- ⚠️ Validated against outstanding
  `payment_date` datetime NOT NULL,
  `status` enum('SUCCESS','FAILED','PENDING','REFUNDED'),
  ...
);
```

**Validation by Backend:**
- Payment `amount` cannot exceed outstanding balance
- `transaction_no` must be unique

---

#### 7. `stock` Table
```sql
CREATE TABLE `stock` (
  `stock_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `current_quantity` int DEFAULT '0',        -- ⚠️ Updated by transactions
  `minimum_quantity` int DEFAULT '5',
  `maximum_quantity` int DEFAULT '100',
  ...
);
```

**Business Logic:**
- Stock status = 'LOW' if current < minimum
- Stock status = 'OVERSTOCKED' if current > maximum
- Stock status = 'OK' otherwise

---

## CURRENT FRONTEND CALCULATIONS (BROKEN)

### ❌ Calculation #1: Package Auto-Price
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/package.html`  
**Line:** ~220-235  
**Function:** `calculateAutoPrice()`

```javascript
function calculateAutoPrice() {
    let total = 0;
    selectedServiceIds.forEach(serviceId => {
        const service = services.find(s => s.service_id === serviceId);
        if (service) {
            total += parseFloat(service.price || 0);  // ❌ WRONG: Uses cached data
        }
    });
    document.getElementById('fTotalPrice').value = total.toFixed(2); // ❌ No validation
}
```

**Problems:**
1. Uses stale `services` array (may not match database)
2. No validation of price ranges
3. Doesn't account for service status changes
4. Can be manipulated via browser console

**Backend Already Does This:**
- `PackageController.php` lines 85-100
- Fetches fresh prices from database
- Validates price range (0 to 1,000,000)
- Verifies services belong to salon

---

### ❌ Calculation #2: Appointment End Time
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/appointments.html`  
**Line:** ~240  
**Function:** `calculateEndTime()`

```javascript
function calculateEndTime() {
    const startTime = document.getElementById('newTime').value;
    const duration = parseInt(document.getElementById('newDuration').value) || 60;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + duration); // ❌ JS timezone issues
    
    const endHours = String(startDate.getHours()).padStart(2, '0');
    const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
    document.getElementById('newEndTime').value = `${endHours}:${endMinutes}`;
}
```

**Problems:**
1. JavaScript Date has timezone issues
2. Doesn't validate duration ranges
3. Doesn't account for salon operating hours
4. Can produce invalid times (e.g., 25:30:00)

**Backend Already Does This:**
- `AppointmentController.php` line 195
- `endTime = date('H:i:s', strtotime($startTime) + ($estimatedDuration * 60));`
- Proper time arithmetic
- Validates duration (1-1440 minutes)

---

### ❌ Calculation #3: Payment Remaining Amount
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/payments.html`  
**Line:** ~180  
**Function:** `updateRemainingAmount()`

```javascript
function updateRemainingAmount() {
    const amount = parseFloat(document.getElementById('payAmount').value) || 0;
    const remaining = currentOutstandingAmount - amount; // ❌ Uses stale data
    document.getElementById('remainingAmount').textContent = '₹' + Math.max(0, remaining).toFixed(2);
}
```

**Problems:**
1. `currentOutstandingAmount` may be stale
2. Doesn't check for existing payments
3. Doesn't validate against database
4. Can show negative values

**Backend Already Does This:**
- `CustomerInvoiceController.php` lines 380-420
- Fetches fresh payment history
- Calculates: `outstanding = total_amount - SUM(paid_amounts)`
- Validates payment doesn't exceed outstanding

---

### ❌ Calculation #4: Payment Validation
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/payments.html`  
**Line:** ~165  
**Function:** `validatePaymentAmount()`

```javascript
function validatePaymentAmount() {
    const amount = parseFloat(document.getElementById('payAmount').value) || 0;
    if (amount > currentOutstandingAmount) { // ❌ Uses stale data
        errorEl.style.display = 'block';
        return false;
    }
}
```

**Problems:**
1. `currentOutstandingAmount` not refreshed from database
2. Doesn't check for concurrent payments
3. Can be bypassed via console
4. No transaction number uniqueness check

**Backend Already Does This:**
- `CustomerInvoiceController.php` lines 360-380
- Checks: `if ($amount > $outstandingAmount)`
- Validates transaction number uniqueness
- Returns error with exact outstanding amount

---

### ❌ Calculation #5: Dashboard Stats
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/dashboard.html`  
**Line:** ~275  
**Function:** `updateStats()`

```javascript
function updateStats(sales, appts, staff, services, packages, inventory, incentives, staffList) {
    document.getElementById('statRevenue').textContent = '₹' + (sales.data?.summary?.total_revenue || 0);
    document.getElementById('statStaff').textContent = (staffList.data?.items || []).filter(s => s.status === 'ACTIVE').length; // ❌ Filtering in frontend
    document.getElementById('statLowStock').textContent = (inventory.data?.inventory || []).filter(i => i.stock_status === 'LOW').length; // ❌ Should be from backend
}
```

**Problems:**
1. `.filter()` operations are slow on large datasets
2. Inconsistent with backend counts
3. Wastes bandwidth (sending all data, filtering client-side)
4. Race conditions with async loading

**Backend Should Do This:**
- `ReportsController.php` should return pre-counted values
- Example: `active_staff_count: 5` instead of full staff array

---

### ❌ Calculation #6: Stock Status
**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/inventory.html`  
**Line:** Various  
**Logic:** Inline in render function

```javascript
const stockStatus = currentQty < minQty ? 'LOW' : currentQty > maxQty ? 'OVERSTOCKED' : 'OK';
```

**Problems:**
1. Business logic in presentation layer
2. Duplicated logic (backend also calculates)
3. Can show wrong status if thresholds change
4. No central source of truth

**Backend Already Does This:**
- `StockController.php` lines 150-165
- Returns `stock_status` field in API response
- Consistent across all clients

---

## PHASE 1: STOCK & DASHBOARD (ZERO RISK)

### Timeline: Week 1, Days 1-2

### Step 1.1: Remove Stock Status Calculation

**Backend Verification:**
- ✅ `StockController.php` already calculates `stock_status`
- ✅ Returns in `getAllStock()` and `getLowStockAlerts()`

**Frontend Changes:**

**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/inventory.html`

**Find this code (around line 250):**
```javascript
function render() {
    const q = document.getElementById('iSearch').value.toLowerCase();
    let filtered = products.filter(p => {
        const stock = stockLevels.find(s => s.product_id === p.product_id);
        const currentQty = stock?.current_quantity || 0;
        const minQty = stock?.minimum_quantity || 5;
        const maxQty = stock?.maximum_quantity || 100;
        
        // ❌ REMOVE THIS:
        const stockStatus = currentQty < minQty ? 'LOW' : currentQty > maxQty ? 'OVERSTOCKED' : 'OK';
        
        return p.product_name.toLowerCase().includes(q);
    });
    
    // ... render logic using stockStatus
}
```

**Replace with:**
```javascript
function render() {
    const q = document.getElementById('iSearch').value.toLowerCase();
    let filtered = products.filter(p => {
        const stock = stockLevels.find(s => s.product_id === p.product_id);
        
        // ✅ USE BACKEND-CALCULATED STATUS
        const stockStatus = stock?.stock_status || 'OK';
        
        return p.product_name.toLowerCase().includes(q);
    });
    
    // ... render logic using stockStatus (now from backend)
}
```

**Test:**
1. Open inventory page
2. Verify stock status badges show correctly
3. Check low stock items match backend calculation
4. Console should have no errors

---

### Step 1.2: Remove Dashboard Filtering

**Backend Enhancement:**

**File:** `BACKEND/modules/reports/ReportsController.php`

**Add new method:**
```php
/**
 * Get Dashboard Summary (Pre-calculated stats)
 */
public function getDashboardSummary()
{
    $auth = $GLOBALS['auth_user'] ?? null;
    $salonId = $auth['salon_id'] ?? null;
    
    if (!$salonId) {
        Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
    }
    
    // Get counts directly from database
    $stmt = $this->db->prepare("
        SELECT 
            (SELECT COUNT(*) FROM staff_info WHERE salon_id = ? AND status = 'ACTIVE') as active_staff,
            (SELECT COUNT(*) FROM customers WHERE salon_id = ? AND status = 'ACTIVE') as active_customers,
            (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED') as completed_appointments,
            (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED') as total_revenue,
            (SELECT COUNT(*) FROM services WHERE salon_id = ? AND status = 'ACTIVE') as active_services,
            (SELECT COUNT(*) FROM packages WHERE salon_id = ? AND status = 'ACTIVE') as active_packages,
            (SELECT COUNT(*) FROM stock s WHERE s.salon_id = ? AND s.current_quantity < s.minimum_quantity) as low_stock_count
    ");
    
    $stmt->execute([$salonId, $salonId, $salonId, $salonId, $salonId, $salonId, $salonId]);
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::json([
        "status" => "success",
        "data" => [
            "summary" => $summary
        ]
    ]);
}
```

**Add route in `BACKEND/modules/reports/routes.php`:**
```php
$router->get('/dashboard-summary', 'ReportsController@getDashboardSummary');
```

**Frontend Changes:**

**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/dashboard.html`

**Find `loadDashboard()` function and replace with:**
```javascript
async function loadDashboard() {
    document.getElementById('loadingState').style.display = 'flex';
    
    try {
        // ✅ SINGLE API CALL FOR ALL STATS
        const dashboardResult = await apiRequest('/reports/dashboard-summary', { method: 'GET' });
        
        if (dashboardResult.status === 'success') {
            const summary = dashboardResult.data.summary;
            
            // ✅ DISPLAY BACKEND-CALCULATED VALUES
            document.getElementById('statRevenue').textContent = '₹' + parseFloat(summary.total_revenue).toLocaleString('en-IN', {maximumFractionDigits: 0});
            document.getElementById('statAppointments').textContent = summary.completed_appointments || 0;
            document.getElementById('statCustomers').textContent = summary.active_customers || 0;
            document.getElementById('statStaff').textContent = summary.active_staff || 0;
            document.getElementById('statServices').textContent = summary.active_services || 0;
            document.getElementById('statPackages').textContent = summary.active_packages || 0;
            document.getElementById('statLowStock').textContent = summary.low_stock_count || 0;
        }
        
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingState').style.display = 'none';
        showErrorToast('Failed to load dashboard: ' + error.message);
    }
}
```

**Test:**
1. Open dashboard
2. Verify all stats load correctly
3. Compare numbers with database
4. Check page load time (should be faster)

---

## PHASE 2: PACKAGE PRICING (LOW RISK)

### Timeline: Week 1, Days 3-5

### Step 2.1: Remove Package Auto-Price Calculation

**Backend Verification:**
- ✅ `PackageController.php` lines 85-100 already validate price
- ✅ Backend fetches fresh service prices from database

**Frontend Changes:**

**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/package.html`

**Remove these functions entirely:**
```javascript
// ❌ REMOVE THIS ENTIRE FUNCTION
function calculateAutoPrice() {
    let total = 0;
    selectedServiceIds.forEach(serviceId => {
        const service = services.find(s => s.service_id === serviceId);
        if (service) {
            total += parseFloat(service.price || 0);
        }
    });
    const autoDisplay = document.getElementById('autoCalculatedPrice');
    if (autoDisplay) {
        autoDisplay.textContent = '₹' + total.toFixed(2);
    }
    if (!manualPriceOverride && total > 0) {
        document.getElementById('fTotalPrice').value = total.toFixed(2);
    }
}

// ❌ REMOVE THIS FROM toggleService()
function toggleService(checkbox) {
    const serviceId = parseInt(checkbox.value);
    if (checkbox.checked) {
        selectedServiceIds.push(serviceId);
    } else {
        selectedServiceIds = selectedServiceIds.filter(id => id !== serviceId);
    }
    calculateAutoPrice(); // ❌ REMOVE THIS LINE
}
```

**Update `savePackage()` to rely on backend validation:**
```javascript
async function savePackage() {
    const packageData = {
        package_name: document.getElementById('fPName').value,
        description: document.getElementById('fPDesc').value,
        total_price: parseFloat(document.getElementById('fTotalPrice').value), // User can set any price
        validity_days: parseInt(document.getElementById('fValidity').value),
        status: document.getElementById('fPStatus').value,
        service_ids: selectedServiceIds
    };
    
    // ✅ BACKEND WILL VALIDATE
    const result = editId 
        ? await PackagesAPI.update(editId, packageData)
        : await PackagesAPI.create(packageData);
    
    if (result.success) {
        // ✅ SHOW BACKEND-CALCULATED PRICE IN SUCCESS MESSAGE
        showSuccessToast(`Package saved successfully! Total: ₹${packageData.total_price}`);
        loadPackages();
        closeModal();
    } else {
        showErrorToast(result.message || 'Failed to save package');
    }
}
```

**Remove the auto-calculated price display UI:**

**Find this HTML and remove it:**
```html
<!-- ❌ REMOVE THIS ENTIRE DIV -->
<div class="form-group full" style="background:rgba(212, 175, 55, 0.1);padding:0.85rem;border-radius:var(--radius-lg);border:1px solid var(--accent-gold);">
    <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">
            <i class="fas fa-calculator"></i>Auto-calculated from services:
        </div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--accent-gold);" id="autoCalculatedPrice">₹0.00</div>
    </div>
    <small style="color:var(--text-muted);font-size:0.7rem;display:block;margin-top:0.4rem;">
        💡 You can manually adjust the Total Price above to offer discounts or increase profit
    </small>
</div>
```

**Test:**
1. Create new package
2. Select multiple services
3. Set any total price (can be different from sum of services)
4. Save - backend validates price range (0 to 1,000,000)
5. Verify package saves correctly

---

## PHASE 3: PAYMENT CALCULATIONS (MEDIUM RISK)

### Timeline: Week 2, Days 1-3

### Step 3.1: Remove Payment Remaining Calculation

**Backend Verification:**
- ✅ `CustomerInvoiceController.php` lines 380-420 calculate outstanding
- ✅ Returns payment calculation results in response

**Frontend Changes:**

**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/payments.html`

**Remove these functions:**
```javascript
// ❌ REMOVE THIS FUNCTION
function updateRemainingAmount() {
    const amount = parseFloat(document.getElementById('payAmount').value) || 0;
    const remaining = currentOutstandingAmount - amount;
    document.getElementById('remainingAmount').textContent = '₹' + Math.max(0, remaining).toFixed(2);
}

// ❌ REMOVE THIS FUNCTION
function validatePaymentAmount() {
    const amount = parseFloat(document.getElementById('payAmount').value) || 0;
    const errorEl = document.getElementById('paymentAmountError');
    
    if (amount > currentOutstandingAmount) {
        errorEl.style.display = 'block';
        return false;
    } else {
        errorEl.style.display = 'none';
        updateRemainingAmount(); // ❌ Also remove this call
        return true;
    }
}
```

**Update `recordPayment()` to use backend response:**
```javascript
async function recordPayment() {
    const paymentData = {
        payment_mode: document.getElementById('payMode').value,
        amount: parseFloat(document.getElementById('payAmount').value),
        payment_date: document.getElementById('payDate').value,
        transaction_no: document.getElementById('payTransactionNo').value,
        remarks: document.getElementById('payRemarks').value
    };
    
    // ✅ SEND TO BACKEND, LET IT CALCULATE
    const result = await CustomerInvoicePaymentsAPI.create(currentInvoiceId, paymentData);
    
    if (result.success) {
        // ✅ SHOW BACKEND-CALCULATED VALUES
        const paymentInfo = result.data;
        showSuccessToast(`Payment recorded! 
            Amount: ₹${paymentInfo.amount_paid}
            Total Paid: ₹${paymentInfo.total_paid}
            Outstanding: ₹${paymentInfo.outstanding}
            Status: ${paymentInfo.payment_status}`);
        
        closeModal('paymentModal');
        loadInvoices();
    } else {
        // ✅ BACKEND RETURNS EXACT ERROR (e.g., "Exceeds outstanding by ₹500")
        showErrorToast(result.message || 'Failed to record payment');
    }
}
```

**Update modal open to fetch fresh data:**
```javascript
async function openPaymentModal(invoiceId) {
    currentInvoiceId = invoiceId;
    
    // ✅ FETCH FRESH INVOICE DATA FROM BACKEND
    const invoiceResult = await InvoicesAPI.view(invoiceId);
    if (invoiceResult.success) {
        const invoice = invoiceResult.data;
        const totalPaid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        currentOutstandingAmount = invoice.total_amount - totalPaid;
        currentInvoiceTotal = invoice.total_amount;
        
        // Display invoice summary
        document.getElementById('paymentInvoiceAmount').textContent = '₹' + invoice.total_amount.toFixed(2);
        document.getElementById('paymentOutstanding').textContent = '₹' + currentOutstandingAmount.toFixed(2);
        document.getElementById('remainingAmount').textContent = '₹' + currentOutstandingAmount.toFixed(2);
    }
    
    document.getElementById('paymentModal').classList.add('open');
}
```

**Test:**
1. Open invoice with partial payments
2. Verify outstanding amount matches database
3. Try to pay more than outstanding - backend should reject
4. Record valid payment
5. Verify success message shows correct calculations

---

## PHASE 4: APPOINTMENT CALCULATIONS (HIGH RISK)

### Timeline: Week 2, Days 4-7

### Step 4.1: Remove End Time Calculation

**Backend Verification:**
- ✅ `AppointmentController.php` line 195 calculates end time
- ✅ Returns calculated end_time in response

**Frontend Changes:**

**File:** `FRONTED/ADMIN_STAFF/New folder (4)/admin/appointments.html`

**Remove this function:**
```javascript
// ❌ REMOVE THIS FUNCTION
function calculateEndTime() {
    const startTime = document.getElementById('newTime').value;
    const duration = parseInt(document.getElementById('newDuration').value) || 60;
    
    if (startTime && duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes);
        startDate.setMinutes(startDate.getMinutes() + duration);
        
        const endHours = String(startDate.getHours()).padStart(2, '0');
        const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
        document.getElementById('newEndTime').value = `${endHours}:${endMinutes}`;
    }
}
```

**Update `createAppointment()` to use backend response:**
```javascript
async function createAppointment() {
    const appointmentData = {
        customer_id: parseInt(document.getElementById('newCustomerId').value),
        appointment_date: document.getElementById('newDate').value,
        start_time: document.getElementById('newTime').value + ':00',
        estimated_duration: parseInt(document.getElementById('newDuration').value) || 60,
        services: selectedServices, // Array of {service_id, staff_id, price, discount_amount}
        packages: selectedPackages, // Array of {package_id, staff_id, price, discount_amount}
        discount_amount: parseFloat(document.getElementById('newDiscount').value) || 0,
        notes: document.getElementById('newNotes').value
    };
    
    // ✅ BACKEND CALCULATES: end_time, total_amount, discount_amount, final_amount
    const result = await AppointmentsAPI.create(appointmentData);
    
    if (result.success) {
        // ✅ SHOW BACKEND-CALCULATED VALUES
        const appointment = result.data;
        showSuccessToast(`Appointment created! 
            Date: ${appointment.appointment_date}
            Time: ${appointment.start_time} - ${appointment.end_time}
            Total: ₹${appointment.total_amount}
            Final: ₹${appointment.final_amount}`);
        
        closeModal('createModal');
        loadAppointments();
    } else {
        showErrorToast(result.message || 'Failed to create appointment');
    }
}
```

**Test:**
1. Create appointment with multiple services
2. Don't fill end_time field (leave it blank)
3. Backend calculates and returns end_time
4. Verify appointment shows correct time range
5. Verify total/final amounts match database

---

## TESTING CHECKLIST

### Phase 1 Testing (Stock & Dashboard)

- [ ] Stock status badges show correct colors (LOW/OK/OVERSTOCKED)
- [ ] Low stock count matches actual low stock items
- [ ] Dashboard stats load without errors
- [ ] Revenue matches completed appointments sum
- [ ] Staff count matches active staff in database
- [ ] No JavaScript console errors
- [ ] Page loads faster than before

### Phase 2 Testing (Packages)

- [ ] Can create package with custom price
- [ ] Backend validates price range (0 to 1,000,000)
- [ ] Package saves with correct service associations
- [ ] Edit package updates correctly
- [ ] No auto-calculation UI elements visible

### Phase 3 Testing (Payments)

- [ ] Outstanding amount matches database calculation
- [ ] Cannot pay more than outstanding (backend rejects)
- [ ] Success message shows correct payment breakdown
- [ ] Payment status updates correctly (UNPAID → PARTIAL → PAID)
- [ ] Transaction number uniqueness enforced

### Phase 4 Testing (Appointments)

- [ ] End time calculated correctly
- [ ] Total amount = SUM(service_prices) + SUM(package_prices)
- [ ] Discount applied correctly
- [ ] Final amount = Total - Discount
- [ ] All amounts match database

---

## ROLLBACK PROCEDURES

### If Phase 1 Fails:

**Revert Stock Status:**
```bash
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/admin/inventory.html
```

**Revert Dashboard:**
```bash
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/admin/dashboard.html
git checkout HEAD -- BACKEND/modules/reports/ReportsController.php
git checkout HEAD -- BACKEND/modules/reports/routes.php
```

### If Phase 2 Fails:

```bash
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/admin/package.html
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/js/packages.js
```

### If Phase 3 Fails:

```bash
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/admin/payments.html
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/js/invoices-payments-api.js
```

### If Phase 4 Fails:

```bash
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/admin/appointments.html
git checkout HEAD -- FRONTED/ADMIN_STAFF/New\ folder\ \(4\)/js/appointments.js
```

---

## SUCCESS CRITERIA

### Before Migration:
- ❌ 6 calculation functions in JavaScript
- ❌ Inconsistent results between frontend/backend
- ❌ Can be manipulated via browser console
- ❌ No audit trail for calculations

### After Migration:
- ✅ 0 calculation functions in JavaScript (only display formatting)
- ✅ Single source of truth (backend)
- ✅ Cannot be manipulated (all validation server-side)
- ✅ Full audit trail in PHP controllers
- ✅ Faster page loads (less client-side processing)
- ✅ Consistent data across all clients

---

## FINAL NOTES

### What Stays in Frontend (OK):
- Currency symbol display (`₹`)
- Number formatting (`toLocaleString()`)
- Date display formatting
- Chart rendering (Chart.js)
- Search/filter UI logic (not business logic)

### What Moves to Backend (REQUIRED):
- All price calculations
- All tax calculations
- All discount calculations
- All time/date arithmetic
- All status determinations
- All aggregations (SUM, COUNT, AVG)

### Golden Rule:
> **Frontend asks "What to display?"**  
> **Backend answers with pre-calculated values**  
> **Frontend never asks "How to calculate?"**

---

**END OF PLAN**
