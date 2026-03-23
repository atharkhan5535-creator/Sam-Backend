// SUPER ADMIN LOGIN PAGE - Redesigned to match ADMIN module
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const loginBtnText = document.getElementById("loginBtnText");
    const loginSpinner = document.getElementById("loginSpinner");

    // Rate limiting variables
    let loginAttempts = 0;
    let lastAttemptTime = 0;
    let isLockedOut = false;

    // Check rate limit for login attempts
    function checkRateLimit() {
        const now = Date.now();

        // Check if locked out
        if (isLockedOut) {
            if (now - lastAttemptTime < 300000) { // 5 minute lockout
                return { allowed: false, message: 'Too many failed attempts. Please wait 5 minutes.' };
            }
            // Reset after 5 minutes
            loginAttempts = 0;
            isLockedOut = false;
        }

        // Check cooldown (5 seconds between attempts)
        if (now - lastAttemptTime < 5000) {
            return { allowed: false, message: 'Please wait before trying again.' };
        }

        lastAttemptTime = now;
        loginAttempts++;

        // Lock out after 5 failed attempts
        if (loginAttempts >= 5) {
            isLockedOut = true;
            return { allowed: false, message: 'Too many failed attempts. Please wait 5 minutes.' };
        }

        return { allowed: true };
    }

    // Reset login attempts on successful login
    function resetLoginAttempts() {
        loginAttempts = 0;
        isLockedOut = false;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Clear any existing tokens before new login attempt
            TokenManager.removeToken();
            TokenManager.removeUser();
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('csrf_token');

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showErrorToast('Please enter a valid email address.');
                loginBtn.disabled = false;
                loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                return;
            }

            // Password validation before API call
            if (password.length < 6) {
                showErrorToast('Password must be at least 6 characters');
                loginBtn.disabled = false;
                loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                return;
            }

            // Check rate limit
            const rateCheck = checkRateLimit();
            if (!rateCheck.allowed) {
                showErrorToast(rateCheck.message);
                loginBtn.disabled = false;
                loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                return;
            }

            // Disable button and show spinner
            loginBtn.disabled = true;
            loginBtnText.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Signing in...';

            try {
                // Call login API using AuthAPI.login()
                const result = await AuthAPI.login(email, password, 'SUPER_ADMIN');

                if (result.success) {
                    showSuccess('Login successful! Redirecting...');

                    if (result.data.refresh_token) {
                        localStorage.setItem('refresh_token', result.data.refresh_token);
                    }

                    // Reset login attempts on success
                    resetLoginAttempts();

                    // Use AuthAPI.getRedirectUrl() for consistent redirect
                    setTimeout(() => {
                        window.location.href = AuthAPI.getRedirectUrl(result.user);
                    }, 1000);
                } else {
                    showErrorToast(result.message || 'Invalid credentials. Please try again.');
                    loginBtn.disabled = false;
                    loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                }
            } catch (error) {
                showErrorToast('Login failed: ' + error.message);
                loginBtn.disabled = false;
                loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            }
        });
    } else {
        console.error("Login form not found!");
    }

    // Check if already logged in on page load
    setTimeout(function() {
        // Check if user just logged out
        var justLoggedOut = sessionStorage.getItem('justLoggedOut');
        if (justLoggedOut === 'true') {
            // User just logged out, DON'T redirect
            sessionStorage.removeItem('justLoggedOut');
            console.log('User just logged out, staying on login page');
            return;
        }

        // Otherwise check if authenticated and is SUPER_ADMIN
        const user = TokenManager.getUser();
        if (user && TokenManager.isAuthenticated() && user.role === 'SUPER_ADMIN') {
            window.location.href = 'sa-dashboard.html';
        }
    }, 300);
});
