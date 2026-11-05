import * as THREE from './assets/vendor/three.module.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function makeStudioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  const base = context.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, '#778080');
  base.addColorStop(0.22, '#343b3d');
  base.addColorStop(0.53, '#171a1b');
  base.addColorStop(0.78, '#34393a');
  base.addColorStop(1, '#111314');
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const softbox = (x, y, width, height, color) => {
    const glow = context.createRadialGradient(
      x + width / 2, y + height / 2, 4,
      x + width / 2, y + height / 2, Math.max(width, height),
    );
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow;
    context.fillRect(x - width, y - height, width * 3, height * 3);
    context.fillStyle = color;
    context.globalAlpha = 0.82;
    context.fillRect(x, y, width, height);
    context.globalAlpha = 1;
  };

  softbox(92, 22, 58, 220, 'rgba(227,235,230,.52)');
  softbox(315, 5, 145, 32, 'rgba(232,238,235,.55)');
  softbox(602, 50, 46, 195, 'rgba(255,104,59,.28)');
  softbox(240, 319, 270, 20, 'rgba(164,175,173,.18)');

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 64, 4, 128, 64, 62);
  gradient.addColorStop(0, 'rgba(0,0,0,.42)');
  gradient.addColorStop(.46, 'rgba(0,0,0,.21)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return new THREE.CanvasTexture(canvas);
}

function cylinderAlongX(radius, length, material, radialSegments = 64) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1, false),
    material,
  );
  mesh.rotation.z = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeDumbbell(scene, lowPower) {
  const assembly = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({
    color: '#87908f',
    metalness: .94,
    roughness: .24,
    envMapIntensity: 1.18,
  });
  const plateMetal = new THREE.MeshStandardMaterial({
    color: '#545e60',
    metalness: .82,
    roughness: .27,
    envMapIntensity: 1.2,
  });
  const edgeMetal = new THREE.MeshStandardMaterial({
    color: '#a1a8a6',
    metalness: .9,
    roughness: .25,
    envMapIntensity: 1.15,
  });
  const gripMaterial = new THREE.MeshStandardMaterial({
    color: '#202527',
    metalness: .58,
    roughness: .48,
    envMapIntensity: .7,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: '#c85b3b',
    metalness: .78,
    roughness: .29,
    envMapIntensity: 1.05,
  });
  const details = new THREE.Group();
  const segments = lowPower ? 48 : 80;

  const shaft = cylinderAlongX(.087, 3.84, metal, segments);
  assembly.add(shaft);
  assembly.add(cylinderAlongX(.113, .92, gripMaterial, segments));

  for (let x = -.39; x <= .391; x += .065) {
    const gripBand = new THREE.Mesh(
      new THREE.TorusGeometry(.115, .006, 8, lowPower ? 32 : 48),
      edgeMetal,
    );
    gripBand.rotation.y = Math.PI / 2;
    gripBand.position.x = x;
    gripBand.material = gripMaterial;
    details.add(gripBand);
  }

  const plates = [
    { center: .91, radius: .5, width: .18 },
    { center: 1.18, radius: .66, width: .22 },
    { center: 1.49, radius: .81, width: .28 },
  ];

  for (const direction of [-1, 1]) {
    for (const plate of plates) {
      const disk = cylinderAlongX(plate.radius, plate.width, plateMetal, segments);
      disk.position.x = direction * plate.center;
      assembly.add(disk);

      const rimGeometry = new THREE.TorusGeometry(plate.radius - .035, .013, 10, segments);
      const innerRimGeometry = new THREE.TorusGeometry(.255, .012, 10, segments);
      for (const face of [-1, 1]) {
        const outerRim = new THREE.Mesh(rimGeometry, edgeMetal);
        outerRim.rotation.y = Math.PI / 2;
        outerRim.position.x = direction * (plate.center + face * (plate.width / 2 - .012));
        details.add(outerRim);

        const hubRing = new THREE.Mesh(innerRimGeometry, face === 1 ? copper : edgeMetal);
        hubRing.rotation.y = Math.PI / 2;
        hubRing.position.x = direction * (plate.center + face * (plate.width / 2 + .003));
        details.add(hubRing);
      }
    }

    const collar = cylinderAlongX(.16, .12, edgeMetal, segments);
    collar.position.x = direction * 1.76;
    assembly.add(collar);
    const collarAccent = new THREE.Mesh(
      new THREE.TorusGeometry(.145, .012, 10, segments),
      copper,
    );
    collarAccent.rotation.y = Math.PI / 2;
    collarAccent.position.x = direction * 1.82;
    details.add(collarAccent);
  }

  assembly.add(details);
  assembly.rotation.set(.18, .38, -.035);
  assembly.scale.setScalar(.97);
  assembly.position.y = .03;
  scene.add(assembly);
  return assembly;
}

function showFallback(stage, message) {
  stage.classList.remove('is-3d-ready');
  stage.dataset.webgl = 'unavailable';
  stage.setAttribute('aria-label', 'Visualização de halter estilizada; o objeto 3D não está disponível neste dispositivo.');
  const status = stage.querySelector('.dumbbell-status');
  const instruction = stage.querySelector('.dumbbell-instruction');
  if (status) {
    status.textContent = message;
    status.hidden = false;
  }
  if (instruction) instruction.hidden = true;
}

