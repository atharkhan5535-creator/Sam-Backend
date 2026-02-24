let staffList = [{
        id: 1,
        name: "Sarah Johnson",
        role: "Master Stylist",
        email: "sarah.j@elitesalon.com",
        phone: "(555) 234-5678",
        gender: "Female",
        dob: "1988-03-15",
        exp: 8,
        salary: 55000,
        avail: "Available",
        empType: "Full-time",
        joining: "2018-06-01",
        emergency: "555-999-0001",
        address: "45 Bloom St, NY",
        status: "Active",
        incentives: [{
            id: 1,
            type: "Commission",
            amount: 2500,
            remark: "February bookings target",
            date: "2026-02-05"
        }],
        payouts: [{
            id: 1,
            date: "2026-02-15",
            amount: 1200,
            mode: "UPI",
            related: "February bookings target"
        }]
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Senior Stylist",
        email: "michael.c@elitesalon.com",
        phone: "(555) 345-6789",
        gender: "Male",
        dob: "1990-07-22",
        exp: 6,
        salary: 48000,
        avail: "Available",
        empType: "Full-time",
        joining: "2019-03-15",
        emergency: "555-999-0002",
        address: "12 Park Ave, NY",
        status: "Active",
        incentives: [{
            id: 1,
            type: "Bonus",
            amount: 1500,
            remark: "Top performer Jan",
            date: "2026-01-31"
        }],
        payouts: []
    },
    {
        id: 3,
        name: "Emily Rodriguez",
        role: "Colorist",
        email: "emily.r@elitesalon.com",
        phone: "(555) 456-7890",
        gender: "Female",
        dob: "1992-11-05",
        exp: 5,
        salary: 45000,
        avail: "On Leave",
        empType: "Full-time",
        joining: "2020-08-10",
        emergency: "555-999-0003",
        address: "88 Oak Lane, NY",
        status: "Active",
        incentives: [],
        payouts: []
    },
    {
        id: 4,
        name: "Jessica Alba",
        role: "Nail Technician",
        email: "jessica.a@elitesalon.com",
        phone: "(555) 567-8901",
        gender: "Female",
        dob: "1995-02-28",
        exp: 3,
        salary: 38000,
        avail: "Available",
        empType: "Part-time",
        joining: "2022-01-20",
        emergency: "555-999-0004",
        address: "33 Maple Rd, NY",
        status: "Active",
        incentives: [],
        payouts: []
    },
    {
        id: 5,
        name: "John Departed",
        role: "Stylist",
        email: "john.d@elitesalon.com",
        phone: "(555) 678-9012",
        gender: "Male",
        dob: "1985-06-10",
        exp: 4,
        salary: 40000,
        avail: "Unavailable",
        empType: "Full-time",
        joining: "2019-05-15",
        emergency: "555-000-0000",
        address: "22 Elm St, NY",
        status: "Terminated",
        terminationDate: "2026-01-15",
        terminationReason: "Resigned for personal reasons",
        incentives: [],
        payouts: []
    },
];

let currentStaffId = null;
let deactivatingId = null;

function getInitials(n) {
    if (!n) return '??';
    return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
}

function renderActive() {
    const active = staffList.filter(s => s.status === 'Active');
    const tbody = document.getElementById('activeTableBody');
    
    if (!active.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">No active staff</td></tr>`;
        return;
    }
    
    tbody.innerHTML = active.map(s => `
        <tr>
            <td>
                <div class="staff-cell">
                    <div class="avatar">${getInitials(s.name)}</div>
                    <div><strong>${s.name}</strong></div>
                </div>
            </td>
            <td>${s.role}</td>
            <td style="font-size:.82rem">${s.email}</td>
            <td>${s.phone}</td>
            <td>${s.exp} yrs</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-view btn-sm" onclick="viewStaffDetail(${s.id})"><i class="fas fa-eye"></i> View</button>
                <button class="btn btn-danger btn-sm" style="margin-left:.3rem" onclick="openDeactivate(${s.id})"><i class="fas fa-user-slash"></i> Deactivate</button>
            </td>
        </tr>
    `).join('');
}

