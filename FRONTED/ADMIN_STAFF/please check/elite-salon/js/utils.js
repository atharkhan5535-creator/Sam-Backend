const Utils = {
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #7c3aed;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideUp 0.3s ease;
            max-width: 300px;
        `;
        toast.textContent = '✓ ' + message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    getInitials: function(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    formatDate: function(dateString) {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatTime: function(timeString) {
        if (!timeString) return '—';
        return timeString;
    },

    formatCurrency: function(amount) {
        return '$' + parseFloat(amount || 0).toFixed(2);
    },

    closeModal: function(modalId) {
        document.getElementById(modalId)?.classList.remove('open');
    },

    openModal: function(modalId) {
        document.getElementById(modalId)?.classList.add('open');
    },

    toggleNav: function() {
        document.getElementById('nav')?.classList.toggle('open');
    },

    logout: function() {
        window.location.href = 'index.html';
    }
};

window.Utils = Utils;
window.showToast = Utils.showToast;
window.closeModal = Utils.closeModal;
window.openModal = Utils.openModal;
window.toggleNav = Utils.toggleNav;
window.logout = Utils.logout;