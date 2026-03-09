/* =============================================
   APPOINTMENTS API MODULE
   Backend: AppointmentController.php
   Database: appointments, appointment_services, appointment_packages
   ============================================= */

const AppointmentsAPI = {
    /**
     * Create new appointment
     * Backend requires: customer_id, appointment_date, start_time, services[] OR packages[]
     * Each service needs staff_id (we'll auto-assign first staff if not provided)
     * @param {object} appointmentData - Appointment data
     */
    create: async (appointmentData) => {
        // Validate required fields per backend
        if (!appointmentData.customer_id) {
            throw new Error('Customer ID is required');
        }
        if (!appointmentData.appointment_date) {
            throw new Error('Appointment date is required');
        }
        if (!appointmentData.start_time) {
            throw new Error('Start time is required');
        }
        if ((!appointmentData.services || appointmentData.services.length === 0) && 
            (!appointmentData.packages || appointmentData.packages.length === 0)) {
            throw new Error('At least one service or package is required');
        }

        // Get first available staff member for auto-assignment
        let defaultStaffId = null;
        try {
            const staffResult = await apiRequest('/admin/staff', { method: 'GET' });
            if (staffResult.status === 'success' && staffResult.data && staffResult.data.items && staffResult.data.items.length > 0) {
                // Get first active staff member
                const activeStaff = staffResult.data.items.find(s => s.status === 'ACTIVE') || staffResult.data.items[0];
                defaultStaffId = activeStaff.staff_id || activeStaff.user_id;
            }
        } catch (error) {
            console.warn('Could not load staff, staff_id will be null:', error);
        }

        // Format data for backend
        const backendData = {
            customer_id: parseInt(appointmentData.customer_id),
            appointment_date: appointmentData.appointment_date,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time || null,
            estimated_duration: appointmentData.estimated_duration || 60,
            notes: appointmentData.notes || '',
            discount_amount: appointmentData.discount_amount || 0
        };

        // Format services array for backend - auto-assign staff_id if not provided
        if (appointmentData.services && appointmentData.services.length > 0) {
            backendData.services = appointmentData.services.map(s => ({
                service_id: parseInt(s.service_id),
                staff_id: s.staff_id || defaultStaffId,
                price: parseFloat(s.price) || 0,
                discount_amount: parseFloat(s.discount_amount) || 0,
                start_time: s.start_time || appointmentData.start_time,
                end_time: s.end_time || appointmentData.end_time
            }));
        }

        // Format packages array for backend - auto-assign staff_id if not provided
        if (appointmentData.packages && appointmentData.packages.length > 0) {
            backendData.packages = appointmentData.packages.map(p => ({
                package_id: parseInt(p.package_id),
                staff_id: p.staff_id || defaultStaffId,
                price: parseFloat(p.price) || 0,
                discount_amount: parseFloat(p.discount_amount) || 0
            }));
        }

        try {
            const response = await apiRequest('/appointments', {
                method: 'POST',
                body: JSON.stringify(backendData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update appointment details
     * Allowed fields: appointment_date, start_time, end_time, estimated_duration, discount_amount, notes, status
     * @param {number} appointmentId - Appointment ID
     * @param {object} appointmentData - Updated appointment data
     */
    update: async (appointmentId, appointmentData) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}`, {
                method: 'PUT',
                body: JSON.stringify(appointmentData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Cancel appointment
     * @param {number} appointmentId - Appointment ID
     * @param {string} reason - Cancellation reason
     */
    cancel: async (appointmentId, reason) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/cancel`, {
                method: 'PATCH',
                body: JSON.stringify({ cancellation_reason: reason })
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Approve appointment (set status to CONFIRMED)
     * @param {number} appointmentId - Appointment ID
     */
    approve: async (appointmentId) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/approve`, {
                method: 'PATCH',
                body: JSON.stringify({})
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Complete appointment (set status to COMPLETED)
     * @param {number} appointmentId - Appointment ID
     * @param {object} completionData - Completion data (notes)
     */
    complete: async (appointmentId, completionData = {}) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/complete`, {
                method: 'PATCH',
                body: JSON.stringify(completionData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get list of appointments with filters
     * Query params: status, date
     * Returns: items array with services[] and packages[]
     * @param {object} params - Query parameters
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.date) queryParams.append('date', params.date);

        const query = queryParams.toString();
        const endpoint = `/appointments${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get appointment details by ID
     * Returns: appointment with services[], packages[], feedback_given
     * @param {number} appointmentId - Appointment ID
     */
    view: async (appointmentId) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Add service to existing appointment
     * Backend requires: staff_id (optional), price, discount_amount, start_time (optional), end_time (optional)
     * @param {number} appointmentId - Appointment ID
     * @param {number} serviceId - Service ID
     * @param {object} serviceData - Service data
     */
    addService: async (appointmentId, serviceId, serviceData) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/services/${serviceId}`, {
                method: 'PUT',
                body: JSON.stringify(serviceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update appointment service
     * Allowed fields: staff_id, service_price, discount_amount, start_time, end_time
     * @param {number} appointmentId - Appointment ID
     * @param {number} serviceId - Service ID
     * @param {object} serviceData - Updated service data
     */
    updateService: async (appointmentId, serviceId, serviceData) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/services/${serviceId}`, {
                method: 'PATCH',
                body: JSON.stringify(serviceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Generate invoice from appointment
     * Backend requires: subtotal_amount, tax_amount, discount_amount, due_date, notes
     * @param {number} appointmentId - Appointment ID
     * @param {object} invoiceData - Invoice data
     */
    generateInvoice: async (appointmentId, invoiceData) => {
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/invoice`, {
                method: 'POST',
                body: JSON.stringify(invoiceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Submit feedback for appointment (CUSTOMER only)
     * Backend requires: rating (1-5), comment (optional), is_anonymous (optional)
     * @param {number} appointmentId - Appointment ID
     * @param {object} feedbackData - Feedback data
     */
    submitFeedback: async (appointmentId, feedbackData) => {
        if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        try {
            const response = await apiRequest(`/appointments/${appointmentId}/feedback`, {
                method: 'POST',
                body: JSON.stringify(feedbackData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.AppointmentsAPI = AppointmentsAPI;
