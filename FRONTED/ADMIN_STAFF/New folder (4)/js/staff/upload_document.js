/* =============================================
   STAFF DOCUMENT UPLOAD
   Handle file selection and upload
   ============================================= */

let selectedFile = null;

document.addEventListener('DOMContentLoaded', function() {
    setupUploadListeners();
});

// Setup upload listeners
function setupUploadListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('[onclick="uploadDoc()"]');
    
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        dropZone.addEventListener('click', () => fileInput?.click());
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadDoc);
    }
    
    const removeBtn = document.querySelector('.file-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', clearFile);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.style.borderColor = '#8b5cf6';
}

// Handle drag leave
function handleDragLeave() {
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.style.borderColor = '#ddd6fe';
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.style.borderColor = '#ddd6fe';
    
    const file = e.dataTransfer.files[0];
    if (file) showFilePreview(file);
}

// Handle file select
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) showFilePreview(file);
}

// Show file preview
function showFilePreview(file) {
    selectedFile = file;
    
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const dropZone = document.getElementById('dropZone');
    
    if (preview) preview.classList.add('show');
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
    if (dropZone) dropZone.style.display = 'none';
    
    // Set file icon based on type
    const icon = preview?.querySelector('i');
    if (icon) {
        if (file.type.includes('pdf')) {
            icon.className = 'fas fa-file-pdf';
            icon.style.color = '#ef4444';
        } else if (file.type.includes('image')) {
            icon.className = 'fas fa-file-image';
            icon.style.color = '#0ea5e9';
        } else {
            icon.className = 'fas fa-file';
            icon.style.color = '#888';
        }
    }
}

// Clear file
function clearFile() {
    selectedFile = null;
    
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('filePreview');
    const dropZone = document.getElementById('dropZone');
    
    if (fileInput) fileInput.value = '';
    if (preview) preview.classList.remove('show');
    if (dropZone) dropZone.style.display = 'block';
}

// Upload document
async function uploadDoc() {
    const type = document.getElementById('docType')?.value;
    const notes = document.getElementById('docNotes')?.value;
    
    // Validation
    if (!selectedFile) {
        showToast('Please select a file to upload', 'error');
        return;
    }
    
    if (!type) {
        showToast('Please select a document type', 'error');
        return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
        showToast('Only PDF, JPG, and PNG files are allowed', 'error');
        return;
    }
    
    // Show uploading state
    showToast('Uploading document...', 'info');
    
    // In a real app, this would upload to server
    // For now, simulate upload
    setTimeout(() => {
        showToast('Document uploaded successfully!');
        setTimeout(() => {
            window.location.href = 'document.html';
        }, 1500);
    }, 2000);
}

// Export functions
window.uploadDoc = uploadDoc;
window.clearFile = clearFile;