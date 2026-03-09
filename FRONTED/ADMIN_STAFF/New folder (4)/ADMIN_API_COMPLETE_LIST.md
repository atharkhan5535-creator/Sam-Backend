# COMPLETE ADMIN API LIST

## ✅ = Integrated | ⏳ = Needs Implementation

---

## 🔐 AUTH MODULE (5 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/auth/login` | POST | ALL | ✅ |
| 2 | `/api/auth/refresh` | POST | ALL | ✅ |
| 3 | `/api/auth/logout` | POST | ALL | ✅ |
| 4 | `/api/auth/me` | GET | ALL | ✅ |
| 5 | `/api/auth/me` | PUT | ALL | ⏳ |

---

## 👥 CUSTOMERS MODULE (11 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/customers/register` | POST | CUSTOMER | ⏳ |
| 2 | `/api/customers/create` | POST | ADMIN, STAFF | ✅ |
| 3 | `/api/customers/update/{id}` | PATCH | ADMIN, STAFF | ✅ |
| 4 | `/api/customers/status/{id}` | PATCH | ADMIN, STAFF | ✅ |
| 5 | `/api/customers/list` | GET | ADMIN, STAFF | ✅ |
| 6 | `/api/customers/view/{id}` | GET | ADMIN, STAFF, CUSTOMER | ✅ |
| 7 | `/api/customers/me` | PATCH | CUSTOMER | ⏳ |
| 8 | `/api/customers/me/appointments` | GET | CUSTOMER | ⏳ |
| 9 | `/api/customers/{id}/appointments` | GET | ADMIN, STAFF, CUSTOMER | ⏳ |
| 10 | `/api/customers/me/feedback` | GET | CUSTOMER | ⏳ |
| 11 | `/api/customers/{id}/feedback` | GET | ADMIN, STAFF, CUSTOMER | ⏳ |

---

## 💇 SERVICES MODULE (5 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/admin/services` | POST | ADMIN | ✅ |
| 2 | `/api/admin/services/{id}` | PUT | ADMIN | ✅ |
| 3 | `/api/admin/services/{id}/status` | PATCH | ADMIN | ✅ |
| 4 | `/api/services` | GET | ALL | ✅ |
| 5 | `/api/services/{id}` | GET | ALL | ✅ |

**Backend Fields:**
- service_id, salon_id, service_name, description, price, duration, image_url, status

---

## 🎁 PACKAGES MODULE (5 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/admin/packages` | POST | ADMIN | ✅ |
| 2 | `/api/admin/packages/{id}` | PUT | ADMIN | ✅ |
| 3 | `/api/admin/packages/{id}/status` | PATCH | ADMIN | ✅ |
| 4 | `/api/packages` | GET | ALL | ✅ |
| 5 | `/api/packages/{id}` | GET | ALL | ✅ |

**Backend Fields:**
- package_id, salon_id, package_name, description, total_price, validity_days, image_url, status
- package_services: service_ids[]

---

## 👨‍💼 STAFF MODULE (10 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/admin/staff` | POST | ADMIN | ✅ |
| 2 | `/api/admin/staff/{id}` | PUT | ADMIN | ✅ |
| 3 | `/api/admin/staff/{id}/status` | PATCH | ADMIN | ✅ |
| 4 | `/api/admin/staff` | GET | ADMIN | ✅ |
| 5 | `/api/admin/staff/{id}` | GET | ADMIN, STAFF | ✅ |
| 6 | `/api/admin/staff/{id}/documents` | POST | ADMIN | ⏳ |
| 7 | `/api/admin/staff/{id}/documents` | GET | ADMIN, STAFF | ⏳ |
| 8 | `/api/admin/staff/{id}/documents/{doc_id}` | GET | ADMIN, STAFF | ⏳ |
| 9 | `/api/admin/staff/{id}/documents/{doc_id}` | DELETE | ADMIN | ⏳ |
| 10 | `/api/staff/incentives` | POST | ADMIN | ✅ |
| 11 | `/api/staff/incentives/{id}/payout` | POST | ADMIN | ✅ |

**Backend Fields (staff_info):**
- staff_id, salon_id, user_id, name, phone, email
- date_of_birth, date_of_joining, specialization, experience_years, salary, status

**Backend Fields (incentives):**
- incentive_id, staff_id, appointment_id
- incentive_type (SERVICE_COMMISSION|BONUS|TARGET_ACHIEVEMENT)
- calculation_type (FIXED|PERCENTAGE)
- percentage_rate, fixed_amount, base_amount, incentive_amount, remarks, status

---

