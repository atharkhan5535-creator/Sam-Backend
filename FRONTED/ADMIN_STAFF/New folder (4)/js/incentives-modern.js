/* ==========================================================================
   INCENTIVES - MODERN REDESIGN JAVASCRIPT
   Complete functionality for redesigned UI
   ========================================================================== */

// Global State
let staffIncentiveSummary = [];
let staffList = [];
let allIncentives = [];
let selectedIncentives = [];
let unpaidIncentivesData = [];
let currentIncentiveHistory = [];
let currentStaffId = null;
let currentStaffName = null;

// Wizard State
let currentWizardStep = 1;
let selectedIncentiveType = null;
let selectedCalcMethod = 'FIXED';

// Payment State
let selectedPaymentMethod = null;

// Filter State
let currentFilter = {
    fromDate: '',
    toDate: '',
    staffId: '',
    type: '',
    search: ''
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    // Update user info in sidebar
    const user = TokenManager.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username || user.name || 'User';
        document.getElementById('userRole').textContent = user.role || 'User';
        document.getElementById('userAvatar').textContent = (user.username || user.name || 'U')[0].toUpperCase();
    }
    
    // Set default dates
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('filterFromDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filterToDate').value = today.toISOString().split('T')[0];
    
    // Load data
    loadData();
});

/* ==========================================================================
   DATA LOADING
   ========================================================================== */
async function loadData() {
    try {
        showLoading(true);

        // Load staff list
        const staffResult = await StaffAPI.list();
        if (!staffResult.success) {
            throw new Error('Failed to load staff');
        }

        staffList = staffResult.data?.items || [];
        populateStaffDropdowns();

        // Load all incentives from the new API endpoint
        const incentivesResult = await StaffAPI.listIncentives();
        if (!incentivesResult.success) {
            throw new Error('Failed to load incentives');
        }

        allIncentives = incentivesResult.data?.items || [];

        // Update dashboard stats
        updateDashboardStatsFromIncentives(allIncentives);

        // Render table
        renderIncentivesTable();

        showLoading(false);

    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load data: ' + error.message, 'error');
        showLoading(false);
    }
}

function showLoading(show) {
    // Could add a loading overlay here
    if (show) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}

/* ==========================================================================
   DASHBOARD STATS
   ========================================================================== */
function updateDashboardStatsFromIncentives(incentives) {
    // Calculate totals from individual incentives
    let totalCount = incentives.length;
    let totalAmount = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let pendingCount = 0;
    
    // Group by staff to find top performer
    const staffTotals = {};
    
    incentives.forEach(inc => {
        const amount = parseFloat(inc.incentive_amount) || 0;
        totalAmount += amount;
        
        if (inc.status === 'PAID') {
            totalPaid += amount;
        } else {
            totalOutstanding += amount;
            if (inc.status === 'PENDING') {
                pendingCount++;
            }
        }
        
        // Track per-staff totals
        if (!staffTotals[inc.staff_id]) {
            staffTotals[inc.staff_id] = { name: inc.staff_name, total: 0 };
        }
        staffTotals[inc.staff_id].total += amount;
    });
    
    // Find top performer
    let topPerformer = '-';
    let topAmount = 0;
    Object.values(staffTotals).forEach(staff => {
        if (staff.total > topAmount) {
            topAmount = staff.total;
            topPerformer = staff.name;
        }
    });

    // Update stat cards
    animateValue('statTotalCount', totalCount);
    animateValue('statTotalAmount', totalAmount, 'currency');
    animateValue('statPaidMonth', totalPaid, 'currency');
    animateValue('statOutstanding', totalOutstanding, 'currency');
    animateValue('statPending', pendingCount);
    document.getElementById('statTopPerformer').textContent = topPerformer;
}

function animateValue(elementId, value, type = 'number') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (type === 'currency') {
        element.textContent = '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
        element.textContent = value.toLocaleString('en-IN');
    }
}

/* ==========================================================================
   TABLE RENDERING
   ========================================================================== */
