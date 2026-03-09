# Cancel Subscription API - SUPER_ADMIN Fix

## ✅ **FIXED: 2025-03-07**

---

## 🔴 **Issue**

SUPER_ADMIN role was getting error when trying to cancel subscriptions.

**Error:**
```
PATCH /api/subscriptions/{id}/cancel
Response: 400 Bad Request - "Invalid salon context"
```

**Root Cause:**
- The `cancel()` method required `salon_id` from JWT token
- SUPER_ADMIN users don't have `salon_id` in their token (by design)
- Only ADMIN/STAFF/CUSTOMER have `salon_id` in their tokens

---

## 🔧 **Fix Applied**

### **File Modified:**
`modules/subscriptions/SubscriptionController.php`

### **Method Updated:**
`cancel($subscriptionId)` - Line 199

### **Changes Made:**

**Before (Broken for SUPER_ADMIN):**
```php
public function cancel($subscriptionId)
{
    $auth = $GLOBALS['auth_user'] ?? null;
    $salonId = $auth['salon_id'] ?? null;  // ❌ SUPER_ADMIN doesn't have this

    if (!$salonId) {
        Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
    }
    // ... rest of code
}
```

**After (Works for Both Roles):**
```php
public function cancel($subscriptionId)
{
    $auth = $GLOBALS['auth_user'] ?? null;
    $userRole = $auth['role'] ?? null;
    
    // ✅ SUPER_ADMIN can cancel ANY subscription (no salon_id required)
    if ($userRole === 'SUPER_ADMIN') {
        // Just verify subscription exists
        $stmt = $this->db->prepare("SELECT subscription_id FROM salon_subscriptions WHERE subscription_id = ?");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch();
        
        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }
        
        // Cancel the subscription
        $stmt = $this->db->prepare("
            UPDATE salon_subscriptions
            SET status = 'CANCELLED', updated_at = NOW()
            WHERE subscription_id = ?
        ");
        $stmt->execute([$subscriptionId]);
        
        Response::json([
            "status" => "success",
            "data" => [
                "subscription_id" => $subscriptionId,
                "status" => "CANCELLED"
            ]
        ]);
        return;
    }
    
    // ✅ ADMIN logic - requires salon_id
    $salonId = $auth['salon_id'] ?? null;
    if (!$salonId) {
        Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
    }
    // ... rest of ADMIN code
}
```

---

## 📋 **API Specification**

### **Endpoint:**
```
PATCH /api/subscriptions/{subscription_id}/cancel
```

### **Access:**
- **SUPER_ADMIN** - Can cancel any subscription across all salons
- **ADMIN** - Can only cancel own salon's subscription

### **Headers:**
```
Authorization: Bearer <access_token>
```

### **Response (SUPER_ADMIN):**
```json
{
  "status": "success",
  "data": {
    "subscription_id": 1,
    "status": "CANCELLED"
  }
}
```

### **Response (ADMIN):**
```json
{
  "status": "success"
}
```

---

## 🧪 **Test Cases**

### **Test 1: SUPER_ADMIN cancels any subscription**
```bash
curl -X PATCH "http://localhost/Sam-Backend/BACKEND/public/index.php/api/subscriptions/1/cancel" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
```
**Expected:** Success with subscription details

### **Test 2: ADMIN cancels own salon subscription**
```bash
curl -X PATCH "http://localhost/Sam-Backend/BACKEND/public/index.php/api/subscriptions/1/cancel" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
**Expected:** Success (if subscription belongs to admin's salon)

### **Test 3: ADMIN tries to cancel another salon's subscription**
```bash
curl -X PATCH "http://localhost/Sam-Backend/BACKEND/public/index.php/api/subscriptions/2/cancel" \
  -H "Authorization: Bearer <ADMIN_TOKEN_SALON_1>"
```
**Expected:** 404 "Subscription not found" (because it's not in their salon)

---

## 📝 **Files Updated**

| File | Changes |
|------|---------|
| `modules/subscriptions/SubscriptionController.php` | Added SUPER_ADMIN role check in `cancel()` method |
| `API_DOCUMENTATION.txt` | Updated with role-based response examples |
| `SAM_Backend_API_Collection.postman_collection.json` | Added description and test scripts |

---

## ✅ **Status**

- **Backend:** ✅ Fixed
- **Documentation:** ✅ Updated
- **Postman:** ✅ Updated
- **Frontend:** ✅ Ready to use

---

## 🎯 **Access Matrix**

| Role | Can Cancel | Scope |
|------|------------|-------|
| **SUPER_ADMIN** | ✅ Yes | Any salon's subscription |
| **ADMIN** | ✅ Yes | Own salon's subscription only |
| **STAFF** | ❌ No | No access |
| **CUSTOMER** | ❌ No | No access |

---

## 🚀 **Testing in Postman**

1. Import updated `SAM_Backend_API_Collection.postman_collection.json`
2. Navigate to: **🏬 SALON SUBSCRIPTIONS** → **Cancel Salon Subscription**
3. Login as SUPER_ADMIN to get token
4. Send request to cancel any subscription
5. Verify response includes subscription details

---

**Implementation Date:** 2025-03-07  
**Status:** ✅ COMPLETE
