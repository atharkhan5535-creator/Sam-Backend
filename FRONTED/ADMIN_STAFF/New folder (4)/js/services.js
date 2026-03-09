/* =============================================
   SERVICE MANAGEMENT MODULE
   Create, update, manage services
   ============================================= */

const ServiceAPI = {
    // Create Service
    createService: async (serviceData) => {
        const errors = [];
        
        // Validation
        if (!serviceData.service_name) errors.push('Service name is required');
        
        if (!serviceData.price && serviceData.price !== 0) {
            errors.push('Price is required');
        } else {
            const minError = Validators.min(serviceData.price, 0, 'Price');
            if (minError) errors.push(minError);
        }
        
        if (!serviceData.duration) errors.push('Duration is required');
        else {
            const minError = Validators.min(serviceData.duration, 1, 'Duration');
            if (minError) errors.push(minError);
        }
        
        if (serviceData.status && ![STATUS.ACTIVE, STATUS.INACTIVE].includes(serviceData.status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/admin/services', {
                method: 'POST',
                body: JSON.stringify({
                    body: {
                        service_name: serviceData.service_name,
                        price: parseFloat(serviceData.price),
                        duration: parseInt(serviceData.duration),
                        image_url: serviceData.image_url || '',
                        status: serviceData.status || STATUS.ACTIVE
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create service' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Service
    updateService: async (serviceId, serviceData) => {
        const errors = [];
        
        if (!serviceId) errors.push('Service ID is required');
        
        if (serviceData.price !== undefined) {
            const minError = Validators.min(serviceData.price, 0, 'Price');
            if (minError) errors.push(minError);
        }
        
        if (serviceData.duration !== undefined) {
            const minError = Validators.min(serviceData.duration, 1, 'Duration');
            if (minError) errors.push(minError);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/services/${serviceId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { service_id: serviceId },
                    body: serviceData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update service' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Service Status
    updateServiceStatus: async (serviceId, status) => {
        const errors = [];
        
        if (!serviceId) errors.push('Service ID is required');
        if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/services/${serviceId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { service_id: serviceId },
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
    
    // List Services
    getServices: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            const response = await apiRequest(`/services${queryString}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch services' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Service Details
    getServiceDetails: async (serviceId) => {
        if (!serviceId) {
            return { success: false, message: 'Service ID is required' };
        }
        
        try {
            const response = await apiRequest(`/services/${serviceId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch service details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.ServiceAPI = ServiceAPI;