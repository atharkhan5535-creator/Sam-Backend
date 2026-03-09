/* =============================================
   STAFF INVENTORY MANAGEMENT
   Log product usage and view inventory
   ============================================= */

let products = [];
let usageHistory = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadUsageHistory();
    setupInventoryListeners();
});

// Load products from API
async function loadProducts() {
    showLoading('invBody');
    
    try {
        // In a real app, this would call an API
        // For now, using mock data
        products = [
            { id: 1, name: "Hair Color – Blonde #45", cat: "Hair Products", stock: 12, price: 8.99, unit: "bottle" },
            { id: 2, name: "Shampoo – Professional Grade", cat: "Hair Products", stock: 25, price: 12.50, unit: "bottle" },
            { id: 3, name: "Conditioner – Deep Repair", cat: "Hair Products", stock: 18, price: 11.25, unit: "bottle" },
            { id: 4, name: "Hair Serum – Argan Oil", cat: "Hair Products", stock: 8, price: 15.99, unit: "bottle" },
            { id: 5, name: "Gel Nail Polish – Set", cat: "Nail Products", stock: 30, price: 24.99, unit: "set" },
            { id: 6, name: "Facial Cleanser – Sensitive", cat: "Skin Care", stock: 15, price: 18.75, unit: "bottle" },
        ];
        
        renderInventory();
    } catch (error) {
        showError('invBody', error.message);
    }
    
    hideLoading('invBody');
}

// Load usage history
function loadUsageHistory() {
    usageHistory = [
        { id: 1, date: "2026-02-18", product: "Hair Color – Blonde #45", qty: 1, appointment: "#3 – Sarah Williams", notes: "Root touch-up" },
        { id: 2, date: "2026-02-17", product: "Shampoo – Professional Grade", qty: 2, appointment: "General use", notes: "Morning appointments" },
        { id: 3, date: "2026-02-16", product: "Facial Cleanser – Sensitive", qty: 1, appointment: "#6 – Jessica Martinez", notes: "Sensitive skin" },
    ];
    
    renderUsageHistory();
}

// Render inventory table
function renderInventory() {
    const tbody = document.getElementById('invBody');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('invSearch')?.value.toLowerCase() || '';
    
    const filtered = products.filter(p => 
        !searchTerm || p.name.toLowerCase().includes(searchTerm) || p.cat.toLowerCase().includes(searchTerm)
    );
    
    tbody.innerHTML = filtered.map(p => {
        const stockStatus = p.stock === 0 ? 'Out of Stock' : (p.stock < 10 ? 'Low Stock' : 'In Stock');
        const statusClass = p.stock === 0 ? 'badge-danger' : (p.stock < 10 ? 'badge-warning' : 'badge-success');
        
        return `
        <tr>
            <td>${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.cat}</td>
            <td>${p.stock} ${p.unit}</td>
            <td>${formatDisplayCurrency(p.price)}</td>
            <td><span class="badge ${statusClass}">${stockStatus}</span></td>
        </tr>
    `}).join('');
    
    const infoEl = document.getElementById('invInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${filtered.length} of ${products.length} products`;
    }
}

// Render usage history
function renderUsageHistory() {
    const tbody = document.getElementById('usageLog');
    if (!tbody) return;
    
    tbody.innerHTML = usageHistory.map(u => `
        <tr>
            <td>${formatDisplayDate(u.date)}</td>
            <td>${u.product}</td>
            <td>${u.qty}</td>
            <td>${u.appointment}</td>
            <td>${u.notes}</td>
        </tr>
    `).join('');
}

// Setup inventory listeners
function setupInventoryListeners() {
    const searchInput = document.getElementById('invSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(renderInventory, 300));
    }
    
    const logBtn = document.getElementById('logUsageBtn');
    if (logBtn) {
        logBtn.addEventListener('click', handleLogUsage);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetLogForm);
    }
}

// Handle log usage
async function handleLogUsage() {
    const productSelect = document.getElementById('logProduct');
    const qtyInput = document.getElementById('logQty');
    const appointmentInput = document.getElementById('logAppt');
    const notesInput = document.getElementById('logNotes');
    
    // Validation
    if (!productSelect.value) {
        showToast('Please select a product', 'error');
        return;
    }
    
    if (!qtyInput.value || parseInt(qtyInput.value) < 1) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const productName = selectedOption.text.split(' (')[0];
    const productStock = products.find(p => p.name === productName)?.stock || 0;
    
    if (parseInt(qtyInput.value) > productStock) {
        showToast('Insufficient stock', 'error');
        return;
    }
    
    // Create usage log
    const newLog = {
        id: usageHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        product: productName,
        qty: parseInt(qtyInput.value),
        appointment: appointmentInput.value || 'General use',
        notes: notesInput.value || '—'
    };
    
    // Update product stock
    const product = products.find(p => p.name === productName);
    if (product) {
        product.stock -= newLog.qty;
    }
    
    // Add to history
    usageHistory.unshift(newLog);
    
    // Update UI
    renderInventory();
    renderUsageHistory();
    resetLogForm();
    
    showToast('Product usage logged successfully!');
}

// Reset log form
function resetLogForm() {
    const productSelect = document.getElementById('logProduct');
    const qtyInput = document.getElementById('logQty');
    const appointmentInput = document.getElementById('logAppt');
    const notesInput = document.getElementById('logNotes');
    
    if (productSelect) productSelect.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (appointmentInput) appointmentInput.value = '';
    if (notesInput) notesInput.value = '';
}

// Export functions
window.renderInventory = renderInventory;
window.resetLogForm = resetLogForm;