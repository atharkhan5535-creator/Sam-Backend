let inventory = [{
        id: 1,
        name: "Hair Color - Blonde #45",
        cat: "Hair Products",
        stock: 24,
        reorder: 10,
        price: 12.50,
        unit: "tube",
        supplier: "ColorPro Ltd",
        notes: ""
    },
    {
        id: 2,
        name: "Professional Shampoo 1L",
        cat: "Hair Products",
        stock: 8,
        reorder: 10,
        price: 18.00,
        unit: "bottle",
        supplier: "SalonSupply Co",
        notes: ""
    },
    {
        id: 3,
        name: "Conditioning Treatment",
        cat: "Hair Products",
        stock: 15,
        reorder: 8,
        price: 22.00,
        unit: "bottle",
        supplier: "SalonSupply Co",
        notes: ""
    },
    {
        id: 4,
        name: "Nail Polish - Red Series",
        cat: "Nail Products",
        stock: 3,
        reorder: 5,
        price: 8.50,
        unit: "piece",
        supplier: "NailPro",
        notes: ""
    },
    {
        id: 5,
        name: "Gel Top Coat",
        cat: "Nail Products",
        stock: 0,
        reorder: 5,
        price: 14.00,
        unit: "bottle",
        supplier: "NailPro",
        notes: "Urgent reorder needed"
    },
    {
        id: 6,
        name: "Facial Cleanser",
        cat: "Skin Care",
        stock: 20,
        reorder: 8,
        price: 25.00,
        unit: "bottle",
        supplier: "SkinCare Plus",
        notes: ""
    },
    {
        id: 7,
        name: "Massage Oil Lavender",
        cat: "Skin Care",
        stock: 7,
        reorder: 8,
        price: 19.00,
        unit: "bottle",
        supplier: "NaturalCare",
        notes: ""
    },
    {
        id: 8,
        name: "Hair Dryer Pro 2000W",
        cat: "Tools & Equipment",
        stock: 4,
        reorder: 2,
        price: 85.00,
        unit: "piece",
        supplier: "SalonEquip",
        notes: ""
    },
    {
        id: 9,
        name: "Disposable Towels",
        cat: "Cleaning Supplies",
        stock: 2,
        reorder: 20,
        price: 0.50,
        unit: "pack",
        supplier: "CleanCo",
        notes: ""
    },
    {
        id: 10,
        name: "Sanitizer Spray 500ml",
        cat: "Cleaning Supplies",
        stock: 12,
        reorder: 10,
        price: 6.00,
        unit: "bottle",
        supplier: "CleanCo",
        notes: ""
    },
];

let editId = null;
let reorderingId = null;

function getStatus(s, r) {
    if (s === 0) return 'out';
    if (s <= r) return 'low';
    return 'good';
}

function statusLabel(st) {
    return {
        good: 'In Stock',
        low: 'Low Stock',
        out: 'Out of Stock'
    }[st];
}

function statusClass(st) {
    return {
        good: 'stock-good',
        low: 'stock-low',
        out: 'stock-out'
    }[st];
}

function barColor(st) {
    return {
        good: '#10b981',
        low: '#f59e0b',
        out: '#ef4444'
    }[st];
}

function barPct(s, r) {
    if (r === 0) return 100;
    return Math.min(100, Math.round(s / r * 100));
}

function renderStats() {
    const total = inventory.length,
        low = inventory.filter(i => getStatus(i.stock, i.reorder) === 'low').length,
        out = inventory.filter(i => getStatus(i.stock, i.reorder) === 'out').length;
    document.getElementById('statsRow').innerHTML = `
        <div class="stat-card"><div class="val">${total}</div><div class="lbl">Total Products</div></div>
        <div class="stat-card"><div class="val">${total - low - out}</div><div class="lbl">In Stock</div></div>
        <div class="stat-card"><div class="val" style="background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${low}</div><div class="lbl">Low Stock</div></div>
        <div class="stat-card"><div class="val" style="background:linear-gradient(135deg,#ef4444,#dc2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${out}</div><div class="lbl">Out of Stock</div></div>
    `;
    const critical = inventory.filter(i => getStatus(i.stock, i.reorder) !== 'good');
    document.getElementById('alertBanner').innerHTML = critical.length ? `
        <div class="alert-banner"><i class="fas fa-triangle-exclamation" style="font-size:1.2rem"></i>
            <span><strong>${critical.length} item(s)</strong> need attention: ${critical.map(i => i.name).join(', ')}</span>
        </div>` : '';
}

