# SAM - Salon Management System
## Complete System Documentation for Gamma AI Presentation

---

# Slide 1: Title Slide

## SAM - Salon Management System
### A Comprehensive Multi-Role Platform for Salon Operations

**Enterprise-grade salon management with 115+ APIs**
**4 User Roles | 39 Database Tables | Complete Business Workflow**

---

# Slide 2: System Overview

## What is SAM?

SAM is a full-stack salon management system built with PHP and MySQL, designed to streamline operations for:

- **Salon Chains** - Multiple salon locations under one platform
- **Individual Salons** - Complete business management tools
- **Staff Members** - Service delivery and performance tracking
- **Customers** - Easy booking and appointment management

### Key Statistics
- **115 API Endpoints** across 15 modules
- **39 Database Tables** with complete relational schema
- **4 User Roles** with granular access control
- **JWT Authentication** with refresh token rotation
- **Real-time Dashboards** for all user types

---

# Slide 3: Technology Stack

## Backend Architecture

### Core Technologies
- **PHP 8+** with PDO for database operations
- **MySQL 8.0** for relational data storage
- **JWT (JSON Web Tokens)** for authentication
- **Custom MVC-inspired Router** for API routing

### Security Features
- Password hashing with bcrypt
- Access token expiry (15 minutes)
- Refresh token rotation (7 days)
- Role-based access control (RBAC)
- SQL injection prevention via prepared statements

### File Structure
```
BACKEND/
├── config/          # Database, JWT, Constants
├── core/            # Router, Request, Response
├── middlewares/     # Authentication, Authorization
├── modules/         # 15 Business Modules
├── helpers/         # PasswordHelper, Validators
└── public/          # Uploads, Entry Point
```

---

# Slide 4: User Roles & Access Control

## Four Distinct User Roles

### 1. SUPER_ADMIN
- **Scope**: Platform-wide management
- **Responsibilities**: Create salons, manage subscriptions, platform oversight
- **Access**: All salons, all users, subscription plans, salon invoices

### 2. ADMIN (Salon Owner/Manager)
- **Scope**: Single salon operations
- **Responsibilities**: Full salon management, staff, customers, services
- **Access**: Own salon data only

### 3. STAFF
- **Scope**: Service delivery
- **Responsibilities**: Appointments, customer service, limited admin access
- **Access**: Appointments, services, packages, own incentives

### 4. CUSTOMER
- **Scope**: Personal bookings
- **Responsibilities**: Book appointments, view invoices, provide feedback
- **Access**: Own appointments, profile, invoices only

---

# Slide 5: Complete User Flow - Step by Step

## Business Workflow Sequence

### Phase 1: Platform Setup (SUPER_ADMIN)
1. **Create Salon** → Salon details, owner info, contact
2. **Auto-generate Admin** → System creates salon admin credentials
3. **Assign Subscription** → Link salon to subscription plan
4. **Generate Invoice** → Create salon subscription invoice

### Phase 2: Salon Setup (ADMIN)
1. **Login to Salon** → Use auto-generated credentials
2. **Create Services** → Define services with pricing, duration
3. **Create Packages** → Bundle services into packages
4. **Hire Staff** → Create staff accounts with roles
5. **Add Inventory** → Products and stock management

### Phase 3: Operations (STAFF)
1. **View Schedule** → Daily appointments
2. **Service Customers** → Complete appointments
3. **Update Status** → Mark services complete
4. **Track Incentives** → View commissions earned

### Phase 4: Customer Journey (CUSTOMER)
1. **Register** → Create account with salon
2. **Browse Services** → View available services/packages
3. **Book Appointment** → Select date, time, services
4. **Receive Service** → Visit salon
5. **Make Payment** → Pay invoice
6. **Provide Feedback** → Rate experience

---

# Slide 6: Module 1 - Authentication

## Auth Module (5 APIs)

### Login Flow
```
POST /api/auth/login
Request: { email, password, login_type, salon_id }
Response: { access_token, refresh_token, expires_in }
```

### Login Types
1. **SUPER_ADMIN** - Email only
2. **ADMIN/STAFF** - Email + Salon ID
3. **CUSTOMER** - Email/Phone + Salon ID

### Token System
- **Access Token**: 15 minutes (JWT)
- **Refresh Token**: 7 days (Database stored)
- **Token Rotation**: New refresh token on each refresh

### Additional Endpoints
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke tokens
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

---

# Slide 7: Module 2 - Salon Management

## Salons Module (5 APIs) - SUPER_ADMIN Only

### Create Salon
```json
POST /api/super-admin/salons
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
  "salon_logo": "/uploads/salons/logo.jpg",
  "status": 1
}
```

### Features
- Auto-generates admin user credentials
- Validates email, phone, GST format
- Prevents duplicate salon registration
- Logo upload support

### Other Endpoints
- `PUT /api/super-admin/salons/{id}` - Update salon
- `PATCH /api/super-admin/salons/{id}/status` - Activate/Deactivate
- `GET /api/super-admin/salons` - List all salons
- `GET /api/super-admin/salons/{id}` - View details