function renderIncentivesTable() {
    const tbody = document.getElementById('incentivesTableBody');

    // Apply filters
    const filtered = applyFiltersToData(allIncentives);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <div class="empty-state-modern">
                        <div class="empty-state-icon">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <h3 class="empty-state-title">No Incentives Found</h3>
                        <p class="empty-state-text">Try adjusting your filters or create a new incentive</p>
                    </div>
                </td>
            </tr>
        `;
        document.getElementById('resultsCount').textContent = 'No data';
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const typeIcons = {
            'SERVICE_COMMISSION': 'fa-coins',
            'BONUS': 'fa-gift',
            'TARGET_ACHIEVEMENT': 'fa-trophy'
        };

        const typeLabels = {
            'SERVICE_COMMISSION': 'Commission',
            'BONUS': 'Bonus',
            'TARGET_ACHIEVEMENT': 'Target'
        };

        const statusClass = {
            'PENDING': 'status-pending-modern',
            'APPROVED': 'status-approved-modern',
            'PAID': 'status-paid-modern'
        };

        const createdDate = new Date(item.created_at);
        const relativeTime = getRelativeTime(createdDate);
        const calcType = item.calculation_type || 'FIXED';

        return `
            <tr onclick="viewIncentiveDetails(${item.staff_id}, '${escapeHtml(item.staff_name)}')" style="cursor: pointer;">
                <td>
                    <input type="checkbox" class="row-checkbox" data-incentive-id="${item.incentive_id}"
                           onclick="event.stopPropagation();"
                           onchange="event.stopPropagation(); toggleRowSelection(this)" style="width: 16px; height: 16px; cursor: pointer;">
                </td>
                <td><strong style="color: var(--accent-gold);">#${item.incentive_id}</strong></td>
                <td>
                    <div class="staff-cell">
                        <div class="staff-avatar-modern">${getInitials(item.staff_name)}</div>
                        <div class="staff-info-modern">
                            <div class="staff-name-modern">${escapeHtml(item.staff_name)}</div>
                            ${item.staff_specialization ? `<div class="staff-specialization">${escapeHtml(item.staff_specialization)}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="type-badge-modern">
                        <i class="fas ${typeIcons[item.incentive_type] || 'fa-tag'}"></i>
                        ${typeLabels[item.incentive_type] || item.incentive_type}
                    </span>
                </td>
                <td>
                    <span class="calc-badge calc-badge-fixed">${calcType}</span>
                </td>
                <td>
                    <span class="amount-display">₹${(parseFloat(item.incentive_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </td>
                <td>
                    <span class="status-badge-modern ${statusClass[item.status] || 'status-pending-modern'}">
                        ${item.status || 'PENDING'}
                    </span>
                </td>
                <td style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${relativeTime}
                </td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn-modern" onclick="event.stopPropagation(); viewIncentiveDetails(${item.staff_id}, '${escapeHtml(item.staff_name)}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${item.status !== 'PAID' ? `
                        <button class="action-btn-modern success" onclick="event.stopPropagation(); showPayoutOption(${item.staff_id}, '${escapeHtml(item.staff_name)}', ${item.incentive_amount})" title="Pay">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('resultsCount').textContent = `Showing ${filtered.length} incentive(s)`;
}

function applyFiltersToData(data) {
    let filtered = [...data];

    if (currentFilter.fromDate) {
        filtered = filtered.filter(item => new Date(item.created_at) >= new Date(currentFilter.fromDate));
    }

    if (currentFilter.toDate) {
        filtered = filtered.filter(item => new Date(item.created_at) <= new Date(currentFilter.toDate));
    }

    if (currentFilter.staffId) {
        filtered = filtered.filter(item => item.staff_id == currentFilter.staffId);
    }

    if (currentFilter.type) {
        filtered = filtered.filter(item => item.incentive_type === currentFilter.type);
    }

    if (currentFilter.search) {
        const search = currentFilter.search.toLowerCase();
        filtered = filtered.filter(item =>
            item.staff_name.toLowerCase().includes(search)
        );
    }

    return filtered;
}

/* ==========================================================================
   FILTERS
   ========================================================================== */
async function applyFilters() {
    currentFilter.fromDate = document.getElementById('filterFromDate').value;
    currentFilter.toDate = document.getElementById('filterToDate').value;
    currentFilter.staffId = document.getElementById('filterStaff').value;
    currentFilter.type = document.getElementById('filterType').value;
    currentFilter.search = document.getElementById('filterSearch').value;

    // Reload data from API with filters
    try {
        const params = {};
        if (currentFilter.fromDate) params.start_date = currentFilter.fromDate;
        if (currentFilter.toDate) params.end_date = currentFilter.toDate;
        if (currentFilter.staffId) params.staff_id = currentFilter.staffId;
        if (currentFilter.type) params.type = currentFilter.type;

        const incentivesResult = await StaffAPI.listIncentives(params);
        if (!incentivesResult.success) {
            throw new Error('Failed to load filtered incentives');
        }

        allIncentives = incentivesResult.data?.items || [];
        updateDashboardStatsFromIncentives(allIncentives);
        renderIncentivesTable();

        showToast('Filters applied', 'success');
    } catch (error) {
        console.error('Error applying filters:', error);
        showToast('Failed to apply filters: ' + error.message, 'error');
    }
}

function clearFilters() {
    document.getElementById('filterFromDate').value = '';
    document.getElementById('filterToDate').value = '';
    document.getElementById('filterStaff').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterSearch').value = '';

    currentFilter = {
        fromDate: '',
        toDate: '',
        staffId: '',
        type: '',
        search: ''
    };

    loadData();
    showToast('Filters cleared', 'success');
}

/* ==========================================================================
   BULK ACTIONS
   ========================================================================== */
function toggleSelectAll() {
    const headerCheckbox = document.getElementById('selectAllHeader');
    const bodyCheckbox = document.getElementById('selectAllCheckbox');

    if (headerCheckbox && bodyCheckbox) {
        bodyCheckbox.checked = headerCheckbox.checked;
    }

    const checkboxes = document.querySelectorAll('.row-checkbox');
    const currentFilteredIds = allIncentives
        .filter(item => applyFiltersToData([item]).length > 0)
        .map(item => item.incentive_id);

    checkboxes.forEach(cb => {
        cb.checked = headerCheckbox.checked;
        if (headerCheckbox.checked) {
            const incentiveId = parseInt(cb.dataset.incentiveId);
            if (currentFilteredIds.includes(incentiveId) && !selectedIncentives.includes(incentiveId)) {
                selectedIncentives.push(incentiveId);
            }
        } else {
            const incentiveId = parseInt(cb.dataset.incentiveId);
            selectedIncentives = selectedIncentives.filter(id => id !== incentiveId);
        }
        toggleRowSelection(cb, false);
    });

    updateSelectedCount();
}

function toggleRowSelection(checkbox, updateSelection = true) {
    const row = checkbox.closest('tr');
    const incentiveId = parseInt(checkbox.dataset.incentiveId);

    if (checkbox.checked) {
        row.classList.add('selected');
        if (updateSelection && !selectedIncentives.includes(incentiveId)) {
            selectedIncentives.push(incentiveId);
        }
    } else {
        row.classList.remove('selected');
        if (updateSelection) {
            selectedIncentives = selectedIncentives.filter(id => id !== incentiveId);
        }
    }

    if (updateSelection) {
        updateSelectedCount();
    }
}

function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (selectedIncentives.length > 0) {
        countEl.style.display = 'block';
        countEl.querySelector('span').textContent = `${selectedIncentives.length} selected`;
    } else {
        countEl.style.display = 'none';
    }
}

