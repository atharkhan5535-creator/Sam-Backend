/* =============================================
   ADMIN PORTAL - MAIN JAVASCRIPT
   Handles navigation, common admin functions
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!TokenManager.isAuthenticated()) {
        // Use relative path to avoid hardcoded URL issues
        // Redirect to parent directory where login.html is located
        window.location.href = '../login.html';
        return;
    }

    // Check role
    const user = TokenManager.getUser();
    if (user && user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.SUPER_ADMIN) {
        window.location.href = '../staff/dashboard.html';
        return;
    }

    // Load admin data
    loadAdminData();

    // Load dashboard stats
    loadDashboardStats();

    // Setup event listeners
    setupEventListeners();
});

// Load admin data
async function loadAdminData() {
    try {
        const user = TokenManager.getUser();
        if (!user) return;
        
        // Get salon details if admin
        if (user.role === USER_ROLES.ADMIN && user.salon_id) {
            const result = await SuperAdminAPI.getSalonDetails(user.salon_id);
            if (result.success) {
                updateAdminUI(result.data);
            }
        }
        
        // Update user info
        updateUserUI(user);
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    const user = TokenManager.getUser();
    if (!user) return;
    
    try {
        // Load appointments count
        const appointmentsResult = await AppointmentAPI.getAppointments({ limit: 1 });
        if (appointmentsResult.success) {
            updateStat('totalAppointments', appointmentsResult.data.pagination?.total || 0);
        }
        
        // Load customers count
        const customersResult = await CustomerAPI.getCustomers({ limit: 1 });
        if (customersResult.success) {
            updateStat('totalCustomers', customersResult.data.pagination?.total || 0);
        }
        
        // Load staff count
        const staffResult = await StaffAPI.getStaffList({ limit: 1 });
        if (staffResult.success) {
            updateStat('totalStaff', staffResult.data.pagination?.total || 0);
        }
        
        // Load services count
        const servicesResult = await ServiceAPI.getServices({ limit: 1 });
        if (servicesResult.success) {
            updateStat('totalServices', servicesResult.data.pagination?.total || 0);
        }
        
        // Load packages count
        const packagesResult = await PackageAPI.getPackages({ limit: 1 });
        if (packagesResult.success) {
            updateStat('totalPackages', packagesResult.data.pagination?.total || 0);
        }
        
        // Load today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = await AppointmentAPI.getAppointments({ 
            from_date: today,
            to_date: today
        });
        if (todayAppointments.success) {
            updateStat('todayAppointments', todayAppointments.data.pagination?.total || 0);
        }
        
        // Load pending appointments
        const pendingAppointments = await AppointmentAPI.getAppointments({ 
            status: STATUS.PENDING
        });
        if (pendingAppointments.success) {
            updateStat('pendingAppointments', pendingAppointments.data.pagination?.total || 0);
        }
        
        // Load revenue
        const revenueResult = await ReportAPI.getSalesReport({
            from_date: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
            to_date: new Date().toISOString().split('T')[0]
        });
        if (revenueResult.success) {
            updateStat('monthlyRevenue', revenueResult.data.total_received || 0);
        }
        
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Update UI with admin data
function updateAdminUI(salonData) {
    document.querySelectorAll('[data-salon-name]').forEach(el => {
        el.textContent = salonData.salon_name;
    });
    
    document.querySelectorAll('[data-salon-owner]').forEach(el => {
        el.textContent = salonData.salon_ownername;
    });
    
    document.querySelectorAll('[data-salon-phone]').forEach(el => {
        el.textContent = salonData.phone;
    });
    
    document.querySelectorAll('[data-salon-email]').forEach(el => {
        el.textContent = salonData.email;
    });
    
    document.querySelectorAll('[data-salon-gst]').forEach(el => {
        el.textContent = salonData.gst_num;
    });
    
    document.querySelectorAll('[data-salon-address]').forEach(el => {
        el.textContent = `${salonData.address}, ${salonData.city}, ${salonData.state}, ${salonData.country}`;
    });
}

// Update user UI
function updateUserUI(user) {
    document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = user.username || user.name || 'Admin';
    });
    
    document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = user.email;
    });
    
    document.querySelectorAll('[data-user-role]').forEach(el => {
        el.textContent = user.role;
    });
}

// Update stat element
function updateStat(statId, value) {
    const element = document.getElementById(statId);
    if (!element) return;
    
    if (typeof value === 'number') {
        if (statId.includes('Revenue') || statId.includes('revenue')) {
            element.textContent = formatDisplayCurrency(value);
        } else {
            element.textContent = value.toLocaleString();
        }
    } else {
        element.textContent = value;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Date range pickers
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', handleDateChange);
    });
    
    // Export buttons
    const exportBtns = document.querySelectorAll('[data-export]');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', handleExport);
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    
    hamburger.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('open');
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();

    await AuthAPI.logout();
    TokenManager.removeToken();
    TokenManager.removeUser();
    localStorage.removeItem('refresh_token');
    // Use relative path to avoid hardcoded URL issues
    window.location.href = 'index.html';
}

// Handle date change
function handleDateChange(e) {
    const fromDate = document.getElementById('fromDate')?.value;
    const toDate = document.getElementById('toDate')?.value;
    const reportType = document.getElementById('reportType')?.value;
    
    if (fromDate && toDate && reportType) {
        generateReport(reportType, fromDate, toDate);
    }
}

// Handle export
function handleExport(e) {
    const exportType = e.target.getAttribute('data-export');
    const dataType = e.target.getAttribute('data-type');
    const format = e.target.getAttribute('data-format') || 'csv';
    
    exportData(exportType, dataType, format);
}

// Generate report
async function generateReport(type, fromDate, toDate) {
    showLoading('reportContainer');
    
    try {
        let result;
        switch(type) {
            case 'sales':
                result = await ReportAPI.getSalesReport({ from_date: fromDate, to_date: toDate });
                break;
            case 'appointments':
                result = await ReportAPI.getAppointmentReport({ from_date: fromDate, to_date: toDate });
                break;
            case 'staff':
                result = await ReportAPI.getStaffPerformanceReport({ from_date: fromDate, to_date: toDate });
                break;
            case 'services':
                result = await ReportAPI.getServiceRevenueReport({ from_date: fromDate, to_date: toDate });
                break;
            case 'packages':
                result = await ReportAPI.getPackageRevenueReport({ from_date: fromDate, to_date: toDate });
                break;
            case 'customers':
                result = await ReportAPI.getCustomerVisitReport({ from_date: fromDate, to_date: toDate });
                break;
            default:
                hideLoading('reportContainer');
                return;
        }
        
        if (result.success) {
            renderReport(type, result.data);
        } else {
            showError('reportContainer', result.message);
        }
    } catch (error) {
        showError('reportContainer', error.message);
    }
    
    hideLoading('reportContainer');
}

// Render report
function renderReport(type, data) {
    const container = document.getElementById('reportContainer');
    if (!container) return;
    
    // Implementation depends on report type and UI
    console.log('Render report:', type, data);
}

// Export data
async function exportData(exportType, dataType, format) {
    showToast(`Exporting ${dataType} as ${format.toUpperCase()}...`, 'info');
    
    try {
        let data;
        switch(dataType) {
            case 'appointments':
                const result = await AppointmentAPI.getAppointments({ limit: 1000 });
                if (result.success) data = result.data.items;
                break;
            case 'customers':
                const custResult = await CustomerAPI.getCustomers({ limit: 1000 });
                if (custResult.success) data = custResult.data.items;
                break;
            case 'staff':
                const staffResult = await StaffAPI.getStaffList({ limit: 1000 });
                if (staffResult.success) data = staffResult.data.items;
                break;
            case 'services':
                const svcResult = await ServiceAPI.getServices({ limit: 1000 });
                if (svcResult.success) data = svcResult.data.items;
                break;
            case 'packages':
                const pkgResult = await PackageAPI.getPackages({ limit: 1000, include: 'services' });
                if (pkgResult.success) data = pkgResult.data.items;
                break;
        }
        
        if (data && data.length) {
            if (format === 'csv') {
                exportToCSV(data, `${dataType}_export.csv`);
            } else if (format === 'pdf') {
                // PDF export logic
                showToast('PDF export coming soon!', 'info');
            }
        } else {
            showToast('No data to export', 'warning');
        }
    } catch (error) {
        showToast('Export failed: ' + error.message, 'error');
    }
}

// Quick actions
window.quickAction = {
    newAppointment: () => {
        window.location.href = 'appointments.html?action=new';
    },
    
    newCustomer: () => {
        window.location.href = 'customers.html?action=add';
    },
    
    newStaff: () => {
        window.location.href = 'staff.html?action=add';
    },
    
    newService: () => {
        window.location.href = 'services.html?action=add';
    },
    
    newPackage: () => {
        window.location.href = 'package.html?action=add';
    },
    
    newProduct: () => {
        window.location.href = 'inventory.html?action=add';
    }
};

// Export functions
window.generateReport = generateReport;
window.exportData = exportData;