function renderInactive() {
    const inactive = staffList.filter(s => s.status !== 'Active');
    const tbody = document.getElementById('inactiveTableBody');
    
    if (!inactive.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">No terminated staff</td></tr>`;
        return;
    }
    
    tbody.innerHTML = inactive.map(s => `
        <tr>
            <td>
                <div class="staff-cell">
                    <div class="avatar" style="background:#6b7280">${getInitials(s.name)}</div>
                    <div class="strikethrough"><strong>${s.name}</strong></div>
                </div>
            </td>
            <td class="strikethrough">${s.role}</td>
            <td class="strikethrough" style="font-size:.82rem">${s.email}</td>
            <td class="strikethrough">${s.phone}</td>
            <td><span class="status-badge status-terminated">Terminated</span></td>
            <td>${s.terminationDate || '—'}</td>
            <td style="font-size:.82rem;color:#888">${s.terminationReason || '—'}</td>
        </tr>
    `).join('');
}

function switchTab(name, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById(name + '-tab').classList.add('active');
}

function viewStaffDetail(id) {
    const s = staffList.find(x => x.id === id);
    if (!s) return;
    
    currentStaffId = id;
    
    document.getElementById('staffDetailTitle').innerHTML = `<i class="fas fa-user"></i> Staff Details`;
    document.getElementById('sdAvatar').textContent = getInitials(s.name);
    document.getElementById('sdName').textContent = s.name;
    document.getElementById('sdRole').textContent = s.role;
    document.getElementById('sdContact').textContent = s.email + ' • ' + s.phone;
    
    const infoGrid = document.getElementById('sdInfoGrid');
    infoGrid.innerHTML = [
        ['Gender', s.gender],
        ['Date of Birth', s.dob],
        ['Experience', s.exp + ' years'],
        ['Salary', '$' + s.salary.toLocaleString()],
        ['Employment', s.empType],
        ['Availability', s.avail],
        ['Joining Date', s.joining],
        ['Emergency', s.emergency]
    ].map(([l, v]) => `
        <div class="info-item">
            <label>${l}</label>
            <span>${v}</span>
        </div>
    `).join('');
    
    renderIncentiveTable(id);
    renderPayoutTable(id);
    
    // Reset tabs
    document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.detail-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector('.detail-tab').classList.add('active');
    document.getElementById('incentives-detail').classList.add('active');
    
    document.getElementById('staffDetailModal').classList.add('open');
}

