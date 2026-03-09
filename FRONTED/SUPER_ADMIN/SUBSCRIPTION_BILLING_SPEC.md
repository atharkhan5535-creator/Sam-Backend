# SAM - Subscription Billing System (NO DATABASE CHANGES)

## 📋 Overview

This document outlines the subscription billing system that works **WITHOUT any database changes**. All calculations are done in the frontend JavaScript using existing backend APIs.

---

## 🎯 Subscription Models

### 1. **Flat Rate Plan**
- **Description:** Fixed monthly amount
- **Example:** ₹50,000 per month
- **Billing:** Same amount every month
- **Payment:** Prepaid (paid at start of month)

### 2. **Per Appointment Plan**
- **Description:** Fixed amount per appointment
- **Example:** ₹50 × number of appointments
- **Billing:** Variable based on actual appointments
- **Payment:** Postpaid (billed at month-end)

### 3. **Percentage Plan**
- **Description:** Percentage of total appointment revenue
- **Example:** 5% of monthly revenue
- **Billing:** Variable based on actual revenue
- **Payment:** Postpaid (billed at month-end)

---

## 💳 Billing Configuration

| Setting | Value |
|---------|-------|
| **Billing Date** | 1st of every month |
| **Payment Terms** | 7 days from invoice date |
| **Database Changes** | ❌ NONE REQUIRED |
| **Calculation** | ✅ Frontend JavaScript |

---

## 🗄️ Existing Tables We'll Use

### **1. `salon_subscriptions` Table** (Already exists)
```sql
subscription_id | salon_id | plan_id | start_date | end_date | status
```

### **2. `subscription_plans` Table** (Already exists)
```sql
plan_id | plan_name | duration_days | plan_type | flat_price | per_appointments_price | percentage_per_appointment
```

### **3. `invoice_salon` Table** (Already exists)
```sql
invoice_salon_id | salon_id | subscription_id | invoice_number | amount | tax_amount | total_amount | payment_status | due_date
```

### **4. `payments_salon` Table** (Already exists)
```sql
payment_salon_id | invoice_salon_id | payment_mode | transaction_no | amount | payment_date
```

### **5. `appointments` Table** (Already exists)
```sql
appointment_id | salon_id | customer_id | appointment_date | status | final_amount
```

---

## 🔌 Backend APIs Needed (MINIMAL CHANGES)

### **ONLY 1 NEW API NEEDED:**

#### **Generate Subscription Invoice**
```
POST /super-admin/subscriptions/{subscription_id}/generate-invoice
```

**Request Body:**
```json
{
  "billing_month": "2025-02",
  "invoice_date": "2025-03-01",
  "due_date": "2025-03-08"
}
```

**What Backend Does:**
1. Get subscription details
2. Get plan details
3. **Call frontend calculation logic** (or replicate in backend)
4. Create invoice in `invoice_salon` table
5. Return invoice details

**Response:**
```json
{
  "status": "success",
  "data": {
    "invoice_salon_id": 25,
    "invoice_number": "INV-SUB-1-20250301-0001",
    "subscription_id": 1,
    "salon_id": 1,
    "billing_month": "2025-02",
    "total_amount": 2655.00,
    "payment_status": "UNPAID",
    "due_date": "2025-03-08"
  }
}
```

---

## 🧮 Frontend Calculation Logic (JavaScript)

### **ALL Calculations Done in JavaScript**