---

# Slide 8: Module 3 - User Management

## Users Module (6 APIs)

### Create Salon Admin
```json
POST /api/admin/salons/{salon_id}/admin
{
  "username": "admin_elite",
  "email": "admin@elitesalon.com",
  "password": "securepass123"
}
```

### Access Control
- **SUPER_ADMIN**: Create admins, manage all users
- **ADMIN**: Manage own salon users only

### User Status Management
- ACTIVE - Can login and work
- INACTIVE - Temporarily disabled
- BLOCKED - Permanently restricted

### Endpoints
- `GET /api/admin/salons/{id}/users` - List users by salon
- `GET /api/admin/users/{id}` - View user details
- `PUT /api/admin/users/{id}` - Update user
- `PATCH /api/admin/users/{id}/status` - Toggle status (SUPER_ADMIN only)

---

# Slide 9: Module 4 - Customer Management

## Customers Module (10 APIs)

### Customer Registration (Public)
```json
POST /api/customers/register
{
  "name": "Jane Doe",
  "phone": "9876543211",
  "email": "jane@example.com",
  "password": "password123",
  "salon_id": 1
}
```

### Admin/Staff Operations
- **Create Customer** - Manual registration
- **Update Customer** - Edit profile
- **Soft Delete** - Mark as INACTIVE
- **List Customers** - View all (ADMIN/STAFF only)
- **View Profile** - Individual customer details

### Customer Self-Service
- `PATCH /api/customers/me` - Update own profile
- `GET /api/customers/me/appointments` - View own appointments
- `GET /api/customers/me/feedback` - View own feedback

### Privacy Protection
- Customers cannot list other customers
- Can only view own data

---

# Slide 10: Module 5 - Services Management

## Services Module (5 APIs)

### Create Service
```json
POST /api/admin/services
{
  "service_name": "Haircut",
  "description": "Professional haircut and styling",
  "price": 500.00,
  "duration": 30,
  "image_url": "/uploads/services/haircut.jpg",
  "status": "ACTIVE"
}
```

### Features
- Image upload support
- Duration in minutes
- Price validation (0 to 1,000,000)
- Staff assignment optional

### Access Levels
- **ADMIN**: Create, Update, Toggle status
- **STAFF**: Read-only
- **CUSTOMER**: View ACTIVE services only
- **PUBLIC**: View ACTIVE services (landing page)

### Endpoints
- `PUT /api/admin/services/{id}` - Update service
- `PATCH /api/admin/services/{id}/status` - Activate/Deactivate
- `GET /api/services` - List (role-based filtering)
- `GET /api/services/{id}` - View details

---

# Slide 11: Module 6 - Packages Management

## Packages Module (5 APIs)

### Create Package with Services
```json
POST /api/admin/packages
{
  "package_name": "Bridal Package",
  "description": "Complete bridal makeover",
  "total_price": 15000.00,
  "validity_days": 30,
  "image_url": "/uploads/packages/bridal.jpg",
  "status": "ACTIVE",
  "service_ids": [1, 2, 3, 4]
}
```

### Key Features
- Bundle multiple services
- Package pricing vs individual services
- Validity period (days)
- Service mapping validation

### Package-Service Relationship
- Many-to-many via `package_services` table
- Services must belong to same salon
- Auto-validates service ownership

### Endpoints
- `PUT /api/admin/packages/{id}` - Update package
- `PATCH /api/admin/packages/{id}/status` - Toggle status
- `GET /api/packages?include=services` - List with services
- `GET /api/packages/{id}` - View details with services

---

# Slide 12: Module 7 - Staff Management

## Staff Module (10 APIs)

### Create Staff (Creates users + staff_info)
```json
POST /api/admin/staff
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

### Dual-Table Creation
1. **users** table - Authentication (username, password, role)
2. **staff_info** table - Profile (name, specialization, salary)

### Staff Status Options
- ACTIVE - Working
- INACTIVE - Temporarily away
- ON_LEAVE - Approved leave
- TERMINATED - Employment ended

---

# Slide 13: Module 7 - Staff Documents & Incentives

## Staff Documents (4 APIs)
```json
POST /api/admin/staff/{staff_id}/documents
{
  "doc_type": "CERTIFICATION",
  "document_name": "Hair Styling Certificate",
  "file_path": "uploads/staff/docs/cert_12.pdf",
  "file_size": 2048000,
  "expiry_date": "2026-12-31"
}
```

### Document Types
- CERTIFICATION
- ID_PROOF
- CONTRACT
- RESUME
- OTHER

## Staff Incentives (5 APIs)

### Generate Incentive
```json
POST /api/staff/incentives
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

### Incentive Types
- SERVICE_COMMISSION
- BONUS
- TARGET_ACHIEVEMENT

### Payout Processing
- Single payout per incentive
- Batch payout for multiple incentives
- Payment modes: CASH, UPI, BANK, CHEQUE

---

# Slide 14: Module 8 - Stock Management

## Stock Module (11 APIs)

