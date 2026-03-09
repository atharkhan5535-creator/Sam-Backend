/* =============================================
   STAFF CUSTOMERS PAGE
   View customer information
   ============================================= */

let staffCustomers = [];
let currentPage = 1;
const perPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    loadStaffCustomers();
    setupCustomerListeners();
});

// Load staff customers
async function loadStaffCustomers() {
    showLoading('customersTableBody');
    
    try {
        // Get current staff user
        const user = TokenManager.getUser();
        if (!user || !user.id) {
            showError('customersTableBody', 'User not found');
            return;
        }
        
        // Mock data - replace with actual API call
        // const result = await CustomerAPI.getCustomers();
        // if (result.success) {
        //     staffCustomers = result.data.items;
        // }
        
        // Mock data for demonstration
        staffCustomers = [
            { 
                id: 1, 
                name: "Jessica Martinez", 
                phone: "555-123-4567", 
                email: "jessica.m@email.com",
                gender: "Female", 
                dob: "1990-09-12", 
                anniversary: "2022-02-14",
                totalVisits: 12, 
                totalSpent: 780.00,
                lastVisit: "2026-01-29",
                notes: "Prefers appointments in the morning"
            },
            { 
                id: 2, 
                name: "Michael Chen", 
                phone: "555-234-5678", 
                email: "michael.chen@email.com",
                gender: "Male", 
                dob: "1985-02-12", 
                anniversary: "2023-05-18",
                totalVisits: 7, 
                totalSpent: 455.00,
                lastVisit: "2026-01-29",
                notes: "Allergic to certain hair products"
            },
            { 
                id: 3, 
                name: "Sarah Williams", 
                phone: "555-345-6789", 
                email: "sarah.w@email.com",
                gender: "Female", 
                dob: "1995-07-10", 
                anniversary: "2022-10-23",
                totalVisits: 5, 
                totalSpent: 225.00,
                lastVisit: "2026-01-29",
                notes: ""
            },
            { 
                id: 4, 
                name: "Robert Brown", 
                phone: "555-456-7890", 
                email: "robert.b@email.com",
                gender: "Male", 
                dob: "1988-09-17", 
                anniversary: "2025-01-23",
                totalVisits: 9, 
                totalSpent: 270.00,
                lastVisit: "2026-01-30",
                notes: "Prefers the same stylist"
            },
            { 
                id: 5, 
                name: "Amanda Davis", 
                phone: "555-567-8901", 
                email: "amanda.d@email.com",
                gender: "Female", 
                dob: "1999-10-10", 
                anniversary: "2002-03-19",
                totalVisits: 3, 
                totalSpent: 220.00,
                lastVisit: "2026-01-30",
                notes: "First time customer"
            },
            { 
                id: 6, 
                name: "Daniel Lee", 
                phone: "555-678-9012", 
                email: "daniel.l@email.com",
                gender: "Male", 
                dob: "1992-04-05", 
                anniversary: "2020-08-12",
                totalVisits: 15, 
                totalSpent: 975.00,
                lastVisit: "2026-02-10",
                notes: "VIP customer"
            },
            { 
                id: 7, 
                name: "Priya Singh", 
                phone: "555-789-0123", 
                email: "priya.s@email.com",
                gender: "Female", 
                dob: "1997-03-22", 
                anniversary: "2024-11-01",
                totalVisits: 2, 
                totalSpent: 90.00,
                lastVisit: "2026-02-11",
                notes: "Sensitive skin"
            },
        ];
        
        renderCustomers();
    } catch (error) {
        showError('customersTableBody', error.message);
    }
    
    hideLoading('customersTableBody');
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Render customers table
function renderCustomers() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    // Get filter values
    const genderFilter = document.getElementById('filterGender')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const emailFilter = document.getElementById('filterEmail')?.value.toLowerCase() || '';
    
    // Filter customers
    let filtered = staffCustomers.filter(customer => {
        // Gender filter
        if (genderFilter && customer.gender !== genderFilter) return false;
        
        // Search filter
        if (searchTerm && !customer.name.toLowerCase().includes(searchTerm) && 
            !customer.phone.includes(searchTerm) &&
            !customer.email.toLowerCase().includes(searchTerm)) return false;
        
        // Email filter
        if (emailFilter && !customer.email.toLowerCase().includes(emailFilter)) return false;
        
        return true;
    });
    
    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    // Paginate
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);
    
    // Gender badge styling
    const getGenderBadge = (gender) => {
        if (gender === 'Female') return '<span class="badge badge-pink">♀ Female</span>';
        if (gender === 'Male') return '<span class="badge badge-info">♂ Male</span>';
        return '<span class="badge badge-gray">Other</span>';
    };
    
    // Render rows
    tbody.innerHTML = paginated.map(customer => `
        <tr>
            <td><strong>#${customer.id}</strong></td>
            <td>
                <div style="display:flex;align-items:center;gap:.75rem">
                    <div class="avatar">${getInitials(customer.name)}</div>
                    <div>
                        <strong>${customer.name}</strong><br>
                        <span style="color:#888;font-size:.78rem">${customer.totalVisits} visits · ${formatDisplayCurrency(customer.totalSpent)}</span>
                    </div>
                </div>
            </td>
            <td>${customer.phone}</td>
            <td style="font-size:.82rem">${customer.email}</td>
            <td>${getGenderBadge(customer.gender)}</td>
            <td>${formatDisplayDate(customer.dob)}</td>
            <td>${customer.anniversary ? formatDisplayDate(customer.anniversary) : '—'}</td>
            <td>
                <button class="btn btn-view btn-sm" onclick="viewCustomer(${customer.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update pagination info
    const infoEl = document.getElementById('customersInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} customers`;
    }
    
    renderPagination(filtered.length);
}

