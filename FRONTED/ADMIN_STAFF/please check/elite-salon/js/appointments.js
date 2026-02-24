let appointments = [{
        id: 1,
        customer: "Rohit Sharma",
        phone: "9876543210",
        service: "Haircut",
        staff: "Michael Chen",
        date: "2026-02-05",
        time: "9:00 PM",
        amount: "$65",
        status: "Confirmed",
        notes: "Regular cut, keep it short",
        created: "Feb 5, 8:00 PM"
    },
    {
        id: 2,
        customer: "Michael Chen",
        phone: "2357235422",
        service: "Hair Coloring",
        staff: "Sarah Johnson",
        date: "2026-01-29",
        time: "11:30 AM",
        amount: "$125",
        status: "Confirmed",
        notes: "Highlight treatment",
        created: "Jan 29, 11:00 AM"
    },
    {
        id: 3,
        customer: "Sarah Williams",
        phone: "7346537874",
        service: "Manicure",
        staff: "Emily Rodriguez",
        date: "2026-01-29",
        time: "2:00 PM",
        amount: "$45",
        status: "Pending",
        notes: "",
        created: "Jan 29, 1:00 PM"
    },
    {
        id: 4,
        customer: "Robert Brown",
        phone: "4916284721",
        service: "Beard Trim",
        staff: "Michael Chen",
        date: "2026-01-30",
        time: "9:00 AM",
        amount: "$30",
        status: "Confirmed",
        notes: "Shape and clean",
        created: "Jan 30, 8:00 AM"
    },
    {
        id: 5,
        customer: "Amanda Davis",
        phone: "2136517377",
        service: "Full Package",
        staff: "Sarah Johnson",
        date: "2026-01-30",
        time: "1:00 PM",
        amount: "$220",
        status: "Cancelled",
        notes: "Cancelled due to schedule conflict",
        created: "Jan 30, 12:00 PM"
    },
    {
        id: 6,
        customer: "Jessica Martinez",
        phone: "5551234567",
        service: "Facial",
        staff: "Emily Rodriguez",
        date: "2026-02-07",
        time: "3:00 PM",
        amount: "$85",
        status: "Completed",
        notes: "Deep cleanse treatment",
        created: "Feb 6, 2:00 PM"
    },
    {
        id: 7,
        customer: "Daniel Lee",
        phone: "7778889999",
        service: "Haircut",
        staff: "Jessica Alba",
        date: "2026-02-10",
        time: "10:00 AM",
        amount: "$65",
        status: "Confirmed",
        notes: "",
        created: "Feb 9, 9:00 AM"
    },
    {
        id: 8,
        customer: "Priya Singh",
        phone: "9988776655",
        service: "Pedicure",
        staff: "Emily Rodriguez",
        date: "2026-02-11",
        time: "2:30 PM",
        amount: "$45",
        status: "Pending",
        notes: "First visit",
        created: "Feb 10, 8:00 PM"
    },
    {
        id: 9,
        customer: "Kevin O'Brien",
        phone: "4443332222",
        service: "Hair Coloring",
        staff: "Sarah Johnson",
        date: "2026-02-12",
        time: "11:00 AM",
        amount: "$125",
        status: "Confirmed",
        notes: "Gray coverage",
        created: "Feb 11, 3:00 PM"
    },
    {
        id: 10,
        customer: "Lily Chen",
        phone: "1112223333",
        service: "Manicure",
        staff: "Jessica Alba",
        date: "2026-02-13",
        time: "4:00 PM",
        amount: "$45",
        status: "Pending",
        notes: "Gel nails",
        created: "Feb 12, 10:00 AM"
    },
];

let filtered = [...appointments];
let currentPage = 1;
const perPage = 5;
let editingId = null;

