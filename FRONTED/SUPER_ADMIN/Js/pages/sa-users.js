// USERS PAGE - API Integration
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    if (!TokenManager.isAuthenticated() || !TokenManager.hasRole(USER_ROLES.SUPER_ADMIN)) {
        window.location.href = '../../html/super-admin/sa-login.html';
        return;
    }

    // DOM Elements
    const addUserModal = document.getElementById('addUserModal');
    const passwordModal = document.getElementById('passwordModal');
    const editUserModal = document.getElementById('editUserModal');
    const addUserForm = document.getElementById('addUserForm');
    const editUserForm = document.getElementById('editUserForm');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeAddUserModal = document.getElementById('closeAddUserModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const closeEditUserModal = document.getElementById('closeEditUserModal');
    const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
    const cancelEditUserBtn = document.getElementById('cancelEditUserBtn');
    const closePasswordBtn = document.getElementById('closePasswordBtn');
    const userTableBody = document.getElementById('userTableBody');
    const userSearch = document.getElementById('userSearch');
    const salonFilter = document.getElementById('salonFilter');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resultsCount = document.getElementById('resultsCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const addSalonId = document.getElementById('addSalonId');

    let currentPage = 1;
    let allUsers = [];
    let availableSalons = [];
    let editingUserId = null;

    // --- API FUNCTIONS ---

    // Fetch all users (by salon - super admin can fetch from any salon)
    async function fetchUsers(salonId = '', role = '', status = '') {
        try {
            const targetSalonId = salonId || 1;
            let endpoint = API_ENDPOINTS.USERS.LIST_BY_SALON(targetSalonId);
            
            const params = [];
            if (role) params.push(`role=${role}`);
            if (status) params.push(`status=${status}`);
            
            if (params.length > 0) {
                endpoint += '?' + params.join('&');
            }

            const response = await apiRequest(endpoint);
            if (response.status === 'success') {
                allUsers = response.data.items || [];
                renderUsersTable(allUsers);
                updateResultsCount();
            } else {
                showToast('Failed to load users', 'error');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast(error.message || 'Network error', 'error');
        }
    }

    // Fetch single user details
    async function fetchUserById(userId) {
        try {
            const response = await apiRequest(API_ENDPOINTS.USERS.VIEW(userId));
            if (response.status === 'success') {
                return response.data;
            } else {
                showToast('Failed to load user details', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            showToast(error.message || 'Network error', 'error');
            return null;
        }
    }

    // Fetch all salons for dropdown
    async function fetchSalons() {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.LIST);
            if (response.status === 'success') {
                availableSalons = response.data.items || [];
                populateSalonDropdown();
                populateSalonFilter();
            }
        } catch (error) {
            console.error('Error fetching salons:', error);
        }
    }

    // Create salon admin
    async function createAdmin(salonId, userData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.USERS.CREATE_ADMIN(salonId), {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            if (response.status === 'success') {
                return response.data;
            } else {
                showToast(response.message || 'Failed to create admin', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            showToast(error.message || 'Network error', 'error');
            return null;
        }
    }

    // Update user
    async function updateUser(userId, userData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.USERS.UPDATE(userId), {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            if (response.status === 'success') {
                showToast('User updated successfully', 'success');
                return true;
            } else {
                showToast(response.message || 'Failed to update user', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // Toggle user status (SUPER_ADMIN only)
    async function toggleUserStatus(userId, status) {
        try {
            const response = await apiRequest(API_ENDPOINTS.USERS.TOGGLE_STATUS(userId), {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            if (response.status === 'success') {
                showToast(`User ${status.toLowerCase()} successfully`, 'success');
                fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
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

    function renderUsersTable(users) {
        if (!userTableBody) return;

        if (users.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-users" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No users found
                    </td>
                </tr>
            `;
            return;
        }

        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td class="purple-id">${user.user_id}</td>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar">${getInitials(user.username)}</div>
                        <div class="user-details">
                            <div class="user-name-text">${user.username}</div>
                            <div class="user-email-text">${user.email || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge ${user.role?.toLowerCase()}">
                        <i class="fa-solid fa-${user.role === 'ADMIN' ? 'user-shield' : 'user'}"></i>
                        ${user.role || 'USER'}
                    </span>
                </td>
                <td>${user.salon_name || `Salon ${user.salon_id}`}</td>
                <td>
                    <div class="status-toggle ${user.status === 'ACTIVE' ? 'active' : ''}" 
                         data-user-id="${user.user_id}" 
                         data-status="${user.status}"
                         style="cursor: pointer;">
                        <div class="status-toggle-knob"></div>
                    </div>
                </td>
                <td>${formatDate(user.last_login)}</td>
                <td>
                    <button class="btn-icon btn-view-user" data-user-id="${user.user_id}" title="View/Edit">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        userTableBody.querySelectorAll('.btn-view-user').forEach(btn => {
            btn.addEventListener('click', () => openEditUserModal(btn.dataset.userId));
        });

        userTableBody.querySelectorAll('.status-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const userId = toggle.dataset.userId;
                const currentStatus = toggle.dataset.status;
                const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                toggleUserStatus(userId, newStatus);
            });
        });
    }

    function updateResultsCount() {
        const start = (currentPage - 1) * 20 + 1;
        const end = Math.min(currentPage * 20, allUsers.length);
        resultsCount.textContent = `Showing ${allUsers.length > 0 ? start : 0}-${end} of ${allUsers.length} users`;
    }

    function updatePagination() {
        const totalPages = Math.ceil(allUsers.length / 20);
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function getInitials(username) {
        if (!username) return 'U';
        const words = username.split(/[\s_]/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    }

    // --- MODAL FUNCTIONS ---

    function openAddUserModalFunc() {
        addUserForm.reset();
        passwordModal.style.display = 'none';
        addUserModal.style.display = 'block';
    }

    function closeAddUserModalFunc() {
        addUserModal.style.display = 'none';
        addUserForm.reset();
    }

    function closePasswordModalFunc() {
        passwordModal.style.display = 'none';
    }

    function closeEditUserModalFunc() {
        editUserModal.style.display = 'none';
        editUserForm.reset();
        editingUserId = null;
    }

    async function openEditUserModal(userId) {
        const user = await fetchUserById(userId);
        if (!user) return;

        editingUserId = userId;
        document.getElementById('editUserModalTitle').textContent = 'Edit User';
        
        document.getElementById('editUserId').value = user.user_id;
        document.getElementById('editUsername').value = user.username || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editStatus').value = user.status || 'ACTIVE';

        // Super admin can edit status, regular admin cannot
        const statusGroup = document.getElementById('editStatusGroup');
        // For super admin, show status field
        statusGroup.style.display = 'block';

        editUserModal.style.display = 'block';
    }

    function showGeneratedPassword(password) {
        document.getElementById('generatedPassword').textContent = password;
        passwordModal.style.display = 'block';
    }

    // --- EVENT LISTENERS ---

    addUserBtn.addEventListener('click', openAddUserModalFunc);
    closeAddUserModal.addEventListener('click', closeAddUserModalFunc);
    closePasswordModal.addEventListener('click', closePasswordModalFunc);
    closeEditUserModal.addEventListener('click', closeEditUserModalFunc);
    cancelAddUserBtn.addEventListener('click', closeAddUserModalFunc);
    cancelEditUserBtn.addEventListener('click', closeEditUserModalFunc);
    closePasswordBtn.addEventListener('click', closePasswordModalFunc);

    // Add user form submit
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const salonId = parseInt(addSalonId.value);
        const userData = {
            username: document.getElementById('addUsername').value.trim(),
            email: document.getElementById('addEmail').value.trim(),
            role: 'ADMIN'
        };

        const password = document.getElementById('addPassword').value.trim();
        if (password) {
            userData.password = password;
        }

        const result = await createAdmin(salonId, userData);
        if (result) {
            closeAddUserModalFunc();
            
            // Show generated password if it was auto-generated
            if (result.generated_password) {
                showGeneratedPassword(result.generated_password);
            }
            
            fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
        }
    });

    // Edit user form submit
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = parseInt(document.getElementById('editUserId').value);
        const userData = {
            username: document.getElementById('editUsername').value.trim(),
            email: document.getElementById('editEmail').value.trim()
        };

        // Super admin can also update status
        const status = document.getElementById('editStatus').value;
        if (status) {
            userData.status = status;
        }

        const success = await updateUser(userId, userData);
        if (success) {
            closeEditUserModalFunc();
            fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
        }
    });

    // Filter changes
    salonFilter.addEventListener('change', () => {
        fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
    });

    roleFilter.addEventListener('change', () => {
        fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
    });

    statusFilter.addEventListener('change', () => {
        fetchUsers(salonFilter.value, roleFilter.value, statusFilter.value);
    });

    // Search
    userSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(user => 
            user.username.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
        renderUsersTable(filtered);
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            updateResultsCount();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allUsers.length / 20);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            updateResultsCount();
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === addUserModal) closeAddUserModalFunc();
        if (e.target === passwordModal) closePasswordModalFunc();
        if (e.target === editUserModal) closeEditUserModalFunc();
    });

    // --- HELPER FUNCTIONS ---

    function populateSalonDropdown() {
        if (!addSalonId) return;
        
        const options = '<option value="">Choose a salon...</option>' +
            availableSalons.filter(s => s.status === 1).map(s => 
                `<option value="${s.salon_id}">${s.salon_name}</option>`
            ).join('');
        
        addSalonId.innerHTML = options;
    }

    function populateSalonFilter() {
        if (!salonFilter) return;
        
        const options = '<option value="">All Salons</option>' +
            availableSalons.filter(s => s.status === 1).map(s => 
                `<option value="${s.salon_id}">${s.salon_name}</option>`
            ).join('');
        
        salonFilter.innerHTML = options;
    }

    // Initialize
    fetchSalons();
    fetchUsers();

    // Logout functionality - SAME AS DASHBOARD
    setTimeout(function() {
        var logoutBtn = document.getElementById('logoutBtn');
        console.log('Users - Logout button found:', logoutBtn);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Users - Logout clicked');
                // Clear ALL auth data IMMEDIATELY
                localStorage.clear();
                sessionStorage.clear();
                sessionStorage.setItem('justLoggedOut', 'true');
                console.log('Users - Storage cleared!');
                // Redirect to login
                window.location.href = 'sa-login.html';
            });
        } else {
            console.error('Users - Logout button NOT found!');
        }
    }, 200);
});
