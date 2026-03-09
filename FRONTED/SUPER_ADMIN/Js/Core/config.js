/**
 * SAM SUPER ADMIN - API ENDPOINTS CONFIGURATION
 * Updated to match backend API documentation exactly
 * All endpoints organized by module for SUPER_ADMIN role
 */

// API Endpoints - SUPER_ADMIN Module
const API_ENDPOINTS = {
    // =============================================
    // AUTH MODULE
    // =============================================
    AUTH: {
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/me'
    },

    // =============================================
    // SALONS MODULE (SUPER_ADMIN ONLY)
    // =============================================
    SALONS: {
        LIST: '/super-admin/salons',
        CREATE: '/super-admin/salons',
        VIEW: (salonId) => `/super-admin/salons/${salonId}`,
        UPDATE: (salonId) => `/super-admin/salons/${salonId}`,
        TOGGLE_STATUS: (salonId) => `/super-admin/salons/${salonId}/status`
    },

    // =============================================
    // USERS MODULE (SUPER_ADMIN ONLY)
    // =============================================
    USERS: {
        CREATE_ADMIN: (salonId) => `/admin/salons/${salonId}/admin`,
        LIST_BY_SALON: (salonId) => `/admin/salons/${salonId}/users`,
        VIEW: (userId) => `/admin/users/${userId}`,
        UPDATE: (userId) => `/admin/users/${userId}`,
        TOGGLE_STATUS: (userId) => `/admin/users/${userId}/status`
    },

    // =============================================
    // SALON SUBSCRIPTIONS MODULE (SUPER_ADMIN)
    // Key difference from ADMIN: Uses /super-admin/ prefix
    // =============================================
    SUBSCRIPTIONS: {
        // Assign subscription to salon (creates invoice automatically)
        ASSIGN: (salonId) => `/super-admin/salons/${salonId}/subscriptions`,

        // Update subscription details
        UPDATE: (subscriptionId) => `/super-admin/subscriptions/${subscriptionId}`,

        // Cancel subscription (NOTE: Uses /subscriptions/ not /super-admin/subscriptions/)
        CANCEL: (subscriptionId) => `/subscriptions/${subscriptionId}/cancel`,

        // List subscriptions for specific salon
        LIST_BY_SALON: (salonId) => `/super-admin/salons/${salonId}/subscriptions`,

        // List ALL subscriptions across all salons (SUPER_ADMIN only)
        LIST_ALL: '/super-admin/subscriptions',

        // View single subscription details
        VIEW: (subscriptionId) => `/super-admin/subscriptions/${subscriptionId}`,

        // Generate subscription invoice (NEW - for billing system)
        GENERATE_INVOICE: (subscriptionId) => `/super-admin/subscriptions/${subscriptionId}/generate-invoice`
    },

    // =============================================
    // SALON INVOICES MODULE (SUPER_ADMIN)
    // =============================================
    INVOICES: {
        LIST: '/super-admin/invoices/salon',
        CREATE: '/super-admin/invoices/salon',
        VIEW: (invoiceSalonId) => `/super-admin/invoices/salon/${invoiceSalonId}`,
        RECORD_PAYMENT: (invoiceSalonId) => `/super-admin/invoices/salon/${invoiceSalonId}/payments`
    },

    // =============================================
    // SUBSCRIPTION PLANS MODULE
    // =============================================
    PLANS: {
        LIST: '/subscription-plans',
        CREATE: '/subscription-plans',
        VIEW: (planId) => `/subscription-plans/${planId}`,
        UPDATE: (planId) => `/subscription-plans/${planId}`,
        TOGGLE_STATUS: (planId) => `/subscription-plans/${planId}/status`
    },

    // =============================================
    // CUSTOMERS MODULE (SUPER_ADMIN can view all)
    // =============================================
    CUSTOMERS: {
        LIST: '/customers/list',
        VIEW: (customerId) => `/customers/view/${customerId}`,
        CREATE: '/customers/create',
        UPDATE: (customerId) => `/customers/update/${customerId}`,
        TOGGLE_STATUS: (customerId) => `/customers/status/${customerId}`
    },

    // =============================================
    // SERVICES MODULE
    // =============================================
    SERVICES: {
        LIST: '/services',
        VIEW: (serviceId) => `/services/${serviceId}`,
        CREATE: '/admin/services',
        UPDATE: (serviceId) => `/admin/services/${serviceId}`,
        TOGGLE_STATUS: (serviceId) => `/admin/services/${serviceId}/status`
    },

    // =============================================
    // PACKAGES MODULE
    // =============================================
    PACKAGES: {
        LIST: '/packages',
        VIEW: (packageId) => `/packages/${packageId}`,
        CREATE: '/admin/packages',
        UPDATE: (packageId) => `/admin/packages/${packageId}`,
        TOGGLE_STATUS: (packageId) => `/admin/packages/${packageId}/status`
    },

    // =============================================
    // STAFF MODULE
    // =============================================
    STAFF: {
        LIST: '/admin/staff',
        VIEW: (staffId) => `/admin/staff/${staffId}`,
        CREATE: '/admin/staff',
        UPDATE: (staffId) => `/admin/staff/${staffId}`,
        TOGGLE_STATUS: (staffId) => `/admin/staff/${staffId}/status`,
        DOCUMENTS: {
            LIST: (staffId) => `/admin/staff/${staffId}/documents`,
            ADD: (staffId) => `/admin/staff/${staffId}/documents`,
            VIEW: (staffId, docId) => `/admin/staff/${staffId}/documents/${docId}`,
            DELETE: (staffId, docId) => `/admin/staff/${staffId}/documents/${docId}`
        },
        INCENTIVES: {
            CREATE: '/staff/incentives',
            PAYOUT: (incentiveId) => `/staff/incentives/${incentiveId}/payout`
        }
    },

    // =============================================
    // STOCK/INVENTORY MODULE
    // =============================================
    STOCK: {
        PRODUCTS: {
            LIST: '/admin/products',
            VIEW: (productId) => `/admin/products/${productId}`,
            CREATE: '/admin/products',
            UPDATE: (productId) => `/admin/products/${productId}`
        },
        LEVELS: {
            LIST: '/admin/stock',
            UPDATE: (productId) => `/admin/stock/${productId}`,
            LOW_STOCK: '/admin/stock/low-stock-alerts'
        },
        TRANSACTIONS: {
            LIST: '/admin/stock/transactions',
            CREATE: '/admin/stock/transactions',
            VIEW: (transactionId) => `/admin/stock/transactions/${transactionId}`
        }
    },

    // =============================================
    // APPOINTMENTS MODULE
    // =============================================
    APPOINTMENTS: {
        LIST: '/appointments',
        VIEW: (appointmentId) => `/appointments/${appointmentId}`,
        CREATE: '/appointments',
        UPDATE: (appointmentId) => `/appointments/${appointmentId}`,
        CANCEL: (appointmentId) => `/appointments/${appointmentId}/cancel`,
        APPROVE: (appointmentId) => `/appointments/${appointmentId}/approve`,
        COMPLETE: (appointmentId) => `/appointments/${appointmentId}/complete`,
        FEEDBACK: {
            SUBMIT: (appointmentId) => `/appointments/${appointmentId}/feedback`
        },
        SERVICES: {
            ADD: (appointmentId, serviceId) => `/appointments/${appointmentId}/services/${serviceId}`,
            UPDATE: (appointmentId, serviceId) => `/appointments/${appointmentId}/services/${serviceId}`,
            REMOVE: (appointmentId, serviceId) => `/appointments/${appointmentId}/services/${serviceId}`
        },
        PACKAGES: {
            ADD: (appointmentId) => `/appointments/${appointmentId}/packages`,
            UPDATE: (appointmentId, packageId) => `/appointments/${appointmentId}/packages/${packageId}`,
            REMOVE: (appointmentId, packageId) => `/appointments/${appointmentId}/packages/${packageId}`
        },
        INVOICE: (appointmentId) => `/appointments/${appointmentId}/invoice`
    },

    // =============================================
    // INVOICES MODULE (CUSTOMER INVOICES)
    // =============================================
    INVOICES_CUSTOMER: {
        LIST: '/invoices',
        VIEW: (invoiceId) => `/invoices/${invoiceId}`,
        CREATE: '/invoices',
        UPDATE: (invoiceId) => `/invoices/${invoiceId}`,
        BY_APPOINTMENT: (appointmentId) => `/invoices/appointment/${appointmentId}`,
        PAYMENTS: {
            CREATE: (invoiceCustomerId) => `/invoices/customer/${invoiceCustomerId}/payments`,
            LIST: (invoiceCustomerId) => `/invoices/customer/${invoiceCustomerId}/payments`
        }
    },

    // =============================================
    // PAYMENTS MODULE (CUSTOMER PAYMENTS)
    // =============================================
    PAYMENTS_CUSTOMER: {
        LIST: '/payments',
        VIEW: (paymentId) => `/payments/${paymentId}`,
        CREATE: '/payments'
    },

    // =============================================
    // SALON INVOICES MODULE (ADMIN - for salon owners)
    // =============================================
    SALON_INVOICES: {
        LIST: '/salon/invoices',
        VIEW: (invoiceSalonId) => `/salon/invoices/${invoiceSalonId}`,
        UPDATE: (invoiceSalonId) => `/salon/invoices/${invoiceSalonId}`,
        BY_SUBSCRIPTION: (subscriptionId) => `/salon/invoices/subscription/${subscriptionId}`
    },

    // =============================================
    // SALON PAYMENTS MODULE (ADMIN - for salon owners)
    // =============================================
    SALON_PAYMENTS: {
        LIST: '/salon/payments',
        VIEW: (paymentId) => `/salon/payments/${paymentId}`,
        CREATE: '/salon/payments'
    },

    // =============================================
    // REPORTS MODULE (ADMIN, STAFF)
    // =============================================
    REPORTS: {
        SALES: '/reports/sales',
        APPOINTMENTS: '/reports/appointments',
        STAFF_PERFORMANCE: '/reports/staff-performance',
        SERVICES: '/reports/services',
        PACKAGES: '/reports/packages',
        CUSTOMERS: '/reports/customers',
        INVENTORY: '/reports/inventory',
        INCENTIVES: '/reports/incentives',
        TAX: '/reports/tax'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS };
}