### Product Management
```json
POST /api/admin/products
{
  "product_name": "Premium Shampoo",
  "brand": "L'Oreal",
  "category": "product",
  "description": "Moisturizing shampoo",
  "minimum_quantity": 10,
  "maximum_quantity": 100,
  "initial_quantity": 50
}
```

### Categories
- **product** - Consumables (shampoo, conditioner)
- **equipment** - Tools (dryers, straighteners)

### Stock Levels
```json
PATCH /api/admin/stock/{product_id}
{
  "current_quantity": 75,
  "minimum_quantity": 15,
  "maximum_quantity": 120
}
```

### Stock Alerts
- **LOW STOCK**: current < minimum
- **OVERSTOCKED**: current > maximum
- **OK**: Within range

### Stock Transactions
- **IN**: Purchase, return
- **OUT**: Usage, sale
- **ADJUSTMENT**: Correction, damage

---

# Slide 15: Module 9 - Appointments

## Appointments Module (14 APIs)

### Create Appointment
```json
POST /api/appointments
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

### Appointment Status Flow
```
PENDING → CONFIRMED → COMPLETED
              ↓
         CANCELLED
```

### Customer vs Staff Booking
- **CUSTOMER**: Books for self only, status = PENDING
- **ADMIN/STAFF**: Books for any customer, status = CONFIRMED

---

# Slide 16: Module 9 - Appointment Services & Packages

## Appointment Service Management

### Add/Upsert Service
```json
PUT /api/appointments/{id}/services/{service_id}
{
  "staff_id": 1,
  "price": 500.00,
  "discount_amount": 50.00,
  "start_time": "14:00:00",
  "end_time": "14:45:00"
}
```

### Update Service
```json
PATCH /api/appointments/{id}/services/{service_id}
{
  "staff_id": 2,
  "service_price": 600.00,
  "discount_amount": 100.00
}
```

### Remove Service
```json
DELETE /api/appointments/{id}/services/{service_id}
```

## Appointment Package Management

### Add Package
```json
POST /api/appointments/{id}/packages
{
  "package_id": 1,
  "staff_id": 1,
  "price": 5000.00,
  "discount_amount": 500.00
}
```

### Auto-recalculation
- Removing services/packages recalculates total
- Final amount updated automatically

---

# Slide 17: Module 10 - Customer Invoices

## Customer Invoices Module (7 APIs)

### Create Invoice from Appointment
```json
POST /api/invoices
{
  "appointment_id": 1,
  "subtotal_amount": 5000.00,
  "tax_amount": 900.00,
  "discount_amount": 500.00,
  "due_date": "2025-03-15",
  "notes": "Thank you for your business"
}
```

### Invoice Generation from Appointment
```json
POST /api/appointments/{id}/invoice
```
- Auto-populates amounts from appointment
- Creates invoice_customer record

### Payment Status
- **UNPAID**: No payments recorded
- **PARTIAL**: Some payments made
- **PAID**: Full payment received

### Record Payment
```json
POST /api/invoices/customer/{invoice_id}/payments
{
  "payment_mode": "UPI",
  "transaction_no": "TXN123456",
  "amount": 3000.00,
  "payment_date": "2025-03-01 14:00:00"
}
```

---

# Slide 18: Module 11 - Subscription Plans

## Subscription Plans Module (5 APIs) - SUPER_ADMIN Only

### Create Plan
```json
POST /api/subscription-plans
{
  "plan_name": "Premium Plan",
  "duration_days": 365,
  "status": 1,
  "plan_type": "flat",
  "flat_price": 50000.00
}
```

### Plan Types
- **flat**: Fixed price for unlimited/basic services
- **per-appointments**: Price per appointment
- **Percentage-per-appointments**: Percentage commission

### Access Control
- **SUPER_ADMIN**: Full CRUD
- **ADMIN**: Read-only (for selecting plans)
- **STAFF/CUSTOMER**: No access

### Endpoints
- `PUT /api/subscription-plans/{id}` - Update plan
- `PATCH /api/subscription-plans/{id}/status` - Toggle status
- `GET /api/subscription-plans` - List plans
- `GET /api/subscription-plans/{id}` - View details

---

# Slide 19: Module 12 - Salon Subscriptions

## Salon Subscriptions Module (13 APIs)

### Assign Subscription to Salon
```json
POST /api/super-admin/salons/{salon_id}/subscriptions
{
  "plan_id": 1,
  "start_date": "2025-03-01",
  "status": "ACTIVE"
}
```

### Auto-calculated Fields
- **end_date**: start_date + plan duration_days
- **Invoice**: Auto-generated on creation

### Subscription Status
- **ACTIVE**: Currently valid
- **INACTIVE**: Temporarily suspended
- **EXPIRED**: Past end_date
- **CANCELLED**: Terminated early

### Renewal Flow
```json
POST /api/super-admin/subscriptions/{id}/renew
```
- Creates new subscription record
- Links to previous subscription
- Generates new invoice

---

# Slide 20: Module 13 - Salon Invoices

## Salon Invoices Module (7 APIs)

### Generate Salon Invoice
```json
POST /api/super-admin/invoices/salon
{
  "salon_id": 1,
  "subscription_id": 10,
  "tax_amount": 9000.00,
  "due_date": "2025-03-15"
}
```

### Auto-populated Fields
- **amount**: From subscription plan
- **invoice_date**: Current date
- **invoice_number**: Auto-generated

### Payment Status Tracking
- UNPAID
- PARTIAL
- PAID

### Record Payment
```json
POST /api/super-admin/invoices/salon/{id}/payments
{
  "payment_mode": "UPI",
  "transaction_no": "TXN123456",
  "amount": 30000.00,
  "payment_date": "2025-03-01"
}
```

---

# Slide 21: Module 14 - Reports

## Reports Module (9 APIs)

### Available Reports

#### Sales Reports
`GET /api/reports/sales`
- Revenue by date range
- Payment method breakdown
- Outstanding invoices

#### Appointment Reports
`GET /api/reports/appointments`
- Bookings by status
- Cancellation analysis
- Peak hours analysis

#### Staff Performance Reports
`GET /api/reports/staff-performance`
- Services per staff
- Incentives earned
- Customer ratings

#### Service/Package Reports
`GET /api/reports/services`
`GET /api/reports/packages`
- Most popular services
- Revenue contribution

#### Customer Reports
`GET /api/reports/customers`
- New customers
- Retention rate
- Customer lifetime value

#### Inventory Reports
`GET /api/reports/inventory`
- Stock levels
- Low stock alerts
- Usage patterns

#### Incentive Reports
`GET /api/reports/incentives`
- Total payouts
- Staff-wise breakdown

#### Tax Reports
`GET /api/reports/tax`
- GST collected
- Tax liability

---

# Slide 22: Module 15 - Dashboard

## Dashboard Module

### Salon Dashboard View
```sql
CREATE VIEW salon_dashboard AS
SELECT 
  s.salon_id,
  s.salon_name,
  COUNT(DISTINCT c.customer_id) AS total_customers,
  COUNT(DISTINCT a.appointment_id) AS total_appointments,
  SUM(i.total_amount) AS total_revenue,
  COUNT(DISTINCT si.staff_id) AS total_staff
