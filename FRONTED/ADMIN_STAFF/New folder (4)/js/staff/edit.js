/* =============================================
   EDIT STAFF FORM HANDLING
   Handle staff profile updates
   ============================================= */

let staffId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get staff ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    staffId = urlParams.get('id') || 1; // Default to 1 for demo
    
    loadStaffData();
    setupFormListeners();
});

// Load staff data
async function loadStaffData() {
    try {
        // Mock staff data
        const staffData = {
            id: 1,
            salon_id: 1,
            name: "Sarah Johnson",
            role: "Master Stylist",
            phone: "+91 9876543210",
            email: "sarah.j@elitesalon.com",
            gender: "Female",
            dob: "1988-03-15",
            experience: 15,
            salary: 55000,
            employment_type: "Full-time",
            joining: "2018-06-01",
            availability: "Available",
            status: "Active",
            emergency: "555-999-0001",
            address: "45 Bloom St, NY"
        };
        
        populateForm(staffData);
    } catch (error) {
        showToast('Failed to load staff data', 'error');
    }
}

// Populate form with staff data
function populateForm(data) {
    const fields = {
        'eStaffId': data.id,
        'eName': data.name,
        'eRole': data.role,
        'ePhone': data.phone,
        'eEmail': data.email,
        'eGender': data.gender,
        'eDob': data.dob,
        'eExp': data.experience,
        'eSalary': data.salary,
        'eEmpType': data.employment_type,
        'eJoining': data.joining,
        'eAvail': data.availability,
        'eStatus': data.status,
        'eEmergency': data.emergency,
        'eAddress': data.address
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT') {
                // Find and select the option
                const option = Array.from(element.options).find(opt => 
                    opt.text === value || opt.value === value
                );
                if (option) option.selected = true;
            } else {
                element.value = value;
            }
        }
    }
}

// Setup form listeners
function setupFormListeners() {
    const form = document.getElementById('editStaffForm');
    if (form) {
        form.addEventListener('submit', updateStaff);
    }
}

// Update staff
async function updateStaff(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        name: document.getElementById('eName')?.value,
        role: document.getElementById('eRole')?.value,
        phone: document.getElementById('ePhone')?.value,
        email: document.getElementById('eEmail')?.value,
        gender: document.getElementById('eGender')?.value,
        dob: document.getElementById('eDob')?.value,
        experience: parseInt(document.getElementById('eExp')?.value) || 0,
        salary: parseFloat(document.getElementById('eSalary')?.value) || 0,
        employment_type: document.getElementById('eEmpType')?.value,
        joining: document.getElementById('eJoining')?.value,
        availability: document.getElementById('eAvail')?.value,
        status: document.getElementById('eStatus')?.value,
        emergency_contact: document.getElementById('eEmergency')?.value,
        address: document.getElementById('eAddress')?.value
    };
    
    // Validate form
    const errors = [];
    
    if (!formData.name) errors.push('Name is required');
    if (!formData.role) errors.push('Role is required');
    
    if (!formData.phone) errors.push('Phone is required');
    else {
        const phoneError = Validators.phone(formData.phone);
        if (phoneError) errors.push(phoneError);
    }
    
    if (!formData.email) errors.push('Email is required');
    else {
        const emailError = Validators.email(formData.email);
        if (emailError) errors.push(emailError);
    }
    
    if (formData.dob) {
        const dobError = Validators.date(formData.dob);
        if (dobError) errors.push(dobError);
    }
    
    if (formData.joining) {
        const joinError = Validators.date(formData.joining);
        if (joinError) errors.push(joinError);
    }
    
    if (errors.length > 0) {
        errors.forEach(error => showToast(error, 'error'));
        return;
    }
    
    // Submit to API
    try {
        const result = await StaffAPI.updateStaff(staffId, formData);
        
        if (result.success) {
            showToast('Staff member updated successfully!');
            setTimeout(() => {
                window.location.href = 'staff.html';
            }, 1500);
        } else {
            showToast(result.message || 'Failed to update staff', 'error');
        }
    } catch (error) {
        showToast('An error occurred: ' + error.message, 'error');
    }
}

// Export functions
window.updateStaff = updateStaff;