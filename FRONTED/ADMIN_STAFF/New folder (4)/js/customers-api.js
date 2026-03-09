/* =============================================
   CUSTOMERS API MODULE
   Backend: CustomerController.php
   Database fields: customer_id, salon_id, name, phone, email, gender, date_of_birth, anniversary_date, address, preferences, total_visits, last_visit_date, status, customer_since
   ============================================= */

const CustomersAPI = {
    /**
     * Get list of customers
     * Returns: items array with customer_id, name, phone, email, gender, status, etc.
     */
    list: async (params = {}) => {
        try {
            const response = await apiRequest('/customers/list', { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get customer details by ID
     * Returns: full customer record with all fields
     */
    view: async (customerId) => {
        try {
            const response = await apiRequest(`/customers/view/${customerId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create new customer (ADMIN/STAFF only)
     * Backend requires: name, AND (phone OR email)
     * Optional: gender, date_of_birth, anniversary_date, address, preferences
     */
    create: async (customerData) => {
        // Validate required fields per backend
        if (!customerData.name) {
            throw new Error('Name is required');
        }
        if (!customerData.phone && !customerData.email) {
            throw new Error('Phone or email is required');
        }

        // Map frontend fields to backend fields
        const backendData = {
            name: customerData.name,
            phone: customerData.phone || null,
            email: customerData.email || null,
            gender: customerData.gender || null,
            date_of_birth: customerData.date_of_birth || null,
            anniversary_date: customerData.anniversary_date || null,
            address: customerData.address || null,
            preferences: customerData.preferences || null
        };

        try {
            const response = await apiRequest('/customers/create', {
                method: 'POST',
                body: JSON.stringify(backendData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update customer details (ADMIN/STAFF only)
     * Allowed fields: name, phone, email, gender, date_of_birth, anniversary_date, address, preferences, status
     */
    update: async (customerId, customerData) => {
        const backendData = {
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email,
            gender: customerData.gender,
            date_of_birth: customerData.date_of_birth,
            anniversary_date: customerData.anniversary_date,
            address: customerData.address,
            preferences: customerData.preferences,
            status: customerData.status
        };

        try {
            const response = await apiRequest(`/customers/update/${customerId}`, {
                method: 'PATCH',
                body: JSON.stringify(backendData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Toggle customer status (ADMIN/STAFF only)
     * Status values: ACTIVE, INACTIVE
     */
    toggleStatus: async (customerId, status) => {
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new Error('Invalid status');
        }

        try {
            const response = await apiRequest(`/customers/status/${customerId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get customer's appointments (ADMIN/STAFF/CUSTOMER)
     */
    getAppointments: async (customerId, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/customers/${customerId}/appointments${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get customer's feedback history (ADMIN/STAFF/CUSTOMER)
     */
    getFeedback: async (customerId, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/customers/${customerId}/feedback${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current logged-in customer's appointments (CUSTOMER only)
     */
    getMyAppointments: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        const endpoint = `/customers/me/appointments${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update current customer's profile (CUSTOMER only)
     */
    updateProfile: async (userData) => {
        try {
            const response = await apiRequest('/customers/me', {
                method: 'PATCH',
                body: JSON.stringify(userData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current logged-in customer's feedback (CUSTOMER only)
     */
    getMyFeedback: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/customers/me/feedback${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.CustomersAPI = CustomersAPI;
