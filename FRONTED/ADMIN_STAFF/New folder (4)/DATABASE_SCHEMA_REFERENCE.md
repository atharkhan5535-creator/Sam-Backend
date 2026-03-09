# DATABASE SCHEMA - EXACT FIELD NAMES

## ✅ = Field exists in database | ❌ = NOT in database (REMOVE FROM FRONTEND)

---

## 1. customers TABLE
```sql
customer_id (PK, AUTO_INCREMENT)
salon_id (FK)
name
phone
email
gender (MALE|FEMALE|OTHER)
date_of_birth
anniversary_date (NULLABLE)
address (NULLABLE)
preferences (NULLABLE)
total_visits (DEFAULT 0)
last_visit_date (NULLABLE)
status (ACTIVE|INACTIVE)
customer_since (DATE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ name
- ✅ phone
- ✅ email
- ✅ gender
- ✅ date_of_birth
- ✅ anniversary_date
- ✅ address
- ✅ preferences
- ✅ status

---

## 2. services TABLE
```sql
service_id (PK, AUTO_INCREMENT)
salon_id (FK)
service_name
description
price
duration (in minutes)
image_url (NULLABLE)
status (ACTIVE|INACTIVE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ service_name (NOT "name")
- ✅ description
- ✅ price
- ✅ duration
- ✅ image_url
- ✅ status

---

## 3. packages TABLE
```sql
package_id (PK, AUTO_INCREMENT)
salon_id (FK)
package_name
description
total_price
validity_days
image_url (NULLABLE)
status (ACTIVE|INACTIVE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ package_name (NOT "name")
- ✅ description
- ✅ total_price (NOT "price")
- ✅ validity_days
- ✅ image_url
- ✅ status

**package_services TABLE (mapping):**
- package_id (FK)
- service_id (FK)
- salon_id (FK)

---

## 4. users TABLE (ADMIN/STAFF authentication)
```sql
user_id (PK, AUTO_INCREMENT)
salon_id (FK)
username
role (ADMIN|STAFF)
email
password_hash
status (ACTIVE|INACTIVE)
last_login (NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ username (NOT "name" for login)
- ✅ role
- ✅ email
- ✅ status
- ✅ last_login

---

## 5. staff_info TABLE
```sql
staff_id (PK, AUTO_INCREMENT)
salon_id (FK)
user_id (FK to users.user_id)
name
phone
email
date_of_birth
date_of_joining
specialization
experience_years
salary
status (ACTIVE|INACTIVE|ON_LEAVE|TERMINATED)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ name
- ✅ phone
- ✅ email
- ✅ date_of_birth
- ✅ date_of_joining (NOT "joining_date")
- ✅ specialization
- ✅ experience_years
- ✅ salary
- ✅ status

---

## 6. staff_documents TABLE
```sql
document_id (PK, AUTO_INCREMENT)
staff_id (FK)
salon_id (FK)
document_type (CERTIFICATION|ID|CONTRACT|OTHER)
document_url
file_name
uploaded_at
verified (BOOLEAN)
verified_by (NULLABLE)
verified_at (NULLABLE)
```

**Frontend Fields to USE:**
- ✅ document_type
- ✅ document_url
- ✅ file_name
- ✅ verified

---

## 7. appointments TABLE
```sql
appointment_id (PK, AUTO_INCREMENT)
salon_id (FK)
customer_id (FK)
appointment_date
start_time
end_time
estimated_duration (minutes)
total_amount
discount_amount
final_amount
status (PENDING|CONFIRMED|COMPLETED|CANCELLED)
cancellation_reason (NULLABLE)
notes (NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ appointment_date (NOT "date")
- ✅ start_time (NOT "time")
- ✅ end_time
- ✅ estimated_duration
- ✅ total_amount
- ✅ discount_amount
- ✅ final_amount
- ✅ status
- ✅ cancellation_reason
- ✅ notes

---

## 8. appointment_services TABLE
```sql
appointment_service_id (PK, AUTO_INCREMENT)
appointment_id (FK)
service_id (FK)
staff_id (FK - NULLABLE)
service_price
discount_amount
final_price
start_time (NULLABLE)
end_time (NULLABLE)
status (PENDING|COMPLETED|CANCELLED)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ service_id
- ✅ staff_id
- ✅ service_price (NOT "price")
- ✅ discount_amount
- ✅ final_price
- ✅ start_time
- ✅ end_time
- ✅ status

---

## 9. appointment_packages TABLE
```sql
appointment_package_id (PK, AUTO_INCREMENT)
appointment_id (FK)
package_id (FK)
staff_id (FK - NULLABLE)
package_price
discount_amount
final_price
status (PENDING|COMPLETED|CANCELLED)
created_at
updated_at
```

---

## 10. invoice_customer TABLE
```sql
invoice_customer_id (PK, AUTO_INCREMENT)
appointment_id (FK - NULLABLE)
salon_id (FK)
customer_id (FK)
invoice_number
subtotal_amount
tax_amount
discount_amount
total_amount
payment_status (UNPAID|PARTIAL|PAID)
invoice_date
due_date
notes (NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ invoice_number
- ✅ subtotal_amount
- ✅ tax_amount
- ✅ discount_amount
- ✅ total_amount
- ✅ payment_status
- ✅ invoice_date
- ✅ due_date
- ✅ notes

---

## 11. customer_payments TABLE
```sql
customer_payment_id (PK, AUTO_INCREMENT)
invoice_customer_id (FK)
payment_mode (CASH|UPI|CARD|BANK|NET_BANKING)
transaction_no (NULLABLE)
amount
payment_date
status (SUCCESS|FAILED|PENDING)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ payment_mode
- ✅ transaction_no (NOT "transaction_reference")
- ✅ amount
- ✅ payment_date (NOT "date")
- ✅ status

---

## 12. products TABLE
```sql
product_id (PK, AUTO_INCREMENT)
salon_id (FK)
product_name
brand
category
description
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ product_name (NOT "name")
- ✅ brand
- ✅ category
- ✅ description

---

## 13. stock TABLE
```sql
stock_id (PK, AUTO_INCREMENT)
product_id (FK)
salon_id (FK)
current_quantity
minimum_quantity
maximum_quantity
last_restocked (DATE - NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ current_quantity (NOT "stock_level")
- ✅ minimum_quantity (NOT "reorder_point")
- ✅ maximum_quantity
- ✅ last_restocked

---

## 14. stock_transactions TABLE
```sql
transaction_id (PK, AUTO_INCREMENT)
stock_id (FK)
user_id (FK)
transaction_type (IN|OUT|ADJUSTMENT)
quantity
unit_price
total_amount
notes (NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ transaction_type
- ✅ quantity
- ✅ unit_price
- ✅ total_amount
- ✅ notes

---

## 15. incentives TABLE
```sql
incentive_id (PK, AUTO_INCREMENT)
staff_id (FK)
appointment_id (FK - NULLABLE)
incentive_type (SERVICE_COMMISSION|BONUS|TARGET_ACHIEVEMENT)
calculation_type (FIXED|PERCENTAGE)
percentage_rate (NULLABLE)
fixed_amount (NULLABLE)
base_amount (NULLABLE)
incentive_amount
remarks (NULLABLE)
status (PENDING|PAID)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ incentive_type
- ✅ calculation_type
- ✅ percentage_rate
- ✅ fixed_amount
- ✅ base_amount
- ✅ incentive_amount
- ✅ remarks
- ✅ status

---

## 16. incentive_payouts TABLE
```sql
payout_id (PK, AUTO_INCREMENT)
incentive_id (FK)
staff_id (FK)
payout_amount
payout_date
payment_mode (CASH|UPI|BANK|CHEQUE)
transaction_reference (NULLABLE)
remarks (NULLABLE)
created_at
updated_at
```

**Frontend Fields to USE:**
- ✅ payout_amount
- ✅ payout_date (NOT "date")
- ✅ payment_mode
- ✅ transaction_reference
- ✅ remarks

---

## 17. salon_subscriptions TABLE
```sql
subscription_id (PK, AUTO_INCREMENT)
salon_id (FK)
plan_id (FK)
start_date
end_date
status (ACTIVE|INACTIVE|EXPIRED|CANCELLED)
created_at
updated_at
```

---

## 18. invoice_salon TABLE
```sql
invoice_salon_id (PK, AUTO_INCREMENT)
salon_id (FK)
subscription_id (FK)
invoice_number
amount
tax_amount
total_amount
payment_status (UNPAID|PARTIAL|PAID)
invoice_date
due_date
created_at
updated_at
```

---

## 19. payments_salon TABLE
```sql
payment_id (PK, AUTO_INCREMENT)
invoice_salon_id (FK)
payment_mode (CASH|UPI|CARD|BANK|NET_BANKING)
transaction_no
amount
payment_date
created_at
```

---

## 20. appointment_feedback TABLE
```sql
feedback_id (PK, AUTO_INCREMENT)
appointment_id (FK)
customer_id (FK)
rating (1-5)
comment (NULLABLE)
is_anonymous (BOOLEAN - DEFAULT 0)
created_at
updated_at
```

---

## 21. subscription_plans TABLE
```sql
plan_id (PK, AUTO_INCREMENT)
plan_name
description
price
duration_days
features (TEXT - JSON or comma-separated)
status (ACTIVE|INACTIVE)
created_at
updated_at
```

---

## CRITICAL FIELD NAME CHANGES NEEDED:

### Services:
- ❌ `name` → ✅ `service_name`
- ❌ `category` → NOT IN DATABASE (remove from form)

### Packages:
- ❌ `name` → ✅ `package_name`
- ❌ `price` → ✅ `total_price`
- ❌ `discount_percentage` → NOT IN DATABASE (calculate from services)
- ❌ `bonus_features` → NOT IN DATABASE

### Appointments:
- ❌ `date` → ✅ `appointment_date`
- ❌ `time` → ✅ `start_time`
- ❌ `amount` → ✅ `final_amount`
- ❌ `customer_name` → JOIN with customers table
- ❌ `customer_phone` → JOIN with customers table

### Customers:
- ❌ `totalSpent` → NOT IN DATABASE (calculate from invoices)
- ❌ `lastVisit` → ✅ `last_visit_date`

### Staff:
- ❌ `role` → In users table, not staff_info
- ❌ `joining_date` → ✅ `date_of_joining`
- ❌ `exp` → ✅ `experience_years`
- ❌ `avail` → ✅ `status` (ACTIVE|INACTIVE|ON_LEAVE)
- ❌ `empType` → NOT IN DATABASE

### Inventory/Products:
- ❌ `stock` → ✅ `current_quantity`
- ❌ `reorder` → ✅ `minimum_quantity`
- ❌ `unit` → NOT IN DATABASE
- ❌ `unit_price` → NOT IN products (only in stock_transactions)

### Payments:
- ❌ `method` → ✅ `payment_mode`
- ❌ `transactionNo` → ✅ `transaction_no`

---

## STATUS VALUES (EXACT):

### appointments.status:
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED

### customers.status:
- ACTIVE
- INACTIVE

### staff_info.status:
- ACTIVE
- INACTIVE
- ON_LEAVE
- TERMINATED

### services.status / packages.status / products.status:
- ACTIVE
- INACTIVE

### invoice_customer.payment_status:
- UNPAID
- PARTIAL
- PAID

### customer_payments.status:
- SUCCESS
- FAILED
- PENDING

### incentives.status:
- PENDING
- PAID

### incentives.incentive_type:
- SERVICE_COMMISSION
- BONUS
- TARGET_ACHIEVEMENT

### incentives.calculation_type:
- FIXED
- PERCENTAGE

### payment_mode (all payment tables):
- CASH
- UPI
- CARD
- BANK
- NET_BANKING

### stock_transactions.transaction_type:
- IN
- OUT
- ADJUSTMENT

---

## GENDER VALUES:
- MALE
- FEMALE
- OTHER

(All uppercase in database)
