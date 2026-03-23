// ===============================
// GLOBAL STATE
// ===============================

const bookingData = {
    type: null,
    items: [],
    date: null,
    time: null,
    totalAmount: 0,
    totalDuration: 0,
    status: "PENDING",
    notes: "",
    assignedStaff: []  // Auto-calculated from services
};

let DOM = {};
let selectedDate = null;
let staffData = [];  // Store staff data for lookup

// Calendar navigation state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentWeekOffset = 0; // 0 = first week of month, 1 = second week, etc.

// Salon operating hours
const SALON_OPEN_HOUR = 9;   // 9:00 AM
const SALON_CLOSE_HOUR = 21; // 9:00 PM (realistic salon closing time)
const SLOT_INTERVAL = 30;    // 30-minute slots
const BUFFER_TIME = 15;      // 15-minute buffer between appointments

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    cacheDOM();
    await fetchStaff();  // Fetch staff first
    fetchSalonInfo();
    loadBookingItems();
    calculateTotalDuration();
    calculateAssignedStaff();
    renderAssignedStaff();

    // Initialize to today's date
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    // Calculate which week of the month today is in
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const todayDate = today.getDate();
    const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate week offset (0-indexed)
    currentWeekOffset = Math.floor((todayDate + startingDay - 1) / 7);

    initMonthYearSelectors();
    renderDates();
    attachEvents();
    updateSummaryTotal();
}

// ===============================
// FETCH STAFF
// ===============================
async function fetchStaff() {
    try {
        const res = await fetch(`${API_BASE_URL}/staff?salon_id=${salonId}`);
        const data = await res.json();

        if (data.status !== "success") {
            console.log('⚠️ Staff fetch failed, will use staff info from items');
            return;
        }

        staffData = data.data.items || [];
        console.log('👥 Staff loaded:', staffData.length, 'staff members');

    } catch (error) {
        console.error("Staff fetch error:", error);
    }
}

// ===============================
// GET STAFF NAME BY ID
// ===============================
function getStaffNameById(staffId) {
    const staff = staffData.find(s => String(s.staff_id) === String(staffId));
    return staff ? staff.name : null;
}

function getStaffSpecialization(staffId) {
    const staff = staffData.find(s => String(s.staff_id) === String(staffId));
    return staff ? staff.specialization : "Professional";
}

// ===============================
// HELPER: Format date as YYYY-MM-DD in local timezone
// ===============================
function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===============================
// CACHE DOM
// ===============================

function cacheDOM(){
    DOM.assignedStaffInfo = document.getElementById("assignedStaffInfo");
    DOM.daysRow = document.getElementById("daysRow");
    DOM.bookBtn = document.getElementById("bookBtn");
    DOM.summaryDate = document.getElementById("summaryDate");
    DOM.summaryTime = document.getElementById("summaryTime");
    DOM.summaryTotal = document.getElementById("summaryTotal");
    DOM.successModal = document.getElementById("successModal");
    DOM.timeSlotsContainer = document.getElementById("timeSlotsContainer");
    DOM.timeHint = document.getElementById("timeHint");
    DOM.totalDurationDisplay = document.getElementById("totalDurationDisplay");
    DOM.durationBadge = document.getElementById("durationBadge");
    DOM.monthSelector = document.getElementById("monthSelector");
    DOM.yearSelector = document.getElementById("yearSelector");
    DOM.weekLabel = document.getElementById("weekLabel");
    DOM.prevMonthBtn = document.getElementById("prevMonthBtn");
    DOM.nextMonthBtn = document.getElementById("nextMonthBtn");
    DOM.prevWeekBtn = document.getElementById("prevWeekBtn");
    DOM.nextWeekBtn = document.getElementById("nextWeekBtn");
}

// ===============================
// SALON INFO (public — no token)
// ===============================
async function fetchSalonInfo() {
    try {
        const res  = await fetch(`${API_BASE_URL}/salon/info?salon_id=${salonId}`);
        const data = await res.json();

        if (data.status !== "success") return;
        populateSalonInfo(data.data);

    } catch (err) {
        showError("Could not load salon info");
    }
}