```javascript
/**
 * Calculate subscription billing amount
 * @param {Object} subscription - Subscription object
 * @param {Object} plan - Plan object
 * @param {Array} appointments - Array of completed appointments for the month
 * @returns {Object} Calculation breakdown
 */
function calculateSubscriptionBilling(subscription, plan, appointments) {
  const billingMonth = '2025-02'; // Example
  const taxRate = 0.18; // 18% GST
  
  // Filter appointments for billing month
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const aptMonth = aptDate.toISOString().slice(0, 7); // YYYY-MM
    return aptMonth === billingMonth && apt.status === 'COMPLETED';
  });
  
  // Calculate totals
  const totalAppointments = monthAppointments.length;
  const totalRevenue = monthAppointments.reduce((sum, apt) => sum + parseFloat(apt.final_amount || 0), 0);
  
  // Initialize amounts
  let baseAmount = 0;
  let perAppointmentAmount = 0;
  let percentageAmount = 0;
  
  // Calculate based on plan type
  if (plan.plan_type === 'flat') {
    baseAmount = parseFloat(plan.flat_price || 0);
  } 
  else if (plan.plan_type === 'per-appointments') {
    perAppointmentAmount = totalAppointments * parseFloat(plan.per_appointments_price || 0);
  } 
  else if (plan.plan_type === 'Percentage-per-appointments') {
    percentageAmount = totalRevenue * (parseFloat(plan.percentage_per_appointment || 0) / 100);
  }
  
  // Calculate subtotal and tax
  const subtotalAmount = baseAmount + perAppointmentAmount + percentageAmount;
  const taxAmount = subtotalAmount * taxRate;
  const totalAmount = subtotalAmount + taxAmount;
  
  return {
    billing_month: billingMonth,
    billing_period: {
      start_date: billingMonth + '-01',
      end_date: getLastDayOfMonth(billingMonth)
    },
    usage: {
      total_appointments: totalAppointments,
      total_revenue: totalRevenue,
      completed_appointments: totalAppointments,
      cancelled_appointments: 0
    },
    calculation: {
      base_amount: roundTo2(baseAmount),
      per_appointment_amount: roundTo2(perAppointmentAmount),
      percentage_amount: roundTo2(percentageAmount),
      subtotal_amount: roundTo2(subtotalAmount),
      tax_rate: 18,
      tax_amount: roundTo2(taxAmount),
      total_amount: roundTo2(totalAmount)
    },
    plan_details: {
      plan_id: plan.plan_id,
      plan_name: plan.plan_name,
      plan_type: plan.plan_type
    }
  };
}

/**
 * Helper: Get last day of month
 */
function getLastDayOfMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).toISOString().split('T')[0];
}

/**
 * Helper: Round to 2 decimal places
 */
function roundTo2(num) {
  return Math.round(num * 100) / 100;
}
```

---

## 📊 Complete Billing Workflow

### **Step 1: Fetch Data (Frontend)**

```javascript
async function prepareBillingData(subscriptionId, billingMonth) {
  // 1. Get subscription details
  const subResponse = await apiRequest(`/super-admin/subscriptions/${subscriptionId}`);
  const subscription = subResponse.data;
  
  // 2. Get plan details
  const planResponse = await apiRequest(`/subscription-plans/${subscription.plan_id}`);
  const plan = planResponse.data;
  
  // 3. Get appointments for the billing month
  const appointmentsResponse = await apiRequest(
    `/appointments?start_date=${billingMonth}-01&end_date=${getLastDayOfMonth(billingMonth)}&status=COMPLETED`
  );
  const appointments = appointmentsResponse.data.items || [];
  
  // 4. Calculate billing (FRONTEND)
  const billingData = calculateSubscriptionBilling(subscription, plan, appointments);
  
  return { subscription, plan, appointments, billingData };
}
```

### **Step 2: Display Billing Preview (Frontend)**

