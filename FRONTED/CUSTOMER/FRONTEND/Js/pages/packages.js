// ===============================
// STATE
// ===============================
let packagesData = [];
let staffData = [];
let DOM = {};
const token = localStorage.getItem("auth_token");

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    cacheDOM();
    checkAuth();
    attachEvents();
    fetchSalonInfo();
    fetchStaff();
    fetchPackages();
}

/* ── Scroll: darken navbar ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


// ===============================
// CACHE DOM
// ===============================
function cacheDOM() {

    DOM.loginBtn = document.getElementById("nav-log-btn");
    DOM.signupBtn = document.getElementById("nav-signup-btn");
    DOM.profileDiv = document.getElementById("nav-profile-div");

    DOM.searchInput = document.getElementById("package-search");
    DOM.packagesContainer = document.querySelector(".packages-container");

}

// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {

    if (token) {
        DOM.loginBtn.style.display = "none";
        DOM.signupBtn.style.display = "none";
        DOM.profileDiv.style.display = "flex";
    } else {
        DOM.loginBtn.style.display = "inline-block";
        DOM.signupBtn.style.display = "inline-block";
        DOM.profileDiv.style.display = "none";
    }
}

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
    } else {
        showError("Could not load salon name");
    }

    /* ── Page / browser title ── */
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Packages`;
    }
}

// ===============================
// FETCH STAFF
// ===============================
async function fetchStaff() {
    try {
        const res = await fetch(`${API_BASE_URL}/staff?salon_id=${salonId}`);
        const data = await res.json();

        if (data.status !== "success") return;

        staffData = data.data.items || [];
        console.log('👥 Staff loaded:', staffData);

    } catch (error) {
        console.error("Staff fetch error:", error);
    }
}

// ===============================
// GET STAFF NAME BY ID
// ===============================
function getStaffNameById(staffId) {
    const staff = staffData.find(s => String(s.staff_id) === String(staffId));
    return staff ? staff.name : null;
}

function getStaffSpecialization(staffId) {
    const staff = staffData.find(s => String(s.staff_id) === String(staffId));
    return staff ? staff.specialization : "Professional";
}

// ===============================
// FETCH PACKAGES
// ===============================
async function fetchPackages() {
    try {
        const res = await fetch(`${API_BASE_URL}/packages?salon_id=${salonId}`);

        if (!res.ok) throw new Error("Packages API failed");

        const data = await res.json();

        if (data.status !== "success") return;

        packagesData = data.data.items;

        renderPackages(packagesData);

    } catch (error) {
        showError("Failed to load packages. Please try again later.");
    }
}

// ===============================
// RENDER PACKAGES
// ===============================
function renderPackages(packages) {

    if (!DOM.packagesContainer) return;

    if (packages.length === 0) {
        DOM.packagesContainer.innerHTML = "<p>No packages available</p>";
        return;
    }

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
        <div class="package-card"
            data-id="${pkg.package_id}"
            data-name="${pkg.package_name}"
            data-price="${pkg.total_price}"
            data-duration="${pkg.duration || 0}"
        >
            <div class="package-image">
                <img
                    src="${imageUrl}"
                    alt="${pkg.package_name}"
                    onerror="this.src=this.dataset.placeholder; this.alt='Image not found';"
                    data-placeholder="${placeholderImage}"
                >
            </div>
            <div class="package-content">
                <div class="package-top">
                    <h3 class="package-title">${pkg.package_name}</h3>
                    <div class="view-details">
                        <span>view details</span>
                        <i class="ri-information-line"></i>
                    </div>
                </div>

                <ul class="package-services">
                    ${pkg.services
                        ? pkg.services
                              .split(",")
                              .filter(s => s.trim())
                              .map(s => `<li><i class="ri-check-fill"></i>${s.trim()}</li>`).join("")
                        : ""
                    }
                </ul>

                <div class="package-bottom">
                    <div class="package-price">₹${pkg.total_price}</div>
                    <div class="offer-tag">${pkg.discount || 0}%off</div>
                    <button class="package-book-btn">
                        Book Appointment
                    </button>
                </div>

                <div class="details-panel">
                    <h4>Package Details</h4>
                    <p class="package-description">
                        ${pkg.description || "Premium salon package"}
                    </p>
                    <ul>
                       <li>Non-refundable</li>
                       <li>Not transferable</li>
                       <li>Prior appointment required</li>
                    </ul>
                    <p class="validity">
                        Valid for ${pkg.validity_days} days
                    </p>

                    <button class="close-btn">
                        Close
                    </button>
                </div>

            </div>
        </div>

    `;
    }).join("");

    DOM.packagesContainer.innerHTML = html;

}

// ===============================
// GLOBAL EVENTS
// ===============================
function attachEvents() {

    // SEARCH
    DOM.searchInput.addEventListener("input", handleSearch);

    // PACKAGE ACTIONS
    document.addEventListener("click", handlePackageActions);

}