function populateSalonInfo(salon) {
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Booking`;
    }
}

// ===============================
// LOAD ITEMS FROM SERVICES / PACKAGES
// ===============================
function loadBookingItems(){
    const source = localStorage.getItem("bookingSource");
    const items = JSON.parse(localStorage.getItem("bookingItems") || "[]");

    bookingData.type = source;
    bookingData.items = items;

    console.log('📦 Loading booking items:', {
        source: source,
        items: items,
        itemCount: items.length
    });

    // DEBUG: Show full item details
    console.log('🔍 DEBUG - Full items from localStorage:');
    items.forEach((item, idx) => {
        console.log(`  Item ${idx + 1}:`, {
            service_id: item.service_id,
            package_id: item.package_id,
            service_name: item.service_name,
            package_name: item.package_name,
            price: item.price,
            duration: item.duration,
            staff_id: item.staff_id,
            staff_name: item.staff_name,
            from_package: item.from_package
        });
    });

    let total = 0;
    
    // Calculate total based on booking source
    if (source === 'packages') {
        // For packages: only count each unique package once
        const processedPackages = new Set();
        items.forEach(item => {
            if (item.package_id && !processedPackages.has(item.package_id)) {
                total += Number(item.price || 0);
                processedPackages.add(item.package_id);
                console.log('  ✅ Package counted:', item.package_name, '| Price:', item.price);
            } else if (item.package_id && processedPackages.has(item.package_id)) {
                console.log('  ⏭️ Package already counted:', item.package_name);
            } else {
                // Individual item (not part of a package)
                total += Number(item.price || 0);
                console.log('  - Item:', getItemName(item), '| Staff:', item.staff_name || 'None', '| Duration:', item.duration);
            }
        });
    } else {
        // For services: sum all items normally
        items.forEach(item => {
            total += Number(item.price || 0);
            console.log('  - Item:', getItemName(item), '| Staff:', item.staff_name || 'None', '| Duration:', item.duration);
        });
    }

    bookingData.totalAmount = total;

    // Update summary
    const typeLabel = source === 'services' ? 'Services' : (source === 'packages' ? 'Packages' : '-');
    document.getElementById("summaryItem").textContent = typeLabel;
    document.getElementById("summaryItems").textContent =
        items.length > 0 ? items.map(i => getItemName(i)).join(", ") : '-';

    console.log('💰 Total amount:', bookingData.totalAmount);
}

// ===============================
// ITEM HELPERS
// ===============================
function getItemName(item){
    return item.service_name || item.package_name || item.name || "Item";
}

function getItemId(item){
    return item.service_id || item.package_id || item.id;
}

// ===============================
// CALCULATE TOTAL DURATION
// ===============================
function calculateTotalDuration() {
    let totalDuration = 0;

    bookingData.items.forEach(item => {
        const itemDuration = parseInt(item.duration) || 0;
        totalDuration += itemDuration;
        console.log('📦 Item duration:', item.service_name || item.package_name, '=', itemDuration, 'min');
    });

    // Add buffer time between services (10 minutes)
    if (bookingData.items.length > 1) {
        totalDuration += (bookingData.items.length - 1) * 10;
        console.log('➕ Buffer time:', (bookingData.items.length - 1) * 10, 'min');
    }

    bookingData.totalDuration = totalDuration;

    console.log('⏱️ Total duration calculated:', totalDuration, 'min');

    // Update duration badge
    if (DOM.totalDurationDisplay) {
        DOM.totalDurationDisplay.textContent = `${totalDuration} min`;
    }

    return totalDuration;
}

// ===============================
// CALCULATE ASSIGNED STAFF FROM SERVICES
// ===============================
function calculateAssignedStaff() {
    const staffMap = new Map();

    console.log('👥 Calculating staff from items:', bookingData.items);

    bookingData.items.forEach(item => {
        console.log('  - Checking item:', getItemName(item), '| staff_id:', item.staff_id, '| staff_name:', item.staff_name);
        
        // Check if item has staff assigned
        if (item.staff_id && item.staff_name) {
            if (!staffMap.has(item.staff_id)) {
                staffMap.set(item.staff_id, {
                    staff_id: item.staff_id,
                    staff_name: item.staff_name,
                    specialization: item.specialization || "Professional",
                    services: [],
                    totalDuration: 0
                });
            }

            // Add service/package to this staff's list
            const staff = staffMap.get(item.staff_id);
            staff.services.push(getItemName(item));
            staff.totalDuration += parseInt(item.duration) || 0;
            
            console.log('  ✅ Added to staff:', item.staff_name);
        } else {
            console.log('  ⚠️ No staff info for this item');
        }
    });

    // Convert map to array
    bookingData.assignedStaff = Array.from(staffMap.values());

    console.log('✅ Assigned Staff Calculated:', bookingData.assignedStaff);
}

// ===============================
// RENDER ASSIGNED STAFF INFO
// ===============================
function renderAssignedStaff() {
    if (!DOM.assignedStaffInfo) return;

    if (bookingData.assignedStaff.length === 0) {
        // No staff assigned - salon will assign
        DOM.assignedStaffInfo.innerHTML = `
            <div class="staff-info-card no-staff">
                <div class="staff-avatar">
                    <i class="ri-user-star-line"></i>
                </div>
                <div class="staff-details">
                    <div class="staff-name">Salon Team</div>
                    <div class="staff-note">
                        <i class="ri-information-line"></i>
                        Our team will assign the best professional for your services
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Render staff cards
    DOM.assignedStaffInfo.innerHTML = bookingData.assignedStaff.map(staff => `
        <div class="staff-info-card">
            <div class="staff-avatar">
                <i class="ri-user-star-fill"></i>
            </div>
            <div class="staff-details">
                <div class="staff-name">${staff.staff_name}</div>
                <div class="staff-services">${staff.services.join(', ')}</div>
                <div class="staff-specialization">${staff.specialization}</div>
                <div class="staff-duration">
                    <i class="ri-time-line"></i>
                    ${staff.totalDuration} min total
                </div>
            </div>
        </div>
    `).join('');
}

