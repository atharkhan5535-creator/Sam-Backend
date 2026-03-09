/* =============================================
   STAFF PORTAL - MAIN JAVASCRIPT
   Handles navigation, common staff functions
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!TokenManager.isAuthenticated()) {
        // Use relative path to avoid hardcoded URL issues
        // Redirect to parent directory where login.html is located
        window.location.href = '../login.html';
        return;
    }

    // Load staff data
    loadStaffData();

    // Setup event listeners
    setupEventListeners();
});

// Load staff data from API
async function loadStaffData() {
    try {
        const user = TokenManager.getUser();
        if (!user) return;
        
        // Get staff details
        const result = await StaffAPI.getStaffDetails(user.id);
        if (result.success) {
            updateStaffUI(result.data);
        }
    } catch (error) {
        console.error('Failed to load staff data:', error);
    }
}

// Update UI with staff data
function updateStaffUI(staffData) {
    // Update profile sections
    document.querySelectorAll('[data-staff-name]').forEach(el => {
        el.textContent = staffData.name;
    });
    
    document.querySelectorAll('[data-staff-role]').forEach(el => {
        el.textContent = staffData.role;
    });
    
    document.querySelectorAll('[data-staff-email]').forEach(el => {
        el.textContent = staffData.email;
    });
    
    document.querySelectorAll('[data-staff-phone]').forEach(el => {
        el.textContent = staffData.phone;
    });
    
    // Update avatar initials
    document.querySelectorAll('.avatar, .avatar-lg').forEach(el => {
        if (!el.textContent || el.textContent === '?') {
            el.textContent = getInitials(staffData.name);
        }
    });
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
    
    // Search inputs with debounce
    const searchInputs = document.querySelectorAll('input[data-search]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
    
    // Filter selects
    const filterSelects = document.querySelectorAll('select[data-filter]');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
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

// Handle search with debounce
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const targetTable = e.target.getAttribute('data-target');
    
    if (targetTable) {
        filterTable(targetTable, searchTerm);
    }
}

// Handle filter change
function handleFilter(e) {
    const filterValue = e.target.value;
    const filterType = e.target.getAttribute('data-filter');
    const targetTable = e.target.getAttribute('data-target');
    
    if (targetTable) {
        filterTableByType(targetTable, filterType, filterValue);
    }
}

// Filter table by search term
function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(searchTerm);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });
    
    // Update results info
    const infoEl = document.getElementById(`${tableId}Info`);
    if (infoEl) {
        infoEl.textContent = `Showing ${visibleCount} of ${rows.length} records`;
    }
}

// Filter table by type (status, category, etc.)
function filterTableByType(tableId, filterType, filterValue) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cell = row.querySelector(`[data-${filterType}]`);
        if (!filterValue) {
            row.style.display = '';
            visibleCount++;
            return;
        }
        
        const cellValue = cell ? cell.getAttribute(`data-${filterType}`) : '';
        const matches = cellValue === filterValue;
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });
    
    // Update results info
    const infoEl = document.getElementById(`${tableId}Info`);
    if (infoEl) {
        infoEl.textContent = `Showing ${visibleCount} of ${rows.length} records`;
    }
}

// Format currency for display
function formatDisplayCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date for display
function formatDisplayDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format datetime for display
function formatDisplayDateTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading spinner
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
}

// Hide loading spinner
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

// Show empty state
function showEmptyState(containerId, message = 'No data found') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>${message}</p>
        </div>
    `;
}

// Show error state
function showError(containerId, message = 'An error occurred') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// Export functions
window.formatDisplayCurrency = formatDisplayCurrency;
window.formatDisplayDate = formatDisplayDate;
window.formatDisplayDateTime = formatDisplayDateTime;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showEmptyState = showEmptyState;
window.showError = showError;