// Render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / perPage);
    const paginationEl = document.getElementById('pagination');
    
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button class="page-btn" disabled>...</button>`;
        }
    }
    
    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationEl.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    renderCustomers();
}

// View customer details
function viewCustomer(customerId) {
    const customer = staffCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customerDetailModal');
    const content = document.getElementById('detailContent');
    
    if (!modal || !content) return;
    
    const getGenderBadge = (gender) => {
        if (gender === 'Female') return '<span class="badge badge-pink">♀ Female</span>';
        if (gender === 'Male') return '<span class="badge badge-info">♂ Male</span>';
        return '<span class="badge badge-gray">Other</span>';
    };
    
    content.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <div class="avatar" style="width:64px;height:64px;font-size:1.5rem;margin:0 auto 1rem">${getInitials(customer.name)}</div>
            <h2 style="color:#333">${customer.name}</h2>
            <span style="color:#7c3aed;font-size:.9rem">${customer.totalVisits} visits · ${formatDisplayCurrency(customer.totalSpent)} total spent</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Phone</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${customer.phone}</div>
            </div>
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Email</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${customer.email}</div>
            </div>
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Gender</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${getGenderBadge(customer.gender)}</div>
            </div>
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Date of Birth</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${formatDisplayDate(customer.dob)}</div>
            </div>
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Anniversary</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${customer.anniversary ? formatDisplayDate(customer.anniversary) : '—'}</div>
            </div>
            <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Last Visit</div>
                <div style="font-size:.95rem;color:#333;font-weight:500">${formatDisplayDate(customer.lastVisit)}</div>
            </div>
            <div style="grid-column:1/-1;background:#f9f5ff;border-radius:10px;padding:1rem">
                <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">Notes</div>
                <div style="font-size:.95rem;color:#333">${customer.notes || 'No notes'}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
}

// Filter customers
function filterCustomers() {
    currentPage = 1;
    renderCustomers();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterGender').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('filterEmail').value = '';
    
    currentPage = 1;
    renderCustomers();
}

// Toggle filter bar
function toggleFilterBar() {
    const filterBar = document.getElementById('filterBar');
    if (filterBar) {
        filterBar.classList.toggle('open');
    }
}

// Setup customer listeners
function setupCustomerListeners() {
    // Filter inputs
    const genderFilter = document.getElementById('filterGender');
    const searchInput = document.getElementById('searchInput');
    const emailFilter = document.getElementById('filterEmail');
    
    if (genderFilter) genderFilter.addEventListener('change', filterCustomers);
    if (searchInput) searchInput.addEventListener('input', debounce(filterCustomers, 300));
    if (emailFilter) emailFilter.addEventListener('input', debounce(filterCustomers, 300));
    
    // Filter toggle button
    const filterBtn = document.querySelector('[onclick="toggleFilterBar()"]');
    if (filterBtn) filterBtn.addEventListener('click', toggleFilterBar);
    
    // Reset button
    const resetBtn = document.querySelector('[onclick="resetFilters()"]');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
    }
}

// Export functions
window.filterCustomers = filterCustomers;
window.resetFilters = resetFilters;
window.toggleFilterBar = toggleFilterBar;
window.viewCustomer = viewCustomer;
window.closeModal = closeModal;
window.changePage = changePage;