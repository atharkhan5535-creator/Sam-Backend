# Customer Frontend - Backend API Integration Fixes

**Created:** 2026-03-19  
**Priority:** High  
**Impact:** Customer booking flow, appointment management, data security

---

## 🎯 Goal

Fix incompatibilities between Customer Frontend and Backend APIs **without breaking Admin/Staff functionality**. Ensure all APIs are secure and customers can only access their own data or public salon data.

---

## 📋 Executive Summary

| Component | Files to Change | Risk Level |
|-----------|----------------|------------|
| **Frontend** | `Js/pages/booking.js` | Low |
| **Backend** | `AppointmentController.php` (ADD staff_name JOINs) | Medium |
| **Backend Routes** | NO CHANGES NEEDED - Routes already exist! | ✅ |

---

## ✅ GOOD NEWS: Already Working!

### 1. Customer Appointments Endpoint EXISTS!

**Frontend calls (appointments.js line 117):**
```javascript
const res = await fetch(`${API_BASE_URL}/customers/me/appointments`, {
    headers: { "Authorization": `Bearer ${token}` }
});
```

**Backend already has this endpoint!**
- **Controller:** `CustomerController.php` method `getMyAppointments()` (line 532)
- **Route:** `/api/customers/me/appointments` (routes.php line 78)
- **Security:** `authorize(['CUSTOMER'])` - Only customers can access
- **Features:** Already includes `staff_name` in services and packages!

**No changes needed for appointments list!** ✅

---

## 🔴 Critical Issues to Fix

### 1. Wrong API Endpoint for Appointments List

**Problem:** Frontend calls non-existent endpoint

**Frontend File:** `Js/pages/appointments.js` (Line 117)

```javascript
// ❌ CURRENT (WRONG)
const res = await fetch(`${API_BASE_URL}/customers/me/appointments`, {
    headers: { "Authorization": `Bearer ${token}` }
});

// ✅ FIX (CORRECT)
const res = await fetch(`${API_BASE_URL}/appointments`, {
    headers: { "Authorization": `Bearer ${token}` }
});
```

**Why this works:** Backend's `index()` method already filters by customer automatically when role is CUSTOMER.

---

### 2. Staff ID Field Mismatch in Booking

**Problem:** Frontend sends `staff_id` but database table doesn't have this column

**Frontend File:** `Js/pages/booking.js` (Lines 246-260)

```javascript
// ❌ CURRENT (WRONG)
if (bookingData.type === "services") {
    services = bookingData.items.map(item => ({
        service_id: getItemId(item),
        staff_id: bookingData.staff,  // ❌ Database doesn't have this column
        price: item.price
    }));
}

if (bookingData.type === "packages") {
    packages = bookingData.items.map(item => ({
        package_id: getItemId(item),
        staff_id: bookingData.staff,  // ❌ Database doesn't have this column
        price: item.price
    }));
}

// ✅ FIX (CORRECT)
if (bookingData.type === "services") {
    services = bookingData.items.map(item => ({
        service_id: getItemId(item),
        price: item.price,
        discount_amount: 0  // ✅ Add expected field
    }));
}

if (bookingData.type === "packages") {
    packages = bookingData.items.map(item => ({
        package_id: getItemId(item),
        price: item.price,
        discount_amount: 0  // ✅ Add expected field
    }));
}
```

**Database Reality Check:**
```sql
-- appointment_services table schema (NO staff_id)
CREATE TABLE `appointment_services` (
  `appointment_service_id` int,
  `appointment_id` int,
  `service_id` int,
  `service_price` decimal,
  `discount_amount` decimal,
  `final_price` decimal,
  `start_time` time,
  `end_time` time,
  `status` enum
)

-- appointment_packages table schema (NO staff_id)
CREATE TABLE `appointment_packages` (
  `appointment_package_id` int,
  `appointment_id` int,
  `package_id` int,
  `package_price` decimal,
  `discount_amount` decimal,
  `final_price` decimal,
  `status` enum
)
```

---

### 3. Staff Name Not Returned in Appointment List

**Problem:** Backend doesn't join staff table, frontend expects `staff_name`

**Backend File:** `BACKEND/modules/appointments/AppointmentController.php`

