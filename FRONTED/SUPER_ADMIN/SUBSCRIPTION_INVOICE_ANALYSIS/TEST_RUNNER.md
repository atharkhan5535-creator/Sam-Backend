# Test Runner - Subscription & Invoice System

**Last Updated:** 2026-03-23

---

## How to Run Tests

### Backend API Tests (PHP)

```bash
# Navigate to the test folder
cd FRONTED/SUPER_ADMIN/SUBSCRIPTION_INVOICE_ANALYSIS

# Run API tests
php test_subscription_invoice_apis.php

# Run integration tests
php test_billing_integration.php
```

### Frontend JavaScript Tests

Open in browser:
```
file:///C:/xampp/htdocs/Sam-Backend/FRONTED/SUPER_ADMIN/SUBSCRIPTION_INVOICE_ANALYSIS/test_javascript_functions.html
```

Or access via web server:
```
http://localhost/Sam-Backend/FRONTED/SUPER_ADMIN/SUBSCRIPTION_INVOICE_ANALYSIS/test_javascript_functions.html
```

---

## Test Files

| File | Description |
|------|-------------|
| `test_subscription_invoice_apis.php` | Backend API tests for BillingHelper and endpoints |
| `test_billing_integration.php` | End-to-end integration tests for billing flow |
| `test_javascript_functions.html` | Frontend JavaScript function tests |

---

## What Gets Tested

### Backend API Tests
- ✅ `BillingHelper::calculateProration()` - Proration for flat plans
- ✅ `BillingHelper::calculateBilling()` - Billing calculation for all plan types
- ✅ `BillingHelper::generateInvoiceNumber()` - Invoice number generation
- ✅ `BillingHelper::calculatePaymentStatus()` - Payment status verification
- ✅ Renew Subscription API endpoint
- ✅ Invoice existence check
- ✅ Get completed appointments

### Integration Tests
- ✅ Step 1: Get test data (salon, plan, subscription, appointments)
- ✅ Step 2: Proration calculation
- ✅ Step 3: Billing calculation
- ✅ Step 4: Invoice existence check
- ✅ Step 5: Payment status calculation
- ✅ Step 6: Renewal calculation

### JavaScript Tests
- ✅ Billing calculation functions
- ✅ Renew subscription functions
- ✅ Payment validation functions
- ✅ Invoice functions (print, download PDF)
- ✅ Bulk operations (export, print, delete)
- ✅ Helper functions

---

## Expected Results

### Passing Tests Indicators
- ✓ PASS - Test passed
- ℹ INFO - Informational message
- ⚠ SKIP - Test skipped (missing data)

### Failing Tests Indicators
- ✗ FAIL - Test failed (with reason)

---

## Test Output Files

After running tests, result files are generated:
- `API_TEST_RESULTS_YYYY-MM-DD_HH-MM-SS.txt`
- `INTEGRATION_TEST_RESULTS_YYYY-MM-DD_HH-MM-SS.txt`

These files are saved in the `SUBSCRIPTION_INVOICE_ANALYSIS` folder.

---

## Troubleshooting

### Database Connection Error
```
Error: Database connection failed
```
**Solution:** Ensure XAMPP MySQL is running and database credentials in `config/database.php` are correct.

### No Test Data Found
```
⚠ SKIP: No active subscriptions found for testing
```
**Solution:** This is informational. Tests will skip gracefully if no test data exists. Create a subscription plan and assign it to a salon first.

### Permission Denied
```
Warning: file_put_contents(): Permission denied
```
**Solution:** Ensure the `SUBSCRIPTION_INVOICE_ANALYSIS` folder has write permissions.

---

## Test Coverage Summary

| Component | Tests | Status |
|-----------|-------|--------|
| BillingHelper | 15+ | ✅ Complete |
| Renew API | 5+ | ✅ Complete |
| Invoice Functions | 8+ | ✅ Complete |
| Payment Validation | 6+ | ✅ Complete |
| Bulk Operations | 5+ | ✅ Complete |
| Integration Flow | 20+ | ✅ Complete |

**Total Tests:** 60+

---

## Quick Test Command

Run all PHP tests at once:
```bash
cd C:\xampp\htdocs\Sam-Backend\FRONTED\SUPER_ADMIN\SUBSCRIPTION_INVOICE_ANALYSIS
php test_subscription_invoice_apis.php && php test_billing_integration.php
```

---

## Test Results Interpretation

### Pass Rate Guidelines
- **100%** - All tests passed, ready for production
- **90-99%** - Minor issues, review failed tests
- **Below 90%** - Significant issues, investigate failures

### Common Failure Reasons
1. Missing database tables
2. Incorrect data types
3. Missing API endpoints
4. JavaScript function not defined

---

## Contact

For test-related issues, check:
1. `IMPLEMENTATION_TRACKER.md` - Implementation status
2. `COMPLETE_ANALYSIS_AND_TODO.md` - Detailed analysis
3. Test result files in this folder
