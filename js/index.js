const openBtn = document.querySelectorAll("[data-open]");
const closeBtn = document.querySelector("[data-close]");
const backdrop = document.querySelector("[data-backdrop]");
const serviceInput = document.getElementById("modal-service-input");

const openBurger = document.querySelector("[data-openBurger]");
const closeBurger = document.querySelector("[data-closeBurger]");
const burgerBackdrop = document.querySelector("[data-burgerBackdrop]");
const burgerLinks = document.querySelectorAll("[data-bur-links]");
const headerMenu = document.querySelector(".header__menu");

// =======================
// HEADER SCROLL
// =======================
function handleScroll() {
  if (window.innerWidth >= 1200) {
    if (window.scrollY > 50) {
      headerMenu.classList.add("header__menu--small");
    } else {
      headerMenu.classList.remove("header__menu--small");
    }
  } else {
    headerMenu.classList.remove("header__menu--small");
  }
}
window.addEventListener("scroll", handleScroll);

// =======================
// BURGER
// =======================
burgerLinks.forEach((link) => {
  link.addEventListener("click", () => {
    burgerBackdrop.classList.add("is-hidden");
    document.body.classList.remove("no-scroll");
  });
});

openBurger.addEventListener("click", () => {
  burgerBackdrop.classList.remove("is-hidden");
  document.body.classList.add("no-scroll");
});

closeBurger.addEventListener("click", () => {
  burgerBackdrop.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
});

// =======================
// RESET MODAL
// =======================
function resetModal() {
  const form = backdrop.querySelector("form");
  const orderForm = backdrop.querySelector("[data-order-form]");
  const success = backdrop.querySelector("[data-success]");
  const error = backdrop.querySelector("[data-error]");
  const order = backdrop.querySelector("[data-order]");
  const submitBtn = backdrop.querySelector('button[type="submit"]');

  if (form) form.reset();

  if (orderForm) orderForm.classList.remove("is-hidden");
  if (success) success.classList.add("is-hidden");
  if (error) error.classList.add("is-hidden");

  if (order) order.textContent = "";

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Відправити";
  }

  // очищаем услугу
  serviceInput.value = "";
}

// =======================
// OPEN MODAL
// =======================
openBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const serviceName = btn.dataset.service;
    serviceInput.value = serviceName;

    backdrop.classList.remove("is-hidden");
    document.body.classList.add("no-scroll");
  });
});

// =======================
// CLOSE MODAL
// =======================
function closeModal() {
  backdrop.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
  resetModal();
}

backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) {
    closeModal();
  }
});

closeBtn.addEventListener("click", () => {
  closeModal();
});

// =======================
// SEND TO TELEGRAM
// =======================
async function sendToTelegram(data) {
  try {
    const response = await fetch("/.netlify/functions/send-tg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Ошибка сети:", error);
    return false;
  }
}

// =======================
// FORMS
// =======================
const forms = document.querySelectorAll("form");

forms.forEach((form) => {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Honeypot ---
    const honeypot = form.querySelector('input[name="company"]');
    if (honeypot && honeypot.value.trim() !== "") {
      console.warn("Bot detected 🐛");
      return;
    }

    // --- ID ---
    const orderId = "OD-" + Date.now().toString().slice(-6);

    const formattedDate = new Date().toLocaleString("uk-UA", {
      timeZone: "Europe/Kyiv",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // --- DATA ---
    const fd = new FormData(form);
    const formData = {
      orderId,
      date: formattedDate,
      name: fd.get("name"),
      phone: fd.get("telephone"),
      service: fd.get("service"),
      comment: fd.get("comment"),
    };

    // --- VALIDATION ---
    if (!formData.name || !formData.phone) {
      alert("Заповніть обов'язкові поля");
      return;
    }

    // --- UI ---
    const messageSuccess = backdrop.querySelector("[data-success]");
    const messageError = backdrop.querySelector("[data-error]");
    const messageOrder = backdrop.querySelector("[data-order]");
    const orderForm = backdrop.querySelector("[data-order-form]");
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Відправка...";
    }

    // --- SEND ---
    const success = await sendToTelegram(formData);

    if (success) {
      form.reset();
      orderForm.classList.add("is-hidden");
      messageOrder.textContent = orderId;
      messageSuccess.classList.remove("is-hidden");
    } else {
      messageError.classList.remove("is-hidden");
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Відправити";
    }
  });
});
