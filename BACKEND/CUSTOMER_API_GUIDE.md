# 🧑 CUSTOMER API GUIDE

**Salon Management System (SAM) - Customer Endpoints**

> **Base URL:** `http://localhost/Sam-Backend/BACKEND/public/index.php/api`

---

## 📋 TABLE OF CONTENTS

1. [🔐 Authentication](#-authentication)
2. [👤 Customer Profile](#-customer-profile)
3. [🛎 Services](#-services)
4. [📦 Packages](#-packages)
5. [📅 Appointments](#-appointments)
6. [🧾 Invoices](#-invoices)
7. [💳 Payments](#-payments)

---

## 🔐 AUTHENTICATION

### 1. Customer Login

**Action:** Authenticates customer and returns access + refresh tokens

**Endpoint:** `POST /api/auth/login`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/auth/login
```

**Request:**
```json
{
  "email": "customer@mail.com",
  "password": "123456",
  "login_type": "CUSTOMER",
  "salon_id": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "abc123def456...",
    "expires_in": 900
  }
}
```

---

### 2. Refresh Access Token

**Action:** Gets new access token using refresh token (when access token expires)

**Endpoint:** `POST /api/auth/refresh`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "abc123def456..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "xyz789ghi012...",
    "expires_in": 900
  }
}
```

---

### 3. Logout

**Action:** Revokes refresh token and logs out customer

**Endpoint:** `POST /api/auth/logout`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/auth/logout
```

**Request:**
```json
{
  "refresh_token": "abc123def456..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User (Me)

**Action:** Returns authenticated customer's details from JWT token

**Endpoint:** `GET /api/auth/me`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 25,
    "role": "CUSTOMER",
    "salon_id": 1,
    "customer_id": 25
  }
}
```

---

### 5. Update Own Profile

**Action:** Updates authenticated customer's profile information

**Endpoint:** `PUT /api/auth/me`

**Full URL:**
```
PUT http://localhost/Sam-Backend/BACKEND/public/index.php/api/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "John Updated",
  "phone": "9999999999",
  "email": "john.new@example.com"
}
```

**Response:**
```json
{
  "status": "success"
}
```

---

## 👤 CUSTOMER PROFILE

### 6. Customer Self Registration

**Action:** Registers new customer with authentication credentials

**Endpoint:** `POST /api/customers/register`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/customers/register
```

**Request:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "password": "123456",
  "salon_id": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Customer registered successfully"
}
```

---

### 7. View Customer Profile

**Action:** Retrieves detailed customer profile information

**Endpoint:** `GET /api/customers/view/{customer_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/customers/view/25
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_id": 25,
    "salon_id": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "gender": "MALE",
    "date_of_birth": "1990-05-15",
    "anniversary_date": "2015-06-20",
    "address": "123 Main St",
    "preferences": "Prefers morning appointments",
    "total_visits": 5,
    "last_visit_date": "2025-02-20",
    "customer_since": "2024-01-15",
    "status": "ACTIVE",
    "created_at": "2024-01-15 10:00:00",
    "updated_at": "2025-02-24 12:00:00"
  }
}
```

---

### 8. Update Own Profile (Customer)

**Action:** Customer updates their own profile information

**Endpoint:** `PATCH /api/customers/me`

**Full URL:**
```
PATCH http://localhost/Sam-Backend/BACKEND/public/index.php/api/customers/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "John Updated",
  "phone": "9999999999",
  "email": "john.new@example.com",
  "date_of_birth": "1990-05-15",
  "anniversary_date": "2015-06-20"
}
```

**Response:**
```json
{
  "status": "success"
}
```

---

## 🛎 SERVICES

### 9. List Services

**Action:** Retrieves all active services for the salon

**Endpoint:** `GET /api/services`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/services
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "service_id": 1,
        "service_name": "Haircut",
        "description": "Professional haircut service",
        "price": 500.00,
        "duration": 30,
        "image_url": "uploads/services/haircut.jpg",
        "status": "ACTIVE",
        "created_at": "2025-01-15 10:00:00"
      },
      {
        "service_id": 2,
        "service_name": "Facial",
        "description": "Premium facial treatment",
        "price": 1000.00,
        "duration": 60,
        "image_url": "uploads/services/facial.jpg",
        "status": "ACTIVE",
        "created_at": "2025-01-16 10:00:00"
      }
    ]
  }
}
```

---

### 10. View Service Details

**Action:** Retrieves single service details

**Endpoint:** `GET /api/services/{service_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/services/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "service_id": 1,
    "salon_id": 1,
    "service_name": "Haircut",
    "description": "Professional haircut service",
    "price": 500.00,
    "duration": 30,
    "image_url": "uploads/services/haircut.jpg",
    "status": "ACTIVE",
    "created_at": "2025-01-15 10:00:00",
    "updated_at": "2025-02-24 12:00:00"
  }
}
```

---

## 📦 PACKAGES

### 11. List Packages

**Action:** Retrieves all active packages for the salon

**Endpoint:** `GET /api/packages`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/packages
```

**Headers:**
```
Authorization: Bearer <access_token>
```

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
        "created_at": "2025-01-15 10:00:00"
      }
    ]
  }
}
```

---

### 12. View Package Details

**Action:** Retrieves package details with included services

**Endpoint:** `GET /api/packages/{package_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/packages/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "package_id": 1,
    "salon_id": 1,
    "package_name": "Bridal Package",
    "description": "Complete bridal makeover",
    "total_price": 15000.00,
    "validity_days": 30,
    "image_url": "uploads/packages/bridal.jpg",
    "status": "ACTIVE",
    "created_at": "2025-01-15 10:00:00",
    "updated_at": "2025-02-24 12:00:00",
    "services": [
      {
        "service_id": 1,
        "service_name": "Haircut",
        "description": "Professional haircut",
        "price": 500.00,
        "duration": 30
      },
      {
        "service_id": 2,
        "service_name": "Facial",
        "description": "Premium facial treatment",
        "price": 1000.00,
        "duration": 60
      }
    ]
  }
}
```

---

## 📅 APPOINTMENTS

### 13. Create Appointment

**Action:** Books new appointment with services and/or packages

**Endpoint:** `POST /api/appointments`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/appointments
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request (with services):**
```json
{
  "customer_id": 25,
  "appointment_date": "2025-03-01",
  "start_time": "10:00:00",
  "estimated_duration": 120,
  "notes": "First visit",
  "services": [
    {
      "service_id": 1,
      "staff_id": 1,
      "price": 500.00,
      "discount_amount": 50.00,
      "start_time": "10:00:00",
      "end_time": "10:45:00"
    }
  ],
  "packages": [],
  "discount_amount": 100.00
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "appointment_id": 1
  }
}
```

---

### 14. List Appointments

**Action:** Retrieves customer's appointments with optional filters

**Endpoint:** `GET /api/appointments`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/appointments
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `status`: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
- `date`: YYYY-MM-DD

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "appointment_id": 1,
        "salon_id": 1,
        "customer_id": 25,
        "appointment_date": "2025-03-01",
        "start_time": "10:00:00",
        "end_time": "12:00:00",
        "estimated_duration": 120,
        "total_amount": 5000.00,
        "discount_amount": 100.00,
        "final_amount": 4900.00,
        "status": "CONFIRMED",
        "cancellation_reason": null,
        "notes": "First visit",
        "customer_name": "John Doe",
        "customer_phone": "9876543210",
        "services": [
          {
            "service_id": 1,
            "service_name": "Haircut",
            "staff_id": 1,
            "service_price": 500.00,
            "discount_amount": 50.00,
            "final_price": 450.00,
            "start_time": "10:00:00",
            "end_time": "10:45:00",
            "status": "PENDING"
          }
        ],
        "packages": []
      }
    ]
  }
}
```

---

### 15. View Appointment Details

**Action:** Retrieves complete appointment information

**Endpoint:** `GET /api/appointments/{appointment_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/appointments/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "appointment_id": 1,
    "salon_id": 1,
    "customer_id": 25,
    "appointment_date": "2025-03-01",
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "estimated_duration": 120,
    "total_amount": 5000.00,
    "discount_amount": 100.00,
    "final_amount": 4900.00,
    "status": "CONFIRMED",
    "cancellation_reason": null,
    "notes": "First visit",
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "customer_email": "john@example.com",
    "services": [
      {
        "service_id": 1,
        "service_name": "Haircut",
        "staff_id": 1,
        "service_price": 500.00,
        "discount_amount": 50.00,
        "final_price": 450.00,
        "start_time": "10:00:00",
        "end_time": "10:45:00",
        "status": "PENDING"
      }
    ],
    "packages": [],
    "feedback_given": false
  }
}
```

---

### 16. Cancel Appointment

**Action:** Cancels appointment with reason

**Endpoint:** `PATCH /api/appointments/{appointment_id}/cancel`

**Full URL:**
```
PATCH http://localhost/Sam-Backend/BACKEND/public/index.php/api/appointments/1/cancel
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "cancellation_reason": "Customer requested cancellation due to emergency"
}
```

**Response:**
```json
{
  "status": "success"
}
```

---

### 17. Submit Appointment Feedback

**Action:** Customer submits rating and review for completed appointment

**Endpoint:** `POST /api/appointments/{appointment_id}/feedback`

**Full URL:**
```
POST http://localhost/Sam-Backend/BACKEND/public/index.php/api/appointments/1/feedback
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent service! Very professional staff.",
  "is_anonymous": false
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "feedback_id": 1
  }
}
```

---

### 18. Get Own Appointments

**Action:** Retrieves authenticated customer's appointment history

**Endpoint:** `GET /api/customers/me/appointments`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/customers/me/appointments
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `page`: 1 (default)
- `limit`: 20 (default)
- `status`: CONFIRMED | COMPLETED | CANCELLED

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "appointment_id": 1,
        "appointment_date": "2025-02-24",
        "start_time": "10:00:00",
        "status": "CONFIRMED",
        "services": [
          {
            "service_id": 1,
            "service_name": "Haircut",
            "staff_id": 2
          }
        ],
        "packages": [],
        "final_amount": 500.00,
        "feedback_given": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

### 19. Get Own Feedback

**Action:** Retrieves authenticated customer's feedback history

**Endpoint:** `GET /api/customers/me/feedback`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/customers/me/feedback
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `page`: 1 (default)
- `limit`: 20 (default)

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "feedback_id": 1,
        "appointment_id": 1,
        "rating": 5,
        "comment": "Excellent service!",
        "is_anonymous": false,
        "created_at": "2025-02-24 12:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3
    }
  }
}
```

