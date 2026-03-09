document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    if (!TokenManager.isAuthenticated() || !TokenManager.hasRole(USER_ROLES.SUPER_ADMIN)) {
        window.location.href = '../../html/super-admin/sa-login.html';
        return;
    }

    // 1. SELECT ALL ELEMENTS (Using the classes/IDs from your HTML)
    const modal = document.getElementById('addCustomerModal');
    const addBtn = document.querySelector('.btn-add');
    const addForm = document.getElementById('addCustomerForm');
    const searchInput = document.getElementById('customerSearch');
    const logoutBtn = document.getElementById('logoutBtn');

    // 2. MODAL OPEN LOGIC
    if (addBtn && modal) {
        addBtn.onclick = () => {
            modal.style.display = 'flex';
        };
    }

    // 3. MODAL CLOSE LOGIC (Click outside)
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 4. FORM SUBMIT LOGIC
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Customer Added Successfully!");
            modal.style.display = 'none';
            addForm.reset();
        });
    }

    // 5. SEARCH LOGIC
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const filter = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll('#customerTableBody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }

    // 6. LOGOUT LOGIC - SAME AS DASHBOARD
    setTimeout(function() {
        var logoutBtn = document.getElementById('logoutBtn');
        console.log('Customer Profile - Logout button found:', logoutBtn);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Customer Profile - Logout clicked');
                // Clear ALL auth data IMMEDIATELY
                localStorage.clear();
                sessionStorage.clear();
                sessionStorage.setItem('justLoggedOut', 'true');
                console.log('Customer Profile - Storage cleared!');
                // Redirect to login
                window.location.href = 'sa-login.html';
            });
        } else {
            console.error('Customer Profile - Logout button NOT found!');
        }
    }, 200);
});

// 7. GLOBAL CLOSE FUNCTION (For the Cancel Button in HTML)
function closeModal() {
    const modal = document.getElementById('addCustomerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}