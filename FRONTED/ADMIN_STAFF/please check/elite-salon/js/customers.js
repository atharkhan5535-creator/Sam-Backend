const customers = [{
        id: 1,
        name: "Jessica Martinez",
        phone: "5551234567",
        email: "jessica.m@email.com",
        gender: "Female",
        dob: "1990-09-12",
        anniversary: "2022-02-14",
        totalVisits: 12,
        totalSpent: "$780",
        lastVisit: "Jan 29, 2026"
    },
    {
        id: 2,
        name: "Michael Chen",
        phone: "2357235422",
        email: "michael.chen@email.com",
        gender: "Male",
        dob: "1985-02-12",
        anniversary: "2023-05-18",
        totalVisits: 7,
        totalSpent: "$455",
        lastVisit: "Jan 29, 2026"
    },
    {
        id: 3,
        name: "Sarah Williams",
        phone: "7346537874",
        email: "sarah.w@email.com",
        gender: "Female",
        dob: "1995-07-10",
        anniversary: "2022-10-23",
        totalVisits: 5,
        totalSpent: "$225",
        lastVisit: "Jan 29, 2026"
    },
    {
        id: 4,
        name: "Robert Brown",
        phone: "4916284721",
        email: "robert.b@email.com",
        gender: "Male",
        dob: "1988-09-17",
        anniversary: "2025-01-23",
        totalVisits: 9,
        totalSpent: "$270",
        lastVisit: "Jan 30, 2026"
    },
    {
        id: 5,
        name: "Amanda Davis",
        phone: "2136517377",
        email: "amanda.d@email.com",
        gender: "Female",
        dob: "1999-10-10",
        anniversary: "2002-03-19",
        totalVisits: 3,
        totalSpent: "$220",
        lastVisit: "Jan 30, 2026"
    },
    {
        id: 6,
        name: "Daniel Lee",
        phone: "7778889999",
        email: "daniel.l@email.com",
        gender: "Male",
        dob: "1992-04-05",
        anniversary: "2020-08-12",
        totalVisits: 15,
        totalSpent: "$975",
        lastVisit: "Feb 10, 2026"
    },
    {
        id: 7,
        name: "Priya Singh",
        phone: "9988776655",
        email: "priya.s@email.com",
        gender: "Female",
        dob: "1997-03-22",
        anniversary: "2024-11-01",
        totalVisits: 2,
        totalSpent: "$90",
        lastVisit: "Feb 11, 2026"
    },
];

const invoiceData = {
    1: [{
        service: "Haircut",
        qty: 1,
        price: 65
    }, {
        service: "Hair Wash",
        qty: 1,
        price: 15
    }, {
        service: "Blowdry",
        qty: 1,
        price: 25
    }],
    2: [{
        service: "Hair Coloring",
        qty: 1,
        price: 125
    }, {
        service: "Treatment",
        qty: 1,
        price: 45
    }],
    3: [{
        service: "Manicure",
        qty: 1,
        price: 45
    }, {
        service: "Nail Art",
        qty: 1,
        price: 30
    }],
    4: [{
        service: "Beard Trim",
        qty: 2,
        price: 30
    }, {
        service: "Haircut",
        qty: 1,
        price: 65
    }],
    5: [{
        service: "Full Package",
        qty: 1,
        price: 220
    }],
    6: [{
        service: "Haircut",
        qty: 1,
        price: 65
    }, {
        service: "Beard Trim",
        qty: 1,
        price: 30
    }],
    7: [{
        service: "Pedicure",
        qty: 1,
        price: 45
    }, {
        service: "Manicure",
        qty: 1,
        price: 45
    }],
};

let filtered = [...customers];
let currentPage = 1;
const perPage = 5;

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function genderBadge(g) {
    return g === 'Female' ? `<span class="badge-female">♀ ${g}</span>` : `<span class="badge-male">♂ ${g}</span>`;
}

function renderTable() {
    const start = (currentPage - 1) * perPage,
        end = start + perPage,
        page = filtered.slice(start, end);
    const tbody = document.getElementById('custTableBody');
    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#999"><i class="fas fa-users" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>No customers found</td></tr>`;
    } else {
        tbody.innerHTML = page.map(c => `
            <tr>
                <td><strong>#${c.id}</strong></td>
                <td><div class="cust-cell"><div class="avatar">${getInitials(c.name)}</div><div><strong>${c.name}</strong><br><span style="color:#888;font-size:.78rem">${c.totalVisits} visits · ${c.totalSpent}</span></div></div></td>
                <td>${c.phone}</td>
                <td style="font-size:.82rem">${c.email}</td>
                <td>${genderBadge(c.gender)}</td>
                <td>${c.dob}</td>
                <td>${c.anniversary || '—'}</td>
                <td style="white-space:nowrap">
                    <button class="btn btn-view" style="margin-right:.3rem" onclick="viewDetail(${c.id})"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-invoice" onclick="viewInvoice(${c.id})"><i class="fas fa-file-invoice"></i> Invoice</button>
                </td>
            </tr>`).join('');
    }
    document.getElementById('resultsInfo').textContent = `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} customers`;
    renderPagination();
}

