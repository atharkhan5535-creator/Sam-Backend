/* =============================================
   ADMIN PORTAL - MAIN JAVASCRIPT
   Handles navigation, common admin functions
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!TokenManager.isAuthenticated()) {
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

        if (user.role === USER_ROLES.ADMIN && user.salon_id) {
            const result = await SuperAdminAPI.getSalonDetails(user.salon_id);
            if (result.success) {
                updateAdminUI(result.data);
            }
        }

        updateUserUI(user);
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

// Load dashboard statistics - NEW API
async function loadDashboardStats() {
    const user = TokenManager.getUser();
    if (!user) return;

    try {
        const period = document.getElementById('periodSelect')?.value || 'month';
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;

        // Build query params
        let queryParams = `?period=${period}`;
        if (startDate) queryParams += `&start_date=${startDate}`;
        if (endDate) queryParams += `&end_date=${endDate}`;

        // Fetch from new dashboard stats API
        const result = await apiRequest(`/dashboard/stats${queryParams}`, { method: 'GET' });

        if (result.status === 'success' && result.data.cards) {
            const cards = result.data.cards;
            
            // Update Revenue Card
            updateStatCard('revenue', cards.revenue);
            
            // Update Appointments Card
            updateStatCard('appointments', cards.appointments);
            
            // Update Customers Card
            updateStatCard('customers', cards.customers);
            
            // Update Staff Card
            updateStatCard('staff', cards.staff);
            
            // Update Services Card
            updateStatCard('services', cards.services);
            
            // Update Packages Card
            updateStatCard('packages', cards.packages);
            
            // Update Completion Rate Card
            updateStatCard('completion_rate', cards.completion_rate);
            
            // Update Pending Actions Card
            updateStatCard('pending', cards.pending);
        }

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Update individual stat card
function updateStatCard(cardType, data) {
    if (!data) return;

    const prefix = cardType === 'completion_rate' ? 'completion' : cardType;
    
    // Update value
    const valueEl = document.getElementById(`${prefix}Value`);
    if (valueEl) {
        valueEl.textContent = data.formatted || data.value;
    }

    // Update trend badge
    const trendEl = document.getElementById(`${prefix}Trend`);
    if (trendEl && data.trend !== undefined) {
        updateTrendBadge(trendEl, data.trend);
    }

    // Update sublabel
    const sublabelEl = document.getElementById(`${prefix}Sublabel`);
    if (sublabelEl && data.sublabel) {
        sublabelEl.textContent = data.sublabel;
    }

    // Update footer/breakdown based on card type
    updateCardFooter(cardType, data);
}

// Update card footer with specific breakdown info
function updateCardFooter(cardType, data) {
    switch(cardType) {
        case 'appointments':
            const apptBreakdown = document.getElementById('apptBreakdown');
            if (apptBreakdown && data.breakdown) {
                apptBreakdown.textContent = `${data.breakdown.COMPLETED || 0} completed • ${data.breakdown.CONFIRMED || 0} confirmed`;
            }
            break;
            
        case 'customers':
            const newCustomersLabel = document.getElementById('newCustomersLabel');
            if (newCustomersLabel && data.new_customers !== undefined) {
                newCustomersLabel.textContent = `+${data.new_customers} new this period`;
            }
            break;
            
        case 'staff':
            const staffBreakdown = document.getElementById('staffBreakdown');
            if (staffBreakdown && data.on_leave !== undefined) {
                staffBreakdown.textContent = `${data.on_leave} on leave • ${data.busy} busy`;
            }
            break;
            
        case 'services':
            const servicesBreakdown = document.getElementById('servicesBreakdown');
            if (servicesBreakdown && data.total_bookings !== undefined) {
                servicesBreakdown.textContent = `${data.total_bookings} bookings • ${data.booked_count} unique`;
            }
            break;
            
        case 'packages':
            const packagesBreakdown = document.getElementById('packagesBreakdown');
            if (packagesBreakdown && data.sold_count !== undefined) {
                packagesBreakdown.textContent = `${data.sold_count} sold • ₹${(data.revenue || 0).toLocaleString()}`;
            }
            break;
            
        case 'completion_rate':
            const completionBreakdown = document.getElementById('completionBreakdown');
            if (completionBreakdown && data.cancelled !== undefined) {
                completionBreakdown.textContent = `${data.completed}/${data.total} completed • ${data.cancelled} cancelled • ${data.no_show || 0} no-show`;
            }
            break;
            
        case 'pending':
            const pendingBreakdown = document.getElementById('pendingBreakdown');
            if (pendingBreakdown && data.breakdown) {
                pendingBreakdown.textContent = `${data.breakdown.appointments || 0} appts • ${data.breakdown.incentives || 0} incentives • ${data.breakdown.low_stock || 0} low stock`;
            }
            break;
    }
}

// Update trend badge
function updateTrendBadge(element, trendValue) {
    if (!element) return;
    
    const trend = parseFloat(trendValue) || 0;
    element.className = 'trend-badge';
    
    // Get the card type to determine if up is good or bad
    const card = element.closest('.stat-card');
    const cardType = card?.getAttribute('data-card');
    
    // For pending actions, higher is worse
    // For revenue, customers, etc., higher is better
    const isInverted = cardType === 'pending';
    
    if (trend > 0) {
        if (isInverted) {
            element.classList.add('down');
            element.innerHTML = `<i class="fas fa-arrow-up"></i><span>+${Math.abs(trend)}%</span>`;
        } else {
            element.classList.add('up');
            element.innerHTML = `<i class="fas fa-arrow-up"></i><span>+${Math.abs(trend)}%</span>`;
        }
    } else if (trend < 0) {
        if (isInverted) {
            element.classList.add('up');
            element.innerHTML = `<i class="fas fa-arrow-down"></i><span>${Math.abs(trend)}%</span>`;
        } else {
            element.classList.add('down');
            element.innerHTML = `<i class="fas fa-arrow-down"></i><span>${Math.abs(trend)}%</span>`;
        }
    } else {
        element.classList.add('stable');
        element.innerHTML = `<i class="fas fa-minus"></i><span>0%</span>`;
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