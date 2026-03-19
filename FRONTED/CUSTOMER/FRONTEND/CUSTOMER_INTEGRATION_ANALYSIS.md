# Customer Frontend - Backend Integration Analysis

**Generated:** 2026-03-19  
**Project:** SAM (Salon Appointment Management)  
**Frontend Location:** `FRONTED/CUSTOMER/FRONTEND/`  
**Backend Location:** `BACKEND/`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Overview](#database-schema-overview)
3. [Frontend Architecture](#frontend-architecture)
4. [API Integration Matrix](#api-integration-matrix)
5. [Page-by-Page Analysis](#page-by-page-analysis)
6. [Authentication & Authorization](#authentication--authorization)
7. [Old Backend vs Current Backend Comparison](#old-backend-vs-current-backend-comparison)
8. [Identified Issues & Gaps](#identified-issues--gaps)
9. [Recommendations](#recommendations)

---

## Executive Summary

### System Overview
The customer frontend is a single-page application (SPA-like) built with vanilla JavaScript that provides customers with:
- Service browsing and booking
- Package browsing and booking
- Appointment management
- Profile management
- Contact functionality

### Key Statistics
- **Total Pages:** 10 HTML pages
- **JavaScript Modules:** 9 page-specific + 3 core modules
- **APIs Consumed:** 15+ endpoints
- **Database Tables Involved:** 12+ tables

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER FRONTEND                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   HTML      │  │   CSS        │  │   JavaScript    │   │
│  │   (10 pages)│  │   (Styling)  │  │   (9 modules)   │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (PHP)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Routes    │  │ Controllers  │  │   Database      │   │
│  │   (15 APIs) │  │   (5 modules)│  │   (PDO/MySQL)   │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

### Core Customer Tables

#### 1. `customers` Table
```sql
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `anniversary_date` date DEFAULT NULL,
  `address` text,
  `preferences` text,
  `total_visits` int DEFAULT '0',
  `last_visit_date` date DEFAULT NULL,
  `customer_since` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`)
)
```
**Row Count:** 29 records (as of dump)

#### 2. `customer_authentication` Table
```sql
CREATE TABLE `customer_authentication` (
  `auth_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_id`)
)
```

#### 3. `appointments` Table
```sql
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `estimated_duration` int DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `cancellation_reason` text,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`)
)
```

#### 4. `appointment_services` Table
**Row Count:** 128 records
**Purpose:** Links services to appointments with pricing

#### 5. `appointment_packages` Table
**Row Count:** 31 records
**Purpose:** Links packages to appointments with pricing

### Related Tables
- `services` - Service catalog
- `packages` - Package catalog
- `package_services` - Package-Service mapping
- `salons` - Salon information
- `staff_info` - Staff details
- `appointment_feedback` - Customer reviews
- `refresh_tokens` - JWT refresh tokens

---

## Frontend Architecture

### Directory Structure
```
FRONTED/CUSTOMER/FRONTEND/
├── Assets/
│   └── images/
├── CSS/
│   ├── Base/
│   │   └── main.css
│   └── Components/
├── html/
│   ├── booking.html
│   ├── contactUs.html
│   ├── login.html
│   ├── mobileCart.html
│   ├── myAppointment.html
│   ├── packages.html
│   ├── profileInfo.html
│   ├── salon-id-switcher.html
│   ├── services.html
│   └── signup.html
├── Js/
│   ├── Core/
│   │   ├── alert.js
│   │   ├── CartManager.js
│   │   └── config.js
│   ├── pages/
│   │   ├── appointments.js
│   │   ├── booking.js
│   │   ├── contactUs.js
│   │   ├── login.js
│   │   ├── mobileCart.js
│   │   ├── packages.js
│   │   ├── profileInfo.js
│   │   ├── services.js
│   │   └── signup.js
│   └── index.js
├── index.html
├── API_FIX_TODO.md
└── README.md
```

### Core Configuration

#### `config.js`
```javascript
const API_BASE_URL = "http://localhost/Sam-Backend/BACKEND/public/index.php/api";
const IMAGE_BASE = "http://localhost/Sam-Backend/BACKEND/public/";
const salonId = urlParams.get('salon_id') || storedSalonId || 1;
```

**Key Points:**
- Base API URL points to local development server
- Salon ID configuration supports URL params, localStorage, or default
- Image base URL for serving uploaded images

### State Management

#### Cart System (`CartManager.js`)
- **Storage:** localStorage
- **Key:** `bookingItems`
- **Methods:**
  - `getCart()` - Retrieve cart items
  - `saveCart(cart)` - Persist cart
  - `toggleService(service)` - Add/remove service
  - `removeService(serviceId)` - Remove specific item
  - `clearCart()` - Empty cart
  - `getSubtotal()` - Calculate total
  - `sendToBooking()` - Prepare for checkout

---

## API Integration Matrix

### Authentication APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/auth/login` | POST | `login.js` | Customer login | ✅ Working |
| `/api/auth/refresh` | POST | - | Token refresh | ⚠️ Not called in frontend |
| `/api/auth/logout` | POST | `index.js`, `services.js`, `packages.js`, `appointments.js` | Logout | ✅ Working |
| `/api/auth/me` | GET | `profileInfo.js` | Get current user | ✅ Working |

### Customer APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/customers/register` | POST | `signup.js` | Self registration | ✅ Working |
| `/api/customers/me` | PATCH | `profileInfo.js` | Update own profile | ✅ Working |
| `/api/customers/view/{id}` | GET | `profileInfo.js` | View profile | ✅ Working |
| `/api/customers/me/appointments` | GET | `appointments.js` | Get my appointments | ✅ Working |

### Service APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/services` | GET | `index.js`, `services.js` | List services | ✅ Working |
| `/api/services/{id}` | GET | - | Service details | ⚠️ Not used |

### Package APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/packages` | GET | `index.js`, `packages.js` | List packages | ✅ Working |
| `/api/packages/{id}` | GET | - | Package details | ⚠️ Not used |

### Appointment APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/appointments` | POST | `booking.js` | Create appointment | ✅ Working |
| `/api/appointments/{id}/cancel` | PATCH | `appointments.js` | Cancel appointment | ✅ Working |
| `/api/appointments` | GET | `appointments.js` | List appointments | ⚠️ Uses `/me/appointments` |

### Salon APIs

| Endpoint | Method | Frontend File | Purpose | Status |
|----------|--------|---------------|---------|--------|
| `/api/salon/info` | GET | All pages | Get salon info | ✅ Working |
| `/api/staff` | GET | `booking.js` | List staff | ✅ Working |

---

## Page-by-Page Analysis

### 1. Landing Page (`index.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/index.html`  
**JS:** `Js/index.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info (Public)
GET /api/salon/info?salon_id=${salonId}
Response: { salon_name, address, city, state, country, phone, email }

// 2. Fetch Services (Public)
GET /api/services?salon_id=${salonId}
Response: { items: [{ service_id, service_name, price, duration, image_url, category }] }

// 3. Fetch Packages (Public)
GET /api/packages?salon_id=${salonId}
Response: { items: [{ package_id, package_name, total_price, validity_days, image_url }] }

// 4. Logout (Authenticated)
POST /api/auth/logout
Body: { refresh_token: string }
```

#### Data Flow:
```
Page Load → checkAuth() → fetchSalonInfo() → loadLandingData()
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            fetchServices()                 fetchPackages()
                    ↓                               ↓
            renderServices()                renderPackages()
```

#### Fields Displayed:
- **Salon Info:** salon_name, address, city, state, country, phone, email
- **Services:** service_id, service_name, price, duration, image_url, category
- **Packages:** package_id, package_name, total_price, validity_days, image_url

---

### 2. Login Page (`login.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/login.html`  
**JS:** `Js/pages/login.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info
GET /api/salon/info?salon_id=${salonId}

// 2. Customer Login
POST /api/auth/login
Body: {
  password: string,
  login_type: "CUSTOMER",
  salon_id: number,
  phone?: string,      // Either phone OR email
  email?: string
}
Response: {
  status: "success",
  data: {
    access_token: string,
    refresh_token: string,
    expires_in: number
  }
}
```

#### Validation:
- Password required (min 6 characters - backend validation)
- Either mobile OR email required
- Mobile: 10 digits, Indian format (6-9xxxxxxxxx)
- Email: Valid format

#### Storage:
```javascript
localStorage.setItem("auth_token", accessToken);
localStorage.setItem("refresh_token", refreshToken);
```

---

### 3. Signup Page (`signup.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/signup.html`  
**JS:** `Js/pages/signup.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info
GET /api/salon/info?salon_id=${salonId}

// 2. Customer Registration
POST /api/customers/register
Body: {
  name: string,
  phone: string (10 digits),
  email: string,
  password: string (min 6 chars),
  salon_id: number
}
```

#### Validation (Frontend):
- Name: min 3 characters
- Mobile: exactly 10 digits, numeric only
- Email: valid format
- Password: min 6 characters
- Password confirmation must match

#### Backend Validation (CustomerController.php::register):
1. Required fields: name, password, salon_id
2. Either phone OR email required
3. Salon existence check
4. Phone uniqueness (per salon)
5. Email uniqueness (per salon)

---

### 4. Services Page (`services.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/services.html`  
**JS:** `Js/pages/services.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info
GET /api/salon/info?salon_id=${salonId}

// 2. Fetch Services
GET /api/services?salon_id=${salonId}
Response: {
  status: "success",
  data: {
    items: [{
      service_id,
      service_name,
      description,
      price,
      duration,
      image_url,
      status,
      category
    }]
  }
}
```

#### Features:
- **Search:** Client-side filtering by service name
- **Category Filter:** all, hair, nails, face, skin
- **Cart Management:** Add/remove services via CartManager
- **Tax Calculation:** 5% GST on subtotal

#### Cart Data Structure:
```javascript
{
  service_id: string,
  service_name: string,
  price: number,
  duration: string,
  category: string
}
```

---

### 5. Packages Page (`packages.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/packages.html`  
**JS:** `Js/pages/packages.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info
GET /api/salon/info?salon_id=${salonId}

// 2. Fetch Packages
GET /api/packages?salon_id=${salonId}
Response: {
  status: "success",
  data: {
    items: [{
      package_id,
      package_name,
      description,
      total_price,
      validity_days,
      image_url,
      status,
      services: "service1,service2,..."  // Comma-separated
    }]
  }
}
```

#### Features:
- Search by package name
- View details modal
- Direct booking (single package)

---

### 6. Booking Page (`booking.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/booking.html`  
**JS:** `Js/pages/booking.js`

#### API Calls:
```javascript
// 1. Fetch Salon Info
GET /api/salon/info?salon_id=${salonId}

// 2. Fetch Staff
GET /api/staff?salon_id=${salonId}
Response: {
  status: "success",
  data: {
    items: [{
      staff_id,
      name,
      specialization
    }]
  }
}

// 3. Create Appointment (Authenticated)
POST /api/appointments
Headers: { Authorization: "Bearer ${token}" }
Body: {
  appointment_date: "YYYY-MM-DD",
  start_time: "HH:MM:SS",
  estimated_duration: number (minutes),
  services: [{
    service_id: number,
    staff_id: number,
    price: number
  }] | [],
  packages: [{
    package_id: number,
    staff_id: number,
    price: number
  }] | []
}
```

#### State Management:
```javascript
const bookingData = {
  type: "services" | "packages",
  items: [],           // From localStorage
  staff: null,
  staff_name: null,
  date: Date,
  time: "HH:MM AM/PM",
  totalAmount: number,
  status: "pending"
};
```

#### Business Logic:
- **Business Hours:** 10:00 AM - 10:45 PM (enforced by clock UI)
- **Time Slots:** 15-minute intervals
- **Default Duration:** 60 minutes
- **Tax:** 5% included in total calculation

---

### 7. My Appointments Page (`myAppointment.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/myAppointment.html`  
**JS:** `Js/pages/appointments.js`

#### API Calls:
```javascript
// 1. Fetch Appointments (Authenticated)
GET /api/customers/me/appointments
Headers: { Authorization: "Bearer ${token}" }
Response: {
  status: "success",
  data: {
    items: [{
      appointment_id,
      salon_id,
      customer_id,
      appointment_date,
      start_time,
      end_time,
      estimated_duration,
      total_amount,
      discount_amount,
      final_amount,
      status,
      cancellation_reason,
      notes,
      created_at,
      updated_at,
      services: [{
        service_id,
        service_name,
        staff_id,
        staff_name
      }],
      packages: [{
        package_id,
        package_name,
        staff_id,
        staff_name
      }],
      feedback_given: boolean
    }],
    pagination: {
      page: number,
      limit: number,
      total: number
    }
  }
}

// 2. Cancel Appointment (Authenticated)
PATCH /api/appointments/{appointment_id}/cancel
Headers: { Authorization: "Bearer ${token}" }
Body: {
  cancellation_reason: string
}
```

#### Features:
- **Tab System:** Upcoming | Past
- **Sorting:**
  - Upcoming: Soonest first (ASC)
  - Past: Most recent first (DESC)
- **Status Badges:** PENDING, CONFIRMED, CANCELLED, COMPLETED
- **Cancel Button:** Only for non-cancelled appointments

---

### 8. Profile Info Page (`profileInfo.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/profileInfo.html`  
**JS:** `Js/pages/profileInfo.js`

#### API Calls:
```javascript
// 1. Get Current User
GET /api/auth/me
Headers: { Authorization: "Bearer ${token}" }
Response: {
  status: "success",
  data: {
    customer_id,
    role: "CUSTOMER",
    salon_id
  }
}

// 2. Fetch Customer Profile
GET /api/customers/view/{customer_id}
Headers: { Authorization: "Bearer ${token}" }
Response: {
  status: "success",
  data: {
    customer_id,
    salon_id,
    name,
    phone,
    email,
    gender,
    date_of_birth,
    anniversary_date,
    address,
    preferences,
    status,
    created_at,
    updated_at
  }
}

// 3. Update Profile (PATCH)
PATCH /api/customers/me
Headers: {
  Authorization: "Bearer ${token}",
  "Content-Type": "application/json"
}
Body: {
  name: string,
  email: string,
  address: string,
  date_of_birth: "YYYY-MM-DD",
  anniversary_date: "YYYY-MM-DD",
  gender: "MALE"|"FEMALE"|"OTHER",
  preferences: string
}
```

#### Features:
- **Age Calculation:** Frontend only (from DOB)
- **Gender Lock:** Once set, cannot be changed (business rule)
- **Preferences:** Free text for customer preferences

---

### 9. Mobile Cart Page (`mobileCart.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/mobileCart.html`  
**JS:** `Js/pages/mobileCart.js`

#### Purpose:
- Mobile-optimized cart view
- Service list with remove functionality
- Summary display (subtotal, total)
- Proceed to booking

#### Data Source:
- localStorage key: `bookingItems`

---

### 10. Contact Us Page (`contactUs.html`)

**File:** `FRONTED/CUSTOMER/FRONTEND/html/contactUs.html`  
**JS:** `Js/pages/contactUs.js`

**Note:** Currently no backend API integration. Form submission not implemented.

---

## Authentication & Authorization

### Token-Based Authentication

#### Flow:
```
1. Login → POST /api/auth/login
           ↓
2. Receive { access_token, refresh_token }
           ↓
3. Store in localStorage
           ↓
4. Include in requests: Authorization: Bearer {access_token}
           ↓
5. Token expires (15 min) → Use refresh_token
           ↓
6. Refresh → POST /api/auth/refresh
```

#### Token Structure (JWT):
```javascript
// Access Token Payload
{
  user_id: number,
  role: "CUSTOMER",
  customer_id: number,
  salon_id: number,
  iat: timestamp,
  exp: timestamp  // 15 minutes
}

// Refresh Token
// - Stored in database (refresh_tokens table)
// - 7 days expiry
// - Hashed with SHA-256 before storage
```

### Authorization Middleware

#### Route Protection:
```php
// Example: Customer-only route
$router->register('GET', '/api/customers/me/appointments', function() use ($customerController) {
    authorize(['CUSTOMER']);  // Only CUSTOMER role
    $customerController->getMyAppointments();
});

// Example: Mixed access
$router->register('GET', '/api/services', function() use ($controller) {
    authenticate(false);  // Optional auth
    $controller->index();
});
```

### Security Features:

1. **Password Hashing:** bcrypt (PASSWORD_BCRYPT)
2. **Token Rotation:** Refresh tokens are rotated on use
3. **Token Revocation:** Logout revokes refresh token
4. **Role-Based Access:** authorize() middleware checks roles
5. **Salon Isolation:** All queries scoped to salon_id

---

## Old Backend vs Current Backend Comparison

### Old Backend Location:
`FRONTED/CUSTOMER/Customer backend changed/Customer backend changed/`

### Current Backend Location:
`BACKEND/`

### Controller Comparison

#### 1. CustomerController

| Feature | Old Backend | Current Backend | Status |
|---------|-------------|-----------------|--------|
| Registration | ✅ | ✅ | Compatible |
| Login | ❌ (Separate AuthController) | ✅ (AuthController) | Moved |
| Update Profile | ✅ | ✅ | Compatible |
| Get Appointments | ❌ | ✅ | Added |
| Get Feedback | ❌ | ✅ | Added |

#### 2. AppointmentController

| Feature | Old Backend | Current Backend | Changes |
|---------|-------------|-----------------|---------|
| Create | ✅ | ✅ | Enhanced validation |
| Update | ✅ | ✅ | Same |
| Cancel | ✅ | ✅ | Security fix added |
| List | ✅ | ✅ | Role-based filtering |
| View | ✅ | ✅ | Security fix added |
| Submit Feedback | ✅ | ✅ | Same |
| Approve | ✅ | ✅ | Same |
| Complete | ✅ | ✅ | Same |

**Security Fixes in Current Backend:**
```php
// OLD: Fetch appointment first, then check authorization
$appointment = $this->db->query("SELECT * FROM appointments WHERE appointment_id = $id");
if ($auth['role'] === 'CUSTOMER' && $appointment['customer_id'] != $auth['customer_id']) {
    return 403;
}

// NEW: Check authorization in query
if ($auth['role'] === 'CUSTOMER') {
    $stmt = $this->db->prepare("SELECT * FROM appointments 
        WHERE appointment_id = ? AND salon_id = ? AND customer_id = ?");
    $stmt->execute([$id, $salonId, $auth['customer_id']]);
}
```

#### 3. ServiceController

| Feature | Old Backend | Current Backend | Status |
|---------|-------------|-----------------|---------|
| Create | ✅ (Admin) | ✅ (Admin) | Compatible |
| Update | ✅ (Admin) | ✅ (Admin) | Compatible |
| Toggle Status | ✅ (Admin) | ✅ (Admin) | Compatible |
| List | ✅ | ✅ | Enhanced (role-based) |
| View | ✅ | ✅ | Compatible |

**Key Enhancement:**
- Current backend supports PUBLIC access for landing page
- Role-based filtering (CUSTOMER sees ACTIVE only)

#### 4. PackageController

| Feature | Old Backend | Current Backend | Status |
|---------|-------------|-----------------|---------|
| Create | ✅ (Admin) | ✅ (Admin) | Compatible |
| Update | ✅ (Admin) | ✅ (Admin) | Compatible |
| Toggle Status | ✅ (Admin) | ✅ (Admin) | Compatible |
| List | ✅ | ✅ | Enhanced (role-based) |
| View | ✅ | ✅ | Compatible |

### Route Comparison

#### Old Routes (Customer Backend):
```php
// Staff routes only (no customer routes)
GET  /api/staff              // Public staff list
```

#### Current Routes (Backend):
```php
// Customer Routes
POST   /api/customers/register
GET    /api/customers/me/appointments
PATCH  /api/customers/me
GET    /api/customers/view/{id}

// Auth Routes
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Service Routes (Public)
GET    /api/services
GET    /api/services/{id}

// Package Routes (Public)
GET    /api/packages
GET    /api/packages/{id}

// Appointment Routes
POST   /api/appointments
PATCH  /api/appointments/{id}/cancel
```

### Database Schema Changes

#### No Breaking Changes
The old backend and current backend use the **same database schema**. All tables are compatible.

#### New Tables (Current Backend):
- `password_reset_tokens` - Secure password reset
- `user_activity_log` - Audit logging
- `user_password_history` - Password history
- `billing_calculation_logs` - Billing audit
- `billing_audit_logs` - Financial audit

---

## Identified Issues & Gaps

### 1. Critical Issues

#### Issue #1: Salon ID Hardcoded
**Location:** Multiple files  
**Problem:** `salon_id: 1` hardcoded in login.js, signup.js  
**Impact:** Multi-tenancy broken  
**Fix Required:**
```javascript
// Current (WRONG)
const payload = {
  password: password,
  login_type: "CUSTOMER",
  salon_id: 1  // ❌ Hardcoded
};

// Should be
const payload = {
  password: password,
  login_type: "CUSTOMER",
  salon_id: salonId  // ✅ Use config
};
```

#### Issue #2: Refresh Token Not Used
**Location:** All authenticated pages  
**Problem:** Access token expiry not handled  
**Impact:** Session expires after 15 minutes, user must re-login  
**Fix Required:** Implement token refresh mechanism

#### Issue #3: Contact Form Not Implemented
**Location:** `contactUs.html`, `contactUs.js`  
**Problem:** No backend API for contact form submission  
**Impact:** Feature incomplete

### 2. Medium Priority Issues

#### Issue #4: Missing Feedback Submission
**Location:** `appointments.js`  
**Problem:** `feedback_given` field fetched but no UI to submit feedback  
**Impact:** Customers cannot rate appointments

#### Issue #5: Package Booking Limited
**Location:** `packages.js`  
**Problem:** Can only book one package at a time  
**Impact:** Cannot combine multiple packages

#### Issue #6: No Image Upload
**Location:** Profile page  
**Problem:** No profile picture upload functionality  
**Impact:** Limited personalization

### 3. Low Priority Issues

#### Issue #7: Google Login Placeholder
**Location:** `login.html`  
**Problem:** "Login with Google" button has no functionality  
**Impact:** Misleading UI

#### Issue #8: No Email Verification
**Location:** `signup.js`  
**Problem:** Email not verified during registration  
**Impact:** Fake accounts possible

#### Issue #9: Limited Search
**Location:** `services.js`, `packages.js`  
**Problem:** Search only by name, not description or category  
**Impact:** Poor discoverability

---

## Recommendations

### Immediate Actions (High Priority)

1. **Fix Salon ID Configuration:**
   - Replace all hardcoded `salon_id: 1` with dynamic `salonId` from config
   - Files to update: `login.js`, `signup.js`

2. **Implement Token Refresh:**
   - Add interceptor for 401 responses
   - Call `/api/auth/refresh` automatically
   - Retry failed request with new token

3. **Add Contact Form Backend:**
   - Create `ContactController.php`
   - Add route: `POST /api/contact/submit`
   - Store in new table `contact_submissions`

### Short-term Improvements (Medium Priority)

4. **Feedback Submission UI:**
   - Add modal for rating completed appointments
   - Create API: `POST /api/appointments/{id}/feedback`
   - Fields: rating (1-5), comment, is_anonymous

5. **Multi-Package Booking:**
   - Extend CartManager to support packages
   - Update booking.js to handle mixed cart

6. **Profile Picture Upload:**
   - Add file input to profile form
   - Create endpoint: `POST /api/customers/me/avatar`
   - Store in `uploads/customers/`

### Long-term Enhancements (Low Priority)

7. **Google OAuth Integration:**
   - Use Google Identity Services SDK
   - Create endpoint: `POST /api/auth/google`
   - Link/merge with existing account

8. **Email Verification:**
   - Send verification email on signup
   - Create endpoint: `POST /api/auth/verify-email`
   - Block login until verified

9. **Advanced Search:**
   - Add full-text search on services
   - Filter by price range, duration
   - Sort by popularity, price

### Code Quality Improvements

10. **Error Handling:**
    - Standardize error responses
    - Add global error handler
    - Log errors to backend

11. **Loading States:**
    - Add skeleton loaders
    - Show progress indicators
    - Disable buttons during async operations

12. **Accessibility:**
    - Add ARIA labels
    - Keyboard navigation
    - Screen reader support

---

## Appendix A: Complete API Reference

### Authentication Endpoints

#### POST /api/auth/login
**Access:** Public  
**Body:**
```json
{
  "email": "customer@example.com",  // OR phone
  "phone": "9876543210",            // OR email
  "password": "password123",
  "salon_id": 1,
  "login_type": "CUSTOMER"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "abc123...",
    "expires_in": 900
  }
}
```

#### POST /api/auth/logout
**Access:** Authenticated  
**Body:**
```json
{
  "refresh_token": "abc123..."
}
```

#### GET /api/auth/me
**Access:** Authenticated  
**Headers:** `Authorization: Bearer {access_token}`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_id": 27,
    "role": "CUSTOMER",
    "salon_id": 1
  }
}
```

### Customer Endpoints

#### POST /api/customers/register
**Access:** Public  
**Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "password": "password123",
  "salon_id": 1
}
```

#### PATCH /api/customers/me
**Access:** CUSTOMER only  
**Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "address": "123 Main St",
  "date_of_birth": "1990-01-01",
  "anniversary_date": "2015-06-15",
  "gender": "MALE",
  "preferences": "Prefer weekend appointments"
}
```

#### GET /api/customers/me/appointments
**Access:** CUSTOMER only  
**Query Params:** `?page=1&limit=20&status=PENDING`  
**Response:** See Appointment Object below

### Service Endpoints

#### GET /api/services
**Access:** Public (ACTIVE only) | Authenticated (role-based)  
**Query Params:** `?salon_id=1&status=ACTIVE`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "service_id": 1,
        "service_name": "Haircut",
        "description": "Professional haircut",
        "price": 500.00,
        "duration": 30,
        "image_url": "uploads/services/haircut.jpg",
        "status": "ACTIVE",
        "category": "hair",
        "created_at": "2026-02-25 22:21:36"
      }
    ]
  }
}
```

### Package Endpoints

#### GET /api/packages
**Access:** Public (ACTIVE only) | Authenticated (role-based)  
**Query Params:** `?salon_id=1&status=ACTIVE`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "package_id": 1,
        "package_name": "Bridal Package",
        "description": "Complete bridal makeover",
        "total_price": 15000.00,
        "validity_days": 30,
        "image_url": "uploads/packages/bridal.jpg",
        "status": "ACTIVE",
        "services": "1,2,3,4,8",
        "discount": null,
        "created_at": "2026-02-25 22:21:36"
      }
    ]
  }
}
```

### Appointment Endpoints

#### POST /api/appointments
**Access:** Authenticated (ADMIN, STAFF, CUSTOMER)  
**Body:**
```json
{
  "appointment_date": "2026-03-25",
  "start_time": "14:00:00",
  "estimated_duration": 60,
  "notes": "First time visit",
  "services": [
    {
      "service_id": 1,
      "staff_id": 5,
      "price": 500,
      "discount_amount": 0,
      "start_time": "14:00:00",
      "end_time": "14:30:00"
    }
  ],
  "packages": []
}
```

#### PATCH /api/appointments/{id}/cancel
**Access:** Authenticated (CUSTOMER can cancel own)  
**Body:**
```json
{
  "cancellation_reason": "Change of plans"
}
```

### Salon Endpoints

#### GET /api/salon/info
**Access:** Public  
**Query Params:** `?salon_id=1`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "salon_id": 1,
    "salon_name": "Elite Beauty Salon",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "phone": "9876543210",
    "email": "info@elitesalon.com"
  }
}
```

