
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initCinematic() {
  const media = gsap.matchMedia();

  // Kinetic typography
  gsap.utils.toArray(".philosophy-line").forEach((line, index) => {
    gsap.from(line, {
      yPercent: 110,
      opacity: 0,
      duration: 1.1,
      ease: "power4.out",
      delay: index * 0.12,
      scrollTrigger: {
        trigger: ".philosophy-heading",
        start: "top 80%",
        once: true,
      },
    });
  });

  // Desktop horizontal scrolling
  media.add("(min-width: 769px)", () => {
    const section = document.querySelector(".experiments");
    const track = document.querySelector(".experiment-track");

    if (!section || !track) return;

    const getDistance = () =>
      Math.max(0, track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.from(".experiments-heading", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
      },
    });
  });

  // Mobile: normal vertical layout
  media.add("(max-width: 768px)", () => {
    gsap.from(".experiment-card", {
      y: 45,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".experiment-track",
        start: "top 85%",
        once: true,
      },
    });
  });

  return () => media.revert();
}