function renderPagination() {
    const total = Math.ceil(filtered.length / perPage);
    const p = document.getElementById('pagination');
    if (total <= 1) {
        p.innerHTML = '';
        return;
    }
    let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= total; i++) html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === total ? 'disabled' : ''}>›</button>`;
    p.innerHTML = html;
}

function goPage(p) {
    const total = Math.ceil(filtered.length / perPage);
    if (p < 1 || p > total) return;
    currentPage = p;
    renderTable();
}

function filterTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const g = document.getElementById('fGender').value;
    const ef = document.getElementById('fEmail').value.toLowerCase();
    filtered = customers.filter(c => {
        const match = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
        const matchG = !g || c.gender === g;
        const matchE = !ef || c.email.toLowerCase().includes(ef);
        return match && matchG && matchE;
    });
    currentPage = 1;
    renderTable();
}

function clearAll() {
    document.getElementById('searchInput').value = '';
    document.getElementById('fGender').value = '';
    document.getElementById('fEmail').value = '';
    filtered = [...customers];
    currentPage = 1;
    renderTable();
    document.getElementById('filterBar').classList.remove('open');
}

function viewInvoice(id) {
    const c = customers.find(x => x.id === id);
    const items = invoiceData[id] || [];
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    const invoiceNo = 'INV-' + (1000 + id);
    document.getElementById('invoiceContent').innerHTML = `
        <div class="invoice-header">
            <h1>✂️ Elite Salon</h1>
            <p style="color:#666;font-size:.9rem">123 Beauty Avenue, Suite 100 • (555) 123-4567</p>
            <p style="font-size:.85rem;color:#888;margin-top:.5rem">Invoice #${invoiceNo} • Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="invoice-meta">
            <div class="invoice-meta-block">
                <h4>Bill To</h4>
                <p><strong>${c.name}</strong><br>${c.email}<br>${c.phone}</p>
            </div>
            <div class="invoice-meta-block">
                <h4>Invoice Details</h4>
                <p>Invoice: <strong>#${invoiceNo}</strong><br>Date: ${new Date().toLocaleDateString()}<br>Status: <span class="status-paid">PAID</span></p>
            </div>
        </div>
        <table class="invoice-table">
            <thead><tr><th>Service</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>
                ${items.map(i => `<tr><td>${i.service}</td><td>${i.qty}</td><td>$${i.price.toFixed(2)}</td><td>$${(i.price * i.qty).toFixed(2)}</td></tr>`).join('')}
            </tbody>
        </table>
        <div class="invoice-total">
            <div class="total-line"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="total-line"><span>Tax (10%)</span><span>$${tax.toFixed(2)}</span></div>
            <div class="grand-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        </div>
        <p style="text-align:center;color:#888;font-size:.85rem;margin-top:1.5rem">Thank you for choosing Elite Salon! 💜</p>
    `;
    document.getElementById('invoiceModal').classList.add('open');
}

function viewDetail(id) {
    const c = customers.find(x => x.id === id);
    document.getElementById('detailContent').innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <div class="avatar" style="width:64px;height:64px;font-size:1.5rem;margin:0 auto 1rem">${getInitials(c.name)}</div>
            <h2 style="color:#333">${c.name}</h2>
            <span style="color:#7c3aed;font-size:.9rem">${c.totalVisits} visits · ${c.totalSpent} total spent</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            ${[
                ['Phone', c.phone],
                ['Email', c.email],
                ['Gender', c.gender],
                ['Date of Birth', c.dob],
                ['Anniversary', c.anniversary || '—']
            ].map(([l, v]) => `
                <div style="background:#f9f5ff;border-radius:10px;padding:1rem">
                    <div style="font-size:.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:.3rem">${l}</div>
                    <div style="font-size:.95rem;color:#333;font-weight:500">${v}</div>
                </div>`).join('')}
        </div>
    `;
    document.getElementById('detailModal').classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function printInvoice() {
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:2rem}table{width:100%;border-collapse:collapse}th,td{padding:.75rem;border-bottom:1px solid #eee;text-align:left}</style></head><body>' + document.getElementById('invoiceContent').innerHTML + '</body></html>');
    w.document.close();
    w.print();
}

window.onclick = e => {
    ['invoiceModal', 'detailModal'].forEach(id => {
        if (e.target.id === id) closeModal(id)
    });
};

renderTable();