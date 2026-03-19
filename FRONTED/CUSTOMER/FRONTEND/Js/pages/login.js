// ===============================
// LOGIN.JS (API Integrated)
// ===============================
document.addEventListener("DOMContentLoaded", function () {

  if (typeof API_BASE_URL === "undefined") {
    showError("API configuration error.");
    return;
  }

  fetchSalonInfo();
  initializeLoginPage();
});
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
        document.title = `${salon.salon_name} | Login`;
    }
}

// Function to initialize the login page elements and event listeners
function initializeLoginPage() {
  const form = document.getElementById("loginForm");
  const mobileInput = document.getElementById("mobile");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const token = localStorage.getItem("auth_token");

  // disable/enable fields based on input/focus
  if (mobileInput && emailInput) {
      const updateState = () => {
          if (mobileInput.value.trim()) {
              emailInput.disabled = true;
              emailInput.value = "";
          } else {
              emailInput.disabled = false;
          }
          if (emailInput.value.trim()) {
              mobileInput.disabled = true;
              mobileInput.value = "";
          } else {
              mobileInput.disabled = false;
          }
      };

      mobileInput.addEventListener("input", updateState);
      emailInput.addEventListener("input", updateState);

      mobileInput.addEventListener("focus", () => {
          emailInput.disabled = true;
          emailInput.value = "";
      });
      emailInput.addEventListener("focus", () => {
          mobileInput.disabled = true;
          mobileInput.value = "";
      });

      // restrict mobile to digits only (like signup)
      mobileInput.addEventListener("input", function () {
          this.value = this.value.replace(/\D/g, "").slice(0, 10);
          updateState();
      });
  }

  if (token) {
    window.location.href = "../index.html";
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const mobile = mobileInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // require password plus either mobile or email
    if ((!mobile && !email) || !password) {
      showError("Please provide email or mobile number and password.");
      return;
    }

    // Validate mobile format (10 digits, starts with 6-9)
    if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) {
      showError("Please enter a valid 10-digit mobile number (starting with 6-9).");
      return;
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    try {
      // build payload depending on which identifier is provided
      const payload = {
        password: password,
        login_type: "CUSTOMER",
        salon_id: salonId  // Use dynamic salon_id from config
      };
      if (mobile) {
        payload.phone = mobile;
      } else {
        payload.email = email;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === "success") {

        const accessToken = data.data.access_token;
        const refreshToken = data.data.refresh_token;

        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        await showSuccess("Login successful! Welcome back.");
        window.location.href = "../index.html";

      } else {
        // Handle specific error messages from backend
        let errorMessage = "Login failed. Please try again.";
        
        if (response.status === 400) {
          // Bad request - validation error
          errorMessage = data.message || "Invalid request. Please check your input.";
        } else if (response.status === 401) {
          // Unauthorized - wrong credentials
          if (mobile) {
            errorMessage = "Incorrect mobile number or password. Please try again.";
          } else {
            errorMessage = "Incorrect email or password. Please try again.";
          }
        } else if (response.status === 403) {
          // Forbidden - account inactive
          errorMessage = "Your account has been deactivated. Please contact support.";
        } else if (response.status === 500) {
          // Server error
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data.message || errorMessage;
        }
        
        showError(errorMessage);
      }

    } catch (error) {
      // Network error or other exception
      if (error instanceof TypeError && error.message.includes("fetch")) {
        showError("Cannot connect to server. Please check your internet connection.");
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  });
}

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  const icon = document.querySelector('.toggle-password i');

  if (input.type === "password") {
    input.type = "text";
    icon.className = "ri-eye-off-fill";
  } else {
    input.type = "password";
    icon.className = "ri-eye-fill";
  }
}