# 🎨 NOTIFICATION SYSTEM - USAGE GUIDE

## ✅ COMPLETED IMPLEMENTATION

### **Files Created:**
1. **`js/notifications.js`** - Complete notification utility library
2. **CDN Integration** - SweetAlert2 + Toastify added to all admin pages

### **Files Updated:**
- ✅ `admin/customers.html`
- ✅ `admin/services.html`
- ✅ `admin/package.html`
- ✅ `admin/staff.html`
- ✅ `admin/appointments.html`
- ✅ `admin/inventory.html`
- ✅ `admin/payments.html`
- ✅ `admin/incentives.html`

---

## 📚 AVAILABLE FUNCTIONS

### **Toast Notifications** (Auto-dismiss)

```javascript
// Success toast (green, top-right)
showSuccess('Customer added successfully!');
showSuccess('Operation completed!', 5000); // Custom duration

// Error toast (red, top-right)
showErrorToast('Email already exists');
showErrorToast('Invalid data', 6000); // Custom duration

// Warning toast (amber, top-right)
showWarningToast('Stock is running low');

// Info toast (blue, top-right)
showInfoToast('New feature available');
```

### **Modal Alerts** (Require user acknowledgment)

```javascript
// Error modal
showError('Error', 'Something went wrong');
showError('Validation Failed', ['Name is required', 'Email is invalid']);

// Success modal (auto-closes after 2 seconds)
showSuccessModal('Success!', 'Record saved successfully');

// Warning modal
showWarning('Warning', 'This action cannot be undone');

// Info modal
showInfo('Information', 'Your session will expire in 5 minutes');
```

### **Confirmation Dialog**

```javascript
// Basic confirmation
const result = await showConfirm('Delete Record?', 'Are you sure you want to delete this item?');
if (result.isConfirmed) {
    // User clicked "Yes"
    deleteItem();
}

// Custom button text
const result = await showConfirm(
    'Deactivate Staff?', 
    'This will prevent the staff member from logging in.',
    'Deactivate', 
    'Keep Active'
);
```

### **Loading Spinner**

```javascript
// Show loading
const loading = showLoading('Saving data...');

// Perform async operation
await someAsyncFunction();

// Close loading
closeLoading();

// OR
loading.close();
```

### **Validation Errors**

```javascript
// Single error
showValidationErrors('Name is required');

// Multiple errors (from ValidationUtils)
const validation = ValidationUtils.validateCustomerData(customerData);
if (!validation.valid) {
    showValidationErrors(validation.errors);
}
```

### **Legacy Functions** (Backward compatible)

```javascript
// Old showToast still works
showToast('Message'); // Shows success toast

// Old showAlert still works
showAlert('Error message', 'error'); // Shows error modal
showAlert('Success message', 'success'); // Shows success modal
```

---

## 🎨 THEME CUSTOMIZATION

All notifications match the Elite Salon dark/gold theme:

```javascript
const SwalTheme = {
    background: '#1a1f2e',      // Dark card background
    color: '#f1f5f9',           // Light text
    confirmButtonColor: '#d4af37', // Gold accent
    cancelButtonColor: '#64748b',  // Muted gray
    backdrop: 'rgba(0,0,0,0.85)'   // Dark backdrop
};
```

---

## 📋 REPLACEMENT GUIDE

### **Before → After**

```javascript
// OLD: Browser alert
alert('Customer added successfully!');

// NEW: Success toast
showSuccess('Customer added successfully!');
```

```javascript
// OLD: Browser alert with error
alert('❌ Failed: ' + errorMessage);

// NEW: Error modal
showError('Failed', errorMessage);
```

```javascript
// OLD: Browser confirm
if (confirm('Are you sure?')) {
    deleteItem();
}

// NEW: SweetAlert confirm
const result = await showConfirm('Delete?', 'Are you sure?');
if (result.isConfirmed) {
    deleteItem();
}
```

```javascript
// OLD: Multiple validation errors
alert('Invalid data:\n\n• Name is required\n• Email is required');

// NEW: Validation errors modal
showValidationErrors(['Name is required', 'Email is required']);
```

---

## 🚀 USAGE EXAMPLES

### **Example 1: Form Submission**

```javascript
async function saveCustomer() {
    const customerData = { /* ... */ };
    
    // Validate
    const validation = ValidationUtils.validateCustomerData(customerData);
    if (!validation.valid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    // Show loading
    showLoading('Saving customer...');
    
    try {
        const result = await CustomersAPI.create(customerData);
        closeLoading();
        
        if (result.success) {
            showSuccess('Customer added successfully!');
            closeModal();
            loadCustomers();
        } else {
            showError('Failed to save', result.message);
        }
    } catch (error) {
        closeLoading();
        showError('Error', error.message);
    }
}
```

