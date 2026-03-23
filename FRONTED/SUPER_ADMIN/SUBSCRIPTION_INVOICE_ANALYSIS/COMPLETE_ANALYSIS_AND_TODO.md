# Subscription & Invoice System - Complete Analysis & Implementation Plan

**Document Created:** 2026-03-23  
**Last Updated:** 2026-03-23  
**Status:** Analysis Complete - Ready for Implementation  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Analysis](#database-schema-analysis)
3. [Payment Plans Structure](#payment-plans-structure)
4. [Modal-by-Modal Analysis](#modal-by-modal-analysis)
5. [Complete User Flow](#complete-user-flow)
6. [API Requirements](#api-requirements)
7. [Database Changes Required](#database-changes-required)
8. [Implementation Checklist](#implementation-checklist)
9. [Validation Rules](#validation-rules)
10. [Progress Tracker](#progress-tracker)

---

## Executive Summary

### Current System State

The Super Admin subscription and invoice system has the following components:

**Subscription Plans:** 3 payment plan types supported in database:
- `flat` - Fixed monthly amount
- `per-appointments` - Fixed rate per appointment
- `Percentage-per-appointments` - Percentage of salon revenue

**Salon Subscriptions:** Assignment and management of subscriptions to salons

**Invoicing:** Generate invoices from calculated billing, record payments, track payment status

**Current Issues Identified:**
1. ❌ Create Plan modal has all 3 plan types but validation incomplete
2. ❌ Billing month selector is OUTSIDE the billing modal (UX issue)
3. ❌ No proration for flat-rate plans when starting mid-month
4. ❌ No "Renew Subscription" button
5. ❌ Invoice existence check is on button, not inside Create Invoice modal
6. ❌ Billing calculation doesn't properly fetch salon appointment data
7. ❌ No proper validation for duplicate invoices
8. ❌ Partial/Paid status calculation needs verification

---

## Database Schema Analysis

### Key Tables

#### `subscription_plans`
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
)
```

**Fields Used:**
- `plan_type`: Determines which pricing field to use
- `flat_price`: Used when plan_type = 'flat'
- `rate_per_appointment`: Used when plan_type = 'per-appointments' (DB column name)
- `percentage_rate`: Used when plan_type = 'Percentage-per-appointments' (DB column name)

**⚠️ COLUMN NAME MISMATCH ALERT:**
- Database: `rate_per_appointment`, `percentage_rate`
- Backend API expects: `per_appointments_price`, `percentage_per_appointment`
- Frontend sends: `per_appointments_price`, `percentage_per_appointment`

#### `salon_subscriptions`
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
  PRIMARY KEY (`subscription_id`)
)
```

#### `subscription_billing_cycles`
```sql
CREATE TABLE `subscription_billing_cycles` (
  `cycle_id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `billing_month` varchar(7) NOT NULL,  -- YYYY-MM format
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
)
```

**✅ This table exists but is EMPTY (0 rows)** - Can be used for tracking billing cycles

#### `invoice_salon`
```sql
CREATE TABLE `invoice_salon` (
  `invoice_salon_id` bigint NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `subscription_id` int DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('UNPAID','PARTIAL','PAID','REFUNDED') DEFAULT 'UNPAID',
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `billing_month` varchar(7) DEFAULT NULL,  -- YYYY-MM format
  `notes` text,  -- JSON storage for calculation breakdown
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_salon_id`)
)
```

#### `payments_salon`
```sql
CREATE TABLE `payments_salon` (
  `payment_salon_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_salon_id` bigint NOT NULL,
  `payment_mode` enum('CASH','CARD','UPI','NET_BANKING','WALLET','BANK','CHEQUE') NOT NULL,
  `transaction_no` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_salon_id`)
)
```

#### `subscription_renewals`
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
)
```

**✅ Has 1 row** - Renewal tracking exists!

---

## Payment Plans Structure

### Plan Type 1: FLAT (Fixed Monthly Amount)

**Database Fields:**
- `plan_type` = 'flat'
- `flat_price` = Fixed amount (e.g., 50000)

**Billing Calculation:**
```
Base Amount = flat_price
Per Appointment Amount = 0
Percentage Amount = 0
Subtotal = Base Amount
Tax (18% GST) = Subtotal × 0.18
Total = Subtotal + Tax
```

**Proration Required:** ⚠️ **NOT IMPLEMENTED**
- When subscription starts mid-month, charge only for remaining days
- Formula: `(flat_price / days_in_month) × remaining_days`
- Example: Plan starts on 15th of 30-day month
  - Remaining days = 16 (including 15th)
  - Prorated amount = (50000 / 30) × 16 = ₹26,666.67

### Plan Type 2: PER-APPOINTMENT (Fixed Rate Per Appointment)

**Database Fields:**
- `plan_type` = 'per-appointments'
- `rate_per_appointment` = Rate per appointment (e.g., 50)

**Billing Calculation:**
```
Base Amount = 0
Per Appointment Amount = completed_appointments × rate_per_appointment
Percentage Amount = 0
Subtotal = Per Appointment Amount
Tax (18% GST) = Subtotal × 0.18
Total = Subtotal + Tax
```

**Data Source:**
- Fetch completed appointments from `appointments` table
- Filter by: `salon_id`, `billing_month`, `status = 'COMPLETED'`

### Plan Type 3: PERCENTAGE-PER-APPOINTMENT (Revenue Share)

**Database Fields:**
- `plan_type` = 'Percentage-per-appointments'
- `percentage_rate` = Percentage (e.g., 10.00 for 10%)

**Billing Calculation:**
```
Base Amount = 0
Per Appointment Amount = 0
Percentage Amount = total_saloon_revenue × (percentage_rate / 100)
Subtotal = Percentage Amount
Tax (18% GST) = Subtotal × 0.18
Total = Subtotal + Tax
```

**Data Source:**
- Fetch completed appointments from `appointments` table
- Sum `final_amount` for all completed appointments in billing month

---

## Modal-by-Modal Analysis

### 1. Create Subscription Plan Modal

**Location:** `sa-subscription.html` lines 1449-1520  
**JS Handler:** `sa-subscription.js` lines 797-867

**Current HTML Structure:**
```html
<form id="planForm">
    <div class="form-group">
        <label>Plan Name *</label>
        <input type="text" id="planName" required>
    </div>
    
    <div class="form-row">
        <div class="form-group">
            <label>Duration (Days) *</label>
            <input type="number" id="planDuration" min="1" required>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="planStatus">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
            </select>
        </div>
    </div>
    
    <div class="form-group">
        <label>Plan Type *</label>
        <select id="planType" required>
            <option value="">Select plan type...</option>
            <option value="flat">Flat Price</option>
            <option value="per-appointments">Per Appointment Price</option>
            <option value="Percentage-per-appointments">Percentage Per Appointment</option>
        </select>
    </div>
    
    <!-- Conditional fields based on plan type -->
    <div id="flatPriceField" style="display: none;">
        <label>Flat Price (₹) *</label>
        <input type="number" id="flatPrice" min="0" step="0.01">
    </div>
    
    <div id="perAppointmentPriceField" style="display: none;">
        <label>Price Per Appointment (₹) *</label>
        <input type="number" id="perAppointmentPrice" min="0" step="0.01">
    </div>
    
    <div id="percentagePerAppointmentField" style="display: none;">
        <label>Percentage Per Appointment (%) *</label>
        <input type="number" id="percentagePerAppointment" min="0" max="100" step="0.01">
    </div>
</form>
```

**Current Validation (JS lines 817-837):**
```javascript
if (planTypeValue === 'flat') {
    const flatPrice = parseFloat(document.getElementById('flatPrice').value);
    if (isNaN(flatPrice) || flatPrice <= 0) {
        showErrorToast('Please enter a valid flat price (must be greater than 0)');
        return;
    }
} else if (planTypeValue === 'per-appointments') {
    const perAppointmentPrice = parseFloat(document.getElementById('perAppointmentPrice').value);
    if (isNaN(perAppointmentPrice) || perAppointmentPrice <= 0) {
        showErrorToast('Please enter a valid price per appointment (must be greater than 0)');
        return;
    }
} else if (planTypeValue === 'Percentage-per-appointments') {
    const percentage = parseFloat(document.getElementById('percentagePerAppointment').value);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        showErrorToast('Please enter a valid percentage (1-100)');
        return;
    }
}
```

**✅ What's Working:**
- All 3 plan type fields exist
- Conditional field display works
- Basic validation exists

**❌ Issues:**
1. Field `required` attribute not dynamically set
2. No visual feedback when switching plan types
3. No help text explaining each plan type
4. Backend column name mismatch not handled

**📋 TODO:**
- [ ] Add dynamic `required` attribute based on selected plan type
- [ ] Add help text/tooltips for each plan type
- [ ] Add visual indicator showing which fields are active
- [ ] Fix backend to handle column name mapping properly
- [ ] Add minimum price validation (e.g., min ₹100 for flat plans)

---

### 2. Assign Subscription Modal

**Location:** `sa-subscription.html` lines 1522-1570  
**JS Handler:** `sa-subscription.js` lines 661-677, 878-897

**Current HTML Structure:**
```html
<form id="assignForm">
    <div class="form-group">
        <label>Select Salon *</label>
        <select id="assignSalon" required>
            <option value="">Choose a salon...</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Select Plan *</label>
        <select id="assignPlan" required>
            <option value="">Choose a plan...</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Start Date *</label>
        <input type="date" id="assignStartDate" required>
    </div>
    
    <div class="form-group">
        <label>Status</label>
        <select id="assignStatus">
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
        </select>
    </div>
    
    <div class="price-summary" id="subscriptionSummary" style="display: none;">
        <div class="price-summary-row">
            <span>Subscription End Date</span>
            <span id="endDateDisplay">-</span>
        </div>
    </div>
</form>
```

**✅ What's Working:**
- Salon selection dropdown
- Plan selection dropdown
- Start date picker
- End date auto-calculation display
- Status selection

**❌ Issues:**
1. No validation for duplicate active subscriptions
2. No warning if start date is in the past
3. No display of plan details before assigning
4. Backend auto-creates invoice (may not be desired)

**📋 TODO:**
- [ ] Add check for existing active subscriptions (disable button if exists)
- [ ] Add warning if start date is in past
- [ ] Show plan summary (price, duration, type) when plan is selected
- [ ] Add option: "Create invoice now" checkbox (default: unchecked)
- [ ] Add validation: start date cannot be more than 30 days in future

---

### 3. Calculate Billing Modal

**⚠️ CRITICAL ISSUE:** This modal doesn't exist as a separate modal!

**Current Flow:**
1. Month selector is OUTSIDE the billing section (line 1413 in HTML)
2. Clicking "Calculate Billing" button opens `billingPreviewModal`
3. No separate "Calculate Billing" modal with month selection inside

**Current HTML (Month Selector - OUTSIDE modal):**
```html
<div class="table-filters">
    <div class="billing-month-selector">
        <label for="billingMonthSelect">Billing Month:</label>
        <select id="billingMonthSelect" class="form-select" style="width: 180px;">
            <!-- Populated by JavaScript -->
        </select>
    </div>
    <!-- ... other filters ... -->
</div>
```

**Current Billing Preview Modal (lines 1707-1727):**
```html
<div class="modal-overlay" id="billingPreviewModal">
    <div class="modal modal-xl">
        <div class="modal-header">
            <h3>Subscription Billing Preview</h3>
            <button class="modal-close" onclick="closeBillingPreview()">&times;</button>
        </div>
        <div class="modal-body">
            <div id="billingPreviewContent"></div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeBillingPreview()">Cancel</button>
            <button class="btn btn-primary" onclick="generateInvoiceFromPreview()">
                <i class="fa-solid fa-file-invoice"></i> Generate Invoice
            </button>
        </div>
    </div>
</div>
```

**❌ Issues:**
1. Month selector is outside modal (UX issue - user selects month, then clicks row, then sees calculation)
2. No invoice existence check inside the modal
3. No proration calculation for flat plans
4. Appointment data fetch may not work correctly

**📋 TODO:**
- [ ] **MOVE month selector INSIDE billing modal**
- [ ] Add invoice existence check INSIDE modal (disable "Generate Invoice" if exists)
- [ ] Add proration calculation for flat plans
- [ ] Add appointment data verification step
- [ ] Show "Invoice Already Exists" warning with invoice number if exists
- [ ] Add "View Existing Invoice" button when invoice exists
- [ ] Add "Recalculate" button for admin override

---

### 4. Create Invoice Modal (Inside Generate Invoice Modal)

**Location:** `sa-invoices.html` lines 574-665

**Current Structure:**
```html
<form id="invoiceForm">
    <div class="form-group">
        <label>Select Salon *</label>
        <select id="invoiceSalonId" required onchange="loadSalonSubscriptions()">
            <option value="">Choose a salon...</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Select Subscription *</label>
        <div style="display: flex; gap: 12px;">
            <select id="invoiceSubscriptionId" required onchange="loadSubscriptionDetails()" style="flex: 1;">
                <option value="">Choose a subscription...</option>
            </select>
            <button type="button" class="btn btn-primary" onclick="calculateBillingFromSubscription()" id="calculateBillingBtn" style="display: none;">
                <i class="fa-solid fa-calculator"></i> Calculate
            </button>
        </div>
    </div>
    
    <div class="form-group">
        <label>Billing Month *</label>
        <input type="month" id="billingMonth" required onchange="calculateBillingFromSubscription()">
    </div>
    
    <div id="billingCalculationSection" style="display: none;">
        <!-- Calculation display -->
    </div>
    
    <div class="form-group">
        <label>Amount (₹)</label>
        <input type="number" id="invoiceAmount">
    </div>
    
    <div class="form-row">
        <div class="form-group">
            <label>Tax Amount (₹)</label>
            <input type="number" id="invoiceTaxAmount">
        </div>
        <div class="form-group">
            <label>Due Date *</label>
            <input type="date" id="invoiceDueDate" required>
        </div>
    </div>
    
    <div class="form-group">
        <label>Notes</label>
        <textarea id="invoiceNotes" rows="3"></textarea>
    </div>
    
    <div class="price-display" id="invoiceTotalDisplay">
        <div class="price-display-label">Total Invoice Amount</div>
        <div class="price-display-value">₹<span id="invoiceTotalValue">0</span></div>
    </div>
</form>
```

**❌ Issues:**
1. Calculate button enabled even if invoice exists
2. No validation for duplicate invoices
3. Manual amount entry allowed (can mismatch with calculation)
4. No proration for flat plans

**📋 TODO:**
- [ ] Add invoice existence check on subscription + billing month selection
- [ ] Disable "Generate Invoice" button if invoice exists
- [ ] Show "Invoice Already Exists" message with invoice number
- [ ] Add "View Invoice" button when invoice exists
- [ ] Lock amount fields after calculation (or add "Override" checkbox)
- [ ] Add proration calculation
- [ ] Add appointment count verification

---

### 5. Renew Subscription Button (MISSING)

**❌ DOESN'T EXIST** - Need to add to subscription table actions

**Required HTML (to add in subscriptions table):**
```html
<button class="btn-icon btn-renew" data-subscription-id="${sub.subscription_id}" title="Renew Subscription" style="background: var(--success-bg); color: var(--success);">
    <i class="fa-solid fa-rotate-right"></i>
</button>
```

**Required Modal:**
```html
<div class="modal-overlay" id="renewModal">
    <div class="modal">
        <div class="modal-header">
            <h3>Renew Subscription</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="renewForm">
                <div class="form-group">
                    <label>Current End Date</label>
                    <input type="text" id="renewCurrentEndDate" disabled>
                </div>
                
                <div class="form-group">
                    <label>Renewal Type *</label>
                    <select id="renewalType" required>
                        <option value="MANUAL">Manual Renewal</option>
                        <option value="AUTO">Auto Renewal</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Extend By (Days) *</label>
                    <input type="number" id="renewalDays" min="1" required>
                    <div class="help-text">Use plan duration or custom days</div>
                </div>
                
                <div class="form-group">
                    <label>New End Date (Preview)</label>
                    <input type="text" id="renewNewEndDate" disabled>
                </div>
                
                <div class="form-group">
                    <label>Change Plan?</label>
                    <select id="renewPlanChange">
                        <option value="0">Keep Current Plan</option>
                        <!-- Other plans -->
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="renewNotes" rows="2"></textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary">Cancel</button>
            <button type="submit" form="renewForm" class="btn btn-primary">
                <i class="fa-solid fa-rotate-right"></i> Renew Subscription
            </button>
        </div>
    </div>
</div>
```

**📋 TODO:**
- [ ] Add renew button to subscription table actions
- [ ] Create renew subscription modal
- [ ] Add backend API endpoint: `POST /super-admin/subscriptions/{id}/renew`
- [ ] Log renewal in `subscription_renewals` table
- [ ] Update subscription end_date
- [ ] Optionally create new invoice for renewal period

---

### 6. View Invoice Modal

**Location:** `sa-invoices.html` lines 723-835  
**JS Handler:** `sa-invoices.js` lines 309-416

**✅ What's Working:**
- Invoice preview with header
- Bill to and invoice details sections
- Items table
- Totals breakdown
- Payment history display
- Record payment section

**❌ Issues:**
1. Payment status calculation may not update correctly
2. Partial payment handling needs verification
3. No print functionality implemented

**📋 TODO:**
- [ ] Verify payment status calculation (UNPAID → PARTIAL → PAID)
- [ ] Add print functionality
- [ ] Add download PDF functionality
- [ ] Add email invoice functionality
- [ ] Add refund functionality

---

### 7. Record Payment Modal

**Location:** `sa-invoices.html` lines 757-796  
**JS Handler:** `sa-invoices.js` lines 418-436

**Current Structure:**
```html
<div class="payment-form-box" id="recordPaymentSection" style="display: none;">
    <div class="payment-form-title">
        <i class="fa-solid fa-credit-card"></i>
        Record Payment
    </div>
    <div class="outstanding-amount">
        <div class="outstanding-label">Outstanding Amount</div>
        <div class="outstanding-value">₹<span id="outstandingAmount">0</span></div>
    </div>
    <form id="paymentForm">
        <input type="hidden" id="paymentInvoiceSalonId">
        <div class="form-row">
            <div class="form-group">
                <label>Payment Amount (₹) *</label>
                <input type="number" id="paymentAmount" required>
            </div>
            <div class="form-group">
                <label>Payment Date *</label>
                <input type="date" id="paymentDate" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Payment Mode *</label>
                <select id="paymentMode" required>
                    <option value="">Select payment mode...</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                </select>
            </div>
            <div class="form-group">
                <label>Transaction Reference</label>
                <input type="text" id="transactionNo" placeholder="e.g. TXN123456">
            </div>
        </div>
        <div class="form-group">
            <label>Remarks</label>
            <textarea id="paymentRemarks" rows="2"></textarea>
        </div>
    </form>
</div>
```

**✅ What's Working:**
- Outstanding amount display
- Payment mode selection
- Transaction reference
- Payment date

**❌ Issues:**
1. No validation for payment amount > outstanding
2. No warning for overpayment
3. Payment status update logic needs verification

**📋 TODO:**
- [ ] Add validation: payment amount <= outstanding amount
- [ ] Add warning if payment amount > outstanding
- [ ] Verify payment status update logic:
  - If payment == total → PAID
  - If payment > 0 and payment < total → PARTIAL
  - If payment == 0 → UNPAID
- [ ] Add payment receipt generation
- [ ] Add payment history refresh after payment

---

## Complete User Flow

### Flow 1: Create Subscription Plan → Assign to Salon → Generate Invoice

```
1. Super Admin creates subscription plan
   ├─ Select plan type (flat/per-appointment/percentage)
   ├─ Enter plan details (name, duration, price)
   ├─ Validate price based on plan type
   └─ Save plan (POST /subscription-plans)

2. Super Admin assigns plan to salon
   ├─ Select salon from dropdown
   ├─ Select plan from dropdown
   ├─ Select start date
   ├─ View auto-calculated end date
   ├─ (Optional) Check "Create invoice now"
   └─ Save subscription (POST /super-admin/salons/{id}/subscriptions)

3. System auto-creates invoice (if enabled)
   ├─ Generate invoice number
   ├─ Calculate amount based on plan
   ├─ Apply proration if mid-month start (⚠️ NOT IMPLEMENTED)
   └─ Create invoice record (INSERT invoice_salon)

4. Super Admin generates invoice manually (if not auto-created)
   ├─ Go to Invoices page
   ├─ Click "Generate Invoice"
   ├─ Select salon
   ├─ Select subscription
   ├─ Select billing month
   ├─ Click "Calculate" (fetches appointment data)
   ├─ Review calculation breakdown
   ├─ (System checks for existing invoice)
   ├─ Click "Generate Invoice"
   └─ Create invoice (POST /super-admin/subscriptions/{id}/generate-invoice)
```

### Flow 2: Monthly Billing Calculation

```
1. Super Admin selects billing month
   ├─ Month selector shows last 12 months + current
   └─ Default: current month

2. System fetches appointment data
   ├─ Filter by salon_id (from subscription)
   ├─ Filter by billing_month
   ├─ Filter by status = 'COMPLETED'
   └─ Calculate total appointments and revenue

3. System calculates billing based on plan type
   ├─ Flat: Use flat_price (apply proration if needed)
   ├─ Per-appointment: Count × rate
   └─ Percentage: Revenue × (percentage / 100)

4. System adds tax (18% GST)
   └─ Total = Subtotal + (Subtotal × 0.18)

5. System checks for existing invoice
   ├─ Query: SELECT FROM invoice_salon WHERE subscription_id = ? AND billing_month = ?
   ├─ If exists: Show warning, disable "Generate Invoice"
   └─ If not exists: Enable "Generate Invoice"

6. Super Admin generates invoice
   └─ Invoice created with calculated amounts
```

### Flow 3: Subscription Renewal

```
1. Super Admin clicks "Renew" button on subscription
   └─ Opens renewal modal

2. System shows current subscription details
   ├─ Current end date
   ├─ Plan name and type
   └─ Salon name

3. Super Admin selects renewal options
   ├─ Renewal type (Manual/Auto)
   ├─ Extension days (default: plan duration)
   ├─ (Optional) Change plan
   └─ Add notes

4. System calculates new end date
   └─ New end date = current end date + extension days

5. Super Admin confirms renewal
   └─ POST /super-admin/subscriptions/{id}/renew

6. System updates subscription
   ├─ Update end_date in salon_subscriptions
   ├─ Log renewal in subscription_renewals
   └─ (Optional) Create new invoice for renewal period
```

### Flow 4: Invoice Payment

```
1. Super Admin views invoice
   ├─ See total amount
   ├─ See outstanding amount
   └─ See payment history

2. Super Admin clicks "Record Payment"
   └─ Payment form appears

3. Super Admin enters payment details
   ├─ Payment amount (validated against outstanding)
   ├─ Payment date
   ├─ Payment mode
   ├─ Transaction reference
   └─ Remarks

4. System processes payment
   ├─ Create payment record (INSERT payments_salon)
   ├─ Update invoice payment_status:
   │  ├─ If payment == total → PAID
   │  └─ If payment < total → PARTIAL
   └─ Refresh payment history

5. System generates receipt
   └─ (Optional) Print/download receipt
```

---

## API Requirements

### Existing APIs (Verified)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/subscription-plans` | List all plans | ✅ Implemented |
| POST | `/subscription-plans` | Create plan | ✅ Implemented |
| PUT | `/subscription-plans/{id}` | Update plan | ✅ Implemented |
| PATCH | `/subscription-plans/{id}/status` | Toggle status | ✅ Implemented |
| GET | `/super-admin/subscriptions` | List all subscriptions | ✅ Implemented |
| POST | `/super-admin/salons/{id}/subscriptions` | Assign subscription | ✅ Implemented |
| PUT | `/super-admin/subscriptions/{id}` | Update subscription | ✅ Implemented |
| PATCH | `/super-admin/subscriptions/{id}/cancel` | Cancel subscription | ✅ Implemented |
| POST | `/super-admin/subscriptions/{id}/generate-invoice` | Generate invoice | ✅ Implemented |
| GET | `/super-admin/invoices/salon` | List invoices | ✅ Implemented |
| POST | `/super-admin/invoices/salon/{id}/payments` | Record payment | ✅ Implemented |

### Missing APIs (Need Implementation)

| Method | Endpoint | Purpose | Priority |
|--------|----------|---------|----------|
| POST | `/super-admin/subscriptions/{id}/renew` | Renew subscription | 🔴 HIGH |
| GET | `/super-admin/subscriptions/{id}/billing-cycle` | Get billing cycle | 🟡 MEDIUM |
| GET | `/appointments/salon/{id}/completed` | Get completed appointments | 🟡 MEDIUM |
| PATCH | `/super-admin/invoices/salon/{id}/refund` | Refund invoice | 🟢 LOW |

### API Implementation Specifications

#### POST `/super-admin/subscriptions/{id}/renew`

**Request:**
```json
{
    "renewal_type": "MANUAL",
    "extension_days": 30,
    "plan_id": null,
    "notes": "Renewed for another month"
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "subscription_id": 58,
        "previous_end_date": "2026-04-15",
        "new_end_date": "2026-05-15",
        "renewal_id": 5,
        "invoice_created": false
    }
}
```

**Backend Logic:**
1. Verify subscription exists and is ACTIVE
2. Get current end_date
3. Calculate new_end_date = current_end_date + extension_days
4. Update salon_subscriptions.end_date
5. Insert into subscription_renewals table
6. (Optional) Create invoice if requested

---

## Database Changes Required

### 1. Column Name Standardization

**Current Issue:**
- Database: `rate_per_appointment`, `percentage_rate`
- API/Code: `per_appointments_price`, `percentage_per_appointment`

**Solution:** Add alias mapping in SubscriptionPlanController.php

```php
// In SubscriptionPlanController.php::index() and ::show()
$plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Map database columns to API field names
$plans = array_map(function($plan) {
    $plan['per_appointments_price'] = $plan['rate_per_appointment'];
    $plan['percentage_per_appointment'] = $plan['percentage_rate'];
    return $plan;
}, $plans);
```

### 2. Add Proration Support

**No schema changes needed** - proration is calculation logic only.

### 3. Add Invoice Duplicate Prevention

**Add unique constraint:**
```sql
ALTER TABLE `invoice_salon` 
ADD UNIQUE KEY `uk_subscription_billing_month` (`subscription_id`, `billing_month`);
```

This prevents duplicate invoices for same subscription + month combination.

### 4. Add Payment Validation Trigger

**Optional trigger for payment validation:**
```sql
DELIMITER $$
CREATE TRIGGER `validate_payment_amount`
BEFORE INSERT ON `payments_salon`
FOR EACH ROW
BEGIN
    DECLARE outstanding DECIMAL(10,2);
    DECLARE total_paid DECIMAL(10,2);
    DECLARE invoice_total DECIMAL(10,2);
    
    SELECT total_amount INTO invoice_total 
    FROM invoice_salon 
    WHERE invoice_salon_id = NEW.invoice_salon_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments_salon
    WHERE invoice_salon_id = NEW.invoice_salon_id;
    
    SET outstanding = invoice_total - total_paid;
    
    IF NEW.amount > outstanding THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount exceeds outstanding balance';
    END IF;
END$$
DELIMITER ;
```

---

## Implementation Checklist

### Phase 1: Create Subscription Plan Modal Improvements

- [ ] Add dynamic `required` attribute based on plan type
- [ ] Add help text for each plan type
- [ ] Add visual indicator for active fields
- [ ] Fix column name mapping in backend
- [ ] Add minimum price validation

### Phase 2: Assign Subscription Modal Improvements

- [ ] Add duplicate subscription check
- [ ] Add past date warning
- [ ] Show plan summary on selection
- [ ] Add "Create invoice now" checkbox
- [ ] Add future date validation

### Phase 3: Billing Calculation Modal (NEW)

- [ ] Create new modal with month selector INSIDE
- [ ] Move month selector from outside to inside modal
- [ ] Add invoice existence check inside modal
- [ ] Add proration calculation for flat plans
- [ ] Add appointment data verification
- [ ] Add "Invoice Already Exists" warning
- [ ] Add "View Existing Invoice" button
- [ ] Add "Recalculate" button

### Phase 4: Create Invoice Modal Improvements

- [ ] Add invoice existence check on selection
- [ ] Disable "Generate Invoice" if exists
- [ ] Show existing invoice details
- [ ] Lock amount fields after calculation
- [ ] Add proration calculation
- [ ] Add appointment count verification

### Phase 5: Renew Subscription Feature

- [ ] Add renew button to subscription table
- [ ] Create renew subscription modal
- [ ] Implement backend API endpoint
- [ ] Add renewal logging
- [ ] Update subscription end_date
- [ ] Optional: Create renewal invoice

### Phase 6: Invoice Payment Improvements

- [ ] Verify payment status calculation
- [ ] Add payment amount validation
- [ ] Add overpayment warning
- [ ] Add print functionality
- [ ] Add download PDF
- [ ] Add email invoice
- [ ] Add refund functionality

### Phase 7: Database Changes

- [ ] Add unique constraint on invoice_salon(subscription_id, billing_month)
- [ ] Add column name mapping in backend
- [ ] (Optional) Add payment validation trigger
- [ ] (Optional) Add billing cycle tracking

### Phase 8: Testing & Validation

- [ ] Test all 3 plan types end-to-end
- [ ] Test proration calculation
- [ ] Test duplicate invoice prevention
- [ ] Test payment status updates
- [ ] Test renewal flow
- [ ] Test all validation rules
- [ ] Test on mobile devices
- [ ] Test error scenarios

---

## Validation Rules

### Create Plan Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| plan_name | Required, 3-100 chars | "Plan name must be 3-100 characters" |
| duration_days | Required, 1-3650 | "Duration must be 1-3650 days" |
| plan_type | Required, enum | "Invalid plan type" |
| flat_price | Required if flat, min 100 | "Minimum flat price is ₹100" |
| per_appointments_price | Required if per-appointment, min 10 | "Minimum per-appointment price is ₹10" |
| percentage_per_appointment | Required if percentage, 1-100 | "Percentage must be 1-100%" |
| status | 0 or 1 | "Invalid status" |

### Assign Subscription Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| salon_id | Required, must exist | "Invalid salon" |
| plan_id | Required, must be active | "Invalid or inactive plan" |
| start_date | Required, not > 30 days future | "Start date cannot be more than 30 days in future" |
| status | ACTIVE, EXPIRED, or CANCELLED | "Invalid status" |
| No active subscription | Check existing | "Salon already has an active subscription" |

### Billing Calculation Validation

| Check | Rule | Action |
|-------|------|--------|
| Invoice exists | Check subscription_id + billing_month | Disable "Generate Invoice", show warning |
| Appointment data | Fetch completed appointments | Show count and revenue |
| Proration | If flat plan and start_date != month start | Calculate prorated amount |
| Plan type | Verify plan type | Use correct calculation formula |

### Invoice Generation Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| billing_month | Required, YYYY-MM format | "Invalid billing month" |
| total_amount | Required, > 0 | "Invalid amount" |
| invoice_date | Required, YYYY-MM-DD | "Invalid date" |
| due_date | Required, > invoice_date | "Due date must be after invoice date" |
| No duplicate | Check subscription_id + billing_month | "Invoice already exists for this month" |

### Payment Recording Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| amount | Required, > 0, <= outstanding | "Invalid payment amount" |
| payment_date | Required, not future | "Payment date cannot be in future" |
| payment_mode | Required, enum | "Invalid payment mode" |
| transaction_no | Optional for CASH, required for others | "Transaction reference required" |

---

## Progress Tracker

### Legend
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Blocked

### Task Status

| Task | Status | Assigned To | Due Date | Notes |
|------|--------|-------------|----------|-------|
| Phase 1: Plan Modal | ⬜ | | | |
| Phase 2: Assign Modal | ⬜ | | | |
| Phase 3: Billing Modal | ⬜ | | | |
| Phase 4: Invoice Modal | ⬜ | | | |
| Phase 5: Renew Feature | ⬜ | | | |
| Phase 6: Payment Improvements | ⬜ | | | |
| Phase 7: Database Changes | ⬜ | | | |
| Phase 8: Testing | ⬜ | | | |

### Detailed Progress

#### Phase 1: Create Subscription Plan Modal
- [ ] ⬜ Add dynamic required attribute
- [ ] ⬜ Add help text
- [ ] ⬜ Add visual indicators
- [ ] ⬜ Fix column name mapping
- [ ] ⬜ Add minimum price validation

#### Phase 2: Assign Subscription Modal
- [ ] ⬜ Add duplicate check
- [ ] ⬜ Add past date warning
- [ ] ⬜ Show plan summary
- [ ] ⬜ Add "Create invoice now" checkbox
- [ ] ⬜ Add future date validation

#### Phase 3: Billing Calculation Modal
- [ ] ⬜ Create new modal structure
- [ ] ⬜ Move month selector inside
- [ ] ⬜ Add invoice existence check
- [ ] ⬜ Implement proration logic
- [ ] ⬜ Add appointment verification
- [ ] ⬜ Add existing invoice warning
- [ ] ⬜ Add "View Invoice" button
- [ ] ⬜ Add "Recalculate" button

#### Phase 4: Create Invoice Modal
- [ ] ⬜ Add invoice existence check
- [ ] ⬜ Disable button if exists
- [ ] ⬜ Show existing invoice
- [ ] ⬜ Lock amount fields
- [ ] ⬜ Add proration
- [ ] ⬜ Add appointment verification

#### Phase 5: Renew Subscription
- [ ] ⬜ Add renew button
- [ ] ⬜ Create renew modal
- [ ] ⬜ Implement backend API
- [ ] ⬜ Add renewal logging
- [ ] ⬜ Update end_date
- [ ] ⬜ Optional renewal invoice

#### Phase 6: Payment Improvements
- [ ] ⬜ Verify status calculation
- [ ] ⬜ Add amount validation
- [ ] ⬜ Add overpayment warning
- [ ] ⬜ Add print functionality
- [ ] ⬜ Add download PDF
- [ ] ⬜ Add email invoice
- [ ] ⬜ Add refund functionality

#### Phase 7: Database Changes
- [ ] ⬜ Add unique constraint
- [ ] ⬜ Add column name mapping
- [ ] ⬜ Optional: payment trigger
- [ ] ⬜ Optional: billing cycle tracking

#### Phase 8: Testing
- [ ] ⬜ Test plan types
- [ ] ⬜ Test proration
- [ ] ⬜ Test duplicate prevention
- [ ] ⬜ Test payment status
- [ ] ⬜ Test renewal flow
- [ ] ⬜ Test validation rules
- [ ] ⬜ Test mobile
- [ ] ⬜ Test error scenarios

---

## Appendix A: Calculation Examples

### Example 1: Flat Plan - Full Month

**Plan:** Premium Plan (flat, ₹50,000/month)  
**Subscription:** 2026-03-01 to 2026-03-31  
**Billing Month:** March 2026

```
Base Amount = ₹50,000
Per Appointment = ₹0
Percentage = ₹0
Subtotal = ₹50,000
Tax (18%) = ₹9,000
Total = ₹59,000
```

### Example 2: Flat Plan - Prorated

**Plan:** Premium Plan (flat, ₹50,000/month)  
**Subscription:** 2026-03-15 to 2026-04-14  
**Billing Month:** March 2026

```
Days in March = 31
Days remaining (15th to 31st) = 17
Proration factor = 17/31 = 0.548

Base Amount = ₹50,000 × 0.548 = ₹27,419.35
Per Appointment = ₹0
Percentage = ₹0
Subtotal = ₹27,419.35
Tax (18%) = ₹4,935.48
Total = ₹32,354.83
```

### Example 3: Per-Appointment Plan

**Plan:** Basic Plan (per-appointment, ₹50/appointment)  
**Completed Appointments in March:** 150  
**Billing Month:** March 2026

```
Base Amount = ₹0
Per Appointment = 150 × ₹50 = ₹7,500
Percentage = ₹0
Subtotal = ₹7,500
Tax (18%) = ₹1,350
Total = ₹8,850
```

### Example 4: Percentage Plan

**Plan:** Enterprise Plan (percentage, 10% of revenue)  
**Total Revenue in March:** ₹500,000  
**Billing Month:** March 2026

```
Base Amount = ₹0
Per Appointment = ₹0
Percentage = ₹500,000 × 10% = ₹50,000
Subtotal = ₹50,000
Tax (18%) = ₹9,000
Total = ₹59,000
```

---

## Appendix B: File Locations

### Frontend Files

| File | Path | Purpose |
|------|------|---------|
| Subscription Page | `FRONTED/SUPER_ADMIN/html/super-admin/sa-subscription.html` | Main subscription management |
| Subscription JS | `FRONTED/SUPER_ADMIN/js/pages/sa-subscription.js` | Subscription logic |
| Invoice Page | `FRONTED/SUPER_ADMIN/html/super-admin/sa-invoices.html` | Main invoice management |
| Invoice JS | `FRONTED/SUPER_ADMIN/js/pages/sa-invoices.js` | Invoice logic |
| API Config | `FRONTED/SUPER_ADMIN/js/Core/config.js` | API endpoints |
| API Client | `FRONTED/SUPER_ADMIN/js/Core/api.js` | API requests |

### Backend Files

| File | Path | Purpose |
|------|------|---------|
| Subscription Controller | `BACKEND/modules/subscriptions/SubscriptionController.php` | Subscription APIs |
| Plan Controller | `BACKEND/modules/subscription-plans/SubscriptionPlanController.php` | Plan APIs |
| Salon Invoice Controller | `BACKEND/modules/invoices/SalonInvoiceController.php` | Invoice APIs |
| Invoice Helper | `BACKEND/helpers/InvoiceHelper.php` | Invoice calculations |

### Database Documentation

| File | Path | Purpose |
|------|------|---------|
| Database Dump | `BACKEND/DOCUMENTATION/DATABASE_DUMP.md` | Full schema reference |

---

## Appendix C: Quick Reference

### Plan Type Enum Values
- `'flat'` - Fixed monthly amount
- `'per-appointments'` - Fixed rate per appointment
- `'Percentage-per-appointments'` - Percentage of revenue

### Invoice Status Enum Values
- `'UNPAID'` - No payments recorded
- `'PARTIAL'` - Some payments recorded, balance remaining
- `'PAID'` - Fully paid
- `'REFUNDED'` - Refunded

### Subscription Status Enum Values
- `'ACTIVE'` - Currently active
- `'EXPIRED'` - Past end date
- `'CANCELLED'` - Manually cancelled

### Payment Mode Enum Values
- `'CASH'`
- `'CARD'`
- `'UPI'`
- `'NET_BANKING'`
- `'WALLET'`
- `'BANK'`
- `'CHEQUE'`

---

**Document End**

---

## How to Use This Document

1. **For Implementation:** Follow the Implementation Checklist section
2. **For Understanding:** Read the Modal-by-Modal Analysis
3. **For API Development:** Refer to API Requirements section
4. **For Database Changes:** See Database Changes Required section
5. **For Testing:** Use the Validation Rules section
6. **For Progress Tracking:** Update the Progress Tracker section

**If Qwen crashes or you need to continue:**
1. Check the Progress Tracker for current status
2. Find the incomplete task in the Implementation Checklist
3. Refer to the corresponding Modal Analysis for details
4. Implement following the TODO items
5. Update the Progress Tracker when complete
