# 📋 BACKEND VALIDATION REFERENCE GUIDE

**For Frontend Developers** - Match these validation rules in your frontend forms

**Last Updated**: 2026-03-04
**Version**: 1.0

---

## 📑 TABLE OF CONTENTS

1. [Global Validation Rules](#global-validation-rules)
2. [Format Standards](#format-standards)
3. [Module-by-Module Validation](#module-by-module-validation)
4. [Error Response Format](#error-response-format)

---

## 🌍 GLOBAL VALIDATION RULES

### **Applies to ALL APIs**

| Rule | Format | Example | Error Message |
|------|--------|---------|---------------|
| **Salon ID** | Integer, required for authenticated users | `1`, `2`, `3` | "Salon ID required" |
| **Authorization** | Bearer token in header | `Authorization: Bearer {token}` | "Access token required" |

---

## 📝 FORMAT STANDARDS

### **Date & Time Formats**

| Field | Format | Pattern | Example |
|-------|--------|---------|---------|
| **Date** | `YYYY-MM-DD` | `^\d{4}-\d{2}-\d{2}$` | `2026-03-15` |
| **Time** | `HH:MM:SS` | `^\d{2}:\d{2}:\d{2}$` | `14:30:00` |
| **DateTime** | `YYYY-MM-DD HH:MM:SS` | `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$` | `2026-03-15 14:30:00` |

### **Contact Information**

| Field | Format | Pattern | Example |
|-------|--------|---------|---------|
| **Email** | Valid email format | Standard RFC 5322 | `john@example.com` |
| **Phone (Indian)** | 10 digits, starts with 6-9 | `^[6-9][0-9]{9}$` | `9876543210` |
| **GST Number** | Indian GST format | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` | `29ABCDE1234F1Z5` |

### **Password Requirements**

| Requirement | Value |
|-------------|-------|
| **Minimum Length** | 6 characters |
| **Maximum Length** | No limit |
| **Special Characters** | Not required |
| **Numbers** | Not required |

### **String Length Limits**

| Field Type | Min | Max |
|------------|-----|-----|
| **Name** (any type) | 1 | 100 |
| **Username** | 3 | 50 |
| **Description** | 0 | 1000 |
| **Address** | 5 | 500 |
| **City/State** | 1 | 100 |
| **Notes/Remarks** | 0 | 500 |

### **Numeric Ranges**

| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| **Price/Amount** | 0 | 10,000,000 | Decimal allowed |
| **Duration (minutes)** | 1 | 1,440 | Max 24 hours |
| **Validity Days** | 1 | 365 | For packages |
| **Quantity** | 0 | 10,000 | For stock |
| **Rating** | 1 | 5 | Integer only |
| **Experience Years** | 0 | 50 | For staff |
| **Salary** | 0 | No limit | Decimal allowed |
| **Tax Rate** | 0 | 100 | Percentage |
| **Discount** | 0 | ≤ Total Amount | Cannot exceed total |
| **Status (tinyint)** | 0 | 1 | 0=Inactive, 1=Active |

### **Enum Values**

| Field | Allowed Values |
|-------|----------------|
| **Gender** | `MALE`, `FEMALE`, `OTHER`, `null` |
| **Login Type** | `SUPER_ADMIN`, `ADMIN/STAFF`, `CUSTOMER` |
| **User Role** | `SUPER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER` |
| **User Status** | `ACTIVE`, `INACTIVE`, `BLOCKED` |
| **Staff Status** | `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED` |
| **Customer Status** | `ACTIVE`, `INACTIVE`, `BLOCKED` |
| **Service/Package Status** | `ACTIVE`, `INACTIVE` |
| **Appointment Status** | `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| **Payment Status** | `UNPAID`, `PARTIAL`, `PAID`, `REFUNDED` |
| **Payment Mode** | `CASH`, `CARD`, `UPI`, `NET_BANKING`, `WALLET`, `CHEQUE` |
| **Payment Status (Transaction)** | `SUCCESS`, `FAILED`, `PENDING`, `REFUNDED` |
| **Transaction Type** | `IN`, `OUT`, `ADJUSTMENT` |
| **Product Category** | `product`, `equipment` |
| **Incentive Type** | `SERVICE_COMMISSION`, `BONUS`, `TARGET_ACHIEVEMENT` |
| **Incentive Status** | `PENDING`, `APPROVED`, `PAID` |
| **Calculation Type** | `FIXED`, `PERCENTAGE` |
| **Document Type** | `CERTIFICATION`, `ID_PROOF`, `CONTRACT`, `RESUME`, `OTHER` |
| **Subscription Status** | `ACTIVE`, `EXPIRED`, `CANCELLED` |
| **Plan Type** | `flat`, `per-appointments`, `Percentage-per-appointments` |
| **Stock Status** | `LOW`, `OK`, `OVERSTOCKED` |

---

## 🔐 MODULE-BY-MODULE VALIDATION

### **1. AUTH MODULE**

#### **POST /api/auth/login**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `login_type` | String | **YES** | Enum: `SUPER_ADMIN`, `ADMIN/STAFF`, `CUSTOMER` | Determines login flow |
| `password` | String | **YES** | Min 6 characters | Required for all types |
| `email` | String | Conditional | Valid email format | Required for SUPER_ADMIN, ADMIN/STAFF. Optional for CUSTOMER (if no phone) |
| `phone` | String | Conditional | 10-digit Indian format | Required for CUSTOMER (if no email) |
| `salon_id` | Integer | Conditional | Integer > 0 | Required for ADMIN/STAFF/CUSTOMER |

**Login Type Requirements:**
```javascript
// SUPER_ADMIN
{ login_type: "SUPER_ADMIN", email, password }

// ADMIN/STAFF
{ login_type: "ADMIN/STAFF", email, password, salon_id }

// CUSTOMER
{ login_type: "CUSTOMER", email, password, salon_id }
// OR
{ login_type: "CUSTOMER", phone, password, salon_id }
```

---

#### **POST /api/auth/refresh**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refresh_token` | String | **YES** | Valid refresh token from login response |

---

#### **POST /api/auth/logout**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refresh_token` | String | **YES** | Valid refresh token |

---

#### **PUT /api/auth/me**

| Field | Type | Required | Validation | Role-Specific |
|-------|------|----------|------------|---------------|
| `name` / `username` | String | Optional | 1-100 chars / 3-50 chars | SUPER_ADMIN/CUSTOMER: `name`, ADMIN/STAFF: `username` |
| `email` | String | Optional | Valid email | All roles |
| `phone` | String | Optional | 10-digit Indian | All roles |

---

### **2. CUSTOMERS MODULE**

#### **POST /api/customers/register** (Public - No Auth)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | **YES** | 1-100 characters |
| `email` | String | Conditional | Valid email (required if no phone) |
| `phone` | String | Conditional | 10-digit Indian (required if no email) |
| `password` | String | **YES** | Min 6 characters |
| `salon_id` | Integer | **YES** | Integer > 0, must exist |

---

#### **POST /api/customers/create** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | **YES** | 1-100 characters |
| `email` | String | Conditional | Valid email (required if no phone) |
| `phone` | String | Conditional | 10-digit Indian (required if no email) |
| `gender` | String | Optional | Enum: `MALE`, `FEMALE`, `OTHER` |
| `date_of_birth` | String | Optional | Format: `YYYY-MM-DD` |
| `anniversary_date` | String | Optional | Format: `YYYY-MM-DD` |
| `address` | String | Optional | 5-500 characters |
| `preferences` | String | Optional | Max 500 characters |

---

#### **PATCH /api/customers/update/{customer_id}** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Optional | 1-100 characters |
| `email` | String | Optional | Valid email |
| `phone` | String | Optional | 10-digit Indian |
| `gender` | String | Optional | Enum: `MALE`, `FEMALE`, `OTHER` |
| `date_of_birth` | String | Optional | Format: `YYYY-MM-DD` |
| `anniversary_date` | String | Optional | Format: `YYYY-MM-DD` |
| `address` | String | Optional | 5-500 characters |
| `preferences` | String | Optional | Max 500 characters |
| `status` | String | Optional | Enum: `ACTIVE`, `INACTIVE`, `BLOCKED` |

---

#### **PATCH /api/customers/me** (CUSTOMER only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Optional | 1-100 characters |
| `email` | String | Optional | Valid email |
| `phone` | String | Optional | 10-digit Indian |
| `date_of_birth` | String | Optional | Format: `YYYY-MM-DD` |
| `anniversary_date` | String | Optional | Format: `YYYY-MM-DD` |

---

### **3. SERVICES MODULE**

#### **POST /api/admin/services** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `service_name` | String | **YES** | 1-100 characters |
| `description` | String | Optional | Max 1000 characters |
| `price` | Decimal | **YES** | 0 - 1,000,000 |
| `duration` | Integer | **YES** | 1 - 1440 minutes |
| `image_url` | String | Optional | Valid URL format |
| `status` | String | Optional | Enum: `ACTIVE`, `INACTIVE` (default: `ACTIVE`) |

---

#### **PUT /api/admin/services/{service_id}** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `service_name` | String | Optional | 1-100 characters |
| `description` | String | Optional | Max 1000 characters |
| `price` | Decimal | Optional | 0 - 1,000,000 |
| `duration` | Integer | Optional | 1 - 1440 minutes |
| `image_url` | String | Optional | Valid URL format |

---

#### **PATCH /api/admin/services/{service_id}/status** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | String | **YES** | Enum: `ACTIVE`, `INACTIVE` |

---

### **4. PACKAGES MODULE**

#### **POST /api/admin/packages** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `package_name` | String | **YES** | 1-100 characters |
| `description` | String | Optional | Max 1000 characters |
| `total_price` | Decimal | **YES** | 0 - 1,000,000 |
| `validity_days` | Integer | Optional | 1 - 365 days |
| `image_url` | String | Optional | Valid URL format |
| `status` | String | Optional | Enum: `ACTIVE`, `INACTIVE` (default: `ACTIVE`) |
| `service_ids` | Array | **YES** | Array of integers, no duplicates, all must exist in salon |

**Example:**
```json
{
  "package_name": "Bridal Package",
  "total_price": 15000.00,
  "validity_days": 30,
  "service_ids": [1, 2, 4, 8]
}
```

---

#### **PUT /api/admin/packages/{package_id}** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `package_name` | String | Optional | 1-100 characters |
| `description` | String | Optional | Max 1000 characters |
| `total_price` | Decimal | Optional | 0 - 1,000,000 |
| `validity_days` | Integer | Optional | 1 - 365 days |
| `image_url` | String | Optional | Valid URL format |
| `service_ids` | Array | Optional | Array of integers, no duplicates |

---

#### **PATCH /api/admin/packages/{package_id}/status** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | String | **YES** | Enum: `ACTIVE`, `INACTIVE` |

---

### **5. STAFF MODULE**

#### **POST /api/admin/staff** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `username` | String | **YES** | 3-50 characters |
| `email` | String | **YES** | Valid email format |
| `password` | String | **YES** | Min 6 characters |
| `role` | String | **YES** | Enum: `ADMIN`, `STAFF` (default: `STAFF`) |
| `name` | String | **YES** | 1-100 characters |
| `phone` | String | Optional | 10-digit Indian format |
| `status` | String | Optional | Enum: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED` (default: `ACTIVE`) |
| `date_of_birth` | String | Optional | Format: `YYYY-MM-DD` |
| `date_of_joining` | String | Optional | Format: `YYYY-MM-DD` |
| `specialization` | String | Optional | Max 100 characters |
| `experience_years` | Integer | Optional | 0 - 50 |
| `salary` | Decimal | Optional | >= 0 |

---

#### **PUT /api/admin/staff/{staff_id}** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Optional | 1-100 characters |
| `phone` | String | Optional | 10-digit Indian format |
| `email` | String | Optional | Valid email format |
| `date_of_birth` | String | Optional | Format: `YYYY-MM-DD` |
| `date_of_joining` | String | Optional | Format: `YYYY-MM-DD` |
| `specialization` | String | Optional | Max 100 characters |
| `experience_years` | Integer | Optional | 0 - 50 |
| `salary` | Decimal | Optional | >= 0 |

---

#### **PATCH /api/admin/staff/{staff_id}/status** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | String | **YES** | Enum: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED` |

---

#### **POST /api/staff/incentives** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `staff_id` | Integer | **YES** | Must exist in salon |
| `appointment_id` | Integer | Optional | Required for SERVICE_COMMISSION |
| `incentive_type` | String | **YES** | Enum: `SERVICE_COMMISSION`, `BONUS`, `TARGET_ACHIEVEMENT` |
| `calculation_type` | String | Optional | Enum: `FIXED`, `PERCENTAGE` (default: `FIXED`) |
| `percentage_rate` | Decimal | Conditional | 0 - 100 (required if PERCENTAGE) |
| `fixed_amount` | Decimal | Conditional | >= 0 (required if FIXED) |
| `base_amount` | Decimal | Conditional | >= 0 (required if PERCENTAGE) |
| `incentive_amount` | Decimal | **YES** | 0 - 1,000,000 |
| `remarks` | String | Optional | Max 500 characters |
| `status` | String | Optional | Enum: `PENDING`, `APPROVED`, `PAID` (default: `PENDING`) |

---

#### **POST /api/staff/incentives/{incentive_id}/payout** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `payout_amount` | Decimal | **YES** | 0 - 1,000,000 |
| `payout_date` | String | Optional | Format: `YYYY-MM-DD` (default: today) |
| `payment_mode` | String | **YES** | Enum: `CASH`, `UPI`, `BANK`, `CHEQUE` |
| `transaction_reference` | String | Optional | Max 100 characters |
| `remarks` | String | Optional | Max 500 characters |

---

### **6. STOCK MODULE**

#### **POST /api/admin/products** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `product_name` | String | **YES** | 1-100 characters |
| `brand` | String | Optional | Max 100 characters |
| `category` | String | **YES** | Enum: `product`, `equipment` |
| `description` | String | Optional | Max 1000 characters |
| `minimum_quantity` | Integer | Optional | 0 - 10,000 (default: 10) |
| `maximum_quantity` | Integer | Optional | 0 - 10,000 (default: 100) |
| `initial_quantity` | Integer | Optional | 0 - 10,000 (default: 0) |

**Validation Rule:** `minimum_quantity` ≤ `maximum_quantity`

---

#### **PUT /api/admin/products/{product_id}** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `product_name` | String | Optional | 1-100 characters |
| `brand` | String | Optional | Max 100 characters |
| `category` | String | Optional | Enum: `product`, `equipment` |
| `description` | String | Optional | Max 1000 characters |

---

#### **PATCH /api/admin/stock/{product_id}** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `current_quantity` | Integer | Conditional | 0 - 10,000 (required if no other fields) |
| `minimum_quantity` | Integer | Conditional | 0 - 10,000 (required if no other fields) |
| `maximum_quantity` | Integer | Conditional | 0 - 10,000 (required if no other fields) |

**Validation Rule:** At least one field required, `minimum` ≤ `maximum`

---

#### **POST /api/admin/stock/transactions** (ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `product_id` | Integer | **YES** | Must exist in salon |
| `transaction_type` | String | **YES** | Enum: `IN`, `OUT`, `ADJUSTMENT` |
| `quantity` | Integer | **YES** | 1 - 10,000 |
| `unit_price` | Decimal | Optional | 0 - 1,000,000 (default: 0) |
| `reference_type` | String | Optional | Max 50 characters |
| `reference_id` | Integer | Optional | Integer > 0 |
| `notes` | String | Optional | Max 500 characters |

**Special Validation:**
- For `OUT` transactions: `quantity` ≤ current stock
- For `ADJUSTMENT`: `quantity` becomes the new stock level

---

### **7. APPOINTMENTS MODULE**

#### **POST /api/appointments** (ADMIN/STAFF/CUSTOMER)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `customer_id` | Integer | Conditional | Required for ADMIN/STAFF (auto-set for CUSTOMER) |
| `appointment_date` | String | **YES** | Format: `YYYY-MM-DD`, must be >= today |
| `start_time` | String | **YES** | Format: `HH:MM:SS` |
| `estimated_duration` | Integer | **YES** | 1 - 1440 minutes |
| `notes` | String | Optional | Max 500 characters |
| `services` | Array | Conditional | Required if no packages |
| `packages` | Array | Conditional | Required if no services |
| `discount_amount` | Decimal | Optional | 0 - total_amount |

**Services Array Structure:**
```json
{
  "services": [
    {
      "service_id": 1,
      "staff_id": 2,
      "price": 500.00,
      "discount_amount": 50.00,
      "start_time": "10:00:00",
      "end_time": "10:45:00"
    }
  ]
}
```

**Packages Array Structure:**
```json
{
  "packages": [
    {
      "package_id": 1,
      "staff_id": 2,
      "price": 5000.00,
      "discount_amount": 500.00
    }
  ]
}
```

**Validation Rules:**
- At least one service OR one package required
- Service/package must exist in salon
- `discount_amount` ≤ `price` for each service/package
- Total discount ≤ total amount

---

#### **PUT /api/appointments/{appointment_id}** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `appointment_date` | String | Optional | Format: `YYYY-MM-DD` |
| `start_time` | String | Optional | Format: `HH:MM:SS` |
| `end_time` | String | Optional | Format: `HH:MM:SS` |
| `estimated_duration` | Integer | Optional | 1 - 1440 minutes |
| `total_amount` | Decimal | Optional | 0 - 1,000,000 |
| `discount_amount` | Decimal | Optional | 0 - total_amount |
| `final_amount` | Decimal | Optional | 0 - 1,000,000 |
| `customer_id` | Integer | Optional | Must exist in same salon |
| `status` | String | Optional | Enum: All appointment statuses |
| `notes` | String | Optional | Max 500 characters |
| `cancellation_reason` | String | Optional | Max 500 characters |

---

#### **PATCH /api/appointments/{appointment_id}/cancel** (ADMIN/STAFF/CUSTOMER)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `cancellation_reason` | String | Optional | Max 500 characters |

---

#### **POST /api/appointments/{appointment_id}/feedback** (CUSTOMER only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `rating` | Integer | **YES** | 1 - 5 |
| `comment` | String | Optional | Max 1000 characters |
| `is_anonymous` | Boolean | Optional | true/false (default: false) |

---

### **8. INVOICES MODULE**

#### **POST /api/invoices** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `appointment_id` | Integer | **YES** | Must exist in salon |
| `subtotal_amount` | Decimal | Optional | 0 - 10,000,000 (default: from appointment) |
| `tax_amount` | Decimal | Optional | 0 - 1,000,000 (default: 0) |
| `discount_amount` | Decimal | Optional | 0 - subtotal_amount (default: 0) |
| `due_date` | String | Optional | Format: `YYYY-MM-DD` (default: +7 days) |
| `notes` | String | Optional | Max 500 characters |

**Validation Rule:** `discount_amount` ≤ `subtotal_amount`

---

#### **PUT /api/invoices/{invoice_id}** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `subtotal_amount` | Decimal | Optional | 0 - 10,000,000 |
| `tax_amount` | Decimal | Optional | 0 - 1,000,000 |
| `discount_amount` | Decimal | Optional | 0 - subtotal_amount |
| `due_date` | String | Optional | Format: `YYYY-MM-DD` |
| `notes` | String | Optional | Max 500 characters |

---

### **9. PAYMENTS MODULE**

#### **POST /api/payments** (ADMIN/STAFF only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `invoice_customer_id` | Integer | **YES** | Must exist in salon |
| `payment_mode` | String | **YES** | Enum: `CASH`, `CARD`, `UPI`, `NET_BANKING`, `WALLET` |
| `transaction_no` | String | Optional | Max 100 characters |
| `amount` | Decimal | **YES** | 0.01 - 10,000,000 (must be <= outstanding) |
| `payment_date` | String | Optional | Format: `YYYY-MM-DD HH:MM:SS` (default: now) |

---

### **10. SUBSCRIPTION-PLANS MODULE** (SUPER_ADMIN for write, ADMIN/STAFF for read)

#### **POST /api/subscription-plans** (SUPER_ADMIN only)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `plan_name` | String | **YES** | 1-100 characters |
| `duration_days` | Integer | **YES** | 1 - 3650 (max 10 years) |
| `status` | Integer | Optional | 0 or 1 (default: 1) |
| `plan_type` | String | **YES** | Enum: `flat`, `per-appointments`, `Percentage-per-appointments` |
| `flat_price` | Decimal | Conditional | 0 - 10,000,000 (required for `flat` type) |
| `per_appointments_price` | Decimal | Conditional | 0 - 1,000,000 (required for `per-appointments` type) |
| `percentage_per_appointments` | Decimal | Conditional | 0 - 100 (required for `Percentage-per-appointments` type) |

---

### **11. REPORTS MODULE** (ADMIN/STAFF only)

All report endpoints accept query parameters:

| Parameter | Type | Required | Validation | Default |
|-----------|------|----------|------------|---------|
| `start_date` | String | Optional | Format: `YYYY-MM-DD` | First of current month |
| `end_date` | String | Optional | Format: `YYYY-MM-DD` | Today |
| `tax_rate` | Decimal | Optional | 0 - 100 | 18 |

**Validation Rule:** `end_date` >= `start_date`

---

## ❌ ERROR RESPONSE FORMAT

All validation errors return this format:

```json
{
  "status": "error",
  "message": "Human-readable error message"
}
```

**HTTP Status Codes:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate entry (email, phone, etc.)
- `500 Internal Server Error` - Server error

**Example Error Messages:**
```
"Missing required fields"
"Invalid email format"
"Invalid phone number (10-digit Indian format required)"
"Password must be at least 6 characters"
"Name must be between 1 and 100 characters"
"Price must be between 0 and 1,000,000"
"Duration must be between 1 and 1440 minutes"
"Invalid date format (use YYYY-MM-DD)"
"Cannot book appointments in the past"
"Email already registered"
"Phone already exists"
"Invalid gender value. Must be MALE, FEMALE, or OTHER"
"Salon ID required"
"Access token required"
"Invalid or expired token"
```

---

## 📱 FRONTEND VALIDATION CHECKLIST

### **Required for ALL Forms:**
- [ ] Trim whitespace from all string inputs
- [ ] Check required fields before submission
- [ ] Validate email format
- [ ] Validate phone format (if Indian numbers)
- [ ] Show field-specific error messages
- [ ] Disable submit button during API call
- [ ] Handle error responses gracefully

### **Date/Time Pickers:**
- [ ] Date format: `YYYY-MM-DD`
- [ ] Time format: `HH:MM:SS` (24-hour)
- [ ] Prevent past dates for appointments
- [ ] Validate date ranges (end >= start)

### **Numeric Inputs:**
- [ ] Set min/max attributes
- [ ] Validate decimal places for prices (2 decimals)
- [ ] Prevent negative numbers where not allowed
- [ ] Validate discount ≤ total

### **Dropdowns/Selects:**
- [ ] Use exact enum values (case-sensitive)
- [ ] Include null/empty option where optional
- [ ] Set appropriate default values

---

**END OF DOCUMENT**

For questions or clarifications, refer to `API_DOCUMENTATION.txt` or contact the backend team.
