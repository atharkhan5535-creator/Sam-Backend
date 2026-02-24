const staff = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'Jessica Alba'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let weekOffset = 0;
const defaultSchedule = {
    'Sarah Johnson': {
        Mon: '9AM-6PM',
        Tue: '9AM-6PM',
        Wed: '9AM-6PM',
        Thu: '9AM-6PM',
        Fri: '9AM-6PM',
        Sat: '9AM-3PM',
        Sun: 'Off'
    },
    'Michael Chen': {
        Mon: '10AM-7PM',
        Tue: '10AM-7PM',
        Wed: 'Off',
        Thu: '10AM-7PM',
        Fri: '10AM-7PM',
        Sat: '10AM-4PM',
        Sun: 'Off'
    },
    'Emily Rodriguez': {
        Mon: '9AM-5PM',
        Tue: 'Off',
        Wed: '9AM-5PM',
        Thu: '9AM-5PM',
        Fri: '9AM-5PM',
        Sat: 'Off',
        Sun: 'Off'
    },
    'Jessica Alba': {
        Mon: 'Off',
        Tue: '11AM-6PM',
        Wed: '11AM-6PM',
        Thu: '11AM-6PM',
        Fri: '11AM-6PM',
        Sat: '11AM-5PM',
        Sun: 'Off'
    },
};

let customShifts = [];

let leaveRequests = [{
        staff: 'Sarah Johnson',
        type: 'Annual Leave',
        from: '2026-02-20',
        to: '2026-02-22',
        reason: 'Family vacation',
        status: 'Approved'
    },
    {
        staff: 'Michael Chen',
        type: 'Sick Leave',
        from: '2026-02-13',
        to: '2026-02-13',
        reason: 'Doctor appointment',
        status: 'Pending'
    },
    {
        staff: 'Emily Rodriguez',
        type: 'Emergency Leave',
        from: '2026-02-14',
        to: '2026-02-14',
        reason: 'Family emergency',
        status: 'Pending'
    },
];

function getWeekDates(offset) {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + (offset * 7));
    return Array.from({
        length: 7
    }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
}

function changeWeek(dir) {
    weekOffset += dir;
    renderWeek();
}

function goToday() {
    weekOffset = 0;
    renderWeek();
}

