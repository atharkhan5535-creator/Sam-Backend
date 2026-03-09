/* =============================================
   APPOINTMENT MANAGEMENT MODULE
   Create, update, manage appointments with services/packages
   ============================================= */

const AppointmentAPI = {
    // Create Appointment (with services and/or packages)
    createAppointment: async (appointmentData, userRole) => {
        const errors = [];
        
        // Validation
        if (!appointmentData.appointment_date_time) {
            errors.push('Appointment date and time is required');
        } else {
            const dateError = Validators.futureDate(appointmentData.appointment_date_time, 'Appointment date');
            if (dateError && userRole === USER_ROLES.CUSTOMER) {
                errors.push(dateError);
            }
        }
        
        // Customer ID required for Admin/Staff, ignored for Customer
        if (userRole !== USER_ROLES.CUSTOMER && !appointmentData.customer_id) {
            errors.push('Customer ID is required');
        }
        
        // Check if at least one service or package is provided
        const hasServices = appointmentData.services && Array.isArray(appointmentData.services) && appointmentData.services.length > 0;
        const hasPackages = appointmentData.packages && Array.isArray(appointmentData.packages) && appointmentData.packages.length > 0;
        
        if (!hasServices && !hasPackages) {
            errors.push('At least one service or package is required');
        }
        
        // Validate services structure
        if (hasServices) {
            appointmentData.services.forEach((service, index) => {
                if (!service.service_id) {
                    errors.push(`Service at index ${index} is missing service_id`);
                }
                if (!service.staff_id) {
                    errors.push(`Service at index ${index} is missing staff_id`);
                }
            });
        }
        
        // Validate packages structure
        if (hasPackages) {
            appointmentData.packages.forEach((pkg, index) => {
                if (!pkg.package_id) {
                    errors.push(`Package at index ${index} is missing package_id`);
                }
                if (!pkg.staff_id) {
                    errors.push(`Package at index ${index} is missing staff_id`);
                }
            });
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    body: appointmentData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create appointment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Appointment Date/Time
    updateAppointmentDateTime: async (appointmentId, dateTime) => {
        const errors = [];
        
        if (!appointmentId) errors.push('Appointment ID is required');
        
        if (!dateTime) errors.push('Appointment date and time is required');
        else {
            const dateError = Validators.futureDate(dateTime, 'Appointment date');
            if (dateError) errors.push(dateError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { appointment_id: appointmentId },
                    body: { appointment_date_time: dateTime }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update appointment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Approve Appointment (Admin/Staff only)
    approveAppointment: async (appointmentId) => {
        if (!appointmentId) {
            return { success: false, message: 'Appointment ID is required' };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/approve`, {
                method: 'PATCH'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to approve appointment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Cancel Appointment
    cancelAppointment: async (appointmentId) => {
        if (!appointmentId) {
            return { success: false, message: 'Appointment ID is required' };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/cancel`, {
                method: 'PATCH'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to cancel appointment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Complete Appointment
    completeAppointment: async (appointmentId) => {
        if (!appointmentId) {
            return { success: false, message: 'Appointment ID is required' };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/complete`, {
                method: 'PATCH'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to complete appointment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Assigned Staff for Service
    updateServiceStaff: async (appointmentId, serviceId, staffId) => {
        const errors = [];
        
        if (!appointmentId) errors.push('Appointment ID is required');
        if (!serviceId) errors.push('Service ID is required');
        if (!staffId) errors.push('Staff ID is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/services/${serviceId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: {
                        appointment_id: appointmentId,
                        service_id: serviceId
                    },
                    body: { staff_id: staffId }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update staff assignment' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Remove Service from Appointment (Soft)
    removeService: async (appointmentId, serviceId) => {
        const errors = [];
        
        if (!appointmentId) errors.push('Appointment ID is required');
        if (!serviceId) errors.push('Service ID is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}/services/${serviceId}`, {
                method: 'PATCH'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to remove service' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Appointment Details
    getAppointmentDetails: async (appointmentId) => {
        if (!appointmentId) {
            return { success: false, message: 'Appointment ID is required' };
        }
        
        try {
            const response = await apiRequest(`/appointments/${appointmentId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch appointment details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // List Appointments (Admin/Staff)
    getAppointments: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.status) queryParams.append('status', filters.status);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/appointments${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch appointments' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.AppointmentAPI = AppointmentAPI;