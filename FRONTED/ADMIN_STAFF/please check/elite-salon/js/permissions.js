const PERMISSIONS = {

    ADMIN: {
        full: [
            "dashboard.html",
            "customers.html",
            "appointments.html",
            "staff.html",
            "schedules.html",
            "services.html",
            "package.html",
            "inventory.html",
            "payments.html",
            "settings.html",
            "reports.html",
            "index.html"
        ],
        readOnly: []
    },

    STAFF: {
        full: [
            "dashboard.html",
            "customers.html",
            "appointments.html",
            "schedules.html",
            "index.html"
        ],
        readOnly: [
            "services.html",
            "package.html"
        ]
    }

};

document.addEventListener("DOMContentLoaded", () => {

    const storedUser = localStorage.getItem("es_user");
    if (!storedUser) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(storedUser);
    const role = user.role;

    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "login.html") return;

    const rolePermissions = PERMISSIONS[role];

    if (!rolePermissions) {
        window.location.href = "login.html";
        return;
    }

    const isFull = rolePermissions.full.includes(currentPage);
    const isReadOnly = rolePermissions.readOnly.includes(currentPage);

    if (!isFull && !isReadOnly) {
        alert("Unauthorized access.");
        window.location.href = "dashboard.html";
        return;
    }

    window.READ_ONLY_MODE = isReadOnly;

});
