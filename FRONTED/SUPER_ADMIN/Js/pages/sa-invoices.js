// INVOICES PAGE - API Integration
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    if (!TokenManager.isAuthenticated() || !TokenManager.hasRole(USER_ROLES.SUPER_ADMIN)) {
        window.location.href = '../../html/super-admin/sa-login.html';
        return;
    }

    // Load user info into sidebar
    loadUserInfo();

    // DOM Elements
    const addInvoiceModal = document.getElementById('addInvoiceModal');
    const viewInvoiceModal = document.getElementById('viewInvoiceModal');
    const invoiceForm = document.getElementById('invoiceForm');
    const paymentForm = document.getElementById('paymentForm');
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    const closeAddInvoiceModal = document.getElementById('closeAddInvoiceModal');
    const closeViewInvoiceModal = document.getElementById('closeViewInvoiceModal');
    const cancelInvoiceBtn = document.getElementById('cancelInvoiceBtn');
    const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const invoiceSearch = document.getElementById('invoiceSearch');
    const paymentStatusFilter = document.getElementById('paymentStatusFilter');
    const resultsCount = document.getElementById('resultsCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const invoiceSalonId = document.getElementById('invoiceSalonId');
    const invoiceSubscriptionId = document.getElementById('invoiceSubscriptionId');
    const invoiceAmount = document.getElementById('invoiceAmount');
    const invoiceTaxAmount = document.getElementById('invoiceTaxAmount');
    const invoiceDiscountAmount = document.getElementById('invoiceDiscountAmount');
    const invoiceTotalValue = document.getElementById('invoiceTotalValue');
    const recordPaymentSection = document.getElementById('recordPaymentSection');
    const outstandingAmount = document.getElementById('outstandingAmount');

    let currentPage = 1;
    let allInvoices = [];
    let availableSalons = [];
    let currentInvoice = null;

    // --- API FUNCTIONS ---

    // Fetch all salon invoices
    async function fetchInvoices(paymentStatus = '') {
        try {
            let endpoint = API_ENDPOINTS.INVOICES.LIST;
            const params = [];
            
            if (paymentStatus) {
                params.push(`payment_status=${paymentStatus}`);
            }
            
            params.push(`page=${currentPage}`);
            params.push(`limit=20`);
            
            if (params.length > 0) {
                endpoint += '?' + params.join('&');
            }

            const response = await apiRequest(endpoint);
            if (response.status === 'success') {
                allInvoices = response.data.items || [];
                renderInvoicesTable(allInvoices);
                updateStats(allInvoices);
                updateResultsCount();
                updatePagination();
            } else {
                showToast('Failed to load invoices', 'error');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            showToast(error.message || 'Network error', 'error');
        }
    }

    // Fetch single invoice details
    async function fetchInvoiceById(invoiceSalonId) {
        try {
            const response = await apiRequest(API_ENDPOINTS.INVOICES.VIEW(invoiceSalonId));
            if (response.status === 'success') {
                return response.data;
            } else {
                showToast('Failed to load invoice details', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
            showToast(error.message || 'Network error', 'error');
            return null;
        }
    }

    // Fetch salons for dropdown
    async function fetchSalons() {
        try {
            const response = await apiRequest(API_ENDPOINTS.SALONS.LIST);
            if (response.status === 'success') {
                availableSalons = response.data.items || [];
                populateSalonDropdown();
            }
        } catch (error) {
            console.error('Error fetching salons:', error);
        }
    }

    // Fetch salon subscriptions for dropdown
    async function fetchSalonSubscriptions(salonId) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.LIST_BY_SALON(salonId));
            if (response.status === 'success') {
                const subscriptions = response.data.items || [];
                populateSubscriptionDropdown(subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    }

    // Generate invoice
    async function generateInvoice(data) {
        try {
            const response = await apiRequest(API_ENDPOINTS.INVOICES.CREATE, {
                method: 'POST',
                body: JSON.stringify({
                    salon_id: data.salon_id,
                    subscription_id: data.subscription_id,
                    amount: data.amount,
                    tax_amount: data.tax_amount,
                    due_date: data.due_date,
                    notes: data.notes
                })
            });

            if (response.status === 'success') {
                showToast('Invoice generated successfully', 'success');
                return true;
            } else {
                showToast(response.message || 'Failed to generate invoice', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // Record payment for invoice
    async function recordPayment(invoiceSalonId, paymentData) {
        try {
            const response = await apiRequest(
                API_ENDPOINTS.INVOICES.RECORD_PAYMENT(invoiceSalonId), 
                {
                    method: 'POST',
                    body: JSON.stringify(paymentData)
                }
            );
            
            if (response.status === 'success') {
                showToast('Payment recorded successfully', 'success');
                return true;
            } else {
                showToast(response.message || 'Failed to record payment', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            showToast(error.message || 'Network error', 'error');
            return false;
        }
    }

    // --- RENDER FUNCTIONS ---

    function renderInvoicesTable(invoices) {
        if (!invoiceTableBody) return;

        if (invoices.length === 0) {
            invoiceTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-file-invoice" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No invoices found
                    </td>
                </tr>
            `;
            return;
        }

        invoiceTableBody.innerHTML = invoices.map(invoice => {
            // Calculate actual payment status based on payments (not stored value)
            const calculatedStatus = verifyPaymentStatus(invoice);
            invoice.calculatedPaymentStatus = calculatedStatus;

            return `
            <tr data-invoice-id="${invoice.invoice_salon_id}">
                <td>
                    <input type="checkbox" class="invoice-checkbox" value="${invoice.invoice_salon_id}" style="width: 16px; height: 16px; cursor: pointer;">
                </td>
                <td>
                    <span class="invoice-number">${invoice.invoice_number || '-'}</span>
                </td>
                <td>
                    <div class="salon-info-cell">
                        <div class="salon-avatar">${(invoice.salon_name || 'S').charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="salon-name-text">${invoice.salon_name || 'Unknown'}</div>
                            <div class="salon-id-text">ID: ${invoice.salon_id}</div>
                        </div>
                    </div>
                </td>
                <td>${invoice.plan_name || '-'}</td>
                <td>${formatDate(invoice.invoice_date)}</td>
                <td>${formatDate(invoice.due_date)}</td>
                <td class="amount-cell ${calculatedStatus.toLowerCase()}">
                    ₹${(invoice.total_amount || 0).toLocaleString('en-IN')}
                </td>
                <td>
                    <span class="payment-badge ${calculatedStatus.toLowerCase()}">
                        <span class="dot"></span>
                        ${calculatedStatus}
                    </span>
                </td>
                <td>
                    <button class="btn-icon btn-view-invoice" data-invoice-id="${invoice.invoice_salon_id}" title="View">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-record-payment" data-invoice-id="${invoice.invoice_salon_id}" title="Record Payment">
                        <i class="fa-solid fa-credit-card"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

        // Add event listeners
        invoiceTableBody.querySelectorAll('.btn-view-invoice').forEach(btn => {
            btn.addEventListener('click', () => viewInvoice(btn.dataset.invoiceId));
        });

        invoiceTableBody.querySelectorAll('.btn-record-payment').forEach(btn => {
            btn.addEventListener('click', () => openRecordPaymentModal(btn.dataset.invoiceId));
        });

        // Checkbox event listeners
        invoiceTableBody.querySelectorAll('.invoice-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateBulkSelection);
        });
    }

    /* =============================================
       BULK OPERATIONS
       ============================================= */

    let selectedInvoices = new Set();

    /**
     * Update bulk selection state
     */
    function updateBulkSelection() {
        const checkboxes = document.querySelectorAll('.invoice-checkbox');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const selectedCount = document.getElementById('selectedCount');
        const selectedNumber = document.getElementById('selectedNumber');
        const bulkActions = document.getElementById('bulkActions');

        // Update selected invoices set
        selectedInvoices.clear();
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedInvoices.add(checkbox.value);
            }
        });

        // Update UI
        if (selectedInvoices.size > 0) {
            selectedCount.style.display = 'inline';
            selectedNumber.textContent = selectedInvoices.size;
            bulkActions.style.display = 'flex';
        } else {
            selectedCount.style.display = 'none';
            bulkActions.style.display = 'none';
        }

        // Update select all checkbox
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        }
    }

    /**
     * Get selected invoice data
     */
    function getSelectedInvoiceData() {
        return allInvoices.filter(inv => selectedInvoices.has(String(inv.invoice_salon_id)));
    }

    /**
     * Bulk export selected invoices to CSV
     */
    function bulkExportInvoices() {
        const invoices = getSelectedInvoiceData();
        
        if (invoices.length === 0) {
            showErrorToast('No invoices selected');
            return;
        }

        const headers = ['Invoice Number', 'Salon Name', 'Salon ID', 'Plan Name', 'Invoice Date', 'Due Date', 'Amount', 'Tax Amount', 'Total Amount', 'Payment Status'];
        const rows = invoices.map(inv => [
            inv.invoice_number || '',
            inv.salon_name || '',
            inv.salon_id || '',
            inv.plan_name || '',
            inv.invoice_date || '',
            inv.due_date || '',
            inv.amount || 0,
            inv.tax_amount || 0,
            inv.total_amount || 0,
            inv.payment_status || 'UNPAID'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showSuccess(`Exported ${invoices.length} invoices to CSV`);
    }

    /**
     * Bulk print selected invoices
     */
    function bulkPrintInvoices() {
        const invoices = getSelectedInvoiceData();
        
        if (invoices.length === 0) {
            showErrorToast('No invoices selected');
            return;
        }

        if (invoices.length > 5) {
            const confirmed = confirm(`You are about to print ${invoices.length} invoices. This may take a while. Continue?`);
            if (!confirmed) return;
        }

        // Print each invoice in a new window
        invoices.forEach((invoice, index) => {
            setTimeout(() => {
                downloadInvoiceAsPdf(invoice);
            }, index * 1000); // Stagger prints by 1 second
        });

        showSuccess(`Printing ${invoices.length} invoices...`);
    }

    /**
     * Bulk delete selected invoices (confirmation only - actual delete requires backend API)
     */
    async function bulkDeleteInvoices() {
        const invoices = getSelectedInvoiceData();
        
        if (invoices.length === 0) {
            showErrorToast('No invoices selected');
            return;
        }

        // Check for paid invoices
        const paidInvoices = invoices.filter(inv => inv.calculatedPaymentStatus === 'PAID' || inv.payment_status === 'PAID');
        if (paidInvoices.length > 0) {
            const confirmed = await showConfirm(
                'Delete Invoices?',
                `You are about to delete ${invoices.length} invoices.\n\n⚠️ ${paidInvoices.length} of these are PAID invoices. Deleting paid invoices is not recommended.\n\nThis action cannot be undone!`,
                'Yes, Delete All',
                'Cancel'
            );
            if (!confirmed.isConfirmed) return;
        } else {
            const confirmed = await showConfirm(
                'Delete Invoices?',
                `You are about to delete ${invoices.length} invoices.\n\nThis action cannot be undone!`,
                'Yes, Delete All',
                'Cancel'
            );
            if (!confirmed.isConfirmed) return;
        }

        // Note: Backend API for bulk delete would be called here
        // For now, show a message
        showErrorToast('Bulk delete requires backend API. Please delete invoices individually.');
        
        // Clear selection
        selectedInvoices.clear();
        document.querySelectorAll('.invoice-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('selectAllCheckbox').checked = false;
        updateBulkSelection();
    }

    // Setup bulk action event listeners
    setTimeout(() => {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.invoice-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                });
                updateBulkSelection();
            });
        }

        // Bulk export button
        const bulkExportBtn = document.getElementById('bulkExportBtn');
        if (bulkExportBtn) {
            bulkExportBtn.addEventListener('click', bulkExportInvoices);
        }

        // Bulk print button
        const bulkPrintBtn = document.getElementById('bulkPrintBtn');
        if (bulkPrintBtn) {
            bulkPrintBtn.addEventListener('click', bulkPrintInvoices);
        }

        // Bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', bulkDeleteInvoices);
        }
    }, 500);

    function updateStats(invoices) {
        const stats = {
            unpaid: { count: 0, amount: 0 },
            partial: { count: 0, amount: 0 },
            paid: { count: 0, amount: 0 },
            refunded: { count: 0, amount: 0 }
        };

        invoices.forEach(inv => {
            // Use calculated payment status instead of stored value
            const status = (inv.calculatedPaymentStatus || inv.payment_status || 'UNPAID').toLowerCase();
            if (stats[status]) {
                stats[status].count++;
                stats[status].amount += inv.total_amount || 0;
            }
        });

        document.getElementById('unpaidCount').textContent = stats.unpaid.count;
        document.getElementById('unpaidAmount').textContent = stats.unpaid.amount.toLocaleString('en-IN');
        document.getElementById('partialCount').textContent = stats.partial.count;
        document.getElementById('partialAmount').textContent = stats.partial.amount.toLocaleString('en-IN');
        document.getElementById('paidCount').textContent = stats.paid.count;
        document.getElementById('paidAmount').textContent = stats.paid.amount.toLocaleString('en-IN');
        document.getElementById('refundedCount').textContent = stats.refunded.count;
        document.getElementById('refundedAmount').textContent = stats.refunded.amount.toLocaleString('en-IN');
    }

    function updatePagination() {
        const totalPages = Math.ceil(allInvoices.length / 20);
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function updateResultsCount() {
        const start = (currentPage - 1) * 20 + 1;
        const end = Math.min(currentPage * 20, allInvoices.length);
        resultsCount.textContent = `Showing ${allInvoices.length > 0 ? start : 0}-${end} of ${allInvoices.length} invoices`;
    }

    // --- MODAL FUNCTIONS ---

    function openGenerateInvoiceModal() {
        invoiceForm.reset();
        addInvoiceModal.style.display = 'block';
    }

    function closeGenerateInvoiceModal() {
        addInvoiceModal.style.display = 'none';
        invoiceForm.reset();
    }

    function closeViewInvoiceModalFunc() {
        viewInvoiceModal.style.display = 'none';
        recordPaymentSection.style.display = 'none';
        // Reset payment submission flag
        isPaymentSubmitting = false;
        // Reset payment form
        paymentForm.reset();
    }

    async function viewInvoice(invoiceSalonId) {
        const invoice = await fetchInvoiceById(invoiceSalonId);
        if (!invoice) return;

        currentInvoice = invoice;
        
        // Calculate actual payment status based on payments (not stored value)
        const actualPaymentStatus = verifyPaymentStatus(invoice);
        invoice.calculatedPaymentStatus = actualPaymentStatus;
        
        renderInvoicePreview(invoice);

        const savePaymentBtn = document.getElementById('savePaymentBtn');

        // Show payment section and Record Payment button if not fully paid
        if (actualPaymentStatus !== 'PAID') {
            const outstanding = invoice.total_amount - (invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0);
            outstandingAmount.textContent = outstanding.toLocaleString('en-IN');
            document.getElementById('paymentInvoiceSalonId').value = invoice.invoice_salon_id;
            recordPaymentSection.style.display = 'block';
            savePaymentBtn.style.display = 'inline-flex';
        } else {
            recordPaymentSection.style.display = 'none';
            savePaymentBtn.style.display = 'none';
        }

        viewInvoiceModal.style.display = 'block';
    }

    function renderInvoicePreview(invoice) {
        const content = document.getElementById('invoicePreviewContent');
        content.innerHTML = `
            <div class="invoice-preview-header">
                <div class="invoice-preview-logo">
                    <i class="fa-solid fa-file-invoice"></i>
                </div>
                <h1 class="invoice-preview-title">TAX INVOICE</h1>
                <div class="invoice-preview-number">${invoice.invoice_number || ''}</div>
            </div>
            
            <div class="invoice-info-grid">
                <div class="invoice-info-box">
                    <div class="invoice-info-box-title">Bill To</div>
                    <div class="invoice-info-box-content">
                        <strong>${invoice.salon_name || 'Unknown Salon'}</strong><br>
                        ${invoice.address || ''}<br>
                        ${invoice.city || ''}, ${invoice.state || ''} ${invoice.pincode || ''}<br>
                        Phone: ${invoice.phone || '-'}<br>
                        Email: ${invoice.email || '-'}<br>
                        ${invoice.gst_num ? `GST: ${invoice.gst_num}` : ''}
                    </div>
                </div>
                <div class="invoice-info-box">
                    <div class="invoice-info-box-title">Invoice Details</div>
                    <div class="invoice-info-box-content">
                        <strong>Invoice Number:</strong> ${invoice.invoice_number || '-'}<br>
                        <strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}<br>
                        <strong>Due Date:</strong> ${formatDate(invoice.due_date)}<br>
                        <strong>Payment Status:</strong> <span class="payment-badge ${invoice.calculatedPaymentStatus?.toLowerCase()}">${invoice.calculatedPaymentStatus || 'UNPAID'}</span><br>
                        <strong>Subscription:</strong> ${invoice.plan_name || '-'}
                    </div>
                </div>
            </div>

            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Subscription Plan: ${invoice.plan_name || '-'}</strong><br>
                            <small>Validity: ${formatDate(invoice.start_date)} to ${formatDate(invoice.end_date)}</small>
                        </td>
                        <td style="text-align: right;">₹${(invoice.amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>

            <div class="invoice-totals">
                <div class="invoice-totals-box">
                    <div class="invoice-total-row">
                        <span class="invoice-total-label">Subtotal</span>
                        <span class="invoice-total-value">₹${(invoice.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="invoice-total-row">
                        <span class="invoice-total-label">Tax Amount</span>
                        <span class="invoice-total-value">₹${(invoice.tax_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="invoice-total-row">
                        <span class="invoice-total-label">Discount</span>
                        <span class="invoice-total-value">-₹${(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="invoice-total-row" style="background: var(--primary); color: white;">
                        <span class="invoice-total-label" style="color: rgba(255,255,255,0.9);">Total Amount</span>
                        <span class="invoice-total-value">₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            ${invoice.payments && invoice.payments.length > 0 ? `
                <div class="payment-history-section">
                    <h3 class="payment-history-title">Payment History</h3>
                    <ul class="payment-history-list">
                        ${invoice.payments.map(payment => `
                            <li class="payment-history-item">
                                <div class="payment-history-info">
                                    <div class="payment-history-icon">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <div class="payment-history-details">
                                        <div class="payment-history-date">${formatDate(payment.payment_date)}</div>
                                        <div class="payment-history-method">${payment.payment_mode} - ${payment.transaction_no || ''}</div>
                                    </div>
                                </div>
                                <div class="payment-history-amount">₹${(payment.amount || 0).toLocaleString('en-IN')}</div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    async function openRecordPaymentModal(invoiceSalonId) {
        const invoice = await fetchInvoiceById(invoiceSalonId);
        if (!invoice) return;

        currentInvoice = invoice;
        document.getElementById('paymentInvoiceSalonId').value = invoice.invoice_salon_id;

        const outstanding = invoice.total_amount - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
        outstandingAmount.textContent = outstanding.toLocaleString('en-IN');

        const savePaymentBtn = document.getElementById('savePaymentBtn');
        recordPaymentSection.style.display = 'block';
        savePaymentBtn.style.display = 'inline-flex';
        viewInvoiceModal.style.display = 'block';
    }

    // --- EVENT LISTENERS ---

    addInvoiceBtn.addEventListener('click', openGenerateInvoiceModal);
    closeAddInvoiceModal.addEventListener('click', closeGenerateInvoiceModal);
    closeViewInvoiceModal.addEventListener('click', closeViewInvoiceModalFunc);
    cancelInvoiceBtn.addEventListener('click', closeGenerateInvoiceModal);

    // Salon selection change
    invoiceSalonId.addEventListener('change', () => {
        const salonId = invoiceSalonId.value;
        if (salonId) {
            fetchSalonSubscriptions(salonId);
        }
    });

    // Subscription selection change - auto-update amount
    invoiceSubscriptionId.addEventListener('change', updateInvoiceAmount);

    // Amount fields change - update total
    [invoiceAmount, invoiceTaxAmount, invoiceDiscountAmount].forEach(input => {
        input.addEventListener('input', updateInvoiceTotal);
    });

    // Generate invoice form submit
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            salon_id: parseInt(invoiceSalonId.value),
            subscription_id: parseInt(invoiceSubscriptionId.value),
            amount: parseFloat(document.getElementById('invoiceAmount').value) || undefined,
            tax_amount: parseFloat(invoiceTaxAmount.value) || undefined,
            due_date: document.getElementById('invoiceDueDate').value,
            notes: document.getElementById('invoiceNotes').value.trim()
        };

        const success = await generateInvoice(data);
        if (success) {
            closeGenerateInvoiceModal();
            fetchInvoices();
        }
    });

    // Payment form submit
    let isPaymentSubmitting = false; // Prevent double submission
    
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (isPaymentSubmitting) {
            console.log('Payment submission already in progress...');
            return;
        }

        const invoiceSalonId = document.getElementById('paymentInvoiceSalonId').value;
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
        const paymentMode = document.getElementById('paymentMode').value;
        const transactionNo = document.getElementById('transactionNo')?.value.trim() || '';
        const paymentDate = document.getElementById('paymentDate').value || new Date().toISOString().split('T')[0];

        // PHASE 6: Enhanced validation
        // 1. Validate amount
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            showErrorToast('Please enter a valid payment amount greater than 0');
            return;
        }

        // 2. Calculate outstanding amount
        const invoice = currentInvoice;
        const totalPaid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
        const outstanding = invoice.total_amount - totalPaid;

        // 3. Check if payment exceeds outstanding
        if (paymentAmount > outstanding) {
            showErrorToast(`Payment amount (₹${paymentAmount.toLocaleString('en-IN')}) exceeds outstanding balance (₹${outstanding.toLocaleString('en-IN')})`);
            return;
        }

        // 4. Warn if payment is significantly less than outstanding (possible typo)
        if (paymentAmount < outstanding * 0.1 && outstanding > 100) {
            const confirmed = await showConfirm(
                'Small Payment Amount',
                `The payment amount (₹${paymentAmount.toLocaleString('en-IN')}) is less than 10% of the outstanding balance. Continue?`,
                'Yes, Continue',
                'Cancel'
            );
            if (!confirmed.isConfirmed) {
                return;
            }
        }

        // 5. Validate transaction number for non-cash payments
        if (paymentMode !== 'CASH' && !transactionNo) {
            showErrorToast(`Transaction reference is required for ${paymentMode} payments`);
            return;
        }

        const paymentData = {
            payment_mode: paymentMode,
            transaction_no: transactionNo,
            amount: paymentAmount,
            payment_date: paymentDate
        };

        // Set submitting flag and disable button
        isPaymentSubmitting = true;
        const savePaymentBtn = document.getElementById('savePaymentBtn');
        if (savePaymentBtn) {
            savePaymentBtn.disabled = true;
            savePaymentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        }

        try {
            const success = await recordPayment(invoiceSalonId, paymentData);
            if (success) {
                closeViewInvoiceModalFunc();
                fetchInvoices();
            }
        } catch (error) {
            console.error('Payment error:', error);
            showErrorToast('Payment failed: ' + error.message);
        } finally {
            // Reset submitting flag and re-enable button
            isPaymentSubmitting = false;
            if (savePaymentBtn) {
                savePaymentBtn.disabled = false;
                savePaymentBtn.innerHTML = '<i class="fa-solid fa-check"></i> Record Payment';
            }
        }
    });

    /* =============================================
       PHASE 6: PAYMENT IMPROVEMENTS
       - Print invoice functionality
       - Payment receipt generation
       - Enhanced status calculation
       ============================================= */

    /**
     * Download invoice as PDF (using browser print-to-PDF)
     */
    function downloadInvoiceAsPdf(invoice) {
        if (!invoice) {
            showErrorToast('No invoice data available');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printDate = new Date().toLocaleString('en-IN');

        const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoice.invoice_number || 'N/A'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #f5f5f5; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .invoice-header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-logo { font-size: 36px; color: #6366f1; margin-bottom: 10px; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #333; }
        .invoice-number { font-size: 16px; color: #666; margin-top: 5px; font-family: monospace; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .detail-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .detail-title { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 10px; }
        .detail-content { font-size: 14px; line-height: 1.8; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #6366f1; color: white; padding: 12px; text-align: left; font-size: 13px; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .totals-box { width: 300px; background: #f8f9fa; border-radius: 8px; overflow: hidden; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #ddd; font-size: 14px; }
        .total-row:last-child { border-bottom: none; background: #6366f1; color: white; font-weight: 700; font-size: 16px; }
        .payment-status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
        .status-paid { background: #10b981; color: white; }
        .status-unpaid { background: #ef4444; color: white; }
        .status-partial { background: #f59e0b; color: white; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; margin-top: 40px; }
        .download-btn { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
        .download-btn:hover { background: #4f46e5; }
        @media print { 
            .download-btn { display: none; } 
            body { background: white; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <button class="download-btn" onclick="downloadPDF()">📥 Download PDF</button>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="invoice-logo">✂️ SAM Salon</div>
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="invoice-number">${invoice.invoice_number || ''}</div>
        </div>

        <div class="invoice-details">
            <div class="detail-box">
                <div class="detail-title">Bill To</div>
                <div class="detail-content">
                    <strong>${invoice.salon_name || 'Unknown Salon'}</strong><br>
                    ${invoice.address || ''}<br>
                    ${invoice.city || ''}, ${invoice.state || ''} ${invoice.pincode || ''}<br>
                    Phone: ${invoice.phone || '-'}<br>
                    Email: ${invoice.email || '-'}
                </div>
            </div>
            <div class="detail-box">
                <div class="detail-title">Invoice Details</div>
                <div class="detail-content">
                    <strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}<br>
                    <strong>Due Date:</strong> ${formatDate(invoice.due_date)}<br>
                    <strong>Status:</strong> <span class="payment-status status-${(invoice.payment_status || 'UNPAID').toLowerCase()}">${invoice.payment_status || 'UNPAID'}</span><br>
                    <strong>Subscription:</strong> ${invoice.plan_name || '-'}
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Subscription Plan: ${invoice.plan_name || '-'}</strong><br>
                        <small>Validity: ${formatDate(invoice.start_date)} to ${formatDate(invoice.end_date)}</small>
                    </td>
                    <td style="text-align: right;">₹${(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-box">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${(invoice.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Tax Amount</span>
                    <span>₹${(invoice.tax_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Discount</span>
                    <span>-₹${(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Total Amount</span>
                    <span>₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        ${invoice.payments && invoice.payments.length > 0 ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ddd;">
                <h3 style="margin-bottom: 15px; font-size: 16px;">Payment History</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Mode</th>
                            <th>Reference</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.payments.map(p => `
                            <tr>
                                <td>${formatDate(p.payment_date)}</td>
                                <td>${p.payment_mode}</td>
                                <td>${p.transaction_no || '-'}</td>
                                <td style="text-align: right;">₹${(p.amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated on: ${printDate}</p>
            <p style="margin-top: 5px;">Thank you for your business!</p>
            <p style="margin-top: 10px; font-size: 11px; color: #999;">This is a computer-generated document. No signature required.</p>
        </div>
    </div>
    
    <script>
        function downloadPDF() {
            window.print();
        }
        // Auto-trigger print dialog
        setTimeout(function() { window.print(); }, 500);
    <\/script>
</body>
</html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    /**
     * Print invoice
     */
    function printInvoice(invoice) {
        if (!invoice) {
            showErrorToast('No invoice data available');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printDate = new Date().toLocaleString('en-IN');

        const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoice.invoice_number || 'N/A'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
        .invoice-header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-logo { font-size: 36px; color: #6366f1; margin-bottom: 10px; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #333; }
        .invoice-number { font-size: 16px; color: #666; margin-top: 5px; font-family: monospace; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .detail-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .detail-title { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 10px; }
        .detail-content { font-size: 14px; line-height: 1.8; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #6366f1; color: white; padding: 12px; text-align: left; font-size: 13px; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .totals-box { width: 300px; background: #f8f9fa; border-radius: 8px; overflow: hidden; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #ddd; font-size: 14px; }
        .total-row:last-child { border-bottom: none; background: #6366f1; color: white; font-weight: 700; font-size: 16px; }
        .payment-status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
        .status-paid { background: #10b981; color: white; }
        .status-unpaid { background: #ef4444; color: white; }
        .status-partial { background: #f59e0b; color: white; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Print</button>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="invoice-logo">✂️ SAM Salon</div>
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="invoice-number">${invoice.invoice_number || ''}</div>
        </div>

        <div class="invoice-details">
            <div class="detail-box">
                <div class="detail-title">Bill To</div>
                <div class="detail-content">
                    <strong>${invoice.salon_name || 'Unknown Salon'}</strong><br>
                    ${invoice.address || ''}<br>
                    ${invoice.city || ''}, ${invoice.state || ''} ${invoice.pincode || ''}<br>
                    Phone: ${invoice.phone || '-'}<br>
                    Email: ${invoice.email || '-'}
                </div>
            </div>
            <div class="detail-box">
                <div class="detail-title">Invoice Details</div>
                <div class="detail-content">
                    <strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}<br>
                    <strong>Due Date:</strong> ${formatDate(invoice.due_date)}<br>
                    <strong>Status:</strong> <span class="payment-status status-${(invoice.payment_status || 'UNPAID').toLowerCase()}">${invoice.payment_status || 'UNPAID'}</span><br>
                    <strong>Subscription:</strong> ${invoice.plan_name || '-'}
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Subscription Plan: ${invoice.plan_name || '-'}</strong><br>
                        <small>Validity: ${formatDate(invoice.start_date)} to ${formatDate(invoice.end_date)}</small>
                    </td>
                    <td style="text-align: right;">₹${(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-box">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${(invoice.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Tax Amount</span>
                    <span>₹${(invoice.tax_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Discount</span>
                    <span>-₹${(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                    <span>Total Amount</span>
                    <span>₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        ${invoice.payments && invoice.payments.length > 0 ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ddd;">
                <h3 style="margin-bottom: 15px; font-size: 16px;">Payment History</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Mode</th>
                            <th>Reference</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.payments.map(p => `
                            <tr>
                                <td>${formatDate(p.payment_date)}</td>
                                <td>${p.payment_mode}</td>
                                <td>${p.transaction_no || '-'}</td>
                                <td style="text-align: right;">₹${(p.amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        <div class="footer">
            <p>Printed on: ${printDate}</p>
            <p style="margin-top: 5px;">Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Auto-print after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    /**
     * Download payment receipt
     */
    function downloadPaymentReceipt(invoice, payment) {
        if (!invoice || !payment) {
            showErrorToast('Invoice and payment data required');
            return;
        }

        const printWindow = window.open('', '_blank');
        const receiptDate = new Date().toLocaleString('en-IN');
        const receiptNumber = 'RCPT-' + invoice.invoice_number + '-' + payment.payment_salon_id;

        const receiptContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${receiptNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
        .receipt-container { max-width: 600px; margin: 0 auto; border: 2px solid #10b981; padding: 30px; border-radius: 10px; }
        .receipt-header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .receipt-logo { font-size: 32px; color: #10b981; margin-bottom: 10px; }
        .receipt-title { font-size: 24px; font-weight: 700; color: #333; }
        .receipt-number { font-size: 14px; color: #666; margin-top: 5px; font-family: monospace; }
        .receipt-details { margin-bottom: 30px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .amount-section { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .amount-label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
        .amount-value { font-size: 36px; font-weight: 800; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Print</button>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="receipt-logo">✓</div>
            <h1 class="receipt-title">PAYMENT RECEIPT</div>
            <div class="receipt-number">${receiptNumber}</div>
        </div>

        <div class="receipt-details">
            <div class="detail-row">
                <span class="detail-label">Received From:</span>
                <span class="detail-value">${invoice.salon_name || 'Unknown Salon'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">${invoice.invoice_number || ''}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${formatDate(payment.payment_date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Mode:</span>
                <span class="detail-value">${payment.payment_mode}</span>
            </div>
            ${payment.transaction_no ? `
            <div class="detail-row">
                <span class="detail-label">Transaction Reference:</span>
                <span class="detail-value">${payment.transaction_no}</span>
            </div>
            ` : ''}
        </div>

        <div class="amount-section">
            <div class="amount-label">Amount Received</div>
            <div class="amount-value">₹${(payment.amount || 0).toLocaleString('en-IN')}</div>
        </div>

        <div class="receipt-details">
            <div class="detail-row">
                <span class="detail-label">Invoice Total:</span>
                <span class="detail-value">₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">₹${(invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row" style="border-bottom: none; font-weight: 700; color: #10b981;">
                <span class="detail-label">Balance Due:</span>
                <span class="detail-value">₹${(invoice.total_amount - (invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0)).toLocaleString('en-IN')}</span>
            </div>
        </div>

        <div class="footer">
            <p>Printed on: ${receiptDate}</p>
            <p style="margin-top: 5px;">Thank you for your payment!</p>
        </div>
    </div>
</body>
</html>
        `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    /**
     * Verify and update payment status
     */
    function verifyPaymentStatus(invoice) {
        if (!invoice) return 'UNPAID';

        const totalAmount = parseFloat(invoice.total_amount || 0);
        const totalPaid = invoice.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

        // Allow small floating point differences
        const epsilon = 0.01;

        if (totalPaid >= totalAmount - epsilon) {
            return 'PAID';
        } else if (totalPaid > epsilon) {
            return 'PARTIAL';
        } else {
            return 'UNPAID';
        }
    }

    // Add print button event listener
    setTimeout(() => {
        const printInvoiceBtn = document.getElementById('printInvoiceBtn');
        if (printInvoiceBtn) {
            printInvoiceBtn.addEventListener('click', () => {
                if (currentInvoice) {
                    printInvoice(currentInvoice);
                } else {
                    showErrorToast('No invoice loaded');
                }
            });
        }

        // Add download PDF button event listener
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                if (currentInvoice) {
                    downloadInvoiceAsPdf(currentInvoice);
                } else {
                    showErrorToast('No invoice loaded');
                }
            });
        }

        // Add save payment button
        const savePaymentBtn = document.getElementById('savePaymentBtn');
        if (savePaymentBtn) {
            savePaymentBtn.addEventListener('click', () => {
                paymentForm.dispatchEvent(new Event('submit'));
            });
        }
    }, 500);

    // Search and filter
    invoiceSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allInvoices.filter(inv =>
            inv.invoice_number?.toLowerCase().includes(term) ||
            inv.salon_name?.toLowerCase().includes(term)
        );
        renderInvoicesTable(filtered);
    });

    paymentStatusFilter.addEventListener('change', (e) => {
        fetchInvoices(e.target.value);
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchInvoices(paymentStatusFilter.value);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allInvoices.length / 20);
        if (currentPage < totalPages) {
            currentPage++;
            fetchInvoices(paymentStatusFilter.value);
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === addInvoiceModal) closeGenerateInvoiceModal();
        if (e.target === viewInvoiceModal) closeViewInvoiceModalFunc();
    });

    // Initialize
    fetchInvoices();
    fetchSalons();

    function populateSalonDropdown() {
        if (!invoiceSalonId) return;

        const options = '<option value="">Choose a salon...</option>' +
            availableSalons.filter(s => s.status === 1).map(s =>
                `<option value="${s.salon_id}">${s.salon_name}</option>`
            ).join('');

        invoiceSalonId.innerHTML = options;
    }

    async function loadSalonSubscriptions() {
        const salonId = invoiceSalonId.value;
        if (!salonId) {
            invoiceSubscriptionId.innerHTML = '<option value="">Choose a subscription...</option>';
            return;
        }

        try {
            const response = await apiRequest(`/super-admin/salons/${salonId}/subscriptions`);
            const subscriptions = response.data?.items || [];

            const options = '<option value="">Choose a subscription...</option>' +
                subscriptions.filter(s => s.status === 'ACTIVE').map(s =>
                    `<option value="${s.subscription_id}" data-plan-id="${s.plan_id}" data-salon-id="${s.salon_id}">${s.plan_name || 'Subscription ' + s.subscription_id}</option>`
                ).join('');

            invoiceSubscriptionId.innerHTML = options;
            
            // Show calculate button
            document.getElementById('calculateBillingBtn').style.display = subscriptions.length > 0 ? 'inline-flex' : 'none';
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }

    async function loadSubscriptionDetails() {
        const subscriptionId = invoiceSubscriptionId.value;
        if (!subscriptionId) {
            document.getElementById('subscriptionPlanInfo').textContent = '';
            document.getElementById('calculateBillingBtn').style.display = 'none';
            return;
        }

        try {
            const response = await apiRequest(`/super-admin/subscriptions/${subscriptionId}`);
            const subscription = response.data;

            if (subscription) {
                const planType = subscription.plan_type || 'flat';
                const planName = subscription.plan_name || 'Unknown Plan';
                document.getElementById('subscriptionPlanInfo').textContent = 
                    `Plan: ${planName} | Type: ${planType.replace('-', ' ')} | ${subscription.plan_type === 'flat' ? '₹' + (subscription.flat_price || 0) : 'Calculated from usage'}`;
                document.getElementById('calculateBillingBtn').style.display = 'inline-flex';
                
                // Set default billing month to current month
                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                document.getElementById('billingMonth').value = currentMonth;
            }
        } catch (error) {
            console.error('Error loading subscription details:', error);
        }
    }

    async function calculateBillingFromSubscription() {
        const subscriptionId = invoiceSubscriptionId.value;
        let billingMonth = document.getElementById('billingMonth').value;

        console.log('=== Calculate Billing Clicked ===');
        console.log('Subscription ID:', subscriptionId);
        console.log('Billing Month (before):', billingMonth);

        if (!subscriptionId) {
            showErrorToast('Please select a subscription');
            return;
        }

        try {
            // Show loading
            const calcBtn = document.getElementById('calculateBillingBtn');
            const originalBtnText = calcBtn.innerHTML;
            calcBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...';
            calcBtn.disabled = true;

            // Clear previous warnings
            clearInvoiceExistenceWarning();

            // Get subscription details first to populate month selector
            const subResponse = await apiRequest(`/super-admin/subscriptions/${subscriptionId}`);
            const subscription = subResponse.data;

            console.log('Subscription loaded:', subscription);
            console.log('Start Date:', subscription.start_date);
            console.log('End Date:', subscription.end_date);

            if (!billingMonth) {
                console.log('No billing month selected, auto-populating...');
                // Auto-populate month selector with subscription period months
                const monthSelect = document.getElementById('billingMonth');
                const months = generateBillingMonths(subscription.start_date, subscription.end_date);

                console.log('Generated months:', months);

                if (months.length === 0) {
                    showErrorToast('No valid billing months available for this subscription');
                    calcBtn.innerHTML = originalBtnText;
                    calcBtn.disabled = false;
                    return;
                }

                // Populate dropdown
                monthSelect.innerHTML = months.map(m =>
                    `<option value="${m.value}" ${m.selected ? 'selected' : ''}>${m.label}</option>`
                ).join('');

                // Use current month or first available month
                billingMonth = months.find(m => m.selected)?.value || months[0].value;
                console.log('Selected billing month:', billingMonth);
            }

            // 1. Check for existing invoice FIRST
            const existingInvoice = await checkInvoiceExistence(subscriptionId, billingMonth);

            if (existingInvoice) {
                currentInvoiceCheck = {
                    subscriptionId: subscriptionId,
                    billingMonth: billingMonth,
                    existingInvoice: existingInvoice
                };

                showInvoiceExistenceWarning(existingInvoice);
                calcBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> Calculate';
                calcBtn.disabled = false;
                showErrorToast('Invoice already exists for this billing period');
                return;
            }

            // 2. Get plan details
            const planResponse = await apiRequest(`/subscription-plans/${subscription.plan_id}`);
            const plan = planResponse.data;

            // 3. Get completed appointments for billing month
            const startDate = billingMonth + '-01';
            const endDate = getLastDayOfMonth(billingMonth);
            const appointmentsResponse = await apiRequest(
                `/appointments?start_date=${startDate}&end_date=${endDate}&status=COMPLETED&salon_id=${subscription.salon_id}`
            );
            const appointments = appointmentsResponse.data?.items || [];

            // 4. Calculate billing with proration
            const calculation = calculateBillingWithProration(subscription, plan, appointments, billingMonth);

            // 5. Display calculation
            document.getElementById('calcAppointments').textContent = calculation.usage.total_appointments;
            document.getElementById('calcRevenue').textContent = '₹' + calculation.usage.total_revenue.toLocaleString('en-IN');
            document.getElementById('calcBaseAmount').textContent = '₹' + calculation.calculation.base_amount.toLocaleString('en-IN');
            document.getElementById('calcPerAppointment').textContent = '₹' + calculation.calculation.per_appointment_amount.toLocaleString('en-IN');
            document.getElementById('calcPercentage').textContent = '₹' + calculation.calculation.percentage_amount.toLocaleString('en-IN');
            document.getElementById('calcSubtotal').textContent = '₹' + calculation.calculation.subtotal_amount.toLocaleString('en-IN');
            document.getElementById('calcTax').textContent = '₹' + calculation.calculation.tax_amount.toLocaleString('en-IN');

            // 6. Show proration info if applicable
            const prorationInfo = document.getElementById('calcProrationInfo');
            if (prorationInfo) {
                if (calculation.proration) {
                    prorationInfo.style.display = 'block';
                    prorationInfo.innerHTML = `<i class="fa-solid fa-circle-info"></i> Prorated: ${calculation.proration.days_billed}/${calculation.proration.total_days_in_month} days (₹${calculation.calculation.base_amount.toLocaleString('en-IN')})`;
                } else {
                    prorationInfo.style.display = 'none';
                }
            }

            // 7. Auto-fill invoice fields (locked after calculation)
            document.getElementById('invoiceAmount').value = calculation.calculation.subtotal_amount;
            document.getElementById('invoiceTaxAmount').value = calculation.calculation.tax_amount;

            // 8. Show calculation section
            document.getElementById('billingCalculationSection').style.display = 'block';

            // 9. Update total
            updateInvoiceTotal();

            // 10. Reset button
            calcBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> Calculate';
            calcBtn.disabled = false;

            showSuccess('Billing calculated successfully!' + (calculation.proration ? ' (Prorated for flat plan)' : ''));

        } catch (error) {
            console.error('Error calculating billing:', error);
            showErrorToast('Failed to calculate billing: ' + error.message);
            const calcBtn = document.getElementById('calculateBillingBtn');
            calcBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> Calculate';
            calcBtn.disabled = false;
        }
    }

    // Helper: Get last day of month
    function getLastDayOfMonth(monthStr) {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month, 0).toISOString().split('T')[0];
    }

    // Helper: Calculate subscription billing (same as subscription page)
    function calculateSubscriptionBilling(subscription, plan, appointments, billingMonth) {
        const taxRate = 0.18; // 18% GST

        // Filter appointments for billing month
        const monthAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const aptMonth = aptDate.toISOString().slice(0, 7);
            return aptMonth === billingMonth && apt.status === 'COMPLETED';
        });

        const totalAppointments = monthAppointments.length;
        const totalRevenue = monthAppointments.reduce((sum, apt) => 
            sum + parseFloat(apt.final_amount || 0), 0
        );

        let baseAmount = 0;
        let perAppointmentAmount = 0;
        let percentageAmount = 0;

        // Calculate based on plan type
        if (plan.plan_type === 'flat') {
            baseAmount = parseFloat(plan.flat_price || 0);
        } else if (plan.plan_type === 'per-appointments') {
            perAppointmentAmount = totalAppointments * parseFloat(plan.per_appointments_price || 0);
        } else if (plan.plan_type === 'Percentage-per-appointments') {
            percentageAmount = totalRevenue * (parseFloat(plan.percentage_per_appointment || 0) / 100);
        }

        const subtotalAmount = baseAmount + perAppointmentAmount + percentageAmount;
        const taxAmount = subtotalAmount * taxRate;
        const totalAmount = subtotalAmount + taxAmount;

        return {
            usage: {
                total_appointments: totalAppointments,
                total_revenue: totalRevenue
            },
            calculation: {
                base_amount: Math.round(baseAmount * 100) / 100,
                per_appointment_amount: Math.round(perAppointmentAmount * 100) / 100,
                percentage_amount: Math.round(percentageAmount * 100) / 100,
                subtotal_amount: Math.round(subtotalAmount * 100) / 100,
                tax_rate: 18,
                tax_amount: Math.round(taxAmount * 100) / 100,
                total_amount: Math.round(totalAmount * 100) / 100
            }
        };
    }

    function updateInvoiceTotal() {
        const amount = parseFloat(invoiceAmount.value) || 0;
        const tax = parseFloat(invoiceTaxAmount.value) || 0;
        const discount = parseFloat(invoiceDiscountAmount.value) || 0;
        const total = amount + tax - discount;

        invoiceTotalValue.textContent = total.toLocaleString('en-IN');
    }

    /* =============================================
       PHASE 4: CREATE INVOICE MODAL IMPROVEMENTS
       - Invoice existence check
       - Proration calculation
       - Lock amounts after calculation
       - Appointment verification
       ============================================= */

    // State for invoice existence check
    let currentInvoiceCheck = {
        subscriptionId: null,
        billingMonth: null,
        existingInvoice: null
    };

    /**
     * Check if invoice exists for subscription + billing month
     */
    async function checkInvoiceExistence(subscriptionId, billingMonth) {
        if (!subscriptionId || !billingMonth) {
            return null;
        }

        try {
            const response = await apiRequest(`/super-admin/invoices/salon?subscription_id=${subscriptionId}`);
            
            if (response.status === 'success' && response.data && response.data.items) {
                const invoices = response.data.items;
                
                // Find invoice for this billing month
                const existingInvoice = invoices.find(inv => {
                    if (!inv.invoice_date) return false;
                    const invMonth = inv.invoice_date.substring(0, 7); // YYYY-MM
                    return invMonth === billingMonth;
                });

                return existingInvoice || null;
            }
        } catch (error) {
            console.error('Error checking invoice existence:', error);
        }
        
        return null;
    }

    /**
     * Show invoice existence warning in modal
     */
    function showInvoiceExistenceWarning(invoice) {
        const calcSection = document.getElementById('billingCalculationSection');
        if (!calcSection) return;

        const warningHtml = `
            <div id="invoiceExistenceAlert" style="background: var(--danger-bg); border: 1px solid var(--danger); color: var(--danger); padding: 16px; border-radius: var(--radius-md); margin-top: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 24px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; margin-bottom: 4px;">Invoice Already Exists</div>
                        <div style="font-size: 13px;">
                            Invoice <strong>${escapeHtml(invoice.invoice_number || 'N/A')}</strong> exists for this period.
                            Amount: <strong>₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</strong>
                            Status: <strong>${invoice.payment_status || 'UNPAID'}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing alert if any
        const existingAlert = document.getElementById('invoiceExistenceAlert');
        if (existingAlert) existingAlert.remove();

        // Add warning after calculation section
        calcSection.insertAdjacentHTML('afterend', warningHtml);

        // Disable generate button
        const saveBtn = document.getElementById('saveInvoiceBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Invoice Already Exists';
        }
    }

    /**
     * Clear invoice existence warning
     */
    function clearInvoiceExistenceWarning() {
        const existingAlert = document.getElementById('invoiceExistenceAlert');
        if (existingAlert) existingAlert.remove();

        const saveBtn = document.getElementById('saveInvoiceBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> Generate Invoice';
        }
    }

    /**
     * Calculate billing with proration for flat plans
     */
    function calculateBillingWithProration(subscription, plan, appointments, billingMonth) {
        const taxRate = 0.18; // 18% GST
        
        // Filter appointments for billing month
        const monthAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const aptMonth = aptDate.toISOString().slice(0, 7);
            return aptMonth === billingMonth && apt.status === 'COMPLETED';
        });

        const totalAppointments = monthAppointments.length;
        const totalRevenue = monthAppointments.reduce((sum, apt) =>
            sum + parseFloat(apt.final_amount || 0), 0
        );

        // Get billing period dates
        const [year, month] = billingMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const daysInMonth = monthEnd.getDate();

        // Calculate proration for flat plans
        let proration = null;
        let effectiveFlatPrice = parseFloat(plan.flat_price || 0);
        
        if (plan.plan_type === 'flat') {
            const subStart = new Date(subscription.start_date);
            const subEnd = new Date(subscription.end_date);
            
            // Check if subscription starts mid-month
            if (subStart > monthStart && subStart <= monthEnd) {
                const daysRemaining = Math.ceil((monthEnd - subStart) / (1000 * 60 * 60 * 24)) + 1;
                const daysToBill = Math.min(daysRemaining, daysInMonth);
                effectiveFlatPrice = (parseFloat(plan.flat_price || 0) / daysInMonth) * daysToBill;
                
                proration = {
                    is_prorated: true,
                    days_billed: daysToBill,
                    total_days_in_month: daysInMonth
                };
            }
            // Check if subscription ends mid-month
            else if (subEnd >= monthStart && subEnd < monthEnd) {
                const daysActive = Math.ceil((subEnd - monthStart) / (1000 * 60 * 60 * 24)) + 1;
                effectiveFlatPrice = (parseFloat(plan.flat_price || 0) / daysInMonth) * daysActive;
                
                proration = {
                    is_prorated: true,
                    days_billed: daysActive,
                    total_days_in_month: daysInMonth
                };
            }
        }

        let baseAmount = 0;
        let perAppointmentAmount = 0;
        let percentageAmount = 0;

        // Calculate based on plan type
        if (plan.plan_type === 'flat') {
            baseAmount = effectiveFlatPrice;
        } else if (plan.plan_type === 'per-appointments') {
            perAppointmentAmount = totalAppointments * parseFloat(plan.per_appointments_price || 0);
        } else if (plan.plan_type === 'Percentage-per-appointments') {
            percentageAmount = totalRevenue * (parseFloat(plan.percentage_per_appointment || 0) / 100);
        }

        const subtotalAmount = baseAmount + perAppointmentAmount + percentageAmount;
        const taxAmount = subtotalAmount * taxRate;
        const totalAmount = subtotalAmount + taxAmount;

        return {
            usage: {
                total_appointments: totalAppointments,
                total_revenue: Math.round(totalRevenue * 100) / 100
            },
            proration: proration,
            calculation: {
                base_amount: Math.round(baseAmount * 100) / 100,
                per_appointment_amount: Math.round(perAppointmentAmount * 100) / 100,
                percentage_amount: Math.round(percentageAmount * 100) / 100,
                subtotal_amount: Math.round(subtotalAmount * 100) / 100,
                tax_rate: 18,
                tax_amount: Math.round(taxAmount * 100) / 100,
                total_amount: Math.round(totalAmount * 100) / 100
            }
        };
    }

    /**
     * Generate billing months from subscription start to end date
     */
    function generateBillingMonths(startDate, endDate) {
        const months = [];
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

        let start = new Date(startDate);
        const end = endDate ? new Date(endDate) : today;

        // Start from the first month of subscription
        start.setDate(1);

        for (let d = new Date(start); d <= end && d <= today; d.setMonth(d.getMonth() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const value = `${year}-${month}`;
            const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            const isSelected = value === currentMonth;
            months.push({ value, label, selected: isSelected });
        }

        return months;
    }

    // Make functions globally available for HTML onclick handlers
    window.loadSalonSubscriptions = loadSalonSubscriptions;
    window.loadSubscriptionDetails = loadSubscriptionDetails;

    // Initialize
    fetchInvoices();
    fetchSalons();

    // Logout functionality - SAME AS DASHBOARD
    setTimeout(function() {
        var logoutBtn = document.getElementById('logoutBtn');
        console.log('Invoices - Logout button found:', logoutBtn);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Invoices - Logout clicked');
                // Clear ALL auth data IMMEDIATELY
                localStorage.clear();
                sessionStorage.clear();
                sessionStorage.setItem('justLoggedOut', 'true');
                console.log('Invoices - Storage cleared!');
                // Redirect to login
                window.location.href = 'sa-login.html';
            });
        } else {
            console.error('Invoices - Logout button NOT found!');
        }
    }, 200);
});

// Load user info into sidebar
function loadUserInfo() {
    const user = TokenManager.getUser();
    if (user) {
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) {
            userNameEl.textContent = user.username || user.email || 'Super Admin';
        }
        if (userRoleEl) {
            userRoleEl.textContent = user.role || 'SUPER_ADMIN';
        }
        if (userAvatarEl && user.username) {
            const initials = (user.username || 'SA').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            userAvatarEl.textContent = initials;
        }
    }
}
