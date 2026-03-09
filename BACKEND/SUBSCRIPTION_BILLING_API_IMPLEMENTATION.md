# Subscription Billing API Implementation

## Overview

Implemented **1 new API endpoint** for the subscription billing system as per the "NO DATABASE CHANGES" design document. All calculations are performed in the frontend JavaScript, and the backend simply stores the pre-calculated invoice data.

---

## New API Endpoint

### **POST /api/super-admin/subscriptions/{subscription_id}/generate-invoice**

**Access:** SUPER_ADMIN only

**Purpose:** Generates invoice for salon subscription billing

**Endpoint:** `http://localhost/Sam-Backend/BACKEND/public/index.php/api/super-admin/subscriptions/{subscription_id}/generate-invoice`

---

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "billing_month": "2025-02",
  "invoice_date": "2025-03-01",
  "due_date": "2025-03-08",
  "amount": 2254.24,
  "tax_amount": 405.76,
  "total_amount": 2660.00,
  "total_appointments": 45,
  "total_revenue": 45080.00,
  "calculation_breakdown": {
    "base_amount": 0,
    "per_appointment_amount": 2254.24,
    "percentage_amount": 0,
    "subtotal_amount": 2254.24,
    "tax_rate": 18
  }
}
```

### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `billing_month` | String | Yes | - | Billing period in YYYY-MM format |
| `invoice_date` | String | No | Today | Invoice date in YYYY-MM-DD format |
| `due_date` | String | No | +7 days | Payment due date in YYYY-MM-DD format |
| `amount` | Decimal | No | 0 | Subtotal amount (before tax) |
| `tax_amount` | Decimal | No | 0 | Tax amount (18% GST) |
| `total_amount` | Decimal | Yes | - | Total amount (amount + tax) |
| `total_appointments` | Integer | No | 0 | Number of appointments in billing month |
| `total_revenue` | Decimal | No | 0 | Total revenue from appointments |
| `calculation_breakdown` | Object | No | {} | Detailed calculation breakdown |

---

## Response Format

### Success Response (201 Created)
```json
{
  "status": "success",
  "data": {
    "invoice_salon_id": 25,
    "invoice_number": "INV-SUB-1-20250301-0001",
    "subscription_id": 1,
    "salon_id": 1,
    "billing_month": "2025-02",
    "amount": 2254.24,
    "tax_amount": 405.76,
    "total_amount": 2660.00,
    "payment_status": "UNPAID",
    "due_date": "2025-03-08"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "error",
  "message": "Missing required fields: billing_month, total_amount"
}
```

### Error Response (404 Not Found)
```json
{
  "status": "error",
  "message": "Subscription not found"
}
```

### Error Response (409 Conflict)
```json
{
  "status": "error",
  "message": "Invoice already exists for this subscription and billing month",
  "data": {
    "invoice_salon_id": 25
  }
}
```

---

## Validation Rules

1. **billing_month**: Required, must match format YYYY-MM
2. **total_amount**: Required, must be > 0
3. **amount**: Optional, defaults to 0 (for percentage-only plans)
4. **tax_amount**: Optional, defaults to 0
5. **invoice_date**: Optional, defaults to today (YYYY-MM-DD)
6. **due_date**: Optional, defaults to +7 days (YYYY-MM-DD)
7. **total_appointments**: Optional, stored in `notes` column as JSON
8. **total_revenue**: Optional, stored in `notes` column as JSON
9. **calculation_breakdown**: Optional, stored in `notes` column as JSON

---

## Database Operations

### Tables Used
- `invoice_salon` - Stores the generated invoice
- `salon_subscriptions` - Verifies subscription exists
- `subscription_plans` - Retrieves plan details
- `salons` - Retrieves salon details

### Data Storage

**invoice_salon table:**
```sql
INSERT INTO invoice_salon (
  salon_id, subscription_id, invoice_number, amount, tax_amount, 
  total_amount, payment_status, invoice_date, due_date, notes
) VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?, ?)
```

**notes column (JSON):**
```json
{
  "billing_month": "2025-02",
  "total_appointments": 45,
  "total_revenue": 45080.00,
  "plan_type": "per-appointments",
  "calculation_breakdown": {
    "base_amount": 0,
    "per_appointment_amount": 2254.24,
    "percentage_amount": 0,
    "subtotal_amount": 2254.24,
    "tax_rate": 18
  }
}
```

---

## Files Modified

### Backend Files

1. **`modules/subscriptions/SubscriptionController.php`**
   - Added `generateInvoice($subscriptionId)` method
   - Lines added: ~160 lines (validation + database operations)

2. **`modules/subscriptions/routes.php`**
   - Added route: `POST /api/super-admin/subscriptions/{subscription_id}/generate-invoice`
   - Authorization: SUPER_ADMIN only

### Documentation Files

3. **`API_DOCUMENTATION.txt`**
   - Added endpoint to SALON SUBSCRIPTIONS MODULE (SUPER_ADMIN) section
   - Added detailed API documentation with request/response examples
   - Added validation rules section

4. **`SAM_Backend_API_Collection.postman_collection.json`**
   - Added new request: "Generate Subscription Invoice"
   - Included sample request body with all fields
   - Added test scripts for validation

---

## Frontend Integration Example

### JavaScript Calculation + API Call

```javascript
// 1. Calculate billing amount (frontend)
function calculateSubscriptionBilling(subscription, plan, appointments) {
  const billingMonth = '2025-02';
  const taxRate = 0.18; // 18% GST
  
  // Filter appointments for billing month
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const aptMonth = aptDate.toISOString().slice(0, 7);
    return aptMonth === billingMonth && apt.status === 'COMPLETED';
  });
  
  const totalAppointments = monthAppointments.length;
  const totalRevenue = monthAppointments.reduce((sum, apt) => 
    sum + parseFloat(apt.final_amount || 0), 0
  );
  
  let baseAmount = 0;
  let perAppointmentAmount = 0;
  let percentageAmount = 0;
  
  // Calculate based on plan type
  if (plan.plan_type === 'flat') {
    baseAmount = parseFloat(plan.flat_price || 0);
  } else if (plan.plan_type === 'per-appointments') {
    perAppointmentAmount = totalAppointments * parseFloat(plan.per_appointments_price || 0);
  } else if (plan.plan_type === 'Percentage-per-appointments') {
    percentageAmount = totalRevenue * (parseFloat(plan.percentage_per_appointment || 0) / 100);
  }
  
  const subtotalAmount = baseAmount + perAppointmentAmount + percentageAmount;
  const taxAmount = subtotalAmount * taxRate;
  const totalAmount = subtotalAmount + taxAmount;
  
  return {
    billing_month: billingMonth,
    total_appointments: totalAppointments,
    total_revenue: totalRevenue,
    amount: subtotalAmount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    calculation_breakdown: {
      base_amount: baseAmount,
      per_appointment_amount: perAppointmentAmount,
      percentage_amount: percentageAmount,
      subtotal_amount: subtotalAmount,
      tax_rate: 18
    }
  };
}

