# SAM Backend - Frontend Integration Guide

## ✅ COMPLETED INTEGRATIONS

### 1. Authentication System
- **Login**: JWT-based authentication with token decoding
- **Token Storage**: localStorage (auth_token, refresh_token)
- **User Info**: Extracted from JWT payload
- **API**: `POST /api/auth/login`

### 2. Core API Module (`js/core-api.js`)
- API base URL: `http://localhost/Sam-Backend/BACKEND/public/index.php/api`
- Token manager with JWT decoding
- Toast notifications
- Form validators
- Helper functions (formatCurrency, formatDate, getStatusBadgeClass)

### 3. Appointments Module
**File**: `admin/appointments.html`, `js/appointments-api.js`

**Backend Fields**:
```
appointments table:
- appointment_id (PK)
- salon_id, customer_id
- appointment_date, start_time, end_time
- estimated_duration
- total_amount, discount_amount, final_amount
- status (PENDING|CONFIRMED|COMPLETED|CANCELLED)
- notes, cancellation_reason

appointment_services table:
- service_id, staff_id, service_price, discount_amount, final_price
- start_time, end_time, status

appointment_packages table:
- package_id, staff_id, package_price, discount_amount, final_price, status
```

**APIs Integrated**:
- `GET /appointments` - List with status, date filters
- `GET /appointments/{id}` - View details with services & packages
- `POST /appointments` - Create (requires: customer_id, date, start_time, services[] or packages[])
- `PATCH /appointments/{id}/cancel` - Cancel (cancellation_reason)
- `PATCH /appointments/{id}/approve` - Approve → CONFIRMED
- `PATCH /appointments/{id}/complete` - Complete → COMPLETED

### 4. Customers Module
**File**: `admin/customers.html`, `js/customers-api.js`

**Backend Fields**:
```
customers table:
- customer_id (PK), salon_id
- name, phone, email, gender
- date_of_birth, anniversary_date, address
- status (ACTIVE|INACTIVE)
- customer_since
```

**APIs Integrated**:
- `GET /customers/list` - List customers
- `GET /customers/view/{id}` - View details
- `POST /customers/create` - Create (requires: name + phone/email)
- `PATCH /customers/update/{id}` - Update
- `PATCH /customers/status/{id}` - Toggle status

### 5. Staff Module
**File**: `js/staff-api-module.js`

**Backend Fields**:
```
users table:
- user_id (PK), salon_id, username, role, email, password_hash, status

staff_info table:
- staff_id (PK), salon_id, user_id (FK)
- name, phone, email
- date_of_birth, date_of_joining
- specialization, experience_years, salary
- status (ACTIVE|INACTIVE|ON_LEAVE|TERMINATED)

incentives table:
- incentive_id (PK), staff_id (FK), appointment_id (FK nullable)
- incentive_type (SERVICE_COMMISSION|BONUS|TARGET_ACHIEVEMENT)
- calculation_type (FIXED|PERCENTAGE)
- percentage_rate, fixed_amount, base_amount, incentive_amount
- remarks, status (PENDING|PAID)

incentive_payouts table:
- payout_id (PK), incentive_id (FK), staff_id (FK)
- payout_amount, payout_date, payment_mode
- transaction_reference, remarks
```

**APIs Integrated**:
- `GET /admin/staff` - List staff
- `GET /admin/staff/{id}` - View details
- `POST /admin/staff` - Create (creates users + staff_info)
- `PUT /admin/staff/{id}` - Update
- `PATCH /admin/staff/{id}/status` - Toggle status
- `POST /staff/incentives` - Create incentive
- `POST /staff/incentives/{id}/payout` - Process payout

### 6. Services & Packages Module
**File**: `js/services-packages-api.js`

**Backend Fields**:
```
services table:
- service_id (PK), salon_id
- service_name, description, category
- duration, price, status

packages table:
- package_id (PK), salon_id
- package_name, description, category
- total_price, discount_percentage, validity_days
- bonus_features, status
```

