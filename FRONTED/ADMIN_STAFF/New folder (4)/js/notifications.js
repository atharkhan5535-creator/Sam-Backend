/* =============================================
   NOTIFICATION UTILITIES
   SweetAlert2 + Toastify integration
   Matches Elite Salon dark/gold theme
   ============================================= */

/* ========== SWEETALERT2 THEME CONFIGURATION ========== */
const SwalTheme = {
    background: '#1a1f2e',
    color: '#f1f5f9',
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#64748b',
    backdrop: 'rgba(0,0,0,0.85)',
    inputLabelColor: '#94a3b8',
    inputBackground: '#0a0e1a',
    inputBorderColor: '#2a3142',
    inputColor: '#f1f5f9'
};

/* ========== TOAST NOTIFICATIONS ========== */

/**
 * Show success toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showSuccess(message, duration = 3000) {
    Toastify({
        text: "✅ " + message,
        duration: duration,
        gravity: "top",
        position: "right",
        backgroundColor: "#10b981",
        borderRadius: "8px",
        style: { 
            fontSize: "14px", 
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
        },
        escapeMarkup: false
    }).showToast();
}

/**
 * Show error toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showErrorToast(message, duration = 4000) {
    Toastify({
        text: "❌ " + message,
        duration: duration,
        gravity: "top",
        position: "right",
        backgroundColor: "#ef4444",
        borderRadius: "8px",
        style: { 
            fontSize: "14px", 
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
        },
        escapeMarkup: false
    }).showToast();
}

/**
 * Show warning toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showWarningToast(message, duration = 4000) {
    Toastify({
        text: "⚠️ " + message,
        duration: duration,
        gravity: "top",
        position: "right",
        backgroundColor: "#f59e0b",
        borderRadius: "8px",
        style: { 
            fontSize: "14px", 
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)"
        },
        escapeMarkup: false
    }).showToast();
}

/**
 * Show info toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showInfoToast(message, duration = 3000) {
    Toastify({
        text: "ℹ️ " + message,
        duration: duration,
        gravity: "top",
        position: "right",
        backgroundColor: "#3b82f6",
        borderRadius: "8px",
        style: { 
            fontSize: "14px", 
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
        },
        escapeMarkup: false
    }).showToast();
}

/* ========== SWEETALERT2 MODALS ========== */

/**
 * Show error alert modal
 * @param {string} title - Alert title
 * @param {string|Array} message - Message or array of validation errors
 */
function showError(title, message) {
    const html = Array.isArray(message) 
        ? '<ul style="text-align:left;margin:1rem 0;padding-left:1.5rem;"><li>' + message.join('</li><li>') + '</li></ul>'
        : message;
    
    Swal.fire({
        icon: 'error',
        title: title,
        html: html,
        confirmButtonText: 'OK',
        confirmButtonColor: SwalTheme.confirmButtonColor,
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop,
        customClass: {
            popup: 'animated-popup',
            confirmButton: 'custom-confirm-btn'
        }
    });
}

/**
 * Show success alert modal
 * @param {string} title - Alert title
 * @param {string} message - Message to display
 */
function showSuccessModal(title, message) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: SwalTheme.confirmButtonColor,
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop,
        timer: 2000,
        timerProgressBar: true
    });
}

/**
 * Show warning alert modal
 * @param {string} title - Alert title
 * @param {string} message - Message to display
 */
function showWarning(title, message) {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: SwalTheme.confirmButtonColor,
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop
    });
}

/**
 * Show info alert modal
 * @param {string} title - Alert title
 * @param {string} message - Message to display
 */
function showInfo(title, message) {
    Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: SwalTheme.confirmButtonColor,
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop
    });
}

/**
 * Show confirmation dialog
 * @param {string} title - Confirmation title
 * @param {string} text - Confirmation text
 * @param {string} confirmText - Confirm button text (default: 'Yes')
 * @param {string} cancelText - Cancel button text (default: 'Cancel')
 * @returns {Promise} - Resolves with result object
 */
function showConfirm(title, text, confirmText = 'Yes', cancelText = 'Cancel') {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: SwalTheme.confirmButtonColor,
        cancelButtonColor: SwalTheme.cancelButtonColor,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop,
        reverseButtons: true
    });
}

/**
 * Show loading spinner
 * @param {string} title - Loading text
 * @returns {object} - SweetAlert instance (call .close() to dismiss)
 */
function showLoading(title = 'Loading...') {
    Swal.fire({
        title: title,
        html: 'Please wait...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: SwalTheme.background,
        color: SwalTheme.color,
        backdrop: SwalTheme.backdrop
    });
    return Swal;
}

/**
 * Close loading spinner
 */
function closeLoading() {
    Swal.close();
}

/* ========== VALIDATION ERROR DISPLAY ========== */

/**
 * Show validation errors from ValidationUtils
 * @param {Array} errors - Array of error messages
 */
function showValidationErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }
    showError('Invalid Data', errors);
}

/* ========== DEPRECATED FUNCTION WRAPPERS ========== */
// These maintain backward compatibility with existing code

/**
 * Legacy showToast function (replaced by showSuccess)
 * @deprecated Use showSuccess() instead
 */
function showToast(message) {
    showSuccess(message);
}

/**
 * Legacy alert wrapper (shows themed error)
 * @deprecated Use showError() or showSuccessModal() instead
 */
function showAlert(message, type = 'error') {
    if (type === 'success') {
        showSuccessModal('Success', message);
    } else if (type === 'warning') {
        showWarning('Warning', message);
    } else if (type === 'info') {
        showInfo('Info', message);
    } else {
        showError('Error', message);
    }
}

/* ========== CUSTOM STYLES ========== */
const style = document.createElement('style');
style.textContent = `
    /* SweetAlert2 - Highest z-index to appear above everything */
    .swal2-container {
        z-index: 999999 !important;
    }
    
    .swal2-popup {
        border: 1px solid #2a3142 !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
        z-index: 999999 !important;
    }

    .swal2-title {
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        margin-bottom: 1rem !important;
    }

    .swal2-html-container {
        font-size: 0.95rem !important;
        line-height: 1.6 !important;
    }

    .swal2-confirm {
        padding: 0.75rem 2rem !important;
        font-size: 0.9rem !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        transition: all 0.2s !important;
    }

    .swal2-confirm:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4) !important;
    }

    .swal2-cancel {
        padding: 0.75rem 2rem !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
        border-radius: 8px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        transition: all 0.2s !important;
    }

    .swal2-cancel:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(100, 116, 139, 0.4) !important;
    }

    .swal2-input {
        border: 1px solid #2a3142 !important;
        border-radius: 6px !important;
        font-size: 0.9rem !important;
    }

    .swal2-input:focus {
        border-color: #d4af37 !important;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1) !important;
    }

    /* Toastify - Highest z-index to appear above everything */
    .toastify {
        font-family: 'Inter', sans-serif !important;
        z-index: 999999 !important;
    }

    .toastify.on {
        z-index: 999999 !important;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ========== EXPORT FOR GLOBAL USE ========== */
window.showSuccess = showSuccess;
window.showErrorToast = showErrorToast;
window.showWarningToast = showWarningToast;
window.showInfoToast = showInfoToast;
window.showError = showError;
window.showSuccessModal = showSuccessModal;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.showConfirm = showConfirm;
window.showLoading = showLoading;
window.closeLoading = closeLoading;
window.showValidationErrors = showValidationErrors;
window.showToast = showToast; // Legacy
window.showAlert = showAlert; // Legacy