// 2. Generate invoice (call backend API)
async function generateInvoice(subscriptionId, billingData) {
  const response = await fetch(
    `http://localhost/Sam-Backend/BACKEND/public/index.php/api/super-admin/subscriptions/${subscriptionId}/generate-invoice`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        billing_month: billingData.billing_month,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: addDays(new Date(), 7).toISOString().split('T')[0],
        amount: billingData.amount,
        tax_amount: billingData.tax_amount,
        total_amount: billingData.total_amount,
        total_appointments: billingData.total_appointments,
        total_revenue: billingData.total_revenue,
        calculation_breakdown: billingData.calculation_breakdown
      })
    }
  );
  
  return await response.json();
}
```

---

## Testing with Postman

### 1. Import Collection
Import the updated `SAM_Backend_API_Collection.postman_collection.json` into Postman.

### 2. Navigate to Collection
Go to: **🔗 SUPER_ADMIN - SUBSCRIPTIONS** → **Generate Subscription Invoice**

### 3. Set Variables
- `base_url`: `http://localhost/Sam-Backend/BACKEND/public/index.php/api`
- `access_token`: Login as SUPER_ADMIN to get token

### 4. Send Request
```
POST {{base_url}}/super-admin/subscriptions/1/generate-invoice
```

### 5. Expected Response
```json
{
  "status": "success",
  "data": {
    "invoice_salon_id": 25,
    "invoice_number": "INV-SUB-1-20250301-0001",
    "subscription_id": 1,
    "salon_id": 1,
    "billing_month": "2025-02",
    "amount": 2254.24,
    "tax_amount": 405.76,
    "total_amount": 2660.00,
    "payment_status": "UNPAID",
    "due_date": "2025-03-08"
  }
}
```

