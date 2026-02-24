const API = (() => {

    const CONFIG = {
        BASE_URL: 'http://localhost/Sam-Backend/BACKEND/public/index.php/api',
        ACCESS_TOKEN_KEY: 'es_access_token',
        REFRESH_TOKEN_KEY: 'es_refresh_token',
        USER_KEY: 'es_user'
    };

    const getAccessToken = () => localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    const getRefreshToken = () => localStorage.getItem(CONFIG.REFRESH_TOKEN_KEY);

    const setTokens = (access, refresh) => {
        localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, access);
        localStorage.setItem(CONFIG.REFRESH_TOKEN_KEY, refresh);
    };

    const clearTokens = () => {
        localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    };

    const setUser = (user) =>
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.USER_KEY));
        } catch {
            return null;
        }
    };

    async function request(method, endpoint, data = null, requiresAuth = true) {

        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth && getAccessToken()) {
            headers['Authorization'] = 'Bearer ' + getAccessToken();
        }

        const response = await fetch(CONFIG.BASE_URL + endpoint, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null
        });

        const text = await response.text();
        
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error("Backend returned invalid JSON. Check PHP error.");
        }

        if (!response.ok) {
            throw result;
        }

        return result;
    }

    return {

        auth: {

            async login(credentials) {
                const result = await request(
                    'POST',
                    '/auth/login',
                    credentials,
                    false
                );

                if (result.status === 'success') {
                    setTokens(
                        result.data.access_token,
                        result.data.refresh_token
                    );
                }

                return result;
            },

            async logout() {
                const refreshToken = getRefreshToken();

                await request('POST', '/auth/logout', {
                    refresh_token: refreshToken
                });

                clearTokens();
            },

            async getCurrentUser() {
                return await request('GET', '/auth/me');
            }
        },

        getUser,
        clearTokens
    };

})();
