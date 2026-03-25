# 🔍 Debugging Guide - Incentives Admin Page

## Issues Being Investigated

### 1. Appointment Commission Modal Error
**Error:** `Unexpected token '<', "<br /><b>"... is not valid JSON`

**What it means:** The PHP backend is returning an HTML error page instead of JSON.

**Steps to Debug:**

1. **Open Browser Console** (F12)
2. **Click "By Appointment" button**
3. **Look for console logs:**
   - `Loading completable appointments...`
   - `API Result: {success: ..., data: ...}`
   - `Found X appointments`

4. **Check the Network tab:**
   - Look for the request to `/api/staff/incentives/completable-appointments`
   - Check the **Response** - it should be JSON, not HTML
   - Check the **Status Code** - should be 200

5. **Common Causes:**
   - PHP syntax error in StaffController.php
   - Database connection error
   - Missing authentication token
   - Wrong salon_id in session

**Fix:**
- Check XAMPP error logs: `C:\xampp\apache\logs\error.log`
- Check PHP error logs: `C:\xampp\php\logs\php_error_log`
- Look for the actual PHP error message

---

### 2. Bulk Payout Button Not Working

**Debugging Steps:**

1. **Open Browser Console** (F12)
2. **Select incentives using checkboxes**
3. **Click "Bulk Payout" button**
4. **Look for console logs:**
   ```
   Bulk payout clicked
   selectedIncentives: [1, 2, 3]
   allIncentives: [...]
   Selected records: [...]
   Staff IDs: [1]
   Staff ID: 1 Name: John Doe
   Opening payout modal...
   ```

5. **If modal opens, select payment method and click "Confirm Payout"**
6. **Look for more logs:**
   ```
   Submit payout clicked
   selectedPaymentMethod: CASH
   currentStaffId: 1
   Final incentive IDs to process: [1, 2, 3]
   Payout data: {...}
   Calling StaffAPI.processBatchPayout...
   Result: {...}
   ```

**Common Issues:**

| Issue | Console Output | Fix |
|-------|---------------|-----|
| No incentives selected | `No incentives selected` | Check if checkboxes are working |
| Checkbox not triggering | No logs appear | Check `toggleRowSelection()` function |
| Modal doesn't open | `Opening payout modal...` missing | Check `openBulkPayoutModal()` |
| Submit button disabled | Button stays disabled | Check `selectPaymentMethod()` is called |
| API error | `Error: ...` | Check backend logs |

---

## Backend Debugging

### Check PHP Error Logs

**Location:** `C:\xampp\apache\logs\error.log`

**What to look for:**
- SQL syntax errors
- Missing database tables
- Authentication errors
- Undefined variables

### Test API Endpoints Manually

**Using Postman or cURL:**

```bash
# Test completable appointments
curl -X GET "http://localhost/Sam-Backend/api/staff/incentives/completable-appointments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test batch payout
curl -X POST "http://localhost/Sam-Backend/api/staff/incentives/batch-payout" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": 1,
    "incentive_ids": [1, 2, 3],
    "payout_date": "2026-03-25",
    "payment_mode": "CASH",
    "remarks": "Test payout"
  }'
```

---

## Database Verification

### Check if Tables Exist

```sql
-- Check incentive_payouts table
SHOW TABLES LIKE 'incentive_payouts';

-- Check incentives table
SHOW TABLES LIKE 'incentives';

-- Check appointments table
SHOW TABLES LIKE 'appointments';
```

### Check Data

```sql
-- Check if there are any incentives
SELECT * FROM incentives LIMIT 10;

-- Check if there are any completed appointments
SELECT * FROM appointments WHERE status = 'COMPLETED' LIMIT 10;

-- Check appointment services
SELECT * FROM appointment_services WHERE appointment_id IN (
    SELECT appointment_id FROM appointments WHERE status = 'COMPLETED'
) LIMIT 10;
```

---

## Frontend Debugging

### Check if Functions are Called

Add this to the top of incentives.html to debug:

```javascript
<script>
// Debug helper
window.debugMode = true;
console.log('Incentives page loaded, debug mode enabled');

// Override functions to add logging
const originalBulkPayout = bulkPayout;
bulkPayout = function() {
    console.log('DEBUG: bulkPayout called');
    return originalBulkPayout.apply(this, arguments);
};
</script>
```

### Check Event Listeners

Run in console:

```javascript
// Check if bulkPayout is defined
typeof bulkPayout  // Should return "function"

// Check if submitPayout is defined
typeof submitPayout  // Should return "function"

// Check selectedIncentives array
selectedIncentives  // Should be an array

// Check allIncentives array
allIncentives  // Should be an array with data
```

---

## Quick Fixes

### Fix 1: Token Issues

If you see 401 Unauthorized errors:

```javascript
// In console, check token
console.log(localStorage.getItem('auth_token'));
console.log(localStorage.getItem('csrf_token'));

// If missing, login again
```

### Fix 2: Clear Cache

```javascript
// Clear localStorage and reload
localStorage.clear();
location.reload();
```

### Fix 3: Check API Base URL

```javascript
// In console
console.log(API_BASE_URL);  // Should be your backend URL
```

---

## Expected Console Output (Success Flow)

### Appointment Commission Flow:
```
Loading completable appointments...
API Result: {success: true, data: {...}}
Found 5 appointments
Selected appointment: 123
Loading commission breakdown...
Commission breakdown loaded
```

### Bulk Payout Flow:
```
Bulk payout clicked
selectedIncentives: [1, 2, 3]
allIncentives: [...]
Selected records: [...]
Staff IDs: [1]
Staff ID: 1 Name: John Doe
Opening payout modal...
Submit payout clicked
selectedPaymentMethod: CASH
currentStaffId: 1
Final incentive IDs to process: [1, 2, 3]
Payout data: {...}
Calling StaffAPI.processBatchPayout...
Result: {success: true, data: {...}}
Payout successful! ₹450 paid for 3 incentive(s)
```

---

## Contact Support

If issues persist:
1. Take screenshot of console errors
2. Export network tab HAR file
3. Share PHP error log excerpts
4. Include database schema version

---

**Last Updated:** 2026-03-25  
**Debug Version:** 1.0