// ===============================
// INIT MONTH/YEAR SELECTORS
// ===============================
function initMonthYearSelectors() {
    if (!DOM.monthSelector || !DOM.yearSelector) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set current month and year
    DOM.monthSelector.value = today.getMonth();
    DOM.yearSelector.value = today.getFullYear();

    // Populate year selector (current year + 1 year ahead only)
    const years = [];
    for (let i = today.getFullYear(); i <= today.getFullYear() + 1; i++) {
        years.push(i);
    }

    DOM.yearSelector.innerHTML = years.map(year => 
        `<option value="${year}" ${year === today.getFullYear() ? 'selected' : ''}>${year}</option>`
    ).join('');

    // Populate month selector with disabled past months
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    DOM.monthSelector.innerHTML = months.map((month, index) => {
        const isPastMonth = today.getFullYear() === currentYear && index < today.getMonth();
        return `<option value="${index}" ${index === today.getMonth() ? 'selected' : ''} ${isPastMonth ? 'disabled' : ''}>${month}</option>`;
    }).join('');

    // Month change handler
    DOM.monthSelector.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        currentWeekOffset = 0; // Reset to first week when changing month
        renderDates();
    });

    // Year change handler
    DOM.yearSelector.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        currentWeekOffset = 0; // Reset to first week when changing year
        renderDates();
    });
}

// ===============================
// GET WEEK NUMBER IN MONTH
// ===============================
function getWeekNumberInMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    
    // Calculate which week of the month this date falls in
    const weekNum = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
    return weekNum;
}

// ===============================
// GET TOTAL WEEKS IN MONTH
// ===============================
function getTotalWeeksInMonth(month, year) {
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Calculate total weeks needed to display the month
    const totalDays = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();
    
    return Math.ceil((totalDays + startingDay) / 7);
}