function renderTable() {
    const start = (currentPage - 1) * perPage,
        end = start + perPage;
    const page = filtered.slice(start, end);
    const tbody = document.getElementById('apptTableBody');
    if (!page.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#999"><i class="fas fa-calendar-xmark" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>No appointments found</td></tr>`;
    } else {
        tbody.innerHTML = page.map(a => `
            <tr>
                <td><strong>#${a.id}</strong></td>
                <td><strong>${a.customer}</strong><br><span style="color:#888;font-size:.8rem">${a.phone}</span></td>
                <td>${a.date}<br><span style="color:#888;font-size:.8rem">${a.time}</span></td>
                <td>${a.service}</td>
                <td>${a.staff}</td>
                <td><strong>${a.amount}</strong></td>
                <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
                <td><button class="btn btn-view" onclick="viewDetail(${a.id})"><i class="fas fa-eye"></i> View</button></td>
            </tr>`).join('');
    }
    document.getElementById('resultsInfo').textContent = `Showing ${Math.min(start + 1, filtered.length)}–${Math.min(end, filtered.length)} of ${filtered.length} appointments`;
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
    const st = document.getElementById('fStatus').value.toLowerCase();
    const sv = document.getElementById('fService').value.toLowerCase();
    const df = document.getElementById('fDateFrom').value;
    const dt = document.getElementById('fDateTo').value;
    const sf = document.getElementById('fStaff').value.toLowerCase();
    filtered = appointments.filter(a => {
        const match = !q || a.customer.toLowerCase().includes(q) || a.service.toLowerCase().includes(q) || String(a.id).includes(q) || a.staff.toLowerCase().includes(q);
        const matchSt = !st || a.status.toLowerCase() === st;
        const matchSv = !sv || a.service.toLowerCase().includes(sv);
        const matchDf = !df || a.date >= df;
        const matchDt = !dt || a.date <= dt;
        const matchSf = !sf || a.staff.toLowerCase().includes(sf);
        return match && matchSt && matchSv && matchDf && matchDt && matchSf;
    });
    currentPage = 1;
    renderTable();
}

function toggleFilters() {
    document.getElementById('filterBar').classList.toggle('open');
}

function clearAll() {
    document.getElementById('searchInput').value = '';
    ['fStatus', 'fService', 'fStaff'].forEach(id => document.getElementById(id).value = '');
    ['fDateFrom', 'fDateTo'].forEach(id => document.getElementById(id).value = '');
    filtered = [...appointments];
    currentPage = 1;
    renderTable();
    document.getElementById('filterBar').classList.remove('open');
}

function viewDetail(id) {
    const a = appointments.find(x => x.id === id);
    editingId = id;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-item"><label>Appointment ID</label><span>#${a.id}</span></div>
        <div class="detail-item"><label>Status</label><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></div>
        <div class="detail-item"><label>Customer</label><span>${a.customer}</span></div>
        <div class="detail-item"><label>Phone</label><span>${a.phone}</span></div>
        <div class="detail-item"><label>Service</label><span>${a.service}</span></div>
        <div class="detail-item"><label>Staff</label><span>${a.staff}</span></div>
        <div class="detail-item"><label>Date</label><span>${a.date}</span></div>
        <div class="detail-item"><label>Time</label><span>${a.time}</span></div>
        <div class="detail-item"><label>Amount</label><span style="font-size:1.1rem;color:#7c3aed;font-weight:700">${a.amount}</span></div>
        <div class="detail-item"><label>Booked At</label><span>${a.created}</span></div>
        ${a.notes ? `<div class="detail-item full"><label>Notes</label><span>${a.notes}</span></div>` : ''}
    `;
    document.getElementById('btnConfirm').style.display = a.status === 'Pending' ? 'flex' : 'none';
    document.getElementById('detailModal').classList.add('open');
}

function updateStatus(status) {
    if (editingId) {
        const a = appointments.find(x => x.id === editingId);
        a.status = status;
        filterTable();
        closeModal('detailModal');
        showToast(`Appointment ${status.toLowerCase()} successfully!`);
    }
}

function openNewAppt() {
    document.getElementById('newApptModal').classList.add('open');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newDate').value = today;
}

function saveNewAppt() {
    const customer = document.getElementById('newCustomer').value.trim();
    if (!customer) {
        alert('Please enter customer name');
        return;
    }
    const newAppt = {
        id: appointments.length + 1,
        customer: customer,
        phone: document.getElementById('newPhone').value,
        service: document.getElementById('newService').value,
        staff: document.getElementById('newStaff').value,
        date: document.getElementById('newDate').value,
        time: document.getElementById('newTime').value,
        amount: '$65',
        status: 'Pending',
        notes: document.getElementById('newNotes').value,
        created: new Date().toLocaleString()
    };
    appointments.unshift(newAppt);
    filtered = [...appointments];
    closeModal('newApptModal');
    renderTable();
    showToast('Appointment created successfully!');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,.2);z-index:9999;animation:slideUp .3s ease';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.onclick = e => {
    ['detailModal', 'newApptModal'].forEach(id => {
        if (e.target.id === id) closeModal(id);
    });
};

renderTable();