**Current Code (Lines 458-480):**
```php
// Get services
$stmt = $this->db->prepare("
    SELECT asvc.service_id, s.service_name, asvc.staff_id, asvc.service_price,
           asvc.discount_amount, asvc.final_price, asvc.start_time, asvc.end_time, asvc.status
    FROM appointment_services asvc
    INNER JOIN services s ON asvc.service_id = s.service_id
    WHERE asvc.appointment_id = ?
");
```

**✅ Fix - Add STAFF JOIN (DO NOT REMOVE existing fields):**
```php
// Get services
$stmt = $this->db->prepare("
    SELECT asvc.service_id, s.service_name, 
           sf.name AS staff_name,  -- ✅ ADD THIS
           asvc.service_price,
           asvc.discount_amount, asvc.final_price, 
           asvc.start_time, asvc.end_time, asvc.status
    FROM appointment_services asvc
    INNER JOIN services s ON asvc.service_id = s.service_id
    LEFT JOIN staff_info sf ON asvc.staff_id = sf.staff_id  -- ✅ ADD THIS JOIN
    WHERE asvc.appointment_id = ?
");
```

**Same fix needed for packages query (Lines 482-490):**
```php
// Get packages
$stmt = $this->db->prepare("
    SELECT ap.package_id, p.package_name, 
           ap.staff_id, sf.name AS staff_name,  -- ✅ ADD staff_name
           ap.package_price, ap.discount_amount, ap.final_price, ap.status
    FROM appointment_packages ap
    INNER JOIN packages p ON ap.package_id = p.package_id
    LEFT JOIN staff_info sf ON ap.staff_id = sf.staff_id  -- ✅ ADD JOIN
    WHERE ap.package_id = ?
");
```

**⚠️ IMPORTANT:** This fix is needed in BOTH `index()` and `show()` methods.

---

### 4. Hardcoded Duration (60 minutes)

**Frontend File:** `Js/pages/booking.js` (Line 235)

```javascript
// ❌ CURRENT (Always 60 minutes)
const payload = {
    estimated_duration: 60,
    // ...
};

// ✅ FIX (Calculate from services)
const totalDuration = bookingData.items.reduce((sum, item) => {
    return sum + (parseInt(item.duration) || 30);  // Default 30 min if missing
}, 0);

const payload = {
    estimated_duration: totalDuration,
    // ...
};
```

---

## 🔒 Security Enhancements (Backend)

### 5. Add Customer-Specific Appointments Endpoint

**Why:** For better API organization and explicit customer access

**Backend File:** `BACKEND/modules/appointments/AppointmentController.php`

**Add NEW method (do NOT modify existing methods):**

```php
/*
|--------------------------------------------------------------------------
| 1️⃣5️⃣ GET CUSTOMER'S OWN APPOINTMENTS (CUSTOMER only)
|--------------------------------------------------------------------------
*/
public function myAppointments()
{
    $auth = $GLOBALS['auth_user'] ?? null;
    
    // Only CUSTOMER role can use this endpoint
    if ($auth['role'] !== 'CUSTOMER') {
        Response::json(["status" => "error", "message" => "Unauthorized"], 403);
        return;
    }
    
    $salonId = $auth['salon_id'] ?? null;
    $customerId = $auth['customer_id'] ?? null;
    
    if (!$salonId || !$customerId) {
        Response::json(["status" => "error", "message" => "Invalid context"], 400);
        return;
    }
    
    $status = $_GET['status'] ?? null;
    $appointmentDate = $_GET['date'] ?? null;
    
    $sql = "
        SELECT a.*, c.name AS customer_name, c.phone AS customer_phone
        FROM appointments a
        INNER JOIN customers c ON a.customer_id = c.customer_id
        WHERE a.salon_id = ? AND a.customer_id = ?
    ";
    
    $params = [$salonId, $customerId];
    
    if ($status) {
        $sql .= " AND a.status = ?";
        $params[] = $status;
    }
    
    if ($appointmentDate) {
        $sql .= " AND a.appointment_date = ?";
        $params[] = $appointmentDate;
    }
    
    $sql .= " ORDER BY a.appointment_date DESC, a.start_time DESC";
    
    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get services and packages for each appointment (WITH staff_name)
    foreach ($appointments as &$appointment) {
        // Get services
        $stmt = $this->db->prepare("
            SELECT asvc.service_id, s.service_name, 
                   sf.name AS staff_name,
                   asvc.service_price, asvc.discount_amount, 
                   asvc.final_price, asvc.start_time, asvc.end_time, asvc.status
            FROM appointment_services asvc
            INNER JOIN services s ON asvc.service_id = s.service_id
            LEFT JOIN staff_info sf ON asvc.staff_id = sf.staff_id
            WHERE asvc.appointment_id = ?
        ");
        $stmt->execute([$appointment['appointment_id']]);
        $appointment['services'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get packages
        $stmt = $this->db->prepare("
            SELECT ap.package_id, p.package_name, 
                   sf.name AS staff_name,
                   ap.package_price, ap.discount_amount, ap.final_price, ap.status
            FROM appointment_packages ap
            INNER JOIN packages p ON ap.package_id = p.package_id
            LEFT JOIN staff_info sf ON ap.staff_id = sf.staff_id
            WHERE ap.appointment_id = ?
        ");
        $stmt->execute([$appointment['appointment_id']]);
        $appointment['packages'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Check if feedback exists
        $stmt = $this->db->prepare("SELECT feedback_id FROM appointment_feedback WHERE appointment_id = ?");
        $stmt->execute([$appointment['appointment_id']]);
        $appointment['feedback_given'] = (bool) $stmt->fetch();
    }
    
    Response::json([
        "status" => "success",
        "data" => [
            "items" => $appointments
        ]
    ]);
}
```

