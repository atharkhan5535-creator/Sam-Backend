document.addEventListener("DOMContentLoaded", () => {

    const storedUser = localStorage.getItem("es_user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const role = user.role;

    if (!PERMISSIONS[role]) return;

    const rolePermissions = PERMISSIONS[role];

    document.querySelectorAll("[data-page]").forEach(link => {

        const page = link.getAttribute("data-page");

        const allowed =
            rolePermissions.full.includes(page) ||
            rolePermissions.readOnly.includes(page);

        if (!allowed) {
            link.style.display = "none";
        }

    });

});
