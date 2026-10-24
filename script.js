"use strict";
const menuButton = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
function closeMenu() {
  menu?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}
menuButton?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
menu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    if (menu?.contains(document.activeElement)) menuButton.focus();
  }
});
const slides = [...document.querySelectorAll(".slide")];
const pauseButton = document.getElementById("pauseSlider");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let index = 0,
  timer = null,
  paused = reducedMotion.matches;
function updateSlider() {
  window.clearInterval(timer);
  pauseButton?.setAttribute("aria-pressed", String(paused));
  if (pauseButton)
    pauseButton.textContent = paused ? "Reproduzir imagens" : "Pausar imagens";
  if (!paused && !document.hidden && slides.length > 1)
    timer = window.setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 6500);
}
pauseButton?.addEventListener("click", () => {
  paused = !paused;
  updateSlider();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  updateSlider();
});
document.addEventListener("visibilitychange", updateSlider);
updateSlider();
