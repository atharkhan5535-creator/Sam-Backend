/* =============================================
   AUTHENTICATION API MODULE
   Handles login, logout, token refresh with backend
   For ADMIN and STAFF roles only
   ============================================= */

const AuthAPI = {
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} loginType - Always 'ADMIN/STAFF' for this login page
     * @param {number} salonId - Salon ID (required for ADMIN/STAFF login)
     */
    login: async (email, password, loginType = 'ADMIN/STAFF', salonId = null) => {
        const errors = [];

        // Validation
        const emailError = Validators.email(email);
        if (emailError) errors.push(emailError);

        const passError = Validators.required(password, 'Password');
        if (passError) errors.push(passError);

        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            const requestBody = {
                email,
                password,
                login_type: loginType
            };

            // Add salon_id for ADMIN/STAFF login
            if (loginType === 'ADMIN/STAFF' && salonId) {
                requestBody.salon_id = salonId;
            }

            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            // Backend returns: { status: 'success', data: { access_token, refresh_token, expires_in } }
            // User info is encoded in the JWT token
            if (response.status === API_STATUS.SUCCESS && response.data) {
                const token = response.data.access_token || response.data.token;
                const refreshToken = response.data.refresh_token;
                
                if (!token) {
                    return { success: false, message: 'No token received from server' };
                }
                
                // Store tokens
                TokenManager.setToken(token);
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                }
                
                // Store CSRF token if provided
                if (response.data.csrf_token) {
                    setCsrfToken(response.data.csrf_token);
                }

                // Decode JWT token to get user info
                // JWT format: header.payload.signature
                let userInfo = {};
                try {
                    // Validate token format
                    if (!token || typeof token !== 'string') {
                        throw new Error('Invalid token format');
                    }

                    const parts = token.split('.');
                    if (parts.length !== 3) {
                        throw new Error('Invalid JWT format');
                    }

                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(atob(base64));

                    // Extract user info from JWT payload
                    userInfo = {
                        id: payload.user_id || payload.id || payload.sub,
                        salon_id: payload.salon_id,
                        username: payload.username || payload.name || payload.email,
                        email: payload.email,
                        role: payload.role || 'ADMIN',
                        status: payload.status || 'ACTIVE',
                        iat: payload.iat,
                        exp: payload.exp
                    };
                } catch (e) {
                    // Fallback user info
                    userInfo = {
                        id: response.data?.user_id || null,
                        salon_id: response.data?.salon_id || null,
                        username: response.data?.username || 'User',
                        email: response.data?.email || '',
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    };
                }

                TokenManager.setUser(userInfo);
                
                return { success: true, data: response.data, user: userInfo };
            }
            
            return { success: false, message: response.message || response.data?.message || 'Login failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current authenticated user info
     */
    getMe: async () => {
        try {
            const response = await apiRequest('/auth/me', {
                method: 'GET'
            });

            if (response.status === API_STATUS.SUCCESS) {
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Failed to get user info' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Update current user profile
     * @param {object} userData - Profile data to update
     */
    updateMe: async (userData) => {
        const errors = [];

        if (userData.email) {
            const emailError = Validators.email(userData.email);
            if (emailError) errors.push(emailError);
        }

        if (userData.phone) {
            const phoneError = Validators.phone(userData.phone);
            if (phoneError) errors.push(phoneError);
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            const response = await apiRequest('/auth/me', {
                method: 'PUT',
                body: JSON.stringify(userData)
            });

            if (response.status === API_STATUS.SUCCESS) {
                // Update local user info
                const currentUser = TokenManager.getUser();
                if (currentUser) {
                    if (userData.name) currentUser.name = userData.name;
                    if (userData.email) currentUser.email = userData.email;
                    if (userData.phone) currentUser.phone = userData.phone;
                    TokenManager.setUser(currentUser);
                }
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Update failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Logout current user
     */
    logout: async () => {
        try {
            // Try to call logout API (but don't fail if it errors)
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    await apiRequest('/auth/logout', {
                        method: 'POST',
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                } catch (error) {
                    // Log error but continue with local cleanup
                    console.warn('Logout API call failed, but clearing local tokens:', error);
                }
            }
        } finally {
            // Always clear local storage
            TokenManager.removeToken();
            TokenManager.removeUser();
            localStorage.removeItem('refresh_token');
            return { success: true };
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                return { success: false, message: 'No refresh token available' };
            }

            const response = await apiRequest('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.status === API_STATUS.SUCCESS) {
                TokenManager.setToken(response.data.token);
                return { success: true, token: response.data.token };
            }
            return { success: false, message: 'Token refresh failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Check if user is authenticated and has required role
     * @param {string|string[]} requiredRoles - Single role or array of roles
     */
    requireAuth: (requiredRoles = null) => {
        const token = TokenManager.getToken();
        const user = TokenManager.getUser();

        if (!token || !user) {
            // Not authenticated, redirect to login
            // Use dynamic path to handle both root and subdirectory pages
            const currentPath = window.location.pathname;
            const loginPath = currentPath.includes('/admin/') || currentPath.includes('/staff/') 
                ? '../login.html' 
                : 'login.html';
            window.location.href = loginPath;
            return false;
        }

        // Check role if required
        if (requiredRoles) {
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            if (!roles.includes(user.role)) {
                // Unauthorized, redirect to home
                const indexPath = currentPath.includes('/admin/') || currentPath.includes('/staff/') 
                    ? '../index.html' 
                    : 'index.html';
                window.location.href = indexPath;
                return false;
            }
        }

        return true;
    },

    /**
     * Get redirect URL based on user role after login
     * @param {object} user - User object with role property
     * @returns {string} Redirect URL based on role
     */
    getRedirectUrl: (user) => {
        if (!user) return 'index.html';

        // ADMIN/STAFF login page - only handles ADMIN and STAFF roles
        switch (user.role) {
            case USER_ROLES.ADMIN:
                return 'admin/dashboard.html';
            case USER_ROLES.STAFF:
                return 'staff/dashboard.html';
            default:
                // Unknown role or CUSTOMER/SUPER_ADMIN - redirect to main index
                return 'index.html';
        }
    }
};

window.AuthAPI = AuthAPI;
