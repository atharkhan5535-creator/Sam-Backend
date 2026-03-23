/**
 * =============================================================================
 * SAM SUPER ADMIN - SUBSCRIPTION MANAGEMENT PAGE
 * Complete redesign based on API documentation
 * =============================================================================
 * 
 * APIs Used:
 * - GET    /subscription-plans                          - List all plans
 * - POST   /subscription-plans                          - Create plan
 * - PUT    /subscription-plans/{plan_id}                - Update plan
 * - PATCH  /subscription-plans/{plan_id}/status         - Toggle plan status
 * - GET    /super-admin/salons                          - List all salons
 * - GET    /super-admin/salons/{salon_id}/subscriptions - List salon subscriptions
 * - POST   /super-admin/salons/{salon_id}/subscriptions - Assign subscription
 * - PUT    /super-admin/subscriptions/{subscription_id} - Update subscription
 * - PATCH  /super-admin/subscriptions/{subscription_id}/cancel - Cancel subscription
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== SUBSCRIPTION MANAGEMENT PAGE INITIALIZED ===');
    console.log('Screen size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Device pixel ratio:', window.devicePixelRatio);
    
    // Check if dependencies are loaded
    if (typeof TokenManager === 'undefined') {
        console.error('❌ TokenManager is not defined! Check if api.js is loaded.');
        showErrorToast('Configuration error: TokenManager not found');
        return;
    }
    
    if (typeof USER_ROLES === 'undefined') {
        console.error('❌ USER_ROLES is not defined! Check if api.js is loaded.');
        showErrorToast('Configuration error: USER_ROLES not found');
        return;
    }
    
    if (typeof apiRequest === 'undefined') {
        console.error('❌ apiRequest is not defined! Check if api.js is loaded.');
        showErrorToast('Configuration error: apiRequest not found');
        return;
    }
    
    if (typeof API_ENDPOINTS === 'undefined') {
        console.error('❌ API_ENDPOINTS is not defined! Check if config.js is loaded.');
        showErrorToast('Configuration error: API_ENDPOINTS not found');
        return;
    }
    
    console.log('✓ All dependencies loaded successfully');
    console.log('  - TokenManager:', typeof TokenManager);
    console.log('  - USER_ROLES:', typeof USER_ROLES);
    console.log('  - apiRequest:', typeof apiRequest);
    console.log('  - API_ENDPOINTS:', typeof API_ENDPOINTS);

    // =============================================
    // AUTHENTICATION CHECK
    // =============================================
    console.log('Checking authentication...');
    console.log('  - isAuthenticated:', TokenManager.isAuthenticated());
    console.log('  - hasRole SUPER_ADMIN:', TokenManager.hasRole(USER_ROLES.SUPER_ADMIN));
    
    if (!TokenManager.isAuthenticated() || !TokenManager.hasRole(USER_ROLES.SUPER_ADMIN)) {
        console.warn('User not authenticated or not SUPER_ADMIN, redirecting to login');
        window.location.href = '../../html/super-admin/sa-login.html';
        return;
    }
    
    console.log('✓ Authentication check passed');

    // =============================================
    // DOM ELEMENTS
    // =============================================
    // Stats elements
    const statActive = document.getElementById('statActive');
    const statPlans = document.getElementById('statPlans');
    const statExpiring = document.getElementById('statExpiring');
    const statSalons = document.getElementById('statSalons');

    // Plans elements
    const plansGrid = document.getElementById('plansGrid');
    const createPlanBtn = document.getElementById('createPlanBtn');
    const planModal = document.getElementById('planModal');
    const planForm = document.getElementById('planForm');
    const closePlanModal = document.getElementById('closePlanModal');
    const cancelPlanBtn = document.getElementById('cancelPlanBtn');
    const planModalTitle = document.getElementById('planModalTitle');
    const planType = document.getElementById('planType');
    const flatPriceField = document.getElementById('flatPriceField');
    const perAppointmentPriceField = document.getElementById('perAppointmentPriceField');
    const percentagePerAppointmentField = document.getElementById('percentagePerAppointmentField');

    // Subscriptions elements
    const subscriptionsTableBody = document.getElementById('subscriptionsTableBody');
    const assignSubscriptionBtn = document.getElementById('assignSubscriptionBtn');
    const assignModal = document.getElementById('assignModal');
    const assignForm = document.getElementById('assignForm');
    const closeAssignModal = document.getElementById('closeAssignModal');
    const cancelAssignBtn = document.getElementById('cancelAssignBtn');
    const searchSubscriptions = document.getElementById('searchSubscriptions');
    const filterStatus = document.getElementById('filterStatus');
    const subscriptionSummary = document.getElementById('subscriptionSummary');
    const endDateDisplay = document.getElementById('endDateDisplay');

    // View/Edit modals
    const viewModal = document.getElementById('viewModal');
    const closeViewModal = document.getElementById('closeViewModal');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const viewSubscriptionContent = document.getElementById('viewSubscriptionContent');
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editSubscriptionForm = document.getElementById('editSubscriptionForm');

    // User info elements
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    // =============================================
    // STATE MANAGEMENT
    // =============================================
    let state = {
        plans: [],
        salons: [],
        subscriptions: [],
        editingPlanId: null,
        editingSubscriptionId: null
    };

    // =============================================
    // INITIALIZATION
    // =============================================
    console.log('=== SUBSCRIPTION MANAGEMENT PAGE INITIALIZED ===');
    
    // Initialize page when DOM is ready
    initializePage();

    async function initializePage() {
        try {
            loadUserInfo();
            populateBillingMonthSelector();
            await loadData();
            setupEventListeners();
            console.log('✓ Page initialization complete');
        } catch (error) {
            console.error('Error during initialization:', error);
            showErrorToast('Failed to initialize page');
        }
    }

    function loadUserInfo() {
        const user = TokenManager.getUser();
        if (user) {
            const initials = getInitials(user.username || 'Super Admin');
            if (userAvatar) userAvatar.textContent = initials;
            if (userName) userName.textContent = user.username || 'Super Admin';
            const userRoleEl = document.querySelector('.user-role');
            if (userRoleEl) {
                userRoleEl.textContent = user.role || 'SUPER_ADMIN';
            }
        }
    }

    async function loadData() {
        console.log('Loading data...');
        showLoadingState();
        
        try {
            await Promise.all([
                fetchPlans(),
                fetchSalons(),
                fetchSubscriptions()
            ]);
            updateStats();
            console.log('✓ All data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
            showErrorToast('Failed to load data');
        } finally {
            hideLoadingState();
        }
    }

    // =============================================
    // API FUNCTIONS
    // =============================================

    /**
     * Fetch all subscription plans
     * GET /subscription-plans
     */
    async function fetchPlans() {
        console.log('Fetching plans...');
        try {
            console.log('API Endpoint:', API_ENDPOINTS.PLANS.LIST);
            const response = await apiRequest(API_ENDPOINTS.PLANS.LIST);
            console.log('Plans response:', response);
            
            if (response.status === 'success') {
                state.plans = response.data.items || [];
                console.log(`✓ Loaded ${state.plans.length} plans`);
                renderPlans();
                populatePlanDropdowns();
            } else {
                console.error('Failed to fetch plans:', response);
                showErrorToast('Failed to load subscription plans');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            showErrorToast(error.message || 'Network error');
        }
    }

    /**
     * Fetch all salons
     * GET /super-admin/salons
     */
    async function fetchSalons() {
        console.log('Fetching salons...');
        try {
            console.log('API Endpoint:', API_ENDPOINTS.SALONS.LIST);
            const response = await apiRequest(API_ENDPOINTS.SALONS.LIST);
            console.log('Salons response:', response);
            
            if (response.status === 'success') {
                state.salons = response.data.items || [];
                console.log(`✓ Loaded ${state.salons.length} salons`);
                populateSalonDropdown();
            } else {
                console.error('Failed to fetch salons:', response);
                showErrorToast('Failed to load salons');
            }
        } catch (error) {
            console.error('Error fetching salons:', error);
        }
    }

    /**
     * Fetch all subscriptions for all salons
     * GET /super-admin/subscriptions (NEW - Lists all subscriptions across all salons)
     */
    async function fetchSubscriptions() {
        console.log('Fetching all subscriptions...');
        try {
            // Use the new LIST_ALL endpoint that gets all subscriptions at once
            const response = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.LIST_ALL);
            console.log('All subscriptions response:', response);
            
            if (response.status === 'success' && response.data && response.data.items) {
                state.subscriptions = response.data.items || [];
                console.log(`✓ Total subscriptions loaded: ${state.subscriptions.length}`);
                renderSubscriptions();
            } else {
                console.warn('No subscriptions data in response');
                state.subscriptions = [];
                renderSubscriptions();
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            showErrorToast('Failed to load subscriptions');
            state.subscriptions = [];
            renderSubscriptions();
        }
    }

    /**
     * Create subscription plan
     * POST /subscription-plans
     */
    async function createPlan(planData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.PLANS.CREATE, {
                method: 'POST',
                body: JSON.stringify(planData)
            });

            if (response.status === 'success') {
                showSuccess('Subscription plan created successfully');
                return true;
            } else {
                showErrorToast(response.message || 'Failed to create plan');
                return false;
            }
        } catch (error) {
            console.error('Error creating plan:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    /**
     * Update subscription plan
     * PUT /subscription-plans/{plan_id}
     */
    async function updatePlan(planId, planData) {
        try {
            const response = await apiRequest(API_ENDPOINTS.PLANS.UPDATE(planId), {
                method: 'PUT',
                body: JSON.stringify(planData)
            });

            if (response.status === 'success') {
                showSuccess('Plan updated successfully');
                return true;
            } else {
                showErrorToast(response.message || 'Failed to update plan');
                return false;
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    /**
     * Toggle plan status
     * PATCH /subscription-plans/{plan_id}/status
     */
    async function togglePlanStatus(planId, status) {
        try {
            const response = await apiRequest(API_ENDPOINTS.PLANS.TOGGLE_STATUS(planId), {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });

            if (response.status === 'success') {
                showSuccess(`Plan ${status === 1 ? 'activated' : 'deactivated'} successfully`);
                return true;
            } else {
                showErrorToast(response.message || 'Failed to update status');
                return false;
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    /**
     * Assign subscription to salon
     * POST /super-admin/salons/{salon_id}/subscriptions
     * Note: end_date is auto-calculated by backend from plan duration
     */
    async function assignSubscription(salonId, data) {
        try {
            console.log('Assigning subscription to salon:', salonId, data);
            const response = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.ASSIGN(salonId), {
                method: 'POST',
                body: JSON.stringify({
                    plan_id: data.plan_id,
                    start_date: data.start_date,
                    status: data.status || 'ACTIVE'
                })
            });

            if (response.status === 'success') {
                showSuccess('Subscription assigned successfully');
                console.log('Assignment response:', response.data);
                return true;
            } else {
                showErrorToast(response.message || 'Failed to assign subscription');
                return false;
            }
        } catch (error) {
            console.error('Error assigning subscription:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    /**
     * Update subscription
     * PUT /super-admin/subscriptions/{subscription_id}
     */
    async function updateSubscription(subscriptionId, data) {
        try {
            console.log('Updating subscription:', subscriptionId, data);
            const response = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(subscriptionId), {
                method: 'PUT',
                body: JSON.stringify({
                    plan_id: data.plan_id,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    status: data.status
                })
            });

            if (response.status === 'success') {
                showSuccess('Subscription updated successfully');
                return true;
            } else {
                showErrorToast(response.message || 'Failed to update subscription');
                return false;
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    /**
     * Cancel subscription
     * PATCH /super-admin/subscriptions/{subscription_id}/cancel
     */
    async function cancelSubscription(subscriptionId) {
        try {
            const response = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(subscriptionId), {
                method: 'PATCH'
            });

            if (response.status === 'success') {
                showSuccess('Subscription cancelled successfully');
                return true;
            } else {
                showErrorToast(response.message || 'Failed to cancel subscription');
                return false;
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            showErrorToast(error.message || 'Network error');
            return false;
        }
    }

    // =============================================
    // RENDER FUNCTIONS
    // =============================================

    function renderPlans() {
        if (!plansGrid) return;

        if (state.plans.length === 0) {
            plansGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-crown"></i>
                    <p>No subscription plans found. Create your first plan!</p>
                </div>
            `;
            return;
        }

        plansGrid.innerHTML = state.plans.map(plan => {
            const priceDisplay = getPriceDisplay(plan);
            const isFeatured = plan.plan_type === 'flat' && plan.flat_price > 40000;
            const isActive = plan.status === 1;

            return `
                <div class="plan-card ${isFeatured ? 'featured' : ''} ${!isActive ? 'inactive' : ''}">
                    ${!isActive ? '<span class="plan-badge inactive">Inactive</span>' : ''}
                    ${isFeatured && isActive ? '<span class="plan-badge popular">Popular</span>' : ''}
                    
                    <div class="plan-header">
                        <div class="plan-name">${escapeHtml(plan.plan_name)}</div>
                        <div class="plan-price">
                            ${priceDisplay.price}
                            <span class="plan-price-period">${priceDisplay.period}</span>
                        </div>
                    </div>
                    
                    <ul class="plan-features">
                        <li>
                            <i class="fa-solid fa-calendar"></i>
                            ${plan.duration_days} days validity
                        </li>
                        <li>
                            <i class="fa-solid fa-tag"></i>
                            ${getPlanTypeLabel(plan.plan_type)}
                        </li>
                        <li>
                            <i class="fa-solid fa-check"></i>
                            Unlimited appointments
                        </li>
                        <li>
                            <i class="fa-solid fa-headset"></i>
                            24/7 support
                        </li>
                    </ul>
                    
                    <div class="plan-actions">
                        <button class="btn btn-primary btn-assign-plan" data-plan-id="${plan.plan_id}" ${!isActive ? 'disabled' : ''}>
                            <i class="fa-solid fa-plus"></i> Assign
                        </button>
                        <button class="btn btn-secondary btn-edit-plan" data-plan-id="${plan.plan_id}">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners using event delegation
        if (plansGrid) {
            plansGrid.addEventListener('click', (e) => {
                const assignBtn = e.target.closest('.btn-assign-plan');
                if (assignBtn) {
                    openAssignModal(assignBtn.dataset.planId);
                }
                
                const editBtn = e.target.closest('.btn-edit-plan');
                if (editBtn) {
                    openEditPlanModal(editBtn.dataset.planId);
                }
            });
        }
    }

    function renderSubscriptions() {
        if (!subscriptionsTableBody) return;

        const filtered = getFilteredSubscriptions();

        if (filtered.length === 0) {
            subscriptionsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fa-solid fa-crown"></i>
                        <p>No subscriptions found</p>
                    </td>
                </tr>
            `;
            return;
        }

        subscriptionsTableBody.innerHTML = filtered.map(sub => {
            const plan = state.plans.find(p => p.plan_id == sub.plan_id);
            const price = plan ? getPriceDisplay(plan).price : '-';
            const planTypeClass = plan ? getPlanTypeClass(plan.plan_type) : 'flat';

            return `
                <tr>
                    <td>
                        <div class="salon-cell">
                            <div class="salon-avatar">${getInitials(sub.salon_name || 'S')}</div>
                            <div class="salon-details">
                                <div class="salon-name">${escapeHtml(sub.salon_name || 'Unknown')}</div>
                                <div class="salon-id">ID: ${sub.salon_id}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="plan-type-badge ${planTypeClass}">
                            <i class="fa-solid fa-crown"></i>
                            ${plan ? getPlanTypeLabel(plan.plan_type) : 'Unknown'}
                        </span>
                    </td>
                    <td>${formatDate(sub.start_date)}</td>
                    <td>${formatDate(sub.end_date)}</td>
                    <td><strong>${price}</strong></td>
                    <td>
                        <span class="status-pill ${sub.status.toLowerCase()}">
                            <i class="fa-solid fa-circle" style="font-size: 6px;"></i>
                            ${sub.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-billing" data-subscription-id="${sub.subscription_id}" title="Calculate Billing" style="background: var(--info-bg); color: var(--info);">
                                <i class="fa-solid fa-calculator"></i>
                            </button>
                            <button class="btn-icon btn-view" data-subscription-id="${sub.subscription_id}" title="View">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-edit" data-subscription-id="${sub.subscription_id}" title="Edit">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-icon danger btn-cancel" data-subscription-id="${sub.subscription_id}" title="Cancel" ${sub.status === 'CANCELLED' ? 'disabled' : ''}>
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners using event delegation
        if (subscriptionsTableBody) {
            subscriptionsTableBody.addEventListener('click', (e) => {
                const billingBtn = e.target.closest('.btn-billing');
                if (billingBtn) {
                    openBillingPreview(billingBtn.dataset.subscriptionId);
                }

                const viewBtn = e.target.closest('.btn-view');
                if (viewBtn) {
                    viewSubscription(viewBtn.dataset.subscriptionId);
                }

                const editBtn = e.target.closest('.btn-edit');
                if (editBtn) {
                    openEditSubscriptionModal(editBtn.dataset.subscriptionId);
                }

                const cancelBtn = e.target.closest('.btn-cancel');
                if (cancelBtn) {
                    handleCancelSubscription(cancelBtn.dataset.subscriptionId);
                }
            });
        }
    }

    function updateStats() {
        const active = state.subscriptions.filter(s => s.status === 'ACTIVE').length;
        const expiring = state.subscriptions.filter(s => {
            if (s.status !== 'ACTIVE' || !s.end_date) return false;
            const endDate = new Date(s.end_date);
            const now = new Date();
            const daysUntilExpiry = (endDate - now) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }).length;

        if (statActive) statActive.textContent = active;
        if (statPlans) statPlans.textContent = state.plans.length;
        if (statExpiring) statExpiring.textContent = expiring;
        if (statSalons) statSalons.textContent = state.salons.length;
    }

    // =============================================
    // MODAL FUNCTIONS
    // =============================================

    function openCreatePlanModal() {
        state.editingPlanId = null;
        planModalTitle.textContent = 'Create Subscription Plan';
        planForm.reset();
        updatePriceFields();
        planModal.classList.add('active');
    }

    function openEditPlanModal(planId) {
        const plan = state.plans.find(p => p.plan_id == planId);
        if (!plan) return;

        state.editingPlanId = planId;
        planModalTitle.textContent = 'Edit Subscription Plan';

        document.getElementById('planName').value = plan.plan_name;
        document.getElementById('planDuration').value = plan.duration_days;
        document.getElementById('planStatus').value = plan.status;
        document.getElementById('planType').value = plan.plan_type;

        if (plan.flat_price) document.getElementById('flatPrice').value = plan.flat_price;
        if (plan.per_appointments_price) document.getElementById('perAppointmentPrice').value = plan.per_appointments_price;
        if (plan.percentage_per_appointment) document.getElementById('percentagePerAppointment').value = plan.percentage_per_appointment;

        updatePriceFields();
        planModal.classList.add('active');
    }

    function closePlanModalFunc() {
        planModal.classList.remove('active');
        planForm.reset();
        state.editingPlanId = null;
    }

    function openAssignModal(planId = '') {
        assignForm.reset();
        state.editingSubscriptionId = null;

        if (planId) {
            document.getElementById('assignPlan').value = planId;
        }

        updateSubscriptionSummary();
        assignModal.classList.add('active');
    }

    function closeAssignModalFunc() {
        assignModal.classList.remove('active');
        assignForm.reset();
        state.editingSubscriptionId = null;
    }

    function viewSubscription(subscriptionId) {
        const sub = state.subscriptions.find(s => s.subscription_id == subscriptionId);
        if (!sub) return;

        const plan = state.plans.find(p => p.plan_id == sub.plan_id);
        const price = plan ? getPriceDisplay(plan).price : '-';

        viewSubscriptionContent.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: grid; gap: 16px; margin-bottom: 24px;">
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Salon</div>
                        <div style="font-size: 16px; font-weight: 600;">${escapeHtml(sub.salon_name || 'Unknown')} (ID: ${sub.salon_id})</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Plan</div>
                        <div style="font-size: 16px; font-weight: 600;">${plan ? escapeHtml(plan.plan_name) : 'Unknown'} - ${price}</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Start Date</div>
                            <div style="font-size: 14px;">${formatDate(sub.start_date)}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">End Date</div>
                            <div style="font-size: 14px;">${formatDate(sub.end_date)}</div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Status</div>
                        <span class="status-pill ${sub.status.toLowerCase()}" style="margin-top: 4px; display: inline-flex;">${sub.status}</span>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Created At</div>
                        <div style="font-size: 14px;">${formatDateTime(sub.created_at)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Updated At</div>
                        <div style="font-size: 14px;">${formatDateTime(sub.updated_at)}</div>
                    </div>
                </div>
            </div>
        `;

        viewModal.classList.add('active');
    }

    function openEditSubscriptionModal(subscriptionId) {
        const sub = state.subscriptions.find(s => s.subscription_id == subscriptionId);
        if (!sub) return;

        state.editingSubscriptionId = subscriptionId;

        document.getElementById('editSubscriptionId').value = subscriptionId;
        document.getElementById('editSalonDisplay').value = `${sub.salon_name} (ID: ${sub.salon_id})`;
        document.getElementById('editStartDate').value = sub.start_date;
        document.getElementById('editEndDate').value = sub.end_date;
        document.getElementById('editStatus').value = sub.status;

        // Populate plan dropdown
        const planSelect = document.getElementById('editPlan');
        planSelect.innerHTML = '<option value="">Choose a plan...</option>' +
            state.plans.filter(p => p.status === 1).map(p =>
                `<option value="${p.plan_id}">${p.plan_name} - ${getPriceDisplay(p).price}</option>`
            ).join('');

        // Set current plan
        if (sub.plan_id) {
            planSelect.value = sub.plan_id;
        }

        editModal.classList.add('active');
    }

    function closeEditModalFunc() {
        editModal.classList.remove('active');
        editSubscriptionForm.reset();
        state.editingSubscriptionId = null;
    }

    // =============================================
    // EVENT HANDLERS
    // =============================================

    function setupEventListeners() {
        // Plan modal
        if (createPlanBtn) createPlanBtn.addEventListener('click', openCreatePlanModal);
        if (closePlanModal) closePlanModal.addEventListener('click', closePlanModalFunc);
        if (cancelPlanBtn) cancelPlanBtn.addEventListener('click', closePlanModalFunc);
        if (planType) planType.addEventListener('change', updatePriceFields);
        if (planForm) planForm.addEventListener('submit', handlePlanSubmit);

        // Assign modal
        if (assignSubscriptionBtn) assignSubscriptionBtn.addEventListener('click', openAssignModal);
        if (closeAssignModal) closeAssignModal.addEventListener('click', closeAssignModalFunc);
        if (cancelAssignBtn) cancelAssignBtn.addEventListener('click', closeAssignModalFunc);
        
        const assignPlanEl = document.getElementById('assignPlan');
        if (assignPlanEl) assignPlanEl.addEventListener('change', updateSubscriptionSummary);
        
        const assignStartDateEl = document.getElementById('assignStartDate');
        if (assignStartDateEl) assignStartDateEl.addEventListener('input', updateSubscriptionSummary);
        
        if (assignForm) assignForm.addEventListener('submit', handleAssignSubmit);

        // View modal
        if (closeViewModal) closeViewModal.addEventListener('click', () => viewModal.classList.remove('active'));
        if (closeViewBtn) closeViewBtn.addEventListener('click', () => viewModal.classList.remove('active'));

        // Edit modal
        if (closeEditModal) closeEditModal.addEventListener('click', closeEditModalFunc);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModalFunc);
        if (editSubscriptionForm) editSubscriptionForm.addEventListener('submit', handleEditSubmit);

        // Filters
        if (searchSubscriptions) searchSubscriptions.addEventListener('input', renderSubscriptions);
        if (filterStatus) filterStatus.addEventListener('change', renderSubscriptions);

        // Close modals on overlay click
        window.addEventListener('click', (e) => {
            if (e.target === planModal) closePlanModalFunc();
            if (e.target === assignModal) closeAssignModalFunc();
            if (e.target === viewModal) viewModal.classList.remove('active');
            if (e.target === editModal) closeEditModalFunc();
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    async function handlePlanSubmit(e) {
        e.preventDefault();

        const planTypeValue = document.getElementById('planType').value;
        
        // Validate price fields based on plan type
        if (planTypeValue === 'flat') {
            const flatPrice = parseFloat(document.getElementById('flatPrice').value);
            if (isNaN(flatPrice) || flatPrice <= 0) {
                showErrorToast('Please enter a valid flat price (must be greater than 0)');
                return;
            }
        } else if (planTypeValue === 'per-appointments') {
            const perAppointmentPrice = parseFloat(document.getElementById('perAppointmentPrice').value);
            if (isNaN(perAppointmentPrice) || perAppointmentPrice <= 0) {
                showErrorToast('Please enter a valid price per appointment (must be greater than 0)');
                return;
            }
        } else if (planTypeValue === 'Percentage-per-appointments') {
            const percentage = parseFloat(document.getElementById('percentagePerAppointment').value);
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
                showErrorToast('Please enter a valid percentage (1-100)');
                return;
            }
        }

        const planData = {
            plan_name: document.getElementById('planName').value.trim(),
            duration_days: parseInt(document.getElementById('planDuration').value),
            status: parseInt(document.getElementById('planStatus').value),
            plan_type: planTypeValue,
            // Set ALL price fields - null for unused ones
            flat_price: null,
            per_appointments_price: null,
            percentage_per_appointment: null
        };

        // Set only the relevant price field based on plan type
        if (planTypeValue === 'flat') {
            planData.flat_price = parseFloat(document.getElementById('flatPrice').value);
        } else if (planTypeValue === 'per-appointments') {
            planData.per_appointments_price = parseFloat(document.getElementById('perAppointmentPrice').value);
        } else if (planTypeValue === 'Percentage-per-appointments') {
            planData.percentage_per_appointment = parseFloat(document.getElementById('percentagePerAppointment').value);
        }

        let success;
        if (state.editingPlanId) {
            success = await updatePlan(state.editingPlanId, planData);
        } else {
            success = await createPlan(planData);
        }

        if (success) {
            closePlanModalFunc();
            await fetchPlans();
            updateStats();
        }
    }

    async function handleAssignSubmit(e) {
        e.preventDefault();

        const salonId = parseInt(document.getElementById('assignSalon').value);
        const planId = parseInt(document.getElementById('assignPlan').value);
        const startDate = document.getElementById('assignStartDate').value;
        const status = document.getElementById('assignStatus').value;

        // Note: end_date is auto-calculated by backend from plan duration
        const data = {
            plan_id: planId,
            start_date: startDate,
            status: status
        };

        console.log('Assigning subscription:', data);
        const success = await assignSubscription(salonId, data);
        if (success) {
            closeAssignModalFunc();
            await fetchSubscriptions();
            updateStats();
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();

        const subscriptionId = document.getElementById('editSubscriptionId').value;
        const data = {
            plan_id: parseInt(document.getElementById('editPlan').value),
            start_date: document.getElementById('editStartDate').value,
            end_date: document.getElementById('editEndDate').value,
            status: document.getElementById('editStatus').value
        };

        const success = await updateSubscription(subscriptionId, data);
        if (success) {
            closeEditModalFunc();
            await fetchSubscriptions();
            updateStats();
        }
    }

    async function handleCancelSubscription(subscriptionId) {
        const confirmed = await showConfirm(
            'Cancel Subscription?',
            'Are you sure you want to cancel this subscription? This action cannot be undone.',
            'Yes, cancel it',
            'No, keep it'
        );

        if (confirmed.isConfirmed) {
            const success = await cancelSubscription(subscriptionId);
            if (success) {
                await fetchSubscriptions();
                updateStats();
            }
        }
    }

    function handleLogout() {
        showConfirm(
            'Logout Confirmation',
            'Are you sure you want to logout?',
            'Yes, logout',
            'Cancel'
        ).then(async (result) => {
            if (result.isConfirmed) {
                await AuthAPI.logout();
                window.location.href = '../../html/super-admin/sa-login.html';
            }
        });
    }

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    function getFilteredSubscriptions() {
        const search = searchSubscriptions.value.toLowerCase();
        const status = filterStatus.value;

        return state.subscriptions.filter(sub => {
            const matchesSearch = !search || 
                (sub.salon_name && sub.salon_name.toLowerCase().includes(search)) ||
                (sub.plan_name && sub.plan_name.toLowerCase().includes(search));
            
            const matchesStatus = !status || sub.status === status;

            return matchesSearch && matchesStatus;
        });
    }

    function updatePriceFields() {
        const planTypeValue = planType.value;

        flatPriceField.style.display = 'none';
        perAppointmentPriceField.style.display = 'none';
        percentagePerAppointmentField.style.display = 'none';

        if (planTypeValue === 'flat') {
            flatPriceField.style.display = 'block';
        } else if (planTypeValue === 'per-appointments') {
            perAppointmentPriceField.style.display = 'block';
        } else if (planTypeValue === 'Percentage-per-appointments') {
            percentagePerAppointmentField.style.display = 'block';
        }
    }

    function updateSubscriptionSummary() {
        const planId = document.getElementById('assignPlan').value;
        const startDate = document.getElementById('assignStartDate').value;

        if (planId && startDate) {
            const plan = state.plans.find(p => p.plan_id == planId);
            if (plan) {
                const start = new Date(startDate);
                start.setDate(start.getDate() + plan.duration_days);
                endDateDisplay.textContent = formatDate(start);
                subscriptionSummary.style.display = 'block';
            }
        } else {
            subscriptionSummary.style.display = 'none';
        }
    }

    function populatePlanDropdowns() {
        const assignPlan = document.getElementById('assignPlan');
        if (!assignPlan) return;

        const options = '<option value="">Choose a plan...</option>' +
            state.plans.filter(p => p.status === 1).map(p =>
                `<option value="${p.plan_id}">${escapeHtml(p.plan_name)} - ${getPriceDisplay(p).price}</option>`
            ).join('');

        assignPlan.innerHTML = options;
    }

    function populateSalonDropdown() {
        const assignSalon = document.getElementById('assignSalon');
        if (!assignSalon) return;

        const options = '<option value="">Choose a salon...</option>' +
            state.salons.filter(s => s.status === 1).map(s =>
                `<option value="${s.salon_id}">${escapeHtml(s.salon_name)}</option>`
            ).join('');

        assignSalon.innerHTML = options;
    }

    function getPriceDisplay(plan) {
        if (!plan) return { price: '-', period: '' };

        if (plan.plan_type === 'flat') {
            return { 
                price: `₹${parseFloat(plan.flat_price).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }`, 
                period: '/period' 
            };
        } else if (plan.plan_type === 'per-appointments') {
            return { 
                price: `₹${parseFloat(plan.per_appointments_price).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }`, 
                period: '/appointment' 
            };
        } else if (plan.plan_type === 'Percentage-per-appointments') {
            return { 
                price: `${parseFloat(plan.percentage_per_appointment).toFixed(2)}%`, 
                period: '/appointment' 
            };
        }
        return { price: '-', period: '' };
    }

    function getPlanTypeLabel(type) {
        const labels = {
            'flat': 'Flat Price',
            'per-appointments': 'Per Appointment',
            'Percentage-per-appointments': 'Percentage Based'
        };
        return labels[type] || type;
    }

    function getPlanTypeClass(type) {
        const classes = {
            'flat': 'flat',
            'per-appointments': 'per-appointment',
            'Percentage-per-appointments': 'percentage'
        };
        return classes[type] || 'flat';
    }

    function getInitials(name) {
        if (!name) return 'S';
        const words = name.split(/[\s_]/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showLoading() {
        if (plansGrid) {
            plansGrid.innerHTML = `
                <div class="loading-spinner" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <p>Loading plans...</p>
                </div>
            `;
        }
    }

    function hideLoadingState() {
        // Loading is automatically replaced when rendering
        console.log('Loading state hidden');
    }

    function showLoadingState() {
        if (plansGrid) {
            plansGrid.innerHTML = `
                <div class="loading-spinner" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <p>Loading plans...</p>
                </div>
            `;
        }
        if (subscriptionsTableBody) {
            subscriptionsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-spinner">
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                        <p>Loading subscriptions...</p>
                    </td>
                </tr>
            `;
        }
    }

    // =============================================
    // BILLING HELPER FUNCTIONS
    // =============================================

    /**
     * Get last day of month
     * @param {string} monthStr - Month in YYYY-MM format
     * @returns {string} Last day in YYYY-MM-DD format
     */
    function getLastDayOfMonth(monthStr) {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month, 0).toISOString().split('T')[0];
    }

    /**
     * Round to 2 decimal places
     * @param {number} num - Number to round
     * @returns {number} Rounded number
     */
    function roundTo2(num) {
        return Math.round(num * 100) / 100;
    }

    /**
     * Add days to date
     * @param {Date} date - Base date
     * @param {number} days - Days to add
     * @returns {string} New date in YYYY-MM-DD format
     */
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    }

    /**
     * Calculate subscription billing amount
     * @param {Object} subscription - Subscription object
     * @param {Object} plan - Plan object
     * @param {Array} appointments - Array of completed appointments for the month
     * @param {string} billingMonth - Billing month in YYYY-MM format
     * @returns {Object} Calculation breakdown
     */
    function calculateSubscriptionBilling(subscription, plan, appointments, billingMonth) {
        const taxRate = 0.18; // 18% GST

        // Filter appointments for billing month
        const monthAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const aptMonth = aptDate.toISOString().slice(0, 7); // YYYY-MM
            return aptMonth === billingMonth && apt.status === 'COMPLETED';
        });

        // Calculate totals
        const totalAppointments = monthAppointments.length;
        const totalRevenue = monthAppointments.reduce((sum, apt) => 
            sum + parseFloat(apt.final_amount || 0), 0
        );

        // Initialize amounts
        let baseAmount = 0;
        let perAppointmentAmount = 0;
        let percentageAmount = 0;

        // Calculate based on plan type
        if (plan.plan_type === 'flat') {
            baseAmount = parseFloat(plan.flat_price || 0);
        }
        else if (plan.plan_type === 'per-appointments') {
            perAppointmentAmount = totalAppointments * parseFloat(plan.per_appointments_price || 0);
        }
        else if (plan.plan_type === 'Percentage-per-appointments') {
            percentageAmount = totalRevenue * (parseFloat(plan.percentage_per_appointment || 0) / 100);
        }

        // Calculate subtotal and tax
        const subtotalAmount = baseAmount + perAppointmentAmount + percentageAmount;
        const taxAmount = subtotalAmount * taxRate;
        const totalAmount = subtotalAmount + taxAmount;

        return {
            billing_month: billingMonth,
            billing_period: {
                start_date: billingMonth + '-01',
                end_date: getLastDayOfMonth(billingMonth)
            },
            usage: {
                total_appointments: totalAppointments,
                total_revenue: totalRevenue,
                completed_appointments: totalAppointments,
                cancelled_appointments: 0
            },
            calculation: {
                base_amount: roundTo2(baseAmount),
                per_appointment_amount: roundTo2(perAppointmentAmount),
                percentage_amount: roundTo2(percentageAmount),
                subtotal_amount: roundTo2(subtotalAmount),
                tax_rate: 18,
                tax_amount: roundTo2(taxAmount),
                total_amount: roundTo2(totalAmount)
            },
            plan_details: {
                plan_id: plan.plan_id,
                plan_name: plan.plan_name,
                plan_type: plan.plan_type
            }
        };
    }

    /**
     * Prepare billing data by fetching required information
     * @param {number} subscriptionId - Subscription ID
     * @param {string} billingMonth - Billing month in YYYY-MM format
     * @returns {Promise<Object>} Billing data object
     */
    async function prepareBillingData(subscriptionId, billingMonth) {
        try {
            // 1. Get subscription details from state (already loaded)
            let subscription = state.subscriptions.find(s => s.subscription_id == subscriptionId);

            // If not in state, fetch from LIST_ALL endpoint (VIEW endpoint may not exist for SUPER_ADMIN)
            if (!subscription) {
                const allSubsResponse = await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.LIST_ALL);
                if (allSubsResponse.status === 'success') {
                    subscription = allSubsResponse.data.items.find(s => s.subscription_id == subscriptionId);
                }
            }

            if (!subscription) {
                throw new Error('Subscription not found');
            }

            // 2. Get plan details - Use plan info from subscription data (no API call needed)
            // LIST_ALL endpoint returns: plan_id, plan_name, plan_type, flat_price, etc.
            const plan = {
                plan_id: subscription.plan_id,
                plan_name: subscription.plan_name || 'Subscription Plan',
                plan_type: subscription.plan_type || 'flat',
                flat_price: subscription.flat_price || 0,
                per_appointments_price: subscription.per_appointments_price || 0,
                percentage_per_appointment: subscription.percentage_per_appointment || 0
            };

            // 3. Get appointments for the billing month (filtered by salon_id)
            const startDate = billingMonth + '-01';
            const endDate = getLastDayOfMonth(billingMonth);
            const appointmentsResponse = await apiRequest(
                `/appointments?start_date=${startDate}&end_date=${endDate}&status=COMPLETED&salon_id=${subscription.salon_id}`
            );
            const appointments = appointmentsResponse.data?.items || [];

            // 4. Calculate billing (FRONTEND)
            const billingData = calculateSubscriptionBilling(subscription, plan, appointments, billingMonth);

            return { subscription, plan, appointments, billingData };
        } catch (error) {
            console.error('Error preparing billing data:', error);
            showErrorToast('Failed to prepare billing data: ' + error.message);
            return null;
        }
    }

    /**
     * Open billing preview modal
     * @param {number} subscriptionId - Subscription ID
     */
    async function openBillingPreview(subscriptionId) {
        const billingMonthSelect = document.getElementById('billingMonthSelect');
        if (!billingMonthSelect) {
            showErrorToast('Billing month selector not found');
            return;
        }

        const billingMonth = billingMonthSelect.value;
        if (!billingMonth) {
            showErrorToast('Please select a billing month');
            return;
        }

        try {
            // Show loading
            showLoading('Calculating billing...');

            // Fetch data
            const result = await prepareBillingData(subscriptionId, billingMonth);
            if (!result) {
                closeLoading();
                return;
            }

            const { billingData } = result;

            // Store billing data for later use
            window.currentBillingData = billingData;
            window.currentSubscriptionId = subscriptionId;

            // Render billing preview
            const previewContent = document.getElementById('billingPreviewContent');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="billing-preview">
                        <div class="billing-summary">
                            <h4>Billing Summary - ${billingData.billing_month}</h4>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <label>Plan:</label>
                                    <span>${escapeHtml(billingData.plan_details.plan_name)}</span>
                                </div>
                                <div class="summary-item">
                                    <label>Plan Type:</label>
                                    <span>${billingData.plan_details.plan_type}</span>
                                </div>
                                <div class="summary-item">
                                    <label>Billing Period:</label>
                                    <span>${billingData.billing_period.start_date} to ${billingData.billing_period.end_date}</span>
                                </div>
                            </div>
                        </div>

                        <div class="usage-section">
                            <h4>Usage Details</h4>
                            <div class="usage-grid">
                                <div class="usage-card">
                                    <i class="fa-solid fa-calendar-check"></i>
                                    <div class="usage-value">${billingData.usage.total_appointments}</div>
                                    <div class="usage-label">Completed Appointments</div>
                                </div>
                                <div class="usage-card">
                                    <i class="fa-solid fa-indian-rupee-sign"></i>
                                    <div class="usage-value">₹${billingData.usage.total_revenue.toLocaleString('en-IN')}</div>
                                    <div class="usage-label">Total Revenue</div>
                                </div>
                            </div>
                        </div>

                        <div class="calculation-section">
                            <h4>Amount Breakdown</h4>
                            <table class="calculation-table">
                                <tr>
                                    <td>Base Amount:</td>
                                    <td>₹${billingData.calculation.base_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td>Per Appointment Amount:</td>
                                    <td>₹${billingData.calculation.per_appointment_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td>Percentage Amount:</td>
                                    <td>₹${billingData.calculation.percentage_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr class="subtotal-row">
                                    <td>Subtotal:</td>
                                    <td>₹${billingData.calculation.subtotal_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td>Tax (18% GST):</td>
                                    <td>₹${billingData.calculation.tax_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr class="total-row">
                                    <td><strong>Total Amount:</strong></td>
                                    <td><strong>₹${billingData.calculation.total_amount.toLocaleString('en-IN')}</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `;
            }

            // Show modal
            const billingModal = document.getElementById('billingPreviewModal');
            if (billingModal) {
                billingModal.classList.add('active');
            }

            closeLoading();
        } catch (error) {
            console.error('Error opening billing preview:', error);
            closeLoading();
            showErrorToast('Failed to calculate billing: ' + error.message);
        }
    }

    /**
     * Close billing preview modal
     */
    function closeBillingPreview() {
        const billingModal = document.getElementById('billingPreviewModal');
        if (billingModal) {
            billingModal.classList.remove('active');
        }
        
        // Clear stored data
        window.currentBillingData = null;
        window.currentSubscriptionId = null;
    }

    /**
     * Generate invoice from billing preview
     */
    async function generateInvoiceFromPreview() {
        if (!window.currentBillingData || !window.currentSubscriptionId) {
            showErrorToast('No billing data available');
            return;
        }

        const billingData = window.currentBillingData;
        const subscriptionId = window.currentSubscriptionId;

        try {
            showLoading('Generating invoice...');

            const invoiceData = {
                billing_month: billingData.billing_month,
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: addDays(new Date(), 7).toISOString().split('T')[0],
                amount: billingData.calculation.subtotal_amount,
                tax_amount: billingData.calculation.tax_amount,
                total_amount: billingData.calculation.total_amount,
                total_appointments: billingData.usage.total_appointments,
                total_revenue: billingData.usage.total_revenue,
                calculation_breakdown: billingData.calculation
            };

            const response = await apiRequest(
                API_ENDPOINTS.SUBSCRIPTIONS.GENERATE_INVOICE(subscriptionId),
                {
                    method: 'POST',
                    body: JSON.stringify(invoiceData)
                }
            );

            if (response.status === 'success') {
                closeLoading();
                closeBillingPreview();
                showSuccess('Invoice generated successfully: ' + response.data.invoice_number);
                
                // Refresh billing history if visible
                if (window.currentSubscriptionId) {
                    fetchBillingHistory(window.currentSubscriptionId);
                }
            } else {
                closeLoading();
                showErrorToast(response.message || 'Failed to generate invoice');
            }
        } catch (error) {
            closeLoading();
            if (error.message.includes('409')) {
                showErrorToast('Invoice already exists for this subscription and billing month');
            } else {
                showErrorToast('Failed to generate invoice: ' + error.message);
            }
        }
    }

    /**
     * Fetch and display billing history
     * @param {number} subscriptionId - Subscription ID
     */
    async function fetchBillingHistory(subscriptionId) {
        try {
            const response = await apiRequest(`/super-admin/invoices/salon?subscription_id=${subscriptionId}`);
            const invoices = response.data?.items || [];

            const tbody = document.getElementById('billingHistoryBody');
            if (!tbody) return;

            if (invoices.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" class="empty-state">
                            <i class="fa-solid fa-file-invoice"></i>
                            <p>No billing history found</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = invoices.map(inv => {
                const notes = inv.notes ? JSON.parse(inv.notes) : {};
                return `
                    <tr>
                        <td class="invoice-number">${inv.invoice_number || '-'}</td>
                        <td>${formatDate(inv.billing_month || inv.invoice_date)}</td>
                        <td>${notes.total_appointments || '-'}</td>
                        <td>₹${(notes.total_revenue || 0).toLocaleString('en-IN')}</td>
                        <td>₹${(inv.amount || 0).toLocaleString('en-IN')}</td>
                        <td>₹${(inv.tax_amount || 0).toLocaleString('en-IN')}</td>
                        <td><strong>₹${inv.total_amount.toLocaleString('en-IN')}</strong></td>
                        <td><span class="status-pill ${(inv.payment_status || 'UNPAID').toLowerCase()}">${inv.payment_status || 'UNPAID'}</span></td>
                        <td>${formatDate(inv.due_date)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon btn-view" onclick="viewInvoice('${inv.invoice_salon_id}')" title="View">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                                ${(inv.payment_status || 'UNPAID') === 'UNPAID' ? `
                                    <button class="btn-icon btn-pay" onclick="payInvoice('${inv.invoice_salon_id}')" title="Pay">
                                        <i class="fa-solid fa-credit-card"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Failed to fetch billing history:', error);
            const tbody = document.getElementById('billingHistoryBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" class="empty-state">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <p>Failed to load billing history</p>
                        </td>
                    </tr>
                `;
            }
        }
    }

    /**
     * View invoice details
     * @param {number} invoiceSalonId - Invoice ID
     */
    async function viewInvoice(invoiceSalonId) {
        try {
            const response = await apiRequest(`/super-admin/invoices/salon/${invoiceSalonId}`);
            const invoice = response.data;

            // Parse notes to get usage details
            const usageDetails = invoice.notes ? JSON.parse(invoice.notes) : null;

            const html = `
                <div class="invoice-details" style="text-align: left; padding: 20px;">
                    <h3 style="margin-bottom: 20px;">Invoice: ${invoice.invoice_number || ''}</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                        <div>
                            <p><strong>Status:</strong> <span class="status-pill ${(invoice.payment_status || 'UNPAID').toLowerCase()}">${invoice.payment_status || 'UNPAID'}</span></p>
                            <p><strong>Amount:</strong> ₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</p>
                            <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
                        </div>
                        <div>
                            <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}</p>
                            <p><strong>Billing Month:</strong> ${formatDate(invoice.billing_month || invoice.invoice_date)}</p>
                        </div>
                    </div>

                    ${usageDetails ? `
                        <div class="usage-details" style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                            <h4 style="margin-bottom: 12px;">Usage Details</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                <div>
                                    <p style="font-size: 13px; color: var(--text-secondary);">Total Appointments</p>
                                    <p style="font-size: 16px; font-weight: 600;">${usageDetails.total_appointments || 0}</p>
                                </div>
                                <div>
                                    <p style="font-size: 13px; color: var(--text-secondary);">Total Revenue</p>
                                    <p style="font-size: 16px; font-weight: 600;">₹${(usageDetails.total_revenue || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p style="font-size: 13px; color: var(--text-secondary);">Plan Type</p>
                                    <p style="font-size: 16px; font-weight: 600;">${usageDetails.plan_type || '-'}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px;">
                        <h4 style="margin-bottom: 12px;">Amount Breakdown</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary);">Amount:</td>
                                <td style="padding: 8px; border-bottom: 1px solid var(--border-light); text-align: right; font-weight: 600;">₹${(invoice.amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary);">Tax Amount:</td>
                                <td style="padding: 8px; border-bottom: 1px solid var(--border-light); text-align: right; font-weight: 600;">₹${(invoice.tax_amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; color: var(--text-primary); font-weight: 700;">Total Amount:</td>
                                <td style="padding: 8px; text-align: right; color: var(--primary); font-weight: 800; font-size: 18px;">₹${(invoice.total_amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Invoice Details',
                html: html,
                confirmButtonText: 'Close',
                confirmButtonColor: '#6366f1',
                width: '700px'
            });

        } catch (error) {
            showErrorToast('Failed to load invoice: ' + error.message);
        }
    }

    /**
     * Pay invoice
     * @param {number} invoiceSalonId - Invoice ID
     */
    async function payInvoice(invoiceSalonId) {
        const { value: formValues } = await Swal.fire({
            title: 'Record Payment',
            html: `
                <input id="paymentAmount" class="swal2-input" placeholder="Amount" type="number" step="0.01">
                <select id="paymentMode" class="swal2-select">
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                </select>
                <input id="transactionNo" class="swal2-input" placeholder="Transaction No.">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Record Payment',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            preConfirm: () => {
                const amount = document.getElementById('paymentAmount').value;
                const payment_mode = document.getElementById('paymentMode').value;
                const transaction_no = document.getElementById('transactionNo').value;

                if (!amount || parseFloat(amount) <= 0) {
                    Swal.showValidationMessage('Please enter a valid amount');
                    return false;
                }

                return {
                    amount: parseFloat(amount),
                    payment_mode: payment_mode,
                    transaction_no: transaction_no,
                    payment_date: new Date().toISOString().split('T')[0]
                };
            }
        });

        if (formValues) {
            try {
                await apiRequest(`/super-admin/invoices/salon/${invoiceSalonId}/payments`, {
                    method: 'POST',
                    body: JSON.stringify(formValues)
                });

                showSuccess('Payment recorded successfully');
                
                // Refresh billing history
                if (window.currentSubscriptionId) {
                    fetchBillingHistory(window.currentSubscriptionId);
                }
            } catch (error) {
                showErrorToast('Failed to record payment: ' + error.message);
            }
        }
    }

    /**
     * Populate billing month selector with last 12 months + current month
     */
    function populateBillingMonthSelector() {
        const select = document.getElementById('billingMonthSelect');
        if (!select) return;

        const options = [];
        const today = new Date();

        // Generate last 12 months + current month
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const value = `${year}-${month}`;
            
            // Format display: "February 2025"
            const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            
            options.push(`<option value="${value}" ${i === 0 ? 'selected' : ''}>${label}</option>`);
        }

        select.innerHTML = options.join('');
    }

    // Make functions globally available for HTML onclick handlers
    window.openBillingPreview = openBillingPreview;
    window.closeBillingPreview = closeBillingPreview;
    window.generateInvoiceFromPreview = generateInvoiceFromPreview;
    window.viewInvoice = viewInvoice;
    window.payInvoice = payInvoice;
    window.fetchBillingHistory = fetchBillingHistory;
});