#### GET /api/staff
**Access:** Public  
**Query Params:** `?salon_id=1`  
**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "staff_id": 1,
        "name": "Priya Sharma",
        "specialization": "Hair Stylist",
        "phone": "9876543211",
        "email": "priya@elitesalon.com"
      }
    ]
  }
}
```

---

## Appendix B: Database Entity Relationships

```
┌─────────────────┐       ┌──────────────────┐
│     salons      │       │ super_admin_login│
│─────────────────│       │──────────────────│
│ salon_id (PK)   │◄──────│ super_admin_id   │
│ salon_name      │       │ email            │
│ address         │       │ password_hash    │
│ city            │       └──────────────────┘
│ state           │
│ country         │
│ phone           │
│ email           │
└────────┬────────┘
         │
         │ salon_id (FK)
         ▼
┌─────────────────┐       ┌──────────────────┐
│   customers     │       │customer_auth     │
│─────────────────│       │──────────────────│
│ customer_id(PK) │◄──────│ auth_id (PK)     │
│ salon_id (FK)   │       │ customer_id (FK) │
│ name            │       │ salon_id (FK)    │
│ phone           │       │ email            │
│ email           │       │ password_hash    │
│ gender          │       │ status           │
│ date_of_birth   │       └──────────────────┘
│ anniversary_date│
│ address         │
│ preferences     │
│ status          │
└────────┬────────┘
         │
         │ customer_id (FK)
         ▼