// ===============================
// SEARCH PACKAGES
// ===============================
function handleSearch() {
    const value = DOM.searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".package-card");

    cards.forEach(card => {

        const name = card
            .querySelector(".package-title")
            .textContent
            .toLowerCase();

        card.style.display =
            name.includes(value) ? "flex" : "none";
    });
}

// ===============================
// PACKAGE ACTION HANDLER
// ===============================
async function handlePackageActions(e) {

    // OPEN DETAILS
    if (e.target.closest(".view-details")) {

        const card = e.target.closest(".package-card");
        card.classList.add("show-details");

    }

    // CLOSE DETAILS
    if (e.target.classList.contains("close-btn")) {

        const card = e.target.closest(".package-card");
        card.classList.remove("show-details");

    }

    // BOOK PACKAGE
    if (e.target.classList.contains("package-book-btn")) {

        if (token) {
            const card = e.target.closest(".package-card");
            const packageId = card.dataset.id;
            const packageName = card.dataset.name;
            const packagePrice = card.dataset.price;
            const packageDuration = card.dataset.duration || 60;

            try {
                showLoading("Loading package details...");

                // Fetch package details including services
                const res = await fetch(`${API_BASE_URL}/packages/${packageId}?salon_id=${salonId}`);

                // Check if response is OK
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('Package API error:', res.status, errorText);
                    Swal.close();
                    showError(`Failed to load package: ${res.status} ${errorText}`);
                    return;
                }

                // Parse JSON
                const data = await res.json();
                console.log('📦 Package API response:', data);
                console.log('📦 API Response status:', data.status);
                console.log('📦 API Response data.services:', data.data?.services);
                console.log('📦 API Response data.services length:', data.data?.services?.length);

                Swal.close();

                if (data.status !== "success") {
                    showError(data.message || "Failed to load package details");
                    return;
                }

                const packageData = data.data;
                console.log('📦 FULL Package data:', JSON.stringify(packageData, null, 2));
                console.log('📦 Package services array:', packageData.services);
                console.log('📦 Services count:', packageData.services ? packageData.services.length : 'NO SERVICES');
                
                // DEBUG: Log each service details
                if (packageData.services && packageData.services.length > 0) {
                    console.log('✅ Services FOUND in package:');
                    packageData.services.forEach((svc, idx) => {
                        console.log(`  Service ${idx + 1}:`, {
                            service_id: svc.service_id,
                            service_name: svc.service_name,
                            price: svc.price,
                            duration: svc.duration,
                            staff_id: svc.staff_id
                        });
                    });
                } else {
                    console.log('❌ NO Services in package - fallback to package-only booking');
                }
                
                console.log('📦 First service keys:', packageData.services && packageData.services[0] ? Object.keys(packageData.services[0]) : 'NO SERVICES');

                // Map package services to booking items - API now returns staff_id
                // Each service keeps its own data (service_id, staff_id, duration) for staff assignment
                // but uses the PACKAGE total_price for consistent pricing
                let services = [];

                if (packageData.services && Array.isArray(packageData.services) && packageData.services.length > 0) {
                    services = packageData.services.map(pkgService => {
                        console.log('  🔍 pkgService object:', pkgService);
                        console.log('  🔍 pkgService.staff_id:', pkgService.staff_id, 'type:', typeof pkgService.staff_id);

                        // Get staff info from staffData using staff_id from API
                        const staffName = pkgService.staff_id ? getStaffNameById(pkgService.staff_id) : null;
                        const specialization = "Professional"; // services table doesn't have specialization column

                        console.log('    ✅ staff_name:', staffName, '| from staff_id:', pkgService.staff_id);

                        return {
                            service_id: pkgService.service_id,
                            service_name: pkgService.service_name,
                            price: parseFloat(packageData.total_price || packagePrice || 0),  // Use PACKAGE price, not service price
                            duration: parseInt(pkgService.duration || 30),
                            staff_id: pkgService.staff_id || null,
                            staff_name: staffName,
                            specialization: specialization,
                            from_package: true,
                            package_id: packageId,
                            package_name: packageData.package_name || packageName
                        };
                    });

                    console.log('📦 Final services with staff:', services);
                }

                // If no services found, use package as single item
                if (services.length === 0) {
                    services.push({
                        package_id: packageId,
                        package_name: packageName,
                        price: parseFloat(packagePrice || packageData.total_price || 0),
                        duration: parseInt(packageDuration || 60),
                        from_package: true
                    });
                }

                console.log('📦 Final booking services:', services);

                localStorage.setItem("bookingSource", "packages");
                localStorage.setItem("bookingItems", JSON.stringify(services));
                window.location.href = "booking.html";

            } catch (error) {
                Swal.close();
                console.error('Package booking error:', error);
                showError("Failed to book package. Please try again.");
            }
        } else {
            showWarning("Please login to book an appointment");
            setTimeout(() => {
                window.location.href = "./login.html";
            }, 1500);
        }
    }
}

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
        showError("Failed to logout.");

        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out");

        window.location.reload();
    }
}
