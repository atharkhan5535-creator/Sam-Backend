/* =============================================
   SUPER ADMIN MANAGEMENT MODULE
   Subscription plans, salons, salon invoices
   ============================================= */

const SuperAdminAPI = {
    // ========== SUBSCRIPTION PLANS ==========
    
    // Create Subscription Plan
    createPlan: async (planData) => {
        const errors = [];
        
        if (!planData.plan_name) errors.push('Plan name is required');
        
        if (!planData.price && planData.price !== 0) {
            errors.push('Price is required');
        } else {
            const minError = Validators.min(planData.price, 0, 'Price');
            if (minError) errors.push(minError);
        }
        
        if (!planData.duration_days) errors.push('Duration days is required');
        else {
            const minError = Validators.min(planData.duration_days, 1, 'Duration days');
            if (minError) errors.push(minError);
        }
        
        if (planData.status !== undefined && ![0, 1].includes(planData.status)) {
            errors.push('Status must be 0 or 1');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/super-admin/subscription-plans', {
                method: 'POST',
                body: JSON.stringify({
                    body: {
                        plan_name: planData.plan_name,
                        price: parseFloat(planData.price),
                        duration_days: parseInt(planData.duration_days),
                        status: planData.status !== undefined ? planData.status : 1
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create plan' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Subscription Plan
    updatePlan: async (planId, planData) => {
        const errors = [];
        
        if (!planId) errors.push('Plan ID is required');
        
        if (planData.price !== undefined) {
            const minError = Validators.min(planData.price, 0, 'Price');
            if (minError) errors.push(minError);
        }
        
        if (planData.duration_days !== undefined) {
            const minError = Validators.min(planData.duration_days, 1, 'Duration days');
            if (minError) errors.push(minError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/subscription-plans/${planId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { plan_id: planId },
                    body: planData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update plan' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Plan Status
    updatePlanStatus: async (planId, status) => {
        const errors = [];
        
        if (!planId) errors.push('Plan ID is required');
        if (![0, 1].includes(status)) errors.push('Status must be 0 or 1');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/subscription-plans/${planId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { plan_id: planId },
                    body: { status }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update plan status' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // List Subscription Plans
    getPlans: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status !== undefined) queryParams.append('status', filters.status);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/subscription-plans${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch plans' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Plan Details
    getPlanDetails: async (planId) => {
        if (!planId) {
            return { success: false, message: 'Plan ID is required' };
        }
        
        try {
            const response = await apiRequest(`/subscription-plans/${planId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch plan details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // ========== SALONS ==========
    
    // Create Salon
    createSalon: async (salonData) => {
        const errors = [];
        
        if (!salonData.salon_name) errors.push('Salon name is required');
        if (!salonData.salon_ownername) errors.push('Owner name is required');
        
        if (!salonData.phone) errors.push('Phone is required');
        else {
            const phoneError = Validators.phone(salonData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (salonData.email) {
            const emailError = Validators.email(salonData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (!salonData.address) errors.push('Address is required');
        if (!salonData.city) errors.push('City is required');
        if (!salonData.state) errors.push('State is required');
        if (!salonData.country) errors.push('Country is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/super-admin/salons', {
                method: 'POST',
                body: JSON.stringify({
                    body: {
                        salon_name: salonData.salon_name,
                        salon_ownername: salonData.salon_ownername,
                        phone: salonData.phone,
                        gst_num: salonData.gst_num || '',
                        address: salonData.address,
                        city: salonData.city,
                        state: salonData.state,
                        country: salonData.country,
                        salon_logo: salonData.salon_logo || '',
                        status: salonData.status !== undefined ? salonData.status : 1
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create salon' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Create Salon Admin User
    createSalonAdmin: async (salonId, adminData) => {
        const errors = [];
        
        if (!salonId) errors.push('Salon ID is required');
        if (!adminData.username) errors.push('Username is required');
        
        if (!adminData.email) errors.push('Email is required');
        else {
            const emailError = Validators.email(adminData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (!adminData.phone) errors.push('Phone is required');
        else {
            const phoneError = Validators.phone(adminData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}/admin`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { salon_id: salonId },
                    body: adminData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create salon admin' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Salon
    updateSalon: async (salonId, salonData) => {
        const errors = [];
        
        if (!salonId) errors.push('Salon ID is required');
        
        if (salonData.phone) {
            const phoneError = Validators.phone(salonData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (salonData.email) {
            const emailError = Validators.email(salonData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { salon_id: salonId },
                    body: salonData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update salon' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Salon Status
    updateSalonStatus: async (salonId, status) => {
        const errors = [];
        
        if (!salonId) errors.push('Salon ID is required');
        if (![0, 1].includes(status)) errors.push('Status must be 0 or 1');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { salon_id: salonId },
                    body: { status }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update salon status' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // List Salons
    getSalons: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status !== undefined) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/super-admin/salons${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch salons' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Salon Details
    getSalonDetails: async (salonId) => {
        if (!salonId) {
            return { success: false, message: 'Salon ID is required' };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch salon details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // ========== SUBSCRIPTION ASSIGNMENT ==========
    
    // Assign Subscription to Salon
    assignSubscription: async (salonId, subscriptionData) => {
        const errors = [];
        
        if (!salonId) errors.push('Salon ID is required');
        if (!subscriptionData.plan_id) errors.push('Plan ID is required');
        
        if (!subscriptionData.start_date) errors.push('Start date is required');
        else {
            const dateError = Validators.date(subscriptionData.start_date);
            if (dateError) errors.push(dateError);
        }
        
        if (!subscriptionData.end_date) errors.push('End date is required');
        else {
            const dateError = Validators.date(subscriptionData.end_date);
            if (dateError) errors.push(dateError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}/subscriptions`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { salon_id: salonId },
                    body: {
                        plan_id: subscriptionData.plan_id,
                        start_date: subscriptionData.start_date,
                        end_date: subscriptionData.end_date,
                        status: subscriptionData.status || STATUS.ACTIVE
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to assign subscription' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Subscription Dates
    updateSubscriptionDates: async (subscriptionId, dates) => {
        const errors = [];
        
        if (!subscriptionId) errors.push('Subscription ID is required');
        
        if (dates.start_date) {
            const dateError = Validators.date(dates.start_date);
            if (dateError) errors.push(dateError);
        }
        
        if (dates.end_date) {
            const dateError = Validators.date(dates.end_date);
            if (dateError) errors.push(dateError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/super-admin/subscriptions/${subscriptionId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { subscription_id: subscriptionId },
                    body: dates
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update subscription' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Salon Subscription History
    getSalonSubscriptions: async (salonId) => {
        if (!salonId) {
            return { success: false, message: 'Salon ID is required' };
        }
        
        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}/subscriptions`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch subscriptions' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // ========== SALON INVOICES ==========
    
    // Generate Salon Invoice
    generateSalonInvoice: async (invoiceData) => {
        const errors = [];
        
        if (!invoiceData.salon_id) errors.push('Salon ID is required');
        if (!invoiceData.subscription_id) errors.push('Subscription ID is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/super-admin/invoices/salon', {
                method: 'POST',
                body: JSON.stringify({
                    body: invoiceData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to generate salon invoice' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Salon Invoice
    getSalonInvoice: async (invoiceId) => {
        if (!invoiceId) {
            return { success: false, message: 'Invoice ID is required' };
        }
        
        try {
            const response = await apiRequest(`/super-admin/invoices/salon/${invoiceId}`, {
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
    
    // Record Salon Invoice Payment
    recordSalonPayment: async (invoiceId, paymentData) => {
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
            const response = await apiRequest(`/super-admin/invoices/salon/${invoiceId}/payments`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { invoice_salon_id: invoiceId },
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
            return { success: false, message: 'Failed to record payment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // List Salon Invoices
    getSalonInvoices: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.salon_id) queryParams.append('salon_id', filters.salon_id);
            if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/super-admin/invoices/salon${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch invoices' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.SuperAdminAPI = SuperAdminAPI;