---

## Business Logic Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend fetches subscription + plan details            │
│    GET /api/super-admin/subscriptions/{id}                 │
│    GET /api/subscription-plans/{id}                        │
├─────────────────────────────────────────────────────────────┤
│ 2. Frontend fetches completed appointments for month       │
│    GET /api/appointments?status=COMPLETED&start_date=...   │
├─────────────────────────────────────────────────────────────┤
│ 3. Frontend calculates billing amount (JavaScript)         │
│    - Counts appointments                                   │
│    - Sums revenue                                          │
│    - Applies plan formula (flat/per-appointment/percentage)│
│    - Adds 18% GST                                          │
├─────────────────────────────────────────────────────────────┤
│ 4. Display billing preview to user                         │
├─────────────────────────────────────────────────────────────┤
│ 5. User clicks "Generate Invoice"                          │
├─────────────────────────────────────────────────────────────┤
│ 6. Frontend sends calculated data to backend               │
│    POST /api/super-admin/subscriptions/{id}/generate-invoice│
├─────────────────────────────────────────────────────────────┤
│ 7. Backend validates data                                  │
│    - Checks subscription exists                            │
│    - Validates billing_month format                        │
│    - Validates amounts                                     │
│    - Checks no duplicate invoice exists                    │
├─────────────────────────────────────────────────────────────┤
│ 8. Backend creates invoice in database                     │
│    INSERT INTO invoice_salon (...)                         │
├─────────────────────────────────────────────────────────────┤
│ 9. Backend returns invoice details                         │
├─────────────────────────────────────────────────────────────┤
│ 10. Frontend displays success + invoice number             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **No Database Changes**: Uses existing `invoice_salon` table, `notes` column for JSON data
2. **Frontend Calculations**: All billing logic in JavaScript (3 plan types supported)
3. **Duplicate Prevention**: Returns 409 if invoice already exists for same subscription + billing month
4. **Flexible Amounts**: Supports all 3 plan types (flat, per-appointment, percentage)
5. **Usage Tracking**: Stores appointment count and revenue in `notes` for reference
6. **Default Dates**: Auto-generates invoice_date (today) and due_date (+7 days) if not provided

---

## Next Steps

### Frontend Implementation
1. Add billing preview UI to `sa-subscription.html`
2. Add calculation functions to `sa-subscription.js`
3. Add billing history table
4. Add payment recording functionality

### Testing
1. Test with all 3 plan types:
   - Flat rate plan (₹50,000/month)
   - Per appointment plan (₹50 × appointments)
   - Percentage plan (5% of revenue)
2. Test duplicate invoice prevention
3. Test validation errors
4. Test with real appointment data

---

## Implementation Date
**2025-03-07**

## API Count
- **Total APIs in SAM Backend**: 116 (was 115, now +1 new)
- **New APIs Added**: 1
- **Database Changes**: 0

---

## Status
✅ **COMPLETE** - Ready for frontend integration and testing
