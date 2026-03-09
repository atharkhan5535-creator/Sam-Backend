/* =============================================
   STAFF MANAGEMENT MODULE
   Create, update, manage staff and incentives
   ============================================= */

const StaffAPI = {
    // Create Staff
    createStaff: async (staffData) => {
        const errors = [];
        
        // Validation
        if (!staffData.username) errors.push('Username is required');
        if (!staffData.email) errors.push('Email is required');
        else {
            const emailError = Validators.email(staffData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (!staffData.password) errors.push('Password is required');
        else {
            const passError = Validators.password(staffData.password);
            if (passError) errors.push(passError);
        }
        
        if (!staffData.name) errors.push('Name is required');
        if (!staffData.phone) errors.push('Phone is required');
        else {
            const phoneError = Validators.phone(staffData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (staffData.role && staffData.role !== USER_ROLES.STAFF) {
            errors.push('Role must be STAFF');
        }
        
        if (staffData.status && ![STATUS.ACTIVE, STATUS.INACTIVE].includes(staffData.status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/admin/staff', {
                method: 'POST',
                body: JSON.stringify({
                    body: {
                        username: staffData.username,
                        email: staffData.email,
                        password: staffData.password,
                        role: USER_ROLES.STAFF,
                        name: staffData.name,
                        phone: staffData.phone,
                        status: staffData.status || STATUS.ACTIVE
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create staff' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Add Staff Document
    addStaffDocument: async (staffId, documentData) => {
        const errors = [];
        
        if (!staffId) errors.push('Staff ID is required');
        if (!documentData.doc_type) errors.push('Document type is required');
        else if (!Object.values(DOC_TYPES).includes(documentData.doc_type)) {
            errors.push('Invalid document type');
        }
        
        if (!documentData.file_path) errors.push('File path is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/staff/${staffId}/documents`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { staff_id: staffId },
                    body: {
                        doc_type: documentData.doc_type,
                        file_path: documentData.file_path
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to add document' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Staff
    updateStaff: async (staffId, staffData) => {
        const errors = [];
        
        if (!staffId) errors.push('Staff ID is required');
        
        if (staffData.email) {
            const emailError = Validators.email(staffData.email);
            if (emailError) errors.push(emailError);
        }
        
        if (staffData.phone) {
            const phoneError = Validators.phone(staffData.phone);
            if (phoneError) errors.push(phoneError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/staff/${staffId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { staff_id: staffId },
                    body: staffData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update staff' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Staff Status
    updateStaffStatus: async (staffId, status) => {
        const errors = [];
        
        if (!staffId) errors.push('Staff ID is required');
        if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/staff/${staffId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { staff_id: staffId },
                    body: { status }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update status' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Generate Staff Incentive
    generateIncentive: async (incentiveData) => {
        const errors = [];
        
        if (!incentiveData.staff_id) errors.push('Staff ID is required');
        if (!incentiveData.appointment_id) errors.push('Appointment ID is required');
        
        if (!incentiveData.incentive_type) errors.push('Incentive type is required');
        else if (!Object.values(INCENTIVE_TYPES).includes(incentiveData.incentive_type)) {
            errors.push('Invalid incentive type');
        }
        
        if (!incentiveData.incentive_amount && incentiveData.incentive_amount !== 0) {
            errors.push('Incentive amount is required');
        } else {
            const minError = Validators.min(incentiveData.incentive_amount, 0, 'Incentive amount');
            if (minError) errors.push(minError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/staff/incentives', {
                method: 'POST',
                body: JSON.stringify({
                    body: incentiveData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to generate incentive' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Incentive Payout
    incentivePayout: async (incentiveId, payoutData) => {
        const errors = [];
        
        if (!incentiveId) errors.push('Incentive ID is required');
        if (!payoutData.staff_id) errors.push('Staff ID is required');
        
        if (!payoutData.payout_amount && payoutData.payout_amount !== 0) {
            errors.push('Payout amount is required');
        } else {
            const minError = Validators.min(payoutData.payout_amount, 0, 'Payout amount');
            if (minError) errors.push(minError);
        }
        
        if (!payoutData.payout_date) errors.push('Payout date is required');
        else {
            const dateError = Validators.date(payoutData.payout_date);
            if (dateError) errors.push(dateError);
        }
        
        if (!payoutData.payment_mode) errors.push('Payment mode is required');
        else if (!Object.values(PAYMENT_MODES).includes(payoutData.payment_mode)) {
            errors.push('Invalid payment mode');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/staff/incentives/${incentiveId}/payout`, {
                method: 'POST',
                body: JSON.stringify({
                    path: { incentive_id: incentiveId },
                    body: payoutData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to process payout' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // View Staff List
    getStaffList: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/admin/staff${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch staff list' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // View Staff Details
    getStaffDetails: async (staffId) => {
        if (!staffId) {
            return { success: false, message: 'Staff ID is required' };
        }
        
        try {
            const response = await apiRequest(`/admin/staff/${staffId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch staff details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.StaffAPI = StaffAPI;