function bulkPayout() {
    console.log('Bulk payout clicked');
    console.log('selectedIncentives:', selectedIncentives);
    console.log('allIncentives:', allIncentives);
    
    if (selectedIncentives.length === 0) {
        console.log('No incentives selected');
        showToast('Please select at least one incentive', 'error');
        return;
    }

    // Get all selected incentive records
    const selectedRecords = allIncentives.filter(inc => selectedIncentives.includes(inc.incentive_id));
    console.log('Selected records:', selectedRecords);

    if (selectedRecords.length === 0) {
        console.log('No valid incentives found');
        showToast('No valid incentives selected', 'error');
        return;
    }

    // Check if all selected incentives are from the same staff
    const staffIds = [...new Set(selectedRecords.map(inc => inc.staff_id))];
    console.log('Staff IDs:', staffIds);
    
    if (staffIds.length > 1) {
        const staffNames = [...new Set(selectedRecords.map(inc => inc.staff_name))];
        console.log('Multiple staff selected:', staffNames);
        showToast(`Please select incentives from only ONE staff member. You selected: ${staffNames.join(', ')}`, 'warning');
        return;
    }

    // Get the staff info
    const staffId = staffIds[0];
    const staffName = selectedRecords[0].staff_name;
    console.log('Staff ID:', staffId, 'Name:', staffName);

    // Open payout modal directly for selected incentives
    console.log('Opening payout modal...');
    openBulkPayoutModal(staffId, staffName, selectedRecords);
}

// Open bulk payout modal with selected incentives
function openBulkPayoutModal(staffId, staffName, selectedRecords) {
    currentStaffId = staffId;
    currentStaffName = staffName;
    
    // Calculate total amount
    const totalAmount = selectedRecords.reduce((sum, inc) => sum + parseFloat(inc.incentive_amount || 0), 0);

    // Set payout modal data
    document.getElementById('payoutStaffName').textContent = staffName;
    document.getElementById('payoutAmountDisplay').textContent = '₹' + totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('payoutDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('payoutTransactionRef').value = '';
    document.getElementById('payoutRemarks').value = '';
    
    // Reset payment method selection
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('submitPayoutBtn').disabled = true;
    
    // Store selected incentive IDs for payout
    window.selectedIncentivesForPayout = selectedIncentives;
    
    // Open payout modal directly
    document.getElementById('payoutModal').classList.add('open');
}

/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/['"&<>]/g, function(match) {
        return {
            "'": '&#39;',
            '"': '&quot;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        }[match];
    });
}

function populateStaffDropdowns() {
    const filterStaff = document.getElementById('filterStaff');
    const newIncentiveStaff = document.getElementById('newIncentiveStaff');
    
    const options = '<option value="">All Staff</option>' + 
        staffList.map(s => `<option value="${s.staff_id}">${escapeHtml(s.name)}</option>`).join('');
    
    if (filterStaff) filterStaff.innerHTML = options;
    
    if (newIncentiveStaff) {
        newIncentiveStaff.innerHTML = '<option value="">Choose a staff member...</option>' + 
            staffList.map(s => `<option value="${s.staff_id}">${escapeHtml(s.name)}</option>`).join('');
    }
}

/* ==========================================================================
   EXPORT
   ========================================================================== */
function exportToCSV() {
    if (allIncentives.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    const headers = ['Staff ID', 'Staff Name', 'Total Amount', 'Paid', 'Outstanding', 'Status'];
    const rows = allIncentives.map(item => [
        item.staff_id,
        item.staff_name,
        item.total_amount,
        item.total_paid,
        item.outstanding,
        item.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incentives_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully', 'success');
}

/* ==========================================================================
   MODAL MANAGEMENT
   ========================================================================== */
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
    
    // Reset wizard if closing create modal
    if (modalId === 'createIncentiveModal') {
        resetWizard();
    }
}

// Close modal when clicking overlay
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('open');
    }
};

/* ==========================================================================
   CREATE INCENTIVE WIZARD
   ========================================================================== */
function openCreateIncentiveModal() {
    if (staffList.length === 0) {
        showToast('No staff available. Please create staff first.', 'error');
        return;
    }
    
    resetWizard();
    document.getElementById('createIncentiveModal').classList.add('open');
}

function resetWizard() {
    currentWizardStep = 1;
    selectedIncentiveType = null;
    selectedCalcMethod = 'FIXED';
    
    // Reset form fields
    document.getElementById('newIncentiveStaff').value = '';
    document.getElementById('newFixedAmount').value = '';
    document.getElementById('newBaseAmount').value = '';
    document.getElementById('newPercentageRate').value = '';
    document.getElementById('newIncentiveRemarks').value = '';
    
    // Reset UI
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('calcPreview').textContent = '₹0.00';
    
    // Show step 1
    showWizardStep(1);
}

function showWizardStep(step) {
    document.getElementById('step1Content').style.display = step === 1 ? 'block' : 'none';
    document.getElementById('step2Content').style.display = step === 2 ? 'block' : 'none';
    document.getElementById('step3Content').style.display = step === 3 ? 'block' : 'none';
    
    document.getElementById('step1Indicator').classList.toggle('active', step >= 1);
    document.getElementById('step1Indicator').classList.toggle('completed', step > 1);
    document.getElementById('step2Indicator').classList.toggle('active', step >= 2);
    document.getElementById('step2Indicator').classList.toggle('completed', step > 2);
    document.getElementById('step3Indicator').classList.toggle('active', step >= 3);
    
    document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = step === 3 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = step === 3 ? 'block' : 'none';
    
    if (step === 3) {
        updateReviewSummary();
    }
}

