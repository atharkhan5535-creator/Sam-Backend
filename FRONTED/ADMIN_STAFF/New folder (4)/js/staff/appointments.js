/* =============================================
   STAFF APPOINTMENTS PAGE
   View and manage staff appointments
   ============================================= */

let staffAppointments = [];
let currentPage = 1;
const perPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    loadStaffAppointments();
    setupAppointmentListeners();
});

// Load staff appointments
async function loadStaffAppointments() {
    showLoading('appointmentsTableBody');
    
    try {
        // Get current staff user
        const user = TokenManager.getUser();
        if (!user || !user.id) {
            showError('appointmentsTableBody', 'User not found');
            return;
        }
        
        // Mock data - replace with actual API call
        // const result = await AppointmentAPI.getAppointments({ staff_id: user.id });
        // if (result.success) {
        //     staffAppointments = result.data.items;
        // }
        
        // Mock data for demonstration
        staffAppointments = [
            { 
                id: 1, 
                customer: "Jessica Martinez", 
                phone: "555-123-4567",
                service: "Facial", 
                date: "2026-02-20", 
                time: "10:00 AM",
                status: "BOOKED",
                notes: "First time customer",
                created_at: "2026-02-19 14:30"
            },
            { 
                id: 2, 
                customer: "Michael Chen", 
                phone: "555-234-5678",
                service: "Haircut", 
                date: "2026-02-20", 
                time: "11:30 AM",
                status: "BOOKED",
                notes: "Regular customer",
                created_at: "2026-02-19 15:45"
            },
            { 
                id: 3, 
                customer: "Sarah Williams", 
                phone: "555-345-6789",
                service: "Manicure", 
                date: "2026-02-20", 
                time: "2:00 PM",
                status: "BOOKED",
                notes: "",
                created_at: "2026-02-18 09:20"
            },
            { 
                id: 4, 
                customer: "Robert Brown", 
                phone: "555-456-7890",
                service: "Beard Trim", 
                date: "2026-02-21", 
                time: "9:00 AM",
                status: "BOOKED",
                notes: "Prefer electric trimmer",
                created_at: "2026-02-20 08:15"
            },
            { 
                id: 5, 
                customer: "Amanda Davis", 
                phone: "555-567-8901",
                service: "Hair Coloring", 
                date: "2026-02-21", 
                time: "1:00 PM",
                status: "CONFIRMED",
                notes: "Allergic to ammonia",
                created_at: "2026-02-19 11:30"
            },
            { 
                id: 6, 
                customer: "Daniel Lee", 
                phone: "555-678-9012",
                service: "Haircut", 
                date: "2026-02-22", 
                time: "10:00 AM",
                status: "BOOKED",
                notes: "",
                created_at: "2026-02-20 16:20"
            },
            { 
                id: 7, 
                customer: "Priya Singh", 
                phone: "555-789-0123",
                service: "Pedicure", 
                date: "2026-02-22", 
                time: "3:30 PM",
                status: "PENDING",
                notes: "Prefers gel polish",
                created_at: "2026-02-21 10:45"
            },
        ];
        
        renderAppointments();
    } catch (error) {
        showError('appointmentsTableBody', error.message);
    }
    
    hideLoading('appointmentsTableBody');
}

