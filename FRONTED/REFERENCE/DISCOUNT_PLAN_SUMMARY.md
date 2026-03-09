# Appointment Discount Calculation - Complete Plan

## Database Fields (3 levels)

### appointments table:
```sql
total_amount      -- SUBTOTAL (services_final + packages_final)
discount_amount   -- OVERALL appointment discount
final_amount      -- FINAL (total_amount - discount_amount)
```

### appointment_services table:
```sql
service_price     -- Base price of service
discount_amount   -- Service-LEVEL discount
final_price       -- service_price - discount_amount
```

### appointment_packages table:
```sql
package_price     -- Base price of package
discount_amount   -- Package-LEVEL discount
final_price       -- package_price - discount_amount
```

## Formula

```
LEVEL 1 - Service Level:
  final_price[i] = service_price[i] - service_discount[i]

LEVEL 2 - Package Level:
  final_price[j] = package_price[j] - package_discount[j]

LEVEL 3 - Appointment Subtotal:
  total_amount = Σ(services_final) + Σ(packages_final)

LEVEL 4 - Overall Discount:
  overall_discount = appointments.discount_amount

LEVEL 5 - Final Amount:
  final_amount = total_amount - overall_discount
```

## Files to Modify

1. `admin/appointments.html` - Main file with all logic

## Key Functions to Fix

1. `createAppointment()` - Add total_amount, final_amount calculation
2. `viewDetail()` - Initialize edit state correctly, don't recalc on open
3. `calculateNewTotal()` - Calculate from editServiceData (price - discount)
4. `saveAppointmentEdit()` - Compare changes, make API calls in order
5. `openInvoiceModal()` - Pre-fill subtotal = total_amount (NOT final_amount)

## Global State Variables

```javascript
window.editSelectedServices = [];      // Array of service_ids (as NUMBERS)
window.editSelectedPackages = [];      // Array of package_ids (as NUMBERS)
window.editServiceData = {};           // { id: { price, discount, staff_id } }
window.editPackageData = {};           // { id: { price, discount, staff_id } }
window.originalAppointmentData = null; // Original from DB (for comparison)
```

## TODO List (Priority Order)

- [ ] Phase 1: Backup appointments.html
- [ ] Phase 2: Add global state variables
- [ ] Phase 3: Fix createAppointment() - add 3 amount fields
- [ ] Phase 4: Fix viewDetail() - initialize state, don't recalc
- [ ] Phase 5: Create toggleEditService/Package()
- [ ] Phase 6: Create calculateNewTotal() - proper formula
- [ ] Phase 7: Fix saveAppointmentEdit() - compare & API calls
- [ ] Phase 8: Fix openInvoiceModal() - subtotal = total_amount
- [ ] Phase 9: Test all scenarios
- [ ] Phase 10: Cleanup & documentation

## Test Scenarios

1. Create with ₹500 service + ₹50 discount → final = ₹450
2. View → Current Total = final_amount from DB
3. Add service discount → New Estimate updates
4. Remove service → New Estimate drops
5. Generate invoice → Subtotal = total_amount

## Verification Formula

```
final_amount MUST equal:
  (Σ(service_price - service_discount) + Σ(package_price - package_discount)) - overall_discount
```

## Example Calculation

```
Services:
  Service 1: ₹500 - ₹50 = ₹450
  Service 2: ₹300 - ₹0 = ₹300
  Services Final: ₹750

Packages:
  Package 1: ₹1000 - ₹100 = ₹900
  Package 2: ₹2500 - ₹0 = ₹2500
  Packages Final: ₹3400

Appointment:
  total_amount = ₹750 + ₹3400 = ₹4150
  overall_discount = ₹200
  final_amount = ₹4150 - ₹200 = ₹3950
```
