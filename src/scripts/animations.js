import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!reducedMotion) {
  // LENIS
  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    lerp: 0.08,
    wheelMultiplier: 1,
  });

  // GSAP + LENIS INTEGRATION
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // HERO INTRO
  const intro = gsap.timeline({
    defaults: {
      ease: "power4.out",
    },
  });

  intro
    .from(".navbar", {
      y: -30,
      opacity: 0,
      duration: 1,
    })
    .from(
      ".hero-kicker",
      {
        y: 20,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.5"
    )
    .from(
      ".title-line",
      {
        yPercent: 110,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
      },
      "-=0.3"
    )
    .from(
      ".hero-bottom",
      {
        y: 30,
        opacity: 0,
        duration: 0.9,
      },
      "-=0.6"
    )
    .from(
      ".hero-orb",
      {
        scale: 0.5,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
      },
      "-=1"
    );

  // ORB PARALLAX
  gsap.to(".hero-orb", {
    yPercent: 35,
    rotation: 90,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  // REVEAL ANIMATIONS
  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });

  // SCROLL PROGRESS
  const progress = document.querySelector("#scroll-progress");

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      gsap.set(progress, {
        scaleX: self.progress,
      });
    },
  });

  // REFRESH AFTER ASSETS LOAD
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
}