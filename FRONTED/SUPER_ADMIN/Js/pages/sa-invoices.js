// INVOICES PAGE - API Integration
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    if (!TokenManager.isAuthenticated() || !TokenManager.hasRole(USER_ROLES.SUPER_ADMIN)) {
        window.location.href = '../../html/super-admin/sa-login.html';
        return;
    }

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
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-file-invoice" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No invoices found
                    </td>
                </tr>
            `;
            return;
        }

        invoiceTableBody.innerHTML = invoices.map(invoice => `
            <tr>
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
                <td class="amount-cell ${invoice.payment_status?.toLowerCase()}">
                    ₹${(invoice.total_amount || 0).toLocaleString('en-IN')}
                </td>
                <td>
                    <span class="payment-badge ${invoice.payment_status?.toLowerCase()}">
                        <span class="dot"></span>
                        ${invoice.payment_status || 'UNPAID'}
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
        `).join('');

        // Add event listeners
        invoiceTableBody.querySelectorAll('.btn-view-invoice').forEach(btn => {
            btn.addEventListener('click', () => viewInvoice(btn.dataset.invoiceId));
        });

        invoiceTableBody.querySelectorAll('.btn-record-payment').forEach(btn => {
            btn.addEventListener('click', () => openRecordPaymentModal(btn.dataset.invoiceId));
        });
    }

    function updateStats(invoices) {
        const stats = {
            unpaid: { count: 0, amount: 0 },
            partial: { count: 0, amount: 0 },
            paid: { count: 0, amount: 0 },
            refunded: { count: 0, amount: 0 }
        };

        invoices.forEach(inv => {
            const status = (inv.payment_status || 'UNPAID').toLowerCase();
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
    }

    async function viewInvoice(invoiceSalonId) {
        const invoice = await fetchInvoiceById(invoiceSalonId);
        if (!invoice) return;

        currentInvoice = invoice;
        renderInvoicePreview(invoice);
        
        // Show payment section if not fully paid
        if (invoice.payment_status !== 'PAID') {
            const outstanding = invoice.total_amount - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
            outstandingAmount.textContent = outstanding.toLocaleString('en-IN');
            document.getElementById('paymentInvoiceSalonId').value = invoice.invoice_salon_id;
            recordPaymentSection.style.display = 'block';
        } else {
            recordPaymentSection.style.display = 'none';
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
                        <strong>Payment Status:</strong> <span class="payment-badge ${invoice.payment_status?.toLowerCase()}">${invoice.payment_status || 'UNPAID'}</span><br>
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
        
        recordPaymentSection.style.display = 'block';
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
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const invoiceSalonId = document.getElementById('paymentInvoiceSalonId').value;
        const paymentData = {
            payment_mode: document.getElementById('paymentMode').value,
            transaction_no: document.getElementById('paymentTransactionNo').value.trim(),
            amount: parseFloat(document.getElementById('paymentAmount').value),
            payment_date: document.getElementById('paymentDate').value || new Date().toISOString().split('T')[0]
        };

        const success = await recordPayment(invoiceSalonId, paymentData);
        if (success) {
            closeViewInvoiceModalFunc();
            fetchInvoices();
        }
    });

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

    // --- HELPER FUNCTIONS ---

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
        const billingMonth = document.getElementById('billingMonth').value;

        if (!subscriptionId || !billingMonth) {
            showErrorToast('Please select subscription and billing month');
            return;
        }

        try {
            // Show loading
            document.getElementById('calculateBillingBtn').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Calculating...';

            // 1. Get subscription details
            const subResponse = await apiRequest(`/super-admin/subscriptions/${subscriptionId}`);
            const subscription = subResponse.data;

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

            // 4. Calculate billing based on plan type
            const calculation = calculateSubscriptionBilling(subscription, plan, appointments, billingMonth);

            // 5. Display calculation
            document.getElementById('calcAppointments').textContent = calculation.usage.total_appointments;
            document.getElementById('calcRevenue').textContent = '₹' + calculation.usage.total_revenue.toLocaleString('en-IN');
            document.getElementById('calcBaseAmount').textContent = '₹' + calculation.calculation.base_amount.toLocaleString('en-IN');
            document.getElementById('calcPerAppointment').textContent = '₹' + calculation.calculation.per_appointment_amount.toLocaleString('en-IN');
            document.getElementById('calcPercentage').textContent = '₹' + calculation.calculation.percentage_amount.toLocaleString('en-IN');
            document.getElementById('calcSubtotal').textContent = '₹' + calculation.calculation.subtotal_amount.toLocaleString('en-IN');
            document.getElementById('calcTax').textContent = '₹' + calculation.calculation.tax_amount.toLocaleString('en-IN');

            // 6. Auto-fill invoice fields
            document.getElementById('invoiceAmount').value = calculation.calculation.subtotal_amount;
            document.getElementById('invoiceTaxAmount').value = calculation.calculation.tax_amount;
            
            // Show calculation section
            document.getElementById('billingCalculationSection').style.display = 'block';

            // Update total
            updateInvoiceTotal();

            // Reset button
            document.getElementById('calculateBillingBtn').innerHTML = '<i class="fa-solid fa-calculator"></i> Calculate';

            showSuccess('Billing calculated successfully!');
        } catch (error) {
            console.error('Error calculating billing:', error);
            showErrorToast('Failed to calculate billing: ' + error.message);
            document.getElementById('calculateBillingBtn').innerHTML = '<i class="fa-solid fa-calculator"></i> Calculate';
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
