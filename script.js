// Theme toggle and print handlers
(function () {
  const themeToggle = document.getElementById("theme-toggle");
  const printBtn = document.getElementById("print-btn");
  const yearSpan = document.getElementById("year");

  // Dynamic Year
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Theme Handling
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
    });
  }

  // Print Handler
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
})();
