# SUPER_ADMIN Reports Implementation

## Overview

Updated the Reports Module to allow **SUPER_ADMIN** to view platform-wide reports across all salons, with the option to view specific salon reports using the `?salon_id=` query parameter.

---

## Implementation Approach: Option 1

**Chosen Approach:** Modify existing report methods to support both salon-specific and platform-wide queries.

**Key Features:**
- SUPER_ADMIN can access reports with optional `?salon_id=` parameter
- If `salon_id` not provided → Platform-wide report (all salons)
- If `salon_id` provided → Specific salon report
- ADMIN/STAFF can only view their own salon reports (unchanged behavior)
- Response includes `"scope": "platform"` or `"scope": "salon"` to indicate data range

---

## Updated Reports

### ✅ Reports Available to SUPER_ADMIN

| # | Report | Endpoint | Query Parameters | Scope |
|---|--------|----------|------------------|-------|
| 1 | **Sales Report** | `GET /api/reports/sales` | `?salon_id=1` (optional) | Platform or Salon |
| 2 | **Appointment Report** | `GET /api/reports/appointments` | `?salon_id=1` (optional) | Platform or Salon |
| 3 | **Service-wise Revenue** | `GET /api/reports/services` | `?salon_id=1` (optional) | Platform or Salon |
| 4 | **Package-wise Revenue** | `GET /api/reports/packages` | `?salon_id=1` (optional) | Platform or Salon |
| 5 | **Tax Report (GST)** | `GET /api/reports/tax` | `?salon_id=1` (optional), `?tax_rate=18` | Platform or Salon |

### ❌ Reports NOT Available to SUPER_ADMIN (Salon-Level Only)

These reports are salon-specific and not relevant for platform-wide view:

| # | Report | Reason | Access |
|---|--------|--------|--------|
| 3 | Staff Performance | Staff management is salon-level | ADMIN, STAFF only |
| 6 | Customer Visit Report | Customer data is salon-specific | ADMIN, STAFF only |
| 7 | Inventory Usage Report | Inventory is salon-specific | ADMIN, STAFF only |
| 8 | Incentive Payout Report | Staff incentives are salon-level | ADMIN, STAFF only |

---

## API Usage Examples

### 1. Platform-Wide Sales Report (All Salons)

**Request:**
```http
GET /api/reports/sales?start_date=2025-02-01&end_date=2025-02-28
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_revenue": 1250000.00,
      "total_appointments": 450
    },
    "by_service": [
      {
        "service_name": "Haircut",
        "count": 120,
        "revenue": 60000.00
      }
    ],
    "by_package": [
      {
        "package_name": "Bridal Package",
        "count": 15,
        "revenue": 225000.00
      }
    ],
    "period": {
      "start_date": "2025-02-01",
      "end_date": "2025-02-28"
    },
    "scope": "platform"
  }
}
```

---

### 2. Specific Salon Sales Report

**Request:**
```http
GET /api/reports/sales?salon_id=1&start_date=2025-02-01&end_date=2025-02-28
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_revenue": 50000.00,
      "total_appointments": 18
    },
    "by_service": [...],
    "by_package": [...],
    "period": {...},
    "scope": "salon"
  }
}
```

---

### 3. Platform-Wide Tax Report (GST)

**Request:**
```http
GET /api/reports/tax?start_date=2025-02-01&end_date=2025-02-28&tax_rate=18
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "tax_rate": 18,
    "summary": {
      "total_taxable_revenue": 1250000.00,
      "total_tax_amount": 225000.00,
      "total_transactions": 450
    },
    "breakdown": {
      "appointments": {
        "taxable_revenue": 1000000.00,
        "tax_amount": 180000.00,
        "taxable_transactions": 400
      },
      "subscriptions": {
        "taxable_revenue": 250000.00,
        "tax_amount": 45000.00,
        "taxable_transactions": 50
      }
    },
    "period": {
      "start_date": "2025-02-01",
      "end_date": "2025-02-28"
    },
    "scope": "platform"
  }
}
```

---

## Frontend Integration

### JavaScript Usage

```javascript
// Platform-wide report (SUPER_ADMIN)
async function getPlatformSalesReport(startDate, endDate) {
  const response = await fetch(
    `http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    }
  );
  return await response.json();
}

