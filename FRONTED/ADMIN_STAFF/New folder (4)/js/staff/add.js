/* =============================================
   ADD STAFF FORM HANDLING
   Handle new staff registration
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    setupFormListeners();
});

// Setup form listeners
function setupFormListeners() {
    const form = document.getElementById('addStaffForm');
    if (form) {
        form.addEventListener('submit', submitForm);
    }
    
    // Set default dates
    const joiningInput = document.getElementById('sJoining');
    if (joiningInput) {
        joiningInput.value = new Date().toISOString().split('T')[0];
    }
}

// Submit form
async function submitForm(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        salon_id: parseInt(document.getElementById('sSalonId')?.value),
        username: document.getElementById('sName')?.value,
        name: document.getElementById('sName')?.value,
        role: USER_ROLES.STAFF,
        email: document.getElementById('sEmail')?.value,
        phone: document.getElementById('sPhone')?.value,
        password: generateTempPassword(),
        status: STATUS.ACTIVE,
        
        // Additional staff info
        gender: document.getElementById('sGender')?.value,
        dob: document.getElementById('sDob')?.value,
        experience: parseInt(document.getElementById('sExp')?.value) || 0,
        salary: parseFloat(document.getElementById('sSalary')?.value) || 0,
        employment_type: document.getElementById('sEmpType')?.value,
        joining_date: document.getElementById('sJoining')?.value,
        availability: document.getElementById('sAvail')?.value,
        emergency_contact: document.getElementById('sEmergency')?.value,
        address: document.getElementById('sAddress')?.value
    };
    
    // Validate form
    const errors = [];
    
    if (!formData.salon_id) errors.push('Salon ID is required');
    if (!formData.username) errors.push('Staff name is required');
    if (!formData.email) errors.push('Email is required');
    else {
        const emailError = Validators.email(formData.email);
        if (emailError) errors.push(emailError);
    }
    
    if (!formData.phone) errors.push('Phone is required');
    else {
        const phoneError = Validators.phone(formData.phone);
        if (phoneError) errors.push(phoneError);
    }
    
    if (formData.dob) {
        const dobError = Validators.date(formData.dob);
        if (dobError) errors.push(dobError);
    }
    
    if (errors.length > 0) {
        errors.forEach(error => showToast(error, 'error'));
        return;
    }
    
    // Submit to API
    try {
        const result = await StaffAPI.createStaff(formData);
        
        if (result.success) {
            showToast('Staff member added successfully!');
            setTimeout(() => {
                window.location.href = 'staff.html';
            }, 1500);
        } else {
            showToast(result.message || 'Failed to add staff', 'error');
        }
    } catch (error) {
        showToast('An error occurred: ' + error.message, 'error');
    }
}

// Generate temporary password
function generateTempPassword() {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password + "@1A"; // Ensure it meets password requirements
}

// Export functions
window.submitForm = submitForm;