┌─────────────────┐
│  appointments   │
│─────────────────│
│ appointment_id  │
│ salon_id (FK)   │
│ customer_id(FK) │
│ appointment_date│
│ start_time      │
│ end_time        │
│ status          │
│ total_amount    │
│ final_amount    │
└────────┬────────┘
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│appointment_svc  │   │appointment_pkg  │   │appointment_fbk  │
│─────────────────│   │─────────────────│   │─────────────────│
│ appt_svc_id     │   │ appt_pkg_id     │   │ feedback_id     │
│ appointment_id  │   │ appointment_id  │   │ appointment_id  │
│ service_id (FK) │   │ package_id (FK) │   │ customer_id (FK)│
│ staff_id (FK)   │   │ staff_id (FK)   │   │ rating          │
│ service_price   │   │ package_price   │   │ comment         │
│ final_price     │   │ final_price     │   │ is_anonymous    │
└────────┬────────┘   └────────┬────────┘   └─────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│    services     │   │    packages     │
│─────────────────│   │─────────────────│
│ service_id (PK) │   │ package_id (PK) │
│ salon_id (FK)   │   │ salon_id (FK)   │
│ service_name    │   │ package_name    │
│ price           │   │ total_price     │
│ duration        │   │ validity_days   │
│ category        │   │ description     │
└─────────────────┘   └────────┬────────┘
                               │
                               │ package_id (FK)
                               ▼
                      ┌─────────────────┐
                      │ package_services│
                      │─────────────────│
                      │ package_id (FK) │
                      │ service_id (FK) │
                      │ salon_id (FK)   │
                      └─────────────────┘