function renderIncentiveTable(id) {
    const s = staffList.find(x => x.id === id);
    const tbody = document.getElementById('incentiveTableBody');
    
    if (!s.incentives.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-gift"></i>No incentives yet</td></tr>`;
        return;
    }
    
    tbody.innerHTML = s.incentives.map((inc, i) => `
        <tr>
            <td>${inc.type}</td>
            <td><strong>$${inc.amount}</strong></td>
            <td>${inc.remark}</td>
            <td>${inc.date}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteIncentive(${id},${i})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPayoutTable(id) {
    const s = staffList.find(x => x.id === id);
    const tbody = document.getElementById('payoutTableBody');
    
    if (!s.payouts.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-money-bill-wave"></i>No payouts yet</td></tr>`;
        return;
    }
    
    tbody.innerHTML = s.payouts.map((p, i) => `
        <tr>
            <td>${p.date}</td>
            <td><strong>$${p.amount}</strong></td>
            <td>${p.mode}</td>
            <td>${p.related}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deletePayout(${id},${i})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function switchDetailTab(name, el) {
    document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.detail-tab-content').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById(name + '-detail').classList.add('active');
}

function openAddStaff() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sJoining').value = today;
    document.getElementById('addStaffModal').classList.add('open');
}

function saveStaff() {
    const name = document.getElementById('sName').value.trim();
    if (!name) {
        alert('Staff name is required');
        return;
    }
    
    const role = document.getElementById('sRole').value.trim();
    if (!role) {
        alert('Role is required');
        return;
    }
    
    const phone = document.getElementById('sPhone').value.trim();
    if (!phone) {
        alert('Phone is required');
        return;
    }
    
    const email = document.getElementById('sEmail').value.trim();
    if (!email) {
        alert('Email is required');
        return;
    }
    
    const newStaff = {
        id: staffList.length + 1,
        name: name,
        role: role,
        phone: phone,
        email: email,
        gender: document.getElementById('sGender').value,
        dob: document.getElementById('sDob').value,
        exp: parseInt(document.getElementById('sExp').value) || 0,
        salary: parseInt(document.getElementById('sSalary').value) || 0,
        avail: document.getElementById('sAvail').value,
        empType: document.getElementById('sEmpType').value,
        joining: document.getElementById('sJoining').value,
        emergency: document.getElementById('sEmergency').value,
        address: document.getElementById('sAddress').value,
        status: 'Active',
        incentives: [],
        payouts: []
    };
    
    staffList.push(newStaff);
    renderActive();
    closeModal('addStaffModal');
    showToast('Staff member added successfully!');
    
    // Clear form
    ['sName', 'sRole', 'sPhone', 'sEmail', 'sDob', 'sExp', 'sSalary', 'sJoining', 'sEmergency', 'sAddress'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function openDeactivate(id) {
    deactivatingId = id;
    const s = staffList.find(x => x.id === id);
    document.getElementById('deactivateName').textContent = s.name;
    document.getElementById('deactivateModal').classList.add('open');
}

function confirmDeactivate() {
    const s = staffList.find(x => x.id === deactivatingId);
    s.status = 'Terminated';
    s.terminationDate = new Date().toISOString().split('T')[0];
    s.terminationReason = document.getElementById('deactivateReason').value || 'Deactivated by admin';
    
    renderActive();
    renderInactive();
    closeModal('deactivateModal');
    document.getElementById('deactivateReason').value = '';
    showToast(s.name + ' has been deactivated.');
}

function openAddIncentive() {
    document.getElementById('iDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('addIncentiveModal').classList.add('open');
}

function saveIncentive() {
    const amount = document.getElementById('iAmount').value;
    if (!amount) {
        alert('Amount is required');
        return;
    }
    
    const s = staffList.find(x => x.id === currentStaffId);
    s.incentives.push({
        id: s.incentives.length + 1,
        type: document.getElementById('iType').value,
        amount: parseFloat(amount),
        remark: document.getElementById('iRemark').value,
        date: document.getElementById('iDate').value
    });
    
    renderIncentiveTable(currentStaffId);
    closeModal('addIncentiveModal');
    showToast('Incentive added!');
}

function deleteIncentive(staffId, idx) {
    if (confirm('Delete this incentive?')) {
        staffList.find(x => x.id === staffId).incentives.splice(idx, 1);
        renderIncentiveTable(staffId);
    }
}

function openAddPayout() {
    document.getElementById('pDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('addPayoutModal').classList.add('open');
}

function savePayout() {
    const amount = document.getElementById('pAmount').value;
    if (!amount) {
        alert('Amount is required');
        return;
    }
    
    const s = staffList.find(x => x.id === currentStaffId);
    s.payouts.push({
        id: s.payouts.length + 1,
        date: document.getElementById('pDate').value,
        amount: parseFloat(amount),
        mode: document.getElementById('pMode').value,
        related: document.getElementById('pRelated').value
    });
    
    renderPayoutTable(currentStaffId);
    closeModal('addPayoutModal');
    showToast('Payout recorded!');
}

function deletePayout(staffId, idx) {
    if (confirm('Delete this payout?')) {
        staffList.find(x => x.id === staffId).payouts.splice(idx, 1);
        renderPayoutTable(staffId);
    }
}

function openEditStaff() {
    closeModal('staffDetailModal');
    
    const s = staffList.find(x => x.id === currentStaffId);
    document.getElementById('sName').value = s.name;
    document.getElementById('sRole').value = s.role;
    document.getElementById('sPhone').value = s.phone;
    document.getElementById('sEmail').value = s.email;
    document.getElementById('sGender').value = s.gender;
    document.getElementById('sDob').value = s.dob;
    document.getElementById('sExp').value = s.exp;
    document.getElementById('sSalary').value = s.salary;
    document.getElementById('sAvail').value = s.avail;
    document.getElementById('sEmpType').value = s.empType;
    document.getElementById('sJoining').value = s.joining;
    document.getElementById('sEmergency').value = s.emergency;
    document.getElementById('sAddress').value = s.address;
    
    document.getElementById('addStaffModal').classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,.2);z-index:9999;animation:slideUp .3s ease;max-width:300px';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Close modals when clicking outside
window.onclick = function(e) {
    ['addStaffModal', 'staffDetailModal', 'deactivateModal', 'addIncentiveModal', 'addPayoutModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (e.target === modal) {
            closeModal(id);
        }
    });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderActive();
    renderInactive();
});