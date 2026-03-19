
const API_BASE_URL = "http://localhost/Sam-Backend/BACKEND/public/index.php/api";
const IMAGE_BASE = "http://localhost/Sam-Backend/BACKEND/public/";

// ===============================
// CONFIG - Salon ID Configuration
// ===============================
// Priority: 1) URL parameter  2) localStorage  3) Default fallback
const urlParams = new URLSearchParams(window.location.search);
const storedSalonId = localStorage.getItem("salon_id");

// Get salon_id from URL (?salon_id=X), localStorage, or default to 1
const salonId = urlParams.get('salon_id') || storedSalonId || 1;

// Optional: Save to localStorage for persistence across pages
if (urlParams.get('salon_id')) {
    localStorage.setItem("salon_id", salonId);
}

// Debug: Log current salon ID (remove in production)
console.log(`[Config] Using salon_id: ${salonId}`);