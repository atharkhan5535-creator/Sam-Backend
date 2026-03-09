/* =============================================
   UNIFIED NAVIGATION COMPONENT
   Handles navigation for both ADMIN and STAFF roles
   ============================================= */

const NavigationConfig = {
    // Navigation items for ADMIN
    admin: [
        { name: 'Dashboard', icon: 'fa-chart-line', href: 'dashboard.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Appointments', icon: 'fa-calendar-check', href: 'appointments.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Customers', icon: 'fa-users', href: 'customers.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Staff', icon: 'fa-user-tie', href: 'staff.html', roles: ['ADMIN'] },
        { name: 'Services', icon: 'fa-cut', href: 'services.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Packages', icon: 'fa-gift', href: 'package.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Payments', icon: 'fa-credit-card', href: 'payments.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Inventory', icon: 'fa-boxes', href: 'inventory.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Schedules', icon: 'fa-calendar-alt', href: 'schedules.html', roles: ['ADMIN', 'STAFF'] },
        { name: 'Settings', icon: 'fa-cog', href: 'settings.html', roles: ['ADMIN'] },
        { name: 'Reports', icon: 'fa-file-alt', href: 'reports.html', roles: ['ADMIN', 'STAFF'] }
    ],

    // Navigation items for STAFF (limited access)
    staff: [
        { name: 'Dashboard', icon: 'fa-chart-line', href: 'dashboard.html', roles: ['STAFF'] },
        { name: 'Appointments', icon: 'fa-calendar-check', href: 'appointments.html', roles: ['STAFF'] },
        { name: 'Customers', icon: 'fa-users', href: 'customers.html', roles: ['STAFF'] },
        { name: 'Services', icon: 'fa-cut', href: 'services.html', roles: ['STAFF'] },
        { name: 'Packages', icon: 'fa-gift', href: 'package.html', roles: ['STAFF'] },
        { name: 'Inventory', icon: 'fa-boxes', href: 'inventory.html', roles: ['STAFF'] },
        { name: 'Schedules', icon: 'fa-calendar-alt', href: 'schedules.html', roles: ['STAFF'] },
        { name: 'Profile', icon: 'fa-user', href: 'profile.html', roles: ['STAFF'] }
    ]
};

// Navigation renderer
const Navigation = {
    /**
     * Render navigation based on user role
     * @param {string} containerId - ID of container element
     * @param {string} currentPage - Current page filename for active state
     */
    render: (containerId, currentPage = '') => {
        const user = TokenManager.getUser();
        if (!user) return;

        const role = user.role;
        const navItems = role === 'ADMIN' ? NavigationConfig.admin : NavigationConfig.staff;
        
        const container = document.getElementById(containerId);
        if (!container) return;

        const navHTML = navItems.map(item => {
            const isActive = currentPage && item.href === currentPage ? 'active' : '';
            return `
                <li>
                    <a href="${item.href}" class="${isActive}">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.name}</span>
                    </a>
                </li>
            `;
        }).join('');

        container.innerHTML = navHTML;
    },

    /**
     * Setup logout functionality
     */
    setupLogout: () => {
        const logoutLinks = document.querySelectorAll('.logout-btn, [data-action="logout"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                await Navigation.handleLogout();
            });
        });
    },

    /**
     * Handle logout
     */
    handleLogout: async () => {
        if (confirm('Are you sure you want to logout?')) {
            await AuthAPI.logout();
            // Use relative path to avoid hardcoded URL issues
            window.location.href = 'index.html';
        }
    },

    /**
     * Update user info display in navigation
     */
    updateUserInfo: () => {
        const user = TokenManager.getUser();
        if (!user) return;

        // Update username display if element exists
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const userEmailEl = document.getElementById('userEmail');

        if (userNameEl) {
            userNameEl.textContent = user.username || user.name || 'User';
        }
        if (userRoleEl) {
            userRoleEl.textContent = user.role || 'User';
        }
        if (userEmailEl) {
            userEmailEl.textContent = user.email || '';
        }
    },

    /**
     * Initialize navigation with role-based access control
     */
    init: (currentPage = '') => {
        // Check authentication
        if (!TokenManager.isAuthenticated()) {
            // Use dynamic path to handle both root and subdirectory pages
            const currentPath = window.location.pathname;
            const loginPath = currentPath.includes('/admin/') || currentPath.includes('/staff/') 
                ? '../login.html' 
                : 'login.html';
            window.location.href = loginPath;
            return;
        }

        // Render navigation
        Navigation.render('navLinks', currentPage);

        // Setup logout
        Navigation.setupLogout();

        // Update user info
        Navigation.updateUserInfo();

        // Setup mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const nav = document.getElementById('nav');
        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                nav.classList.toggle('open');
            });
        }
    }
};

// Helper function to check if current user has permission for a page
function hasPermission(requiredRole) {
    const user = TokenManager.getUser();
    if (!user) return false;

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
}

// Helper function to redirect if unauthorized
function requirePermission(requiredRole, redirectUrl = null) {
    if (!hasPermission(requiredRole)) {
        window.location.href = redirectUrl || '../index.html';
        return false;
    }
    return true;
}

window.Navigation = Navigation;
window.hasPermission = hasPermission;
window.requirePermission = requirePermission;
