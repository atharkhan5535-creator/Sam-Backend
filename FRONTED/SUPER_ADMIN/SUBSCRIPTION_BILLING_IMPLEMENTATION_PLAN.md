# SUBSCRIPTION BILLING FRONTEND IMPLEMENTATION PLAN

## 📋 DETAILED TODO LIST

**If AI crashes, give this list to another AI to continue:**

---

## PHASE 1: CORE BILLING CALCULATION LOGIC

### ✅ Task 1.1: Helper Functions
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** Add after existing API functions (around line 450)

**Functions to Add:**
1. `getLastDayOfMonth(monthStr)` - Returns last day of month (YYYY-MM-DD)
2. `roundTo2(num)` - Rounds to 2 decimal places
3. `addDays(date, days)` - Adds days to date
4. `calculateSubscriptionBilling(subscription, plan, appointments, billingMonth)` - Main calculation function

**Logic:**
```javascript
function calculateSubscriptionBilling(subscription, plan, appointments, billingMonth) {
  const taxRate = 0.18; // 18% GST
  
  // Filter appointments for billing month (COMPLETED only)
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const aptMonth = aptDate.toISOString().slice(0, 7); // YYYY-MM
    return aptMonth === billingMonth && apt.status === 'COMPLETED';
  });
  
  const totalAppointments = monthAppointments.length;
  const totalRevenue = monthAppointments.reduce((sum, apt) => 
    sum + parseFloat(apt.final_amount || 0), 0
  );
  
  let baseAmount = 0;
  let perAppointmentAmount = 0;
  let percentageAmount = 0;
  
  // Calculate based on plan_type
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
```

---

### ✅ Task 1.2: Data Preparation Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After helper functions

**Function:** `prepareBillingData(subscriptionId, billingMonth)`

**Logic:**
1. Fetch subscription details: `GET /super-admin/subscriptions/{subscriptionId}`
2. Fetch plan details: `GET /subscription-plans/{planId}`
3. Fetch appointments: `GET /appointments?start_date={month}-01&end_date={lastDay}&status=COMPLETED`
4. Call `calculateSubscriptionBilling()` with fetched data
5. Return object: `{ subscription, plan, appointments, billingData }`

**Error Handling:**
- Try-catch blocks
- Show error toast if any API fails
- Return null on failure

---

## PHASE 2: HTML STRUCTURE CHANGES

### ✅ Task 2.1: Add Billing Section to sa-subscription.html
**File:** `SUPER_ADMIN/html/super-admin/sa-subscription.html`
**Location:** After subscriptions table (around line 1650)

**Add:**
```html
<!-- Billing Preview Modal -->
<div class="modal-overlay" id="billingPreviewModal">
  <div class="modal modal-xl">
    <div class="modal-header">
      <h3 class="modal-title">Subscription Billing Preview</h3>
      <button class="modal-close" onclick="closeBillingPreview()">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Content populated by JavaScript -->
      <div id="billingPreviewContent"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeBillingPreview()">Cancel</button>
      <button class="btn btn-primary" onclick="generateInvoiceFromPreview()">
        <i class="fa-solid fa-file-invoice"></i> Generate Invoice
      </button>
    </div>
  </div>
</div>

<!-- Billing History Section -->
<div class="section-card">
  <div class="section-header">
    <h3 class="section-title">
      <i class="fa-solid fa-clock-rotate-left"></i>
      Billing History
    </h3>
  </div>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Billing Month</th>
          <th>Appointments</th>
          <th>Revenue</th>
          <th>Base Amount</th>
          <th>Tax (18%)</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="billingHistoryBody">
        <!-- Populated by JavaScript -->
      </tbody>
    </table>
  </div>
</div>
```

---

### ✅ Task 2.2: Add Billing Month Selector
**File:** `SUPER_ADMIN/html/super-admin/sa-subscription.html`
**Location:** In section-actions of subscriptions table (around line 1580)