### **Example 2: Delete Confirmation**

```javascript
async function deleteCustomer(id) {
    const result = await showConfirm(
        'Delete Customer?',
        'This will permanently delete the customer and all associated data.',
        'Delete',
        'Cancel'
    );
    
    if (!result.isConfirmed) return;
    
    showLoading('Deleting...');
    
    try {
        await CustomersAPI.delete(id);
        closeLoading();
        showSuccess('Customer deleted successfully!');
        loadCustomers();
    } catch (error) {
        closeLoading();
        showError('Delete failed', error.message);
    }
}
```

### **Example 3: Success with Auto-close**

```javascript
function updateProfile() {
    // ... update logic ...
    
    showSuccessModal('Profile Updated', 'Your changes have been saved.');
    // Modal auto-closes after 2 seconds
}
```

### **Example 4: Warning Toast**

```javascript
function checkLowStock() {
    if (stockLevel < minLevel) {
        showWarningToast(`Low stock: ${productName} (${currentStock} remaining)`);
    }
}
```

---

## 🎯 BEST PRACTICES

### **1. Use Toasts for Success Messages**
```javascript
// ✅ Good
showSuccess('Saved successfully!');

// ❌ Avoid (requires user click for simple success)
showSuccessModal('Saved successfully!');
```

### **2. Use Modals for Errors Requiring Attention**
```javascript
// ✅ Good (validation errors need to be read)
showError('Invalid Data', validationErrors);

// ❌ Avoid (toast might be missed)
showErrorToast('Validation failed');
```

### **3. Always Provide Context**
```javascript
// ✅ Good
showError('Failed to save customer', 'Email already exists in the system');

// ❌ Vague
showError('Error', 'Something went wrong');
```

### **4. Use Loading for Async Operations**
```javascript
// ✅ Good
showLoading('Saving...');
await apiCall();
closeLoading();

// ❌ No feedback
await apiCall(); // User doesn't know what's happening
```

### **5. Keep Messages Concise**
```javascript
// ✅ Good
showSuccess('Appointment created!');

// ❌ Too long
showSuccess('Your appointment has been successfully created in the system and the customer will receive a confirmation email shortly');
```

---

## 🎨 CUSTOM STYLING

### **Override SweetAlert2 Styles**

```css
/* Add to your CSS file */
.swal2-popup {
    border-radius: 12px !important;
    border: 1px solid #2a3142 !important;
}

.swal2-confirm {
    background: linear-gradient(135deg, #d4af37, #cd7f32) !important;
}
```

### **Custom Toast Position**

```javascript
Toastify({
    text: "Message",
    position: "center", // or "left", "right", "center"
    gravity: "bottom",  // or "top", "bottom"
    // ... other options
}).showToast();
```

---

## 📦 CDN LINKS

Already added to all admin pages:

```html
<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- Toastify -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>

<!-- Notifications Utility -->
<script src="../js/notifications.js"></script>
```

---

## 🔧 TROUBLESHOOTING

### **Toasts not showing?**
- Check if Toastify CSS and JS are loaded
- Ensure `notifications.js` is loaded after Toastify

### **Modals not themed?**
- Check if `notifications.js` is loaded before your page scripts
- Custom styles are applied automatically when `notifications.js` loads

### **Functions undefined?**
- Ensure `notifications.js` is loaded: `<script src="../js/notifications.js"></script>`
- Check browser console for loading errors

---

## 📊 COMPARISON

| Feature | Before (alert) | After (Notifications) |
|---------|---------------|----------------------|
| **Success Messages** | ❌ Ugly browser alert | ✅ Beautiful green toast |
| **Error Messages** | ❌ Blocking alert | ✅ Themed modal with details |
| **Confirmations** | ❌ Basic OK/Cancel | ✅ Styled buttons with icons |
| **Loading** | ❌ No feedback | ✅ Professional spinner |
| **Theme Match** | ❌ Browser default | ✅ Dark/gold theme |
| **User Experience** | ⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ COMPLETED PAGES

| Page | Toasts | Modals | Confirmations | Status |
|------|--------|--------|---------------|--------|
| customers.html | ✅ | ✅ | ✅ | Complete |
| services.html | ✅ | ✅ | ✅ | Complete |
| package.html | ✅ | ✅ | ✅ | Complete |
| staff.html | ✅ | ✅ | ✅ | Complete |
| appointments.html | ✅ | ✅ | ✅ | Libraries Added |
| inventory.html | ✅ | ✅ | ✅ | Libraries Added |
| payments.html | ✅ | ✅ | ✅ | Libraries Added |
| incentives.html | ✅ | ✅ | ✅ | Libraries Added |

---

**END OF NOTIFICATION SYSTEM GUIDE**
