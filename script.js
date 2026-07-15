const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const year = document.querySelector("#year");

if (year) {
    year.textContent = new Date().getFullYear();
}

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

/* =========================================================
   GSAP animation layer
   - Entrance timelines for the hero sections
   - Parallax on scroll
   - Scroll-triggered reveals (fire once, no reverse-flicker)
   - Magnetic / "alive" buttons
   ========================================================= */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Stability settings that prevent the common causes of scroll jank:
        // - mobile address-bar resize shouldn't force a recalculation mid-scroll
        // - re-measure trigger positions once every image has finished loading,
        //   otherwise late-loading images shift layout and triggers fire at the
        //   wrong scroll position (looks like content "breaking" or never appearing)
        ScrollTrigger.config({ ignoreMobileResize: true });
        window.addEventListener("load", () => ScrollTrigger.refresh());
    }

    if (!prefersReducedMotion) {
        initHeroEntrance();
        initGalleryHeroEntrance();
        initHeaderScroll();
        initParallax();
        initScrollReveals();
        initMagneticButtons();
        initPhotoTileTilt();
    }
}

/* ---------- Home hero: staggered entrance on load ---------- */
function initHeroEntrance() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-content .eyebrow", { opacity: 0, y: 22, duration: 0.7 })
        .from(".hero-content h1", { opacity: 0, y: 46, duration: 0.9 }, "-=0.45")
        .from(".hero-content .hero-copy", { opacity: 0, y: 28, duration: 0.8 }, "-=0.55")
        .from(".hero-actions .btn", { opacity: 0, y: 22, stagger: 0.12, duration: 0.6 }, "-=0.5")
        .from(".hero-visual .chef-frame", { opacity: 0, scale: 0.92, duration: 1.1 }, "-=0.75")
        .from(".hero-card", { opacity: 0, y: 26, duration: 0.7 }, "-=0.55");
}

/* ---------- Gallery hero: staggered entrance on load ---------- */
function initGalleryHeroEntrance() {
    const galleryHero = document.querySelector(".gallery-hero");
    if (!galleryHero) return;

    gsap.from(".gallery-hero-inner > *", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.1
    });

    gsap.from(".album-toolbar", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.35
    });
}

/* ---------- Header: hide on scroll down, reveal on scroll up ----------
   The previous version created a new tween on every scroll-wheel tick,
   even when the header's target state hadn't changed, so an in-flight
   tween kept getting interrupted and restarted — that's what caused the
   stutter. Now we only fire a tween when the hidden/visible state
   actually flips. */
function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header || typeof ScrollTrigger === "undefined") return;

    gsap.set(header, { xPercent: -50, willChange: "transform" });

    let isHidden = false;

    ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
            const shouldHide = self.scroll() > 140 && self.direction === 1;
            if (shouldHide === isHidden) return;
            isHidden = shouldHide;

            gsap.to(header, {
                xPercent: -50,
                yPercent: isHidden ? -140 : 0,
                duration: 0.45,
                ease: "power2.out",
                overwrite: "auto"
            });
        }
    });
}

