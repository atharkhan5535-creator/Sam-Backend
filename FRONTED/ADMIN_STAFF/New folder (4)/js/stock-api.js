/* =============================================
   STOCK/INVENTORY API MODULE
   All product and stock-related API calls (ADMIN only)
   ============================================= */

const StockAPI = {
    /* ========== PRODUCTS ========== */

    /**
     * Create new product
     * @param {object} productData - Product data
     */
    createProduct: async (productData) => {
        try {
            const response = await apiRequest('/admin/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update product details
     * @param {number} productId - Product ID
     * @param {object} productData - Updated product data
     */
    updateProduct: async (productId, productData) => {
        try {
            const response = await apiRequest(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get list of all products
     * @param {object} params - Query parameters
     */
    listProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/admin/products${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get product details by ID
     * @param {number} productId - Product ID
     */
    viewProduct: async (productId) => {
        try {
            const response = await apiRequest(`/admin/products/${productId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /* ========== STOCK ========== */

    /**
     * Update stock level
     * @param {number} productId - Product ID
     * @param {object} stockData - Stock data (stock_level, reorder_point)
     */
    updateStock: async (productId, stockData) => {
        try {
            const response = await apiRequest(`/admin/stock/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify(stockData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get all stock levels
     * @param {object} params - Query parameters
     */
    listStock: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/admin/stock${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get low stock alerts
     * @param {object} params - Query parameters
     */
    getLowStockAlerts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/admin/stock/low-stock-alerts${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /* ========== STOCK TRANSACTIONS ========== */

    /**
     * Create stock transaction
     * @param {object} transactionData - Transaction data
     */
    createTransaction: async (transactionData) => {
        try {
            const response = await apiRequest('/admin/stock/transactions', {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get all stock transactions
     * @param {object} params - Query parameters
     */
    listTransactions: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.product_id) queryParams.append('product_id', params.product_id);
        if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        const endpoint = `/admin/stock/transactions${query ? '?' + query : ''}`;

        try {
            const response = await apiRequest(endpoint, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get stock transaction by ID
     * @param {number} transactionId - Transaction ID
     */
    viewTransaction: async (transactionId) => {
        try {
            const response = await apiRequest(`/admin/stock/transactions/${transactionId}`, { method: 'GET' });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.StockAPI = StockAPI;
