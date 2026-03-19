// ===============================
// SALON INFO  (public — no token)
// ===============================
async function fetchSalonInfo() {
    try {
        const res  = await fetch(`${API_BASE_URL}/salon/info?salon_id=${salonId}`);
        const data = await res.json();

        if (data.status !== "success") return;

        populateSalonInfo(data.data);

    } catch (err) {
        showError("Could not load salon info");
    }
}
function populateSalonInfo(salon) {
    const wordMark = document.getElementById("logo-text");
        if (wordMark) {
        wordMark.textContent = salon.salon_name ?? wordMark.textContent;
        const words = wordMark.textContent.split(/\s+/);
        if (words.length > 1) {
            const first = words[0];
            const rest = words.slice(1).join(' ');
            wordMark.innerHTML = `${first} <span>${rest}</span>`;
        } else {
            wordMark.innerHTML = wordMark.textContent;
        }
    }
    else {
        showError("Could not load salon name");
    }
    /* ── Page / browser title ── */
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Sign up`;
    }
}
fetchSalonInfo();

const form = document.getElementById("signupForm");
const mobileInput = document.getElementById("mobile");

// Password pattern: minimum 6 characters (matches backend validation)
const passwordPattern = /^.{6,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^[6-9][0-9]{9}$/;

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const full_name = document.getElementById("fullname").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  let isValid = true;
  let errors = [];

  // ========== VALIDATIONS ==========
  
  // Name validation
  if (!full_name || full_name.length < 3) {
    errors.push("Name must be at least 3 characters long.");
    isValid = false;
  } else if (full_name.length > 100) {
    errors.push("Name must not exceed 100 characters.");
    isValid = false;
  }

  // Mobile validation (if provided)
  if (mobile && !mobilePattern.test(mobile)) {
    errors.push("Mobile number must be a valid 10-digit Indian number (starting with 6-9).");
    isValid = false;
  }

  // Email validation
  if (!email && !mobile) {
    errors.push("Please provide either email or mobile number.");
    isValid = false;
  } else if (email && !emailPattern.test(email)) {
    errors.push("Please enter a valid email address.");
    isValid = false;
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
    isValid = false;
  }

  // Password confirmation
  if (password !== confirmPassword) {
    errors.push("Passwords do not match!");
    isValid = false;
  }

  // Show all validation errors
  if (!isValid) {
    showError(errors.join("<br>"));
    return;
  }

  // Prepare data
  const userData = {
    name: full_name,
    phone: mobile,
    email: email,
    password: password,
    salon_id: salonId  // Use dynamic salon_id from config
  };

  try {
    showLoading("Creating your account...");
    const response = await fetch(`${API_BASE_URL}/customers/register`, {
     method: "POST",
      headers: {
       "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    Swal.close();

    if (!response.ok) {
      // Handle specific HTTP status codes
      if (response.status === 400) {
        // Bad request - validation error from backend
        showError(data.message || "Invalid information provided. Please check your details.");
      } else if (response.status === 409) {
        // Conflict - duplicate phone or email
        if (data.message && data.message.includes("Phone")) {
          showError("This mobile number is already registered. Please use a different number or login.");
        } else if (data.message && data.message.includes("Email")) {
          showError("This email is already registered. Please use a different email or login.");
        } else {
          showError("An account with this information already exists. Please login instead.");
        }
      } else if (response.status === 404) {
        // Salon not found
        showError("Invalid salon configuration. Please contact support.");
      } else if (response.status >= 500) {
        // Server error
        showError("Server error. Please try again later.");
      } else {
        showError(data.message || "Registration failed. Please try again.");
      }
      return;
    }

    // Success
    if (data.status === "success") {
      await showSuccess("Registration successful! Redirecting to login...");
      form.reset();
      window.location.href = "../html/login.html";
    } else {
      showError(data.message || "Registration failed. Please try again.");
    }

  } catch (error) {
    Swal.close();
    // Network error or other exception
    if (error instanceof TypeError && error.message.includes("fetch")) {
      showError("Cannot connect to server. Please check your internet connection.");
    } else {
      showError("Something went wrong. Please try again.");
    }
  }
});

// Restrict mobile to numbers only
mobileInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  const span = input.nextElementSibling;
  const icon = span.querySelector('i');

  if (input.type === "password") {
    input.type = "text";
    icon.className = "ri-eye-off-fill";
  } else {
    input.type = "password";
    icon.className = "ri-eye-fill";
  }
}