```javascript
function showBillingPreview(billingData) {
  const html = `
    <div class="billing-preview">
      <h3>Billing Preview - ${billingData.billing_month}</h3>
      
      <div class="usage-section">
        <h4>Usage Details</h4>
        <p>Total Appointments: ${billingData.usage.total_appointments}</p>
        <p>Total Revenue: ₹${billingData.usage.total_revenue.toLocaleString('en-IN')}</p>
      </div>
      
      <div class="calculation-section">
        <h4>Amount Breakdown</h4>
        <table>
          <tr>
            <td>Base Amount:</td>
            <td>₹${billingData.calculation.base_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Per Appointment Amount:</td>
            <td>₹${billingData.calculation.per_appointment_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Percentage Amount:</td>
            <td>₹${billingData.calculation.percentage_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Subtotal:</td>
            <td>₹${billingData.calculation.subtotal_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Tax (18%):</td>
            <td>₹${billingData.calculation.tax_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Amount:</strong></td>
            <td><strong>₹${billingData.calculation.total_amount.toLocaleString('en-IN')}</strong></td>
          </tr>
        </table>
      </div>
      
      <button onclick="generateInvoice()">Generate Invoice</button>
    </div>
  `;
  
  document.getElementById('billingPreviewContainer').innerHTML = html;
}
```

### **Step 3: Generate Invoice (Backend)**

```javascript
async function generateInvoice(subscriptionId, billingData) {
  const invoiceData = {
    billing_month: billingData.billing_month,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: addDays(new Date(), 7).toISOString().split('T')[0],
    
    // Amounts calculated by frontend
    amount: billingData.calculation.subtotal_amount,
    tax_amount: billingData.calculation.tax_amount,
    total_amount: billingData.calculation.total_amount,
    
    // Usage data (store in notes or new columns if available)
    notes: JSON.stringify({
      total_appointments: billingData.usage.total_appointments,
      total_revenue: billingData.usage.total_revenue,
      plan_type: billingData.plan_details.plan_type,
      calculation_breakdown: billingData.calculation
    })
  };
  
  const response = await apiRequest(
    `/super-admin/subscriptions/${subscriptionId}/generate-invoice`,
    {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    }
  );
  
  return response.data;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

---

## 🎨 Frontend Implementation

### **Update `sa-subscription.html`**

Add billing section in the subscription details modal:

```html
<!-- Billing Preview Section -->
<div class="billing-section" id="billingSection" style="display: none;">
  <div class="card">
    <div class="card-header">
      <h3>Subscription Billing</h3>
      <button class="btn btn-primary" onclick="openBillingPreview()">
        <i class="fa-solid fa-calculator"></i> Calculate Billing
      </button>
    </div>
    <div class="card-body">
      <div id="billingPreviewContainer"></div>
    </div>
  </div>
</div>

<!-- Billing History Table -->
<div class="billing-history-section">
  <div class="card">
    <div class="card-header">
      <h3>Billing History</h3>
    </div>
    <div class="card-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Billing Month</th>
            <th>Appointments</th>
            <th>Revenue</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="billingHistoryBody">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### **Update `sa-subscription.js`**

Add billing functions:

```javascript
// =============================================
// BILLING FUNCTIONS
// =============================================

/**
 * Open billing preview modal
 */
async function openBillingPreview(subscriptionId) {
  const billingMonth = document.getElementById('billingMonthSelect').value;
  
  try {
    // Show loading
    showLoading('Calculating billing...');
    
    // Fetch data
    const { subscription, plan, appointments, billingData } = await prepareBillingData(subscriptionId, billingMonth);
    
    // Show preview
    showBillingPreview(billingData);
    
    // Store billing data for later use
    window.currentBillingData = billingData;
    window.currentSubscriptionId = subscriptionId;
    
    closeLoading();
  } catch (error) {
    closeLoading();
    showErrorToast('Failed to calculate billing: ' + error.message);
  }
}

/**
 * Generate invoice from billing preview
 */
async function generateInvoiceFromPreview() {
  if (!window.currentBillingData || !window.currentSubscriptionId) {
    showErrorToast('No billing data available');
    return;
  }
  
  try {
    showLoading('Generating invoice...');
    
    const invoice = await generateInvoice(window.currentSubscriptionId, window.currentBillingData);
    
    closeLoading();
    showSuccess('Invoice generated successfully: ' + invoice.invoice_number);
    
    // Refresh billing history
    fetchBillingHistory(window.currentSubscriptionId);
    
  } catch (error) {
    closeLoading();
    showErrorToast('Failed to generate invoice: ' + error.message);
  }
}

/**
 * Fetch and display billing history
 */
async function fetchBillingHistory(subscriptionId) {
  try {
    const response = await apiRequest(`/super-admin/invoices/salon?subscription_id=${subscriptionId}`);
    const invoices = response.data.items || [];
    
    const tbody = document.getElementById('billingHistoryBody');
    tbody.innerHTML = invoices.map(inv => `
      <tr>
        <td class="invoice-number">${inv.invoice_number}</td>
        <td>${formatDate(inv.billing_month)}</td>
        <td>${inv.total_appointments || '-'}</td>
        <td>₹${(inv.total_revenue || 0).toLocaleString('en-IN')}</td>
        <td><strong>₹${inv.total_amount.toLocaleString('en-IN')}</strong></td>
        <td><span class="status-badge ${inv.payment_status.toLowerCase()}">${inv.payment_status}</span></td>
        <td>${formatDate(inv.due_date)}</td>
        <td>
          <button class="btn-icon" onclick="viewInvoice('${inv.invoice_salon_id}')" title="View">
            <i class="fa-regular fa-eye"></i>
          </button>
          ${inv.payment_status === 'UNPAID' ? `
            <button class="btn-icon" onclick="payInvoice('${inv.invoice_salon_id}')" title="Pay">
              <i class="fa-solid fa-credit-card"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
  }
}

/**
 * View invoice details
 */
async function viewInvoice(invoiceSalonId) {
  try {
    const response = await apiRequest(`/super-admin/invoices/salon/${invoiceSalonId}`);
    const invoice = response.data;
    
    // Parse notes to get usage details
    const usageDetails = invoice.notes ? JSON.parse(invoice.notes) : null;
    
    const html = `
      <div class="invoice-details">
        <h3>Invoice: ${invoice.invoice_number}</h3>
        <p><strong>Status:</strong> ${invoice.payment_status}</p>
        <p><strong>Amount:</strong> ₹${invoice.total_amount.toLocaleString('en-IN')}</p>
        <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
        
        ${usageDetails ? `
          <div class="usage-details">
            <h4>Usage Details</h4>
            <p>Total Appointments: ${usageDetails.total_appointments}</p>
            <p>Total Revenue: ₹${usageDetails.total_revenue.toLocaleString('en-IN')}</p>
            <p>Plan Type: ${usageDetails.plan_type}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    Swal.fire({
      html: html,
      confirmButtonText: 'Close',
      confirmButtonColor: '#6366f1'
    });
    
  } catch (error) {
    showErrorToast('Failed to load invoice: ' + error.message);
  }
}

/**
 * Pay invoice
 */
async function payInvoice(invoiceSalonId) {
  const { value: formValues } = await Swal.fire({
    title: 'Record Payment',
    html: `
      <input id="paymentAmount" class="swal2-input" placeholder="Amount" type="number">
      <select id="paymentMode" class="swal2-select">
        <option value="UPI">UPI</option>
        <option value="CARD">Card</option>
        <option value="BANK">Bank Transfer</option>
        <option value="CASH">Cash</option>
        <option value="CHEQUE">Cheque</option>
      </select>
      <input id="transactionNo" class="swal2-input" placeholder="Transaction No.">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Record Payment',
    confirmButtonColor: '#10b981',
    preConfirm: () => {
      return {
        amount: document.getElementById('paymentAmount').value,
        payment_mode: document.getElementById('paymentMode').value,
        transaction_no: document.getElementById('transactionNo').value,
        payment_date: new Date().toISOString().split('T')[0]
      };
    }
  });
  
  if (formValues) {
    try {
      await apiRequest(`/super-admin/invoices/salon/${invoiceSalonId}/payments`, {
        method: 'POST',
        body: JSON.stringify(formValues)
      });
      
      showSuccess('Payment recorded successfully');
      fetchBillingHistory(window.currentSubscriptionId);
    } catch (error) {
      showErrorToast('Failed to record payment: ' + error.message);
    }
  }
}
```

---

## 🚀 Implementation Steps

### **Backend (Minimal Changes):**

1. **Add 1 New API Endpoint:**
```php
// POST /super-admin/subscriptions/{subscription_id}/generate-invoice
public function generateInvoice($subscriptionId) {
  // Get request data
  $data = json_decode(file_get_contents('php://input'), true);
  
  // Validate
  if (!isset($data['billing_month']) || !isset($data['total_amount'])) {
    return json_error('Missing required fields');
  }
  
  // Generate invoice number
  $invoiceNumber = $this->generateInvoiceNumber($data['salon_id'], 'SUB');
  
  // Insert into invoice_salon table (already exists)
  $sql = "INSERT INTO invoice_salon 
          (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount, 
           payment_status, due_date, invoice_date, notes) 
          VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?, ?)";
  
  $stmt = $this->db->prepare($sql);
  $stmt->bind_param(
    "iisddiss",
    $data['salon_id'],
    $subscriptionId,
    $invoiceNumber,
    $data['amount'],
    $data['tax_amount'],
    $data['total_amount'],
    $data['due_date'],
    $data['invoice_date'],
    json_encode($data['usage_details'])
  );
  
  if ($stmt->execute()) {
    $invoiceSalonId = $this->db->insert_id;
    return json_success([
      'invoice_salon_id' => $invoiceSalonId,
      'invoice_number' => $invoiceNumber,
      'total_amount' => $data['total_amount']
    ]);
  }
  
  return json_error('Failed to create invoice');
}
```

### **Frontend:**

1. Add billing preview UI to `sa-subscription.html`
2. Add calculation functions to `sa-subscription.js`
3. Add billing history table
4. Add payment recording functionality

---

## 📝 Summary

### **Database Changes:** ❌ NONE

### **Backend API Changes:** ✅ 1 New Endpoint
```
POST /super-admin/subscriptions/{subscription_id}/generate-invoice
```

### **Frontend Changes:** ✅ JavaScript Calculations
- Calculate billing amounts
- Display billing preview
- Generate invoices
- Track billing history
- Record payments

### **Existing APIs Used:**
```
GET  /super-admin/subscriptions/{id}
GET  /subscription-plans/{id}
GET  /appointments?start_date=&end_date=&status=COMPLETED
POST /super-admin/invoices/salon/{id}/payments
GET  /super-admin/invoices/salon/{id}
GET  /super-admin/invoices/salon
```

---

## 💡 Key Points

1. **ALL calculations in JavaScript** - No backend logic needed
2. **NO database changes** - Uses existing tables
3. **ONLY 1 new API** - To save invoice to database
4. **Frontend controls everything** - Calculation, preview, validation
5. **Backend just stores** - Receives calculated data, saves to DB

---

**Version:** 2.0 (NO DATABASE CHANGES)  
**Last Updated:** 2025-03-07  
**Status:** Ready for Implementation
