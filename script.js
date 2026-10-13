(function () {
  "use strict";

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toast = document.getElementById("toast");
  const header = document.querySelector(".header");
  const backToTop = document.getElementById("back-to-top");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("toast--show");
    }, 2600);
  }

  /* ---------- Burger menu ---------- */
  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove("nav--open");
    burger.classList.remove("burger--active");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("nav--open");
      burger.classList.toggle("burger--active", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("no-scroll", isOpen);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.classList.contains("nav__link")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("nav--open")) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      closeMenu();
    });
  }

  /* ---------- Tariff buttons ---------- */
  const tariffButtons = document.querySelectorAll("[data-tariff]");
  tariffButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      showToast('Тариф "' + button.getAttribute("data-tariff") + '" подключён');
    });
  });

  /* ---------- Top-up button ---------- */
  const topup = document.getElementById("topup");
  const balance = document.getElementById("balance");
  if (topup && balance) {
    topup.addEventListener("click", function () {
      const parsed = parseInt(balance.textContent.replace(/[^\d]/g, ""), 10);
      const current = isNaN(parsed) ? 0 : parsed;
      balance.textContent = current + 100 + " ₽";
      showToast("Баланс пополнен на 100 ₽");
    });
  }

  /* ---------- Phone mask ---------- */
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      const digits = phoneInput.value.replace(/\D/g, "");
      let normalized = digits;
      if (normalized.startsWith("8")) normalized = "7" + normalized.slice(1);
      if (normalized.startsWith("9")) normalized = "7" + normalized;
      normalized = normalized.slice(0, 11);

      let formatted = "";
      if (normalized.length > 0) {
        formatted = "+" + normalized[0];
        if (normalized.length > 1) formatted += " (" + normalized.slice(1, 4);
        if (normalized.length >= 5) formatted += ") " + normalized.slice(4, 7);
        if (normalized.length >= 8) formatted += "-" + normalized.slice(7, 9);
        if (normalized.length >= 10) formatted += "-" + normalized.slice(9, 11);
      }
      phoneInput.value = formatted;
    });
  }

  /* ---------- Support form ---------- */
  const form = document.getElementById("support-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const phone = form.elements.phone.value.trim();
      const phoneDigits = phone.replace(/\D/g, "");

      if (name.length < 2) {
        status.textContent = "Введите имя (минимум 2 символа)";
        status.className = "form__status form__status--error";
        return;
      }

      if (phoneDigits.length < 11) {
        status.textContent = "Введите корректный номер телефона";
        status.className = "form__status form__status--error";
        return;
      }

      status.textContent = "Спасибо, " + name + "! Мы свяжемся с вами.";
      status.className = "form__status form__status--ok";
      form.reset();
    });
  }

  /* ---------- Header on scroll ---------- */
  function onScroll() {
    const scrolled = window.scrollY > 10;
    if (header) header.classList.toggle("header--scrolled", scrolled);
    if (backToTop) backToTop.classList.toggle("back-to-top--show", window.scrollY > 400);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 4, 3) * 80 + "ms";
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add("reveal--visible");
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10);
          const suffix = el.getAttribute("data-suffix") || "";
          const duration = 1400;
          const start = performance.now();

          function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ---------- Active nav (scroll-spy) ---------- */
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("main section[id]");
  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            const isActive = link.getAttribute("href") === "#" + id;
            link.classList.toggle("nav__link--active", isActive);
            if (isActive) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }
})();
