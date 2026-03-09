/* =============================================
   ADMIN SETTINGS MANAGEMENT
   Handle salon configuration and settings
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupSettingsListeners();
});

// Load settings
function loadSettings() {
    // Mock salon settings
    const settings = {
        business: {
            name: "Elite Salon",
            phone: "(555) 123-4567",
            email: "info@elitesalon.com",
            website: "www.elitesalon.com",
            gst: "22AAAAA0000A1Z5",
            tax: "TAX-2024-001",
            address: "123 Beauty Avenue, Suite 100",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA",
            description: "Premier hair and beauty salon offering world-class services since 2018."
        },
        profile: {
            firstName: "Admin",
            lastName: "User",
            email: "admin@elitesalon.com",
            phone: "(555) 000-0001",
            role: "Administrator",
            language: "English",
            timezone: "EST"
        },
        payment: {
            currency: "USD",
            taxRate: 10,
            gstRate: 18,
            invoicePrefix: "INV-",
            invoiceStart: 1001,
            paymentTerms: "net_15"
        }
    };
    
    populateBusinessSettings(settings.business);
    populateProfileSettings(settings.profile);
    populatePaymentSettings(settings.payment);
    populateHoursSettings();
    populateNotificationSettings();
}

// Populate business settings
function populateBusinessSettings(data) {
    const fields = {
        'bizName': data.name,
        'bizPhone': data.phone,
        'bizEmail': data.email,
        'bizWeb': data.website,
        'bizGst': data.gst,
        'bizTax': data.tax,
        'bizAddr': data.address,
        'bizCity': data.city,
        'bizState': data.state,
        'bizZip': data.zip,
        'bizCountry': data.country,
        'bizDesc': data.description
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
}

// Populate profile settings
function populateProfileSettings(data) {
    const fields = {
        'pFname': data.firstName,
        'pLname': data.lastName,
        'pEmail': data.email,
        'pPhone': data.phone,
        'pRole': data.role,
        'pLang': data.language,
        'pTimezone': data.timezone
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT') {
                const option = Array.from(element.options).find(opt => opt.value === value || opt.text === value);
                if (option) option.selected = true;
            } else {
                element.value = value;
            }
        }
    }
}

// Populate payment settings
function populatePaymentSettings(data) {
    const fields = {
        'currency': data.currency,
        'taxRate': data.taxRate,
        'gstRate': data.gstRate,
        'invPrefix': data.invoicePrefix,
        'invStart': data.invoiceStart,
        'paymentTerms': data.paymentTerms
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT') {
                const option = Array.from(element.options).find(opt => opt.value === value);
                if (option) option.selected = true;
            } else {
                element.value = value;
            }
        }
    }
}

// Populate hours settings
function populateHoursSettings() {
    const hoursContainer = document.querySelector('.hours-table');
    if (!hoursContainer) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const defaultHours = {
        'Monday': { open: '09:00', close: '18:00', active: true },
        'Tuesday': { open: '09:00', close: '18:00', active: true },
        'Wednesday': { open: '09:00', close: '18:00', active: true },
        'Thursday': { open: '09:00', close: '18:00', active: true },
        'Friday': { open: '09:00', close: '18:00', active: true },
        'Saturday': { open: '10:00', close: '16:00', active: true },
        'Sunday': { open: '10:00', close: '14:00', active: false }
    };
    
    let html = '';
    days.forEach(day => {
        const hours = defaultHours[day];
        html += `
            <div class="hours-row">
                <span class="day-name">${day}</span>
                <input type="time" value="${hours.open}" ${!hours.active ? 'disabled' : ''}>
                <input type="time" value="${hours.close}" ${!hours.active ? 'disabled' : ''}>
                <label class="toggle">
                    <input type="checkbox" ${hours.active ? 'checked' : ''} onchange="toggleDay(this, '${day}')">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    });
    
    hoursContainer.innerHTML = html;
}

// Populate notification settings
function populateNotificationSettings() {
    const container = document.getElementById('notifList');
    if (!container) return;
    
    const notifications = [
        { id: 'email', title: 'Email Notifications', desc: 'Receive appointment reminders via email', enabled: true },
        { id: 'sms', title: 'SMS Notifications', desc: 'Receive appointment reminders via text', enabled: true },
        { id: 'stock', title: 'Low Stock Alerts', desc: 'Get notified when inventory is low', enabled: true },
        { id: 'appointment', title: 'New Appointment Alerts', desc: 'Get notified when new appointments are booked', enabled: true },
        { id: 'feedback', title: 'Customer Feedback', desc: 'Get notified when customers leave feedback', enabled: false }
    ];
    
    let html = '';
    notifications.forEach(notif => {
        html += `
            <div class="notification-row">
                <div class="notif-info">
                    <h4>${notif.title}</h4>
                    <p>${notif.desc}</p>
                </div>
                <label class="toggle">
                    <input type="checkbox" ${notif.enabled ? 'checked' : ''} data-notification="${notif.id}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Setup settings listeners
function setupSettingsListeners() {
    // Panel navigation
    const navLinks = document.querySelectorAll('.settings-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const panel = link.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (panel) showPanel(panel, link);
        });
    });
    
    // Save buttons
    const saveButtons = document.querySelectorAll('[onclick^="save("]');
    saveButtons.forEach(btn => {
        const match = btn.getAttribute('onclick')?.match(/'([^']+)'/);
        if (match) {
            const section = match[1];
            btn.addEventListener('click', () => save(section));
        }
    });
    
    // Danger zone actions
    const dangerButtons = document.querySelectorAll('[onclick^="confirmDanger("]');
    dangerButtons.forEach(btn => {
        const match = btn.getAttribute('onclick')?.match(/'([^']+)'/);
        if (match) {
            const action = match[1];
            btn.addEventListener('click', () => confirmDanger(action));
        }
    });
}

// Show panel
function showPanel(panel, element) {
    // Update active nav link
    document.querySelectorAll('.settings-nav a').forEach(a => a.classList.remove('active'));
    element.classList.add('active');
    
    // Show selected panel
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + panel)?.classList.add('active');
}

// Toggle day hours
function toggleDay(checkbox, day) {
    const row = checkbox.closest('.hours-row');
    const inputs = row.querySelectorAll('input[type="time"]');
    
    inputs.forEach(input => {
        input.disabled = !checkbox.checked;
    });
}

// Save settings
function save(section) {
    // Show saved badge
    const badge = document.getElementById('savedBadge');
    if (badge) {
        badge.classList.add('show');
        setTimeout(() => badge.classList.remove('show'), 2000);
    }
    
    showToast(section.charAt(0).toUpperCase() + section.slice(1) + ' settings saved!');
}

// Change password
function changePass() {
    const cur = document.getElementById('curPass')?.value;
    const newp = document.getElementById('newPass')?.value;
    const conf = document.getElementById('confPass')?.value;
    
    const errors = [];
    
    if (!cur) errors.push('Current password is required');
    if (!newp) errors.push('New password is required');
    if (!conf) errors.push('Please confirm new password');
    
    if (newp !== conf) errors.push('New passwords do not match');
    
    const passError = Validators.password(newp);
    if (passError) errors.push(passError);
    
    if (errors.length > 0) {
        document.getElementById('passError').innerHTML = errors.join('<br>');
        return;
    }
    
    document.getElementById('passError').innerHTML = '';
    showToast('Password updated successfully!');
    
    // Clear form
    document.getElementById('curPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confPass').value = '';
}

// Confirm danger action
function confirmDanger(action) {
    const actionName = action.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    if (confirm(`Are you sure you want to ${actionName}? This action cannot be undone.`)) {
        showToast('Action completed!');
    }
}

// Export data
function exportData() {
    showToast('Data export started...');
    
    // In a real app, this would trigger a download
    setTimeout(() => {
        showToast('Data exported successfully!');
    }, 2000);
}

// Export functions
window.showPanel = showPanel;
window.toggleDay = toggleDay;
window.save = save;
window.changePass = changePass;
window.confirmDanger = confirmDanger;
window.exportData = exportData;