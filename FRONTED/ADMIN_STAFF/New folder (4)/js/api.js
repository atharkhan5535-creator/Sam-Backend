/* =============================================
   ELITE SALON - CORE API CONFIGURATION
   Base setup, interceptors, and error handling
   ============================================= */

const API_BASE_URL = window.location.origin + '/api'; // Adjust as needed

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

// Common Status Values
const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    BOOKED: 'BOOKED',
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

// Document Types
const DOC_TYPES = {
    CERTIFICATION: 'CERTIFICATION',
    ID: 'ID',
    CONTRACT: 'CONTRACT'
};

// Incentive Types
const INCENTIVE_TYPES = {
    SERVICE_COMMISSION: 'service_commission',
    ADMIN_BONUS: 'admin_bonus'
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

// Token Management
const TokenManager = {
    getToken: () => localStorage.getItem('auth_token'),
    setToken: (token) => localStorage.setItem('auth_token', token),
    removeToken: () => localStorage.removeItem('auth_token'),
    
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    
    isAuthenticated: () => !!TokenManager.getToken(),
    
    hasRole: (role) => {
        const user = TokenManager.getUser();
        return user && user.role === role;
    }
};

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const token = TokenManager.getToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
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
        
        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response received:', text.substring(0, 500));
            throw new Error('Server returned non-JSON response. Check server logs for details.');
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
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

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
window.HTTP_STATUS = HTTP_STATUS;
window.API_STATUS = API_STATUS;
window.USER_ROLES = USER_ROLES;
window.STATUS = STATUS;
window.PAYMENT_STATUS = PAYMENT_STATUS;
window.PAYMENT_MODES = PAYMENT_MODES;
window.DOC_TYPES = DOC_TYPES;
window.INCENTIVE_TYPES = INCENTIVE_TYPES;
window.GENDER = GENDER;
window.EMPLOYMENT_TYPE = EMPLOYMENT_TYPE;
window.AVAILABILITY = AVAILABILITY;
window.TokenManager = TokenManager;
window.apiRequest = apiRequest;
window.showToast = showToast;
window.Validators = Validators;