const Auth = {
    isAuthenticated: () => {
        return !!localStorage.getItem('es_token');
    },

    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem('es_user') || 'null');
        } catch {
            return null;
        }
    },

    logout: async () => {
        try {
            await API.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'index.html';
    },

    requireAuth: (redirectTo = 'login.html') => {
        if (!Auth.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
};

window.Auth = Auth;