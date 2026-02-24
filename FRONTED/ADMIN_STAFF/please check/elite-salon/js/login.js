document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('alertBox');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const salon_id = document.getElementById('salon_id').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!salon_id || !email || !password) {
            showAlert('All fields are required', 'error');
            return;
        }

        try {

            const response = await API.auth.login({
                salon_id: parseInt(salon_id),
                email: email.trim(),
                password: password,
                login_type: "ADMIN/STAFF"
            });
            console.log("LOGIN RESPONSE:", response);

            if (response.status === "success") {

                // Get logged-in user info
                const userResponse = await API.auth.getCurrentUser();

                if (userResponse.status === "success") {
                    
                    localStorage.setItem('es_user', JSON.stringify(userResponse.data));
                    
                }

                showAlert('Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }

        } catch (error) {
            showAlert(error.message || 'Login failed', 'error');
        }
    });

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type} show`;

        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 4000);
    }

  

});
