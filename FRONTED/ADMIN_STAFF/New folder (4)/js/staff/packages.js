/* =============================================
   STAFF PACKAGES PAGE
   View available service packages
   ============================================= */

let staffPackages = [];

document.addEventListener('DOMContentLoaded', function() {
    loadStaffPackages();
    setupPackageListeners();
});

// Load staff packages
async function loadStaffPackages() {
    showLoading('packagesGrid');
    
    try {
        // Get current staff user
        const user = TokenManager.getUser();
        if (!user || !user.id) {
            showError('packagesGrid', 'User not found');
            return;
        }
        
        // Mock data - replace with actual API call
        // const result = await PackageAPI.getPackages();
        // if (result.success) {
        //     staffPackages = result.data.items;
        // }
        
        // Mock data for demonstration
        staffPackages = [
            { 
                id: 1, 
                name: "Bridal Bliss Package", 
                category: "Bridal", 
                services: ["Haircut", "Full Color", "Manicure", "Pedicure", "Facial"], 
                discount: 20, 
                price: 299.00, 
                original: 375.00, 
                featured: true, 
                validity: 90,
                description: "Complete bridal preparation package including hair styling, makeup, and nail services for your special day."
            },
            { 
                id: 2, 
                name: "Total Transformation", 
                category: "Hair", 
                services: ["Haircut", "Full Color", "Blowdry"], 
                discount: 15, 
                price: 189.00, 
                original: 225.00, 
                featured: false, 
                validity: 30,
                description: "Full hair makeover with professional styling and color treatment."
            },
            { 
                id: 3, 
                name: "Relax & Rejuvenate", 
                category: "Spa", 
                services: ["Massage", "Facial", "Manicure"], 
                discount: 10, 
                price: 199.00, 
                original: 225.00, 
                featured: true, 
                validity: 60,
                description: "Ultimate relaxation experience with massage, facial, and manicure."
            },
            { 
                id: 4, 
                name: "Beauty Essentials", 
                category: "Beauty", 
                services: ["Haircut", "Manicure", "Pedicure"], 
                discount: 12, 
                price: 129.00, 
                original: 149.00, 
                featured: false, 
                validity: 30,
                description: "Everyday beauty basics for a complete refresh."
            },
            { 
                id: 5, 
                name: "VIP Royal Package", 
                category: "Luxury", 
                services: ["Haircut", "Full Color", "Manicure", "Pedicure", "Massage", "Facial"], 
                discount: 25, 
                price: 449.00, 
                original: 599.00, 
                featured: true, 
                validity: 120,
                description: "The complete luxury experience with all premium services."
            },
            { 
                id: 6, 
                name: "Mens Grooming", 
                category: "Grooming", 
                services: ["Haircut", "Beard Trim", "Facial"], 
                discount: 10, 
                price: 89.00, 
                original: 99.00, 
                featured: false, 
                validity: 30,
                description: "Complete men's grooming package."
            },
            { 
                id: 7, 
                name: "Nail Lover", 
                category: "Nails", 
                services: ["Manicure", "Pedicure", "Nail Art"], 
                discount: 15, 
                price: 79.00, 
                original: 95.00, 
                featured: false, 
                validity: 45,
                description: "Pamper your hands and feet with our nail special."
            },
            { 
                id: 8, 
                name: "Mother's Day Special", 
                category: "Seasonal", 
                services: ["Haircut", "Facial", "Manicure"], 
                discount: 20, 
                price: 149.00, 
                original: 189.00, 
                featured: true, 
                validity: 15,
                description: "Limited time Mother's Day special package."
            },
        ];
        
        renderPackages();
    } catch (error) {
        showError('packagesGrid', error.message);
    }
    
    hideLoading('packagesGrid');
}