**APIs Integrated**:
- `GET /services` - List all services
- `GET /services/{id}` - View details
- `POST /admin/services` - Create service
- `PUT /admin/services/{id}` - Update service
- `PATCH /admin/services/{id}/status` - Toggle status
- Same for packages

### 7. Stock/Inventory Module
**File**: `js/stock-api.js`

**Backend Fields**:
```
products table:
- product_id (PK), salon_id
- product_name, category, supplier
- stock_level, reorder_point, unit_price, unit_type
- notes

stock_transactions table:
- transaction_id (PK), product_id (FK)
- transaction_type (IN|OUT|ADJUSTMENT)
- quantity, reference_type, reference_id
- remarks
```

**APIs Integrated**:
- `GET /admin/products` - List products
- `POST /admin/products` - Create product
- `PUT /admin/products/{id}` - Update product
- `PATCH /admin/stock/{id}` - Update stock level
- `GET /admin/stock/low-stock-alerts` - Low stock alerts
- `POST /admin/stock/transactions` - Create transaction

### 8. Invoices & Payments Module
**File**: `js/invoices-payments-api.js`

**Backend Fields**:
```
invoice_customer table:
- invoice_customer_id (PK), appointment_id (FK), salon_id, customer_id
- invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount
- payment_status (UNPAID|PARTIAL|PAID)
- invoice_date, due_date, notes

customer_payments table:
- customer_payment_id (PK), invoice_customer_id (FK)
- payment_mode (CASH|UPI|CARD|BANK|NET_BANKING)
- transaction_no, amount, payment_date
- status (SUCCESS|FAILED|PENDING)

invoice_salon table (SUPER_ADMIN):
- invoice_salon_id (PK), salon_id, subscription_id
- amount, tax_amount, total_amount
- payment_status, due_date

payments_salon table (SUPER_ADMIN):
- payment_id (PK), invoice_salon_id (FK)
- payment_mode, transaction_no, amount, payment_date
```

**APIs Integrated**:
- `POST /invoices` - Create customer invoice
- `GET /invoices` - List invoices
- `GET /invoices/{id}` - View invoice
- `POST /invoices/customer/{id}/payments` - Record payment
- `GET /salon/invoices` - List salon invoices (ADMIN)
- `POST /salon/payments` - Create salon payment

### 9. Reports Module
**File**: `js/reports-api.js`

**APIs Integrated**:
- `GET /reports/sales` - Sales report (start_date, end_date)
- `GET /reports/appointments` - Appointments report
- `GET /reports/staff-performance` - Staff performance
- `GET /reports/services` - Service-wise revenue
- `GET /reports/packages` - Package-wise revenue
- `GET /reports/customers` - Customer visit report
- `GET /reports/inventory` - Inventory usage
- `GET /reports/incentives` - Incentive payout report
- `GET /reports/tax` - Tax report (GST)

---

## 📋 DATABASE TABLES REFERENCE

### Core Tables
1. **salons** - Salon information
2. **users** - Admin/Staff authentication
3. **customers** - Customer records
4. **customer_authentication** - Customer login credentials
5. **staff_info** - Staff details

### Service Tables
6. **services** - Service catalog
7. **packages** - Package deals
8. **subscription_plans** - Salon subscription plans
9. **salon_subscriptions** - Active subscriptions

### Transaction Tables
10. **appointments** - Appointment bookings
11. **appointment_services** - Services in appointments
12. **appointment_packages** - Packages in appointments
13. **invoice_customer** - Customer invoices
14. **customer_payments** - Customer payments
15. **invoice_salon** - Salon invoices (SUPER_ADMIN)
16. **payments_salon** - Salon payments

### Inventory Tables
17. **products** - Product catalog
18. **stock** - Stock levels
19. **stock_transactions** - Stock movement log