FROM salons s
LEFT JOIN customers c ON s.salon_id = c.salon_id
LEFT JOIN appointments a ON s.salon_id = a.salon_id
LEFT JOIN invoice_customer i ON s.salon_id = i.salon_id
LEFT JOIN staff_info si ON s.salon_id = si.salon_id
GROUP BY s.salon_id;
```

### Dashboard Metrics
- Total Customers
- Today's Appointments
- Monthly Revenue
- Active Staff Count
- Pending Invoices
- Low Stock Alerts

---

# Slide 23: Database Schema - Core Tables

## 39 Database Tables

### Authentication Tables (4)
- `super_admin_login` - SUPER_ADMIN credentials
- `users` - ADMIN/STAFF authentication
- `customers` - Customer profiles
- `customer_authentication` - Customer login credentials

### Token Management (2)
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Password recovery

### Business Tables (15)
- `salons` - Salon information
- `services` - Service catalog
- `packages` - Service packages
- `package_services` - Package-service mapping
- `staff_info` - Staff profiles
- `staff_documents` - Staff certifications
- `products` - Inventory items
- `stock` - Stock levels
- `stock_transactions` - Inventory movements
- `appointments` - Booking records
- `appointment_services` - Appointment-service mapping
- `appointment_packages` - Appointment-package mapping
- `appointment_feedback` - Customer reviews

### Financial Tables (10)
- `invoice_customer` - Customer invoices
- `invoice_salon` - Salon subscription invoices
- `invoice_salon_items` - Invoice line items
- `customer_payments` - Customer payment records
- `payments_salon` - Salon payment records
- `incentives` - Staff incentive records
- `incentive_payouts` - Incentive payments
- `credit_notes` - Credit adjustments
- `subscription_plans` - Subscription offerings
- `salon_subscriptions` - Salon subscriptions

### Audit Tables (6)
- `billing_audit_logs` - Billing changes
- `billing_calculation_logs` - Calculation history
- `user_activity_log` - User actions
- `user_password_history` - Password changes
- `subscription_billing_cycles` - Billing history
- `subscription_renewal_reminders` - Renewal notifications

### Support Tables (2)
- `email_simulator` - Email testing
- `leave_requests` - Staff leave management

---

# Slide 24: Database Schema - Relationships

## Entity Relationships

### Salon-Centric Model
```
salons (1) ── (N) users
salons (1) ── (N) customers
salons (1) ── (N) services
salons (1) ── (N) packages
salons (1) ── (N) staff_info
salons (1) ── (N) products
salons (1) ── (N) appointments
salons (1) ── (N) invoices
salons (1) ── (1) salon_subscriptions
```

### Appointment Flow
```
customers (1) ── (N) appointments
appointments (1) ── (N) appointment_services
appointments (1) ── (N) appointment_packages
appointments (1) ── (1) invoice_customer
appointments (1) ── (N) appointment_feedback
```

### Package-Service Relationship
```
packages (1) ── (N) package_services
services (1) ── (N) package_services
```

### Staff-Incentive Flow
```
staff_info (1) ── (N) incentives
incentives (1) ── (N) incentive_payouts
```

### Subscription Flow
```
subscription_plans (1) ── (N) salon_subscriptions
salon_subscriptions (1) ── (1) invoice_salon
invoice_salon (1) ── (N) payments_salon
```

---

# Slide 25: Security Implementation

## Authentication & Authorization

### JWT Token Structure
```json
{
  "user_id": 1,
  "role": "ADMIN",
  "salon_id": 1,
  "iat": 1709548800,
  "exp": 1709557800
}
```

### Middleware Chain
```
Request → authenticate() → authorize(['ADMIN']) → Controller
```

### Password Security
- Bcrypt hashing (cost factor 10)
- Password history tracking
- Minimum 6 characters

### Token Security
- HMAC-SHA256 signature
- 15-minute access token expiry
- 7-day refresh token expiry
- Token rotation on refresh
- Revocation on logout

### SQL Injection Prevention
- PDO prepared statements
- Parameterized queries
- Input validation

---

# Slide 26: Frontend Architecture

## Three Frontend Applications

### 1. SUPER_ADMIN Portal
**Location**: `FRONTED/SUPER_ADMIN/`
- Salon management
- User management
- Subscription oversight
- Platform reports
- Salon invoice tracking

### 2. ADMIN/STAFF Portal
**Location**: `FRONTED/ADMIN_STAFF/`
- Dashboard
- Customer management
- Service/Package management
- Staff management
- Inventory control
- Appointment scheduling
- Reports & analytics
- Incentive tracking

### 3. CUSTOMER Portal
**Location**: `FRONTED/CUSTOMER/`
- Service browsing
- Package viewing
- Appointment booking
- My appointments
- Profile management
- Invoice viewing
- Feedback submission
- Contact salon

---

# Slide 27: Frontend Pages - SUPER_ADMIN

## SUPER_ADMIN Pages

### Authentication
- `sa-login.html` - Login page

### Dashboard
- `sa-dashboard.html` - Platform overview

### Salon Management
- `sa-salons.html` - List all salons
- `sa-salon-profile.html` - Salon details

### User Management
- `sa-users.html` - All users across salons
- `sa-customer-profile.html` - Customer details

### Subscription Management
- `sa-subscription.html` - Plans & subscriptions

### Invoice Management
- `sa-invoices.html` - Salon invoices

### Core JavaScript
- `Js/Core/api.js` - API configuration
- `Js/pages/` - Page-specific logic
- `notifications.js` - Toast notifications

---

# Slide 28: Frontend Pages - ADMIN

## ADMIN Dashboard Pages

### Authentication
- `login.html` - Staff login

### Main Dashboard
- `dashboard.html` - Salon overview

### Customer Management
- `customers.html` - Customer list & profiles

### Service Management
- `services.html` - Service catalog

### Package Management
- `package.html` - Service packages

### Staff Management
- `staff.html` - Staff directory

### Appointment Management
- `appointments.html` - Booking calendar
- `schedules.html` - Staff schedules

### Inventory
- `inventory.html` - Stock management

### Financial
- `payments.html` - Payment records
- `reports.html` - Analytics

### Incentives
- `incentives.html` - Staff incentives

### Settings
- `settings.html` - Salon configuration

---

# Slide 29: Frontend Pages - STAFF

## STAFF Dashboard Pages

### Authentication
- Shared login with ADMIN

### Main Dashboard
- `dashboard.html` - Daily schedule

### Customer Service
- `customers.html` - Customer profiles
- `appointments.html` - Today's appointments

### Service Delivery
- `services.html` - Service menu
- `package.html` - Package offerings

### Personal
- `profile.html` - Own profile
- `my-incentives.html` - Commission tracking
- `document.html` - Upload documents
- `view_documents.html` - View certifications

### Scheduling
- `schedules.html` - Work schedule
- `inventory.html` - Stock levels (read-only)

---

# Slide 30: Frontend Pages - CUSTOMER

## CUSTOMER Portal Pages

### Authentication
- `login.html` - Customer login
- `signup.html` - Registration

### Service Discovery
- `services.html` - Browse services
- `packages.html` - View packages

### Booking
- `booking.html` - Book appointment

### My Account
- `myAppointment.html` - Appointment history
- `profileInfo.html` - Profile management
- `mobileCart.html` - Mobile cart view

### Support
- `contactUs.html` - Contact salon

### Features
- `salon-id-switcher.html` - Multi-salon support

---

# Slide 31: API Request/Response Examples

## Login Flow Example

### Request
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

### Response (Success)
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

### Response (Error)
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

---

# Slide 32: API Request/Response Examples

## Create Appointment Example

### Request
```http
POST /api/appointments
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "customer_id": 5,
  "appointment_date": "2025-03-20",
  "start_time": "15:00:00",
  "estimated_duration": 120,
  "services": [
    {
      "service_id": 3,
      "staff_id": 2,
      "price": 1500.00,
      "discount_amount": 100.00,
      "start_time": "15:00:00",
      "end_time": "16:00:00"
    }
  ],
  "packages": [
    {
      "package_id": 1,
      "price": 5000.00,
      "discount_amount": 500.00
    }
  ],
  "discount_amount": 200.00,
  "notes": "Anniversary special"
}
```

### Response
```json
{
  "status": "success",
  "data": {
    "appointment_id": 42
  }
}
```

---

# Slide 33: Business Logic - Appointment Booking

## Complete Booking Flow

### Step 1: Customer Selects Services
- Browse ACTIVE services
- View prices and duration
- Add to cart

### Step 2: Choose Date & Time
- Select available slot
- System checks conflicts
- Validates business hours

### Step 3: Assign Staff (Optional)
- Preferred staff selection
- Staff availability check
- Auto-assign if not specified

### Step 4: Review & Confirm
- Calculate total
- Apply discounts
- Show final amount

### Step 5: Create Appointment
```
INSERT INTO appointments → appointment_id
INSERT INTO appointment_services → service mappings
INSERT INTO appointment_packages → package mappings
```

### Step 6: Confirmation
- Send confirmation (email/SMS)
- Add to staff schedule
- Update availability

---

# Slide 34: Business Logic - Invoice Generation

## Invoice Creation Flow

### From Appointment
```
1. Appointment completed
2. Admin clicks "Generate Invoice"
3. System calculates:
   - Sum of all service prices
   - Sum of all package prices
   - Subtract service discounts
   - Subtract package discounts
   - Apply appointment-level discount
   - Add tax (GST)