// Render packages grid
function renderPackages() {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;
    
    // Get search term
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    // Filter packages
    let filtered = staffPackages.filter(pkg => 
        !searchTerm || 
        pkg.name.toLowerCase().includes(searchTerm) || 
        pkg.category.toLowerCase().includes(searchTerm) ||
        pkg.description.toLowerCase().includes(searchTerm)
    );
    
    // Sort by featured first, then by name
    filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
    });
    
    // Render grid
    grid.innerHTML = filtered.map(pkg => {
        const serviceTags = pkg.services.slice(0, 3).map(s => 
            `<span class="badge badge-purple" style="margin-right:.3rem;margin-bottom:.3rem;display:inline-block">${s}</span>`
        ).join('');
        
        const remainingCount = pkg.services.length - 3;
        const moreTag = remainingCount > 0 ? 
            `<span class="badge badge-gray">+${remainingCount}</span>` : '';
        
        return `
        <div class="content-card package-card" onclick="viewPackage(${pkg.id})">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
                <h3 style="color:#333;font-size:1.1rem">${pkg.name}</h3>
                ${pkg.featured ? '<span class="badge badge-warning">⭐ Featured</span>' : ''}
            </div>
            <p style="color:#666;font-size:.85rem;margin-bottom:1rem">${pkg.description}</p>
            <div style="margin-bottom:.75rem">
                ${serviceTags}
                ${moreTag}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
                <div>
                    <span style="font-size:1.3rem;font-weight:700;color:#8b5cf6">${formatDisplayCurrency(pkg.price)}</span>
                    <span style="color:#888;font-size:.8rem;text-decoration:line-through;margin-left:.5rem">${formatDisplayCurrency(pkg.original)}</span>
                </div>
                <span class="badge badge-success">Save ${pkg.discount}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="color:#888;font-size:.8rem">
                    <i class="fas fa-calendar-alt"></i> ${pkg.validity} days validity
                </span>
                <span class="badge badge-info">${pkg.category}</span>
            </div>
        </div>
    `}).join('');
    
    // Update info
    const infoEl = document.getElementById('packagesInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${filtered.length} of ${staffPackages.length} packages`;
    }
    
    // Update stats
    updatePackageStats(filtered);
}

// Update package statistics
function updatePackageStats(filteredPackages) {
    const totalEl = document.getElementById('totalPackages');
    const featuredEl = document.getElementById('featuredPackages');
    const avgDiscountEl = document.getElementById('avgDiscount');
    
    if (totalEl) {
        totalEl.textContent = filteredPackages.length;
    }
    
    if (featuredEl) {
        const featuredCount = filteredPackages.filter(p => p.featured).length;
        featuredEl.textContent = featuredCount;
    }
    
    if (avgDiscountEl) {
        const avgDiscount = filteredPackages.reduce((sum, p) => sum + p.discount, 0) / filteredPackages.length;
        avgDiscountEl.textContent = Math.round(avgDiscount) + '%';
    }
}

// View package details
function viewPackage(packageId) {
    const pkg = staffPackages.find(p => p.id === packageId);
    if (!pkg) return;
    
    const modal = document.getElementById('packageDetailModal');
    const content = document.getElementById('detailContent');
    
    if (!modal || !content) return;
    
    const serviceList = pkg.services.map(s => 
        `<span class="badge badge-purple" style="margin-right:.3rem;margin-bottom:.3rem;display:inline-block">${s}</span>`
    ).join('');
    
    content.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <h2 style="color:#333;margin-bottom:.5rem">${pkg.name}</h2>
            <span class="badge badge-info">${pkg.category}</span>
            ${pkg.featured ? '<span class="badge badge-warning" style="margin-left:.5rem">⭐ Featured</span>' : ''}
        </div>
        <p style="color:#666;margin-bottom:1.5rem;text-align:center">${pkg.description}</p>
        <div style="margin-bottom:1.5rem">
            <h4 style="color:#7c3aed;font-size:.9rem;margin-bottom:.75rem">Included Services:</h4>
            <div style="display:flex;flex-wrap:wrap;gap:.5rem">
                ${serviceList}
            </div>
        </div>
        <div style="background:#f9f5ff;border-radius:12px;padding:1.5rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
                <span>Regular Price:</span>
                <span style="color:#888;text-decoration:line-through">${formatDisplayCurrency(pkg.original)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
                <span>Discount:</span>
                <span style="color:#ef4444">-${pkg.discount}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:1.2rem;font-weight:700;border-top:2px solid #ddd6fe;padding-top:.75rem;margin-top:.5rem">
                <span>Package Price:</span>
                <span style="color:#8b5cf6">${formatDisplayCurrency(pkg.price)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:.5rem;color:#10b981;font-weight:600">
                <span>You save:</span>
                <span>${formatDisplayCurrency(pkg.original - pkg.price)} (${pkg.discount}%)</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:.5rem;color:#888">
                <span>Validity:</span>
                <span>${pkg.validity} days</span>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
}

// Filter packages
function filterPackages() {
    renderPackages();
}

// Reset search
function resetSearch() {
    document.getElementById('searchInput').value = '';
    renderPackages();
}

// Setup package listeners
function setupPackageListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterPackages, 300));
    }
    
    // Reset button
    const resetBtn = document.querySelector('[onclick="resetSearch()"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSearch);
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
    }
}

// Export functions
window.filterPackages = filterPackages;
window.resetSearch = resetSearch;
window.viewPackage = viewPackage;
window.closeModal = closeModal;