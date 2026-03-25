# SAM - Salon Management System
## Complete Platform Presentation

**Created for Gamma AI Presentation Generation**

---

## 🎨 PRESENTATION STYLE INSTRUCTIONS FOR GAMMA AI

**Visual Theme:** Modern, professional, clean
**Color Palette:** Purple (#6c5ce7), White, Light Gray
**Font Style:** Sans-serif, modern, readable
**Layout:** Minimal text, more visuals, icons, and diagrams
**Animations:** Smooth transitions between slides
**Icons:** Use business/tech icons for each module

**Tone:** Professional yet approachable, enterprise-grade but user-friendly

**For Each Slide:**
- Use large, bold headings
- Limit bullet points to 4-5 per slide
- Include relevant icons or illustrations
- Use cards/boxes for feature highlights
- Add flow diagrams where applicable

---

# Slide 1: Title Slide

## 🏆 SAM
### Salon Management System

**Enterprise-Grade Multi-Role Platform**

---

**115+ APIs | 4 User Roles | 39 Database Tables | Complete Business Workflow**

*Transforming Salon Operations Through Technology*

---

# Slide 2: What is SAM?

## One Platform. Complete Control.

SAM is a comprehensive salon management system that connects everyone:

### 👤 Salon Owners
Manage multiple locations, track revenue, oversee operations

### 💇 Staff Members
View schedules, deliver services, earn incentives

### 🛎️ Customers
Book appointments, track history, provide feedback

### 🎯 Super Admins
Platform oversight, subscription management, business intelligence

---

# Slide 3: The Big Picture

## By The Numbers

### 📊 115+
**API Endpoints**
Across 15 business modules

### 🗄️ 39
**Database Tables**
Complete relational schema

### 👥 4
**User Roles**
Granular access control

### 🔐 15 min
**Token Security**
JWT with refresh rotation

### 📱 3
**Frontend Portals**
Super Admin, Salon, Customer

### ⚡ 100%
**PHP & MySQL**
Enterprise-grade backend

---

# Slide 4: User Roles Overview

## Who Uses SAM?

| Role | What They Do | Access Level |
|------|--------------|--------------|
| **👔 SUPER_ADMIN** | Platform management | All salons, all users |
| **🏢 ADMIN** | Salon operations | Own salon only |
| **💇 STAFF** | Service delivery | Appointments, own data |
| **🛍️ CUSTOMER** | Book services | Own appointments only |

---

# Slide 5: Complete Business Flow

## From Setup to Service

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: SUPER_ADMIN Sets Up Platform                 │
│  Create Salon → Assign Admin → Add Subscription        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: ADMIN Configures Salon                        │
│  Add Services → Create Packages → Hire Staff           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: STAFF Delivers Services                       │
│  View Schedule → Serve Customers → Earn Incentives     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: CUSTOMER Books & Experiences                  │
│  Browse → Book → Visit → Pay → Review                  │
└─────────────────────────────────────────────────────────┘
```

---

# Slide 6: Module Map

## 15 Business Modules

**Authentication & Security**
- 🔐 Auth Module

**Core Business**
- 🏢 Salons
- 👥 Users
- 🛍️ Customers
- 💇 Staff
- ✂️ Services
- 📦 Packages

**Operations**
- 📅 Appointments
- 📋 Invoices
- 💳 Payments
- 📊 Stock/Inventory

**Business Management**
- 💎 Subscription Plans
- 🔄 Salon Subscriptions
- 📈 Reports
- 🎯 Dashboard

---

# Slide 7: Authentication

## 🔐 Secure Access for Everyone

### Login Types
- **Super Admin** - Email + Password
- **Salon Staff** - Email + Password + Salon ID
- **Customers** - Email/Phone + Password + Salon ID

### Security Features
✅ JWT Tokens (15 min expiry)
✅ Refresh Tokens (7 days)
✅ Token Rotation
✅ Password Hashing (bcrypt)
✅ Role-Based Access

### Endpoints
- Login / Refresh / Logout
- Get Profile / Update Profile

---

# Slide 8: Salon Management

## 🏢 Multi-Location Support

### Super Admin Creates Salon

**Information Captured:**
- Salon Name & Owner
- Contact Details (Email, Phone)
- GST Number (Tax ID)
- Full Address
- Logo Upload

**Auto-Generated:**
- Salon Admin Account
- Username & Password
- Access Credentials

### Operations
- ✅ Create New Salon
- ✅ Update Details
- ✅ Activate/Deactivate
- ✅ View All Salons
- ✅ Individual Profiles

---

# Slide 9: Customer Management

## 🛍️ Customer-Centric Design

### Customer Registration
```
Name + Phone/Email + Password → Account Created!
```

### Self-Service Features
- 📅 View Own Appointments
- 📝 Update Profile
- ⭐ Submit Feedback
- 💳 View Invoices

### Admin/Staff Controls
- Create Customer Profiles
- Update Information
- View Customer History
- Soft Delete (Deactivate)

### Privacy First
❌ Customers cannot see other customers
✅ Only view own data

---

# Slide 10: Services & Packages

## ✂️ Service Catalog

### Services
Individual offerings like:
- Haircut (30 min - ₹500)
- Facial Treatment (60 min - ₹1,500)
- Manicure (45 min - ₹800)

### Packages
Bundled deals like:
- Bridal Package (5 services - ₹15,000)
- Spa Day Package (4 services - ₹8,000)
- Grooming Package (3 services - ₹3,500)

### Features
✅ Image Uploads
✅ Duration Tracking
✅ Price Validation
✅ Staff Assignment
✅ Active/Inactive Toggle

---

# Slide 11: Staff Management

## 💇 Hire & Manage Team

### Dual-Profile System
**Users Table** → Login credentials
**Staff Info Table** → Professional details

### Staff Information
- Name, Contact, Email
- Date of Birth & Joining
- Specialization (Hair, Makeup, etc.)
- Experience (Years)
- Salary Information

### Status Options
- 🟢 ACTIVE - Working
- 🟡 INACTIVE - Temporarily away
- 🟠 ON_LEAVE - Approved leave
- 🔴 TERMINATED - Employment ended

### Documents
Upload certifications, IDs, contracts

---

# Slide 12: Staff Incentives

## 💰 Performance Rewards

### Incentive Types
1. **Service Commission** - % of service price
2. **Bonus** - Fixed amount for targets
3. **Target Achievement** - Milestone rewards

### Calculation Methods
- **Fixed Amount** - ₹50 per service
- **Percentage** - 10% of service value

### Payout Process
```
Create Incentive (PENDING)
        ↓
Process Payout
        ↓
Mark as PAID
```

### Batch Processing
Pay multiple incentives in one transaction!

---

# Slide 13: Inventory Management

## 📦 Stock Control Made Simple

### Product Categories
- **Products** - Shampoos, conditioners, oils
- **Equipment** - Dryers, straighteners, tools

### Stock Levels
```
Current Quantity: 75
Minimum Level: 15  ⚠️ Low Stock Alert
Maximum Level: 120
```

### Transactions
- **IN** - New purchases, returns
- **OUT** - Usage, sales
- **ADJUSTMENT** - Corrections, damage

### Smart Alerts
🔔 Notify when stock below minimum
🔔 Warn when overstocked

---

# Slide 14: Appointments

## 📅 Booking System

### Create Appointment
```
Select Customer
    ↓
Choose Date & Time
    ↓
Add Services/Packages
    ↓
Assign Staff (Optional)
    ↓
Confirm Booking
```

### Status Flow
```
PENDING → CONFIRMED → COMPLETED
              ↓
         CANCELLED
```

### Key Features
✅ Customer/Staff Booking
✅ Multiple Services/Package
✅ Time Slot Management
✅ Staff Assignment
✅ Discount Application
✅ Auto-Calculation

---

# Slide 15: Appointment Management

## Managing Bookings

### Service-Level Control
- Add services to appointment
- Update staff assignment
- Modify prices/discounts
- Remove services

### Package Handling
- Add complete packages
- Track package delivery
- Package-level pricing

### Smart Features
- **Auto-Recalculation** - Totals update automatically
- **Time Tracking** - Start/end times per service
- **Status Updates** - Per service/package status

---

# Slide 16: Invoices & Payments

## 💳 Billing System

### Invoice Generation
```
Appointment Complete
        ↓
Click "Generate Invoice"
        ↓
System Calculates:
  • Services Total
  • Packages Total
  • Minus Discounts
  • Plus Tax (GST)
        ↓
Invoice Created!
```

### Payment Status
- 🔴 UNPAID - No payment yet
- 🟡 PARTIAL - Some payment made
- 🟢 PAID - Fully paid

### Payment Methods
💵 Cash | 💳 Card | 📱 UPI | 🏦 Net Banking | 📄 Cheque

---

# Slide 17: Subscription Plans

## 💎 Platform Monetization

### Plan Types

**Flat Rate**
₹50,000/year - Unlimited access

**Per Appointment**
₹500 per appointment booked

**Percentage Commission**
10% of each transaction

### Plan Features
- Duration (Days/Months)
- Pricing Structure
- Feature List
- Active/Inactive Status

### Super Admin Control
✅ Create Plans
✅ Update Pricing
✅ Toggle Status
✅ View All Plans

---

# Slide 18: Salon Subscriptions

## 🔄 Subscription Lifecycle

### Assign to Salon
```
Select Salon
    ↓
Choose Plan
    ↓
Set Start Date
    ↓
Auto-Calculate End Date
    ↓
Generate Invoice
```

### Status Tracking
- 🟢 ACTIVE - Currently valid
- 🟡 INACTIVE - Temporarily suspended
- 🔴 EXPIRED - Past end date
- ⚫ CANCELLED - Terminated early

### Renewal Flow
Send reminder → Create new subscription → Generate invoice → Link to previous

---

# Slide 19: Salon Invoices

## 📄 B2B Billing

### Invoice Generation
Auto-created when:
- Salon subscribes to plan
- Subscription renews
- Manual invoice creation

### Invoice Details
- Invoice Number (Auto-generated)
- Amount (From plan)
- Tax (GST)
- Due Date
- Payment Status

### Payment Tracking
Record payments with:
- Payment mode
- Transaction reference
- Payment date
- Amount paid

---

# Slide 20: Reports & Analytics

## 📊 Business Intelligence

### Available Reports

**📈 Sales Reports**
Revenue, payment methods, outstanding

**📅 Appointment Reports**
Bookings, cancellations, peak hours

**💇 Staff Performance**
Services per staff, incentives, ratings

**🛍️ Customer Reports**
New customers, retention, lifetime value

**📦 Inventory Reports**
Stock levels, usage patterns, alerts

**💰 Tax Reports**
GST collected, tax liability

---

# Slide 21: Dashboard

## 🎯 Real-Time Overview

### Salon Dashboard Metrics

| Metric | Value |
|--------|-------|
| Total Customers | 1,247 |
| Today's Appointments | 23 |
| Monthly Revenue | ₹4,85,000 |
| Active Staff | 18 |
| Pending Invoices | 12 |
| Low Stock Items | 3 |

### Visual Elements
- 📊 Revenue charts
- 📅 Appointment calendar
- 👥 Customer growth graph
- ⭐ Staff performance cards
- 🔔 Alert notifications

---

# Slide 22: Database Architecture

## 🗄️ 39 Tables. Perfectly Organized.

### Table Categories

**Authentication (4 tables)**
Super Admin, Users, Customers, Tokens

**Business Data (15 tables)**
Salons, Services, Packages, Staff, Stock, Appointments

**Financial (10 tables)**
Invoices, Payments, Incentives, Subscriptions

**Audit & Logs (6 tables)**
Activity logs, Billing audits, Password history

**Support (4 tables)**
Email simulator, Leave requests, Feedback

---

# Slide 23: Security Implementation

## 🔒 Enterprise-Grade Security

### Authentication
- JWT Tokens with HMAC-SHA256
- 15-minute access token expiry
- 7-day refresh token expiry
- Token rotation on every refresh

### Authorization
- Role-Based Access Control (RBAC)
- Salon-level data isolation
- Customer privacy protection
- Middleware chain for every request

### Data Protection
- Bcrypt password hashing
- SQL injection prevention (Prepared statements)
- Input validation on all endpoints
- Audit logging for sensitive operations

---

# Slide 24: Frontend Portals

## 🖥️ Three Dedicated Interfaces

### 1. Super Admin Portal
**Purpose:** Platform Management
**Pages:** Salons, Users, Subscriptions, Reports, Invoices

### 2. Salon Portal (Admin/Staff)
**Purpose:** Daily Operations
**Pages:** Dashboard, Customers, Services, Packages, Staff, Appointments, Inventory, Reports

### 3. Customer Portal
**Purpose:** Self-Service Booking
**Pages:** Services, Packages, Booking, My Appointments, Profile, Invoices

---

# Slide 25: Technology Stack

## ⚙️ Built for Scale

### Backend
```
PHP 8+ (PDO)
    ↓
MySQL 8.0
    ↓
JWT Authentication
    ↓
Custom MVC Router
```

### Security
- Password Hashing (bcrypt)
- Prepared Statements
- Input Validation
- Token Management

### Architecture
- Modular Design
- RESTful APIs
- Middleware Pattern
- Transaction Support

---

# Slide 26: API Highlights

## 🚀 115+ Endpoints

### By Module
| Module | APIs |
|--------|------|
| Auth | 5 |
| Customers | 11 |
| Services | 6 |
| Packages | 6 |
| Staff | 14 |
| Stock | 11 |
| Appointments | 14 |
| Invoices | 7 |
| Subscriptions | 18 |
| Salons | 7 |
| Users | 6 |
| Reports | 9 |

### HTTP Methods
GET | POST | PUT | PATCH | DELETE

---

# Slide 27: Sample API Flow

## Creating an Appointment

```
POST /api/appointments
Authorization: Bearer <token>

{
  "customer_id": 5,
  "appointment_date": "2025-03-20",
  "start_time": "15:00:00",
  "services": [
    {"service_id": 3, "staff_id": 2, "price": 1500}
  ],
  "packages": [
    {"package_id": 1, "price": 5000}
  ],
  "discount_amount": 200
}

Response:
{
  "status": "success",
  "data": {"appointment_id": 42}
}
```

---

# Slide 28: Business Logic

## 💼 Smart Calculations

### Invoice Calculation Example

```
Services:        ₹2,500
Packages:        ₹5,000
───────────────────────
Subtotal:        ₹7,500

Less Discounts:
  Service:       -₹300
  Package:       -₹500
  Appointment:   -₹200
───────────────────────
Taxable:         ₹6,500

GST (18%):       ₹1,170
───────────────────────
FINAL TOTAL:     ₹7,670
```

---

# Slide 29: Validation Rules

## ✅ Data Integrity

### Email
- Format: user@domain.com
- Required for Admin/Staff
- Optional for Customers

### Phone (Indian)
- 10 digits
- Starts with 6-9
- Regex: `/^[6-9][0-9]{9}$/`

### Password
- Minimum 6 characters
- Bcrypt hashed

### Prices
- Range: ₹0 to ₹10,00,000
- 2 decimal places
- Cannot be negative

### Dates
- Format: YYYY-MM-DD
- Cannot be in past (appointments)

---

# Slide 30: Error Handling

## 🛡️ Graceful Failures

### Standard Error Response
```json
{
  "status": "error",
  "message": "Clear description of what went wrong"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

# Slide 31: Deployment

## 🚀 Go Live Checklist

### Server Requirements
- ✅ PHP 8.0+
- ✅ MySQL 8.0+
- ✅ PDO Extension
- ✅ OpenSSL for JWT

### Configuration
- Database credentials
- JWT secret key
- Upload directory permissions
- Error logging setup

### Security
- Change default passwords
- Update JWT secret
- Enable HTTPS
- Set proper file permissions

---

# Slide 32: Future Roadmap

## 🔮 Coming Soon

### Customer Features
- 💳 Online Payment Gateway
- 📱 SMS/Email Notifications
- ⭐ Loyalty Points System
- 🎁 Gift Vouchers

### Staff Features
- 📲 Mobile App
- 📅 Shift Scheduling
- 📊 Performance Analytics

### Admin Features
- 📈 Advanced Analytics
- 🏢 Multi-Salon Dashboard
- 📄 PDF/Excel Exports
- 🤖 Automated Reporting

### Technical
- ⚡ Redis Caching
- 📨 Email Queues
- 🔔 Real-time Notifications
- 📊 Microservices Architecture

---

# Slide 33: Why SAM?

## 🏆 Key Benefits

### For Business Owners
✅ Multi-location management
✅ Real-time revenue tracking
✅ Automated billing
✅ Staff performance insights

### For Staff
✅ Clear schedule visibility
✅ Incentive tracking
✅ Professional growth
✅ Document management

### For Customers
✅ Easy online booking
✅ Service history tracking
✅ Digital invoices
✅ Feedback system

---

# Slide 34: Summary

## 📌 SAM at a Glance

| Feature | Status |
|---------|--------|
| Total APIs | 115+ |
| Database Tables | 39 |
| User Roles | 4 |
| Frontend Portals | 3 |
| Modules | 15 |
| Security | Enterprise-grade |
| Scalability | Multi-salon ready |

### Built For
- 🏢 Salon Chains
- 💈 Individual Salons
- 💇 Staff Members
- 🛍️ Customers

---

# Slide 35: Thank You

## 🙏 Questions?

### SAM - Salon Management System

**Transforming Salon Operations Through Technology**

---

**Contact:** [Your Contact Information]
**Demo:** [Demo URL]
**Documentation:** [Docs URL]

---

# Appendix: Complete API List

## All 115+ APIs

### Authentication (5)
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me
PUT /api/auth/me

### Customers (11)
POST /api/customers/register
POST /api/customers/create
PATCH /api/customers/update/{id}
PATCH /api/customers/status/{id}
GET /api/customers/list
GET /api/customers/view/{id}
PATCH /api/customers/me
GET /api/customers/me/appointments
GET /api/customers/{id}/appointments
GET /api/customers/me/feedback
GET /api/customers/{id}/feedback

### Services (6)
POST /api/admin/services/upload-image
POST /api/admin/services
PUT /api/admin/services/{id}
PATCH /api/admin/services/{id}/status
GET /api/services
GET /api/services/{id}

### Packages (6)
POST /api/admin/packages/upload-image
POST /api/admin/packages
PUT /api/admin/packages/{id}
PATCH /api/admin/packages/{id}/status
GET /api/packages
GET /api/packages/{id}

### Staff (14)
POST /api/admin/staff
PUT /api/admin/staff/{id}
PATCH /api/admin/staff/{id}/status
GET /api/admin/staff
GET /api/admin/staff/{id}
POST /api/admin/staff/{id}/documents
GET /api/admin/staff/{id}/documents
GET /api/admin/staff/{id}/documents/{docId}
DELETE /api/admin/staff/{id}/documents/{docId}
POST /api/staff/incentives
POST /api/staff/incentives/{id}/payout
POST /api/staff/incentives/batch-payout
GET /api/staff/incentives/unpaid/{staffId}
GET /api/staff/incentives/history/{staffId}

### Stock (11)
POST /api/admin/products
PUT /api/admin/products/{id}
GET /api/admin/products
GET /api/admin/products/{id}
PATCH /api/admin/stock/{id}
GET /api/admin/stock
GET /api/admin/stock/low-stock-alerts
POST /api/admin/stock/transactions
GET /api/admin/stock/transactions
GET /api/admin/stock/transactions/{id}

### Appointments (14)
POST /api/appointments
PUT /api/appointments/{id}
PATCH /api/appointments/{id}/cancel
PATCH /api/appointments/{id}/approve
PATCH /api/appointments/{id}/complete
GET /api/appointments
GET /api/appointments/{id}
POST /api/appointments/{id}/feedback
PUT /api/appointments/{id}/services/{serviceId}
PATCH /api/appointments/{id}/services/{serviceId}
DELETE /api/appointments/{id}/services/{serviceId}
POST /api/appointments/{id}/packages
PUT /api/appointments/{id}/packages/{packageId}
DELETE /api/appointments/{id}/packages/{packageId}
POST /api/appointments/{id}/invoice

### Invoices (7)
POST /api/invoices
PUT /api/invoices/{id}
GET /api/invoices
GET /api/invoices/{id}
GET /api/invoices/appointment/{appointmentId}
POST /api/invoices/customer/{invoiceId}/payments
GET /api/invoices/customer/{invoiceId}/payments

### Subscriptions (18)
POST /api/subscription-plans
PUT /api/subscription-plans/{id}
GET /api/subscription-plans
GET /api/subscription-plans/{id}
PATCH /api/subscription-plans/{id}/status
POST /api/subscriptions
GET /api/subscriptions/current
GET /api/subscriptions
GET /api/subscriptions/{id}
PUT /api/subscriptions/{id}
PATCH /api/subscriptions/{id}/cancel
POST /api/super-admin/salons/{id}/subscriptions
PUT /api/super-admin/subscriptions/{id}
GET /api/super-admin/salons/{id}/subscriptions
GET /api/super-admin/subscriptions/{id}
POST /api/super-admin/subscriptions/{id}/generate-invoice
POST /api/super-admin/subscriptions/{id}/renew
GET /api/super-admin/subscriptions

### Salons (7)
POST /api/admin/upload/logo
POST /api/super-admin/salons
PUT /api/super-admin/salons/{id}
PATCH /api/super-admin/salons/{id}/status
GET /api/super-admin/salons
GET /api/super-admin/salons/{id}
GET /api/salon/info

### Users (6)
GET /api/admin/users
POST /api/admin/salons/{id}/admin
GET /api/admin/salons/{id}/users
GET /api/admin/users/{id}
PUT /api/admin/users/{id}
PATCH /api/admin/users/{id}/status

### Salon Invoices (7)
POST /api/super-admin/invoices/salon
GET /api/super-admin/invoices/salon
GET /api/super-admin/invoices/salon/{id}
POST /api/super-admin/invoices/salon/{id}/payments
GET /api/salon/invoices
GET /api/salon/invoices/{id}
PUT /api/salon/invoices/{id}
GET /api/salon/invoices/subscription/{subscriptionId}

### Reports (9)
GET /api/reports/sales
GET /api/reports/appointments
GET /api/reports/staff-performance
GET /api/reports/services
GET /api/reports/packages
GET /api/reports/customers
GET /api/reports/inventory
GET /api/reports/incentives
GET /api/reports/tax

---

**END OF PRESENTATION**