**Backend File:** `BACKEND/modules/appointments/routes.php`

**Add NEW route:**
```php
// Customer's own appointments (CUSTOMER only)
$router->get('/customers/me/appointments', 'AppointmentController@myAppointments', ['customer']);
```

---

### 6. Security Audit - Verify All Endpoints

**✅ Already Secure (Verified):**

| Endpoint | Security Check | Status |
|----------|---------------|--------|
| `POST /appointments` | Customer can only book for themselves (line 43-46) | ✅ |
| `GET /appointments` | Customer filtered by customer_id (line 423-426) | ✅ |
| `GET /appointments/:id` | Customer can only view own appointments (line 521-528) | ✅ |
| `PATCH /appointments/:id/cancel` | Customer can only cancel own appointments (line 385-392) | ✅ |
| `POST /appointments/:id/feedback` | Customer can only feedback own appointments (line 612-618) | ✅ |

**⚠️ Need Verification:**

| Endpoint | Concern | Action |
|----------|---------|--------|
| `GET /services` | Must filter by salon_id | ✅ Already does (query param) |
| `GET /packages` | Must filter by salon_id | ✅ Already does (query param) |
| `GET /staff` | Must filter by salon_id | ✅ Already does (query param) |

---

## 🛠️ Complete Todo List

### Frontend Fixes

