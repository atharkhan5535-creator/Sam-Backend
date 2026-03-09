/* =============================================
   STAFF DOCUMENT MANAGEMENT
   View uploaded documents
   ============================================= */

let documents = [];

document.addEventListener('DOMContentLoaded', function() {
    loadDocuments();
    setupDocumentListeners();
});

// Load documents
function loadDocuments() {
    // Mock data
    documents = [
        { id: 1, docId: "DOC-001", type: "Certification", file: "cosmetology_license.pdf", status: "Verified", uploadedAt: "2026-01-15" },
        { id: 2, docId: "DOC-002", type: "ID Proof", file: "passport.jpg", status: "Verified", uploadedAt: "2026-01-10" },
        { id: 3, docId: "DOC-003", type: "Certification", file: "color_certification.pdf", status: "Pending", uploadedAt: "2026-02-05" },
        { id: 4, docId: "DOC-004", type: "Contract", file: "employment_contract.pdf", status: "Verified", uploadedAt: "2026-01-20" },
    ];
    
    renderDocuments();
}

// Render documents table
function renderDocuments() {
    const tbody = document.getElementById('docBody');
    if (!tbody) return;
    
    tbody.innerHTML = documents.map(doc => {
        const statusClass = doc.status === 'Verified' ? 'badge-success' : 
                           (doc.status === 'Pending' ? 'badge-warning' : 'badge-danger');
        
        const fileIcon = doc.file.endsWith('.pdf') ? 'fa-file-pdf' : 
                        (doc.file.endsWith('.jpg') || doc.file.endsWith('.png') ? 'fa-file-image' : 'fa-file');
        
        const iconColor = doc.file.endsWith('.pdf') ? '#ef4444' : 
                         (doc.file.endsWith('.jpg') || doc.file.endsWith('.png') ? '#0ea5e9' : '#888');
        
        return `
            <tr>
                <td>#${doc.docId}</td>
                <td>${doc.type}</td>
                <td><i class="fas ${fileIcon}" style="color:${iconColor};margin-right:.3rem"></i> ${doc.file}</td>
                <td><span class="badge ${statusClass}">${doc.status}</span></td>
                <td>${formatDisplayDate(doc.uploadedAt)}</td>
                <td><button class="btn btn-view btn-sm" onclick="viewDocument(${doc.id})"><i class="fas fa-eye"></i> View</button></td>
            </tr>
        `;
    }).join('');
    
    const infoEl = document.getElementById('docInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${documents.length} of ${documents.length} documents`;
    }
}

// View document
function viewDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    // In a real app, this would open the file
    showToast(`Opening ${doc.file}...`, 'info');
}

// Filter documents
function filterDocuments() {
    const searchInput = document.getElementById('docSearch');
    const typeFilter = document.getElementById('docTypeFilter');
    
    if (!searchInput && !typeFilter) return;
    
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const typeValue = typeFilter?.value || '';
    
    const filtered = documents.filter(doc => {
        const matchesSearch = !searchTerm || 
            doc.docId.toLowerCase().includes(searchTerm) || 
            doc.type.toLowerCase().includes(searchTerm) ||
            doc.file.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeValue || doc.type === typeValue;
        
        return matchesSearch && matchesType;
    });
    
    const tbody = document.getElementById('docBody');
    if (!tbody) return;
    
    tbody.innerHTML = filtered.map(doc => {
        const statusClass = doc.status === 'Verified' ? 'badge-success' : 
                           (doc.status === 'Pending' ? 'badge-warning' : 'badge-danger');
        
        const fileIcon = doc.file.endsWith('.pdf') ? 'fa-file-pdf' : 
                        (doc.file.endsWith('.jpg') || doc.file.endsWith('.png') ? 'fa-file-image' : 'fa-file');
        
        const iconColor = doc.file.endsWith('.pdf') ? '#ef4444' : 
                         (doc.file.endsWith('.jpg') || doc.file.endsWith('.png') ? '#0ea5e9' : '#888');
        
        return `
            <tr>
                <td>#${doc.docId}</td>
                <td>${doc.type}</td>
                <td><i class="fas ${fileIcon}" style="color:${iconColor};margin-right:.3rem"></i> ${doc.file}</td>
                <td><span class="badge ${statusClass}">${doc.status}</span></td>
                <td>${formatDisplayDate(doc.uploadedAt)}</td>
                <td><button class="btn btn-view btn-sm" onclick="viewDocument(${doc.id})"><i class="fas fa-eye"></i> View</button></td>
            </tr>
        `;
    }).join('');
    
    const infoEl = document.getElementById('docInfo');
    if (infoEl) {
        infoEl.textContent = `Showing ${filtered.length} of ${documents.length} documents`;
    }
    
    showToast('Filtering documents...', 'info');
}

// Setup document listeners
function setupDocumentListeners() {
    const searchInput = document.getElementById('docSearch');
    const typeFilter = document.getElementById('docTypeFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterDocuments, 300));
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterDocuments);
    }
}

// Export functions
window.viewDocument = viewDocument;
window.filterDocuments = filterDocuments;