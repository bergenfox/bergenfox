"use client";
import { useState, useEffect, useRef } from "react";

// ── Scene Presets ─────────────────────────────────────────────────────────────
const SCENES = [
  {
    id: "neon_alley",
    label: "NEON ALLEY",
    desc: "Rain-slicked streets, holographic signs",
    fogColor: 0x0a0018,
    fogNear: 8,
    fogFar: 40,
    ambientColor: 0x220044,
    ambientIntensity: 0.6,
    lights: [
      { color: 0xff6b9d, intensity: 3, x: -4, y: 5, z: 2 },
      { color: 0x4444ff, intensity: 2, x: 4, y: 3, z: -2 },
      { color: 0xffe048, intensity: 1.5, x: 0, y: 8, z: 4 },
    ],
    floorColor: 0x0d0020,
    floorEmissive: 0x110033,
    skyTop: "#0a0018",
    skyBot: "#1a0035",
    particles: { color: 0xff6b9d, count: 120, speed: 0.003 },
  },
  {
    id: "vibetown_plaza",
    label: "VIBETOWN PLAZA",
    desc: "Golden hour, open air, monument square",
    fogColor: 0x1a0800,
    fogNear: 12,
    fogFar: 50,
    ambientColor: 0x442200,
    ambientIntensity: 0.8,
    lights: [
      { color: 0xffe048, intensity: 4, x: 6, y: 10, z: 4 },
      { color: 0xff5f1f, intensity: 2, x: -5, y: 4, z: -3 },
      { color: 0xffaa44, intensity: 1, x: 0, y: 6, z: 6 },
    ],
    floorColor: 0x1a0a00,
    floorEmissive: 0x220d00,
    skyTop: "#1a0800",
    skyBot: "#3d1500",
    particles: { color: 0xffe048, count: 80, speed: 0.002 },
  },
  {
    id: "rooftop",
    label: "ROOFTOP",
    desc: "City skyline at midnight, cool breeze",
    fogColor: 0x050510,
    fogNear: 10,
    fogFar: 45,
    ambientColor: 0x111133,
    ambientIntensity: 0.5,
    lights: [
      { color: 0x88aaff, intensity: 2, x: -6, y: 8, z: 3 },
      { color: 0xffe048, intensity: 1.5, x: 4, y: 5, z: -4 },
      { color: 0x2effe0, intensity: 1, x: 0, y: 10, z: 0 },
    ],
    floorColor: 0x080815,
    floorEmissive: 0x0a0a20,
    skyTop: "#050510",
    skyBot: "#0d0d25",
    particles: { color: 0x88aaff, count: 100, speed: 0.0015 },
  },
  {
    id: "forest_rave",
    label: "FOREST RAVE",
    desc: "Deep woods, UV lights, bass dropping",
    fogColor: 0x001a08,
    fogNear: 6,
    fogFar: 30,
    ambientColor: 0x002211,
    ambientIntensity: 0.4,
    lights: [
      { color: 0x2eff2e, intensity: 3, x: -3, y: 6, z: 2 },
      { color: 0xff6b9d, intensity: 2.5, x: 4, y: 4, z: -2 },
      { color: 0xffe048, intensity: 1, x: 0, y: 8, z: -5 },
    ],
    floorColor: 0x001208,
    floorEmissive: 0x001a08,
    skyTop: "#001208",
    skyBot: "#002211",
    particles: { color: 0x2eff2e, count: 150, speed: 0.004 },
  },
];

const ANIMATIONS = [
  { id: "idle", label: "IDLE", desc: "Gentle breathing loop" },
  { id: "strut", label: "STRUT", desc: "Walk cycle, full attitude" },
  { id: "vibe", label: "VIBE", desc: "Head bob, feeling the beat" },
  { id: "pose", label: "HERO POSE", desc: "Arms out, owning the moment" },
];