// ===============================
// RENDER DATES (7 days at a time - current week)
// ===============================
function renderDates() {
    if (!DOM.daysRow) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update selectors
    if (DOM.monthSelector) DOM.monthSelector.value = currentMonth;
    if (DOM.yearSelector) DOM.yearSelector.value = currentYear;

    // Update month selector - disable past months if viewing current year
    if (DOM.monthSelector) {
        DOM.monthSelector.innerHTML = months.map((month, index) => {
            const isPastMonth = currentYear === today.getFullYear() && index < today.getMonth();
            const isCurrentMonth = index === today.getMonth() && currentYear === today.getFullYear();
            return `<option value="${index}" ${isCurrentMonth ? 'selected' : ''} ${isPastMonth ? 'disabled' : ''}>${month}</option>`;
        }).join('');
    }

    // Update week label
    const totalWeeks = getTotalWeeksInMonth(currentMonth, currentYear);
    const weekNum = currentWeekOffset + 1;
    if (DOM.weekLabel) {
        DOM.weekLabel.textContent = `Week ${weekNum} of ${totalWeeks}`;
    }

    // Calculate the start date for the current week
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() + (currentWeekOffset * 7) - firstDayOfMonth.getDay());

    // Generate 7 days for the current week
    const dateHtml = [];
    const todayDateStr = formatDateLocal(today);

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const month = months[date.getMonth()];
        // Use local date formatting instead of toISOString() to avoid timezone issues
        const fullDate = formatDateLocal(date);

        // Check if date is in the past
        const isPast = date < today;
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isSelected = selectedDate === fullDate;
        const isToday = fullDate === todayDateStr;

        const disabledClass = isPast ? 'disabled' : '';
        const selectedClass = isSelected || (isToday && !isPast) ? 'selected' : '';
        const fadedClass = !isCurrentMonth ? 'faded' : '';

        dateHtml.push(`
            <div class="day-card ${selectedClass} ${disabledClass} ${fadedClass}" 
                 data-date="${fullDate}" 
                 onclick="selectDate(this)"
                 ${isPast ? 'disabled' : ''}>
                <div class="day-name">${dayName}</div>
                <div class="day-number">${dayNum}</div>
                <div class="day-month">${month.substring(0, 3)}</div>
            </div>
        `);
    }

    DOM.daysRow.innerHTML = dateHtml.join('');

    // Auto-select today if it exists in the current week view and not already selected
    if (!selectedDate) {
        const todayCard = DOM.daysRow.querySelector(`[data-date="${todayDateStr}"]`);
        if (todayCard && !todayCard.classList.contains('disabled')) {
            selectDate(todayCard);
        } else {
            // If today is not in current week view, select first available date
            const firstAvailable = DOM.daysRow.querySelector('.day-card:not(.disabled)');
            if (firstAvailable) {
                selectDate(firstAvailable);
            }
        }
    }

    // Update navigation button states
    updateNavigationButtons();
}

// ===============================
// UPDATE NAVIGATION BUTTONS
// ===============================
function updateNavigationButtons() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the first date shown in the current week view
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDateOfWeek = new Date(firstDayOfMonth);
    startDateOfWeek.setDate(startDateOfWeek.getDate() + (currentWeekOffset * 7) - firstDayOfMonth.getDay());
    
    // Check if we can go to previous week (not before today's week)
    const canGoPrev = currentWeekOffset > 0 || 
                      (currentMonth > today.getMonth() && currentYear === today.getFullYear()) ||
                      currentYear > today.getFullYear();

    // Check if we can go to next week
    const totalWeeks = getTotalWeeksInMonth(currentMonth, currentYear);
    const canGoNext = currentWeekOffset < totalWeeks - 1;

    // Update week navigation buttons
    if (DOM.prevWeekBtn) {
        DOM.prevWeekBtn.disabled = !canGoPrev;
    }
    if (DOM.nextWeekBtn) {
        DOM.nextWeekBtn.disabled = !canGoNext;
    }
    
    // Update month navigation buttons
    if (DOM.prevMonthBtn) {
        const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();
        DOM.prevMonthBtn.disabled = isCurrentMonth || 
                                     (currentYear === today.getFullYear() && currentMonth < today.getMonth());
    }
    if (DOM.nextMonthBtn) {
        DOM.nextMonthBtn.disabled = currentYear >= today.getFullYear() + 1;
    }
}

