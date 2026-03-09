/* =============================================
   STAFF SERVICES PAGE
   View services staff can perform
   ============================================= */

let staffServices = [];
let currentPage = 1;
const perPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    loadStaffServices();
    setupServiceListeners();
});

// Load staff services
async function loadStaffServices() {
    showLoading('servicesTableBody');
    
    try {
        // Get current staff user
        const user = TokenManager.getUser();
        if (!user || !user.id) {
            showError('servicesTableBody', 'User not found');
            return;
        }
        
        // Mock data - replace with actual API call
        // const result = await ServiceAPI.getServices();
        // if (result.success) {
        //     staffServices = result.data.items;
        // }
        
        // Mock data for demonstration
        staffServices = [
            { 
                id: 1, 
                name: "Signature Haircut", 
                category: "Hair Services", 
                duration: 60, 
                price: 65.00,
                expertise: "Expert",
                commission: 25,
                status: "ACTIVE",
                description: "Premium haircut with consultation and styling"
            },
            { 
                id: 2, 
                name: "Full Color Treatment", 
                category: "Color Services", 
                duration: 120, 
                price: 125.00,
                expertise: "Expert",
                commission: 30,
                status: "ACTIVE",
                description: "Complete hair coloring service with premium products"
            },
            { 
                id: 3, 
                name: "Deluxe Manicure", 
                category: "Nail Services", 
                duration: 45, 
                price: 45.00,
                expertise: "Intermediate",
                commission: 20,
                status: "ACTIVE",
                description: "Premium manicure with gel finish"
            },
            { 
                id: 4, 
                name: "Deluxe Pedicure", 
                category: "Nail Services", 
                duration: 45, 
                price: 45.00,
                expertise: "Intermediate",
                commission: 20,
                status: "ACTIVE",
                description: "Relaxing pedicure treatment"
            },
            { 
                id: 5, 
                name: "Relaxation Massage", 
                category: "Massage", 
                duration: 60, 
                price: 95.00,
                expertise: "Expert",
                commission: 25,
                status: "ACTIVE",
                description: "Full body relaxation massage"
            },
            { 
                id: 6, 
                name: "Signature Facial", 
                category: "Skin Care", 
                duration: 75, 
                price: 85.00,
                expertise: "Expert",
                commission: 25,
                status: "ACTIVE",
                description: "Deep cleansing facial treatment"
            },
            { 
                id: 7, 
                name: "Beard Trim", 
                category: "Hair Services", 
                duration: 30, 
                price: 30.00,
                expertise: "Beginner",
                commission: 15,
                status: "ACTIVE",
                description: "Professional beard shaping"
            },
            { 
                id: 8, 
                name: "Keratin Treatment", 
                category: "Hair Services", 
                duration: 180, 
                price: 200.00,
                expertise: "Expert",
                commission: 35,
                status: "INACTIVE",
                description: "Smoothing keratin treatment"
            },
        ];
        
        renderServices();
    } catch (error) {
        showError('servicesTableBody', error.message);
    }
    
    hideLoading('servicesTableBody');
}

// Render services table
function renderServices() {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;
    
    // Get filter values
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    // Filter services
    let filtered = staffServices.filter(service => {
        // Status filter
        if (statusFilter && service.status !== statusFilter) return false;
        
        // Category filter
        if (categoryFilter && service.category !== categoryFilter) return false;
        
        // Search filter
        if (searchTerm && !service.name.toLowerCase().includes(searchTerm) && 
            !service.category.toLowerCase().includes(searchTerm)) return false;
        
        return true;
    });
    
    // Paginate
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);
    
    // Render rows
    tbody.innerHTML = paginated.map(service => {
        const statusClass = service.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
        
        let expertiseClass = 'badge-gray';
        if (service.expertise === 'Expert') expertiseClass = 'badge-warning';
        else if (service.expertise === 'Intermediate') expertiseClass = 'badge-info';
        
        return `
        <tr>
            <td>${service.id}</td>
            <td>
                <strong>${service.name}</strong><br>
                <span style="color:#888;font-size:.78rem">${service.description || ''}</span>
            </td>
            <td>${service.category}</td>
            <td>${service.duration} min</td>
            <td><strong>${formatDisplayCurrency(service.price)}</strong></td>
            <td><span class="badge ${expertiseClass}">${service.expertise}</span></td>
            <td><span class="badge badge-purple">${service.commission}%</span></td>
            <td><span class="badge ${statusClass}">${service.status}</span></td>
        </tr>
    `}).join('');
    
    // Update pagination info
    const infoEl = document.getElementById('servicesInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} services`;
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
    renderServices();
}

// Filter services
function filterServices() {
    currentPage = 1;
    renderServices();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('searchInput').value = '';
    
    currentPage = 1;
    renderServices();
}

// Toggle filter bar
function toggleFilterBar() {
    const filterBar = document.getElementById('filterBar');
    if (filterBar) {
        filterBar.classList.toggle('open');
    }
}

// Setup service listeners
function setupServiceListeners() {
    // Filter inputs
    const statusFilter = document.getElementById('filterStatus');
    const categoryFilter = document.getElementById('filterCategory');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) statusFilter.addEventListener('change', filterServices);
    if (categoryFilter) categoryFilter.addEventListener('change', filterServices);
    if (searchInput) searchInput.addEventListener('input', debounce(filterServices, 300));
    
    // Filter toggle button
    const filterBtn = document.querySelector('[onclick="toggleFilterBar()"]');
    if (filterBtn) filterBtn.addEventListener('click', toggleFilterBar);
    
    // Reset button
    const resetBtn = document.querySelector('[onclick="resetFilters()"]');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// Export functions
window.filterServices = filterServices;
window.resetFilters = resetFilters;
window.toggleFilterBar = toggleFilterBar;
window.changePage = changePage;