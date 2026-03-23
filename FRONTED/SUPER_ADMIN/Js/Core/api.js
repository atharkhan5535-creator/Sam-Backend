/* =============================================
   SAM SUPER ADMIN - CORE API CONFIGURATION
   Redesigned to match ADMIN module structure
   Base URL, interceptors, and error handling
   ============================================= */

// Base API URL - points to backend
const API_BASE_URL = window.location.origin + '/Sam-Backend/BACKEND/public/index.php/api';

// API Response Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

// API Response Status
const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error'
};

// User Roles
const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER'
};

// Appointment Status
const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NOT_YET_APPROVED: 'NOT_YET_APPROVED'
};

// Payment Status
const PAYMENT_STATUS = {
    PAID: 'PAID',
    UNPAID: 'UNPAID',
    PARTIAL: 'PARTIAL',
    REFUNDED: 'REFUNDED'
};

// Payment Modes
const PAYMENT_MODES = {
    CASH: 'CASH',
    UPI: 'UPI',
    CARD: 'CARD',
    BANK: 'BANK',
    NET_BANKING: 'NET_BANKING',
    WALLET: 'WALLET',
    CHEQUE: 'CHEQUE'
};

// Status enums
const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    BOOKED: 'BOOKED',
    EXPIRED: 'EXPIRED',
    BLOCKED: 'BLOCKED',
    ON_LEAVE: 'ON_LEAVE',
    TERMINATED: 'TERMINATED'
};

// Plan Types
const PLAN_TYPES = {
    FLAT: 'flat',
    PER_APPOINTMENTS: 'per-appointments',
    PERCENTAGE_PER_APPOINTMENTS: 'Percentage-per-appointments'
};

// Token Management
const TokenManager = {
    getToken: () => localStorage.getItem('auth_token'),

    setToken: (token) => {
        localStorage.setItem('auth_token', token);
    },

    removeToken: () => {
        localStorage.removeItem('auth_token');
    },

    getUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const parsed = JSON.parse(userStr);
            return parsed || null;
        } catch (e) {
            console.error('TokenManager.getUser() - Error parsing user:', e);
            return null;
        }
    },

    setUser: (user) => {
        try {
            const userStr = JSON.stringify(user);
            localStorage.setItem('user', userStr);
        } catch (e) {
            console.error('TokenManager.setUser() - Error saving user:', e);
        }
    },

    removeUser: () => localStorage.removeItem('user'),

    isAuthenticated: () => !!TokenManager.getToken(),

    hasRole: (role) => {
        const user = TokenManager.getUser();
        if (!user) return false;
        const userRole = user.role || user.user_type || user.role_name;
        return userRole === role;
    },

    hasAnyRole: (roles) => {
        const user = TokenManager.getUser();
        if (!user) return false;
        const userRole = user.role || user.user_type || user.role_name;
        return roles.includes(userRole);
    },

    getSalonId: () => {
        const user = TokenManager.getUser();
        return user ? user.salon_id : null;
    },

    getUserId: () => {
        const user = TokenManager.getUser();
        return user ? user.user_id : null;
    }
};

// Check if JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        // Add 5 minute buffer
        return payload.exp * 1000 < (Date.now() - 300000);
    } catch (e) {
        return true;
    }
}

// Check if token needs refresh soon (within 5 minutes)
function isTokenExpiringSoon(token) {
    if (!token) return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        // Check if expires within 5 minutes
        return payload.exp * 1000 < (Date.now() + 300000);
    } catch (e) {
        return true;
    }
}

// Get CSRF token from localStorage
function getCsrfToken() {
    return localStorage.getItem('csrf_token') || '';
}

// Store CSRF token from login response
function setCsrfToken(token) {
    if (token) {
        localStorage.setItem('csrf_token', token);
    }
}