function nextStep() {
    if (currentWizardStep === 1) {
        // Validate step 1
        const staffId = document.getElementById('newIncentiveStaff').value;
        if (!staffId) {
            showToast('Please select a staff member', 'error');
            return;
        }
        if (!selectedIncentiveType) {
            showToast('Please select an incentive type', 'error');
            return;
        }
        currentWizardStep = 2;
    } else if (currentWizardStep === 2) {
        // Validate step 2
        const amount = selectedCalcMethod === 'FIXED' 
            ? parseFloat(document.getElementById('newFixedAmount').value)
            : parseFloat(document.getElementById('newBaseAmount').value) * (parseFloat(document.getElementById('newPercentageRate').value) || 0) / 100;
        
        if (!amount || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        currentWizardStep = 3;
    }
    
    showWizardStep(currentWizardStep);
}

function previousStep() {
    if (currentWizardStep > 1) {
        currentWizardStep--;
        showWizardStep(currentWizardStep);
    }
}

function selectIncentiveType(type) {
    selectedIncentiveType = type;
    
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('type' + type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()).classList.add('selected');
}

function selectCalcMethod(method) {
    selectedCalcMethod = method;
    
    document.getElementById('calcFixedBtn').classList.toggle('selected', method === 'FIXED');
    document.getElementById('calcPercentageBtn').classList.toggle('selected', method === 'PERCENTAGE');
    
    document.getElementById('fixedAmountSection').style.display = method === 'FIXED' ? 'block' : 'none';
    document.getElementById('percentageAmountSection').style.display = method === 'PERCENTAGE' ? 'block' : 'none';
}

function calculatePreview() {
    let amount = 0;
    
    if (selectedCalcMethod === 'FIXED') {
        amount = parseFloat(document.getElementById('newFixedAmount').value) || 0;
    } else {
        const base = parseFloat(document.getElementById('newBaseAmount').value) || 0;
        const rate = parseFloat(document.getElementById('newPercentageRate').value) || 0;
        amount = base * rate / 100;
    }
    
    document.getElementById('calcPreview').textContent = '₹' + amount.toFixed(2);
}

function updateReviewSummary() {
    const staffSelect = document.getElementById('newIncentiveStaff');
    const staffName = staffSelect.options[staffSelect.selectedIndex]?.text || '-';
    
    document.getElementById('reviewStaff').textContent = staffName;
    document.getElementById('reviewType').textContent = selectedIncentiveType || '-';
    document.getElementById('reviewCalc').textContent = selectedCalcMethod;
    document.getElementById('reviewAmount').textContent = document.getElementById('calcPreview').textContent;
}

async function submitIncentive() {
    const staffId = parseInt(document.getElementById('newIncentiveStaff').value);
    const remarks = document.getElementById('newIncentiveRemarks').value.trim();
    
    let amount = 0;
    let percentageRate = null;
    let baseAmount = null;
    
    if (selectedCalcMethod === 'FIXED') {
        amount = parseFloat(document.getElementById('newFixedAmount').value) || 0;
    } else {
        baseAmount = parseFloat(document.getElementById('newBaseAmount').value) || 0;
        percentageRate = parseFloat(document.getElementById('newPercentageRate').value) || 0;
        amount = baseAmount * percentageRate / 100;
    }
    
    if (!staffId || !selectedIncentiveType || !amount) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const incentiveData = {
        staff_id: staffId,
        incentive_type: selectedIncentiveType,
        calculation_type: selectedCalcMethod,
        percentage_rate: percentageRate,
        base_amount: baseAmount,
        fixed_amount: amount,
        incentive_amount: amount,
        remarks: remarks,
        status: 'PENDING'
    };
    
    try {
        const result = await StaffAPI.createIncentive(incentiveData);
        
        if (result.success) {
            showToast('Incentive created successfully!', 'success');
            closeModal('createIncentiveModal');
            loadData();
        } else {
            showToast('Failed to create incentive: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function onStaffSelected() {
    // Could auto-populate something based on staff
}

function calculateIncentiveAmount() {
    calculatePreview();
}

/* ==========================================================================
   APPOINTMENT INCENTIVE - NEW MODERN MODAL
   ========================================================================== */

// Global state for appointment commission
let currentAppointmentData = null;
let currentStaffCommissions = [];
let selectedStaffForIncentives = [];

/**
 * Open the new modern appointment commission modal
 */
async function openCreateByAppointmentModal() {
    try {
        console.log('Loading completable appointments...');
        // Load completable appointments using the new API endpoint
        const apptResult = await StaffAPI.getCompletableAppointments();
        console.log('API Result:', apptResult);

        if (!apptResult.success) {
            throw new Error(apptResult.message || 'Failed to load appointments');
        }

        const appointmentsList = apptResult.data?.items || [];
        console.log('Found', appointmentsList.length, 'appointments');

        if (appointmentsList.length === 0) {
            showToast('No completed appointments available for incentives', 'info');
            return;
        }

        // Create appointment selection modal with proper value return
        const { value: selectedAppointmentId } = await Swal.fire({
            title: '<i class="fas fa-calendar-check"></i> Select Appointment',
            html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                    ${appointmentsList.map(appt => `
                        <div class="appointment-option" data-appointment-id="${appt.appointment_id}" 
                             style="padding: 1rem; margin: 0.5rem 0; background: var(--primary-dark); border: 2px solid var(--card-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;" 
                             onclick="document.querySelectorAll('.appointment-option').forEach(el => el.style.borderColor = 'var(--card-border)'); this.style.borderColor = 'var(--accent-gold)'; document.getElementById('selected-appointment-id').value = '${appt.appointment_id}'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <strong style="color: var(--accent-gold);">#${appt.appointment_id}</strong>
                                <span style="font-size: 0.7rem; color: var(--success); text-transform: uppercase;">${appt.status}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">
                                <i class="fas fa-user"></i> ${appt.customer_name || 'Customer'}
                            </div>
                            <div style="font-size: 0.8125rem; color: var(--text-secondary);">
                                <i class="fas fa-clock"></i> ${appt.appointment_date} at ${appt.start_time || 'N/A'}
                            </div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.5rem;">
                                <i class="fas fa-users"></i> Staff: ${appt.staff_names || 'N/A'}
                            </div>
                            <div style="font-size: 0.875rem; color: var(--accent-gold); font-weight: 600; margin-top: 0.5rem;">
                                <i class="fas fa-rupee-sign"></i> ${parseFloat(appt.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    `).join('')}
                    <input type="hidden" id="selected-appointment-id" value="">
                </div>
            `,
            confirmButtonText: 'Calculate Commissions',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            width: '600px',
            background: 'var(--primary-dark)',
            color: 'var(--text-primary)',
            confirmButtonColor: 'var(--accent-gold)',
            cancelButtonColor: 'var(--card-border)',
            preConfirm: () => {
                const appointmentId = document.getElementById('selected-appointment-id').value;
                if (!appointmentId) {
                    Swal.showValidationMessage('Please click on an appointment to select it');
                }
                return appointmentId;
            }
        });

        if (selectedAppointmentId) {
            console.log('Selected appointment:', selectedAppointmentId);
            await loadAppointmentCommissionBreakdown(selectedAppointmentId);
        }

    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Failed to load appointments: ' + error.message, 'error');
    }
}

/**
 * Load appointment commission breakdown from API
 */
async function loadAppointmentCommissionBreakdown(appointmentId) {
    try {
        // Show loading state
        document.getElementById('staffCommissionBreakdown').innerHTML = `
            <div class="empty-commission-state commission-calculating">
                <div class="empty-commission-icon">
                    <i class="fas fa-calculator"></i>
                </div>
                <h3 class="empty-commission-title">Calculating Commissions...</h3>
                <p class="empty-commission-text">Analyzing services and staff assignments</p>
            </div>
        `;

        const result = await StaffAPI.getAppointmentCommissionBreakdown(appointmentId);

        if (!result.success) {
            throw new Error(result.message || 'Failed to load commission breakdown');
        }

        currentAppointmentData = result.data.appointment;
        currentStaffCommissions = result.data.staff_commissions || [];
        selectedStaffForIncentives = currentStaffCommissions.map(s => s.staff_id);

        // Display appointment info
        displayAppointmentInfo(currentAppointmentData);

        // Display staff commission cards
        displayStaffCommissionCards();

        // Update summary
        updateCommissionSummary(result.data.summary);

        // Open modal
        document.getElementById('appointmentCommissionModal').classList.add('open');

    } catch (error) {
        console.error('Error loading commission breakdown:', error);
        showToast('Failed to calculate commissions: ' + error.message, 'error');
    }
}

/**
 * Display appointment information card
 */
function displayAppointmentInfo(appt) {
    const grid = document.getElementById('apptCommissionInfoGrid');
    grid.innerHTML = `
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-user"></i> Customer</div>
            <div class="appointment-info-value">${appt.customer_name || 'Customer'}</div>
        </div>
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-calendar"></i> Date</div>
            <div class="appointment-info-value">${appt.appointment_date}</div>
        </div>
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-clock"></i> Time</div>
            <div class="appointment-info-value">${appt.start_time || 'N/A'} - ${appt.end_time || 'N/A'}</div>
        </div>
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-rupee-sign"></i> Final Amount</div>
            <div class="appointment-info-value" style="color: var(--accent-gold);">₹${parseFloat(appt.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-tag"></i> Total</div>
            <div class="appointment-info-value">₹${parseFloat(appt.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="appointment-info-item">
            <div class="appointment-info-label"><i class="fas fa-percent"></i> Discount</div>
            <div class="appointment-info-value">₹${parseFloat(appt.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
    `;
}

/**
 * Display staff commission cards
 */
function displayStaffCommissionCards() {
    const container = document.getElementById('staffCommissionBreakdown');

    if (currentStaffCommissions.length === 0) {
        container.innerHTML = `
            <div class="empty-commission-state">
                <div class="empty-commission-icon">
                    <i class="fas fa-user-slash"></i>
                </div>
                <h3 class="empty-commission-title">No Staff Found</h3>
                <p class="empty-commission-text">No staff members were assigned to services in this appointment</p>
            </div>
        `;
        return;
    }

    container.innerHTML = currentStaffCommissions.map(staff => {
        const isSelected = selectedStaffForIncentives.includes(staff.staff_id);
        const commissionRate = parseFloat(document.getElementById('commissionRateInput')?.value || 10);
        const commissionAmount = staff.total_amount * (commissionRate / 100);

        return `
            <div class="staff-commission-card ${isSelected ? 'selected' : ''}" id="staffCard${staff.staff_id}">
                <div class="staff-commission-header">
                    <div class="staff-commission-info">
                        <input type="checkbox" class="staff-commission-checkbox" 
                               ${isSelected ? 'checked' : ''} 
                               onchange="toggleStaffCommission(${staff.staff_id})">
                        <div class="staff-commission-avatar">${getInitials(staff.staff_name)}</div>
                        <div>
                            <div class="staff-commission-name">${escapeHtml(staff.staff_name)}</div>
                            <div class="staff-commission-specialization">${staff.staff_specialization || 'Staff'}</div>
                        </div>
                    </div>
                    <div class="staff-commission-amount">
                        <div class="staff-commission-label">Commission</div>
                        <div class="staff-commission-value" id="commissionAmount${staff.staff_id}">₹${commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                ${staff.services.length > 0 ? `
                    <div class="staff-service-list">
                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.5rem;">
                            <i class="fas fa-cut"></i> Services (${staff.services.length})
                        </div>
                        ${staff.services.map(service => `
                            <div class="service-item">
                                <div>
                                    <div class="service-item-name">${escapeHtml(service.service_name)}</div>
                                    <div class="service-item-price">₹${service.price.toLocaleString('en-IN')} - ${service.discount > 0 ? '₹' + service.discount.toLocaleString('en-IN') + ' disc.' : 'No discount'}</div>
                                </div>
                                <div class="service-item-final">₹${service.final_price.toLocaleString('en-IN')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${staff.package_services && staff.package_services.length > 0 ? `
                    <div class="staff-service-list" style="margin-top: 0.75rem;">
                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.5rem;">
                            <i class="fas fa-gift"></i> Package Services (${staff.package_services.length})
                        </div>
                        ${staff.package_services.map(ps => `
                            <div class="service-item">
                                <div>
                                    <div class="service-item-name">${escapeHtml(ps.service_name)} (${escapeHtml(ps.package_name)})</div>
                                    <div class="service-item-price">Proportional share</div>
                                </div>
                                <div class="service-item-final">₹${ps.proportional_share.toLocaleString('en-IN')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Toggle staff commission selection
 */
function toggleStaffCommission(staffId) {
    const index = selectedStaffForIncentives.indexOf(staffId);
    const card = document.getElementById(`staffCard${staffId}`);

    if (index === -1) {
        selectedStaffForIncentives.push(staffId);
        card.classList.add('selected');
    } else {
        selectedStaffForIncentives.splice(index, 1);
        card.classList.remove('selected');
    }

    updateCommissionSummary();
}

/**
 * Recalculate commissions when rate changes
 */
function recalculateCommissions() {
    const commissionRate = parseFloat(document.getElementById('commissionRateInput').value || 0);

    currentStaffCommissions.forEach(staff => {
        const commissionAmount = staff.total_amount * (commissionRate / 100);
        const amountEl = document.getElementById(`commissionAmount${staff.staff_id}`);
        if (amountEl) {
            amountEl.textContent = '₹' + commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
    });

    updateCommissionSummary();
}

/**
 * Update commission summary box
 */
function updateCommissionSummary(summaryData) {
    const commissionRate = parseFloat(document.getElementById('commissionRateInput').value || 0);
    const totalRevenue = currentStaffCommissions.reduce((sum, s) => sum + s.total_amount, 0);
    const totalCommission = totalRevenue * (commissionRate / 100);

    document.getElementById('summaryTotalServices').textContent = summaryData?.total_services || currentStaffCommissions.reduce((sum, s) => sum + s.services.length, 0);
    document.getElementById('summaryStaffCount').textContent = currentStaffCommissions.length;
    document.getElementById('summaryTotalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('summaryTotalCommission').textContent = '₹' + totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

/**
 * Create incentives from appointment commission
 */
async function createAppointmentIncentives() {
    if (selectedStaffForIncentives.length === 0) {
        showToast('Please select at least one staff member', 'error');
        return;
    }

    const commissionRate = parseFloat(document.getElementById('commissionRateInput').value || 10);
    const remarks = document.getElementById('commissionRemarks').value.trim();

    try {
        // Disable button during creation
        const btn = document.getElementById('createCommissionBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        const result = await StaffAPI.createIncentiveFromAppointment(currentAppointmentData.appointment_id, {
            commission_rate: commissionRate,
            remarks: remarks || `Commission from appointment #${currentAppointmentData.appointment_id}`,
            status: 'PENDING'
        });

        if (!result.success) {
            throw new Error(result.message || 'Failed to create incentives');
        }

        const data = result.data;
        
        showToast(`Created ${data.incentives_created} incentive(s) totaling ₹${data.total_incentives.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'success');

        // Close modal
        closeModal('appointmentCommissionModal');
        
        // Reload data
        loadData();

    } catch (error) {
        console.error('Error creating incentives:', error);
        showToast('Failed to create incentives: ' + error.message, 'error');
    } finally {
        // Re-enable button
        const btn = document.getElementById('createCommissionBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Create Incentives';
    }
}

/* ==========================================================================
   APPOINTMENT INCENTIVE - LEGACY FUNCTION (kept for compatibility)
   ========================================================================== */
async function openCreateByAppointmentModalLegacy() {
    try {
        const apptResult = await apiRequest('/appointments', { method: 'GET' });
        
        if (apptResult.status !== 'success') {
            throw new Error('Failed to load appointments');
        }
        
        const appointmentsList = apptResult.data?.items || [];
        
        if (appointmentsList.length === 0) {
            showToast('No appointments available', 'error');
        }
        
        const select = document.getElementById('appointmentSelect');
        select.innerHTML = '<option value="">Choose an appointment...</option>' +
            appointmentsList.map(a => `<option value="${a.appointment_id}">#${a.appointment_id} - ${a.customer_name || 'Customer'} (${a.appointment_date})</option>`).join('');
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Failed to load appointments: ' + error.message, 'error');
    }
    
    document.getElementById('appointmentDetails').style.display = 'none';
    document.getElementById('createByAppointmentModal').classList.add('open');
}

function onAppointmentSelected() {
    const apptId = document.getElementById('appointmentSelect').value;
    
    if (!apptId) {
        document.getElementById('appointmentDetails').style.display = 'none';
        return;
    }
    
    // In a real implementation, you'd fetch the full appointment details
    // For now, we'll just show the dropdown value info
    document.getElementById('appointmentDetails').style.display = 'block';
    
    // Extract info from the option text (simplified)
    const select = document.getElementById('appointmentSelect');
    const option = select.options[select.selectedIndex];
    const text = option.text;
    
    document.getElementById('apptCustomer').textContent = text.split(' - ')[1]?.split(' (')[0] || '-';
    document.getElementById('apptDate').textContent = text.split('(')[1]?.split(')')[0] || '-';
    document.getElementById('apptStaff').textContent = 'Assigned Staff';
    document.getElementById('apptAmount').textContent = '₹0.00';
}

async function submitAppointmentIncentive() {
    const apptId = parseInt(document.getElementById('appointmentSelect').value);
    const incentiveType = document.getElementById('apptIncentiveType').value;
    const amount = parseFloat(document.getElementById('apptIncentiveAmount').value);
    const remarks = document.getElementById('apptIncentiveRemarks').value.trim();
    
    if (!apptId) {
        showToast('Please select an appointment', 'error');
        return;
    }
    
    if (!incentiveType) {
        showToast('Please select an incentive type', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    // Get staff ID from appointment (would need to fetch this)
    showToast('Appointment incentive creation - Staff ID lookup needed', 'info');
    
    const incentiveData = {
        staff_id: 1, // TODO: Get from appointment
        appointment_id: apptId,
        incentive_type: incentiveType,
        calculation_type: 'FIXED',
        incentive_amount: amount,
        remarks: remarks || `Incentive for appointment #${apptId}`,
        status: 'PENDING'
    };
    
    try {
        const result = await StaffAPI.createIncentive(incentiveData);
        
        if (result.success) {
            showToast('Incentive created successfully!', 'success');
            closeModal('createByAppointmentModal');
            loadData();
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

/* ==========================================================================
   PAYOUT FUNCTIONS
   ========================================================================== */
async function showPayoutOption(staffId, staffName, amount) {
    currentStaffId = staffId;
    currentStaffName = staffName;
    
    try {
        const result = await StaffAPI.getUnpaidIncentives(staffId);
        
        if (!result.success) {
            throw new Error('Failed to load unpaid incentives');
        }
        
        unpaidIncentivesData = result.data.incentives || [];
        const totalOutstanding = result.data.total_outstanding;
        
        document.getElementById('selectStaffName').textContent = staffName;
        document.getElementById('selectTotalOutstanding').textContent = '₹' + totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        
        renderUnpaidIncentivesCards();
        
        document.getElementById('selectIncentivesModal').classList.add('open');
        
    } catch (error) {
        console.error('Error loading unpaid incentives:', error);
        showToast('Failed: ' + error.message, 'error');
    }
}

function renderUnpaidIncentivesCards() {
    const container = document.getElementById('unpaidIncentivesList');
    
    if (unpaidIncentivesData.length === 0) {
        container.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-state-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="empty-state-title">All Paid!</h3>
                <p class="empty-state-text">No unpaid incentives for this staff member</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = unpaidIncentivesData.map(inc => {
        const typeLabels = {
            'SERVICE_COMMISSION': 'Service Commission',
            'BONUS': 'Bonus',
            'TARGET_ACHIEVEMENT': 'Target Achievement'
        };
        
        return `
            <div class="incentive-card" onclick="toggleIncentiveCardSelection(${inc.incentive_id}, ${inc.incentive_amount})" id="incentiveCard${inc.incentive_id}">
                <div class="incentive-card-header">
                    <input type="checkbox" class="incentive-card-checkbox" id="checkbox${inc.incentive_id}" onchange="event.stopPropagation(); toggleIncentiveCardSelection(${inc.incentive_id}, ${inc.incentive_amount})">
                    <span class="type-badge-modern">
                        <i class="fas fa-${inc.incentive_type === 'SERVICE_COMMISSION' ? 'coins' : inc.incentive_type === 'BONUS' ? 'gift' : 'trophy'}"></i>
                        ${typeLabels[inc.incentive_type] || inc.incentive_type}
                    </span>
                </div>
                <div class="incentive-card-body">
                    <div class="incentive-card-details">
                        <div class="incentive-card-title">₹${(inc.incentive_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div class="incentive-card-meta">Created: ${new Date(inc.created_at).toLocaleDateString('en-IN')}</div>
                        ${inc.remarks ? `<div class="incentive-card-meta">${escapeHtml(inc.remarks)}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleIncentiveCardSelection(incentiveId, amount) {
    const checkbox = document.getElementById(`checkbox${incentiveId}`);
    const card = document.getElementById(`incentiveCard${incentiveId}`);
    
    if (checkbox.checked) {
        card.classList.add('selected');
        if (!selectedIncentives.includes(incentiveId)) {
            selectedIncentives.push(incentiveId);
        }
    } else {
        card.classList.remove('selected');
        selectedIncentives = selectedIncentives.filter(id => id !== incentiveId);
    }
    
    updateSelectedSummary();
}

function updateSelectedSummary() {
    const selected = unpaidIncentivesData.filter(inc => selectedIncentives.includes(inc.incentive_id));
    const total = selected.reduce((sum, inc) => sum + parseFloat(inc.incentive_amount || 0), 0);
    
    document.getElementById('selectedCount').textContent = `${selected.length} of ${unpaidIncentivesData.length}`;
    document.getElementById('selectedTotal').textContent = '₹' + total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
    const proceedBtn = document.getElementById('proceedBtn');
    if (proceedBtn) {
        proceedBtn.disabled = selected.length === 0;
    }
}

function selectAllIncentives() {
    selectedIncentives = unpaidIncentivesData.map(inc => inc.incentive_id);
    
    unpaidIncentivesData.forEach(inc => {
        document.getElementById(`checkbox${inc.incentive_id}`).checked = true;
        document.getElementById(`incentiveCard${inc.incentive_id}`).classList.add('selected');
    });
    
    updateSelectedSummary();
}

function clearSelectedIncentives() {
    selectedIncentives = [];
    
    unpaidIncentivesData.forEach(inc => {
        document.getElementById(`checkbox${inc.incentive_id}`).checked = false;
        document.getElementById(`incentiveCard${inc.incentive_id}`).classList.remove('selected');
    });
    
    updateSelectedSummary();
}

function proceedToPayout() {
    if (selectedIncentives.length === 0) {
        showToast('Please select at least one incentive', 'error');
        return;
    }
    
    const selected = unpaidIncentivesData.filter(inc => selectedIncentives.includes(inc.incentive_id));
    const total = selected.reduce((sum, inc) => sum + parseFloat(inc.incentive_amount || 0), 0);
    
    closeModal('selectIncentivesModal');
    
    document.getElementById('payoutStaffName').textContent = currentStaffName;
    document.getElementById('payoutAmountDisplay').textContent = '₹' + total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
    document.getElementById('payoutDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('payoutModal').classList.add('open');
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('method' + method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()).classList.add('selected');
    
    document.getElementById('submitPayoutBtn').disabled = false;
}

async function submitPayout() {
    console.log('Submit payout clicked');
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    console.log('currentStaffId:', currentStaffId);
    console.log('window.selectedIncentivesForPayout:', window.selectedIncentivesForPayout);
    console.log('selectedIncentives:', selectedIncentives);
    
    if (!selectedPaymentMethod) {
        console.log('No payment method selected');
        showToast('Please select a payment method', 'error');
        return;
    }

    // Use stored incentive IDs for bulk payout, or current selectedIncentives
    const incentiveIds = window.selectedIncentivesForPayout || selectedIncentives;
    console.log('Final incentive IDs to process:', incentiveIds);

    if (incentiveIds.length === 0) {
        console.log('No incentive IDs');
        showToast('No incentives selected', 'error');
        return;
    }

    const payoutData = {
        staff_id: currentStaffId,
        incentive_ids: incentiveIds,
        payout_date: document.getElementById('payoutDate').value,
        payment_mode: selectedPaymentMethod,
        transaction_reference: document.getElementById('payoutTransactionRef').value.trim(),
        remarks: document.getElementById('payoutRemarks').value.trim() || `Batch payout for ${incentiveIds.length} incentive(s)`
    };
    
    console.log('Payout data:', payoutData);

    try {
        console.log('Calling StaffAPI.processBatchPayout...');
        const result = await StaffAPI.processBatchPayout(payoutData);
        console.log('Result:', result);

        if (result.success) {
            const { success_count, fail_count, total_paid } = result.data;

            if (fail_count === 0) {
                showToast(`Payout successful! ₹${total_paid.toLocaleString('en-IN')} paid for ${success_count} incentive(s)`, 'success');
            } else {
                showToast(`Partial success: ${success_count} paid, ${fail_count} failed`, 'warning');
            }

            // Clear stored incentive IDs
            window.selectedIncentivesForPayout = null;
            selectedIncentives = [];

            closeModal('payoutModal');
            loadData();
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit payout error:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

function processPayout() {
    // Legacy function - redirect to new flow
    submitPayout();
}

/* ==========================================================================
   VIEW HISTORY
   ========================================================================== */
async function viewIncentiveDetails(staffId, staffName) {
    currentStaffId = staffId;
    currentStaffName = staffName;
    
    try {
        const result = await StaffAPI.getIncentiveHistory(staffId);
        
        if (!result.success) {
            throw new Error('Failed to load incentive history');
        }
        
        currentIncentiveHistory = result.data.incentives || [];
        
        document.getElementById('viewDetailsStaffName').textContent = staffName;
        document.getElementById('viewTotalEarned').textContent = '₹' + (result.data.total_incentives || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
        document.getElementById('viewTotalPaid').textContent = '₹' + (result.data.total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
        document.getElementById('viewTotalOutstanding').textContent = '₹' + (result.data.total_outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
        
        filterHistory('ALL');
        
        document.getElementById('viewIncentivesModal').classList.add('open');
        
    } catch (error) {
        console.error('Error loading incentive history:', error);
        showToast('Failed: ' + error.message, 'error');
    }
}

function filterHistory(status) {
    // Update filter buttons
    document.querySelectorAll('#viewIncentivesModal .btn-modern').forEach(btn => {
        btn.classList.remove('primary');
        btn.classList.add('secondary');
    });
    document.getElementById('filter' + status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()).classList.add('primary');
    document.getElementById('filter' + status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()).classList.remove('secondary');
    
    let filtered = currentIncentiveHistory;
    if (status !== 'ALL') {
        filtered = currentIncentiveHistory.filter(inc => inc.status === status);
    }
    
    renderIncentiveHistory(filtered);
}

function renderIncentiveHistory(incentives) {
    const tbody = document.getElementById('incentiveHistoryBody');
    
    if (incentives.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    No incentives found
                </td>
            </tr>
        `;
        return;
    }
    
    const typeIcons = {
        'SERVICE_COMMISSION': 'fa-coins',
        'BONUS': 'fa-gift',
        'TARGET_ACHIEVEMENT': 'fa-trophy'
    };
    
    const statusClass = {
        'PENDING': 'status-pending-modern',
        'APPROVED': 'status-approved-modern',
        'PAID': 'status-paid-modern'
    };
    
    tbody.innerHTML = incentives.map(inc => {
        const payoutInfo = inc.payout_id 
            ? `₹${(inc.payout_amount || 0).toLocaleString('en-IN')}<br><small style="color: var(--text-secondary);">${inc.payment_mode || ''}</small>`
            : '-';
        
        return `
            <tr>
                <td><strong style="color: var(--accent-gold);">#${inc.incentive_id}</strong></td>
                <td>
                    <span class="type-badge-modern">
                        <i class="fas ${typeIcons[inc.incentive_type] || 'fa-tag'}"></i>
                        ${inc.incentive_type}
                    </span>
                </td>
                <td>
                    <strong style="color: var(--accent-gold);">₹${(inc.incentive_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </td>
                <td>
                    <span class="status-badge-modern ${statusClass[inc.status] || 'status-pending-modern'}">
                        ${inc.status}
                    </span>
                </td>
                <td style="font-size: 0.75rem;">
                    ${new Date(inc.created_at).toLocaleDateString('en-IN')}
                </td>
                <td style="font-size: 0.75rem;">
                    ${payoutInfo}
                </td>
            </tr>
        `;
    }).join('');
}

function exportIncentivesToCSV() {
    if (currentIncentiveHistory.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    const headers = ['ID', 'Type', 'Amount', 'Status', 'Date', 'Payout Amount', 'Payout Mode'];
    const rows = currentIncentiveHistory.map(inc => [
        inc.incentive_id,
        inc.incentive_type,
        inc.incentive_amount,
        inc.status,
        inc.created_at,
        inc.payout_amount || '',
        inc.payment_mode || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incentives_${currentStaffName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV exported', 'success');
}

/* ==========================================================================
   LOGOUT
   ========================================================================== */
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        await AuthAPI.logout();
        TokenManager.removeToken();
        TokenManager.removeUser();
        localStorage.removeItem('refresh_token');
        window.location.href = '../index.html';
    }
}
