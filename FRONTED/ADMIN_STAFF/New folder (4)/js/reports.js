/* =============================================
   REPORTS MANAGEMENT MODULE
   All report generation and analytics
   ============================================= */

const ReportAPI = {
    // Sales Report
    getSalesReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/sales${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch sales report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Appointment Report
    getAppointmentReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/appointments${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch appointment report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Staff Performance Report
    getStaffPerformanceReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/staff-performance${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch staff performance report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Service-wise Revenue Report
    getServiceRevenueReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/services${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch service revenue report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Package-wise Revenue Report
    getPackageRevenueReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/packages${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch package revenue report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Customer Visit Report
    getCustomerVisitReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/customers${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch customer visit report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Inventory Usage Report
    getInventoryUsageReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/inventory${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch inventory usage report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Incentive Payout Report
    getIncentivePayoutReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/incentives${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch incentive payout report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Tax Report
    getTaxReport: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.from_date) queryParams.append('from_date', filters.from_date);
            if (filters.to_date) queryParams.append('to_date', filters.to_date);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/reports/tax${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch tax report' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.ReportAPI = ReportAPI;