// API Request Helper with automatic error handling
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken()
    };

    const token = TokenManager.getToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
        console.log('API Request - Token found:', token.substring(0, 50) + '...');
    } else {
        console.log('API Request - No token found');
    }

    // Check if token is expired or expiring soon and auto-refresh
    if (token && isTokenExpiringSoon(token)) {
        console.log('Token expiring soon, attempting refresh...');
        try {
            const refreshResult = await AuthAPI.refreshToken();
            if (!refreshResult.success) {
                throw new Error('Token refresh failed');
            }
            console.log('Token refreshed successfully');
        } catch (error) {
            // Refresh failed, clear tokens and redirect to login
            console.error('Token refresh failed, redirecting to login');
            TokenManager.removeToken();
            TokenManager.removeUser();
            localStorage.removeItem('refresh_token');
            // Use dynamic path to handle both root and subdirectory pages
            const currentPath = window.location.pathname;
            const loginPath = currentPath.includes('/html/')
                ? './sa-login.html'
                : '../../html/super-admin/sa-login.html';
            window.location.href = loginPath;
            throw new Error('Session expired. Please login again.');
        }
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle unauthorized - token expired
            if (response.status === HTTP_STATUS.UNAUTHORIZED) {
                TokenManager.removeToken();
                TokenManager.removeUser();
                localStorage.removeItem('refresh_token');
                // Get relative path based on current location
                const currentPath = window.location.pathname;
                const isHtmlFolder = currentPath.includes('/html/');
                const loginPath = isHtmlFolder
                    ? './sa-login.html'
                    : '../../html/super-admin/sa-login.html';
                window.location.href = loginPath;
                throw new Error('Session expired. Please login again.');
            }

            // Handle forbidden
            if (response.status === HTTP_STATUS.FORBIDDEN) {
                throw new Error('You do not have permission to perform this action.');
            }

            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// =============================================
// AUTHENTICATION API MODULE
// Handles login, logout, token refresh with backend
// For SUPER_ADMIN only
// =============================================

const AuthAPI = {
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} loginType - Always 'SUPER_ADMIN' for this login
     */
    login: async (email, password, loginType = 'SUPER_ADMIN') => {
        const errors = [];

        // Validation
        const emailError = Validators.email(email);
        if (emailError) errors.push(emailError);

        const passError = Validators.required(password, 'Password');
        if (passError) errors.push(passError);

        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            const requestBody = {
                email,
                password,
                login_type: loginType
            };

            // Make raw fetch call without auth header for login
            const url = `${API_BASE_URL}/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            // Backend returns: { status: 'success', data: { access_token, refresh_token, expires_in } }
            // User info is encoded in the JWT token
            if (data.status === API_STATUS.SUCCESS && data.data) {
                const token = data.data.access_token || data.data.token;
                const refreshToken = data.data.refresh_token;

                if (!token) {
                    return { success: false, message: 'No token received from server' };
                }

                console.log('Token received:', token.substring(0, 50) + '...');

                // Store tokens
                TokenManager.setToken(token);
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                    console.log('Refresh token stored');
                }

                // Store CSRF token if provided
                if (data.data.csrf_token) {
                    setCsrfToken(data.data.csrf_token);
                    console.log('CSRF token stored');
                }

                // Decode JWT token to get user info
                let userInfo = {};
                try {
                    // Validate token format
                    if (!token || typeof token !== 'string') {
                        throw new Error('Invalid token format');
                    }

                    const parts = token.split('.');
                    if (parts.length !== 3) {
                        throw new Error('Invalid JWT format');
                    }

                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(atob(base64));
                    console.log('JWT payload:', payload);

                    // Extract user info from JWT payload
                    // Handle different possible field names from backend
                    userInfo = {
                        user_id: payload.user_id || payload.id || payload.sub || payload.userId,
                        salon_id: payload.salon_id || payload.salonId || null,
                        username: payload.username || payload.name || payload.email || payload.userName,
                        email: payload.email,
                        role: payload.role || payload.user_type || payload.role_name || 'SUPER_ADMIN',
                        status: payload.status || payload.user_status || 'ACTIVE',
                        iat: payload.iat,
                        exp: payload.exp
                    };

                    console.log('Extracted user info:', userInfo);
                    console.log('Role field check - payload.role:', payload.role, '| payload.user_type:', payload.user_type, '| payload.role_name:', payload.role_name);
                    console.log('Final userInfo.role:', userInfo.role);
                } catch (e) {
                    console.error('Failed to decode JWT:', e);
                    // Fallback user info
                    userInfo = {
                        user_id: data.data?.user_id || data.data?.id || null,
                        email: email,
                        username: email.split('@')[0],
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE',
                        salon_id: null
                    };
                    console.log('Using fallback user info:', userInfo);
                }

                TokenManager.setUser(userInfo);
                console.log('User info stored in localStorage:', userInfo);
                console.log('Stored user.role:', userInfo.role);

                return { success: true, data: data.data, user: userInfo };
            }

            return { success: false, message: data.message || data.data?.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current authenticated user info
     */
    getMe: async () => {
        try {
            const response = await apiRequest('/auth/me', {
                method: 'GET'
            });

            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to get user info' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Logout current user
     */
    logout: async () => {
        try {
            // Try to call logout API (but don't fail if it errors)
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    await apiRequest('/auth/logout', {
                        method: 'POST',
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                } catch (error) {
                    console.warn('Logout API call failed, but clearing local tokens:', error);
                }
            }
        } finally {
            // Always clear local storage
            TokenManager.removeToken();
            TokenManager.removeUser();
            localStorage.removeItem('refresh_token');
            return { success: true };
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                return { success: false, message: 'No refresh token available' };
            }

            const response = await apiRequest('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.status === API_STATUS.SUCCESS) {
                TokenManager.setToken(response.data.token);
                return { success: true, token: response.data.token };
            }
            return { success: false, message: 'Token refresh failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Check if user is authenticated and has required role
     * @param {string|string[]} requiredRoles - Single role or array of roles
     */
    requireAuth: (requiredRoles = null) => {
        const token = TokenManager.getToken();
        const user = TokenManager.getUser();

        if (!token || !user) {
            // Not authenticated, redirect to login
            const currentPath = window.location.pathname;
            const isHtmlFolder = currentPath.includes('/html/');
            const loginPath = isHtmlFolder
                ? './sa-login.html'
                : '../../html/super-admin/sa-login.html';
            window.location.href = loginPath;
            return false;
        }

        // Check role if required
        if (requiredRoles) {
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            if (!roles.includes(user.role)) {
                // Unauthorized, redirect to home
                const indexPath = isHtmlFolder
                    ? '../index.html'
                    : '../../index.html';
                window.location.href = indexPath;
                return false;
            }
        }

        return true;
    },

    /**
     * Get redirect URL based on user role after login
     * @param {object} user - User object with role property
     * @returns {string} Redirect URL based on role
     */
    getRedirectUrl: (user) => {
        if (!user) return '../../index.html';

        // SUPER_ADMIN login - only handles SUPER_ADMIN role
        if (user.role === USER_ROLES.SUPER_ADMIN) {
            return 'sa-dashboard.html';
        }

        // Unknown role or other roles - redirect to main index
        return '../../index.html';
    }
};

// Toast Notification
function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
        min-width: 280px;
    `;

    const bgColor = type === 'success' ? '#10b981' :
                    type === 'error' ? '#ef4444' :
                    type === 'warning' ? '#f59e0b' : '#7c3aed';
    toast.style.background = bgColor;

    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Form Validation Utilities
const Validators = {
    required: (value, fieldName) => {
        if (!value || value.toString().trim() === '') {
            return `${fieldName} is required`;
        }
        return null;
    },

    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return 'Invalid email format';
        }
        return null;
    },

    phone: (phone) => {
        const regex = /^[0-9]{10}$/;
        if (!regex.test(phone.replace(/[^0-9]/g, ''))) {
            return 'Invalid phone number (10 digits required)';
        }
        return null;
    },

    password: (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return null;
    },

    min: (value, min, fieldName) => {
        if (parseFloat(value) < min) {
            return `${fieldName} must be at least ${min}`;
        }
        return null;
    },

    max: (value, max, fieldName) => {
        if (parseFloat(value) > max) {
            return `${fieldName} must not exceed ${max}`;
        }
        return null;
    },

    date: (date) => {
        if (isNaN(new Date(date).getTime())) {
            return 'Invalid date format';
        }
        return null;
    },

    futureDate: (date, fieldName) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
            return `${fieldName} must be a future date`;
        }
        return null;
    },

    gst: (gst) => {
        if (!gst) return null; // Optional field
        const regex = /^[0-9A-Z]{15}$/;
        if (!regex.test(gst)) {
            return 'Invalid GST number (15 characters required)';
        }
        return null;
    }
};

