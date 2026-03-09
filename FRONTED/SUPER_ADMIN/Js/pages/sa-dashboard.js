// DASHBOARD PAGE - Redesigned to match ADMIN module
document.addEventListener("DOMContentLoaded", function() {
    console.log('Dashboard loaded');

    // Check authentication using AuthAPI.requireAuth
    if (!AuthAPI || !AuthAPI.requireAuth(['SUPER_ADMIN'])) {
        window.location.href = 'sa-login.html';
        return;
    }

    // Load user info into sidebar
    loadUserInfo();

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Logout clicked');

            if (confirm('Are you sure you want to logout?')) {
                try {
                    await AuthAPI.logout();
                    // Set flag to prevent auto-redirect back to dashboard
                    sessionStorage.setItem('justLoggedOut', 'true');
                    console.log('Logout successful, redirecting...');
                    window.location.href = 'sa-login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    // Still clear local storage even if API fails
                    TokenManager.removeToken();
                    TokenManager.removeUser();
                    localStorage.removeItem('refresh_token');
                    sessionStorage.setItem('justLoggedOut', 'true');
                    window.location.href = 'sa-login.html';
                }
            }
        });
    }

    // Load dashboard stats
    loadDashboardStats();
});

function loadUserInfo() {
    const user = TokenManager.getUser();
    if (user) {
        // Update sidebar user info
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) {
            userNameEl.textContent = user.username || user.email || 'Super Admin';
        }
        if (userRoleEl) {
            userRoleEl.textContent = user.role || 'Administrator';
        }
        if (userAvatarEl && user.username) {
            const initials = (user.username || 'SA').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            userAvatarEl.textContent = initials;
        }
    }
}

function loadDashboardStats() {
    if (typeof apiRequest !== 'function') {
        console.error('apiRequest not loaded');
        return;
    }

    apiRequest(API_ENDPOINTS.SALONS.LIST)
        .then(function(response) {
            var salons = (response.status === 'success') ? (response.data.items || []) : [];

            var totalSalonsEl = document.getElementById('totalSalons');
            var activeSalonsEl = document.getElementById('activeSalons');
            var inactiveSalonsEl = document.getElementById('inactiveSalons');

            if (totalSalonsEl) totalSalonsEl.textContent = salons.length;

            if (activeSalonsEl) {
                var activeCount = salons.filter(function(s) { return s.status === 1; }).length;
                activeSalonsEl.textContent = activeCount;
            }

            if (inactiveSalonsEl) {
                var inactiveCount = salons.filter(function(s) { return s.status === 0; }).length;
                inactiveSalonsEl.textContent = inactiveCount;
            }
        })
        .catch(function(error) {
            console.error('Error loading stats:', error);
            if (typeof showToast === 'function') {
                showToast('Failed to load dashboard statistics', 'error');
            }
        });
}
