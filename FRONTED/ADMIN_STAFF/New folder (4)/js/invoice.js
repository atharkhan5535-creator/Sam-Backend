/* =============================================
   INVOICE MANAGEMENT MODULE
   Customer invoices and payments
   ============================================= */

const InvoiceAPI = {
    // Generate Customer Invoice
    generateInvoice: async (appointmentId, invoiceData = {}) => {
        const errors = [];
        
        if (!appointmentId) errors.push('Appointment ID is required');
        
        if (invoiceData.tax_amount !== undefined) {
            const minError = Validators.min(invoiceData.tax_amount, 0, 'Tax amount');
            if (minError) errors.push(minError);
        }
        
        if (invoiceData.discount_amount !== undefined) {
            const minError = Validators.min(invoiceData.discount_amount, 0, 'Discount amount');
            if (minError) errors.push(minError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/invoice`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { appointment_id: appointmentId },
                    body: {
                        tax_amount: invoiceData.tax_amount || 0,
                        discount_amount: invoiceData.discount_amount || 0
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to generate invoice' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // View Customer Invoice
    getInvoice: async (invoiceId) => {
        if (!invoiceId) {
            return { success: false, message: 'Invoice ID is required' };
        }
        
        try {
            const response = await apiRequest(`/invoices/customer/${invoiceId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch invoice' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Add Customer Payment
    addPayment: async (invoiceId, paymentData) => {
        const errors = [];
        
        if (!invoiceId) errors.push('Invoice ID is required');
        
        if (!paymentData.payment_mode) errors.push('Payment mode is required');
        else if (!Object.values(PAYMENT_MODES).includes(paymentData.payment_mode)) {
            errors.push('Invalid payment mode');
        }
        
        if (!paymentData.amount && paymentData.amount !== 0) {
            errors.push('Amount is required');
        } else {
            const minError = Validators.min(paymentData.amount, 0, 'Amount');
            if (minError) errors.push(minError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/invoices/customer/${invoiceId}/payments`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { invoice_customer_id: invoiceId },
                    body: {
                        payment_mode: paymentData.payment_mode,
                        transaction_no: paymentData.transaction_no || '',
                        amount: parseFloat(paymentData.amount)
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to add payment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // View Customer Payment History
    getPaymentHistory: async (invoiceId) => {
        if (!invoiceId) {
            return { success: false, message: 'Invoice ID is required' };
        }
        
        try {
            const response = await apiRequest(`/invoices/customer/${invoiceId}/payments`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch payment history' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.InvoiceAPI = InvoiceAPI;