// Format currency
function formatCurrency(amount, currency = '₹') {
    if (amount === null || amount === undefined) return `${currency}0`;
    return `${currency}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge class
function getStatusBadgeClass(status) {
    const statusLower = status ? status.toLowerCase() : '';
    const statusMap = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'confirmed': 'status-confirmed',
        'pending': 'status-pending',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'paid': 'status-paid',
        'unpaid': 'status-unpaid',
        'partial': 'status-partial',
        'refunded': 'status-refunded',
        'expired': 'status-expired',
        'blocked': 'status-blocked'
    };
    return statusMap[statusLower] || 'status-pending';
}

// Create status badge HTML
function createStatusBadge(status) {
    const className = getStatusBadgeClass(status);
    return `<span class="status-badge ${className}">${status}</span>`;
}

// Get initials from name
function getInitials(name) {
    if (!name) return 'U';
    const words = name.split(/[\s_]/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Logout function
function logout() {
    // Call logout API to invalidate token (optional)
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        }).catch(() => {}); // Ignore errors
    }

    // Clear local storage
    TokenManager.removeToken();
    TokenManager.removeUser();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Redirect to login page
    const currentPath = window.location.pathname;
    const isHtmlFolder = currentPath.includes('/html/');
    const loginPath = isHtmlFolder 
        ? './sa-login.html' 
        : '../../html/super-admin/sa-login.html';
    
    window.location.href = loginPath;
}

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
window.HTTP_STATUS = HTTP_STATUS;
window.API_STATUS = API_STATUS;
window.USER_ROLES = USER_ROLES;
window.APPOINTMENT_STATUS = APPOINTMENT_STATUS;
window.PAYMENT_STATUS = PAYMENT_STATUS;
window.PAYMENT_MODES = PAYMENT_MODES;
window.STATUS = STATUS;
window.PLAN_TYPES = PLAN_TYPES;
window.TokenManager = TokenManager;
window.AuthAPI = AuthAPI;
window.apiRequest = apiRequest;
window.showToast = showToast;
window.Validators = Validators;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getStatusBadgeClass = getStatusBadgeClass;
window.createStatusBadge = createStatusBadge;
window.getInitials = getInitials;
window.logout = logout;
window.isTokenExpired = isTokenExpired;
window.isTokenExpiringSoon = isTokenExpiringSoon;
window.getCsrfToken = getCsrfToken;
window.setCsrfToken = setCsrfToken;
