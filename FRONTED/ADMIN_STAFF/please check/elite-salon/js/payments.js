const payments = [{
        id: "INV-1001",
        date: "2026-01-29",
        customer: "Jessica Martinez",
        email: "jessica.m@email.com",
        phone: "555-123-4567",
        service: "Haircut",
        staff: "Michael Chen",
        amount: 65,
        tax: 6.5,
        method: "Card",
        status: "Paid",
        items: [{
            name: "Haircut",
            qty: 1,
            price: 65
        }]
    },
    {
        id: "INV-1002",
        date: "2026-01-29",
        customer: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "235-723-5422",
        service: "Hair Coloring",
        staff: "Sarah Johnson",
        amount: 125,
        tax: 12.5,
        method: "UPI",
        status: "Paid",
        items: [{
            name: "Hair Coloring",
            qty: 1,
            price: 105
        }, {
            name: "Treatment Add-on",
            qty: 1,
            price: 20
        }]
    },
    {
        id: "INV-1003",
        date: "2026-01-29",
        customer: "Sarah Williams",
        email: "sarah.w@email.com",
        phone: "734-653-7874",
        service: "Manicure",
        staff: "Emily Rodriguez",
        amount: 45,
        tax: 4.5,
        method: "Cash",
        status: "Pending",
        items: [{
            name: "Manicure",
            qty: 1,
            price: 45
        }]
    },
    {
        id: "INV-1004",
        date: "2026-01-30",
        customer: "Robert Brown",
        email: "robert.b@email.com",
        phone: "491-628-4721",
        service: "Beard Trim",
        staff: "Michael Chen",
        amount: 30,
        tax: 3,
        method: "Card",
        status: "Paid",
        items: [{
            name: "Beard Trim",
            qty: 1,
            price: 30
        }]
    },
    {
        id: "INV-1005",
        date: "2026-01-30",
        customer: "Amanda Davis",
        email: "amanda.d@email.com",
        phone: "213-651-7377",
        service: "Full Package",
        staff: "Sarah Johnson",
        amount: 220,
        tax: 22,
        method: "Net Banking",
        status: "Refunded",
        items: [{
            name: "Full Package",
            qty: 1,
            price: 220
        }]
    },
    {
        id: "INV-1006",
        date: "2026-02-05",
        customer: "Rohit Sharma",
        email: "rohit@email.com",
        phone: "987-654-3210",
        service: "Haircut",
        staff: "Michael Chen",
        amount: 65,
        tax: 6.5,
        method: "UPI",
        status: "Paid",
        items: [{
            name: "Signature Haircut",
            qty: 1,
            price: 65
        }]
    },
    {
        id: "INV-1007",
        date: "2026-02-07",
        customer: "Jessica Martinez",
        email: "jessica.m@email.com",
        phone: "555-123-4567",
        service: "Facial",
        staff: "Emily Rodriguez",
        amount: 85,
        tax: 8.5,
        method: "Card",
        status: "Paid",
        items: [{
            name: "Signature Facial",
            qty: 1,
            price: 75
        }, {
            name: "Eye Treatment",
            qty: 1,
            price: 10
        }]
    },
    {
        id: "INV-1008",
        date: "2026-02-10",
        customer: "Daniel Lee",
        email: "daniel.l@email.com",
        phone: "777-888-9999",
        service: "Haircut",
        staff: "Jessica Alba",
        amount: 65,
        tax: 6.5,
        method: "Cash",
        status: "Paid",
        items: [{
            name: "Haircut",
            qty: 1,
            price: 65
        }]
    },
    {
        id: "INV-1009",
        date: "2026-02-12",
        customer: "Kevin O'Brien",
        email: "kevin.o@email.com",
        phone: "444-333-2222",
        service: "Hair Coloring",
        staff: "Sarah Johnson",
        amount: 125,
        tax: 12.5,
        method: "Card",
        status: "Pending",
        items: [{
            name: "Hair Coloring",
            qty: 1,
            price: 125
        }]
    },
];

let filtered = [...payments];
let currentPage = 1;
const perPage = 6;

function renderStats() {
    const total = payments.reduce((s, p) => s + (p.status === 'Paid' ? p.amount : 0), 0);
    const pending = payments.filter(p => p.status === 'Pending').length;
    const paid = payments.filter(p => p.status === 'Paid').length;
    const refunded = payments.filter(p => p.status === 'Refunded').length;
    
    const statsRow = document.getElementById('statsRow');
    if (!statsRow) return;
    
    statsRow.innerHTML = `
        <div class="stat-card">
            <div class="val">$${total.toLocaleString()}</div>
            <div class="lbl">Total Collected</div>
        </div>
        <div class="stat-card">
            <div class="val">${paid}</div>
            <div class="lbl">Paid Invoices</div>
        </div>
        <div class="stat-card">
            <div class="val">${pending}</div>
            <div class="lbl">Pending Payments</div>
        </div>
        <div class="stat-card">
            <div class="val">${payments.length}</div>
            <div class="lbl">Total Invoices</div>
        </div>
    `;
}