- [ ] **Fix appointments endpoint** in `Js/pages/appointments.js`
  - Line 117: Change `/customers/me/appointments` to `/appointments`
  - OR keep endpoint and add backend route (see Backend Fix #5)

- [ ] **Remove staff_id from booking payload** in `Js/pages/booking.js`
  - Lines 246-252: Remove `staff_id` from services object
  - Lines 254-260: Remove `staff_id` from packages object
  - Add `discount_amount: 0` to both

- [ ] **Calculate estimated_duration** in `Js/pages/booking.js`
  - Line 235: Replace hardcoded `60` with calculated duration from items
  - Use `item.duration` from cart items

- [ ] **Update success modal** in `Js/pages/booking.js`
  - Line 326: `staff_name` will now be available after backend fix
  - Update `populateSuccessModal()` to use staff name if available

---

### Backend Fixes

- [ ] **Add staff_name to services query** in `AppointmentController.php`
  - Method: `index()` (line ~458)
  - Add `LEFT JOIN staff_info` for staff_name
  - Method: `show()` (line ~550)
  - Add same JOIN

- [ ] **Add staff_name to packages query** in `AppointmentController.php`
  - Method: `index()` (line ~482)
  - Add `LEFT JOIN staff_info` for staff_name
  - Method: `show()` (line ~560)
  - Add same JOIN

- [ ] **Add myAppointments() method** (NEW, line ~1400)
  - Customer-only endpoint
  - Returns filtered appointments with staff_name
  - Include services and packages with staff_name

- [ ] **Add route for myAppointments** in `routes.php`
  - `GET /customers/me/appointments`
  - Role: customer

---

### Testing Checklist

#### Before Testing:
- [ ] Backup database
- [ ] Test Admin/Staff appointment creation still works
- [ ] Verify no breaking changes to existing functionality

#### Frontend Tests:
- [ ] Customer can view appointments list
- [ ] Customer can see staff names in appointments
- [ ] Customer can book appointment with services
- [ ] Customer can book appointment with packages
- [ ] Customer can cancel own appointment
- [ ] Customer cannot see other customers' appointments
- [ ] Duration is calculated correctly based on services

#### Backend Tests:
- [ ] `GET /appointments` returns customer-filtered list
- [ ] `GET /appointments/:id` returns only customer's appointment
- [ ] `PATCH /appointments/:id/cancel` only allows customer's own appointments
- [ ] `POST /appointments` creates appointment with correct customer_id
- [ ] Staff names are included in response
- [ ] Admin/Staff can still see all appointments in their salon

#### Security Tests:
- [ ] Customer A cannot access Customer B's appointments (try ID enumeration)
- [ ] Customer cannot access appointments from different salon
- [ ] Unauthenticated requests are rejected
- [ ] Token expiration is handled correctly

---

## 📝 Implementation Order

**Phase 1: Backend First (Safe, Non-Breaking)**
1. Add staff_name JOINs to `index()` and `show()` methods
2. Add `myAppointments()` method
3. Add route for `myAppointments`
4. Test with Admin/Staff frontend (ensure no breaking changes)

**Phase 2: Frontend Second**
1. Fix appointments endpoint
2. Remove staff_id from booking payload
3. Add duration calculation
4. Test booking flow end-to-end

**Phase 3: Security Verification**
1. Test all authorization checks
2. Verify salon_id filtering on all endpoints
3. Test ID enumeration attacks

---

## 🔐 Security Principles

### Customer Access Rules:
1. **Own Data Only:** Customers can only access their own appointments, invoices, payments
2. **Salon Data:** Customers can view public salon data (services, packages, staff)
3. **No Cross-Salon Access:** Customers cannot access data from other salons
4. **No Admin/Staff Data:** Customers cannot access staff schedules, incentives, etc.

### Backend Enforcement:
```php
// ✅ GOOD: Customer authorization check
if ($auth['role'] === 'CUSTOMER') {
    $stmt = $this->db->prepare("SELECT * FROM appointments 
                                WHERE appointment_id = ? 
                                AND salon_id = ? 
                                AND customer_id = ?");  // Triple check
    $stmt->execute([$appointmentId, $salonId, $auth['customer_id']]);
}

// ❌ BAD: Missing customer_id check
$stmt = $this->db->prepare("SELECT * FROM appointments 
                            WHERE appointment_id = ? AND salon_id = ?");
$stmt->execute([$appointmentId, $salonId]);
```

---

## 📊 API Reference

### Endpoints Customers Use:

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/salon/info?salon_id={id}` | Get salon details | No |
| GET | `/services?salon_id={id}` | List services | No |
| GET | `/packages?salon_id={id}` | List packages | No |
| GET | `/staff?salon_id={id}` | List staff | No |
| POST | `/appointments` | Create appointment | Yes (Customer) |
| GET | `/appointments` | List own appointments | Yes (Customer) |
| GET | `/appointments/:id` | View appointment details | Yes (Customer) |
| PATCH | `/appointments/:id/cancel` | Cancel appointment | Yes (Customer) |
| POST | `/appointments/:id/feedback` | Submit feedback | Yes (Customer) |
| GET | `/customers/me/appointments` | List own appointments (NEW) | Yes (Customer) |

---

## 🚨 Rollback Plan

If issues occur after deployment:

1. **Frontend Rollback:**
   ```bash
   git checkout HEAD -- FRONTED/CUSTOMER/FRONTEND/Js/pages/appointments.js
   git checkout HEAD -- FRONTED/CUSTOMER/FRONTEND/Js/pages/booking.js
   ```

2. **Backend Rollback:**
   ```bash
   git checkout HEAD -- BACKEND/modules/appointments/AppointmentController.php
   git checkout HEAD -- BACKEND/modules/appointments/routes.php
   ```

3. **Database:** No schema changes required, so no rollback needed

---

## 📞 Contact

For questions about these fixes, refer to:
- Backend API Documentation: `BACKEND/API_DOCUMENTATION.txt`
- Database Schema: `BACKEND/documentation/DATABASE_DUMP.md`
- Original Analysis: `FRONTED/CUSTOMER/FRONTEND/API_FIX_TODO.md`

---

**Last Updated:** 2026-03-19  
**Status:** Ready for Implementation
