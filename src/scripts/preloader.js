
import gsap from "gsap";

export function initPreloader() {
  const loader = document.querySelector("#preloader");
  const counter = document.querySelector("#preloader-counter");
  const progress = document.querySelector("#preloader-progress");

  if (!loader || !counter || !progress) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;

    if (reducedMotion) {
      loader.remove();
      document.body.classList.remove("is-loading");
      window.dispatchEvent(new Event("obscura:ready"));
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        loader.remove();
        document.body.classList.remove("is-loading");
        window.dispatchEvent(new Event("obscura:ready"));
      },
    });

    timeline
      .to(".preloader-center", {
        y: -35,
        opacity: 0,
        duration: 0.45,
        ease: "power3.in",
      })
      .to(loader, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
      }, "-=0.1");
  }

  let value = 0;

  const counterTimer = window.setInterval(() => {
    value = Math.min(value + Math.ceil(Math.random() * 9), 90);
    counter.textContent = String(value).padStart(3, "0");
    progress.style.width = `${value}%`;
  }, 45);

  function completeLoading() {
    window.clearInterval(counterTimer);
    counter.textContent = "100";
    progress.style.width = "100%";

    window.setTimeout(finish, 250);
  }

  if (document.readyState === "complete") {
    completeLoading();
  } else {
    window.addEventListener("load", completeLoading, { once: true });
  }

  // Fallback jika event load terlalu lama.
  window.setTimeout(completeLoading, 5000);
}