// ===============================
// NAVIGATE TO PREVIOUS WEEK
// ===============================
function goToPrevWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentWeekOffset > 0) {
        // Check if going back would show past dates
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const newWeekStart = new Date(firstDayOfMonth);
        newWeekStart.setDate(newWeekStart.getDate() + ((currentWeekOffset - 1) * 7) - firstDayOfMonth.getDay());
        
        // Only allow if the week doesn't contain past dates
        const weekEnd = new Date(newWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekEnd >= today) {
            currentWeekOffset--;
            renderDates();
        }
    } else if (currentMonth > today.getMonth() && currentYear === today.getFullYear()) {
        currentMonth--;
        currentWeekOffset = getTotalWeeksInMonth(currentMonth, currentYear) - 1;
        renderDates();
    } else if (currentYear > today.getFullYear() && currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
        currentWeekOffset = getTotalWeeksInMonth(currentMonth, currentYear) - 1;
        renderDates();
    }
}

// ===============================
// NAVIGATE TO NEXT WEEK
// ===============================
function goToNextWeek() {
    const totalWeeks = getTotalWeeksInMonth(currentMonth, currentYear);
    
    if (currentWeekOffset < totalWeeks - 1) {
        currentWeekOffset++;
        renderDates();
    } else if (currentMonth < 11) {
        currentMonth++;
        currentWeekOffset = 0;
        renderDates();
    } else if (currentYear < new Date().getFullYear() + 1) {
        currentMonth = 0;
        currentYear++;
        currentWeekOffset = 0;
        renderDates();
    }
}

// ===============================
// NAVIGATE TO PREVIOUS MONTH
// ===============================
function goToPrevMonth() {
    const today = new Date();
    
    // Don't allow going to past months
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) {
        return;
    }
    
    if (currentMonth > 0) {
        currentMonth--;
    } else {
        currentMonth = 11;
        currentYear--;
    }
    currentWeekOffset = 0;
    renderDates();
}

// ===============================
// NAVIGATE TO NEXT MONTH
// ===============================
function goToNextMonth() {
    const today = new Date();
    
    // Don't allow going beyond next year
    if (currentYear >= today.getFullYear() + 1) {
        return;
    }
    
    if (currentMonth < 11) {
        currentMonth++;
    } else {
        currentMonth = 0;
        currentYear++;
    }
    currentWeekOffset = 0;
    renderDates();
}

// ===============================
// SELECT DATE
// ===============================
function selectDate(element) {
    if (!element) return;

    // Remove selected from all
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selected to clicked
    element.classList.add('selected');

    // Store selected date
    selectedDate = element.dataset.date;
    bookingData.date = selectedDate;

    // Update summary - parse date manually to avoid timezone issues
    if (DOM.summaryDate) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        // Month is 0-indexed in JS Date (0 = January, 11 = December)
        const dateObj = new Date(year, month - 1, day);
        DOM.summaryDate.textContent = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Generate and render time slots for selected date
    generateAndRenderTimeSlots(selectedDate);
}

// ===============================
// GENERATE TIME SLOTS
// ===============================
function generateTimeSlots(date, totalDuration) {
    const slots = [];
    const currentTime = new Date(date);
    currentTime.setHours(SALON_OPEN_HOUR, 0, 0, 0);

    const closeTime = new Date(date);
    closeTime.setHours(SALON_CLOSE_HOUR, 0, 0, 0);

    // Add buffer time to the total duration
    const totalDurationWithBuffer = totalDuration + BUFFER_TIME;

    console.log('⏰ Generating time slots:', {
        date: date,
        totalDuration: totalDuration,
        totalDurationWithBuffer: totalDurationWithBuffer,
        salonOpen: `${SALON_OPEN_HOUR}:00`,
        salonClose: `${SALON_CLOSE_HOUR}:00`
    });

    while (currentTime < closeTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        const endTime = new Date(currentTime.getTime() + totalDurationWithBuffer * 60000);

        // Check if appointment would fit before closing
        if (endTime <= closeTime) {
            slots.push({
                time: timeString,
                available: true,
                endTime: endTime.toTimeString().slice(0, 5)
            });
        }

        currentTime.setMinutes(currentTime.getMinutes() + SLOT_INTERVAL);
    }

    console.log('✅ Generated slots:', slots.length, 'First:', slots[0]?.time, 'Last:', slots[slots.length - 1]?.time);

    return slots;
}