// Render appointments table
function renderAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;
    
    // Get filter values
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const fromDate = document.getElementById('filterFromDate')?.value || '';
    const toDate = document.getElementById('filterToDate')?.value || '';
    
    // Filter appointments
    let filtered = staffAppointments.filter(appt => {
        // Status filter
        if (statusFilter && appt.status !== statusFilter) return false;
        
        // Search filter
        if (searchTerm && !appt.customer.toLowerCase().includes(searchTerm) && 
            !appt.service.toLowerCase().includes(searchTerm) &&
            !appt.phone.includes(searchTerm)) return false;
        
        // Date range filter
        if (fromDate && appt.date < fromDate) return false;
        if (toDate && appt.date > toDate) return false;
        
        return true;
    });
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    // Paginate
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);
    
    // Render rows
    tbody.innerHTML = paginated.map(appt => {
        const statusClass = getStatusBadgeClass(appt.status);
        
        return `
        <tr>
            <td><strong>#${appt.id}</strong></td>
            <td>
                <strong>${appt.customer}</strong><br>
                <span style="color:#888;font-size:.8rem">${appt.phone}</span>
            </td>
            <td>
                ${formatDisplayDate(appt.date)}<br>
                <span style="color:#888;font-size:.8rem">${appt.time}</span>
            </td>
            <td>${appt.service}</td>
            <td><span class="badge ${statusClass}">${appt.status}</span></td>
            <td>${formatDisplayDateTime(appt.created_at)}</td>
            <td>
                <button class="btn btn-view btn-sm" onclick="viewAppointment(${appt.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-success btn-sm" onclick="updateAppointmentStatus(${appt.id}, 'COMPLETED')" 
                        ${appt.status === 'COMPLETED' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Complete
                </button>
            </td>
        </tr>
    `}).join('');
    
    // Update pagination info
    const infoEl = document.getElementById('appointmentsInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} appointments`;
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
    renderAppointments();
}

// View appointment details
function viewAppointment(appointmentId) {
    const appointment = staffAppointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const modal = document.getElementById('appointmentDetailModal');
    const content = document.getElementById('detailContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <label>Appointment ID</label>
                <span>#${appointment.id}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span class="badge ${getStatusBadgeClass(appointment.status)}">${appointment.status}</span>
            </div>
            <div class="detail-item">
                <label>Customer</label>
                <span>${appointment.customer}</span>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <span>${appointment.phone}</span>
            </div>
            <div class="detail-item">
                <label>Service</label>
                <span>${appointment.service}</span>
            </div>
            <div class="detail-item">
                <label>Date & Time</label>
                <span>${formatDisplayDate(appointment.date)} at ${appointment.time}</span>
            </div>
            <div class="detail-item full">
                <label>Notes</label>
                <span>${appointment.notes || 'No notes'}</span>
            </div>
            <div class="detail-item">
                <label>Booked On</label>
                <span>${formatDisplayDateTime(appointment.created_at)}</span>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
    try {
        // Call API to update status
        // const result = await AppointmentAPI.updateAppointmentStatus(appointmentId, status);
        
        // Mock update
        const appointment = staffAppointments.find(a => a.id === appointmentId);
        if (appointment) {
            appointment.status = status;
            renderAppointments();
            closeModal('appointmentDetailModal');
            showToast(`Appointment marked as ${status}`);
        }
    } catch (error) {
        showToast('Failed to update status: ' + error.message, 'error');
    }
}

// Filter appointments
function filterAppointments() {
    currentPage = 1;
    renderAppointments();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('filterFromDate').value = '';
    document.getElementById('filterToDate').value = '';
    
    currentPage = 1;
    renderAppointments();
}

// Toggle filter bar
function toggleFilterBar() {
    const filterBar = document.getElementById('filterBar');
    if (filterBar) {
        filterBar.classList.toggle('open');
    }
}

// Setup appointment listeners
function setupAppointmentListeners() {
    // Filter inputs
    const statusFilter = document.getElementById('filterStatus');
    const searchInput = document.getElementById('searchInput');
    const fromDate = document.getElementById('filterFromDate');
    const toDate = document.getElementById('filterToDate');
    
    if (statusFilter) statusFilter.addEventListener('change', filterAppointments);
    if (searchInput) searchInput.addEventListener('input', debounce(filterAppointments, 300));
    if (fromDate) fromDate.addEventListener('change', filterAppointments);
    if (toDate) toDate.addEventListener('change', filterAppointments);
    
    // Filter toggle button
    const filterBtn = document.querySelector('[onclick="toggleFilterBar()"]');
    if (filterBtn) filterBtn.addEventListener('click', toggleFilterBar);
    
    // Reset button
    const resetBtn = document.querySelector('[onclick="resetFilters()"]');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// Export functions
window.filterAppointments = filterAppointments;
window.resetFilters = resetFilters;
window.toggleFilterBar = toggleFilterBar;
window.viewAppointment = viewAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.changePage = changePage;