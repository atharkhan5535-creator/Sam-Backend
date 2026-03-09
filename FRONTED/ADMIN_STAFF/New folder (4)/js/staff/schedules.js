/* =============================================
   STAFF SCHEDULE MANAGEMENT
   View shifts and request leave
   ============================================= */

let currentDate = new Date();
let leaveRequests = [];

document.addEventListener('DOMContentLoaded', function() {
    loadSchedule();
    loadLeaveRequests();
    setupScheduleListeners();
});

// Load schedule
function loadSchedule() {
    updateWeekLabel();
    renderSchedule();
}

// Get week dates
function getWeekDates(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        days.push(day);
    }
    return days;
}

// Format date for display
function formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get day name
function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Update week label
function updateWeekLabel() {
    const days = getWeekDates(currentDate);
    const start = formatDisplayDate(days[0]);
    const end = formatDisplayDate(days[6]);
    const year = days[0].getFullYear();
    
    const labelEl = document.getElementById('weekLabel');
    if (labelEl) {
        labelEl.textContent = `${start} - ${end}, ${year}`;
    }
}

// Render schedule table
function renderSchedule() {
    const days = getWeekDates(currentDate);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    
    let html = '';
    days.forEach((day, i) => {
        const dateStr = day.toISOString().split('T')[0];
        const isWeekend = i >= 5;
        const shiftStatus = isWeekend ? 'Weekend' : 'Regular Shift';
        const shiftTime = isWeekend ? '10:00 AM - 4:00 PM' : '9:00 AM - 6:00 PM';
        
        // Check if on leave
        const isOnLeave = leaveRequests.some(l => 
            l.status === 'Approved' && 
            dateStr >= l.from && 
            dateStr <= l.to
        );
        
        let statusClass = 'badge-info';
        let statusText = shiftStatus;
        
        if (isOnLeave) {
            statusClass = 'badge-warning';
            statusText = 'On Leave';
        }
        
        html += `
            <tr>
                <td><strong>${dayNames[i]}</strong></td>
                <td>${formatDisplayDate(day)}</td>
                <td>${isOnLeave ? '—' : shiftTime}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Load leave requests
function loadLeaveRequests() {
    // Mock data
    leaveRequests = [
        { id: 1, type: "Sick Leave", from: "2026-02-20", to: "2026-02-22", status: "Pending", reason: "Not feeling well" },
        { id: 2, type: "Annual Leave", from: "2026-02-25", to: "2026-02-28", status: "Approved", reason: "Family vacation" },
        { id: 3, type: "Emergency Leave", from: "2026-03-05", to: "2026-03-06", status: "Rejected", reason: "Personal emergency" },
    ];
    
    renderLeaveRequests();
}

// Render leave requests
function renderLeaveRequests() {
    const container = document.getElementById('leaveList');
    if (!container) return;
    
    if (!leaveRequests.length) {
        container.innerHTML = '<p style="color:#888;padding:1rem;text-align:center">No leave requests</p>';
        return;
    }
    
    container.innerHTML = leaveRequests.map(l => {
        let statusClass = 'leave-status-';
        if (l.status === 'Pending') statusClass += 'pending';
        else if (l.status === 'Approved') statusClass += 'approved';
        else statusClass += 'rejected';
        
        return `
            <div class="leave-request-card">
                <div class="leave-request-header">
                    <span class="leave-request-title">${l.type}</span>
                    <span class="leave-request-status ${statusClass}">${l.status}</span>
                </div>
                <div class="leave-request-dates">${formatDisplayDate(l.from)} - ${formatDisplayDate(l.to)}</div>
                <div class="leave-request-reason">${l.reason}</div>
            </div>
        `;
    }).join('');
}

// Change week
function changeWeek(direction) {
    currentDate.setDate(currentDate.getDate() + (direction * 7));
    updateWeekLabel();
    renderSchedule();
}

// Go to today
function goToday() {
    currentDate = new Date();
    updateWeekLabel();
    renderSchedule();
}

// Open leave modal
function openLeaveModal() {
    const modal = document.getElementById('leaveModal');
    if (!modal) return;
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const fromInput = document.getElementById('lFrom');
    const toInput = document.getElementById('lTo');
    
    if (fromInput) fromInput.value = today;
    if (toInput) toInput.value = today;
    
    modal.classList.add('open');
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
}

// Save leave request
async function saveLeave() {
    const type = document.getElementById('lType')?.value;
    const from = document.getElementById('lFrom')?.value;
    const to = document.getElementById('lTo')?.value;
    const reason = document.getElementById('lReason')?.value;

    // Validation
    if (!type || !from || !to) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    if (new Date(from) > new Date(to)) {
        showToast('From date must be before to date', 'error');
        return;
    }

    // Add leave request
    const newRequest = {
        id: leaveRequests.length + 1,
        type,
        from,
        to,
        reason: reason || '—',
        status: 'Pending'
    };
    
    leaveRequests.push(newRequest);
    
    // Update UI
    renderLeaveRequests();
    closeModal('leaveModal');
    
    showToast('Leave request submitted successfully!');
}

// Setup schedule listeners
function setupScheduleListeners() {
    const prevBtn = document.querySelector('[onclick="changeWeek(-1)"]');
    const nextBtn = document.querySelector('[onclick="changeWeek(1)"]');
    const todayBtn = document.querySelector('[onclick="goToday()"]');
    const requestBtn = document.querySelector('[onclick="openModal(\'leaveModal\')"]');
    
    if (prevBtn) prevBtn.addEventListener('click', () => changeWeek(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeWeek(1));
    if (todayBtn) todayBtn.addEventListener('click', goToday);
    if (requestBtn) requestBtn.addEventListener('click', () => openLeaveModal());
}

// Export functions
window.changeWeek = changeWeek;
window.goToday = goToday;
window.openModal = openLeaveModal;
window.closeModal = closeModal;
window.saveLeave = saveLeave;