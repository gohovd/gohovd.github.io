// gohost.no — Theme, scroll reveal, skill animations, active nav
(function () {
  // --- Dynamic Year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Theme ---
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  document.documentElement.setAttribute(
    "data-theme",
    saved === "dark" || (!saved && prefersDark) ? "dark" : "light"
  );

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  // --- Scroll Reveal ---
  const revealEls = () => {
    document.querySelectorAll(
      ".tl-entry, .skill-group, .proj-card, .about-text"
    ).forEach((el) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });
  };
  revealEls();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // --- Skill Bar & Ring Animation ---
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate bars
          entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
            bar.classList.add("animated");
          });
          // Animate rings
          entry.target.querySelectorAll(".ring-fill").forEach((ring) => {
            ring.classList.add("animated");
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document
    .querySelectorAll(".skill-bars, .skill-rings")
    .forEach((el) => skillObserver.observe(el));

  // --- Active Nav Link ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const updateNav = () => {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 80;
      if (window.scrollY >= top) current = sec.getAttribute("id");
    });
    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });
  };

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
})();