4. Create invoice_customer record
5. Generate invoice number
6. Set payment_status = UNPAID
```

### Calculation Example
```
Services: ₹2,500
Packages: ₹5,000
Subtotal: ₹7,500
Service Discounts: -₹300
Package Discounts: -₹500
Appointment Discount: -₹200
Taxable Amount: ₹6,500
GST (18%): ₹1,170
─────────────────────
Total: ₹7,670
```

---

# Slide 35: Business Logic - Subscription Billing

## Subscription Lifecycle

### 1. Plan Creation (SUPER_ADMIN)
```
Create subscription plan
↓
Set duration, price, features
↓
Activate plan
```

### 2. Salon Subscription
```
Select salon
↓
Choose plan
↓
Set start date
↓
Auto-calculate end date
↓
Generate invoice
```

### 3. Billing Cycle
```
Invoice generated → UNPAID
↓
Salon makes payment
↓
Payment recorded → PAID
↓
Subscription active
↓
Expiry reminder (7 days before)
↓
Renewal or expiration
```

### 4. Renewal Flow
```
Check current subscription
↓
Create new subscription
↓
Link to previous
↓
Generate new invoice
↓
Log renewal in audit table
```

---

# Slide 36: Business Logic - Staff Incentives

## Incentive Calculation

### Service Commission
```
Service Price: ₹1,000
Commission Rate: 10%
Incentive Amount: ₹100
```

### Fixed Bonus
```
Target Achievement: 50 appointments
Bonus Amount: ₹5,000
```

### Payout Process
```
1. Admin creates incentive
   Status: PENDING

