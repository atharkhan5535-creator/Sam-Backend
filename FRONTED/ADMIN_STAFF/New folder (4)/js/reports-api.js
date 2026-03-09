/* =============================================
   REPORTS API MODULE
   All report-related API calls (ADMIN, STAFF)
   ============================================= */

const ReportsAPI = {
    /**
     * Get sales report
     * @param {object} params - Query parameters
     * @param {string} params.start_date - Start date (YYYY-MM-DD)
     * @param {string} params.end_date - End date (YYYY-MM-DD)
     */
    getSalesReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/sales${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get appointments report
     * @param {object} params - Query parameters
     */
    getAppointmentsReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/appointments${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get staff performance report
     * @param {object} params - Query parameters
     */
    getStaffPerformanceReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/staff-performance${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get service-wise revenue report
     * @param {object} params - Query parameters
     */
    getServicesReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/services${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get package-wise revenue report
     * @param {object} params - Query parameters
     */
    getPackagesReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/packages${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get customer visit report
     * @param {object} params - Query parameters
     */
    getCustomersReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/customers${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get inventory usage report
     * @param {object} params - Query parameters
     */
    getInventoryReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const query = queryParams.toString();
        const endpoint = `/reports/inventory${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get incentive payout report
     * @param {object} params - Query parameters
     */
    getIncentivesReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.staff_id) queryParams.append('staff_id', params.staff_id);

        const query = queryParams.toString();
        const endpoint = `/reports/incentives${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get tax report (GST)
     * @param {object} params - Query parameters
     */
    getTaxReport: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.tax_rate) queryParams.append('tax_rate', params.tax_rate);

        const query = queryParams.toString();
        const endpoint = `/reports/tax${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.ReportsAPI = ReportsAPI;
