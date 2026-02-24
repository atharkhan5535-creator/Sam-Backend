const allServices = [{
        id: 1,
        name: "Signature Haircut & Style",
        price: 65
    },
    {
        id: 2,
        name: "Full Color Treatment",
        price: 125
    },
    {
        id: 3,
        name: "Deluxe Manicure",
        price: 45
    },
    {
        id: 4,
        name: "Deluxe Pedicure",
        price: 45
    },
    {
        id: 5,
        name: "Relaxation Massage",
        price: 95
    },
    {
        id: 6,
        name: "Signature Facial",
        price: 85
    },
    {
        id: 7,
        name: "Beard Trim",
        price: 30
    },
    {
        id: 8,
        name: "Blowdry & Style",
        price: 40
    },
];

let packages = [{
        id: 1,
        name: "Bridal Bliss Package",
        cat: "Bridal & Special Events",
        services: [1, 2, 3, 4, 6],
        discount: 20,
        validity: 90,
        desc: "Complete bridal preparation",
        bonus: "Priority booking\nComplimentary consultation",
        status: "Active",
        featured: "Yes"
    },
    {
        id: 2,
        name: "Total Transformation",
        cat: "Hair Packages",
        services: [1, 2, 8],
        discount: 15,
        validity: 30,
        desc: "Full hair makeover",
        bonus: "",
        status: "Active",
        featured: "No"
    },
    {
        id: 3,
        name: "Relax & Rejuvenate",
        cat: "Relaxation",
        services: [5, 6, 3],
        discount: 10,
        validity: 60,
        desc: "Ultimate relaxation experience",
        bonus: "Free herbal tea",
        status: "Active",
        featured: "Yes"
    },
    {
        id: 4,
        name: "Beauty Essentials",
        cat: "Beauty Essentials",
        services: [1, 3, 4],
        discount: 12,
        validity: 30,
        desc: "Everyday beauty basics",
        bonus: "",
        status: "Active",
        featured: "No"
    },
    {
        id: 5,
        name: "VIP Royal Package",
        cat: "VIP",
        services: [1, 2, 3, 4, 5, 6],
        discount: 25,
        validity: 120,
        desc: "The complete luxury experience",
        bonus: "Priority booking\nFree consultation\nComplimentary champagne",
        status: "Active",
        featured: "Yes"
    },
    {
        id: 6,
        name: "Mens Grooming",
        cat: "Hair Packages",
        services: [1, 7],
        discount: 10,
        validity: 30,
        desc: "Essential male grooming",
        bonus: "",
        status: "Inactive",
        featured: "No"
    },
];

let editId = null;

function getRegularPrice(services) {
    return services.reduce((s, id) => {
        const svc = allServices.find(x => x.id === id);
        return s + (svc ? svc.price : 0);
    }, 0);
}

function getPackagePrice(services, discount) {
    const reg = getRegularPrice(services);
    return reg - (reg * discount / 100);
}

function getServiceNames(ids) {
    return ids.map(id => {
        const s = allServices.find(x => x.id === id);
        return s ? s.name : '';
    }).filter(Boolean);
}

