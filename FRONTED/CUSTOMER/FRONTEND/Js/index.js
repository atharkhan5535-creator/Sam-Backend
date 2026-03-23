// ===============================
// INIT APP
// ===============================
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    checkAuth();
    landingPageSlider();
    attachGlobalEvents();
    fetchSalonInfo(); //salon info 
    await loadLandingData();
}

/* ── Scroll: darken navbar ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


//================================
// LANDING PAGE 
function landingPageSlider() {
    const slides   = document.querySelectorAll('.slide');
    const dotsWrap = document.getElementById('sliderDots');
    const counterEl = document.getElementById('counterCurrent');
    const heroContent = document.getElementById('heroContent');
    const total    = slides.length;
    let current    = 0;
    let timer      = null;
    const INTERVAL = 5000;

    /* Build dots */
    const dots = Array.from({ length: total }, (_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.innerHTML = i === 0 ? '<span class="dot-progress"></span>' : '';
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
      return btn;
    });

    function goTo(next) {
      if (next === current || total <= 1) return;

      /* Mark leaving */
      slides[current].classList.remove('active');
      slides[current].classList.add('leaving');
      setTimeout(() => {
        // remove leaving from the previous slide after animation
        const track = slides[next].closest('.slider-track');
        if (track) {
          const all = track.querySelectorAll('.slide');
          if (all[current]) all[current].classList.remove('leaving');
        }
      }, 950);

      /* Activate next */
      slides[next].classList.add('active');

      /* Dots */
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');
      dots[current].innerHTML = '';
      dots[next].classList.add('active');
      dots[next].setAttribute('aria-selected', 'true');
      dots[next].innerHTML = '<span class="dot-progress"></span>';

      /* Counter */
      counterEl.textContent = String(next + 1).padStart(2, '0');

      /* Content re-animate */
      heroContent.classList.remove('animate-in');
      void heroContent.offsetWidth; // reflow
      heroContent.classList.add('animate-in');

      current = next;
    }

    function next() {
      // advance and wrap around explicitly
      goTo((current + 1) % total);
    }

    function startTimer() {
      // build a single repeating interval; don't reset inside goTo
      clearInterval(timer);
      if (total > 1) {
        timer = setInterval(next, INTERVAL);
      }
    }
    /* Keyboard navigation */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  goTo((current - 1 + total) % total);
    });

    startTimer();
  }

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
// LOAD LANDING PAGE DATA
// ===============================
async function loadLandingData() {

    try {
        if (!salonId) {
            showError("Salon configuration missing.");
            return;
        }

        await Promise.all([
            fetchServices(),
            fetchPackages()
        ]);

    } catch (error) {
        showError("Failed to load homepage data.");
    }
}

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
 
    /* ── Address card ── */
    const wordMark = document.getElementById("logo-text");
    const nameEl    = document.getElementById("salon-name");
    const addressEl = document.getElementById("salon-address");
 
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

    if (nameEl) nameEl.textContent = salon.salon_name ?? nameEl.textContent;
 
    if (addressEl) {
        // Build a readable address from the parts returned by the API
        const parts = [
            salon.address,
            salon.city,
            salon.state,
            salon.country
        ].filter(Boolean);    // drop any null / empty segments
 
        addressEl.innerHTML = parts.join(", ");
    }
 
    /* ── Phone card ── */
    const phoneDisplay = document.getElementById("salon-phone-display");
    const phoneLink    = document.getElementById("salon-phone-link");
 
    if (phoneDisplay && salon.phone) {
        phoneDisplay.textContent = `+91 ${salon.phone}`;
    }
    if (phoneLink && salon.phone) {
        phoneLink.href = `tel:+91${salon.phone}`;
    }
 
    /* ── Email card ── */
    const emailDisplay = document.getElementById("salon-email-display");
    const emailLink    = document.getElementById("salon-email-link");
 
    if (emailDisplay && salon.email) {
        emailDisplay.textContent = salon.email;
    }
    if (emailLink && salon.email) {
        emailLink.href = `mailto:${salon.email}`;
    }
 
    /* ── Page / browser title ── */
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | home`;
    }
}

// ===============================
// FETCH SERVICES
// ===============================
async function fetchServices() {
    try {
        const res = await fetch( `${API_BASE_URL}/services?salon_id=${salonId}`);

        const data = await res.json();

        if (data.status !== "success") return;

        renderServices(data.data.items.slice(0, 3));

    } catch (error) {
        showError("Unable to load services right now.");
    }
}

// ===============================
// RENDER SERVICES
// ===============================
function renderServices(services) {

    const container = document.getElementById("servicesContainer");

    if (!container) return;

    container.innerHTML = "";

    // Placeholder image for missing service images
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

    const html = services.map(service => {
        // Check if image_url exists, is not null/empty, and build proper URL
        let imageUrl = placeholderImage;
        if (service.image_url && service.image_url.trim() !== '') {
            // Remove leading slash from image_url to avoid double slashes
            const cleanPath = service.image_url.replace(/^\/+/, '');
            imageUrl = IMAGE_BASE + cleanPath;
        }

        return `

        <div class="hero-display-service-card"
            data-id="${service.service_id}"
            data-name="${service.service_name}"
            data-price="${service.price}"
            data-duration="${service.duration}"
            data-category="${service.category || 'general'}"
        >
            <span class="price">₹${service.price}</span>
            <img
                class="service-img"
                src="${imageUrl}"
                alt="${service.service_name}"
                onerror="this.src=this.dataset.placeholder; this.alt='Image not found';"
                data-placeholder="${placeholderImage}"
            >
            <div class="display-card-content">
                <h4>${service.service_name}</h4>
                <small>
                    <i class="ri-time-line"></i>
                    ${service.duration} min
                </small>
            </div>
        </div>

    `;
    }).join("");

    container.innerHTML = html;
}

// ===============================
// FETCH PACKAGES
// ===============================
async function fetchPackages() {

    try {
        const res = await fetch(
            `${API_BASE_URL}/packages?salon_id=${salonId}`
        );
        const data = await res.json();

        if (data.status !== "success") return;

        renderPackages(data.data.items.slice(0, 3));

    } catch (error) {
         showError("Unable to load packages right now.");
    }
}

// ===============================
// RENDER PACKAGES
// ===============================
function renderPackages(packages) {

    const container =
        document.getElementById("packagesContainer");

    if (!container) return;

    container.innerHTML = "";

    // Placeholder image for missing package images
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

    const html = packages.map(pkg => {
        // Check if image_url exists, is not null/empty, and build proper URL
        let imageUrl = placeholderImage;
        if (pkg.image_url && pkg.image_url.trim() !== '') {
            // Remove leading slash from image_url to avoid double slashes
            const cleanPath = pkg.image_url.replace(/^\/+/, '');
            imageUrl = IMAGE_BASE + cleanPath;
        }

        return `

        <div class="hero-display-package-card"
            data-id="${pkg.package_id}"
            data-name="${pkg.package_name}"
            data-price="${pkg.total_price}"
         >
            <span class="price">
                ₹${pkg.total_price}
            </span>
            <span class="active-badge">Active</span>
            <img
                src="${imageUrl}"
                alt="${pkg.package_name}"
                onerror="this.src=this.dataset.placeholder; this.alt='Image not found';"
                data-placeholder="${placeholderImage}"
            >
            <div class="display-card-content">
                <h4>${pkg.package_name}</h4>
                <small>
                    Valid ${pkg.validity_days} days
                </small>
            </div>
        </div>

    `;
    }).join("");

    container.innerHTML = html;
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

    const refreshToken =
        localStorage.getItem("refresh_token");

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

// ===============================
// LOGIN REDIRECT
// ===============================
function redirectToLogin() {

    const token =
        localStorage.getItem("auth_token");

    if (!token) {
        
       showWarning("Please login first");
       setTimeout(() => {
         window.location.href = "./html/login.html";
        },  1500);
    }
}

// ===============================
// GLOBAL EVENTS
// ===============================
function attachGlobalEvents() {

    document.addEventListener("click", (e) => {

        if (e.target.closest(".hero-display-service-card")) {
            window.location.href = "./html/services.html";
        }

        if (e.target.closest(".hero-display-package-card")) {
            window.location.href = "./html/packages.html";
        }
    });
}