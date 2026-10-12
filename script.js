(function () {
  "use strict";

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toast = document.getElementById("toast");
  const toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("toast--show");
    }, 2600);
  }

  // Burger menu toggle
  if (burger && nav) {
    burger.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("nav--open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", function (event) {
      // Close burger when navigating to a link
      if (event.target.classList.contains("nav__link")) {
        nav.classList.remove("nav--open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Tariff buttons
  const tariffButtons = document.querySelectorAll("[data-tariff]");
  tariffButtons.forEach(button => {
    button.addEventListener("click", function () {
      showToast(`Тариф "${button.getAttribute("data-tariff")}" подключён`);
    });
  });

  // Top-up button
  const topup = document.getElementById("topup");
  const balance = document.getElementById("balance");
  if (topup && balance) {
    topup.addEventListener("click", function () {
      const current = balance ? parseInt(balance.textContent, 10) : 0;
      balance.textContent = current + 100 + " ₽";
      showToast("Баланс пополнен на 100 ₽");
    });
  }

  // Support form
  const form = document.getElementById("support-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();

      if (!name || !phone) {
        status.textContent = "Заполните имя и телефон";
        status.className = "form__status form__status--error";
        return;
      }

      status.textContent = `Спасибо, ${name}! Мы свяжемся с вами.`;
      status.className = "form__status form__status--ok";
      form.reset();
    });
  }
})();