---

## 🧾 INVOICES

### 20. List Invoices

**Action:** Retrieves customer's invoices

**Endpoint:** `GET /api/invoices`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/invoices
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `payment_status`: UNPAID | PARTIAL | PAID | REFUNDED
- `invoice_date`: YYYY-MM-DD

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "invoice_customer_id": 1,
        "appointment_id": 1,
        "salon_id": 1,
        "customer_id": 25,
        "invoice_number": "INV-1-20250224-0001",
        "subtotal_amount": 5000.00,
        "tax_amount": 900.00,
        "discount_amount": 500.00,
        "total_amount": 5400.00,
        "payment_status": "UNPAID",
        "invoice_date": "2025-02-24",
        "due_date": "2025-03-15",
        "notes": "Thank you for your business",
        "customer_name": "John Doe",
        "customer_phone": "9876543210",
        "appointment_date": "2025-03-01",
        "created_at": "2025-02-24 12:00:00",
        "updated_at": "2025-02-24 12:00:00"
      }
    ]
  }
}
```

---

### 21. View Invoice Details

**Action:** Retrieves invoice with payment history

**Endpoint:** `GET /api/invoices/{invoice_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/invoices/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "invoice_customer_id": 1,
    "appointment_id": 1,
    "salon_id": 1,
    "customer_id": 25,
    "invoice_number": "INV-1-20250224-0001",
    "subtotal_amount": 5000.00,
    "tax_amount": 900.00,
    "discount_amount": 500.00,
    "total_amount": 5400.00,
    "payment_status": "UNPAID",
    "invoice_date": "2025-02-24",
    "due_date": "2025-03-15",
    "notes": "Thank you for your business",
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "customer_email": "john@example.com",
    "appointment_date": "2025-03-01",
    "start_time": "10:00:00",
    "payments": [
      {
        "payment_id": 1,
        "payment_mode": "UPI",
        "transaction_no": "UPI123456789",
        "amount": 5400.00,
        "payment_date": "2025-02-24 15:30:00",
        "status": "SUCCESS"
      }
    ]
  }
}
```

---

### 22. Get Invoice by Appointment

**Action:** Retrieves invoice for specific appointment

**Endpoint:** `GET /api/invoices/appointment/{appointment_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/invoices/appointment/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "invoice_customer_id": 1,
    "appointment_id": 1,
    "salon_id": 1,
    "customer_id": 25,
    "invoice_number": "INV-1-20250224-0001",
    "subtotal_amount": 5000.00,
    "tax_amount": 900.00,
    "discount_amount": 500.00,
    "total_amount": 5400.00,
    "payment_status": "UNPAID",
    "invoice_date": "2025-02-24",
    "due_date": "2025-03-15",
    "notes": "Thank you for your business",
    "customer_name": "John Doe"
  }
}
```

---

### 23. Get Invoice Payments

**Action:** Retrieves all payments for customer invoice

**Endpoint:** `GET /api/invoices/customer/{invoice_customer_id}/payments`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/invoices/customer/1/payments
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "customer_payment_id": 1,
        "invoice_customer_id": 25,
        "payment_mode": "UPI",
        "transaction_no": "TXN123456",
        "amount": 3000.00,
        "payment_date": "2025-02-24 14:00:00",
        "status": "SUCCESS",
        "created_at": "2025-02-24 14:00:00"
      }
    ]
  }
}
```