/* ---------- Parallax ---------- */
function initParallax() {
    if (typeof ScrollTrigger === "undefined") return;

    if (document.querySelector(".hero-wrap")) {
        gsap.to(".hero-chef img", {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-wrap",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        gsap.to(".hero-card", {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-wrap",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });
    }

    if (document.querySelector(".about-media")) {
        gsap.to(".about-main-image", {
            yPercent: -9,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        gsap.to(".about-floating-image", {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });
    }

    if (document.querySelector(".featured-service img")) {
        gsap.utils.toArray(".service-card img").forEach((img) => {
            gsap.to(img, {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                    trigger: img.closest(".service-card"),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            });
        });
    }
}

/* ---------- Section reveals on scroll ----------
   toggleActions now plays once and stops instead of reversing on
   scroll-up. Reversing looked good in theory, but with fast or
   momentum-based scrolling near the trigger point it caused elements
   to flicker in and out repeatedly — the "breaking" symptom. Playing
   once is the standard, jank-free pattern for content reveals. */
function initScrollReveals() {
    if (typeof ScrollTrigger === "undefined") return;

    reveal(".about-media", { y: 60, duration: 1 });
    reveal(".about-copy .eyebrow", { y: 24 });
    reveal(".about-copy h2", { y: 34 });
    reveal(".about-copy > p:not(.eyebrow)", { y: 26 });
    reveal(".about-points > div", { y: 24, stagger: 0.12 });

    reveal(".services-heading .eyebrow", { y: 24 });
    reveal(".services-heading h2", { y: 34 });
    reveal(".services-heading > p", { y: 26 });
    revealBatch(".service-card", { y: 60, scaleFrom: 0.96, stagger: 0.14 });
    reveal(".service-process", { y: 26 });

    reveal(".menu-heading .eyebrow", { y: 24 });
    reveal(".menu-heading h2", { y: 34 });
    reveal(".menu-heading > p:not(.eyebrow)", { y: 26 });
    revealBatch(".menu-group", { y: 50, scaleFrom: 0.97, stagger: 0.12 });

    reveal(".reviews-heading .eyebrow", { y: 24 });
    reveal(".reviews-heading h2", { y: 34 });
    reveal(".reviews-heading > p:not(.eyebrow)", { y: 26 });
    revealBatch(".featured-review, .review-card", { y: 50, scaleFrom: 0.97, stagger: 0.12 });

    reveal(".contact-card", { y: 50, duration: 1 });

    reveal(".footer-brand", { y: 26 });
    reveal(".footer-links", { y: 26, stagger: 0.1 });
    reveal(".footer-contact", { y: 26 });

    revealBatch(".photo-tile", { y: 46, scaleFrom: 0.95, stagger: 0.06 });
}

function reveal(selector, opts = {}) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;

    els.forEach((el) => {
        gsap.fromTo(
            el,
            { opacity: 0, y: opts.y ?? 40 },
            {
                opacity: 1,
                y: 0,
                duration: opts.duration ?? 0.85,
                ease: "power3.out",
                stagger: opts.stagger ?? 0,
                overwrite: "auto",
                scrollTrigger: {
                    trigger: el,
                    start: "top 87%",
                    toggleActions: "play none none none",
                    once: true
                }
            }
        );
    });
}

function revealBatch(selector, opts = {}) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;

    ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
            gsap.fromTo(
                batch,
                { opacity: 0, y: opts.y ?? 50, scale: opts.scaleFrom ?? 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: opts.stagger ?? 0.12,
                    overwrite: "auto"
                }
            )
    });
}

/* ---------- Magnetic, "alive" buttons ---------- */
function initMagneticButtons() {
    const canHover = window.matchMedia("(pointer: fine)").matches;
    const buttons = document.querySelectorAll(".btn, .nav-cta");

    buttons.forEach((btn) => {
        gsap.set(btn, { transformOrigin: "50% 50%", willChange: "transform" });

        if (canHover) {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, {
                    x: relX * 0.28,
                    y: relY * 0.4,
                    scale: 1.04,
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: "auto"
                });
            });

            btn.addEventListener("mouseleave", () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.4)",
                    overwrite: "auto"
                });
            });
        }

        btn.addEventListener("mousedown", () => {
            gsap.to(btn, { scale: 0.94, duration: 0.15, ease: "power2.out", overwrite: "auto" });
        });

        btn.addEventListener(
            "touchstart",
            () => {
                gsap.to(btn, { scale: 0.94, duration: 0.15, ease: "power2.out", overwrite: "auto" });
            },
            { passive: true }
        );

        ["mouseup", "touchend", "touchcancel"].forEach((evt) => {
            btn.addEventListener(evt, () => {
                gsap.to(btn, {
                    scale: canHover ? 1.04 : 1,
                    duration: 0.35,
                    ease: "back.out(2)",
                    overwrite: "auto"
                });
            });
        });
    });

    // Brand mark gets a small playful spin on hover
    document.querySelectorAll(".brand-mark").forEach((mark) => {
        const brand = mark.closest(".brand");
        if (!brand) return;
        brand.addEventListener("mouseenter", () => {
            gsap.to(mark, { rotate: 12, scale: 1.08, duration: 0.35, ease: "back.out(2.5)", overwrite: "auto" });
        });
        brand.addEventListener("mouseleave", () => {
            gsap.to(mark, { rotate: 0, scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        });
    });
}

/* ---------- Gallery photo tiles: subtle 3D tilt on hover ---------- */
function initPhotoTileTilt() {
    const canHover = window.matchMedia("(pointer: fine)").matches;
    if (!canHover) return;

    document.querySelectorAll(".photo-tile").forEach((tile) => {
        gsap.set(tile, { willChange: "transform" });

        tile.addEventListener("mousemove", (e) => {
            const rect = tile.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(tile, {
                rotateX: relY * -8,
                rotateY: relX * 8,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 600,
                overwrite: "auto"
            });
        });

        tile.addEventListener("mouseleave", () => {
            gsap.to(tile, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        });
    });
}
