const weddingDate = new Date("2025-11-01T11:00:00");
const countdownRefs = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const galleryImages = [
  {
    src: "../assets/_wedding/gallary/wed.png",
    alt: "Captured memory from our journey together",
    caption: "A favorite moment where laughter and love filled the frame.",
    position: "center",
  },
];

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    countdownRefs.days.textContent = "00";
    countdownRefs.hours.textContent = "00";
    countdownRefs.minutes.textContent = "00";
    countdownRefs.seconds.textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownRefs.days.textContent = String(days).padStart(2, "0");
  countdownRefs.hours.textContent = String(hours).padStart(2, "0");
  countdownRefs.minutes.textContent = String(minutes).padStart(2, "0");
  countdownRefs.seconds.textContent = String(seconds).padStart(2, "0");
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

const floatingContainer = document.querySelector(".floating-assets");
const assetImages = [
  "../assets/_wedding/random_show/1.png",
  "../assets/_wedding/random_show/2.png",
  "../assets/_wedding/random_show/3.png",
  "../assets/_wedding/random_show/4.png",
  "../assets/_wedding/random_show/5.png",
  "../assets/_wedding/random_show/6.png",
  "../assets/_wedding/random_show/20.png",
  "../assets/_wedding/random_show/ChatGPT Image 2025年10月11日 00_25_33.png",
  "../assets/_wedding/random_show/可爱抱抱.jpg",
];

function createFloatingAssets(count = 12) {
  if (!floatingContainer) return;

  for (let i = 0; i < count; i += 1) {
    const asset = document.createElement("span");
    const size = Math.floor(Math.random() * 100) + 80;
    const delay = Math.random() * 12;
    const duration = Math.random() * 18 + 18;
    const opacity = Math.random() * 0.18 + 0.08;
    const image = assetImages[Math.floor(Math.random() * assetImages.length)];

    asset.style.width = `${size}px`;
    asset.style.height = `${size}px`;
    asset.style.left = `${Math.random() * 100}%`;
    asset.style.top = `${Math.random() * 100}%`;
    asset.style.animationDelay = `${delay}s`;
    asset.style.animationDuration = `${duration}s`;
    asset.style.opacity = opacity;
    asset.style.backgroundImage = `url("${image}")`;

    floatingContainer.appendChild(asset);
  }
}

function initFloatingAssets() {
  createFloatingAssets(14);
}

function initGallery() {
  const galleryGrid = document.querySelector("[data-gallery]");
  if (!galleryGrid) return;

  galleryGrid.innerHTML = "";

  galleryImages.forEach((item) => {
    const figure = document.createElement("figure");
    figure.classList.add("animate-on-scroll");

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";
    if (item.position) {
      image.style.objectPosition = item.position;
    }

    const caption = document.createElement("figcaption");
    caption.textContent = item.caption;

    figure.appendChild(image);
    figure.appendChild(caption);
    galleryGrid.appendChild(figure);
  });
}

const rsvpForm = document.getElementById("rsvp-form");
const successBanner = document.getElementById("form-success");

function handleRsvpSubmit(event) {
  event.preventDefault();
  if (!rsvpForm || !successBanner) return;

  const formData = new FormData(rsvpForm);

  const record = {
    name: formData.get("guestName"),
    phone: formData.get("guestPhone"),
    guests: formData.get("guestCount"),
    meal: formData.get("mealPreference"),
    message: formData.get("message"),
    time: new Date().toISOString(),
  };

  const stored = JSON.parse(localStorage.getItem("wedding-rsvp") || "[]");
  stored.push(record);
  localStorage.setItem("wedding-rsvp", JSON.stringify(stored));

  rsvpForm.reset();
  successBanner.style.display = "block";
  successBanner.setAttribute("aria-live", "polite");
  successBanner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function initRsvpForm() {
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", handleRsvpSubmit);
  }
}

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15,
    },
  );

  animatedElements.forEach((element) => observer.observe(element));
}

function initSectionNavigation() {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!sections.length) return;

  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const progressDots = Array.from(document.querySelectorAll(".progress-dot[data-scroll-target]"));

  const scrollToSection = (selector) => {
    if (!selector) return;
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const setActiveSection = (id) => {
    if (!id) return;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === id);
    });
    progressDots.forEach((dot) => {
      dot.classList.toggle("is-active", dot.dataset.scrollTarget === id);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        event.preventDefault();
        scrollToSection(href);
        setActiveSection(href);
      }
    });
  });

  progressDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = dot.dataset.scrollTarget;
      scrollToSection(target);
      setActiveSection(target);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveSection(`#${visibleEntry.target.id}`);
      }
    },
    {
      root: null,
      threshold: 0.35,
      rootMargin: "-25% 0px -55% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
  setActiveSection(`#${sections[0].id}`);
}

window.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initFloatingAssets();
  initRsvpForm();
  initGallery();
  initScrollAnimations();
  initSectionNavigation();
});

