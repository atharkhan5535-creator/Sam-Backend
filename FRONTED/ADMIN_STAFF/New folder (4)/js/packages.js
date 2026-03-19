/* =============================================
   PACKAGE MANAGEMENT MODULE
   Create, update, manage packages with services
   ============================================= */

const PackageAPI = {
    // Create Package with Service Mapping
    createPackage: async (packageData) => {
        const errors = [];
        
        // Validation
        if (!packageData.package_name) errors.push('Package name is required');
        
        if (!packageData.total_price && packageData.total_price !== 0) {
            errors.push('Total price is required');
        } else {
            const minError = Validators.min(packageData.total_price, 0, 'Total price');
            if (minError) errors.push(minError);
        }
        
        if (!packageData.validity_days) errors.push('Validity days is required');
        else {
            const minError = Validators.min(packageData.validity_days, 1, 'Validity days');
            if (minError) errors.push(minError);
        }
        
        if (!packageData.service_ids || !Array.isArray(packageData.service_ids) || packageData.service_ids.length === 0) {
            errors.push('At least one service ID is required');
        }
        
        if (packageData.status && ![STATUS.ACTIVE, STATUS.INACTIVE].includes(packageData.status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/admin/packages', {
                method: 'POST',
                body: JSON.stringify({
                    body: {
                        package_name: packageData.package_name,
                        total_price: parseFloat(packageData.total_price),
                        validity_days: parseInt(packageData.validity_days),
                        image_url: packageData.image_url || '',
                        status: packageData.status || STATUS.ACTIVE,
                        service_ids: packageData.service_ids
                    }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to create package' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Package Details and Services
    updatePackage: async (packageId, packageData) => {
        const errors = [];
        
        if (!packageId) errors.push('Package ID is required');
        
        if (packageData.total_price !== undefined) {
            const minError = Validators.min(packageData.total_price, 0, 'Total price');
            if (minError) errors.push(minError);
        }
        
        if (packageData.validity_days !== undefined) {
            const minError = Validators.min(packageData.validity_days, 1, 'Validity days');
            if (minError) errors.push(minError);
        }
        
        if (packageData.service_ids !== undefined && (!Array.isArray(packageData.service_ids) || packageData.service_ids.length === 0)) {
            errors.push('At least one service ID is required');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/packages/${packageId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    path: { package_id: packageId },
                    body: packageData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Failed to update package' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Update Package Status
    updatePackageStatus: async (packageId, status) => {
        const errors = [];
        
        if (!packageId) errors.push('Package ID is required');
        if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
            errors.push('Status must be ACTIVE or INACTIVE');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest(`/admin/packages/${packageId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    path: { package_id: packageId },
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
    
    // List Packages
    getPackages: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            // Add include parameter for services
            if (filters.include && filters.include === 'services') {
                queryParams.append('include', 'services');
            }

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const response = await apiRequest(`/packages${queryString}`, {
                method: 'GET'
            });

            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch packages' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Package Details with Services
    getPackageDetails: async (packageId) => {
        if (!packageId) {
            return { success: false, message: 'Package ID is required' };
        }
        
        try {
            const response = await apiRequest(`/packages/${packageId}`, {
                method: 'GET'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to fetch package details' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.PackageAPI = PackageAPI;