/* =============================================
   SAM BACKEND - CORE API CONFIGURATION
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
    PARTIAL: 'PARTIAL'
};

// Payment Modes
const PAYMENT_MODES = {
    CASH: 'CASH',
    UPI: 'UPI',
    CARD: 'CARD',
    BANK: 'BANK',
    NET_BANKING: 'NET_BANKING'
};

// Document Types (for staff documents)
const DOC_TYPES = {
    CERTIFICATION: 'CERTIFICATION',
    ID: 'ID',
    CONTRACT: 'CONTRACT',
    OTHER: 'OTHER'
};

// Incentive Types
const INCENTIVE_TYPES = {
    SERVICE_COMMISSION: 'SERVICE_COMMISSION',
    BONUS: 'BONUS',
    TARGET_ACHIEVEMENT: 'TARGET_ACHIEVEMENT'
};

// Calculation Types
const CALCULATION_TYPES = {
    FIXED: 'FIXED',
    PERCENTAGE: 'PERCENTAGE'
};

// Gender Options
const GENDER = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other'
};

// Employment Types
const EMPLOYMENT_TYPE = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract'
};

// Availability Status
const AVAILABILITY = {
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    ON_LEAVE: 'On Leave'
};

// Status enums
const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    BOOKED: 'BOOKED'
};

// Token Management
const TokenManager = {
    getToken: () => localStorage.getItem('auth_token'),

    setToken: (token) => localStorage.setItem('auth_token', token),

    removeToken: () => localStorage.removeItem('auth_token'),

    getUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const parsed = JSON.parse(userStr);
            return parsed || null;
        } catch (e) {
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
        return user && user.role === role;
    },

    hasAnyRole: (roles) => {
        const user = TokenManager.getUser();
        return user && roles.includes(user.role);
    },

    getSalonId: () => {
        const user = TokenManager.getUser();
        return user ? user.salon_id : null;
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
    }

    // Check if token is expired or expiring soon and auto-refresh
    if (token && isTokenExpiringSoon(token)) {
        try {
            const refreshResult = await AuthAPI.refreshToken();
            if (!refreshResult.success) {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            // Refresh failed, clear tokens and redirect to login
            TokenManager.removeToken();
            TokenManager.removeUser();
            localStorage.removeItem('refresh_token');
            // Use dynamic path to handle both root and subdirectory pages
            const currentPath = window.location.pathname;
            const loginPath = currentPath.includes('/admin/') || currentPath.includes('/staff/') 
                ? '../login.html' 
                : 'login.html';
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
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response from', url, ':', text.substring(0, 500));
            throw new Error('Server returned non-JSON response. Check server logs.');
        }
        
        const data = await response.json();

        if (!response.ok) {
            // Handle unauthorized - token expired (but not for login endpoint)
            if (response.status === HTTP_STATUS.UNAUTHORIZED && !endpoint.includes('/auth/login')) {
                TokenManager.removeToken();
                TokenManager.removeUser();
                localStorage.removeItem('refresh_token');
                // Use dynamic path to handle both root and subdirectory pages
                const currentPath = window.location.pathname;
                const loginPath = currentPath.includes('/admin/') || currentPath.includes('/staff/')
                    ? '../login.html'
                    : 'login.html';
                window.location.href = loginPath;
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        // Re-throw with more context
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('JSON parse error for endpoint:', endpoint);
            throw new Error('Server error: Invalid response format. Check backend logs.');
        }
        throw error;
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

// Toast Notification
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
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
    }
};

// Format currency
function formatCurrency(amount, currency = '₹') {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
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
        'partial': 'status-partial'
    };
    return statusMap[statusLower] || 'status-pending';
}

// Create status badge HTML
function createStatusBadge(status) {
    const className = getStatusBadgeClass(status);
    return `<span class="status-badge ${className}">${status}</span>`;
}

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
window.HTTP_STATUS = HTTP_STATUS;
window.API_STATUS = API_STATUS;
window.USER_ROLES = USER_ROLES;
window.APPOINTMENT_STATUS = APPOINTMENT_STATUS;
window.PAYMENT_STATUS = PAYMENT_STATUS;
window.PAYMENT_MODES = PAYMENT_MODES;
window.DOC_TYPES = DOC_TYPES;
window.INCENTIVE_TYPES = INCENTIVE_TYPES;
window.CALCULATION_TYPES = CALCULATION_TYPES;
window.GENDER = GENDER;
window.EMPLOYMENT_TYPE = EMPLOYMENT_TYPE;
window.AVAILABILITY = AVAILABILITY;
window.STATUS = STATUS;
window.TokenManager = TokenManager;
window.apiRequest = apiRequest;
window.showToast = showToast;
window.Validators = Validators;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getStatusBadgeClass = getStatusBadgeClass;
window.createStatusBadge = createStatusBadge;
window.isTokenExpired = isTokenExpired;
window.isTokenExpiringSoon = isTokenExpiringSoon;
window.getCsrfToken = getCsrfToken;
window.setCsrfToken = setCsrfToken;