// ===============================
// GENERATE AND RENDER TIME SLOTS
// ===============================
function generateAndRenderTimeSlots(date) {
    if (!DOM.timeSlotsContainer) return;

    const totalDuration = bookingData.totalDuration;
    const staffIds = bookingData.assignedStaff.map(s => s.staff_id);

    // Generate slots
    const slots = generateTimeSlots(date, totalDuration);

    // Show time hint only if no slots available
    if (slots.length === 0) {
        DOM.timeHint.classList.remove('hidden');
        DOM.timeHint.innerHTML = `
            <i class="ri-error-warning-line"></i>
            <span>No available time slots for ${totalDuration} min appointment</span>
        `;
    } else {
        DOM.timeHint.classList.add('hidden');
    }

    // Render slots
    renderTimeSlots(slots);
}

// ===============================
// RENDER TIME SLOTS
// ===============================
function renderTimeSlots(slots) {
    if (!DOM.timeSlotsContainer) return;

    DOM.timeSlotsContainer.innerHTML = slots.map(slot => `
        <button class="time-slot ${slot.available ? 'available' : 'unavailable'}"
                data-time="${slot.time}"
                ${!slot.available ? 'disabled' : ''}>
            ${slot.time}
        </button>
    `).join('');

    // Attach click handlers
    DOM.timeSlotsContainer.querySelectorAll('.time-slot.available').forEach(btn => {
        btn.addEventListener('click', () => selectTimeSlot(btn));
    });
}

// ===============================
// SELECT TIME SLOT
// ===============================
function selectTimeSlot(btn) {
    // Remove selected from all
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selected to clicked
    btn.classList.add('selected');

    // Store selected time
    bookingData.time = btn.dataset.time;

    // Update summary
    if (DOM.summaryTime) {
        DOM.summaryTime.textContent = bookingData.time;
    }

    // Enable book button
    if (DOM.bookBtn) {
        DOM.bookBtn.disabled = false;
    }
}

// ===============================
// UPDATE SUMMARY TOTAL
// ===============================
function updateSummaryTotal() {
    if (DOM.summaryTotal) {
        DOM.summaryTotal.textContent = `₹${bookingData.totalAmount.toFixed(2)}`;
    }
}

// ===============================
// ATTACH EVENTS
// ===============================
function attachEvents() {
    // Book button
    if (DOM.bookBtn) {
        DOM.bookBtn.addEventListener("click", submitBooking);
    }

    // Back button
    const backBtn = document.querySelector(".back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    // Back home button in modal
    const backHomeBtn = document.getElementById("backHomeBtn");
    if (backHomeBtn) {
        backHomeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "../index.html";
        });
    }

    // Week navigation buttons
    if (DOM.prevWeekBtn) {
        DOM.prevWeekBtn.addEventListener("click", goToPrevWeek);
    }
    if (DOM.nextWeekBtn) {
        DOM.nextWeekBtn.addEventListener("click", goToNextWeek);
    }

    // Month navigation buttons
    if (DOM.prevMonthBtn) {
        DOM.prevMonthBtn.addEventListener("click", goToPrevMonth);
    }
    if (DOM.nextMonthBtn) {
        DOM.nextMonthBtn.addEventListener("click", goToNextMonth);
    }
}

