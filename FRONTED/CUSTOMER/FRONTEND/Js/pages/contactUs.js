// ===============================
// CONTACT US PAGE - OPTIMIZED
// ===============================

document.addEventListener("DOMContentLoaded", initContactPage);

let selectedRating = 0;
let selectedAppointmentId = null;
let completedAppointments = [];

// ===============================
// INITIALIZATION
// ===============================
function initContactPage() {
    checkAuth();
    initStarRating();
    attachEventListeners();
    fetchSalonInfo();
    
    // Only fetch appointments if user is logged in
    if (localStorage.getItem("auth_token")) {
        fetchCompletedAppointments();
    }
}

/* ── Scroll: darken navbar ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {
    const accessToken = localStorage.getItem("auth_token");
    const loginBtn = document.getElementById("nav-log-btn");
    const signupBtn = document.getElementById("nav-signup-btn");
    const profileDiv = document.getElementById("nav-profile-div");

    if (accessToken) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        profileDiv.style.display = "flex";
    } else {
        loginBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        profileDiv.style.display = "none";
    }
}

// ===============================
// SALON INFO
// ===============================
async function fetchSalonInfo() {
    try {
        const res = await fetch(`${API_BASE_URL}/salon/info?salon_id=${salonId}`);
        const data = await res.json();

        if (data.status !== "success") return;

        populateSalonInfo(data.data);
        populateSocialLinks(data.data);

    } catch (err) {
        console.error("Failed to load salon info:", err);
    }
}

function populateSalonInfo(salon) {
    // Logo
    const wordMark = document.getElementById("logo-text");
    if (wordMark) {
        wordMark.textContent = salon.salon_name ?? wordMark.textContent;
        const words = wordMark.textContent.split(/\s+/);
        if (words.length > 1) {
            const first = words[0];
            const rest = words.slice(1).join(' ');
            wordMark.innerHTML = `${first} <span>${rest}</span>`;
        }
    }

    // Address
    const nameEl = document.getElementById("salon-name");
    const addressEl = document.getElementById("salon-address");

    if (nameEl) nameEl.textContent = salon.salon_name ?? nameEl.textContent;

    if (addressEl) {
        const parts = [
            salon.address,
            salon.city,
            salon.state,
            salon.country
        ].filter(Boolean);
        addressEl.innerHTML = parts.join(", ");
    }

    // Phone
    const phoneDisplay = document.getElementById("salon-phone-display");
    const phoneLink = document.getElementById("salon-phone-link");

    if (phoneDisplay && salon.phone) {
        phoneDisplay.textContent = `+91 ${salon.phone}`;
        phoneLink.href = `tel:+91${salon.phone}`;
        phoneLink.style.display = 'inline-block';
    } else if (phoneLink) {
        phoneLink.style.display = 'none';
    }

    // Email
    const emailDisplay = document.getElementById("salon-email-display");
    const emailLink = document.getElementById("salon-email-link");

    if (emailDisplay && salon.email) {
        emailDisplay.textContent = salon.email;
        emailLink.href = `mailto:${salon.email}`;
        emailLink.style.display = 'inline-block';
    } else if (emailLink) {
        emailLink.style.display = 'none';
    }

    // Page title
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Contact Us`;
    }
}

// ===============================
// APPOINTMENTS FOR FEEDBACK
// ===============================
async function fetchCompletedAppointments() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
        const res = await fetch(
            `${API_BASE_URL}/appointments?status=COMPLETED&salon_id=${salonId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();
        if (data.status !== "success") return;

        completedAppointments = data.data.items || [];
        populateAppointmentSelect(completedAppointments);

    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

function populateAppointmentSelect(appointments) {
    const select = document.getElementById("appointment-select");
    if (!select) return;

    if (!appointments || appointments.length === 0) {
        // Show message but keep form usable for general feedback
        const msg = document.createElement("p");
        msg.className = "no-appointments-msg";
        msg.textContent = "No completed appointments yet. You can still submit general feedback.";
        msg.style.cssText = "font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;";
        select.parentNode.insertBefore(msg, select);
        select.style.display = 'none';
        return;
    }

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Appointment</option>';

    appointments.forEach(appt => {
        const option = document.createElement("option");
        const date = new Date(appt.appointment_date).toLocaleDateString("en-IN");
        
        option.value = appt.appointment_id;
        option.textContent = `Appointment - ${date}`;
        
        select.appendChild(option);
    });

    select.style.display = 'block';
    select.addEventListener("change", function() {
        selectedAppointmentId = this.value || null;
    });
}

// ===============================
// FEEDBACK SUBMISSION
// ===============================
function attachEventListeners() {
    const submitBtn = document.getElementById("submit-feedback-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click", submitFeedback);
    }
}

async function submitFeedback() {
    const token = localStorage.getItem("auth_token");
    
    // Validation
    if (!token) {
        showWarning("Please login to submit feedback");
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 1500);
        return;
    }

    if (selectedRating === 0) {
        showWarning("Please select a rating");
        // Animate stars to draw attention
        const stars = document.getElementById("stars");
        stars.style.animation = "shake 0.5s";
        setTimeout(() => stars.style.animation = "", 500);
        return;
    }

    const comment = document.getElementById("feedback-comment").value.trim();
    const isAnonymous = document.getElementById("feedback-anonymous").checked;

    // Check if selecting appointment is required (optional if no appointments)
    const selectEl = document.getElementById("appointment-select");
    if (selectEl && selectEl.style.display !== 'none' && !selectedAppointmentId && completedAppointments.length > 0) {
        showWarning("Please select an appointment or clear selection for general feedback");
        return;
    }

    try {
        // Show loading
        const submitBtn = document.getElementById("submit-feedback-btn");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Submitting...";
        submitBtn.disabled = true;

        const payload = {
            rating: selectedRating,
            comment: comment || null,
            is_anonymous: isAnonymous ? 1 : 0
        };

        let url;
        if (selectedAppointmentId) {
            // Submit appointment-specific feedback
            url = `${API_BASE_URL}/appointments/${selectedAppointmentId}/feedback`;
        } else {
            // Submit general feedback (if backend supports it)
            url = `${API_BASE_URL}/salon/feedback`;
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (data.status !== "success") {
            // If general feedback endpoint doesn't exist, fall back to appointment feedback
            if (!selectedAppointmentId && res.status === 404) {
                showWarning("Please select an appointment to submit feedback");
                return;
            }
            showWarning(data.message || "Failed to submit feedback");
            return;
        }

        // Success
        await showSuccess("Thank you for your feedback!");
        resetFeedbackForm();
        
        // Disable further submissions for this appointment
        if (selectedAppointmentId && selectEl) {
            const selectedOption = selectEl.querySelector(`option[value="${selectedAppointmentId}"]`);
            if (selectedOption) {
                selectedOption.disabled = true;
                selectedOption.textContent += " (Reviewed)";
            }
        }

    } catch (err) {
        console.error("Feedback submission error:", err);
        showError("Failed to submit feedback. Please try again.");
    }
}

function resetFeedbackForm() {
    selectedRating = 0;
    selectedAppointmentId = null;
    highlightStars(0);
    document.getElementById("feedback-comment").value = "";
    document.getElementById("feedback-anonymous").checked = false;
    
    const selectEl = document.getElementById("appointment-select");
    if (selectEl) {
        selectEl.value = "";
    }
}

// ===============================
// STAR RATING
// ===============================
function initStarRating() {
    const stars = document.querySelectorAll('.star');

    stars.forEach(star => {
        // Hover
        star.addEventListener('mouseenter', () => highlightStars(+star.dataset.i));
        star.addEventListener('mouseleave', () => highlightStars(selectedRating));

        // Click
        star.addEventListener('click', () => {
            selectedRating = +star.dataset.i;
            highlightStars(selectedRating);
        });
    });
}

function highlightStars(upTo) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const i = +star.dataset.i;
        const icon = star.querySelector('i');

        if (i <= upTo) {
            icon.classList.replace('ri-star-line', 'ri-star-fill');
            star.style.transform = 'scale(1.2)';
            star.style.color = 'var(--accent-gold)';
        } else {
            icon.classList.replace('ri-star-fill', 'ri-star-line');
            star.style.transform = 'scale(1)';
            star.style.color = '';
        }
    });
}

// ===============================
// LOGOUT
// ===============================
async function logout() {
    const confirm = await confirmAction(
        "Logout?",
        "You will be logged out of your account.",
        "Yes, Logout"
    );

    if (!confirm.isConfirmed) return;

    const refreshToken = localStorage.getItem("refresh_token");

    try {
        showLoading("Logging out...");

        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

        Swal.close();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out successfully");
        window.location.reload();

    } catch (error) {
        Swal.close();
        console.warn("Logout API failed");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out");
        window.location.reload();
    }
}