```

---

## Appendix C: File Checklist

### Frontend Files Analyzed

#### HTML (10 files)
- [x] `index.html`
- [x] `html/login.html`
- [x] `html/signup.html`
- [x] `html/services.html`
- [x] `html/packages.html`
- [x] `html/booking.html`
- [x] `html/myAppointment.html`
- [x] `html/profileInfo.html`
- [x] `html/mobileCart.html`
- [x] `html/contactUs.html`
- [x] `html/salon-id-switcher.html`

#### JavaScript (13 files)
- [x] `Js/index.js`
- [x] `Js/Core/config.js`
- [x] `Js/Core/alert.js`
- [x] `Js/Core/CartManager.js`
- [x] `Js/pages/login.js`
- [x] `Js/pages/signup.js`
- [x] `Js/pages/services.js`
- [x] `Js/pages/packages.js`
- [x] `Js/pages/booking.js`
- [x] `Js/pages/appointments.js`
- [x] `Js/pages/profileInfo.js`
- [x] `Js/pages/mobileCart.js`
- [x] `Js/pages/contactUs.js`

#### Backend Controllers (Current)
- [x] `BACKEND/modules/auth/AuthController.php`
- [x] `BACKEND/modules/customers/CustomerController.php`
- [x] `BACKEND/modules/appointments/AppointmentController.php`
- [x] `BACKEND/modules/services/ServiceController.php`
- [x] `BACKEND/modules/packages/PackageController.php`
- [x] `BACKEND/modules/salons/SalonController.php`

#### Backend Routes (Current)
- [x] `BACKEND/modules/auth/routes.php`
- [x] `BACKEND/modules/customers/routes.php`
- [x] `BACKEND/modules/appointments/routes.php`
- [x] `BACKEND/modules/services/routes.php`
- [x] `BACKEND/modules/packages/routes.php`
- [x] `BACKEND/modules/salons/routes.php`

#### Old Backend (Customer Backend Changed)
- [x] `Customer backend changed/CustomerController.php`
- [x] `Customer backend changed/AppointmentController.php`
- [x] `Customer backend changed/ServiceController.php`
- [x] `Customer backend changed/PackageController.php`
- [x] `Customer backend changed/StaffController.php`
- [x] `Customer backend changed/routes.php`

#### Database Documentation
- [x] `BACKEND/DOCUMENTATION/DATABASE_DUMP.md` (Full schema + sample data)

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-19  
**Author:** AI Assistant  
**Review Status:** Complete