**Add:**
```html
<div class="section-actions">
  <div class="billing-month-selector">
    <label for="billingMonthSelect">Billing Month:</label>
    <select id="billingMonthSelect" class="form-select" style="width: 180px;">
      <!-- Populated by JavaScript -->
    </select>
  </div>
</div>
```

---

## PHASE 3: JAVASCRIPT IMPLEMENTATION

### ✅ Task 3.1: Open Billing Preview Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After existing modal functions

**Function:** `openBillingPreview(subscriptionId)`

**Logic:**
1. Get billing month from `#billingMonthSelect`
2. Show loading spinner
3. Call `prepareBillingData(subscriptionId, billingMonth)`
4. Store result in `window.currentBillingData` and `window.currentSubscriptionId`
5. Render billing preview HTML
6. Show modal `#billingPreviewModal`
7. Hide loading spinner

**Preview HTML Structure:**
```javascript
const html = `
  <div class="billing-preview">
    <div class="billing-summary">
      <h4>Billing Summary - ${billingData.billing_month}</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <label>Plan:</label>
          <span>${billingData.plan_details.plan_name}</span>
        </div>
        <div class="summary-item">
          <label>Plan Type:</label>
          <span>${billingData.plan_details.plan_type}</span>
        </div>
        <div class="summary-item">
          <label>Billing Period:</label>
          <span>${billingData.billing_period.start_date} to ${billingData.billing_period.end_date}</span>
        </div>
      </div>
    </div>

    <div class="usage-section">
      <h4>Usage Details</h4>
      <div class="usage-grid">
        <div class="usage-card">
          <i class="fa-solid fa-calendar-check"></i>
          <div class="usage-value">${billingData.usage.total_appointments}</div>
          <div class="usage-label">Completed Appointments</div>
        </div>
        <div class="usage-card">
          <i class="fa-solid fa-indian-rupee-sign"></i>
          <div class="usage-value">₹${billingData.usage.total_revenue.toLocaleString('en-IN')}</div>
          <div class="usage-label">Total Revenue</div>
        </div>
      </div>
    </div>

    <div class="calculation-section">
      <h4>Amount Breakdown</h4>
      <table class="calculation-table">
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
        <tr class="subtotal-row">
          <td>Subtotal:</td>
          <td>₹${billingData.calculation.subtotal_amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Tax (18% GST):</td>
          <td>₹${billingData.calculation.tax_amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total Amount:</strong></td>
          <td><strong>₹${billingData.calculation.total_amount.toLocaleString('en-IN')}</strong></td>
        </tr>
      </table>
    </div>
  </div>
`;
```

---

### ✅ Task 3.2: Generate Invoice Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After openBillingPreview

**Function:** `generateInvoiceFromPreview()`

**Logic:**
1. Check if `window.currentBillingData` and `window.currentSubscriptionId` exist
2. Show loading spinner
3. Prepare invoice data object:
```javascript
{
  billing_month: billingData.billing_month,
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: addDays(new Date(), 7).toISOString().split('T')[0],
  amount: billingData.calculation.subtotal_amount,
  tax_amount: billingData.calculation.tax_amount,
  total_amount: billingData.calculation.total_amount,
  total_appointments: billingData.usage.total_appointments,
  total_revenue: billingData.usage.total_revenue,
  calculation_breakdown: billingData.calculation
}
```
4. Call API: `POST /super-admin/subscriptions/{subscriptionId}/generate-invoice`
5. Handle response:
   - Success (201): Show success toast, close modal, refresh billing history
   - Conflict (409): Show error "Invoice already exists for this month"
   - Error: Show error toast
6. Hide loading spinner

---

### ✅ Task 3.3: Fetch Billing History
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After generateInvoiceFromPreview

**Function:** `fetchBillingHistory(subscriptionId)`

**Logic:**
1. Call API: `GET /super-admin/invoices/salon?subscription_id={subscriptionId}`
2. Parse response to get invoices array
3. Render table rows:
```javascript
tbody.innerHTML = invoices.map(inv => {
  const notes = inv.notes ? JSON.parse(inv.notes) : {};
  return `
    <tr>
      <td class="invoice-number">${inv.invoice_number}</td>
      <td>${formatDate(inv.billing_month)}</td>
      <td>${notes.total_appointments || '-'}</td>
      <td>₹${(notes.total_revenue || 0).toLocaleString('en-IN')}</td>
      <td>₹${(inv.amount || 0).toLocaleString('en-IN')}</td>
      <td>₹${(inv.tax_amount || 0).toLocaleString('en-IN')}</td>
      <td><strong>₹${inv.total_amount.toLocaleString('en-IN')}</strong></td>
      <td><span class="status-pill ${inv.payment_status.toLowerCase()}">${inv.payment_status}</span></td>
      <td>${formatDate(inv.due_date)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon btn-view" onclick="viewInvoice('${inv.invoice_salon_id}')" title="View">
            <i class="fa-regular fa-eye"></i>
          </button>
          ${inv.payment_status === 'UNPAID' ? `
            <button class="btn-icon btn-pay" onclick="payInvoice('${inv.invoice_salon_id}')" title="Pay">
              <i class="fa-solid fa-credit-card"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}).join('');
```

---

### ✅ Task 3.4: View Invoice Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After fetchBillingHistory

**Function:** `viewInvoice(invoiceSalonId)`

**Logic:**
1. Call API: `GET /super-admin/invoices/salon/{invoiceSalonId}`
2. Parse notes JSON to get usage details
3. Show SweetAlert modal with invoice details:
```javascript
Swal.fire({
  title: `Invoice: ${invoice.invoice_number}`,
  html: invoiceDetailsHtml,
  confirmButtonText: 'Close',
  confirmButtonColor: '#6366f1'
});
```

---

### ✅ Task 3.5: Pay Invoice Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After viewInvoice

**Function:** `payInvoice(invoiceSalonId)`

**Logic:**
1. Show SweetAlert payment form:
```javascript
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
```
2. If form submitted, call API: `POST /super-admin/invoices/salon/{invoiceSalonId}/payments`
3. Show success/error toast
4. Refresh billing history

---

### ✅ Task 3.6: Close Billing Preview Function
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** After payInvoice

**Function:** `closeBillingPreview()`

**Logic:**
1. Hide modal `#billingPreviewModal`
2. Clear `window.currentBillingData` and `window.currentSubscriptionId`

---

### ✅ Task 3.7: Populate Billing Month Selector
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** In initialization code

**Function:** `populateBillingMonthSelector()`

**Logic:**
1. Generate last 12 months + current month
2. Format as YYYY-MM
3. Populate `#billingMonthSelect` dropdown
4. Set current month as selected

---

### ✅ Task 3.8: Update renderSubscriptions
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** In renderSubscriptions function

**Changes:**
1. Add "Calculate Billing" button in each row
2. Button calls `openBillingPreview(subscriptionId)`

---

### ✅ Task 3.9: Update Initialization
**File:** `SUPER_ADMIN/Js/pages/sa-subscription.js`
**Location:** In initializePage function

**Add:**
1. Call `populateBillingMonthSelector()`
2. Add event listener for billing month change to refresh billing history

---

## PHASE 4: CSS STYLING

### ✅ Task 4.1: Billing Preview Styles
**File:** `SUPER_ADMIN/CSS/Pages/sa-subscription.css`
**Location:** End of file

**Add:**
```css
.billing-preview {
  padding: 20px;
}

.billing-summary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.summary-item span {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 600;
}

.usage-section {
  margin-bottom: 24px;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.usage-card {
  background: var(--bg-hover);
  padding: 20px;
  border-radius: var(--radius-lg);
  text-align: center;
}

.usage-card i {
  font-size: 32px;
  color: var(--primary);
  margin-bottom: 12px;
}

.usage-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.usage-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.calculation-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.calculation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.calculation-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
}

.calculation-table tr:last-child td {
  border-bottom: none;
}

.calculation-table td:first-child {
  font-weight: 600;
  color: var(--text-secondary);
}

.calculation-table td:last-child {
  text-align: right;
  font-weight: 600;
  color: var(--text-primary);
}

.subtotal-row td {
  background: var(--bg-hover);
  font-weight: 700;
}

.total-row td {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  font-size: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
}

.total-row td:first-child {
  color: rgba(255, 255, 255, 0.9);
}

.billing-month-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.billing-month-selector label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}
```

---

### ✅ Task 4.2: Billing History Styles
**File:** `SUPER_ADMIN/CSS/Pages/sa-subscription.css`
**Location:** After billing preview styles

**Add:**
```css
.billing-history-section {
  margin-top: 32px;
}

.invoice-number {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
}

.btn-pay {
  background: var(--success-bg);
  color: var(--success);
}

.btn-pay:hover {
  background: var(--success);
  color: white;
}
```

---

## PHASE 5: INTEGRATION & TESTING

### ✅ Task 5.1: Test Billing Calculation
**Test Cases:**
1. Flat rate plan - should show base amount only
2. Per appointment plan - should calculate count × price
3. Percentage plan - should calculate revenue × percentage
4. Mixed plan - should sum all components
5. Tax calculation - should be 18% of subtotal
6. Zero appointments - should handle gracefully

---

### ✅ Task 5.2: Test Invoice Generation
**Test Cases:**
1. Generate invoice for current month - success
2. Generate duplicate invoice - should show 409 error
3. Generate with invalid data - should show validation error
4. Invoice dates - should auto-set invoice_date and due_date (+7 days)

---

### ✅ Task 5.3: Test Billing History
**Test Cases:**
1. Display invoices correctly
2. Show usage details from notes
3. Payment status badges (UNPAID, PAID, PARTIAL)
4. View invoice modal
5. Pay invoice flow

---

### ✅ Task 5.4: Test Responsive Design
**Devices:**
1. Desktop (1920x1080)
2. Laptop (1366x768)
3. Tablet (768x1024)
4. Mobile (375x667)

---

## 📝 IMPLEMENTATION NOTES

### Important Considerations:

1. **State Management:**
   - Use `window.currentBillingData` to store calculation result
   - Use `window.currentSubscriptionId` to track active subscription

2. **Error Handling:**
   - All API calls wrapped in try-catch
   - Show user-friendly error messages
   - Log detailed errors to console

3. **Loading States:**
   - Show loading spinner during API calls
   - Disable buttons while processing
   - Prevent multiple simultaneous submissions

4. **Data Validation:**
   - Validate billing month format (YYYY-MM)
   - Ensure amounts are positive numbers
   - Check for required fields before API call

5. **User Experience:**
   - Show success/error toasts
   - Confirm before generating invoice
   - Auto-refresh billing history after payment

6. **Security:**
   - All amounts calculated in frontend (as per spec)
   - Backend validates received data
   - Authentication required for all API calls

---

## 🎯 COMPLETION CRITERIA

- [ ] All helper functions implemented
- [ ] Billing calculation works for all 3 plan types
- [ ] Billing preview modal displays correctly
- [ ] Invoice generation API call successful
- [ ] Billing history table populated
- [ ] View invoice modal works
- [ ] Pay invoice flow complete
- [ ] All CSS styles applied
- [ ] Responsive on all devices
- [ ] All error cases handled
- [ ] No console errors
- [ ] Code follows existing patterns

---

## 📁 FILES TO MODIFY

1. `SUPER_ADMIN/Js/pages/sa-subscription.js` - Main logic
2. `SUPER_ADMIN/html/super-admin/sa-subscription.html` - HTML structure
3. `SUPER_ADMIN/CSS/Pages/sa-subscription.css` - Styling

**NO DATABASE CHANGES REQUIRED**
**NO BACKEND CHANGES REQUIRED** (API already implemented)

---

**Last Updated:** 2025-03-07
**Status:** Ready for Implementation
