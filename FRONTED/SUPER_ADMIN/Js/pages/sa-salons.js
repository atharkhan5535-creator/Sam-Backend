// SALONS PAGE - API Integration - Redesigned to match ADMIN module
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication using AuthAPI.requireAuth
    if (!AuthAPI || !AuthAPI.requireAuth(['SUPER_ADMIN'])) {
        window.location.href = 'sa-login.html';
        return;
    }

    // DOM Elements
    const modal = document.getElementById('salonModal');
    const viewModal = document.getElementById('viewSalonModal');
    const salonForm = document.getElementById('salonForm');
    const addBtn = document.getElementById('addSalonBtn');
    const closeBtn = document.getElementById('closeModal');
    const closeViewBtn = document.getElementById('closeViewModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeViewModalBtn = document.getElementById('closeViewBtn');
    const editFromViewBtn = document.getElementById('editFromViewBtn');
    const tbody = document.getElementById('salonTableBody');
    const searchInput = document.getElementById('salonSearch');
    const statusFilter = document.getElementById('statusFilter');
    const resultsCount = document.getElementById('resultsCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');

    let editingSalonId = null;
    let currentPage = 1;
    let allSalons = [];
    let filteredSalons = [];

    // --- API FUNCTIONS ---

    // Fetch all salons
    async function fetchSalons(status = '') {
        try {
            let endpoint = API_ENDPOINTS.SALONS.LIST;
            if (status) {
                endpoint += `?status=${status}`;
            }
            
            const response = await apiRequest(endpoint);
            
            if (response.status === 'success') {
                allSalons = response.data.items || [];
                filteredSalons = [...allSalons];
                renderTable(filteredSalons);
                updateResultsCount();
                updatePagination();
            } else {
                showToast('Failed to load salons', 'error');
            }
        } catch (error) {
            console.error('Error fetching salons:', error);
            showToast(error.message || 'Network error', 'error');
        }
    }

    // Fetch single salon details
    async function fetchSalonById(salonId) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.VIEW(salonId), 'GET');
            
            if (response.status === 'success') {
                return response.data;
            } else {
                showToast('Failed to load salon details', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching salon:', error);
            showToast('Network error', 'error');
            return null;
        }
    }

    // Create new salon
    async function createSalon(salonData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.CREATE, {
                method: 'POST',
                body: JSON.stringify(salonData)
            });
            
            if (response.status === 'success') {
                showToast('Salon created successfully', 'success');
                return true;
            } else {
                showToast(response.message || 'Failed to create salon', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error creating salon:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // Update existing salon
    async function updateSalon(salonId, salonData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.UPDATE(salonId), {
                method: 'PUT',
                body: JSON.stringify(salonData)
            });
            
            if (response.status === 'success') {
                showToast('Salon updated successfully', 'success');
                return true;
            } else {
                showToast(response.message || 'Failed to update salon', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error updating salon:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // Toggle salon status
    async function toggleSalonStatus(salonId, status) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.TOGGLE_STATUS(salonId), {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            
            if (response.status === 'success') {
                showToast(`Salon ${status === 1 ? 'activated' : 'deactivated'} successfully`, 'success');
                fetchSalons(statusFilter.value);
                return true;
            } else {
                showToast(response.message || 'Failed to update status', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // --- RENDER FUNCTIONS ---

    function renderTable(salons) {
        tbody.innerHTML = '';
        
        if (salons.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-shop" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No salons found
                    </td>
                </tr>
            `;
            return;
        }

        salons.forEach(salon => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="purple-id">${salon.salon_id}</td>
                <td>
                    <div class="salon-logo-cell">
                        ${salon.salon_logo 
                            ? `<div class="salon-logo-thumb"><img src="${salon.salon_logo}" alt="${salon.salon_name}"></div>`
                            : `<div class="salon-logo-thumb"><i class="fa-solid fa-shop"></i></div>`
                        }
                        <div>
                            <div class="salon-name">${salon.salon_name}</div>
                            <div class="salon-email">${salon.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${salon.salon_ownername || '-'}</td>
                <td>${salon.email || '-'}</td>
                <td>${salon.phone || '-'}</td>
                <td>${salon.city || '-'}</td>
                <td>${salon.state || '-'}</td>
                <td>
                    <div class="status-toggle ${salon.status === 1 ? 'active' : ''}" 
                         data-salon-id="${salon.salon_id}" 
                         data-status="${salon.status}"
                         style="cursor: pointer;">
                        <div class="status-toggle-knob"></div>
                    </div>
                </td>
                <td>
                    <button class="btn-icon btn-view" data-salon-id="${salon.salon_id}" title="View">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit-salon" data-salon-id="${salon.salon_id}" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        updateResultsCount();
    }

    function updateResultsCount() {
        const start = (currentPage - 1) * 20 + 1;
        const end = Math.min(currentPage * 20, filteredSalons.length);
        resultsCount.textContent = `Showing ${filteredSalons.length > 0 ? start : 0}-${end} of ${filteredSalons.length} salons`;
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredSalons.length / 20);
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    // View salon details in modal
    function renderSalonProfile(salon) {
        const content = document.getElementById('salonProfileContent');
        content.innerHTML = `
            <div class="salon-profile-header">
                ${salon.salon_logo 
                    ? `<div class="salon-profile-logo"><img src="${salon.salon_logo}" alt="${salon.salon_name}"></div>`
                    : `<div class="salon-profile-logo"><i class="fa-solid fa-shop"></i></div>`
                }
                <div class="salon-profile-info">
                    <h3>${salon.salon_name}</h3>
                    <p>${salon.salon_ownername} • ${salon.email}</p>
                    <p><span class="status-badge ${salon.status === 1 ? 'active' : 'inactive'}">${salon.status === 1 ? 'Active' : 'Inactive'}</span></p>
                </div>
            </div>
            <div class="profile-details-grid">
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${salon.phone || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">GST Number</div>
                    <div class="detail-value">${salon.gst_num || '-'}</div>
                </div>
                <div class="detail-item full-width">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${salon.address || '-'}</div>
                    <div class="detail-value">${salon.city}, ${salon.state}, ${salon.country}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Created On</div>
                    <div class="detail-value">${formatDate(salon.created_at)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Updated</div>
                    <div class="detail-value">${formatDate(salon.updated_at)}</div>
                </div>
            </div>
        `;
    }

    // --- FORM HANDLING ---

    function openAddModal() {
        editingSalonId = null;
        document.getElementById('modalTitle').innerText = "Add New Salon";
        salonForm.reset();
        document.getElementById('salonStatus').value = "1";
        document.getElementById('logoPreview').classList.remove('show');
        modal.style.display = 'block';
    }

    async function openEditModal(salonId) {
        const salon = await fetchSalonById(salonId);
        if (!salon) return;

        editingSalonId = salonId;
        document.getElementById('modalTitle').innerText = "Edit Salon";
        
        document.getElementById('salonName').value = salon.salon_name || '';
        document.getElementById('salonOwnername').value = salon.salon_ownername || '';
        document.getElementById('salonEmail').value = salon.email || '';
        document.getElementById('salonPhone').value = salon.phone || '';
        document.getElementById('gstNum').value = salon.gst_num || '';
        document.getElementById('salonAddress').value = salon.address || '';
        document.getElementById('salonCity').value = salon.city || '';
        document.getElementById('salonState').value = salon.state || '';
        document.getElementById('salonCountry').value = salon.country || '';
        document.getElementById('salonStatus').value = salon.status || '1';
        
        if (salon.salon_logo) {
            document.getElementById('logoPreviewImg').src = salon.salon_logo;
            document.getElementById('logoPreview').classList.add('show');
        } else {
            document.getElementById('logoPreview').classList.remove('show');
        }
        
        modal.style.display = 'block';
    }

    async function openViewModal(salonId) {
        const salon = await fetchSalonById(salonId);
        if (!salon) return;

        renderSalonProfile(salon);
        viewModal.style.display = 'block';
    }

    function closeModalFunc() {
        modal.style.display = 'none';
        salonForm.reset();
        editingSalonId = null;
    }

    function closeViewModalFunc() {
        viewModal.style.display = 'none';
    }

    // --- EVENT LISTENERS ---

    addBtn.addEventListener('click', openAddModal);
    closeBtn.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    closeViewBtn.addEventListener('click', closeViewModalFunc);
    closeViewModalBtn.addEventListener('click', closeViewModalFunc);

    editFromViewBtn.addEventListener('click', () => {
        const viewSalonId = document.querySelector('#salonProfileContent .status-badge')?.closest('.salon-profile-header')?.nextElementSibling?.querySelector('.detail-item')?.parentElement?.dataset?.salonId;
        closeViewModalFunc();
        // Get salon ID from the currently viewed salon
        const salonId = document.querySelector('.btn-view')?.dataset?.salonId || 
                       document.querySelector('.btn-edit-salon')?.dataset?.salonId;
        if (salonId) {
            openEditModal(salonId);
        }
    });

    // Form submit handler
    salonForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const salonData = {
            salon_name: document.getElementById('salonName').value.trim(),
            salon_ownername: document.getElementById('salonOwnername').value.trim(),
            email: document.getElementById('salonEmail').value.trim(),
            phone: document.getElementById('salonPhone').value.trim(),
            gst_num: document.getElementById('gstNum').value.trim(),
            address: document.getElementById('salonAddress').value.trim(),
            city: document.getElementById('salonCity').value.trim(),
            state: document.getElementById('salonState').value.trim(),
            country: document.getElementById('salonCountry').value.trim(),
            status: parseInt(document.getElementById('salonStatus').value)
        };

        // Handle logo upload (in real implementation, this would upload to server)
        const logoFile = document.getElementById('salonLogo').files[0];
        if (logoFile) {
            // For now, we'll skip logo upload - implement file upload API separately
            console.log('Logo file selected:', logoFile.name);
        }

        let success;
        if (editingSalonId) {
            success = await updateSalon(editingSalonId, salonData);
        } else {
            success = await createSalon(salonData);
        }

        if (success) {
            closeModalFunc();
            fetchSalons(statusFilter.value);
        }
    });

    // Table actions (edit, view, status toggle)
    tbody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.btn-view');
        const editBtn = e.target.closest('.btn-edit-salon');
        const statusToggle = e.target.closest('.status-toggle');

        if (viewBtn) {
            const salonId = viewBtn.dataset.salonId;
            openViewModal(salonId);
        }

        if (editBtn) {
            const salonId = editBtn.dataset.salonId;
            openEditModal(salonId);
        }

        if (statusToggle) {
            const salonId = statusToggle.dataset.salonId;
            const currentStatus = parseInt(statusToggle.dataset.status);
            const newStatus = currentStatus === 1 ? 0 : 1;
            toggleSalonStatus(salonId, newStatus);
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredSalons = allSalons.filter(salon => 
            salon.salon_name.toLowerCase().includes(term) ||
            salon.salon_ownername.toLowerCase().includes(term) ||
            salon.email?.toLowerCase().includes(term) ||
            salon.phone?.toLowerCase().includes(term) ||
            salon.city?.toLowerCase().includes(term)
        );
        renderTable(filteredSalons);
    });

    // Status filter
    statusFilter.addEventListener('change', (e) => {
        const status = e.target.value;
        if (status === '') {
            filteredSalons = [...allSalons];
        } else {
            filteredSalons = allSalons.filter(salon => salon.status === parseInt(status));
        }
        renderTable(filteredSalons);
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredSalons.length / 20);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
        if (e.target === viewModal) closeViewModalFunc();
    });

    // Initial load
    fetchSalons();

    // Logout functionality - Use AuthAPI
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Salons - Logout clicked');

            if (confirm('Are you sure you want to logout?')) {
                try {
                    await AuthAPI.logout();
                    sessionStorage.setItem('justLoggedOut', 'true');
                    console.log('Salons - Logout successful, redirecting...');
                    window.location.href = 'sa-login.html';
                } catch (error) {
                    console.error('Salons - Logout error:', error);
                    TokenManager.removeToken();
                    TokenManager.removeUser();
                    localStorage.removeItem('refresh_token');
                    sessionStorage.setItem('justLoggedOut', 'true');
                    window.location.href = 'sa-login.html';
                }
            }
        });
    }
});
