const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("menu-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open menu");
    });
});
