# SAM Backend - Salon Management System

**Complete API Documentation & Access Control Guide**

---

## 📋 **TABLE OF CONTENTS**

1. [System Overview](#system-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Role-Based Access Matrix](#role-based-access-matrix)
4. [API Modules by Role](#api-modules-by-role)
5. [Complete API Reference](#complete-api-reference)
6. [Business Logic & Scenarios](#business-logic--scenarios)
7. [Security Patterns](#security-patterns)
8. [Database Schema](#database-schema)

---

## **SYSTEM OVERVIEW**

### **Architecture**
- **Backend**: PHP 8+ with PDO
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Pattern**: MVC-inspired with custom Router

### **Base URL**
```
http://localhost/Sam-Backend/BACKEND/public/index.php/api
```

### **Supported Roles**
| Role | Scope | Description |
|------|-------|-------------|
| `SUPER_ADMIN` | System-wide | Manages all salons, subscriptions, and platform settings |
| `ADMIN` | Salon-level | Full control over their assigned salon |
| `STAFF` | Salon-level | Service delivery, appointments, limited admin access |
| `CUSTOMER` | Personal | Own appointments, profile, and invoices only |

---

## **AUTHENTICATION & AUTHORIZATION**

### **Token System**

#### **Access Token**
- **Expiry**: 15 minutes (900 seconds)
- **Storage**: Client-side (memory/localStorage)
- **Payload**:
```json
{
  "user_id": 1,
  "role": "ADMIN",
  "salon_id": 1,
  "customer_id": null,
  "iat": 1709548800,
  "exp": 1709557800
}
```

#### **Refresh Token**
- **Expiry**: 7 days
- **Storage**: Database (`refresh_tokens` table)
- **Rotation**: New token issued on each refresh
- **Revocation**: On logout or token compromise

### **Authentication Flow**

```
┌─────────────┐
│   LOGIN     │
│  (Public)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Server Validates Credentials │
│  - Check email/phone        │
│  - Verify password hash     │
│  - Check status = ACTIVE    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Generate Token Pair        │
│  - Access Token (15 min)    │
│  - Refresh Token (7 days)   │
│  - Store refresh in DB      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Return to Client           │
│  {                          │
│    "access_token": "...",   │
│    "refresh_token": "...",  │
│    "expires_in": 900        │
│  }                          │
└─────────────────────────────┘
```

### **Login Endpoints**

#### **1. SUPER_ADMIN Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@sam.com",
  "password": "password123",
  "login_type": "SUPER_ADMIN"
}
```

#### **2. ADMIN/STAFF Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@salon.com",
  "password": "password123",
  "login_type": "ADMIN/STAFF",
  "salon_id": 1
}
```

#### **3. CUSTOMER Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@email.com",
  "password": "password123",
  "login_type": "CUSTOMER",
  "salon_id": 1
}
```
**OR** (phone login)
```json
{
  "phone": "9876543210",
  "password": "password123",
  "login_type": "CUSTOMER",
  "salon_id": 1
}
```

---

## **ROLE-BASED ACCESS MATRIX**

### **Module Access Summary**

| Module | SUPER_ADMIN | ADMIN | STAFF | CUSTOMER | Public |
|--------|-------------|-------|-------|----------|--------|
| **Auth** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Login |
| **Salons** | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| **Users** | ✅ Full | ✅ Own Salon | ❌ | ❌ | ❌ |
| **Customers** | ❌ | ✅ CRUD | ✅ CRUD | ✅ Own | ✅ Register |
| **Services** | ❌ | ✅ CRUD | ✅ Read | ✅ Read | ❌ |
| **Packages** | ❌ | ✅ CRUD | ✅ Read | ✅ Read | ❌ |
| **Staff** | ❌ | ✅ CRUD | ✅ Read Own | ❌ | ❌ |
| **Stock** | ❌ | ✅ CRUD | ✅ Read | ❌ | ❌ |
| **Appointments** | ❌ | ✅ CRUD | ✅ CRUD | ✅ Own | ❌ |
| **Invoices (Customer)** | ❌ | ✅ CRUD | ✅ CRUD | ✅ Own | ❌ |
| **Invoices (Salon)** | ✅ CRUD | ✅ Read Own | ❌ | ❌ | ❌ |
| **Payments (Customer)** | ❌ | ✅ Create | ✅ Create | ✅ Read Own | ❌ |
| **Payments (Salon)** | ✅ Create | ✅ Create | ❌ | ❌ | ❌ |
| **Subscriptions** | ✅ Full | ✅ Own Salon | ❌ | ❌ | ❌ |
| **Subscription Plans** | ✅ CRUD | ✅ Read | ✅ Read | ❌ | ❌ |
| **Reports** | ❌ | ✅ All | ✅ All | ❌ | ❌ |

### **Legend**
- ✅ Full = Create, Read, Update, Delete
- ✅ Read = Read-only access
- ✅ Own = Can only access own data
- ✅ CRUD = Create, Read, Update (no Delete)
- ❌ = No access

---

## **API MODULES BY ROLE**

---

## **🔵 SUPER_ADMIN APIS**

### **1. Salon Management**

#### **Create Salon**
```http
POST /api/super-admin/salons
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```
```json
{
  "salon_name": "Elite Beauty Lounge",
  "salon_ownername": "John Smith",
  "email": "contact@elitesalon.com",
  "phone": "9876543210",
  "gst_num": "29ABCDE1234F1Z5",
  "address": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "salon_logo": "uploads/salons/logo.jpg",
  "status": 1
}
```

#### **Update Salon**
```http
PUT /api/super-admin/salons/{salon_id}
```
```json
{
  "salon_name": "Elite Beauty Lounge Updated",
  "phone": "9999999999"
}
```

#### **Toggle Salon Status**
```http
PATCH /api/super-admin/salons/{salon_id}/status
```
```json
{
  "status": 1
}
```
**Valid values**: `0` (inactive), `1` (active)

#### **List Salons**
```http
GET /api/super-admin/salons?status=1
```

#### **View Salon Details**
```http
GET /api/super-admin/salons/{salon_id}
```

---

### **2. User Management**

#### **Create Salon Admin**
```http
POST /api/admin/salons/{salon_id}/admin
```
```json
{
  "username": "admin_elite",
  "email": "admin@elitesalon.com",
  "password": "securepass123"
}
```
**Note**: If password omitted, auto-generated and returned in response.

#### **List Users by Salon**
```http
GET /api/admin/salons/{salon_id}/users?role=ADMIN&status=ACTIVE
```
**Access Logic**:
- SUPER_ADMIN: Any salon
- ADMIN: Own salon only

#### **View User Details**
```http
GET /api/admin/users/{user_id}
```

#### **Update User**
```http
PUT /api/admin/users/{user_id}
```
**Field Restrictions**:
- SUPER_ADMIN: Can update `username`, `email`, `status`
- ADMIN: Can update `username`, `email` only (NO status)

#### **Toggle User Status**
```http
PATCH /api/admin/users/{user_id}/status
```
```json
{
  "status": "BLOCKED"
}
```
**Valid values**: `ACTIVE`, `INACTIVE`, `BLOCKED`
**Restriction**: SUPER_ADMIN only (cannot toggle self)

---

### **3. Subscription Plans**

#### **Create Plan**
```http
POST /api/subscription-plans
```
```json
{
  "plan_name": "Premium Plan",
  "duration_days": 365,
  "status": 1,
  "plan_type": "flat",
  "flat_price": 50000.00
}
```
**Valid `plan_type`**: `flat`, `per-appointments`, `Percentage-per-appointments`

#### **Update Plan**
```http
PUT /api/subscription-plans/{plan_id}
```

#### **List Plans**
```http
GET /api/subscription-plans?status=1
```

#### **View Plan**
```http
GET /api/subscription-plans/{plan_id}
```

#### **Toggle Plan Status**
```http
PATCH /api/subscription-plans/{plan_id}/status
```
```json
{
  "status": 0
}
```

---

### **4. Salon Subscriptions**

#### **Assign Subscription to Salon**
```http
POST /api/super-admin/salons/{salon_id}/subscriptions
```
```json
{
  "plan_id": 1,
  "start_date": "2025-03-01",
  "status": "ACTIVE"
}
```
**Auto-generates**: `end_date` (from plan duration), invoice

#### **Update Subscription**
```http
PUT /api/super-admin/subscriptions/{subscription_id}
```
```json
{
  "plan_id": 2,
  "start_date": "2025-03-01",
  "end_date": "2026-03-01",
  "status": "ACTIVE"
}
```

#### **List Salon Subscriptions**
```http
GET /api/super-admin/salons/{salon_id}/subscriptions?status=ACTIVE
```

---

### **5. Salon Invoices**

#### **Generate Salon Invoice**
```http
POST /api/super-admin/invoices/salon
```
```json
{
  "salon_id": 1,
  "subscription_id": 10,
  "tax_amount": 9000.00,
  "due_date": "2025-03-15"
}
```
**Note**: Amount auto-populated from subscription plan if omitted.

#### **List Salon Invoices**
```http
GET /api/super-admin/invoices/salon?payment_status=UNPAID&page=1&limit=20
```

#### **View Salon Invoice**
```http
GET /api/super-admin/invoices/salon/{invoice_salon_id}
```

#### **Record Salon Payment**
```http
POST /api/super-admin/invoices/salon/{invoice_salon_id}/payments
```
```json
{
  "payment_mode": "UPI",
  "transaction_no": "TXN123456",
  "amount": 30000.00,
  "payment_date": "2025-03-01 14:00:00"
}
```
**Valid `payment_mode`**: `CASH`, `CARD`, `UPI`, `NET_BANKING`, `CHEQUE`

---

## **🟢 ADMIN APIS**

### **1. Customer Management**

#### **Create Customer (Manual)**
```http
POST /api/customers/create
Authorization: Bearer <ADMIN_TOKEN>
```
```json
{
  "name": "Jane Doe",
  "phone": "9876543211",
  "email": "jane@example.com",
  "gender": "FEMALE",
  "date_of_birth": "1990-05-15",
  "anniversary_date": "2015-06-20"
}
```

#### **Update Customer**
```http
PATCH /api/customers/update/{customer_id}
```
```json
{
  "name": "Jane Updated",
  "phone": "9999999999",
  "email": "jane.updated@example.com",
  "gender": "FEMALE",
  "date_of_birth": "1990-05-15",
  "anniversary_date": "2015-06-20",
  "address": "123 Main St",
  "preferences": "Prefers morning appointments",
  "status": "ACTIVE"
}
```

#### **Soft Delete Customer**
```http
PATCH /api/customers/status/{customer_id}
```
```json
{
  "status": "INACTIVE"
}
```

#### **List Customers**
```http
GET /api/customers/list
```
**Note**: CUSTOMERs blocked (privacy protection)

#### **View Customer Profile**
```http
GET /api/customers/view/{customer_id}
```
**Access**: ADMIN, STAFF, CUSTOMER (own profile only)

---

### **2. Service Management**

#### **Create Service**
```http
POST /api/admin/services
```
```json
{
  "service_name": "Haircut",
  "description": "Professional haircut and styling",
  "price": 500.00,
  "duration": 30,
  "image_url": "uploads/services/haircut.jpg",
  "status": "ACTIVE"
}
```

#### **Update Service**
```http
PUT /api/admin/services/{service_id}
```
```json
{
  "service_name": "Premium Haircut",
  "price": 600.00,
  "duration": 45
}
```

#### **Toggle Service Status**
```http
PATCH /api/admin/services/{service_id}/status
```
```json
{
  "status": "INACTIVE"
}
```

#### **List Services**
```http
GET /api/services?status=ACTIVE
```
**Access**: ADMIN, STAFF, CUSTOMER (CUSTOMERs see ACTIVE only)

#### **View Service Details**
```http
GET /api/services/{service_id}
```

---

### **3. Package Management**

#### **Create Package (with Services)**
```http
POST /api/admin/packages
```
```json
{
  "package_name": "Bridal Package",
  "description": "Complete bridal makeover",
  "total_price": 15000.00,
  "validity_days": 30,
  "image_url": "uploads/packages/bridal.jpg",
  "status": "ACTIVE",
  "service_ids": [1, 2, 3, 4]
}
```

#### **Update Package**
```http
PUT /api/admin/packages/{package_id}
```
```json
{
  "package_name": "Premium Bridal Package",
  "total_price": 18000.00,
  "validity_days": 45,
  "service_ids": [1, 2, 3, 4, 5]
}
```

#### **Toggle Package Status**
```http
PATCH /api/admin/packages/{package_id}/status
```

#### **List Packages**
```http
GET /api/packages?status=ACTIVE
```

#### **View Package Details**
```http
GET /api/packages/{package_id}
```
**Returns**: Package details + associated services

---

### **4. Staff Management**

#### **Create Staff**
```http
POST /api/admin/staff
```
```json
{
  "username": "priya_staff",
  "email": "priya@salon.com",
  "password": "password123",
  "role": "STAFF",
  "name": "Priya Sharma",
  "phone": "9876543210",
  "status": "ACTIVE",
  "date_of_birth": "1995-03-15",
  "date_of_joining": "2024-01-10",
  "specialization": "Hair Stylist",
  "experience_years": 5,
  "salary": 25000.00
}
```
**Creates**: `users` record + `staff_info` record

#### **Update Staff**
```http
PUT /api/admin/staff/{staff_id}
```
```json
{
  "name": "Priya Sharma Updated",
  "phone": "9999999999",
  "email": "priya.updated@salon.com",
  "specialization": "Senior Hair Stylist",
  "salary": 30000.00
}
```

#### **Toggle Staff Status**
```http
PATCH /api/admin/staff/{staff_id}/status
```
```json
{
  "status": "INACTIVE"
}
```
**Valid values**: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`

#### **List Staff**
```http
GET /api/admin/staff?status=ACTIVE
```

#### **View Staff Details**
```http
GET /api/admin/staff/{staff_id}
```

---

### **5. Staff Documents**

#### **Add Staff Document**
```http
POST /api/admin/staff/{staff_id}/documents
```
```json
{
  "doc_type": "CERTIFICATION",
  "document_name": "Hair Styling Certificate",
  "file_path": "uploads/staff/docs/cert_12.pdf",
  "file_size": 2048000,
  "expiry_date": "2026-12-31"
}
```
**Valid `doc_type`**: `CERTIFICATION`, `ID_PROOF`, `CONTRACT`, `RESUME`, `OTHER`

#### **List Staff Documents**
```http
GET /api/admin/staff/{staff_id}/documents
```

#### **View Staff Document**
```http
GET /api/admin/staff/{staff_id}/documents/{doc_id}
```

#### **Delete Staff Document**
```http
DELETE /api/admin/staff/{staff_id}/documents/{doc_id}
```

---

### **6. Staff Incentives**

#### **Generate Incentive**
```http
POST /api/staff/incentives
```
```json
{
  "staff_id": 1,
  "appointment_id": 10,
  "incentive_type": "SERVICE_COMMISSION",
  "calculation_type": "FIXED",
  "fixed_amount": 50.00,
  "incentive_amount": 50.00,
  "remarks": "Haircut commission",
  "status": "PENDING"
}
```
**Valid `incentive_type`**: `SERVICE_COMMISSION`, `BONUS`, `TARGET_ACHIEVEMENT`
**Valid `calculation_type`**: `FIXED`, `PERCENTAGE`
**Valid `status`**: `PENDING`, `PAID`

#### **Process Incentive Payout**
```http
POST /api/staff/incentives/{incentive_id}/payout
```
```json
{
  "payout_amount": 50.00,
  "payout_date": "2025-03-01",
  "payment_mode": "BANK",
  "transaction_reference": "TXN123456",
  "remarks": "Monthly payout"
}
```
**Note**: `staff_id` auto-filled from incentive record (NOT in request)

---

### **7. Stock Management**

#### **Create Product**
```http
POST /api/admin/products
```
```json
{
  "product_name": "Premium Shampoo",
  "brand": "L'Oreal",
  "category": "product",
  "description": "Moisturizing shampoo for dry hair",
  "minimum_quantity": 10,
  "maximum_quantity": 100,
  "initial_quantity": 50
}
```
**Valid `category`**: `product`, `equipment`

#### **Update Product**
```http
PUT /api/admin/products/{product_id}
```
```json
{
  "product_name": "Ultra Premium Shampoo",
  "brand": "L'Oreal Professional"
}
```

#### **List Products**
```http
GET /api/admin/products?category=product
```

#### **View Product Details**
```http
GET /api/admin/products/{product_id}
```

#### **Update Stock Levels**
```http
PATCH /api/admin/stock/{product_id}
```
```json
{
  "current_quantity": 75,
  "minimum_quantity": 15,
  "maximum_quantity": 120
}
```

#### **Get All Stock Levels**
```http
GET /api/admin/stock
```
**Returns**: Stock status (`LOW`, `OVERSTOCKED`, `OK`)

#### **Get Low Stock Alerts**
```http
GET /api/admin/stock/low-stock-alerts
```

---

### **8. Stock Transactions**

#### **Create Stock Transaction**
```http
POST /api/admin/stock/transactions
```
```json
{
  "product_id": 1,
  "transaction_type": "IN",
  "quantity": 50,
  "unit_price": 250.00,
  "reference_type": "PURCHASE_ORDER",
  "reference_id": 101,
  "notes": "New stock from supplier"
}
```
**Valid `transaction_type`**: `IN`, `OUT`, `ADJUSTMENT`

#### **List Stock Transactions**
```http
GET /api/admin/stock/transactions?product_id=1&transaction_type=IN
```

#### **View Stock Transaction**
```http
GET /api/admin/stock/transactions/{transaction_id}
```

---

### **9. Appointment Management**

#### **Create Appointment**
```http
POST /api/appointments
```
```json
{
  "customer_id": 1,
  "appointment_date": "2025-03-15",
  "start_time": "14:00:00",
  "estimated_duration": 90,
  "notes": "Bridal consultation",
  "services": [
    {
      "service_id": 1,
      "staff_id": 1,
      "price": 500.00,
      "discount_amount": 50.00,
      "start_time": "14:00:00",
      "end_time": "14:45:00"
    }
  ],
  "packages": [],
  "discount_amount": 100.00
}
```
**Access**: ADMIN, STAFF, CUSTOMER (CUSTOMERs can only book for self)

#### **Update Appointment**
```http
PUT /api/appointments/{appointment_id}
```
```json
{
  "appointment_date": "2025-03-16",
  "start_time": "15:00:00",
  "status": "CONFIRMED",
  "notes": "Rescheduled by customer"
}
```

#### **Cancel Appointment**
```http
PATCH /api/appointments/{appointment_id}/cancel
```
```json
{
  "cancellation_reason": "Customer emergency"
}
```
**Access**: ADMIN, STAFF, CUSTOMER (own appointments only)

#### **List Appointments**
```http
GET /api/appointments?status=CONFIRMED&date=2025-03-15
```

#### **View Appointment Details**
```http
GET /api/appointments/{appointment_id}
```
**Returns**: Appointment + services + packages + feedback status

---

### **10. Appointment Services/Packages**

#### **Add Service to Appointment**
```http
PUT /api/appointments/{appointment_id}/services/{service_id}
```
```json
{
  "staff_id": 1,
  "price": 500.00,
  "discount_amount": 50.00,
  "start_time": "14:00:00",
  "end_time": "14:45:00"
}
```
**Note**: PUT acts as upsert (inserts if not exists, updates if exists)

#### **Update Appointment Service**
```http
PATCH /api/appointments/{appointment_id}/services/{service_id}
```
```json
{
  "staff_id": 2,
  "service_price": 600.00,
  "discount_amount": 100.00
}
```

#### **Remove Service from Appointment**
```http
DELETE /api/appointments/{appointment_id}/services/{service_id}
```
**Auto-recalculates**: Appointment total

#### **Add Package to Appointment**
```http
POST /api/appointments/{appointment_id}/packages
```
```json
{
  "package_id": 1,
  "staff_id": 1,
  "price": 5000.00,
  "discount_amount": 500.00
}
```

#### **Update Package in Appointment**
```http
PUT /api/appointments/{appointment_id}/packages/{package_id}
```
```json
{
  "staff_id": 2,
  "package_price": 5500.00,
  "discount_amount": 600.00
}
```

#### **Remove Package from Appointment**
```http
DELETE /api/appointments/{appointment_id}/packages/{package_id}
```

#### **Generate Invoice from Appointment**
```http
POST /api/appointments/{appointment_id}/invoice
```
```json
{
  "subtotal_amount": 5000.00,
  "tax_amount": 900.00,
  "discount_amount": 500.00,
  "due_date": "2025-03-22",
  "notes": "Thank you for your business"
}
```

---

### **11. Customer Invoices**

#### **Create Invoice**
```http
POST /api/invoices
```
```json
{
  "appointment_id": 1,
  "subtotal_amount": 5000.00,
  "tax_amount": 900.00,
  "discount_amount": 500.00,
  "due_date": "2025-03-15",
  "notes": "Thank you for your business"
}
```

#### **Update Invoice**
```http
PUT /api/invoices/{invoice_id}
```
```json
{
  "subtotal_amount": 5500.00,
  "tax_amount": 990.00,
  "discount_amount": 600.00,
  "due_date": "2025-03-20"
}
```

#### **List Invoices**
```http
GET /api/invoices?payment_status=UNPAID&invoice_date=2025-03-01
```
**Access**: ADMIN, STAFF, CUSTOMER (own invoices only)

#### **View Invoice Details**
```http
GET /api/invoices/{invoice_id}
```
**Returns**: Invoice + payment history

#### **Get Invoice by Appointment**
```http
GET /api/invoices/appointment/{appointment_id}
```

---

### **12. Customer Payments**

#### **Create Payment**
```http
POST /api/payments
```
```json
{
  "invoice_customer_id": 1,
  "payment_mode": "UPI",
  "transaction_no": "UPI123456789",
  "amount": 5400.00,
  "payment_date": "2025-03-01 15:30:00"
}
```
**Valid `payment_mode`**: `CASH`, `CARD`, `UPI`, `NET_BANKING`, `WALLET`

#### **List Payments**
```http
GET /api/payments?status=SUCCESS&invoice_id=1
```

#### **View Payment Details**
```http
GET /api/payments/{payment_id}
```

#### **Record Payment for Invoice**
```http
POST /api/invoices/customer/{invoice_customer_id}/payments
```
```json
{
  "payment_mode": "UPI",
  "transaction_no": "UPI123456789",
  "amount": 3000.00,
  "payment_date": "2025-03-01 14:00:00"
}
```
**Note**: CUSTOMERs cannot create payments (ADMIN/STAFF only)

#### **Get Invoice Payments**
```http
GET /api/invoices/customer/{invoice_customer_id}/payments
```
**Access**: ADMIN, STAFF, CUSTOMER (own invoices only)

---

### **13. Salon Subscription**

#### **Subscribe to Plan**
```http
POST /api/subscriptions
```
```json
{
  "plan_id": 1,
  "start_date": "2025-03-01"
}
```
**Auto-generates**: `end_date`, invoice

#### **Update Subscription**
```http
PUT /api/subscriptions/{subscription_id}
```
```json
{
  "plan_id": 2,
  "start_date": "2025-03-01",
  "end_date": "2026-03-01",
  "status": "ACTIVE"
}
```

#### **Cancel Subscription**
```http
PATCH /api/subscriptions/{subscription_id}/cancel
```

#### **View Subscription Details**
```http
GET /api/subscriptions/{subscription_id}
```

#### **Get Current Subscription**
```http
GET /api/subscriptions/current
```

#### **List Subscription History**
```http
GET /api/subscriptions?status=ACTIVE
```

---

### **14. Salon Invoices (Own)**

#### **List Own Salon Invoices**
```http
GET /api/salon/invoices?payment_status=UNPAID
```

#### **View Own Salon Invoice**
```http
GET /api/salon/invoices/{invoice_salon_id}
```

#### **Update Own Salon Invoice**
```http
PUT /api/salon/invoices/{invoice_salon_id}
```
```json
{
  "amount": 55000.00,
  "tax_amount": 9900.00,
  "due_date": "2025-03-20"
}
```

#### **Get Invoice by Subscription**
```http
GET /api/salon/invoices/subscription/{subscription_id}
```

---

### **15. Salon Payments (Own)**

#### **Create Salon Payment**
```http
POST /api/salon/payments
```
```json
{
  "invoice_salon_id": 25,
  "payment_mode": "UPI",
  "transaction_no": "TXN123456",
  "amount": 30000.00,
  "payment_date": "2025-03-01 14:00:00"
}
```

#### **List Salon Payments**
```http
GET /api/salon/payments?invoice_id=25
```

#### **View Salon Payment Details**
```http
GET /api/salon/payments/{payment_id}
```

---

### **16. Reports**

All reports support date range filtering:
```http
GET /api/reports/{report_name}?start_date=2025-02-01&end_date=2025-02-28
```

#### **Available Reports**
1. **Sales Report** - Revenue breakdown by service/package
   ```http
   GET /api/reports/sales
   ```

2. **Appointment Report** - Appointment statistics & status breakdown
   ```http
   GET /api/reports/appointments
   ```

3. **Staff Performance Report** - Staff metrics with incentives
   ```http
   GET /api/reports/staff-performance
   ```

4. **Service-wise Revenue Report** - Revenue per service
   ```http
   GET /api/reports/services
   ```

5. **Package-wise Revenue Report** - Revenue per package
   ```http
   GET /api/reports/packages
   ```

6. **Customer Visit Report** - Customer visit statistics
   ```http
   GET /api/reports/customers
   ```

7. **Inventory Usage Report** - Stock status & movements
   ```http
   GET /api/reports/inventory
   ```

8. **Incentive Payout Report** - Staff incentive summary
   ```http
   GET /api/reports/incentives
   ```

9. **Tax Report (GST)** - Tax calculation report
   ```http
   GET /api/reports/tax?tax_rate=18
   ```

**Access**: ADMIN, STAFF only

---

## **🟡 STAFF APIS**

Staff have **READ-ONLY** access to most modules, but **FULL** access to appointments:

### **Read-Only Access**
- ✅ Services (list, view)
- ✅ Packages (list, view)
- ✅ Customers (list, view, own profile update)
- ✅ Stock (view levels, alerts)
- ✅ Reports (all 9 reports)

### **Full Access**
- ✅ Appointments (create, update, cancel, approve, complete)
- ✅ Appointment Services/Packages (add, update, remove)
- ✅ Customer Invoices (create, update, record payments)
- ✅ Customer Payments (create)

### **No Access**
- ❌ Salon management
- ❌ User management
- ❌ Staff management
- ❌ Stock transactions
- ❌ Subscription plans
- ❌ Salon subscriptions
- ❌ Salon invoices/payments

---

## **🔴 CUSTOMER APIS**

### **Public (No Auth)**
- ✅ Customer Self Registration
  ```http
  POST /api/customers/register
  ```

### **Authenticated (Own Data Only)**

#### **Profile Management**
```http
PATCH /api/customers/me
GET  /api/customers/view/{customer_id}  (own only)
```

#### **Appointments**
```http
POST /api/appointments                    (book for self)
GET  /api/customers/me/appointments       (own appointments)
GET  /api/appointments                    (own appointments only)
GET  /api/appointments/{appointment_id}  (own appointment only)
PATCH /api/appointments/{appointment_id}/cancel  (own only)
POST /api/appointments/{appointment_id}/feedback (own only)
```

#### **Invoices & Payments**
```http
GET /api/invoices                         (own invoices only)
GET /api/invoices/{invoice_id}           (own invoice only)
GET /api/invoices/customer/{id}/payments (own payments only)
GET /api/payments                         (own payments only)
GET /api/payments/{payment_id}           (own payment only)
```

#### **Browse Services/Packages**
```http
GET /api/services?status=ACTIVE           (ACTIVE only)
GET /api/services/{service_id}
GET /api/packages?status=ACTIVE           (ACTIVE only)
GET /api/packages/{package_id}
```

### **No Access**
- ❌ Create/update other customers
- ❌ List all customers (privacy protection)
- ❌ Staff management
- ❌ Stock management
- ❌ Reports
- ❌ Subscription plans
- ❌ Create payments (ADMIN/STAFF only)

---

## **🔐 SECURITY PATTERNS**

### **1. Authorization Before Fetch**
All sensitive APIs check authorization BEFORE fetching data:

```php
// ✅ SECURE Pattern
if ($auth['role'] === 'CUSTOMER') {
    $stmt = $this->db->prepare("
        SELECT * FROM appointments
        WHERE appointment_id = ? AND salon_id = ? AND customer_id = ?
    ");
    $stmt->execute([$appointmentId, $salonId, $auth['customer_id']]);
} else {
    $stmt = $this->db->prepare("
        SELECT * FROM appointments
        WHERE appointment_id = ? AND salon_id = ?
    ");
    $stmt->execute([$appointmentId, $salonId]);
}
```

### **2. Salon Isolation**
All queries include `salon_id` for data isolation:
```sql
WHERE salon_id = ?  -- From JWT token
```

### **3. Customer Privacy**
- CUSTOMERs cannot list all customers
- CUSTOMERs can only view own appointments/invoices/payments
- All customer-specific queries include `customer_id` filter

### **4. Role-Based Field Restrictions**
```php
// ADMIN cannot update user status (SUPER_ADMIN only)
if ($auth['role'] === 'ADMIN') {
    $allowedFields = ['username', 'email'];
} else {
    $allowedFields = ['username', 'email', 'status'];
}
```

---

## **📊 DATABASE SCHEMA**

### **Core Tables**
- `salons` - Salon information
- `super_admin_login` - Super admin credentials
- `users` - Admin/Staff users
- `customers` - Customer profiles
- `customer_authentication` - Customer login credentials

### **Service Tables**
- `services` - Salon services
- `packages` - Service packages
- `package_services` - Package-to-service mapping

### **Appointment Tables**
- `appointments` - Main appointment records
- `appointment_services` - Services in appointments
- `appointment_packages` - Packages in appointments
- `appointment_feedback` - Customer feedback

### **Financial Tables**
- `invoice_customer` - Customer invoices
- `invoice_salon` - Salon subscription invoices
- `customer_payments` - Customer payment records
- `payments_salon` - Salon payment records
- `incentives` - Staff incentives
- `incentive_payouts` - Incentive payouts

### **Subscription Tables**
- `subscription_plans` - Available plans
- `salon_subscriptions` - Salon subscriptions

### **Stock Tables**
- `products` - Product catalog
- `stock` - Stock levels
- `stock_transactions` - Stock movement history

### **Other Tables**
- `staff_info` - Staff details
- `staff_documents` - Staff document uploads
- `refresh_tokens` - JWT refresh token storage

---

## **🧪 TESTING**

### **Test Credentials (from mock_data.sql)**

#### **SUPER_ADMIN**
```
Email: superadmin@sam.com
Password: 123456
```

#### **ADMIN (Salon 1)**
```
Email: admin@elite.com
Password: 123456
Salon ID: 1
```

#### **STAFF (Salon 1)**
```
Email: priya@elite.com
Password: 123456
Salon ID: 1
```

#### **CUSTOMER (Salon 1)**
```
Email: amit.patel@email.com
Password: 123456
Salon ID: 1
```

### **Run Tests**
```bash
# Database verification
php verify_database.php

# Appointment API tests
php test_final_appointments.php

# Full API test suite
php test_appointments.php
```

---

## **📝 NOTES**

### **Token Usage**
All protected endpoints require:
```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

### **Error Responses**
```json
{
  "status": "error",
  "message": "Error description"
}
```

### **Success Responses**
```json
{
  "status": "success",
  "data": { ... }
}
```

### **Pagination**
List endpoints support:
```http
GET /api/resource?page=1&limit=20
```

### **Date Formats**
- **Dates**: `YYYY-MM-DD` (e.g., `2025-03-15`)
- **DateTime**: `YYYY-MM-DD HH:MM:SS` (e.g., `2025-03-15 14:00:00`)
- **Time**: `HH:MM:SS` (e.g., `14:00:00`)

---

## **🔗 RELATED FILES**

- `API_DOCUMENTATION.txt` - Complete API reference with examples
- `SECURITY_AUDIT.md` - Security audit report
- `CUSTOMER_API_GUIDE.md` - Customer-facing API guide
- `SAM_Backend_API_Collection.postman_collection.json` - Postman collection

---

**Last Updated**: 2026-03-04
**Version**: 2.0
**Total APIs**: 115
