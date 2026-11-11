
export function initPlayground() {
  const stage = document.querySelector("[data-playground]");
  const canvas = document.querySelector("[data-playground-canvas]");
  const modeButton = document.querySelector("[data-field-toggle]");
  const modeLabel = document.querySelector("[data-field-mode]");
  const statusLabel = document.querySelector("[data-field-status]");
  const hintLabel = document.querySelector("[data-field-hint]");

  if (!stage || !canvas || !modeButton) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const pointer = {
    x: -1000,
    y: -1000,
    active: false,
    radius: 180,
  };

  const particles = [];
  const ripples = [];

  let width = 0;
  let height = 0;
  let animationFrame = null;
  let mode = "attract";
  let lastFrame = 0;

  const isTouchDevice = window.matchMedia(
    "(pointer: coarse)"
  ).matches;

  const particleCount = () => {
    const area = width * height;
    const density = isTouchDevice ? 0.000045 : 0.000075;

    return Math.min(
      150,
      Math.max(35, Math.floor(area * density))
    );
  };

  function createParticles() {
    particles.length = 0;

    const count = particleCount();

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
    draw();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75
    );

    gradient.addColorStop(0, "#151a30");
    gradient.addColorStop(0.55, "#101014");
    gradient.addColorStop(1, "#090909");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawConnections() {
    const maxDistance = 115;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];

        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.28;

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(75, 105, 255, ${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function updateParticles(time) {
    for (const particle of particles) {
      particle.phase += 0.008;

      const driftX = Math.sin(particle.phase) * 0.12;
      const driftY = Math.cos(particle.phase * 0.8) * 0.12;

      particle.vx += driftX;
      particle.vy += driftY;

      if (pointer.active) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < pointer.radius && distance > 0) {
          const force = (1 - distance / pointer.radius) * 0.16;
          const direction = mode === "attract" ? 1 : -1;

          particle.vx += (dx / distance) * force * direction;
          particle.vy += (dy / distance) * force * direction;
        }
      }

      particle.vx *= 0.96;
      particle.vy *= 0.96;

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }

      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }
    }
  }

  function drawParticles() {
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#d6ff45";
      ctx.shadowBlur = 9;
      ctx.shadowColor = "rgba(214, 255, 69, 0.5)";
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];

      ripple.radius += 3;
      ripple.opacity -= 0.012;

      ctx.beginPath();
      ctx.arc(
        ripple.x,
        ripple.y,
        ripple.radius,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle = `rgba(214, 255, 69, ${Math.max(
        0,
        ripple.opacity
      )})`;

      ctx.lineWidth = 1;
      ctx.stroke();

      if (ripple.opacity <= 0) {
        ripples.splice(i, 1);
      }
    }
  }

  function draw() {
    drawBackground();
    drawConnections();
    drawParticles();
    drawRipples();
  }

  function animate(time = 0) {
    if (time - lastFrame < 30) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    lastFrame = time;

    updateParticles(time);
    draw();

    animationFrame = requestAnimationFrame(animate);
  }

  function createRipple(x, y) {
    ripples.push({
      x,
      y,
      radius: 5,
      opacity: 0.65,
    });
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;

    if (hintLabel) {
      hintLabel.textContent = "FIELD DISTURBED / EXPLORE MORE";
    }
  }

  function resetPointer() {
    pointer.active = false;
    pointer.x = -1000;
    pointer.y = -1000;

    if (hintLabel) {
      hintLabel.textContent = "MOVE YOUR CURSOR TO EXPLORE";
    }
  }

  function handleClick(event) {
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    createRipple(x, y);
  }

  function toggleMode() {
    mode = mode === "attract" ? "repel" : "attract";

    modeLabel.textContent = mode.toUpperCase();
    modeButton.setAttribute(
      "aria-label",
      `Switch to ${mode === "attract" ? "repel" : "attract"} mode`
    );
  }

  modeButton.addEventListener("click", toggleMode);

  canvas.addEventListener("pointermove", updatePointer);
  canvas.addEventListener("pointerleave", resetPointer);
  canvas.addEventListener("pointerdown", handleClick);

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(stage);

  resizeCanvas();

  if (reducedMotion) {
    statusLabel.textContent = "STATIC MODE";
    return () => {
      resizeObserver.disconnect();
      modeButton.removeEventListener("click", toggleMode);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", resetPointer);
      canvas.removeEventListener("pointerdown", handleClick);
    };
  }

  animationFrame = requestAnimationFrame(animate);

  statusLabel.textContent = "ACTIVE";

  return () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();

    modeButton.removeEventListener("click", toggleMode);
    canvas.removeEventListener("pointermove", updatePointer);
    canvas.removeEventListener("pointerleave", resetPointer);
    canvas.removeEventListener("pointerdown", handleClick);
  };
}