2. Admin processes payout
   - Select payment mode
   - Enter transaction reference
   - Submit

3. System updates:
   - Create payout record
   - Update incentive status → PAID
```

### Batch Payout
```
Select multiple incentives
↓
Single payment transaction
↓
Update all to PAID
↓
Create individual payout records
```

---

# Slide 37: Business Logic - Inventory Management

## Stock Flow

### Product Creation
```
Add product
↓
Set min/max levels
↓
Set initial quantity
↓
Create stock record
```

### Stock IN (Purchase)
```
Receive goods
↓
Create stock transaction (IN)
↓
Update current_quantity
↓
Update last_restocked
```

### Stock OUT (Usage)
```
Product used/service
↓
Create stock transaction (OUT)
↓
Decrease current_quantity
↓
Check if below minimum
```

### Low Stock Alert
```
IF current_quantity < minimum_quantity
THEN trigger alert
↓
Notify admin
↓
Suggest reorder
```

### Stock Adjustment
```
Physical count
↓
Compare with system
↓
Create ADJUSTMENT transaction
↓
Reconcile difference
```

---

# Slide 38: Validation Rules

## Input Validation Summary

### Email Validation
- Format: `user@domain.com`
- Required for: SUPER_ADMIN, ADMIN, STAFF
- Optional for: CUSTOMER (can use phone)

### Phone Validation (Indian)
- Format: 10 digits
- Must start with 6-9
- Regex: `/^[6-9][0-9]{9}$/`

### Password Requirements
- Minimum 6 characters
- Stored as bcrypt hash

### Date Validation
- Format: YYYY-MM-DD
- Cannot be in past (for appointments)
- Date of birth: Valid calendar date

### Price Validation
- Range: 0 to 1,000,000
- Decimal allowed (2 places)
- Cannot be negative

### Duration Validation
- Range: 1 to 1440 minutes (24 hours)
- Must be positive integer

### Status Enums
- Must match predefined values
- Case-sensitive (UPPERCASE)

---

# Slide 39: Error Handling

## Error Response Format

### Standard Error Response
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate entry)
- **500**: Server Error

### Common Error Messages
- "Invalid credentials" - Login failed
- "Access token required" - Missing authentication
- "Invalid or expired token" - Token validation failed
- "Unauthorized" - Not authenticated
- "Forbidden" - Insufficient permissions
- "Not found" - Resource doesn't exist
- "Already exists" - Duplicate entry
- "No valid fields to update" - Empty update request

---

# Slide 40: Testing & Deployment

## Testing Checklist

### Authentication Testing
- [ ] Login with all roles
- [ ] Token refresh
- [ ] Logout and token revocation
- [ ] Expired token handling

### Authorization Testing
- [ ] Role-based access
- [ ] Salon-level isolation
- [ ] Customer privacy
- [ ] Cross-salon access prevention

### API Testing
- [ ] All 115 endpoints
- [ ] Request validation
- [ ] Response format
- [ ] Error handling

### Database Testing
- [ ] CRUD operations
- [ ] Foreign key constraints
- [ ] Transaction rollback
- [ ] Data integrity

### Frontend Testing
- [ ] All pages load
- [ ] Form validations
- [ ] API integration
- [ ] Responsive design

---

# Slide 41: Deployment Guide

## Server Requirements

### PHP Configuration
- PHP 8.0 or higher
- PDO MySQL extension
- File upload enabled (max 5MB)
- OpenSSL for JWT

### MySQL Configuration
- MySQL 8.0 or higher
- InnoDB engine
- UTF-8 charset
- Appropriate user privileges

### Directory Permissions
```
BACKEND/public/uploads/ - 777 (writable)
BACKEND/logs/ - 777 (writable)
BACKEND/config/ - 644 (read-only)
```

### Environment Configuration
```php
// config/database.php
$host = "localhost";
$db   = "sam-db";
$user = "root";
$pass = "root";

