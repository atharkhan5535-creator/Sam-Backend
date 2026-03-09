/* =============================================
   AUTHENTICATION MODULE
   Handles login, registration, token refresh
   ============================================= */

const AuthAPI = {
    // Super Admin Login
    superAdminLogin: async (email, password) => {
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
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    body: { email, password }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                const { super_admin_id, name, email, phone, status, last_login, token } = response.data;
                TokenManager.setToken(token);
                TokenManager.setUser({
                    id: super_admin_id,
                    name,
                    email,
                    phone,
                    role: USER_ROLES.SUPER_ADMIN,
                    status,
                    last_login
                });
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Salon Admin / Staff Login
    userLogin: async (email, password) => {
        const errors = [];
        
        const emailError = Validators.email(email);
        if (emailError) errors.push(emailError);
        
        const passError = Validators.required(password, 'Password');
        if (passError) errors.push(passError);
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    body: { email, password }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                const { user_id, salon_id, username, role, email, status, last_login, token } = response.data;
                TokenManager.setToken(token);
                TokenManager.setUser({
                    id: user_id,
                    salon_id,
                    username,
                    email,
                    role,
                    status,
                    last_login
                });
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Customer Login
    customerLogin: async (email, password) => {
        const errors = [];
        
        const emailError = Validators.email(email);
        if (emailError) errors.push(emailError);
        
        const passError = Validators.required(password, 'Password');
        if (passError) errors.push(passError);
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    body: { email, password }
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                const { customer_id, salon_id, email, status, last_login, token } = response.data;
                TokenManager.setToken(token);
                TokenManager.setUser({
                    id: customer_id,
                    salon_id,
                    email,
                    role: USER_ROLES.CUSTOMER,
                    status,
                    last_login
                });
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Customer Registration
    customerRegister: async (userData) => {
        const errors = [];
        
        // Validation
        if (!userData.name) errors.push('Name is required');
        
        const phoneError = Validators.phone(userData.phone);
        if (phoneError) errors.push(phoneError);
        
        const emailError = Validators.email(userData.email);
        if (emailError) errors.push(emailError);
        
        if (userData.gender && !Object.values(GENDER).includes(userData.gender)) {
            errors.push('Invalid gender');
        }
        
        if (userData.dob) {
            const dobError = Validators.date(userData.dob);
            if (dobError) errors.push(dobError);
        }
        
        if (userData.anniversary_date) {
            const annError = Validators.date(userData.anniversary_date);
            if (annError) errors.push(annError);
        }
        
        const passError = Validators.password(userData.password);
        if (passError) errors.push(passError);
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        try {
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    body: userData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                const { customer_id, salon_id, email, status, token } = response.data;
                TokenManager.setToken(token);
                TokenManager.setUser({
                    id: customer_id,
                    salon_id,
                    email,
                    role: USER_ROLES.CUSTOMER,
                    status
                });
                return { success: true, data: response.data };
            }
            return { success: false, message: 'Registration failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Get Current User
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
    
    // Update Current User
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
                body: JSON.stringify({
                    body: userData
                })
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                return { success: true };
            }
            return { success: false, message: 'Update failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    
    // Logout
    logout: async () => {
        try {
            const response = await apiRequest('/auth/logout', {
                method: 'POST'
            });
            
            TokenManager.removeToken();
            localStorage.removeItem('user');
            
            return { success: true };
        } catch (error) {
            TokenManager.removeToken();
            localStorage.removeItem('user');
            return { success: true }; // Still return success even if API fails
        }
    },
    
    // Refresh Token
    refreshToken: async () => {
        try {
            const response = await apiRequest('/auth/refresh', {
                method: 'POST'
            });
            
            if (response.status === API_STATUS.SUCCESS) {
                TokenManager.setToken(response.data.token);
                return { success: true, token: response.data.token };
            }
            return { success: false, message: 'Token refresh failed' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

window.AuthAPI = AuthAPI;