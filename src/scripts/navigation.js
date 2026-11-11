import gsap from "gsap";

export function initNavigation() {
  const toggle = document.querySelector("#menu-toggle");
  const overlay = document.querySelector("#navigation-overlay");

  if (!toggle || !overlay) return;

  const label = toggle.querySelector(".menu-label");
  const links = overlay.querySelectorAll(".navigation-link");
  const navText = overlay.querySelectorAll(
    ".navigation-top, .navigation-bottom"
  );

  let isOpen = false;
  let isAnimating = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  gsap.set(overlay, {
    yPercent: -100,
  });

  gsap.set(links, {
    y: 70,
    opacity: 0,
  });

  gsap.set(navText, {
    opacity: 0,
  });

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      ease: "power4.out",
    },
    onStart: () => {
      isAnimating = true;
    },
    onComplete: () => {
      isAnimating = false;
    },
    onReverseComplete: () => {
      isAnimating = false;
      overlay.inert = true;
      overlay.setAttribute("aria-hidden", "true");
    },
  });

  timeline
    .to(overlay, {
      yPercent: 0,
      duration: reducedMotion ? 0 : 0.8,
    })
    .to(
      navText,
      {
        opacity: 1,
        duration: 0.4,
      },
      "-=0.3"
    )
    .to(
      links,
      {
        y: 0,
        opacity: 1,
        stagger: 0.09,
        duration: 0.7,
      },
      "-=0.2"
    );

  function openMenu() {
    if (isOpen || isAnimating) return;

    isOpen = true;

    overlay.inert = false;
    overlay.setAttribute("aria-hidden", "false");

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");

    label.textContent = "CLOSE";

    document.body.classList.add("menu-open");

    timeline.play();
  }

  function closeMenu() {
    if (!isOpen || isAnimating) return;

    isOpen = false;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");

    label.textContent = "MENU";

    document.body.classList.remove("menu-open");

    timeline.reverse();
  }

  toggle.addEventListener("click", () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      closeMenu();
      toggle.focus();
    }
  });

  return {
    openMenu,
    closeMenu,
  };
}