function render() {
    const q = document.getElementById('pSearch').value.toLowerCase();
    const cat = document.getElementById('pCat').value;
    const st = document.getElementById('pStatus').value;
    const filtered = packages.filter(p => (!q || p.name.toLowerCase().includes(q)) && (!cat || p.cat === cat) && (!st || p.status === st));
    document.getElementById('pkgBody').innerHTML = filtered.length ? filtered.map(p => {
        const reg = getRegularPrice(p.services);
        const pkg = getPackagePrice(p.services, p.discount);
        const names = getServiceNames(p.services);
        return `<tr>
            <td>${p.id}</td>
            <td><strong>${p.name}</strong>${p.desc ? `<br><span style="color:#888;font-size:.78rem">${p.desc}</span>` : ''}</td>
            <td style="font-size:.82rem">${p.cat}</td>
            <td><div class="pkg-services">${names.map(n => `<span class="pkg-service-tag">${n}</span>`).join('')}</div></td>
            <td>$${reg.toFixed(2)}</td>
            <td style="color:#7c3aed;font-weight:700">$${pkg.toFixed(2)}</td>
            <td><span style="background:#fef3c7;color:#92400e;padding:.2rem .5rem;border-radius:10px;font-size:.78rem;font-weight:600">${p.discount}% off</span></td>
            <td>${p.validity} days</td>
            <td>${p.featured === 'Yes' ? '<span class="featured-badge">⭐ Featured</span>' : '—'}</td>
            <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-edit btn-sm" onclick="openEdit(${p.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-${p.status === 'Active' ? 'warning' : 'success'} btn-sm" style="margin-left:.3rem" onclick="togglePkg(${p.id})">${p.status === 'Active' ? 'Disable' : 'Enable'}</button>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="11" style="text-align:center;padding:2rem;color:#999">No packages found</td></tr>`;
    document.getElementById('pkgInfo').textContent = `${filtered.length} package(s) found`;
}

function buildServiceSelector(selected = []) {
    document.getElementById('serviceSelector').innerHTML = allServices.map(s => `
        <div class="service-item">
            <label><input type="checkbox" value="${s.id}" ${selected.includes(s.id) ? 'checked' : ''} onchange="updatePreview()"> ${s.name}</label>
            <span class="price">$${s.price.toFixed(2)}</span>
        </div>`).join('');
}

function getSelectedServices() {
    return [...document.querySelectorAll('#serviceSelector input:checked')].map(cb => parseInt(cb.value));
}

function updatePreview() {
    const sel = getSelectedServices();
    const disc = parseFloat(document.getElementById('fDiscount').value) || 0;
    const reg = getRegularPrice(sel);
    const discAmt = reg * disc / 100;
    const pkg = reg - discAmt;
    document.getElementById('previewRegular').textContent = '$' + reg.toFixed(2);
    document.getElementById('previewDiscount').textContent = '-$' + discAmt.toFixed(2);
    document.getElementById('previewTotal').textContent = '$' + pkg.toFixed(2);
    document.getElementById('previewSavings').textContent = `Customer saves: $${discAmt.toFixed(2)} (${disc}%)`;
    document.getElementById('fPkgPrice').value = '$' + pkg.toFixed(2);
}

function openAdd() {
    editId = null;
    document.getElementById('pkgModalTitle').innerHTML = '<i class="fas fa-plus"></i> Create Package';
    ['fPName', 'fPDesc', 'fBonus'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fDiscount').value = 0;
    document.getElementById('fValidity').value = 30;
    document.getElementById('fPStatus').value = 'Active';
    document.getElementById('fFeatured').value = 'No';
    buildServiceSelector([]);
    updatePreview();
    document.getElementById('pkgModal').classList.add('open');
}

function openEdit(id) {
    editId = id;
    const p = packages.find(x => x.id === id);
    document.getElementById('pkgModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Package';
    document.getElementById('fPName').value = p.name;
    document.getElementById('fPCat').value = p.cat;
    document.getElementById('fValidity').value = p.validity;
    document.getElementById('fPDesc').value = p.desc;
    document.getElementById('fDiscount').value = p.discount;
    document.getElementById('fPStatus').value = p.status;
    document.getElementById('fFeatured').value = p.featured;
    document.getElementById('fBonus').value = p.bonus || '';
    buildServiceSelector(p.services);
    updatePreview();
    document.getElementById('pkgModal').classList.add('open');
}

function savePackage() {
    const name = document.getElementById('fPName').value.trim();
    if (!name) {
        alert('Package name is required');
        return;
    }
    const sel = getSelectedServices();
    if (!sel.length) {
        alert('Please select at least one service');
        return;
    }
    const data = {
        name,
        cat: document.getElementById('fPCat').value,
        services: sel,
        discount: parseFloat(document.getElementById('fDiscount').value) || 0,
        validity: parseInt(document.getElementById('fValidity').value) || 30,
        desc: document.getElementById('fPDesc').value,
        bonus: document.getElementById('fBonus').value,
        status: document.getElementById('fPStatus').value,
        featured: document.getElementById('fFeatured').value
    };
    if (editId) {
        Object.assign(packages.find(x => x.id === editId), data);
    } else {
        packages.push({
            id: packages.length + 1,
            ...data
        });
    }
    render();
    closeModal();
    showToast(editId ? 'Package updated!' : 'Package created!');
}

function togglePkg(id) {
    const p = packages.find(x => x.id === id);
    p.status = p.status === 'Active' ? 'Inactive' : 'Active';
    render();
    showToast('Package status updated!');
}

function closeModal() {
    document.getElementById('pkgModal').classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.2)';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.onclick = e => {
    if (e.target.id === 'pkgModal') closeModal();
};

render();