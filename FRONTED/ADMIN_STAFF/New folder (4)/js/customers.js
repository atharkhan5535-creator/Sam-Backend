/* =============================================
   CUSTOMER MANAGEMENT MODULE
   Manage customers, profiles, feedback
   ============================================= */

const CustomerAPI = {
    // Create Customer (Manual by Admin/Staff)
    createCustomer: async (customerData) => {
        const errors = [];
        
        // Validation
        if (!customerData.name) errors.push('Name is required');
        
        if (!customerData.phone) errors.push('Phone is required');
        else {
            const phoneError = Validators.phone(customerData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (customerData.email) {
            const emailError = Validators.email(customerData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (customerData.gender && !Object.values(GENDER).includes(customerData.gender)) {
            errors.push('Invalid gender');
        }
        
        if (customerData.dob) {
            const dobError = Validators.date(customerData.dob);
            if (dobError) errors.push(dobError);
        }
        
        if (customerData.anniversary_date) {
            const annError = Validators.date(customerData.anniversary_date);
            if (annError) errors.push(annError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/customers', {
                method: 'POST',
                body: JSON.stringify({
                    body: customerData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create customer' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Customer
    updateCustomer: async (customerId, customerData) => {
        const errors = [];
        
        if (!customerId) errors.push('Customer ID is required');
        
        if (customerData.phone) {
            const phoneError = Validators.phone(customerData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (customerData.email) {
            const emailError = Validators.email(customerData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (customerData.gender && !Object.values(GENDER).includes(customerData.gender)) {
            errors.push('Invalid gender');
        }
        
        if (customerData.dob) {
            const dobError = Validators.date(customerData.dob);
            if (dobError) errors.push(dobError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/customers/${customerId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { customer_id: customerId },
                    body: customerData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update customer' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Soft Delete Customer (Set Status INACTIVE)
    deleteCustomer: async (customerId) => {
        const errors = [];
        
        if (!customerId) errors.push('Customer ID is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/customers/${customerId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { customer_id: customerId },
                    body: { status: STATUS.INACTIVE }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to delete customer' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // List Customers
    getCustomers: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/customers${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch customers' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Customer Profile
    getCustomerProfile: async (customerId) => {
        if (!customerId) {
            return { success: false, message: 'Customer ID is required' };
        }
        
        try {
            const response = await apiRequest(`/customers/${customerId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch customer profile' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Own Profile (Customer)
    updateOwnProfile: async (profileData) => {
        const errors = [];
        
        if (profileData.phone) {
            const phoneError = Validators.phone(profileData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (profileData.email) {
            const emailError = Validators.email(profileData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (profileData.dob) {
            const dobError = Validators.date(profileData.dob);
            if (dobError) errors.push(dobError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/customers/me', {
                method: 'PUT',
                body: JSON.stringify({
                    body: profileData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update profile' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Own Appointment History
    getOwnAppointments: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/customers/me/appointments${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch appointments' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Customer Appointment History (Admin/Staff)
    getCustomerAppointments: async (customerId) => {
        if (!customerId) {
            return { success: false, message: 'Customer ID is required' };
        }
        
        try {
            const response = await apiRequest(`/customers/${customerId}/appointments`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch appointments' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Create Appointment Feedback
    createFeedback: async (appointmentId, feedbackData) => {
        const errors = [];
        
        if (!appointmentId) errors.push('Appointment ID is required');
        
        if (!feedbackData.rating) errors.push('Rating is required');
        else {
            const minError = Validators.min(feedbackData.rating, 1, 'Rating');
            if (minError) errors.push(minError);
            const maxError = Validators.max(feedbackData.rating, 5, 'Rating');
            if (maxError) errors.push(maxError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/feedback`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { appointment_id: appointmentId },
                    body: {
                        rating: parseInt(feedbackData.rating),
                        comment: feedbackData.comment || ''
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to submit feedback' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Own Feedback History
    getOwnFeedback: async () => {
        try {
            const response = await apiRequest('/customers/me/feedback', {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch feedback' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Customer Feedback History (Admin)
    getCustomerFeedback: async (customerId) => {
        if (!customerId) {
            return { success: false, message: 'Customer ID is required' };
        }
        
        try {
            const response = await apiRequest(`/customers/${customerId}/feedback`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch feedback' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.CustomerAPI = CustomerAPI;