function render() {
    const q = document.getElementById('pSearch')?.value.toLowerCase() || '';
    const st = document.getElementById('pStatus')?.value || '';
    const mt = document.getElementById('pMethod')?.value || '';
    const df = document.getElementById('pFrom')?.value || '';
    const dt = document.getElementById('pTo')?.value || '';
    
    filtered = payments.filter(p => {
        const matchSearch = !q || 
            p.customer.toLowerCase().includes(q) || 
            p.service.toLowerCase().includes(q) || 
            p.id.toLowerCase().includes(q);
        const matchStatus = !st || p.status === st;
        const matchMethod = !mt || p.method === mt;
        const matchDateFrom = !df || p.date >= df;
        const matchDateTo = !dt || p.date <= dt;
        
        return matchSearch && matchStatus && matchMethod && matchDateFrom && matchDateTo;
    });
    
    currentPage = 1;
    renderTable();
}

function renderTable() {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const page = filtered.slice(start, end);
    const tbody = document.getElementById('payBody');
    
    if (!tbody) return;
    
    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#999">No payments found</td></tr>`;
        document.getElementById('payInfo').textContent = `Showing 0 of 0 payments`;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    tbody.innerHTML = page.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.date}</td>
            <td>
                <strong>${p.customer}</strong><br>
                <span style="color:#888;font-size:.78rem">${p.phone}</span>
            </td>
            <td>${p.service}</td>
            <td style="font-size:.85rem">${p.staff}</td>
            <td><strong>$${p.amount.toFixed(2)}</strong></td>
            <td><span class="method-badge">${p.method}</span></td>
            <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
            <td>
                <button class="btn btn-view btn-sm" onclick="viewInvoice('${p.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('payInfo').textContent = 
        `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} payments`;
    
    renderPagination();
}

function renderPagination() {
    const total = Math.ceil(filtered.length / perPage);
    const p = document.getElementById('pagination');
    
    if (!p) return;
    
    if (total <= 1) {
        p.innerHTML = '';
        return;
    }
    
    let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    
    for (let i = 1; i <= total; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    }
    
    html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === total ? 'disabled' : ''}>›</button>`;
    
    p.innerHTML = html;
}

function goPage(p) {
    const total = Math.ceil(filtered.length / perPage);
    if (p < 1 || p > total) return;
    currentPage = p;
    renderTable();
}

function viewInvoice(id) {
    const p = payments.find(x => x.id === id);
    if (!p) return;
    
    const sub = p.amount;
    const tax = p.tax || 0;
    const total = sub + tax;
    
    const content = document.getElementById('invContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-brand">✂️ Elite Salon</div>
            <p style="color:#666;font-size:.85rem;margin-top:.25rem">
                123 Beauty Avenue, Suite 100 • (555) 123-4567 • info@elitesalon.com
            </p>
        </div>
        
        <div class="invoice-meta">
            <div class="meta-block">
                <h4>Bill To</h4>
                <p><strong>${p.customer}</strong><br>${p.email}<br>${p.phone}</p>
            </div>
            <div class="meta-block">
                <h4>Invoice Info</h4>
                <p>
                    <strong>${p.id}</strong><br>
                    Date: ${p.date}<br>
                    Staff: ${p.staff}<br>
                    Method: <span class="method-badge">${p.method}</span>
                </p>
            </div>
        </div>
        
        <table class="invoice-tbl">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${p.items.map(i => `
                    <tr>
                        <td>${i.name}</td>
                        <td>${i.qty}</td>
                        <td>$${i.price.toFixed(2)}</td>
                        <td>$${(i.price * i.qty).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="invoice-totals">
            <div class="tot-row">
                <span>Subtotal</span>
                <span>$${sub.toFixed(2)}</span>
            </div>
            <div class="tot-row">
                <span>Tax (10%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="tot-final">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <p style="text-align:center;margin-top:1.5rem;color:#888;font-size:.85rem">
            Status: <span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span> 
            • Thank you for visiting Elite Salon! 💜
        </p>
    `;
    
    document.getElementById('invModal').classList.add('open');
}

function closeModal() {
    document.getElementById('invModal').classList.remove('open');
}

function printInv() {
    const content = document.getElementById('invContent').innerHTML;
    const w = window.open('', '_blank');
    
    w.document.write(`
        <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: .75rem; border-bottom: 1px solid #eee; text-align: left; }
                    .method-badge, .status-badge { 
                        padding: .2rem .5rem; 
                        border-radius: 8px; 
                        font-size: .8rem; 
                    }
                    .invoice-header { text-align: center; margin-bottom: 2rem; }
                    .invoice-brand { font-size: 1.8rem; font-weight: 800; }
                    .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .meta-block { background: #f9f5ff; padding: 1rem; border-radius: 10px; }
                    .invoice-totals { background: #f9f5ff; padding: 1.5rem; border-radius: 12px; }
                    .tot-row { display: flex; justify-content: space-between; }
                    .tot-final { font-size: 1.2rem; font-weight: 700; color: #7c3aed; }
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `);
    
    w.document.close();
    w.print();
}

// Close modal when clicking outside
window.onclick = function(e) {
    const modal = document.getElementById('invModal');
    if (e.target === modal) {
        closeModal();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderStats();
    render();
});