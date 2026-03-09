/* =============================================
   SERVICES API MODULE
   Backend: ServiceController.php
   Database fields: service_id, salon_id, service_name, description, price, duration, image_url, status
   ============================================= */

const ServicesAPI = {
    /**
     * Get list of all services (active and inactive)
     * Query params: status (optional - if not provided, returns ALL)
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        // Only add status if explicitly provided
        if (params.status && params.status !== '') {
            queryParams.append('status', params.status);
        }

        const query = queryParams.toString();
        const endpoint = `/services${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get service details by ID
     */
    view: async (serviceId) => {
        try {
            const response = await apiRequest(`/services/${serviceId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create new service (ADMIN only)
     * Backend requires: service_name, price, duration
     */
    create: async (serviceData) => {
        // Validate required fields per backend
        if (!serviceData.service_name) {
            throw new Error('Service name is required');
        }
        if (serviceData.price === null || serviceData.price === undefined) {
            throw new Error('Price is required');
        }
        if (serviceData.duration === null || serviceData.duration === undefined) {
            throw new Error('Duration is required');
        }

        try {
            const response = await apiRequest('/admin/services', {
                method: 'POST',
                body: JSON.stringify(serviceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update service details (ADMIN only)
     * Allowed fields: service_name, description, price, duration, image_url
     */
    update: async (serviceId, serviceData) => {
        try {
            const response = await apiRequest(`/admin/services/${serviceId}`, {
                method: 'PUT',
                body: JSON.stringify(serviceData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Toggle service status (ADMIN only)
     * Status: ACTIVE | INACTIVE
     */
    toggleStatus: async (serviceId, status) => {
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new Error('Status must be ACTIVE or INACTIVE');
        }

        try {
            const response = await apiRequest(`/admin/services/${serviceId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.ServicesAPI = ServicesAPI;

/* =============================================
   PACKAGES API MODULE
   Backend: PackageController.php
   Database fields: package_id, salon_id, package_name, description, total_price, validity_days, image_url, status
   package_services: package_id, service_id, salon_id
   ============================================= */

const PackagesAPI = {
    /**
     * Get list of all packages (active and inactive)
     * Query params: status (optional - if not provided, returns ALL)
     */
    list: async (params = {}) => {
        const queryParams = new URLSearchParams();
        // Only add status if explicitly provided
        if (params.status && params.status !== '') {
            queryParams.append('status', params.status);
        }

        const query = queryParams.toString();
        const endpoint = `/packages${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get package details by ID (includes services array)
     */
    view: async (packageId) => {
        try {
            const response = await apiRequest(`/packages/${packageId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create new package (ADMIN only)
     * Backend requires: package_name, total_price, service_ids[]
     */
    create: async (packageData) => {
        // Validate required fields per backend
        if (!packageData.package_name) {
            throw new Error('Package name is required');
        }
        if (packageData.total_price === null || packageData.total_price === undefined) {
            throw new Error('Total price is required');
        }
        if (!packageData.service_ids || !Array.isArray(packageData.service_ids) || packageData.service_ids.length === 0) {
            throw new Error('At least one service is required');
        }

        try {
            const response = await apiRequest('/admin/packages', {
                method: 'POST',
                body: JSON.stringify(packageData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update package details (ADMIN only)
     * Allowed fields: package_name, description, total_price, validity_days, image_url, service_ids
     */
    update: async (packageId, packageData) => {
        try {
            const response = await apiRequest(`/admin/packages/${packageId}`, {
                method: 'PUT',
                body: JSON.stringify(packageData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Toggle package status (ADMIN only)
     * Status: ACTIVE | INACTIVE
     */
    toggleStatus: async (packageId, status) => {
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new Error('Status must be ACTIVE or INACTIVE');
        }

        try {
            const response = await apiRequest(`/admin/packages/${packageId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.PackagesAPI = PackagesAPI;