### Staff Tables
20. **incentives** - Staff incentives
21. **incentive_payouts** - Incentive payments
22. **staff_documents** - Staff documents

### Other Tables
23. **appointment_feedback** - Customer feedback
24. **refresh_tokens** - JWT refresh tokens
25. **schedules** - Staff schedules

---

## 🔧 USAGE EXAMPLES

### Create Appointment
```javascript
const result = await AppointmentsAPI.create({
    customer_id: 1,
    appointment_date: '2026-02-26',
    start_time: '10:00',
    estimated_duration: 60,
    services: [
        {
            service_id: 1,
            price: 500,
            discount_amount: 50
        }
    ],
    notes: 'First time customer'
});
```

### Create Customer
```javascript
const result = await CustomersAPI.create({
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    gender: 'Male',
    date_of_birth: '1990-01-15',
    anniversary_date: '2015-06-20'
});
```

### Create Staff with Incentive
```javascript
// Create staff
const staffResult = await StaffAPI.create({
    username: 'john_staff',
    email: 'john@salon.com',
    password: 'password123',
    name: 'John Smith',
    phone: '9876543210',
    role: 'STAFF',
    specialization: 'Hair Stylist',
    experience_years: 5,
    salary: 30000
});

// Create incentive
const incentiveResult = await StaffAPI.createIncentive({
    staff_id: staffResult.data.staff_id,
    incentive_type: 'SERVICE_COMMISSION',
    calculation_type: 'FIXED',
    fixed_amount: 50,
    incentive_amount: 50,
    remarks: 'Haircut commission'
});

// Process payout
const payoutResult = await StaffAPI.processPayout(incentiveResult.data.incentive_id, {
    payout_amount: 50,
    payment_mode: 'BANK',
    transaction_reference: 'TXN123456'
});
```

---

## 🎨 FRONTEND PAGES STATUS

| Page | Status | Notes |
|------|--------|-------|
| login.html | ✅ Complete | JWT auth, role-based redirect |
| index.html | ✅ Complete | Auth status check |
| admin/dashboard.html | ⏳ Partial | Needs real data integration |
| admin/appointments.html | ✅ Complete | Full CRUD with backend |
| admin/customers.html | ✅ Complete | Full CRUD with backend |
| admin/services.html | ⏳ Partial | Basic integration |
| admin/staff.html | ⏳ Pending | Needs UI implementation |
| admin/inventory.html | ⏳ Pending | Needs UI implementation |
| admin/payments.html | ⏳ Pending | Needs UI implementation |
| admin/reports.html | ⏳ Pending | Needs UI implementation |
| staff/dashboard.html | ⏳ Partial | Needs personal stats |
| staff/appointments.html | ⏳ Pending | Staff view only |

---

## 🚀 NEXT STEPS

1. **Complete remaining pages** (staff, inventory, payments, reports)
2. **Add form validation** for all inputs
3. **Implement pagination** for all list views
4. **Add loading states** and error handling
5. **Test all API endpoints** with real data
6. **Add export functionality** for reports
7. **Implement real-time notifications**

---

## 📝 IMPORTANT NOTES

### Backend Constraints
- All appointments require at least one service OR package
- Customer phone OR email is required (at least one)
- Staff creation creates BOTH users + staff_info records
- Incentive payout auto-fills staff_id from incentive record
- JWT tokens expire after 900000ms (15 minutes)

### Status Values
- **Appointment**: PENDING, CONFIRMED, COMPLETED, CANCELLED
- **Customer/Staff**: ACTIVE, INACTIVE (STAFF also: ON_LEAVE, TERMINATED)
- **Invoice**: UNPAID, PARTIAL, PAID
- **Incentive**: PENDING, PAID

### Role-Based Access
- **ADMIN**: Full access to all salon operations
- **STAFF**: Limited access (no staff management, limited reports)
- **CUSTOMER**: Own appointments and profile only
