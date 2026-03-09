/* =============================================
   STAFF PROFILE MANAGEMENT
   View and edit profile information
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupProfileListeners();
});

// Load profile data
function loadProfileData() {
    const user = TokenManager.getUser();
    if (!user) return;
    
    // Mock staff profile data
    const profileData = {
        name: "Sarah Johnson",
        title: "Master Stylist",
        phone: "+91 9876543210",
        email: "sarah.j@elitesalon.com",
        specializations: "Cuts, Colors, Styling",
        experience: 15,
        employmentType: "Full-time",
        gender: "Female",
        bio: "Professional stylist with 15 years of experience specialising in precision cuts, balayage and bridal styling."
    };
    
    populateProfileForm(profileData);
}

// Populate profile form
function populateProfileForm(data) {
    const fields = {
        'pName': data.name,
        'pTitle': data.title,
        'pPhone': data.phone,
        'pEmail': data.email,
        'pSpec': data.specializations,
        'pExp': data.experience,
        'pEmpType': data.employmentType,
        'pGender': data.gender,
        'pBio': data.bio
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT') {
                // Find and select the option
                const option = Array.from(element.options).find(opt => opt.text === value);
                if (option) option.selected = true;
            } else {
                element.value = value;
            }
        }
    }
}

// Setup profile listeners
function setupProfileListeners() {
    const saveBtn = document.querySelector('[onclick="saveProfile()"]');
    const resetBtn = document.querySelector('[onclick="resetProfile()"]');
    const changePassBtn = document.querySelector('[onclick="changePassword()"]');
    
    if (saveBtn) saveBtn.addEventListener('click', saveProfile);
    if (resetBtn) resetBtn.addEventListener('click', resetProfile);
    if (changePassBtn) changePassBtn.addEventListener('click', changePassword);
}

// Save profile
async function saveProfile() {
    const formData = {
        name: document.getElementById('pName')?.value,
        title: document.getElementById('pTitle')?.value,
        phone: document.getElementById('pPhone')?.value,
        email: document.getElementById('pEmail')?.value,
        specializations: document.getElementById('pSpec')?.value,
        experience: parseInt(document.getElementById('pExp')?.value) || 0,
        employmentType: document.getElementById('pEmpType')?.value,
        gender: document.getElementById('pGender')?.value,
        bio: document.getElementById('pBio')?.value
    };
    
    // Validation
    const errors = [];
    if (!formData.name) errors.push('Name is required');
    if (!formData.phone) errors.push('Phone is required');
    
    const phoneError = Validators.phone(formData.phone);
    if (phoneError) errors.push(phoneError);
    
    if (formData.email) {
        const emailError = Validators.email(formData.email);
        if (emailError) errors.push(emailError);
    }
    
    if (errors.length > 0) {
        errors.forEach(error => showToast(error, 'error'));
        return;
    }
    
    // Save to API
    showToast('Profile updated successfully!');
}

// Reset profile form
function resetProfile() {
    loadProfileData();
    showToast('Form reset to original values');
}

// Change password
function changePassword() {
    const current = document.getElementById('pCurrent')?.value;
    const newPass = document.getElementById('pNew')?.value;
    const confirm = document.getElementById('pConfirm')?.value;

    // Validation
    const errors = [];
    if (!current) errors.push('Current password is required');
    if (!newPass) errors.push('New password is required');
    if (!confirm) errors.push('Please confirm new password');
    
    if (newPass !== confirm) errors.push('New passwords do not match');
    
    const passError = Validators.password(newPass);
    if (passError) errors.push(passError);
    
    if (errors.length > 0) {
        errors.forEach(error => showToast(error, 'error'));
        return;
    }

    // Change password via API
    showToast('Password updated successfully!');
    
    // Clear form
    document.getElementById('pCurrent').value = '';
    document.getElementById('pNew').value = '';
    document.getElementById('pConfirm').value = '';
}

// Export functions
window.saveProfile = saveProfile;
window.resetProfile = resetProfile;
window.changePassword = changePassword;