function renderWeek() {
    const dates = getWeekDates(weekOffset);
    const fmt = d => d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });
    const months = [...new Set(dates.map(d => d.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric'
    })))];
    document.getElementById('weekLabel').textContent = months.join(' – ');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = `<table class="schedule-table"><thead><tr><th class="staff-col">Staff</th>`;
    dates.forEach((d, i) => {
        const isToday = d.getTime() === today.getTime();
        html += `<th style="${isToday ? 'background:#7c3aed;color:white;border-radius:8px' : ''}">${days[i]}<br><span style="font-size:.75rem;font-weight:400">${fmt(d)}</span></th>`;
    });
    html += `</tr></thead><tbody>`;

    staff.forEach(s => {
        html += `<tr><td class="staff-col"><i class="fas fa-user" style="color:#8b5cf6;margin-right:.5rem"></i>${s}</td>`;
        dates.forEach((d, i) => {
            const dayName = days[i];
            const custom = customShifts.find(c => c.staff === s && c.date === d.toISOString().split('T')[0]);
            let cell;
            if (custom) {
                if (custom.type === 'off') cell = `<span class="shift-off">Off</span>`;
                else if (custom.type === 'leave') cell = `<span class="shift-leave">Leave</span>`;
                else cell = `<span class="shift-badge" onclick="editShift('${s}','${d.toISOString().split('T')[0]}')">${custom.start}–${custom.end}</span>`;
            } else {
                const def = defaultSchedule[s][dayName];
                if (def === 'Off') cell = `<span class="shift-off">Off</span>`;
                else cell = `<span class="shift-badge" onclick="editShift('${s}','${d.toISOString().split('T')[0]}')">${def}</span>`;
            }
            html += `<td>${cell}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('weekGrid').innerHTML = html;
}

function renderAvailability() {
    document.getElementById('availabilityList').innerHTML = staff.map(s => {
        const sch = defaultSchedule[s];
        const workDays = Object.entries(sch).filter(([_, v]) => v !== 'Off').length;
        return `<div class="availability-card">
            <h4><i class="fas fa-user" style="margin-right:.5rem;color:#8b5cf6"></i>${s}</h4>
            <div style="font-size:.82rem;color:#555;margin-bottom:.5rem">${workDays} days/week · Avg ${Math.round(workDays * 8)}h/week</div>
            ${Object.entries(sch).map(([day, t]) => `<div class="avail-row"><span class="avail-day">${day}</span><span style="color:${t === 'Off' ? '#94a3b8' : '#333'};font-size:.82rem">${t}</span></div>`).join('')}
        </div>`;
    }).join('');
}

function renderLeaveRequests() {
    document.getElementById('leaveList').innerHTML = leaveRequests.length ? leaveRequests.map((l, i) => `
        <div class="req-card">
            <div class="req-info">
                <h4>${l.staff}</h4>
                <p>${l.type} • ${l.from} to ${l.to}</p>
                ${l.reason ? `<p style="color:#888;font-size:.78rem;margin-top:.2rem">${l.reason}</p>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:.5rem">
                <span class="status-badge status-${l.status.toLowerCase()}">${l.status}</span>
                ${l.status === 'Pending' ? `
                    <button class="btn btn-success btn-sm" onclick="updateLeave(${i},'Approved')"><i class="fas fa-check"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="updateLeave(${i},'Rejected')"><i class="fas fa-times"></i></button>` : ''
                }
            </div>
        </div>`).join('') : `<div style="text-align:center;padding:2rem;color:#999"><i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>No leave requests</div>`;
}

function openAddShift() {
    document.getElementById('sDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('shiftModalTitle').textContent = 'Add Shift';
    document.getElementById('shiftModal').classList.add('open');
}

function editShift(staffName, date) {
    document.getElementById('sStaff').value = staffName;
    document.getElementById('sDate').value = date;
    document.getElementById('shiftModalTitle').textContent = 'Edit Shift';
    document.getElementById('shiftModal').classList.add('open');
}

function saveShift() {
    const s = {
        staff: document.getElementById('sStaff').value,
        date: document.getElementById('sDate').value,
        type: document.getElementById('sType').value,
        start: document.getElementById('sStart').value,
        end: document.getElementById('sEnd').value,
        notes: document.getElementById('sNotes').value
    };
    const existing = customShifts.findIndex(c => c.staff === s.staff && c.date === s.date);
    if (existing >= 0) customShifts[existing] = s;
    else customShifts.push(s);
    renderWeek();
    closeModal('shiftModal');
    showToast('Shift saved!');
}

function openLeaveRequest() {
    document.getElementById('lFrom').value = new Date().toISOString().split('T')[0];
    document.getElementById('leaveModal').classList.add('open');
}

function openMarkLeave() {
    document.getElementById('mlDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('markLeaveModal').classList.add('open');
}

function saveMarkLeave() {
    const s = {
        staff: document.getElementById('mlStaff').value,
        date: document.getElementById('mlDate').value,
        type: document.getElementById('mlType').value,
        start: '',
        end: '',
        notes: document.getElementById('mlNotes').value
    };
    const existing = customShifts.findIndex(c => c.staff === s.staff && c.date === s.date);
    if (existing >= 0) customShifts[existing] = s;
    else customShifts.push(s);
    renderWeek();
    closeModal('markLeaveModal');
    showToast('Leave marked on schedule!');
}

function saveLeave() {
    leaveRequests.unshift({
        staff: document.getElementById('lStaff').value,
        type: document.getElementById('lType').value,
        from: document.getElementById('lFrom').value,
        to: document.getElementById('lTo').value,
        reason: document.getElementById('lReason').value,
        status: 'Pending'
    });
    renderLeaveRequests();
    closeModal('leaveModal');
    showToast('Leave request submitted!');
}

function updateLeave(i, status) {
    leaveRequests[i].status = status;
    renderLeaveRequests();
    showToast(`Leave ${status.toLowerCase()}!`);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.2);max-width:300px';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.onclick = e => {
    ['shiftModal', 'leaveModal', 'markLeaveModal'].forEach(id => {
        if (e.target.id === id) closeModal(id);
    });
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sType').addEventListener('change', function() {
        document.getElementById('timeGroup').style.display = this.value === 'shift' ? 'block' : 'none';
    });
    renderWeek();
    renderAvailability();
    renderLeaveRequests();
});