## 📦 STOCK/INVENTORY MODULE (10 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/admin/products` | POST | ADMIN | ✅ |
| 2 | `/api/admin/products/{id}` | PUT | ADMIN | ✅ |
| 3 | `/api/admin/products` | GET | ADMIN, STAFF | ✅ |
| 4 | `/api/admin/products/{id}` | GET | ADMIN, STAFF | ✅ |
| 5 | `/api/admin/stock/{id}` | PATCH | ADMIN | ✅ |
| 6 | `/api/admin/stock` | GET | ADMIN, STAFF | ✅ |
| 7 | `/api/admin/stock/low-stock-alerts` | GET | ADMIN, STAFF | ✅ |
| 8 | `/api/admin/stock/transactions` | POST | ADMIN | ✅ |
| 9 | `/api/admin/stock/transactions` | GET | ADMIN, STAFF | ⏳ |
| 10 | `/api/admin/stock/transactions/{id}` | GET | ADMIN, STAFF | ⏳ |

**Backend Fields (products):**
- product_id, salon_id, product_name, category, supplier
- stock_level, reorder_point, unit_price, unit_type, notes

---

## 📅 APPOINTMENTS MODULE (11 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/appointments` | POST | ALL | ✅ |
| 2 | `/api/appointments/{id}` | PUT | ADMIN, STAFF | ✅ |
| 3 | `/api/appointments/{id}/cancel` | PATCH | ALL | ✅ |
| 4 | `/api/appointments/{id}/approve` | PATCH | ADMIN, STAFF | ✅ |
| 5 | `/api/appointments/{id}/complete` | PATCH | ADMIN, STAFF | ✅ |
| 6 | `/api/appointments` | GET | ALL | ✅ |
| 7 | `/api/appointments/{id}` | GET | ALL | ✅ |
| 8 | `/api/appointments/{id}/feedback` | POST | CUSTOMER | ⏳ |
| 9 | `/api/appointments/{id}/services/{service_id}` | PUT | ADMIN, STAFF | ⏳ |
| 10 | `/api/appointments/{id}/services/{service_id}` | PATCH | ADMIN, STAFF | ⏳ |
| 11 | `/api/appointments/{id}/invoice` | POST | ADMIN, STAFF | ⏳ |

**Backend Fields (appointments):**
- appointment_id, salon_id, customer_id
- appointment_date, start_time, end_time, estimated_duration
- total_amount, discount_amount, final_amount, status
- notes, cancellation_reason

**Backend Fields (appointment_services):**
- service_id, staff_id, service_price, discount_amount, final_price
- start_time, end_time, status

---

## 🧾 INVOICES MODULE (7 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/invoices` | POST | ADMIN, STAFF | ✅ |
| 2 | `/api/invoices/{id}` | PUT | ADMIN, STAFF | ✅ |
| 3 | `/api/invoices` | GET | ADMIN, STAFF | ✅ |
| 4 | `/api/invoices/{id}` | GET | ADMIN, STAFF | ✅ |
| 5 | `/api/invoices/appointment/{appointment_id}` | GET | ADMIN, STAFF | ⏳ |
| 6 | `/api/invoices/customer/{invoice_customer_id}/payments` | POST | ALL | ✅ |
| 7 | `/api/invoices/customer/{invoice_customer_id}/payments` | GET | ALL | ✅ |

**Backend Fields (invoice_customer):**
- invoice_customer_id, appointment_id, salon_id, customer_id
- invoice_number, subtotal_amount, tax_amount, discount_amount, total_amount
- payment_status (UNPAID|PARTIAL|PAID), invoice_date, due_date, notes

---

## 💳 PAYMENTS MODULE (4 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/payments` | POST | ADMIN, STAFF, CUSTOMER | ⏳ |
| 2 | `/api/payments` | GET | ADMIN, STAFF, CUSTOMER | ⏳ |
| 3 | `/api/payments/{id}` | GET | ADMIN, STAFF, CUSTOMER | ⏳ |
| 4 | `/api/invoices/customer/{id}/payments` | POST/GET | ALL | ✅ |

---

## 📊 REPORTS MODULE (9 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/reports/sales` | GET | ADMIN, STAFF | ✅ |
| 2 | `/api/reports/appointments` | GET | ADMIN, STAFF | ✅ |
| 3 | `/api/reports/staff-performance` | GET | ADMIN, STAFF | ✅ |
| 4 | `/api/reports/services` | GET | ADMIN, STAFF | ✅ |
| 5 | `/api/reports/packages` | GET | ADMIN, STAFF | ✅ |
| 6 | `/api/reports/customers` | GET | ADMIN, STAFF | ✅ |
| 7 | `/api/reports/inventory` | GET | ADMIN, STAFF | ✅ |
| 8 | `/api/reports/incentives` | GET | ADMIN, STAFF | ✅ |
| 9 | `/api/reports/tax` | GET | ADMIN, STAFF | ✅ |