---

## 💳 PAYMENTS

### 24. List Payments

**Action:** Retrieves customer's payment records

**Endpoint:** `GET /api/payments`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/payments
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `status`: SUCCESS | FAILED | PENDING | REFUNDED
- `invoice_id`: invoice_customer_id

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "customer_payment_id": 1,
        "invoice_customer_id": 25,
        "payment_mode": "UPI",
        "transaction_no": "UPI123456789",
        "amount": 5400.00,
        "payment_date": "2025-02-24 15:30:00",
        "status": "SUCCESS",
        "refund_reason": null,
        "invoice_number": "INV-1-20250224-0001",
        "customer_name": "John Doe",
        "created_at": "2025-02-24 15:30:00",
        "updated_at": "2025-02-24 15:30:00"
      }
    ]
  }
}
```

---

### 25. View Payment Details

**Action:** Retrieves single payment record

**Endpoint:** `GET /api/payments/{payment_id}`

**Full URL:**
```
GET http://localhost/Sam-Backend/BACKEND/public/index.php/api/payments/1
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_payment_id": 1,
    "invoice_customer_id": 25,
    "payment_mode": "UPI",
    "transaction_no": "UPI123456789",
    "amount": 5400.00,
    "payment_date": "2025-02-24 15:30:00",
    "status": "SUCCESS",
    "refund_reason": null,
    "invoice_number": "INV-1-20250224-0001",
    "total_amount": 5400.00,
    "customer_name": "John Doe"
  }
}
```

---

## 📝 IMPORTANT NOTES

### 🔐 Authentication

1. **Access Token:** Must be included in the `Authorization` header for all protected endpoints
2. **Token Format:** `Authorization: Bearer <access_token>`
3. **Token Expiry:** Access tokens expire after 15 minutes
4. **Refresh Token:** Use `/api/auth/refresh` to get new access token

### ⚠️ Access Restrictions

**Customers CANNOT:**
- ❌ Access Subscription Plans APIs
- ❌ Access Salon Subscription APIs
- ❌ CREATE invoices (only ADMIN/STAFF can)
- ❌ CREATE payments (only ADMIN/STAFF can)
- ❌ UPDATE invoices (only ADMIN/STAFF can)

**Customers CAN:**
- ✅ VIEW their own invoices
- ✅ VIEW their own payment history
- ✅ VIEW services and packages
- ✅ CREATE, VIEW, CANCEL their own appointments
- ✅ SUBMIT feedback for completed appointments

### 📊 Summary

| Module | Total APIs | Customer Access |
|--------|-----------|-----------------|
| Authentication | 5 | ✅ All (Login, Refresh, Logout, Me, Update) |
| Customer Profile | 4 | ✅ All (Register, View, Update, Appointments, Feedback) |
| Services | 2 | ✅ All (List, View) |
| Packages | 2 | ✅ All (List, View) |
| Appointments | 5 | ✅ All (Create, List, View, Cancel, Feedback) |
| Invoices | 4 | ✅ VIEW Only (List, View, By Appointment, Payments) |
| Payments | 3 | ✅ VIEW Only (List, View) |
| **TOTAL** | **25** | **✅ All Customer APIs** |

---

**Generated:** 2026-03-04  
**SAM Backend Version:** 1.0  
**Base URL:** `http://localhost/Sam-Backend/BACKEND/public/index.php/api`