const CAMERA_MODES = [
  { id: "orbit", label: "ORBIT", desc: "Drag to rotate freely" },
  { id: "cinematic", label: "CINEMATIC", desc: "Auto-panning shot" },
  { id: "closeup", label: "CLOSE-UP", desc: "Face-level portrait" },
  { id: "wide", label: "WIDE", desc: "Full scene establishing shot" },
];

// ── Three.js Scene Builder ────────────────────────────────────────────────────
function buildScene(canvas, scene, animation, cameraMode, characterImg, onReady) {
  let THREE, renderer, threeScene, camera, animFrameId;
  let character = null, particles = null;
  let clock, mixer;
  let mouseX = 0, mouseY = 0;
  let isDragging = false, lastX = 0, lastY = 0;
  let phi = Math.PI / 2.5, theta = 0, radius = 5;
  let cinematicT = 0;

  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  script.onload = () => {
    THREE = window.THREE;
    init();
  };
  document.head.appendChild(script);

  function init() {
    clock = new THREE.Clock();

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Scene
    threeScene = new THREE.Scene();
    threeScene.fog = new THREE.Fog(scene.fogColor, scene.fogNear, scene.fogFar);
    threeScene.background = new THREE.Color(scene.fogColor);

    // Camera
    camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    setCameraMode(cameraMode);

    // Ambient light
    const ambient = new THREE.AmbientLight(scene.ambientColor, scene.ambientIntensity);
    threeScene.add(ambient);

    // Point lights
    scene.lights.forEach((l) => {
      const light = new THREE.PointLight(l.color, l.intensity, 20);
      light.position.set(l.x, l.y, l.z);
      light.castShadow = true;
      threeScene.add(light);

      // Visible light orb
      const orbGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({ color: l.color });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(l.x, l.y, l.z);
      threeScene.add(orb);
    });

    // Floor
    buildFloor();

    // Background structures
    buildStructures();

    // Character placeholder / sprite
    buildCharacter(characterImg);

    // Particles
    buildParticles();

    // Events
    canvas.addEventListener("mousedown", (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging || cameraMode !== "orbit") return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      theta -= dx * 0.01;
      phi = Math.max(0.3, Math.min(Math.PI * 0.85, phi - dy * 0.01));
      lastX = e.clientX;
      lastY = e.clientY;
    });
    canvas.addEventListener("mouseup", () => { isDragging = false; });
    canvas.addEventListener("wheel", (e) => {
      if (cameraMode !== "orbit") return;
      radius = Math.max(2, Math.min(12, radius + e.deltaY * 0.005));
    });

    // Touch support
    let lastTouchX = 0, lastTouchY = 0;
    canvas.addEventListener("touchstart", (e) => { lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; });
    canvas.addEventListener("touchmove", (e) => {
      if (cameraMode !== "orbit") return;
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      theta -= dx * 0.01;
      phi = Math.max(0.3, Math.min(Math.PI * 0.85, phi - dy * 0.01));
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    });

    window.addEventListener("resize", onResize);
    onReady && onReady();
    animate();
  }

  function setCameraMode(mode) {
    if (!camera) return;
    if (mode === "closeup") { radius = 2.2; phi = Math.PI / 2.2; theta = 0.3; }
    else if (mode === "wide") { radius = 10; phi = Math.PI / 2.8; theta = 0.4; }
    else if (mode === "cinematic") { radius = 6; phi = Math.PI / 2.4; theta = 0; }
    else { radius = 5; phi = Math.PI / 2.5; theta = 0; }
    updateCamera();
  }

  function updateCamera() {
    if (!camera) return;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi) + 1.5;
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 1.2, 0);
  }

  function buildFloor() {
    // Main floor plane
    const floorGeo = new THREE.PlaneGeometry(40, 40, 20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: scene.floorColor,
      emissive: scene.floorEmissive,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    threeScene.add(floor);

    // Grid lines
    const gridHelper = new THREE.GridHelper(30, 30, scene.lights[0].color, scene.lights[0].color);
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    threeScene.add(gridHelper);

    // Reflection circle under character
    const circleGeo = new THREE.CircleGeometry(1.2, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: scene.lights[0].color,
      transparent: true,
      opacity: 0.06,
    });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.01;
    threeScene.add(circle);
  }

  function buildStructures() {
    const buildingColor = new THREE.Color(scene.floorColor).multiplyScalar(1.5);
    const accentColor = scene.lights[0].color;

    // Background buildings
    const bldgPositions = [
      [-8, 0, -10], [-5, 0, -12], [-2, 0, -11], [3, 0, -10], [6, 0, -12], [9, 0, -10],
      [-10, 0, -6], [10, 0, -6],
    ];
    const bldgHeights = [6, 9, 5, 7, 10, 6, 8, 7];

    bldgPositions.forEach(([x, y, z], i) => {
      const h = bldgHeights[i];
      const w = 1.5 + Math.random() * 1;
      const geo = new THREE.BoxGeometry(w, h, w);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColor,
        emissive: new THREE.Color(accentColor).multiplyScalar(0.02),
        roughness: 0.7,
        metalness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      threeScene.add(mesh);

      // Window dots
      for (let wy = 1; wy < h - 0.5; wy += 1.2) {
        for (let wx = -0.3; wx <= 0.3; wx += 0.4) {
          if (Math.random() > 0.4) {
            const wGeo = new THREE.PlaneGeometry(0.15, 0.2);
            const wMat = new THREE.MeshBasicMaterial({
              color: Math.random() > 0.5 ? accentColor : 0xffffff,
              transparent: true,
              opacity: 0.3 + Math.random() * 0.4,
            });
            const win = new THREE.Mesh(wGeo, wMat);
            win.position.set(x + wx, wy, z + w / 2 + 0.01);
            threeScene.add(win);
          }
        }
      }
    });

    // Ground-level props (boxes/crates)
    [[-2.5, 0, -1.5], [2.8, 0, -1], [-3, 0, 0.5]].forEach(([x, y, z]) => {
      const s = 0.3 + Math.random() * 0.3;
      const geo = new THREE.BoxGeometry(s, s, s);
      const mat = new THREE.MeshStandardMaterial({ color: buildingColor, roughness: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, s / 2, z);
      mesh.castShadow = true;
      threeScene.add(mesh);
    });
  }

  function buildCharacter(imgUrl) {
    // Character sprite on a plane (billboard)
    const group = new THREE.Group();

    if (imgUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(imgUrl, (texture) => {
        const geo = new THREE.PlaneGeometry(1.6, 1.6);
        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const sprite = new THREE.Mesh(geo, mat);
        sprite.position.y = 0.85;
        group.add(sprite);

        // Shadow ellipse
        const shadowGeo = new THREE.CircleGeometry(0.5, 24);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.005;
        group.add(shadow);
      }, undefined, () => {
        // Fallback: glowing capsule
        buildFallbackCharacter(group);
      });
    } else {
      buildFallbackCharacter(group);
    }

    threeScene.add(group);
    character = group;
  }

  function buildFallbackCharacter(group) {
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.0, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffe048, emissive: 0x443300, roughness: 0.2, metalness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.38;
    head.castShadow = true;
    group.add(head);

    // Glow halo
    const haloGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffe048, transparent: true, opacity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.7;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  }

  function buildParticles() {
    const { color, count } = scene.particles;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.5 + Math.random();
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.7 });
    particles = new THREE.Points(geo, mat);
    particles.userData.speeds = speeds;
    threeScene.add(particles);
  }

  function animateCharacter(delta, anim) {
    if (!character) return;
    const t = clock.elapsedTime;

    if (anim === "idle") {
      character.position.y = Math.sin(t * 1.2) * 0.03;
      character.rotation.y = Math.sin(t * 0.4) * 0.05;
    } else if (anim === "strut") {
      character.position.x = Math.sin(t * 0.8) * 0.4;
      character.position.y = Math.abs(Math.sin(t * 1.6)) * 0.08;
      character.rotation.y = Math.cos(t * 0.8) * 0.3;
    } else if (anim === "vibe") {
      character.position.y = Math.abs(Math.sin(t * 3)) * 0.12;
      character.rotation.z = Math.sin(t * 3) * 0.08;
      character.rotation.y += delta * 0.5;
    } else if (anim === "pose") {
      character.position.y = Math.sin(t * 0.5) * 0.05;
      character.rotation.y = Math.sin(t * 0.2) * 0.15;
    }

    // Always face camera slightly
    if (anim !== "vibe") {
      const targetY = Math.atan2(
        camera.position.x - character.position.x,
        camera.position.z - character.position.z
      );
      if (anim === "idle" || anim === "pose") {
        character.rotation.y += (targetY - character.rotation.y) * 0.02;
      }
    }
  }

  function animateParticles(delta) {
    if (!particles) return;
    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.userData.speeds;
    const spd = scene.particles.speed;

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += spd * speeds[i];
      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = 0;
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  let currentAnim = animation;
  let currentCamMode = cameraMode;

  function animate() {
    animFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    animateCharacter(delta, currentAnim);
    animateParticles(delta);

    // Camera
    if (currentCamMode === "cinematic") {
      cinematicT += delta * 0.15;
      theta = Math.sin(cinematicT) * 0.6;
      phi = Math.PI / 2.4 + Math.sin(cinematicT * 0.5) * 0.1;
    }

    updateCamera();
    renderer.render(threeScene, camera);
  }

  function onResize() {
    if (!camera || !renderer || !canvas) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  return {
    setAnimation: (anim) => { currentAnim = anim; },
    setCameraMode: (mode) => {
      currentCamMode = mode;
      setCameraMode(mode);
    },
    destroy: () => {
      cancelAnimationFrame(animFrameId);
      renderer?.dispose();
      window.removeEventListener("resize", onResize);
    },
  };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SceneViewer3D() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  const [tokenId, setTokenId] = useState("");
  const [character, setCharacter] = useState(null);
  const [characterImg, setCharacterImg] = useState(null);
  const [loadingChar, setLoadingChar] = useState(false);
  const [charError, setCharError] = useState("");

  const [selectedScene, setSelectedScene] = useState(SCENES[0]);
  const [selectedAnim, setSelectedAnim] = useState(ANIMATIONS[0]);
  const [selectedCam, setSelectedCam] = useState(CAMERA_MODES[0]);

  const [sceneReady, setSceneReady] = useState(false);
  const [launched, setLaunched] = useState(false);

  const loadCharacter = async () => {
    const id = parseInt(tokenId, 10);
    if (isNaN(id) || id < 0 || id > 6968) {
      setCharError("Enter a token ID between 0 and 6968");
      return;
    }
    setLoadingChar(true);
    setCharError("");
    setCharacter(null);
    setCharacterImg(null);
    try {
      const meta = await fetch("/gvc-metadata.json").then((r) => r.json());
      const token = meta[String(id)];
      if (!token) throw new Error("Not found");
      setCharacter({ id, name: token.name, traits: token.traits });
      if (token.image) {
        setCharacterImg(token.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
      }
    } catch {
      setCharError("Could not load character.");
    } finally {
      setLoadingChar(false);
    }
  };

  // Launch or rebuild scene
  const launchScene = () => {
    setLaunched(true);
    setSceneReady(false);
  };

  useEffect(() => {
    if (!launched || !canvasRef.current) return;

    // Destroy previous
    if (sceneRef.current) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }

    const ctrl = buildScene(
      canvasRef.current,
      selectedScene,
      selectedAnim.id,
      selectedCam.id,
      characterImg,
      () => setSceneReady(true)
    );
    sceneRef.current = ctrl;

    return () => {
      ctrl.destroy();
    };
  }, [launched, selectedScene, characterImg]);

  // Live-update animation without rebuilding
  useEffect(() => {
    sceneRef.current?.setAnimation(selectedAnim.id);
  }, [selectedAnim]);

  // Live-update camera without rebuilding
  useEffect(() => {
    sceneRef.current?.setCameraMode(selectedCam.id);
  }, [selectedCam]);

  const accentColor = selectedScene.lights[0]?.color
    ? "#" + selectedScene.lights[0].color.toString(16).padStart(6, "0")
    : "#FFE048";

  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-mundial, sans-serif)" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #2a2a2a; }
        input:focus { outline: none; border-color: #FFE04844 !important; }
        @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1F1F1F; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1F1F1F", padding: "28px 40px 24px", background: "#080808" }}>
        <p style={{ color: "#FFE048", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8, opacity: 0.6 }}>
          BERGENFOX · GVC UNIVERSE
        </p>
        <h1 style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: 36,
          textTransform: "uppercase",
          letterSpacing: 1,
          background: "linear-gradient(135deg, #FFE048 0%, #FF5F1F 50%, #FFE048 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
        }}>
          3D SCENE VIEWER
        </h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 6, letterSpacing: 0.5 }}>
          Place your GVC character in a live interactive Vibetown environment
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 100px)" }}>

        {/* ── Sidebar ── */}
        <div style={{
          borderRight: "1px solid #1F1F1F",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          overflowY: "auto",
          background: "#070707",
        }}>

          {/* Character */}
          <div>
            <SideLabel>01 · CHARACTER</SideLabel>
            <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
              <input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCharacter()}
                placeholder="Token ID  0–6968"
                min={0} max={6968}
                style={{
                  flex: 1,
                  background: "#0d0d0d",
                  border: "1px solid #1F1F1F",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  padding: "10px 12px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-mundial, sans-serif)",
                }}
              />
              <button onClick={loadCharacter} disabled={loadingChar} style={{
                background: "#1F1F1F",
                border: "1px solid #1F1F1F",
                borderRadius: "0 8px 8px 0",
                padding: "10px 14px",
                color: "#FFE048",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                cursor: loadingChar ? "not-allowed" : "pointer",
              }}>
                {loadingChar ? "···" : "LOAD"}
              </button>
            </div>
            {charError && <p style={{ color: "#FF5F1F", fontSize: 11, marginBottom: 8 }}>{charError}</p>}

            {character && (
              <div style={{
                background: "#0d0d0d",
                border: "1px solid #1F1F1F",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                gap: 12,
                animation: "fadeUp 0.3s ease",
              }}>
                {characterImg && (
                  <img src={characterImg} alt={character.name}
                    style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => e.target.style.display = "none"} />
                )}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#FFE048", marginBottom: 4 }}>{character.name}</p>
                  {character.traits && Object.entries(character.traits).slice(0, 3).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>
                      <span style={{ color: "#333", textTransform: "uppercase", letterSpacing: 1 }}>{k} </span>{v}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scene */}
          <div>
            <SideLabel>02 · ENVIRONMENT</SideLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SCENES.map((s) => (
                <button key={s.id} onClick={() => setSelectedScene(s)} style={{
                  background: selectedScene.id === s.id ? "#ffffff08" : "transparent",
                  border: `1px solid ${selectedScene.id === s.id ? "#ffffff22" : "#1F1F1F"}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: selectedScene.id === s.id ? "#fff" : "#555" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {selectedScene.id === s.id && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Animation */}
          <div>
            <SideLabel>03 · ANIMATION</SideLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {ANIMATIONS.map((a) => (
                <button key={a.id} onClick={() => setSelectedAnim(a)} style={{
                  background: selectedAnim.id === a.id ? "#FFE04810" : "transparent",
                  border: `1px solid ${selectedAnim.id === a.id ? "#FFE04833" : "#1F1F1F"}`,
                  borderRadius: 8,
                  padding: "10px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: selectedAnim.id === a.id ? "#FFE048" : "#444" }}>
                    {a.label}
                  </div>
                  <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3 }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera */}
          <div>
            <SideLabel>04 · CAMERA</SideLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {CAMERA_MODES.map((c) => (
                <button key={c.id} onClick={() => setSelectedCam(c)} style={{
                  background: selectedCam.id === c.id ? "#FFE04810" : "transparent",
                  border: `1px solid ${selectedCam.id === c.id ? "#FFE04833" : "#1F1F1F"}`,
                  borderRadius: 8,
                  padding: "10px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: selectedCam.id === c.id ? "#FFE048" : "#444" }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3 }}>{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Launch */}
          <button
            onClick={launchScene}
            style={{
              background: "#FFE048",
              border: "none",
              borderRadius: 10,
              padding: "14px 0",
              color: "#050505",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              marginTop: "auto",
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = "0 0 24px #FFE04855"}
            onMouseLeave={(e) => e.target.style.boxShadow = "none"}
          >
            {launched ? "↺ REBUILD SCENE" : "▶ LAUNCH SCENE"}
          </button>
        </div>

        {/* ── Canvas Area ── */}
        <div style={{ position: "relative", background: "#030303" }}>
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              display: launched ? "block" : "none",
              width: "100%",
              height: "100%",
              cursor: selectedCam.id === "orbit" ? "grab" : "default",
            }}
          />

          {/* Loading overlay */}
          {launched && !sceneReady && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              background: "#030303",
            }}>
              <div style={{
                width: 40, height: 40,
                border: "2px solid #1F1F1F",
                borderTop: `2px solid ${accentColor}`,
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }} />
              <p style={{ color: "#333", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", animation: "pulse 2s ease infinite" }}>
                BUILDING VIBETOWN···
              </p>
            </div>
          )}

          {/* Pre-launch placeholder */}
          {!launched && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "radial-gradient(ellipse at center, #0d0d1a 0%, #030303 70%)",
            }}>
              {/* Animated rings */}
              {[100, 160, 220].map((size, i) => (
                <div key={i} style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  border: "1px solid #FFE04818",
                  animation: `pulse ${2 + i * 0.5}s ease infinite`,
                  animationDelay: `${i * 0.3}s`,
                }} />
              ))}
              <div style={{ fontSize: 48, opacity: 0.2 }}>🌐</div>
              <p style={{ color: "#2a2a2a", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", textAlign: "center", zIndex: 1 }}>
                Configure your scene<br />then hit Launch
              </p>
            </div>
          )}

          {/* HUD overlay (when scene is live) */}
          {launched && sceneReady && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {/* Top-left: scene info */}
              <div style={{
                position: "absolute",
                top: 20,
                left: 20,
                background: "rgba(5,5,5,0.7)",
                border: "1px solid #1F1F1F",
                borderRadius: 8,
                padding: "8px 14px",
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ fontSize: 9, letterSpacing: 2, color: accentColor, textTransform: "uppercase", marginBottom: 2 }}>
                  ● LIVE · {selectedScene.label}
                </p>
                <p style={{ fontSize: 10, color: "#444" }}>{selectedAnim.label} · {selectedCam.label}</p>
              </div>

              {/* Top-right: character name */}
              {character && (
                <div style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(5,5,5,0.7)",
                  border: "1px solid #1F1F1F",
                  borderRadius: 8,
                  padding: "8px 14px",
                  backdropFilter: "blur(8px)",
                  textAlign: "right",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#FFE048" }}>{character.name}</p>
                  <p style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>GVC #{character.id}</p>
                </div>
              )}

              {/* Bottom: controls hint */}
              {selectedCam.id === "orbit" && (
                <div style={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(5,5,5,0.6)",
                  border: "1px solid #1F1F1F",
                  borderRadius: 20,
                  padding: "6px 16px",
                  backdropFilter: "blur(8px)",
                }}>
                  <p style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>DRAG TO ROTATE · SCROLL TO ZOOM</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SideLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#333", fontWeight: 700 }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "#111" }} />
    </div>
  );
}
