/* =============================================
   INVOICES & PAYMENTS API MODULE
   All invoice and payment-related API calls
   ============================================= */

const InvoicesAPI = {
    /**
     * Create new customer invoice
     * @param {object} invoiceData - Invoice data
     */
    create: async (invoiceData) => {
        try {
            const response = await apiRequest('/invoices', {
                method: 'POST',
                body: JSON.stringify(invoiceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update invoice details
     * @param {number} invoiceId - Invoice ID
     * @param {object} invoiceData - Updated invoice data
     */
    update: async (invoiceId, invoiceData) => {
        try {
            const response = await apiRequest(`/invoices/${invoiceId}`, {
                method: 'PUT',
                body: JSON.stringify(invoiceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get list of all invoices
     * @param {object} params - Query parameters
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/invoices${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get invoice details by ID
     * @param {number} invoiceId - Invoice ID
     */
    view: async (invoiceId) => {
        try {
            const response = await apiRequest(`/invoices/${invoiceId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get invoice by appointment ID
     * @param {number} appointmentId - Appointment ID
     */
    getByAppointment: async (appointmentId) => {
        try {
            const response = await apiRequest(`/invoices/appointment/${appointmentId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.InvoicesAPI = InvoicesAPI;

/* =============================================
   CUSTOMER INVOICE PAYMENTS API MODULE
   ============================================= */

const CustomerInvoicePaymentsAPI = {
    /**
     * Record payment for customer invoice
     * @param {number} invoiceCustomerId - Invoice customer ID
     * @param {object} paymentData - Payment data
     */
    create: async (invoiceCustomerId, paymentData) => {
        try {
            const response = await apiRequest(`/invoices/customer/${invoiceCustomerId}/payments`, {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get all payments for customer invoice
     * @param {number} invoiceCustomerId - Invoice customer ID
     */
    list: async (invoiceCustomerId) => {
        try {
            const response = await apiRequest(`/invoices/customer/${invoiceCustomerId}/payments`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.CustomerInvoicePaymentsAPI = CustomerInvoicePaymentsAPI;

/* =============================================
   SALON INVOICES API MODULE (ADMIN)
   For salon subscription invoices
   ============================================= */

const SalonInvoicesAPI = {
    /**
     * Get list of salon invoices (own salon)
     * @param {object} params - Query parameters
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.payment_status) queryParams.append('payment_status', params.payment_status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/salon/invoices${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get salon invoice details
     * @param {number} invoiceSalonId - Invoice salon ID
     */
    view: async (invoiceSalonId) => {
        try {
            const response = await apiRequest(`/salon/invoices/${invoiceSalonId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update salon invoice
     * @param {number} invoiceSalonId - Invoice salon ID
     * @param {object} invoiceData - Updated invoice data
     */
    update: async (invoiceSalonId, invoiceData) => {
        try {
            const response = await apiRequest(`/salon/invoices/${invoiceSalonId}`, {
                method: 'PUT',
                body: JSON.stringify(invoiceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get invoice by subscription ID
     * @param {number} subscriptionId - Subscription ID
     */
    getBySubscription: async (subscriptionId) => {
        try {
            const response = await apiRequest(`/salon/invoices/subscription/${subscriptionId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.SalonInvoicesAPI = SalonInvoicesAPI;

/* =============================================
   SALON PAYMENTS API MODULE (ADMIN)
   For salon subscription payments
   ============================================= */

const SalonPaymentsAPI = {
    /**
     * Create salon payment
     * @param {object} paymentData - Payment data
     */
    create: async (paymentData) => {
        try {
            const response = await apiRequest('/salon/payments', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get list of salon payments
     * @param {object} params - Query parameters
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.invoice_id) queryParams.append('invoice_id', params.invoice_id);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/salon/payments${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get salon payment details
     * @param {number} paymentId - Payment ID
     */
    view: async (paymentId) => {
        try {
            const response = await apiRequest(`/salon/payments/${paymentId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.SalonPaymentsAPI = SalonPaymentsAPI;