export function mountDumbbell(stage) {
  if (!stage || stage.dataset.webgl === 'ready') return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
      depth: true,
      stencil: false,
    });
  } catch {
    showFallback(stage, 'A visualização 3D não está disponível neste dispositivo.');
    return;
  }

  const lowPower = window.matchMedia('(max-width: 680px)').matches
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const scene = new THREE.Scene();
  scene.environment = makeStudioEnvironment();
  scene.environmentIntensity = 1;

  const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
  camera.position.set(0, .05, 6.8);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.className = 'dumbbell-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.setAttribute('tabindex', '-1');
  renderer.domElement.setAttribute('draggable', 'false');
  stage.prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight('#d9e0dd', '#191d1e', 1.18));
  scene.add(new THREE.AmbientLight('#a1a8a6', .48));

  const keyLight = new THREE.DirectionalLight('#f4f3ed', 3.4);
  keyLight.position.set(-3.5, 4.5, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight('#dce2df', 4.2);
  rimLight.position.set(3.7, 2.2, -3.5);
  scene.add(rimLight);
  const copperLight = new THREE.PointLight('#ff683b', 18, 8, 2);
  copperLight.position.set(-2.5, 1.2, 2.8);
  scene.add(copperLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 2.1),
    new THREE.MeshBasicMaterial({
      map: makeFloorTexture(),
      transparent: true,
      depthWrite: false,
      opacity: .8,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.13, .08);
  scene.add(floor);

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: '#c85b3b',
    transparent: true,
    opacity: .18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.15, .003, 6, 180), orbitMaterial);
  orbit.rotation.set(.92, .18, -.12);
  orbit.position.z = -.72;
  scene.add(orbit);

  const assembly = makeDumbbell(scene, lowPower);
  const canvas = renderer.domElement;
  const motionQuery = prefersReducedMotion;
  const pointer = new THREE.Vector2();
  let isHovering = false;
  let isDragging = false;
  let visible = false;
  let frameId = 0;
  let lastFrame = 0;
  let lastInteraction = performance.now();
  let lastPointerX = 0;
  let lastPointerY = 0;
  let targetYaw = .38;
  let targetPitch = .18;

  function resize() {
    const bounds = stage.getBoundingClientRect();
    const width = Math.max(1, Math.floor(bounds.width));
    const height = Math.max(1, Math.floor(bounds.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 420 ? 6.55 : width < 640 ? 6.2 : 5.65;
    camera.updateProjectionMatrix();
  }

  function requestRender() {
    if (!frameId && visible && document.visibilityState === 'visible') {
      frameId = window.requestAnimationFrame(renderFrame);
    }
  }

  function renderFrame(now) {
    frameId = 0;
    if (!visible || document.visibilityState !== 'visible') return;
    const delta = Math.min((now - (lastFrame || now)) / 1000, .04);
    lastFrame = now;

    if (!motionQuery.matches && !isDragging && now - lastInteraction > 1800) {
      targetYaw += delta * .12;
      targetPitch = .18 + Math.sin(now * .00042) * .025;
    } else if (!motionQuery.matches && isHovering && !isDragging) {
      targetYaw = .38 + pointer.x * .18;
      targetPitch = .18 - pointer.y * .11;
    }

    assembly.rotation.y += (targetYaw - assembly.rotation.y) * Math.min(1, delta * 4.2);
    assembly.rotation.x += (targetPitch - assembly.rotation.x) * Math.min(1, delta * 4.2);
    assembly.rotation.z += (-.035 - assembly.rotation.z) * Math.min(1, delta * 3);
    renderer.render(scene, camera);
    requestRender();
  }

  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
    );
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    isDragging = true;
    isHovering = true;
    lastInteraction = performance.now();
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.classList.add('is-dragging');
    canvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    updatePointer(event);
    isHovering = true;
    if (isDragging) {
      targetYaw += (event.clientX - lastPointerX) * .008;
      targetPitch = clamp(targetPitch + (event.clientY - lastPointerY) * .006, -.48, .8);
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastInteraction = performance.now();
    } else if (event.pointerType !== 'touch') {
      lastInteraction = performance.now() - 1500;
    }
    requestRender();
  }

  function onPointerUp() {
    isDragging = false;
    canvas.classList.remove('is-dragging');
    lastInteraction = performance.now();
    requestRender();
  }

  function onPointerLeave() {
    if (!isDragging) {
      isHovering = false;
      lastInteraction = performance.now();
      requestRender();
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    showFallback(stage, 'A visualização 3D foi pausada. Recarregue a página para tentar novamente.');
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('lostpointercapture', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  window.addEventListener('resize', resize, { passive: true });
  motionQuery.addEventListener?.('change', requestRender);

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(stage);
  else window.addEventListener('resize', resize, { passive: true });

  let visibilityObserver = null;
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) requestRender();
      else {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrame = 0;
      }
    }, { threshold: .01 });
    visibilityObserver.observe(stage);
  } else {
    visible = true;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestRender();
    else {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  });

  resize();
  stage.dataset.webgl = 'ready';
  stage.classList.add('is-3d-ready');
  stage.setAttribute('aria-label', 'Halter tridimensional. Arraste com mouse ou toque para girar o objeto.');
  const instruction = stage.querySelector('.dumbbell-instruction');
  if (instruction) instruction.hidden = false;

  if (!visibilityObserver) requestRender();

  window.addEventListener('pagehide', () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    visibilityObserver?.disconnect();
    resizeObserver?.disconnect();
    renderer.dispose();
    scene.environment?.dispose();
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }, { once: true });
}
