
import * as THREE from "three";

export function initWebGL() {
  const stage = document.querySelector("[data-webgl-stage]");
  const canvas = document.querySelector("[data-webgl-canvas]");
  const fallback = document.querySelector("[data-webgl-fallback]");

  if (!stage || !canvas) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (error) {
    console.error("WebGL initialization failed:", error);

    if (fallback) fallback.hidden = false;
    return;
  }

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );

  renderer.setSize(
    stage.clientWidth,
    stage.clientHeight,
    false
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    stage.clientWidth / stage.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 5.5);

  const group = new THREE.Group();
  scene.add(group);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };

  const geometry = new THREE.SphereGeometry(
    1.35,
    128,
    128
  );

  const material = new THREE.ShaderMaterial({
    uniforms,

    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;

      void main() {
        vec3 transformed = position;
        vec3 normal = normalize(normal);

        float waveA = sin(position.x * 3.5 + uTime * 0.8);
        float waveB = cos(position.y * 3.0 - uTime * 0.65);
        float waveC = sin(position.z * 4.0 + uTime * 0.5);

        float baseWave = waveA * waveB * waveC;

        vec2 mouseDirection = normalize(uMouse + vec2(0.001));
        float mouseEffect = dot(normal.xy, mouseDirection);

        float displacement =
          baseWave * 0.12 +
          mouseEffect * length(uMouse) * 0.16;

        transformed += normal * displacement;

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

        vNormal = normalize(normalMatrix * normal);
        vViewPosition = -mvPosition.xyz;
        vWave = baseWave;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,

    fragmentShader: `
      uniform float uTime;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;

      void main() {
        vec3 blue = vec3(0.12, 0.22, 0.95);
        vec3 lime = vec3(0.84, 1.0, 0.27);
        vec3 dark = vec3(0.025, 0.035, 0.09);

        float waveMix = smoothstep(-0.8, 0.8, vWave);

        vec3 baseColor = mix(blue, lime, waveMix * 0.65);

        vec3 viewDirection = normalize(vViewPosition);
        float fresnel = pow(
          1.0 - abs(dot(normalize(vNormal), viewDirection)),
          2.5
        );

        vec3 finalColor = mix(
          dark,
          baseColor,
          0.45 + waveMix * 0.35
        );

        finalColor += lime * fresnel * 0.55;

        float pulse = 0.92 + sin(uTime * 1.2) * 0.08;
        finalColor *= pulse;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });

  const mainObject = new THREE.Mesh(geometry, material);
  group.add(mainObject);

  // Wireframe shell
  const wireGeometry = new THREE.IcosahedronGeometry(1.52, 3);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x3155ff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });

  const wireObject = new THREE.Mesh(
    wireGeometry,
    wireMaterial
  );

  group.add(wireObject);

  // Orbit ring
  const ringGeometry = new THREE.TorusGeometry(
    2.0,
    0.004,
    8,
    160
  );

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xd6ff45,
    transparent: true,
    opacity: 0.65,
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);

  ring.rotation.x = Math.PI * 0.35;
  ring.rotation.y = Math.PI * 0.12;

  group.add(ring);

  const pointer = new THREE.Vector2(0, 0);

  function handlePointerMove(event) {
    const rect = stage.getBoundingClientRect();

    pointer.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    uniforms.uMouse.value.copy(pointer);
  }

  function handlePointerLeave() {
    pointer.set(0, 0);
    uniforms.uMouse.value.set(0, 0);
  }

  stage.addEventListener("pointermove", handlePointerMove);
  stage.addEventListener("pointerleave", handlePointerLeave);

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  const clock = new THREE.Clock();

  let animationFrame = null;
  let isVisible = true;
  let destroyed = false;


  function renderFrame() {
    if (destroyed) return;

    const elapsed = clock.getElapsedTime();

    uniforms.uTime.value = elapsed;

    group.rotation.y =
      elapsed * 0.12 + pointer.x * 0.22;

    group.rotation.x =
      Math.sin(elapsed * 0.2) * 0.08 + pointer.y * 0.12;

    wireObject.rotation.y = -elapsed * 0.06;
    ring.rotation.z = elapsed * 0.12;

    renderer.render(scene, camera);
  }


  function animate() {
    if (destroyed || !isVisible) return;

    renderFrame();
    animationFrame = requestAnimationFrame(animate);
  }

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible && !reducedMotion && animationFrame === null) {
        clock.start();
        animate();
      }

      if (!isVisible && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    { threshold: 0 }
  );

  visibilityObserver.observe(stage);

  resize();

  if (reducedMotion) {
    renderFrame();
  }

  function cleanup() {
    destroyed = true;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }

    visibilityObserver.disconnect();
    resizeObserver.disconnect();

    stage.removeEventListener("pointermove", handlePointerMove);
    stage.removeEventListener("pointerleave", handlePointerLeave);

    geometry.dispose();
    material.dispose();

    wireGeometry.dispose();
    wireMaterial.dispose();

    ringGeometry.dispose();
    ringMaterial.dispose();

    renderer.dispose();
  }

  return cleanup;
}
