# ⚠️ CANCEL SUBSCRIPTION - BACKEND LIMITATION

**Date:** 2025-03-07  
**Status:** ❌ **CANNOT FIX - BACKEND ISSUE**

---

## 🐛 ERROR

```
PATCH http://localhost/Sam-Backend/BACKEND/public/index.php/api/subscriptions/2/cancel 400 (Bad Request)
Error: Invalid salon context
```

---

## 🔍 ROOT CAUSE

### Backend Issue:
The `/subscriptions/{id}/cancel` endpoint is checking for **salon context** (salon_id from JWT token), but:

- **ADMIN users** → Have salon_id in token ✅
- **SUPER_ADMIN users** → Do NOT have salon_id in token ❌

### Backend Code (Likely):
```php
// Backend probably does something like:
$salonId = $auth->getSalonId();  // Returns NULL for SUPER_ADMIN
if (!$salonId) {
    throw new Exception('Invalid salon context');  // ← ERROR!
}
```

---

## 📋 API ENDPOINT CONFUSION

### What We Tried:

1. **First Attempt:** `/super-admin/subscriptions/{id}/cancel`
   - Result: **404 Not Found** (endpoint doesn't exist)

2. **Second Attempt:** `/subscriptions/{id}/cancel`
   - Result: **400 Bad Request - Invalid salon context** (SUPER_ADMIN not supported)

---

## 🎯 THE REAL ISSUE

### Backend Design Flaw:
The cancel subscription endpoint was designed for **ADMIN only**, not SUPER_ADMIN.

**ADMIN Flow:**
```
ADMIN clicks Cancel → Token has salon_id → Backend validates salon → ✅ Works
```

**SUPER_ADMIN Flow:**
```
SUPER_ADMIN clicks Cancel → Token has NO salon_id → Backend validation fails → ❌ Error
```

---

## 🔧 POSSIBLE SOLUTIONS (Backend Changes Required)

### Option 1: Add SUPER_ADMIN Support to Existing Endpoint
**File:** `modules/subscriptions/SubscriptionController.php`

```php
public function cancel($subscriptionId) {
    $user = $this->auth->getUser();
    
    // SUPER_ADMIN can cancel ANY subscription
    if ($user->role === 'SUPER_ADMIN') {
        // Skip salon context check
        return $this->cancelSubscription($subscriptionId);
    }
    
    // ADMIN can only cancel own salon's subscriptions
    if ($user->role === 'ADMIN') {
        $salonId = $user->salon_id;
        if (!$salonId) {
            return json_error('Invalid salon context');
        }
        // Validate subscription belongs to this salon
        // ...
    }
}
```

### Option 2: Create SUPER_ADMIN-Specific Endpoint
**File:** `modules/super_admin/SubscriptionsController.php`

```php
public function cancelSubscription($subscriptionId) {
    // SUPER_ADMIN can cancel any subscription without salon context
    // Just validate subscription exists
    // ...
}
```

**Route:** `POST /api/super-admin/subscriptions/{id}/cancel`

---

## ⚠️ FRONTEND CANNOT FIX THIS

### Why?
- This is a **backend validation issue**
- Frontend is sending correct requests
- Backend is rejecting SUPER_ADMIN role
- Requires PHP code changes

---

## 📝 CURRENT STATUS

### What Works:
- ✅ ADMIN users can cancel subscriptions (from their salon)
- ✅ SUPER_ADMIN can view all subscriptions
- ✅ SUPER_ADMIN can assign subscriptions
- ✅ SUPER_ADMIN can update subscriptions
- ✅ SUPER_ADMIN can generate invoices

### What Doesn't Work:
- ❌ SUPER_ADMIN cannot cancel subscriptions
  - Error: "Invalid salon context"
  - Reason: Backend expects salon_id, SUPER_ADMIN doesn't have one

---

## 🎯 RECOMMENDATION

### For Now (Workaround):
1. **Disable cancel button for SUPER_ADMIN** on subscription page
2. **OR** Show message: "Contact super admin to cancel this subscription"

### Long-term Fix:
**Backend developer needs to:**
1. Add SUPER_ADMIN support to `/subscriptions/{id}/cancel` endpoint
2. OR create new `/super-admin/subscriptions/{id}/cancel` endpoint
3. OR remove salon context check for SUPER_ADMIN role

---

## 📊 FRONTEND CODE (Correct - No Changes Needed)

### config.js:
```javascript
// ✅ This is correct
CANCEL: (subscriptionId) => `/subscriptions/${subscriptionId}/cancel`,
```

### sa-subscription.js:
```javascript
// ✅ This is correct
async function cancelSubscription(subscriptionId) {
    const response = await apiRequest(
        API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(subscriptionId),
        { method: 'PATCH' }
    );
    // ...
}
```

**Frontend is sending correct request. Backend is rejecting it.**

---

## ✅ ALTERNATIVE

If you need SUPER_ADMIN to cancel subscriptions urgently:

### Option A: Use Database Directly
```sql
UPDATE salon_subscriptions 
SET status = 'CANCELLED' 
WHERE subscription_id = 2;
```

### Option B: Ask Backend Developer
Tell them:
> "SUPER_ADMIN role cannot cancel subscriptions. Endpoint `/subscriptions/{id}/cancel` checks for salon_id but SUPER_ADMIN doesn't have one. Please add SUPER_ADMIN support or create `/super-admin/subscriptions/{id}/cancel` endpoint."

---

## 📝 SUMMARY

| Feature | Status | Reason |
|---------|--------|--------|
| ADMIN cancel subscription | ✅ Works | Has salon_id |
| SUPER_ADMIN cancel subscription | ❌ Fails | No salon_id |
| Frontend code | ✅ Correct | N/A |
| Backend code | ❌ Issue | Expects salon_id |

---

**Status:** ❌ **CANNOT FIX (Frontend limitation)**  
**Requires:** Backend PHP changes  
**Workaround:** Disable button or use database directly  
**Last Updated:** 2025-03-07
