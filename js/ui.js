document.addEventListener("DOMContentLoaded", () => {
    // Interaksi Drawer Menu Mobile
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");

    if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("hidden");
            });
        });
    }

    // Observer Animasi Scroll Reveal
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));
});