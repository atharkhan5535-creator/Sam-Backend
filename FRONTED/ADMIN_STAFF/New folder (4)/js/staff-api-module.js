/* =============================================
   STAFF API MODULE
   All staff-related API calls (ADMIN only)
   Backend: StaffController.php
   ============================================= */

const StaffAPI = {
    /**
     * Get list of staff members
     * Query params: status
     * Returns: items array with staff details
     * @param {object} params - Query parameters
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        const endpoint = `/admin/staff${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get staff member details by ID
     * Returns: staff record with user info
     * @param {number} staffId - Staff ID
     */
    view: async (staffId) => {
        try {
            const response = await apiRequest(`/admin/staff/${staffId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create new staff member (ADMIN only)
     * Creates both users + staff_info records
     * Backend requires: username, email, password, name
     * Optional: role (ADMIN|STAFF), phone, date_of_birth, date_of_joining, specialization, experience_years, salary, status
     * @param {object} staffData - Staff data
     */
    create: async (staffData) => {
        // Validate required fields per backend
        if (!staffData.username || !staffData.email || !staffData.password || !staffData.name) {
            throw new Error('Username, email, password, and name are required');
        }
        if (!['ADMIN', 'STAFF'].includes(staffData.role)) {
            staffData.role = 'STAFF';
        }

        try {
            const response = await apiRequest('/admin/staff', {
                method: 'POST',
                body: JSON.stringify(staffData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update staff member details (ADMIN only)
     * Updates both users (email) + staff_info tables
     * Allowed fields: email, name, phone, date_of_birth, date_of_joining, specialization, experience_years, salary
     * @param {number} staffId - Staff ID
     * @param {object} staffData - Updated staff data
     */
    update: async (staffId, staffData) => {
        try {
            const response = await apiRequest(`/admin/staff/${staffId}`, {
                method: 'PUT',
                body: JSON.stringify(staffData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Toggle staff status (ADMIN only)
     * Updates both users + staff_info tables
     * Status values: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
     * @param {number} staffId - Staff ID
     * @param {string} status - New status
     */
    toggleStatus: async (staffId, status) => {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be: ACTIVE, INACTIVE, ON_LEAVE, or TERMINATED');
        }

        try {
            const response = await apiRequest(`/admin/staff/${staffId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Upload staff document (ADMIN only)
     * @param {number} staffId - Staff ID
     * @param {FormData} formData - Form data with file
     */
    uploadDocument: async (staffId, formData) => {
        try {
            const response = await apiRequest(`/admin/staff/${staffId}/documents`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get staff documents (ADMIN only)
     * @param {number} staffId - Staff ID
     */
    getDocuments: async (staffId) => {
        try {
            const response = await apiRequest(`/admin/staff/${staffId}/documents`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Delete staff document (ADMIN only)
     * @param {number} staffId - Staff ID
     * @param {number} docId - Document ID
     */
    deleteDocument: async (staffId, docId) => {
        try {
            const response = await apiRequest(`/admin/staff/${staffId}/documents/${docId}`, {
                method: 'DELETE'
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create staff incentive (ADMIN only)
     * Backend requires: staff_id, incentive_type, incentive_amount
     * Optional: appointment_id, calculation_type, percentage_rate, fixed_amount, base_amount, remarks, status
     * Incentive types: SERVICE_COMMISSION, BONUS, TARGET_ACHIEVEMENT
     * Calculation types: FIXED, PERCENTAGE
     * @param {object} incentiveData - Incentive data
     */
    createIncentive: async (incentiveData) => {
        // Validate required fields per backend
        if (!incentiveData.staff_id || !incentiveData.incentive_type || !incentiveData.incentive_amount) {
            throw new Error('Staff ID, incentive type, and incentive amount are required');
        }

        const validTypes = ['SERVICE_COMMISSION', 'BONUS', 'TARGET_ACHIEVEMENT'];
        if (!validTypes.includes(incentiveData.incentive_type)) {
            throw new Error('Invalid incentive type');
        }

        try {
            const response = await apiRequest('/staff/incentives', {
                method: 'POST',
                body: JSON.stringify(incentiveData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Process incentive payout (ADMIN only)
     * Backend requires: payout_amount, payment_mode
     * Optional: payout_date, transaction_reference, remarks
     * Note: staff_id is auto-filled from incentive record (NOT required in request)
     * Payment modes: CASH, UPI, BANK, CHEQUE
     * @param {number} incentiveId - Incentive ID
     * @param {object} payoutData - Payout data
     */
    processPayout: async (incentiveId, payoutData) => {
        // Validate required fields per backend
        if (!payoutData.payout_amount || !payoutData.payment_mode) {
            throw new Error('Payout amount and payment mode are required');
        }

        const validModes = ['CASH', 'UPI', 'BANK', 'CHEQUE'];
        if (!validModes.includes(payoutData.payment_mode)) {
            throw new Error('Invalid payment mode');
        }

        try {
            const response = await apiRequest(`/staff/incentives/${incentiveId}/payout`, {
                method: 'POST',
                body: JSON.stringify(payoutData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get list of all incentives (ADMIN only)
     * Query params: staff_id, status, start_date, end_date
     * @param {object} params - Query parameters
     */
    listIncentives: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.staff_id) queryParams.append('staff_id', params.staff_id);
        if (params.status) queryParams.append('status', params.status);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/staff/incentives${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get unpaid incentives by staff ID (ADMIN only)
     * @param {number} staffId - Staff ID
     */
    getUnpaidIncentives: async (staffId) => {
        try {
            const response = await apiRequest(`/staff/incentives/unpaid/${staffId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get incentive history by staff ID (ADMIN only)
     * @param {number} staffId - Staff ID
     */
    getIncentiveHistory: async (staffId) => {
        try {
            const response = await apiRequest(`/staff/incentives/history/${staffId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.StaffAPI = StaffAPI;