// Specific salon report (SUPER_ADMIN)
async function getSalonSalesReport(salonId, startDate, endDate) {
  const response = await fetch(
    `http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?salon_id=${salonId}&start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    }
  );
  return await response.json();
}

// Check scope in response
const report = await getPlatformSalesReport('2025-02-01', '2025-02-28');
if (report.data.scope === 'platform') {
  console.log('Platform-wide data');
} else {
  console.log(`Salon-specific data for salon ${report.data.salon_id}`);
}
```

---

## Files Modified

### 1. **modules/reports/ReportController.php**

**Changes:**
- Updated `sales()` method - Added SUPER_ADMIN support with optional salon_id
- Updated `appointments()` method - Added SUPER_ADMIN support with optional salon_id
- Updated `services()` method - Added SUPER_ADMIN support with optional salon_id
- Updated `packages()` method - Added SUPER_ADMIN support with optional salon_id
- Updated `tax()` method - Added SUPER_ADMIN support with optional salon_id

**Pattern Used:**
```php
public function sales()
{
    $auth = $GLOBALS['auth_user'] ?? null;
    $userRole = $auth['role'] ?? null;
    
    // SUPER_ADMIN can view all salons or specific salon
    if ($userRole === 'SUPER_ADMIN') {
        $salonId = $_GET['salon_id'] ?? null;
    } else {
        // ADMIN/STAFF must use their own salon_id
        $salonId = $auth['salon_id'] ?? null;
    }
    
    // Build query based on role
    if ($userRole === 'SUPER_ADMIN' && !$salonId) {
        // Platform-wide report (all salons)
        $stmt = $this->db->prepare("SELECT ... FROM appointments WHERE ...");
    } else {
        // Specific salon report
        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }
        $stmt = $this->db->prepare("SELECT ... FROM appointments WHERE salon_id = ? ...");
    }
    
    // Add scope to response
    Response::json([
        "status" => "success",
        "data" => [...],
        "scope" => $salonId ? "salon" : "platform"
    ]);
}
```

### 2. **modules/reports/routes.php**

**Changes:**
- Updated authorization for sales, appointments, services, packages, tax reports
- Changed from `authorize(['ADMIN', 'STAFF'])` to `authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF'])`
- Kept staff-performance, customers, inventory, incentives as ADMIN/STAFF only

---

## Testing

### Test Cases for SUPER_ADMIN

1. **Platform-wide report (no salon_id)**
   ```bash
   curl -X GET "http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?start_date=2025-02-01&end_date=2025-02-28" \
     -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
   ```
   Expected: `"scope": "platform"`, data from all salons

2. **Specific salon report (with salon_id)**
   ```bash
   curl -X GET "http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?salon_id=1&start_date=2025-02-01&end_date=2025-02-28" \
     -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
   ```
   Expected: `"scope": "salon"`, data from salon_id=1 only

3. **ADMIN user trying to access platform report**
   ```bash
   curl -X GET "http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?start_date=2025-02-01&end_date=2025-02-28" \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```
   Expected: `"scope": "salon"`, data from admin's salon only

4. **ADMIN user trying to specify different salon_id**
   ```bash
   curl -X GET "http://localhost/Sam-Backend/BACKEND/public/index.php/api/reports/sales?salon_id=2&start_date=2025-02-01&end_date=2025-02-28" \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```
   Expected: `"scope": "salon"`, data from admin's salon (salon_id=2 ignored)

---

## Response Structure Changes

### Before (Salon-only)
```json
{
  "status": "success",
  "data": {
    "summary": {...},
    "period": {...}
  }
}
```

### After (With scope indicator)
```json
{
  "status": "success",
  "data": {
    "summary": {...},
    "period": {...},
    "scope": "platform"  // ← NEW: Indicates data scope
  }
}
```

---

## Security Considerations

1. **SUPER_ADMIN Access:**
   - Can view all salons' data (platform-wide)
   - Can view specific salon data with `?salon_id=` parameter
   - Cannot access salon-level reports (staff performance, customers, inventory, incentives)

2. **ADMIN/STAFF Access:**
   - Can only view their own salon's data
   - `?salon_id=` parameter is ignored for ADMIN/STAFF
   - System uses `auth['salon_id']` from JWT token

3. **Data Isolation:**
   - Platform queries: No `salon_id` WHERE clause
   - Salon queries: `WHERE salon_id = ?` clause enforced

---

## Benefits

### For SUPER_ADMIN:
✅ Platform-wide visibility
✅ Compare salon performance
✅ Identify top-performing salons
✅ Track total revenue and tax collection
✅ Make informed business decisions

### For Frontend:
✅ Consistent API structure
✅ Single endpoint for both scopes
✅ Clear scope indicator in response
✅ Easy to switch between platform and salon views

### For Backend:
✅ Minimal code changes
✅ Reuses existing report logic
✅ No database schema changes
✅ Maintains backward compatibility

---

## Implementation Date
**2025-03-07**

## Status
✅ **COMPLETE** - Ready for testing

---

## Next Steps

1. **Test all 5 updated reports** with SUPER_ADMIN token
2. **Verify platform-wide data** is accurate
3. **Verify salon-specific data** matches individual salon reports
4. **Update frontend** to use new `?salon_id=` parameter
5. **Add scope indicator** to frontend UI (show "Platform-wide" or salon name)