// ===============================
// SUBMIT BOOKING
// ===============================
async function submitBooking() {
    // Validation
    if (!bookingData.date) {
        showWarning("Please select a date");
        return;
    }

    if (!bookingData.time) {
        showWarning("Please select a time");
        return;
    }

    if (bookingData.items.length === 0) {
        showWarning("Please select at least one service or package");
        return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
        showWarning("Please login to book an appointment");
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 1500);
        return;
    }

    try {
        // Show loading
        DOM.bookBtn.disabled = true;
        DOM.bookBtn.innerHTML = 'Booking... <i class="ri-loader-line"></i>';

        // Get customer ID from token
        const customerData = JSON.parse(atob(token.split('.')[1]));
        const customerId = customerData.customer_id || customerData.id;

        // Prepare services and packages arrays (backend expects objects with service_id and price)
        const services = [];
        const packages = [];
        const processedPackageIds = new Set();  // Track unique package IDs

        bookingData.items.forEach(item => {
            // If item is from a package, send as package (not individual services)
            if (item.from_package && item.package_id) {
                // Only add each package once (in case multiple services from same package)
                if (!processedPackageIds.has(item.package_id)) {
                    packages.push({
                        package_id: item.package_id,
                        price: Number(item.price || 0),
                        discount_amount: 0
                    });
                    processedPackageIds.add(item.package_id);
                }
            }
            // Regular service booking (not from package)
            else if (item.service_id && !item.from_package) {
                services.push({
                    service_id: item.service_id,
                    price: Number(item.price || 0),
                    discount_amount: 0
                });
            }
            // Fallback: item has package_id but no from_package flag
            else if (item.package_id) {
                if (!processedPackageIds.has(item.package_id)) {
                    packages.push({
                        package_id: item.package_id,
                        price: Number(item.price || 0),
                        discount_amount: 0
                    });
                    processedPackageIds.add(item.package_id);
                }
            }
        });

        console.log('📦 Services array:', services);
        console.log('📦 Packages array:', packages);

        // Use the already-calculated total from bookingData (handles packages correctly)
        const totalAmount = bookingData.totalAmount;

        console.log('💰 Total amount to send:', totalAmount);

        // Prepare payload (match backend expected format)
        const payload = {
            salon_id: salonId,
            customer_id: customerId,
            appointment_date: bookingData.date,
            start_time: bookingData.time + ":00",  // HH:MM:SS format
            estimated_duration: bookingData.totalDuration,
            total_amount: totalAmount,
            discount_amount: 0,
            final_amount: totalAmount,
            status: "PENDING",
            notes: bookingData.notes || "",
            services: services,  // Backend expects 'services' array
            packages: packages   // Backend expects 'packages' array
            // NO staff_id - backend auto-assigns from services
        };

        console.log('📤 Submitting booking:', payload);

        // Submit to backend
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Show success modal
            showSuccessModal(result.data);
        } else {
            showError(result.message || "Booking failed");
            DOM.bookBtn.disabled = false;
            DOM.bookBtn.innerHTML = '<span>Confirm Booking</span><div class="arrow"><i class="ri-arrow-right-s-line"></i></div>';
        }

    } catch (error) {
        console.error('Booking error:', error);
        showError("Failed to book appointment. Please try again.");
        DOM.bookBtn.disabled = false;
        DOM.bookBtn.innerHTML = '<span>Confirm Booking</span><div class="arrow"><i class="ri-arrow-right-s-line"></i></div>';
    }
}

// ===============================
// SHOW SUCCESS MODAL
// ===============================
function showSuccessModal(bookingResult) {
    // Update modal with booking details
    document.querySelector('.counter-ser').textContent = bookingData.items.length;
    document.querySelector('.serviceOrPackage').textContent = bookingData.type === 'services' ? 'Services' : 'Packages';

    // Show services in modal
    const modalServices = document.getElementById('modalServices');
    if (modalServices) {
        modalServices.innerHTML = bookingData.items.map(item =>
            `<span class="service-tag">${getItemName(item)}</span>`
        ).join('');
    }

    // Update total
    document.getElementById('modTotalValue').textContent = `₹${bookingData.totalAmount.toFixed(2)}`;

    // Update staff info
    const modalStaff = document.getElementById('modalStaff');
    if (modalStaff) {
        if (bookingData.assignedStaff.length > 0) {
            modalStaff.textContent = bookingData.assignedStaff.map(s => s.staff_name).join(', ');
        } else {
            modalStaff.textContent = 'Will be assigned by salon';
        }
    }

    // Update date and time
    document.getElementById('modalDate').textContent = bookingData.date;
    document.getElementById('modalTime').textContent = bookingData.time;

    // Show modal
    DOM.successModal.classList.add('open');

    // Clear cart
    localStorage.removeItem("bookingItems");
    localStorage.removeItem("bookingSource");
}
