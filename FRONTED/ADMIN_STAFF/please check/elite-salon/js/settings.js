const hoursData = [{
        day: 'Monday',
        open: '09:00',
        close: '20:00',
        enabled: true
    },
    {
        day: 'Tuesday',
        open: '09:00',
        close: '20:00',
        enabled: true
    },
    {
        day: 'Wednesday',
        open: '09:00',
        close: '20:00',
        enabled: true
    },
    {
        day: 'Thursday',
        open: '09:00',
        close: '20:00',
        enabled: true
    },
    {
        day: 'Friday',
        open: '09:00',
        close: '20:00',
        enabled: true
    },
    {
        day: 'Saturday',
        open: '09:00',
        close: '18:00',
        enabled: true
    },
    {
        day: 'Sunday',
        open: '10:00',
        close: '17:00',
        enabled: true
    },
];

const notifications = [{
        key: 'apptReminder',
        label: 'Appointment Reminders',
        desc: 'Send reminders to customers 24h before appointments',
        on: true
    },
    {
        key: 'newBooking',
        label: 'New Booking Alerts',
        desc: 'Notify admin when a new booking is made',
        on: true
    },
    {
        key: 'cancellation',
        label: 'Cancellation Alerts',
        desc: 'Alert when an appointment is cancelled',
        on: true
    },
    {
        key: 'lowStock',
        label: 'Low Stock Warnings',
        desc: 'Notify when inventory falls below reorder point',
        on: true
    },
    {
        key: 'staffLeave',
        label: 'Staff Leave Requests',
        desc: 'Alert when staff submits a leave request',
        on: false
    },
    {
        key: 'dailySummary',
        label: 'Daily Summary Report',
        desc: 'Send a daily business summary at end of day',
        on: false
    },
];

function renderHours() {
    document.getElementById('hoursTable').innerHTML = hoursData.map((h, i) => `
        <div class="hours-row">
            <div class="day-name">${h.day}</div>
            <input type="time" value="${h.open}" id="ho-${i}" ${h.enabled ? '' : 'disabled style="opacity:.4"'}>
            <input type="time" value="${h.close}" id="hc-${i}" ${h.enabled ? '' : 'disabled style="opacity:.4"'}>
            <label class="toggle"><input type="checkbox" ${h.enabled ? 'checked' : ''} onchange="toggleDay(${i},this)"><span class="slider"></span></label>
        </div>
    `).join('');
}

function toggleDay(i, cb) {
    hoursData[i].enabled = cb.checked;
    renderHours();
}

function renderNotifications() {
    document.getElementById('notifList').innerHTML = notifications.map((n, i) => `
        <div class="notification-row">
            <div class="notif-info"><h4>${n.label}</h4><p>${n.desc}</p></div>
            <label class="toggle"><input type="checkbox" ${n.on ? 'checked' : ''} onchange="notifications[${i}].on=this.checked"><span class="slider"></span></label>
        </div>
    `).join('');
}

function showPanel(name, el) {
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.settings-nav a').forEach(a => a.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    el.classList.add('active');
    return false;
}

function save(section) {
    if (section === 'hours') {
        hoursData.forEach((h, i) => {
            h.open = document.getElementById('ho-' + i)?.value || h.open;
            h.close = document.getElementById('hc-' + i)?.value || h.close;
        });
    }
    const badge = document.getElementById('sb-' + section);
    if (badge) {
        badge.classList.add('show');
        setTimeout(() => badge.classList.remove('show'), 2500);
    }
    showToast('Settings saved successfully!');
}

function changePass() {
    const cur = document.getElementById('curPass').value;
    const nw = document.getElementById('newPass').value;
    const conf = document.getElementById('confPass').value;
    const err = document.getElementById('passError');

    if (!cur) {
        err.textContent = 'Current password is required';
        return;
    }
    if (nw.length < 6) {
        err.textContent = 'Password must be at least 6 characters';
        return;
    }
    if (nw !== conf) {
        err.textContent = 'Passwords do not match';
        return;
    }
    err.textContent = '';
    ['curPass', 'newPass', 'confPass'].forEach(id => document.getElementById(id).value = '');
    save('security');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#7c3aed;color:white;padding:1rem 1.5rem;border-radius:12px;z-index:9999;box-shadow:0 5px 20px rgba(0,0,0,.2);max-width:300px';
    t.textContent = '✓ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    renderHours();
    renderNotifications();
});