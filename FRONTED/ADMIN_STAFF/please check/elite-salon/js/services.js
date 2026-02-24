let services = [{
        id: 1,
        name: "Signature Haircut",
        cat: "Hair Services",
        duration: 60,
        price: 65,
        status: "Active",
        desc: "Premium haircut with consultation"
    },
    {
        id: 2,
        name: "Full Color Treatment",
        cat: "Color Services",
        duration: 120,
        price: 125,
        status: "Active",
        desc: "Complete hair coloring service"
    },
    {
        id: 3,
        name: "Deluxe Manicure",
        cat: "Nail Services",
        duration: 45,
        price: 45,
        status: "Active",
        desc: "Premium manicure with gel finish"
    },
    {
        id: 4,
        name: "Deluxe Pedicure",
        cat: "Nail Services",
        duration: 45,
        price: 45,
        status: "Active",
        desc: "Relaxing pedicure treatment"
    },
    {
        id: 5,
        name: "Relaxation Massage",
        cat: "Massage",
        duration: 60,
        price: 95,
        status: "Active",
        desc: "Full body relaxation massage"
    },
    {
        id: 6,
        name: "Signature Facial",
        cat: "Skin Care",
        duration: 75,
        price: 85,
        status: "Active",
        desc: "Deep cleansing facial treatment"
    },
    {
        id: 7,
        name: "Beard Trim",
        cat: "Hair Services",
        duration: 30,
        price: 30,
        status: "Active",
        desc: "Professional beard shaping"
    },
    {
        id: 8,
        name: "Keratin Treatment",
        cat: "Hair Services",
        duration: 180,
        price: 200,
        status: "Inactive",
        desc: "Smoothing keratin treatment"
    },
];

let editId = null;

function render() {
    const q = document.getElementById('sSearch').value.toLowerCase();
    const cat = document.getElementById('sCat').value;
    const st = document.getElementById('sStatus').value;
    const filtered = services.filter(s => (!q || (s.name.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q))) && (!cat || s.cat === cat) && (!st || s.status === st));
    document.getElementById('svcBody').innerHTML = filtered.length ? filtered.map(s => `
        <tr>
            <td>${s.id}</td>
            <td><strong>${s.name}</strong>${s.desc ? `<br><span style="color:#888;font-size:.78rem">${s.desc}</span>` : ''}</td>
            <td><span class="cat-badge">${s.cat}</span></td>
            <td>${s.duration} min</td>
            <td><strong>$${s.price}</strong></td>
            <td><span class="status-badge status-${s.status.toLowerCase()}">${s.status}</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-edit btn-sm" onclick="openEdit(${s.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm" style="margin-left:.3rem" onclick="toggleStatus(${s.id})">${s.status === 'Active' ? 'Disable' : 'Enable'}</button>
            </td>
        </tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">No services found</td></tr>`;
    document.getElementById('svcInfo').textContent = `${filtered.length} service(s) found`;
}

function openAdd() {
    editId = null;
    document.getElementById('svcModalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Service';
    ['fName', 'fDesc'].forEach(id => document.getElementById(id).value = '');
    ['fDuration', 'fPrice'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fStatus').value = 'Active';
    document.getElementById('svcModal').classList.add('open');
}

function openEdit(id) {
    editId = id;
    const s = services.find(x => x.id === id);
    document.getElementById('svcModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Service';
    document.getElementById('fName').value = s.name;
    document.getElementById('fCat').value = s.cat;
    document.getElementById('fDuration').value = s.duration;
    document.getElementById('fPrice').value = s.price;
    document.getElementById('fStatus').value = s.status;
    document.getElementById('fDesc').value = s.desc;
    document.getElementById('svcModal').classList.add('open');
}

function saveService() {
    const name = document.getElementById('fName').value.trim();
    if (!name) {
        alert('Name required');
        return;
    }
    const data = {
        name,
        cat: document.getElementById('fCat').value,
        duration: parseInt(document.getElementById('fDuration').value) || 60,
        price: parseFloat(document.getElementById('fPrice').value) || 0,
        status: document.getElementById('fStatus').value,
        desc: document.getElementById('fDesc').value
    };
    if (editId) {
        Object.assign(services.find(x => x.id === editId), data);
    } else {
        services.push({
            id: services.length + 1,
            ...data
        });
    }
    render();
    closeModal();
    showToast(editId ? 'Service updated!' : 'Service added!');
}

function toggleStatus(id) {
    const s = services.find(x => x.id === id);
    s.status = s.status === 'Active' ? 'Inactive' : 'Active';
    render();
    showToast('Status updated!');
}

function closeModal() {
    document.getElementById('svcModal').classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.2)';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.onclick = e => {
    if (e.target.id === 'svcModal') closeModal();
};

render();