function render() {
    const q = document.getElementById('iSearch').value.toLowerCase();
    const cat = document.getElementById('iCat').value;
    const st = document.getElementById('iStock').value;
    const filtered = inventory.filter(i => {
        const status = getStatus(i.stock, i.reorder);
        return (!q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)) && (!cat || i.cat === cat) && (!st || status === st);
    });
    document.getElementById('invBody').innerHTML = filtered.length ? filtered.map(i => {
        const st = getStatus(i.stock, i.reorder);
        const pct = barPct(i.stock, i.reorder);
        return `<tr>
            <td>${i.id}</td>
            <td><strong>${i.name}</strong>${i.notes ? `<br><span style="color:#888;font-size:.78rem">${i.notes}</span>` : ''}</td>
            <td style="font-size:.82rem">${i.cat}</td>
            <td>
                <strong>${i.stock}</strong> <span style="color:#888;font-size:.8rem">${i.unit}s</span>
                <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%;background:${barColor(st)}"></div></div>
            </td>
            <td>${i.reorder}</td>
            <td>$${i.price.toFixed(2)}</td>
            <td style="font-size:.82rem">${i.supplier}</td>
            <td><span class="status-badge ${statusClass(st)}">${statusLabel(st)}</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-edit btn-sm" onclick="openEdit(${i.id})"><i class="fas fa-edit"></i> Edit</button>
                ${st !== 'good' ? `<button class="btn btn-reorder btn-sm" style="margin-left:.3rem" onclick="openReorder(${i.id})"><i class="fas fa-truck"></i> Reorder</button>` : ''}
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#999">No products found</td></tr>`;
    document.getElementById('invInfo').textContent = `${filtered.length} product(s) found`;
    renderStats();
}

function openAdd() {
    editId = null;
    document.getElementById('invModalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Product';
    ['fIName', 'fSupplier', 'fINotes'].forEach(id => document.getElementById(id).value = '');
    ['fStock', 'fReorder', 'fIPrice'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('invModal').classList.add('open');
}

function openEdit(id) {
    editId = id;
    const i = inventory.find(x => x.id === id);
    document.getElementById('invModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('fIName').value = i.name;
    document.getElementById('fICat').value = i.cat;
    document.getElementById('fSupplier').value = i.supplier;
    document.getElementById('fStock').value = i.stock;
    document.getElementById('fReorder').value = i.reorder;
    document.getElementById('fIPrice').value = i.price;
    document.getElementById('fUnit').value = i.unit;
    document.getElementById('fINotes').value = i.notes;
    document.getElementById('invModal').classList.add('open');
}

function saveProduct() {
    const name = document.getElementById('fIName').value.trim();
    if (!name) {
        alert('Product name is required');
        return;
    }
    const data = {
        name,
        cat: document.getElementById('fICat').value,
        supplier: document.getElementById('fSupplier').value,
        stock: parseInt(document.getElementById('fStock').value) || 0,
        reorder: parseInt(document.getElementById('fReorder').value) || 0,
        price: parseFloat(document.getElementById('fIPrice').value) || 0,
        unit: document.getElementById('fUnit').value,
        notes: document.getElementById('fINotes').value
    };
    if (editId) {
        Object.assign(inventory.find(x => x.id === editId), data);
    } else {
        inventory.push({
            id: inventory.length + 1,
            ...data
        });
    }
    render();
    closeModal('invModal');
    showToast(editId ? 'Product updated!' : 'Product added!');
}

function openReorder(id) {
    reorderingId = id;
    const i = inventory.find(x => x.id === id);
    document.getElementById('reorderName').textContent = i.name;
    const del = new Date();
    del.setDate(del.getDate() + 7);
    document.getElementById('rDelivery').value = del.toISOString().split('T')[0];
    document.getElementById('rQty').value = i.reorder * 2;
    document.getElementById('reorderModal').classList.add('open');
}

function confirmReorder() {
    const i = inventory.find(x => x.id === reorderingId);
    const qty = parseInt(document.getElementById('rQty').value) || 0;
    i.stock += qty;
    render();
    closeModal('reorderModal');
    showToast(`Reorder of ${qty} units placed for ${i.name}!`);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.2);max-width:300px';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.onclick = e => {
    ['invModal', 'reorderModal'].forEach(id => {
        if (e.target.id === id) closeModal(id);
    });
};

render();