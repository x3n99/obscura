import gsap from "gsap";

export function initInteractions() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) return;

  const elements = document.querySelectorAll(".magnetic");

  elements.forEach((element) => {
    const xTo = gsap.quickTo(element, "x", {
      duration: 0.4,
      ease: "power3.out",
    });

    const yTo = gsap.quickTo(element, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    element.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const bounds = element.getBoundingClientRect();

      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;

      xTo(x * 0.2);
      yTo(y * 0.2);
    });

    element.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}