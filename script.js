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

  /* ---------- Accounts storage ---------- */
  const USERS_KEY = "mts_users";
  const SESSION_KEY = "mts_session";

  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore broken storage */
    }
    const seed = {
      demo: { password: "demo123", balance: 450, tariffs: [] }
    };
    saveUsers(seed);
    return seed;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      showToast("Не удалось сохранить данные");
    }
  }

  function loadSession() {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveSession(login) {
    try {
      if (login) localStorage.setItem(SESSION_KEY, login);
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- Login / account ---------- */
  const loginBtn = document.getElementById("login-btn");
  const loginModal = document.getElementById("login-modal");
  const loginClose = document.getElementById("login-close");
  const loginForm = document.getElementById("login-form");
  const loginStatus = document.getElementById("login-status");
  const accountLink = document.getElementById("account-link");
  const accountSection = document.getElementById("account");
  const accountUser = document.getElementById("account-user");
  const accountBalance = document.getElementById("account-balance");
  const accountTariffsList = document.getElementById("account-tariffs-list");
  const logoutBtn = document.getElementById("logout-btn");

  let currentUser = loadSession();
  if (currentUser && !Object.prototype.hasOwnProperty.call(loadUsers(), currentUser)) {
    currentUser = null;
    saveSession(null);
  }

  function openModal() {
    if (!loginModal) return;
    loginStatus.textContent = "";
    loginStatus.className = "form__status";
    loginModal.classList.add("modal--open");
    document.body.classList.add("no-scroll");
    document.getElementById("login").focus();
  }

  function closeModal() {
    if (!loginModal) return;
    loginModal.classList.remove("modal--open");
    document.body.classList.remove("no-scroll");
  }

  function renderAccount() {
    if (!currentUser) {
      if (accountSection) accountSection.style.display = "none";
      if (loginBtn) loginBtn.hidden = false;
      return;
    }
    const user = loadUsers()[currentUser];
    if (!user) return;

    if (loginBtn) loginBtn.hidden = true;
    if (accountSection) accountSection.style.display = "block";
    if (accountUser) accountUser.textContent = "Логин: " + currentUser;
    if (accountBalance) accountBalance.textContent = user.balance + " ₽";

    if (accountTariffsList) {
      accountTariffsList.innerHTML = "";
      if (!user.tariffs.length) {
        const empty = document.createElement("p");
        empty.className = "account__empty";
        empty.textContent = "Нет подключённых тарифов";
        accountTariffsList.appendChild(empty);
      }
      user.tariffs.forEach(function (tariff) {
        const row = document.createElement("div");
        row.className = "account__tariff";

        const name = document.createElement("div");
        name.className = "account__tariff-name";
        name.textContent = tariff.name;

        const meta = document.createElement("div");
        meta.className = "account__tariff-meta";
        meta.textContent = "Подключён " + tariff.date;

        const price = document.createElement("div");
        price.className = "account__tariff-price";
        price.textContent = tariff.price + " ₽/мес";

        const info = document.createElement("div");
        info.appendChild(name);
        info.appendChild(meta);

        row.appendChild(info);
        row.appendChild(price);
        accountTariffsList.appendChild(row);
      });
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", openModal);
  }

  if (accountLink) {
    accountLink.addEventListener("click", function (event) {
      if (!currentUser) {
        event.preventDefault();
        openModal();
      }
    });
  }

  if (loginClose) {
    loginClose.addEventListener("click", closeModal);
  }

  if (loginModal) {
    loginModal.addEventListener("click", function (event) {
      if (event.target === loginModal) closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && loginModal && loginModal.classList.contains("modal--open")) {
      closeModal();
    }
  });

  if (loginForm && loginStatus) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const login = loginForm.elements.login.value.trim();
      const password = loginForm.elements.password.value;
      const users = loadUsers();
      const exists = Object.prototype.hasOwnProperty.call(users, login);

      if (!exists || users[login].password !== password) {
        loginStatus.textContent = "Неверный логин или пароль";
        loginStatus.className = "form__status form__status--error";
        return;
      }

      currentUser = login;
      saveSession(login);
      loginForm.reset();
      closeModal();
      renderAccount();
      showToast("Добро пожаловать, " + login + "!");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      currentUser = null;
      saveSession(null);
      renderAccount();
      showToast("Вы вышли из личного кабинета");
    });
  }

  /* ---------- Tariff buttons (subscribe with charge) ---------- */
  const tariffButtons = document.querySelectorAll("[data-tariff]");
  tariffButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const name = button.getAttribute("data-tariff");

      if (!currentUser) {
        showToast("Войдите в личный кабинет, чтобы подключить тариф");
        openModal();
        return;
      }

      const card = button.closest(".tariff");
      const priceEl = card ? card.querySelector(".tariff__price") : null;
      const price = priceEl ? parseInt(priceEl.textContent.replace(/\D/g, ""), 10) : 0;

      const users = loadUsers();
      const user = users[currentUser];

      if (user.tariffs.some(function (t) { return t.name === name; })) {
        showToast('Тариф "' + name + '" уже подключён');
        return;
      }

      if (user.balance < price) {
        showToast("Недостаточно средств для подключения тарифа");
        return;
      }

      user.balance -= price;
      user.tariffs.push({
        name: name,
        price: price,
        date: new Date().toLocaleDateString("ru-RU")
      });
      saveUsers(users);
      renderAccount();
      showToast('Тариф "' + name + '" подключён, списано ' + price + " ₽");
    });
  });

  renderAccount();

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