---

## 🏢 SALON INVOICES MODULE - ADMIN (4 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/salon/invoices` | GET | ADMIN | ⏳ |
| 2 | `/api/salon/invoices/{invoice_salon_id}` | GET | ADMIN | ⏳ |
| 3 | `/api/salon/invoices/{invoice_salon_id}` | PUT | ADMIN | ⏳ |
| 4 | `/api/salon/invoices/subscription/{subscription_id}` | GET | ADMIN | ⏳ |

---

## 💳 SALON PAYMENTS MODULE - ADMIN (3 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/salon/payments` | POST | ADMIN | ⏳ |
| 2 | `/api/salon/payments` | GET | ADMIN | ⏳ |
| 3 | `/api/salon/payments/{id}` | GET | ADMIN | ⏳ |

---

## 👥 USERS MODULE - ADMIN (5 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/admin/salons/{salon_id}/admin` | POST | SUPER_ADMIN | ⏳ |
| 2 | `/api/admin/salons/{salon_id}/users` | GET | SUPER_ADMIN, ADMIN | ⏳ |
| 3 | `/api/admin/users/{user_id}` | GET | SUPER_ADMIN, ADMIN | ⏳ |
| 4 | `/api/admin/users/{user_id}` | PUT | SUPER_ADMIN, ADMIN | ⏳ |
| 5 | `/api/admin/users/{user_id}/status` | PATCH | SUPER_ADMIN | ⏳ |

---

## 📋 SUBSCRIPTION PLANS MODULE (5 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/subscription-plans` | POST | SUPER_ADMIN | ⏳ |
| 2 | `/api/subscription-plans/{id}` | PUT | SUPER_ADMIN | ⏳ |
| 3 | `/api/subscription-plans` | GET | ALL | ⏳ |
| 4 | `/api/subscription-plans/{id}` | GET | ALL | ⏳ |
| 5 | `/api/subscription-plans/{id}/status` | PATCH | SUPER_ADMIN | ⏳ |

---

## 🔗 SALON SUBSCRIPTIONS MODULE (6 APIs)

| # | API | Method | Access | Status |
|---|-----|--------|--------|--------|
| 1 | `/api/subscriptions` | POST | ADMIN | ⏳ |
| 2 | `/api/subscriptions/{id}` | PUT | ADMIN | ⏳ |
| 3 | `/api/subscriptions/{id}/cancel` | PATCH | ADMIN | ⏳ |
| 4 | `/api/subscriptions/{id}` | GET | ADMIN | ⏳ |
| 5 | `/api/subscriptions/current` | GET | ADMIN | ⏳ |
| 6 | `/api/subscriptions` | GET | ADMIN | ⏳ |

---

## SUMMARY

### ✅ Fully Integrated (ADMIN APIs):
- **AUTH**: 4/5 APIs
- **CUSTOMERS**: 6/11 APIs (core CRUD done)
- **SERVICES**: 5/5 APIs ✅
- **PACKAGES**: 5/5 APIs ✅
- **STAFF**: 7/11 APIs (core + incentives done)
- **STOCK**: 8/10 APIs (core CRUD done)
- **APPOINTMENTS**: 7/11 APIs (core CRUD done)
- **INVOICES**: 5/7 APIs (core done)
- **REPORTS**: 9/9 APIs ✅

### ⏳ Needs Implementation:
- Customer self-service APIs (me/appointments, me/feedback)
- Staff documents upload/management
- Appointment services add/update
- Appointment invoice generation
- Salon invoices/payments (ADMIN view of own salon subscription)
- Users management (SUPER_ADMIN only mostly)
- Subscription plans & salon subscriptions

---

## PRIORITY REMAINING WORK

### High Priority (Core Admin Functions):
1. **Staff Management Page** - UI for staff list, add, edit, view with incentives
2. **Inventory Page** - Full UI with stock management
3. **Payments Page** - Record and view payments
4. **Reports Page** - All 9 report types with filters

### Medium Priority:
1. **Staff Documents** - Upload, view, delete
2. **Appointment Services** - Add/update services in existing appointments
3. **Invoice Generation** - Generate from appointments

### Low Priority (SUPER_ADMIN features):
1. Salon management
2. User management
3. Subscription management