// config/jwt.php
define('JWT_SECRET', 'your-secret-key');
define('JWT_EXPIRY_SECONDS', 900);
```

---

# Slide 42: Future Enhancements

## Planned Features

### Customer Features
- Online payment gateway integration
- SMS/Email notifications
- Loyalty points system
- Membership cards
- Gift vouchers

### Staff Features
- Mobile app for staff
- Shift scheduling
- Performance analytics
- Training module
- Document expiry alerts

### Admin Features
- Advanced analytics dashboard
- Multi-salon management
- Bulk operations
- Export to Excel/PDF
- Automated reporting

### SUPER_ADMIN Features
- Platform analytics
- Revenue sharing
- Automated billing
- Franchise management
- White-label options

### Technical Improvements
- API rate limiting
- Caching layer (Redis)
- Queue system for emails
- Real-time notifications (WebSocket)
- Microservices architecture

---

# Slide 43: Summary

## SAM System Highlights

### Comprehensive Coverage
- ✅ Complete salon operations
- ✅ Multi-role access control
- ✅ End-to-end business workflow
- ✅ Financial management
- ✅ Inventory tracking
- ✅ Performance analytics

### Technical Excellence
- ✅ Secure authentication (JWT)
- ✅ Role-based authorization
- ✅ Input validation
- ✅ Error handling
- ✅ Transaction support
- ✅ Audit logging

### Business Value
- ✅ Streamlined operations
- ✅ Customer satisfaction
- ✅ Staff performance tracking
- ✅ Revenue optimization
- ✅ Inventory control
- ✅ Data-driven decisions

### Scalability
- ✅ Multi-salon support
- ✅ Modular architecture
- ✅ Extensible design
- ✅ API-first approach

---

# Slide 44: Q&A

## Thank You

### SAM - Salon Management System

**Questions?**

---

# Appendix: Complete API List

## All 115 APIs by Module

### AUTH (5 APIs)
1. POST /api/auth/login
2. POST /api/auth/refresh
3. POST /api/auth/logout
4. GET /api/auth/me
5. PUT /api/auth/me

### CUSTOMERS (11 APIs)
6. POST /api/customers/register
7. POST /api/customers/create
8. PATCH /api/customers/update/{id}
9. PATCH /api/customers/status/{id}
10. GET /api/customers/list
11. GET /api/customers/view/{id}
12. PATCH /api/customers/me
13. GET /api/customers/me/appointments
14. GET /api/customers/{id}/appointments
15. GET /api/customers/me/feedback
16. GET /api/customers/{id}/feedback

### SERVICES (6 APIs)
17. POST /api/admin/services/upload-image
18. POST /api/admin/services
19. PUT /api/admin/services/{id}
20. PATCH /api/admin/services/{id}/status
21. GET /api/services
22. GET /api/services/{id}

### PACKAGES (6 APIs)
23. POST /api/admin/packages/upload-image
24. POST /api/admin/packages
25. PUT /api/admin/packages/{id}
26. PATCH /api/admin/packages/{id}/status
27. GET /api/packages
28. GET /api/packages/{id}

### STAFF (14 APIs)
29. POST /api/admin/staff
30. PUT /api/admin/staff/{id}
31. PATCH /api/admin/staff/{id}/status
32. GET /api/admin/staff
33. GET /api/admin/staff/{id}
34. POST /api/admin/staff/{id}/documents
35. GET /api/admin/staff/{id}/documents
36. GET /api/admin/staff/{id}/documents/{docId}
37. DELETE /api/admin/staff/{id}/documents/{docId}
38. POST /api/staff/incentives
39. POST /api/staff/incentives/{id}/payout
40. POST /api/staff/incentives/batch-payout
41. GET /api/staff/incentives/unpaid/{staffId}
42. GET /api/staff/incentives/history/{staffId}
43. GET /api/staff (public list)

### STOCK (11 APIs)
44. POST /api/admin/products
45. PUT /api/admin/products/{id}
46. GET /api/admin/products
47. GET /api/admin/products/{id}
48. PATCH /api/admin/stock/{id}
49. GET /api/admin/stock
50. GET /api/admin/stock/low-stock-alerts
51. POST /api/admin/stock/transactions
52. GET /api/admin/stock/transactions
53. GET /api/admin/stock/transactions/{id}

### APPOINTMENTS (14 APIs)
54. POST /api/appointments
55. PUT /api/appointments/{id}
56. PATCH /api/appointments/{id}/cancel
57. PATCH /api/appointments/{id}/approve
58. PATCH /api/appointments/{id}/complete
59. GET /api/appointments
60. GET /api/appointments/{id}
61. POST /api/appointments/{id}/feedback
62. PUT /api/appointments/{id}/services/{serviceId}
63. PATCH /api/appointments/{id}/services/{serviceId}
64. DELETE /api/appointments/{id}/services/{serviceId}
65. POST /api/appointments/{id}/packages
66. PUT /api/appointments/{id}/packages/{packageId}
67. DELETE /api/appointments/{id}/packages/{packageId}
68. POST /api/appointments/{id}/invoice

### INVOICES (7 APIs)
69. POST /api/invoices
70. PUT /api/invoices/{id}
71. GET /api/invoices
72. GET /api/invoices/{id}
73. GET /api/invoices/appointment/{appointmentId}
74. POST /api/invoices/customer/{invoiceId}/payments
75. GET /api/invoices/customer/{invoiceId}/payments

### SUBSCRIPTION PLANS (5 APIs)
76. POST /api/subscription-plans
77. PUT /api/subscription-plans/{id}
78. GET /api/subscription-plans
79. GET /api/subscription-plans/{id}
80. PATCH /api/subscription-plans/{id}/status

### SALON SUBSCRIPTIONS (13 APIs)
81. POST /api/subscriptions
82. GET /api/subscriptions/current
83. GET /api/subscriptions
84. GET /api/subscriptions/{id}
85. PUT /api/subscriptions/{id}
86. PATCH /api/subscriptions/{id}/cancel
87. POST /api/super-admin/salons/{id}/subscriptions
88. PUT /api/super-admin/subscriptions/{id}
89. GET /api/super-admin/salons/{id}/subscriptions
90. GET /api/super-admin/subscriptions/{id}
91. POST /api/super-admin/subscriptions/{id}/generate-invoice
92. POST /api/super-admin/subscriptions/{id}/renew
93. GET /api/super-admin/subscriptions

### SALONS (6 APIs)
94. POST /api/admin/upload/logo
95. POST /api/super-admin/salons
96. PUT /api/super-admin/salons/{id}
97. PATCH /api/super-admin/salons/{id}/status
98. GET /api/super-admin/salons
99. GET /api/super-admin/salons/{id}
100. GET /api/salon/info (public)

### USERS (6 APIs)
101. GET /api/admin/users
102. POST /api/admin/salons/{id}/admin
103. GET /api/admin/salons/{id}/users
104. GET /api/admin/users/{id}
105. PUT /api/admin/users/{id}
106. PATCH /api/admin/users/{id}/status

### SALON INVOICES (7 APIs)
107. POST /api/super-admin/invoices/salon
108. GET /api/super-admin/invoices/salon
109. GET /api/super-admin/invoices/salon/{id}
110. POST /api/super-admin/invoices/salon/{id}/payments
111. GET /api/salon/invoices
112. GET /api/salon/invoices/{id}
113. PUT /api/salon/invoices/{id}
114. GET /api/salon/invoices/subscription/{subscriptionId}

### REPORTS (9 APIs)
115. GET /api/reports/sales
116. GET /api/reports/appointments
117. GET /api/reports/staff-performance
118. GET /api/reports/services
119. GET /api/reports/packages
120. GET /api/reports/customers
121. GET /api/reports/inventory
122. GET /api/reports/incentives
123. GET /api/reports/tax

**Total: 115+ APIs**
