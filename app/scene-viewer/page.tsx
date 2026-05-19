"use client";
import { useState, useEffect, useRef } from "react";

const SCENES = [
  { id: "neon_alley", label: "NEON ALLEY", desc: "Rain-slicked streets, holographic signs", fogColor: 0x0a0018, fogNear: 8, fogFar: 40, ambientColor: 0x220044, ambientIntensity: 0.6, lights: [{ color: 0xff6b9d, intensity: 3, x: -4, y: 5, z: 2 }, { color: 0x4444ff, intensity: 2, x: 4, y: 3, z: -2 }, { color: 0xffe048, intensity: 1.5, x: 0, y: 8, z: 4 }], floorColor: 0x0d0020, particles: { color: 0xff6b9d, count: 120, speed: 0.003 } },
  { id: "vibetown_plaza", label: "VIBETOWN PLAZA", desc: "Golden hour, open air, monument square", fogColor: 0x1a0800, fogNear: 12, fogFar: 50, ambientColor: 0x442200, ambientIntensity: 0.8, lights: [{ color: 0xffe048, intensity: 4, x: 6, y: 10, z: 4 }, { color: 0xff5f1f, intensity: 2, x: -5, y: 4, z: -3 }, { color: 0xffaa44, intensity: 1, x: 0, y: 6, z: 6 }], floorColor: 0x1a0a00, particles: { color: 0xffe048, count: 80, speed: 0.002 } },
  { id: "rooftop", label: "ROOFTOP", desc: "City skyline at midnight, cool breeze", fogColor: 0x050510, fogNear: 10, fogFar: 45, ambientColor: 0x111133, ambientIntensity: 0.5, lights: [{ color: 0x88aaff, intensity: 2, x: -6, y: 8, z: 3 }, { color: 0xffe048, intensity: 1.5, x: 4, y: 5, z: -4 }, { color: 0x2effe0, intensity: 1, x: 0, y: 10, z: 0 }], floorColor: 0x080815, particles: { color: 0x88aaff, count: 100, speed: 0.0015 } },
  { id: "forest_rave", label: "FOREST RAVE", desc: "Deep woods, UV lights, bass dropping", fogColor: 0x001a08, fogNear: 6, fogFar: 30, ambientColor: 0x002211, ambientIntensity: 0.4, lights: [{ color: 0x2eff2e, intensity: 3, x: -3, y: 6, z: 2 }, { color: 0xff6b9d, intensity: 2.5, x: 4, y: 4, z: -2 }, { color: 0xffe048, intensity: 1, x: 0, y: 8, z: -5 }], floorColor: 0x001208, particles: { color: 0x2eff2e, count: 150, speed: 0.004 } },
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

// ── Trait → Colors ────────────────────────────────────────────────────────────
function getTraitColors(traits: any) {
  const type = (traits?.Type || "").toLowerCase();
  const body = (traits?.Body || "").toLowerCase();
  const hair = (traits?.Hair || "").toLowerCase();
  const face = (traits?.Face || "").toLowerCase();

  let skinColor = 0xf4c08a;
  if (type.includes("robot")) skinColor = 0x8899aa;
  else if (type.includes("alien")) skinColor = 0x66cc88;
  else if (type.includes("zombie")) skinColor = 0x99aa77;
  else if (type.includes("skeleton")) skinColor = 0xeeeedd;
  else if (type.includes("ape") || type.includes("monkey")) skinColor = 0x886644;
  else if (type.includes("cat")) skinColor = 0xddbb88;

  let outfitColor = 0x333344;
  if (body.includes("gold")) outfitColor = 0xffe048;
  else if (body.includes("red")) outfitColor = 0xcc3333;
  else if (body.includes("blue")) outfitColor = 0x3366cc;
  else if (body.includes("green")) outfitColor = 0x33aa55;
  else if (body.includes("black")) outfitColor = 0x111122;
  else if (body.includes("white")) outfitColor = 0xeeeeff;
  else if (body.includes("pink")) outfitColor = 0xff6b9d;
  else if (body.includes("purple")) outfitColor = 0x7744cc;
  else if (body.includes("orange")) outfitColor = 0xff5f1f;
  else if (body.includes("hoodie")) outfitColor = 0x334455;
  else if (body.includes("suit")) outfitColor = 0x223344;

  let hairColor = 0x222222;
  if (hair.includes("gold") || hair.includes("blonde")) hairColor = 0xffe048;
  else if (hair.includes("red")) hairColor = 0xcc3322;
  else if (hair.includes("blue")) hairColor = 0x3366ff;
  else if (hair.includes("green")) hairColor = 0x33cc55;
  else if (hair.includes("pink")) hairColor = 0xff6b9d;
  else if (hair.includes("white") || hair.includes("silver")) hairColor = 0xddddee;
  else if (hair.includes("purple")) hairColor = 0x9944ff;
  else if (hair.includes("orange")) hairColor = 0xff7733;
  else if (hair.includes("brown")) hairColor = 0x885533;

  let eyeColor = 0x4488ff;
  if (face.includes("laser")) eyeColor = 0xff2222;
  else if (face.includes("3d") || face.includes("glasses")) eyeColor = 0x00ffff;
  else if (face.includes("gold")) eyeColor = 0xffe048;
  else if (face.includes("angry")) eyeColor = 0xff4400;

  return {
    skinColor, outfitColor, hairColor, eyeColor,
    isRobot: type.includes("robot"),
    hasMohawk: hair.includes("mohawk"),
    hasAfro: hair.includes("afro"),
    hasBun: hair.includes("bun"),
    hasLong: hair.includes("long"),
    isBald: hair.includes("bald") || hair.includes("none") || hair === "",
  };
}

// ── Build 3D Character ────────────────────────────────────────────────────────
function buildCharacter3D(THREE: any, traits: any, faceTextureUrl: string | null) {
  const group = new THREE.Group();
  const c = getTraitColors(traits);

  const mat = (color: number, rough = 0.6, metal = 0.1) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

  const skinMat = mat(c.skinColor, 0.6, c.isRobot ? 0.8 : 0.1);
  const outfitMat = mat(c.outfitColor, 0.7, 0.1);
  const hairMat = mat(c.hairColor, 0.5, 0.1);
  const eyeMat = new THREE.MeshStandardMaterial({ color: c.eyeColor, emissive: c.eyeColor, emissiveIntensity: 0.6, roughness: 0.1 });
  const darkMat = mat(0x111111, 0.9, 0.1);
  const whiteMat = mat(0xffffff, 0.8, 0.0);

  const add = (geo: any, material: any, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    group.add(m);
    return m;
  };

  // HEAD
  add(new THREE.SphereGeometry(0.32, 24, 20), skinMat, 0, 1.65, 0);

  // Face texture (NFT image on face plane)
  if (faceTextureUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(faceTextureUrl, (tex: any) => {
      const fp = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.48),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      fp.position.set(0, 1.65, 0.31);
      group.add(fp);
    }, undefined, () => addFallbackFace(THREE, group, c, eyeMat));
  } else {
    addFallbackFace(THREE, group, c, eyeMat);
  }

  // HAIR
  if (!c.isBald) {
    if (c.hasMohawk) {
      for (let i = 0; i < 5; i++) {
        add(new THREE.ConeGeometry(0.045, 0.22, 6), hairMat, (i - 2) * 0.07, 2.02 + Math.abs(i - 2) * 0.02, 0);
      }
    } else if (c.hasAfro) {
      add(new THREE.SphereGeometry(0.42, 16, 12), hairMat, 0, 1.78, 0);
    } else if (c.hasBun) {
      add(new THREE.SphereGeometry(0.15, 12, 10), hairMat, 0, 1.98, -0.1);
      add(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat, 0, 1.72, 0);
    } else if (c.hasLong) {
      add(new THREE.CylinderGeometry(0.33, 0.25, 0.55, 12, 1, true), hairMat, 0, 1.48, 0);
      add(new THREE.SphereGeometry(0.33, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat, 0, 1.72, 0);
    } else {
      add(new THREE.SphereGeometry(0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat, 0, 1.72, 0);
    }
  }

  // Robot antenna
  if (c.isRobot) {
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), hairMat, 0, 2.1, 0);
    add(new THREE.SphereGeometry(0.06, 8, 8), eyeMat, 0, 2.24, 0);
  }

  // NECK
  add(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 12), skinMat, 0, 1.3, 0);

  // TORSO
  add(new THREE.CylinderGeometry(0.26, 0.3, 0.6, 16), outfitMat, 0, 0.92, 0);

  // Collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), darkMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.18, 0);
  group.add(collar);

  // ARMS
  [{ x: 0.42, s: 1 }, { x: -0.42, s: -1 }].forEach(({ x, s }) => {
    add(new THREE.CylinderGeometry(0.085, 0.075, 0.32, 10), outfitMat, x, 0.98, 0, 0, 0, s * 0.18);
    add(new THREE.SphereGeometry(0.09, 10, 8), outfitMat, x + s * 0.06, 0.78, 0);
    add(new THREE.CylinderGeometry(0.072, 0.06, 0.28, 10), skinMat, x + s * 0.1, 0.6, 0, 0, 0, s * 0.25);
    add(new THREE.SphereGeometry(0.085, 10, 8), skinMat, x + s * 0.16, 0.42, 0);
  });

  // HIPS
  add(new THREE.CylinderGeometry(0.28, 0.24, 0.22, 14), outfitMat, 0, 0.58, 0);

  // LEGS
  [{ x: 0.15 }, { x: -0.15 }].forEach(({ x }) => {
    add(new THREE.CylinderGeometry(0.1, 0.09, 0.36, 12), outfitMat, x, 0.32, 0);
    add(new THREE.SphereGeometry(0.1, 10, 8), outfitMat, x, 0.1, 0);
    add(new THREE.CylinderGeometry(0.085, 0.075, 0.32, 12), outfitMat, x, -0.12, 0);
    // Shoe
    add(new THREE.BoxGeometry(0.14, 0.09, 0.26), darkMat, x, -0.33, 0.04);
    add(new THREE.BoxGeometry(0.1, 0.04, 0.2), whiteMat, x, -0.285, 0.05);
  });

  // Ground shadow + glow ring
  const shadowM = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
  shadowM.rotation.x = -Math.PI / 2;
  shadowM.position.y = -0.38;
  group.add(shadowM);

  const glowM = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.65, 32), new THREE.MeshBasicMaterial({ color: c.eyeColor, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
  glowM.rotation.x = -Math.PI / 2;
  glowM.position.y = -0.37;
  group.add(glowM);

  return group;
}

function addFallbackFace(THREE: any, group: any, c: any, eyeMat: any) {
  [-0.1, 0.1].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), eyeMat);
    eye.position.set(x, 1.68, 0.28);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupil.position.set(x, 1.68, 0.33);
    group.add(pupil);
  });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), new THREE.MeshStandardMaterial({ color: c.skinColor, roughness: 0.8 }));
  nose.position.set(0, 1.62, 0.31);
  group.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x994422 }));
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, 1.55, 0.3);
  group.add(mouth);
}

function animateCharacter(character: any, anim: string, clock: any, delta: number, camera: any) {
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
  if (anim !== "vibe" && camera) {
    const targetY = Math.atan2(camera.position.x - character.position.x, camera.position.z - character.position.z);
    if (anim === "idle" || anim === "pose") character.rotation.y += (targetY - character.rotation.y) * 0.02;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SceneViewer3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);

  const [tokenId, setTokenId] = useState("");
  const [character, setCharacter] = useState<any>(null);
  const [characterImg, setCharacterImg] = useState<string | null>(null);
  const [loadingChar, setLoadingChar] = useState(false);
  const [charError, setCharError] = useState("");
  const [building, setBuilding] = useState(false);
  const [selectedScene, setSelectedScene] = useState(SCENES[0]);
  const [selectedAnim, setSelectedAnim] = useState(ANIMATIONS[0]);
  const [selectedCam, setSelectedCam] = useState(CAMERA_MODES[0]);
  const [sceneReady, setSceneReady] = useState(false);
  const [launched, setLaunched] = useState(false);

  const loadCharacter = async () => {
    const id = parseInt(tokenId, 10);
    if (isNaN(id) || id < 0 || id > 6968) { setCharError("Enter a token ID between 0 and 6968"); return; }
    setLoadingChar(true); setCharError(""); setCharacter(null); setCharacterImg(null);
    try {
      const meta = await fetch("/gvc-metadata.json").then((r) => r.json());
      const token = meta[String(id)];
      if (!token) throw new Error("Not found");
      setCharacter({ id, name: token.name, traits: token.traits });
      if (token.image) setCharacterImg(token.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
    } catch { setCharError("Could not load character."); }
    finally { setLoadingChar(false); }
  };

  const launchScene = () => { setLaunched(true); setSceneReady(false); setBuilding(true); };

  useEffect(() => {
    if (!launched || !canvasRef.current) return;
    if (sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; }

    let THREE: any, renderer: any, threeScene: any, camera: any, animFrameId: number;
    let characterMesh: any = null, particles: any = null, clock: any;
    let phi = Math.PI / 2.5, theta = 0, radius = 5;
    let isDragging = false, lastX = 0, lastY = 0, cinematicT = 0;
    let currentAnim = selectedAnim.id, currentCamMode = selectedCam.id;
    const scene = selectedScene;
    const canvas = canvasRef.current!;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      THREE = (window as any).THREE;
      clock = new THREE.Clock();
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      threeScene = new THREE.Scene();
      threeScene.fog = new THREE.Fog(scene.fogColor, scene.fogNear, scene.fogFar);
      threeScene.background = new THREE.Color(scene.fogColor);
      camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

      setCameraMode(currentCamMode);
      threeScene.add(new THREE.AmbientLight(scene.ambientColor, scene.ambientIntensity));

      scene.lights.forEach((l: any) => {
        const light = new THREE.PointLight(l.color, l.intensity, 20);
        light.position.set(l.x, l.y, l.z);
        light.castShadow = true;
        threeScene.add(light);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: l.color }));
        orb.position.set(l.x, l.y, l.z);
        threeScene.add(orb);
      });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: scene.floorColor, roughness: 0.2, metalness: 0.8 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
      threeScene.add(floor);
      const grid = new THREE.GridHelper(30, 30, scene.lights[0].color, scene.lights[0].color);
      grid.material.opacity = 0.08; grid.material.transparent = true;
      threeScene.add(grid);

      // Buildings
      [[-8,0,-10],[-5,0,-12],[-2,0,-11],[3,0,-10],[6,0,-12],[9,0,-10],[-10,0,-6],[10,0,-6]].forEach(([x,_y,z], i) => {
        const h = [6,9,5,7,10,6,8,7][i], w = 1.5 + (i%3)*0.5;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), new THREE.MeshStandardMaterial({ color: new THREE.Color(scene.floorColor).multiplyScalar(1.5), roughness:0.7, metalness:0.3 }));
        b.position.set(x, h/2, z); b.castShadow = true; threeScene.add(b);
      });

      // Particles
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(scene.particles.count * 3);
      const spds = new Float32Array(scene.particles.count);
      for (let i = 0; i < scene.particles.count; i++) {
        pos[i*3]=(Math.random()-0.5)*20; pos[i*3+1]=Math.random()*10; pos[i*3+2]=(Math.random()-0.5)*20; spds[i]=0.5+Math.random();
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: scene.particles.color, size: 0.06, transparent: true, opacity: 0.7 }));
      particles.userData.speeds = spds;
      threeScene.add(particles);

      // 3D Character
      const charGroup = buildCharacter3D(THREE, character?.traits, characterImg);
      charGroup.position.set(0, 0.38, 0);
      threeScene.add(charGroup);
      characterMesh = charGroup;
      setBuilding(false);

      // Controls
      canvas.addEventListener("mousedown", (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
      canvas.addEventListener("mousemove", (e) => {
        if (!isDragging || currentCamMode !== "orbit") return;
        theta -= (e.clientX - lastX) * 0.01;
        phi = Math.max(0.3, Math.min(Math.PI * 0.85, phi - (e.clientY - lastY) * 0.01));
        lastX = e.clientX; lastY = e.clientY;
      });
      canvas.addEventListener("mouseup", () => { isDragging = false; });
      canvas.addEventListener("wheel", (e) => { if (currentCamMode !== "orbit") return; radius = Math.max(2, Math.min(12, radius + e.deltaY * 0.005)); });
      window.addEventListener("resize", onResize);
      setSceneReady(true);
      animate();
    };
    document.head.appendChild(script);

    function setCameraMode(mode: string) {
      if (mode === "closeup") { radius = 2.5; phi = Math.PI/2.2; theta = 0.3; }
      else if (mode === "wide") { radius = 10; phi = Math.PI/2.8; theta = 0.4; }
      else if (mode === "cinematic") { radius = 6; phi = Math.PI/2.4; theta = 0; }
      else { radius = 5; phi = Math.PI/2.5; theta = 0; }
      updateCamera();
    }
    function updateCamera() {
      if (!camera) return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi)+1.2, radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0, 0.8, 0);
    }
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animateCharacter(characterMesh, currentAnim, clock, delta, camera);
      if (particles) {
        const pa = particles.geometry.attributes.position.array as Float32Array;
        const sp = particles.userData.speeds;
        for (let i = 0; i < pa.length/3; i++) {
          pa[i*3+1] += selectedScene.particles.speed * sp[i];
          if (pa[i*3+1] > 10) { pa[i*3+1]=0; pa[i*3]=(Math.random()-0.5)*20; pa[i*3+2]=(Math.random()-0.5)*20; }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
      if (currentCamMode === "cinematic") { cinematicT += delta*0.15; theta = Math.sin(cinematicT)*0.6; phi = Math.PI/2.4+Math.sin(cinematicT*0.5)*0.1; }
      updateCamera();
      renderer.render(threeScene, camera);
    }
    function onResize() {
      if (!camera||!renderer||!canvas) return;
      camera.aspect = canvas.clientWidth/canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    sceneRef.current = {
      setAnimation: (a: string) => { currentAnim = a; },
      setCameraMode: (m: string) => { currentCamMode = m; setCameraMode(m); },
      destroy: () => { cancelAnimationFrame(animFrameId); renderer?.dispose(); window.removeEventListener("resize", onResize); script.remove(); },
    };
    return () => { if (sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; } };
  }, [launched, selectedScene, character, characterImg]);

  useEffect(() => { sceneRef.current?.setAnimation(selectedAnim.id); }, [selectedAnim]);
  useEffect(() => { sceneRef.current?.setCameraMode(selectedCam.id); }, [selectedCam]);

  const accentHex = "#" + (selectedScene.lights[0]?.color || 0xffe048).toString(16).padStart(6, "0");

  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-mundial, sans-serif)" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::placeholder{color:#2a2a2a} input:focus{outline:none;border-color:#FFE04844!important} @keyframes shimmer{0%{background-position:0% center}100%{background-position:200% center}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#050505} ::-webkit-scrollbar-thumb{background:#1F1F1F;border-radius:2px}`}</style>

      <div style={{ borderBottom: "1px solid #1F1F1F", padding: "28px 40px 24px", background: "#080808" }}>
        <p style={{ color: "#FFE048", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8, opacity: 0.6 }}>BERGENFOX · GVC UNIVERSE</p>
        <h1 style={{ fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 36, textTransform: "uppercase", background: "linear-gradient(135deg, #FFE048 0%, #FF5F1F 50%, #FFE048 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>3D SCENE VIEWER</h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 6 }}>Your GVC citizen — fully built in 3D from their traits, placed in a live Vibetown scene</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 100px)" }}>
        <div style={{ borderRight: "1px solid #1F1F1F", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", background: "#070707" }}>

          <div>
            <SideLabel>01 · YOUR GVC</SideLabel>
            <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
              <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadCharacter()} placeholder="Token ID  0–6968" min={0} max={6968}
                style={{ flex:1, background:"#0d0d0d", border:"1px solid #1F1F1F", borderRight:"none", borderRadius:"8px 0 0 8px", padding:"10px 12px", color:"#fff", fontSize:13, fontFamily:"var(--font-mundial, sans-serif)" }} />
              <button onClick={loadCharacter} disabled={loadingChar} style={{ background:"#1F1F1F", border:"1px solid #1F1F1F", borderRadius:"0 8px 8px 0", padding:"10px 14px", color:"#FFE048", fontSize:11, fontWeight:700, letterSpacing:1, cursor:loadingChar?"not-allowed":"pointer" }}>
                {loadingChar ? "···" : "LOAD"}
              </button>
            </div>
            {charError && <p style={{ color:"#FF5F1F", fontSize:11, marginBottom:8 }}>{charError}</p>}
            {character && (
              <>
                <div style={{ background:"#0d0d0d", border:"1px solid #1F1F1F", borderRadius:10, padding:12, display:"flex", gap:12 }}>
                  {characterImg && <img src={characterImg} alt={character.name} style={{ width:52, height:52, borderRadius:8, objectFit:"cover", flexShrink:0 }} onError={(e)=>(e.currentTarget.style.display="none")} />}
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#FFE048", marginBottom:4 }}>{character.name}</p>
                    {character.traits && Object.entries(character.traits).map(([k,v]: any) => (
                      <div key={k} style={{ fontSize:10, color:"#555", marginBottom:2 }}><span style={{ color:"#333", textTransform:"uppercase", letterSpacing:1 }}>{k} </span>{v}</div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:10, background:"#0d0d1a", border:"1px solid #FFE04822", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:10, color:"#FFE048", letterSpacing:1 }}>✦ 3D MODEL GENERATED FROM TRAITS</p>
                  <p style={{ fontSize:9, color:"#444", marginTop:3 }}>NFT face texture · Body from Type · Outfit from Body · Hair style from Hair trait</p>
                </div>
              </>
            )}
          </div>

          <div>
            <SideLabel>02 · ENVIRONMENT</SideLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {SCENES.map((s) => (
                <button key={s.id} onClick={()=>setSelectedScene(s)} style={{ background:selectedScene.id===s.id?"#ffffff08":"transparent", border:`1px solid ${selectedScene.id===s.id?"#ffffff22":"#1F1F1F"}`, borderRadius:8, padding:"10px 12px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:selectedScene.id===s.id?"#fff":"#555" }}>{s.label}</div>
                    <div style={{ fontSize:10, color:"#333", marginTop:2 }}>{s.desc}</div>
                  </div>
                  {selectedScene.id===s.id && <div style={{ width:6, height:6, borderRadius:"50%", background:accentHex, flexShrink:0 }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SideLabel>03 · ANIMATION</SideLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {ANIMATIONS.map((a) => (
                <button key={a.id} onClick={()=>setSelectedAnim(a)} style={{ background:selectedAnim.id===a.id?"#FFE04810":"transparent", border:`1px solid ${selectedAnim.id===a.id?"#FFE04833":"#1F1F1F"}`, borderRadius:8, padding:"10px", textAlign:"left", cursor:"pointer" }}>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, color:selectedAnim.id===a.id?"#FFE048":"#444" }}>{a.label}</div>
                  <div style={{ fontSize:9, color:"#2a2a2a", marginTop:3 }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <SideLabel>04 · CAMERA</SideLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {CAMERA_MODES.map((cm) => (
                <button key={cm.id} onClick={()=>setSelectedCam(cm)} style={{ background:selectedCam.id===cm.id?"#FFE04810":"transparent", border:`1px solid ${selectedCam.id===cm.id?"#FFE04833":"#1F1F1F"}`, borderRadius:8, padding:"10px", textAlign:"left", cursor:"pointer" }}>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, color:selectedCam.id===cm.id?"#FFE048":"#444" }}>{cm.label}</div>
                  <div style={{ fontSize:9, color:"#2a2a2a", marginTop:3 }}>{cm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={launchScene} disabled={!character}
            style={{ background:character?"#FFE048":"#111", border:"none", borderRadius:10, padding:"14px 0", color:character?"#050505":"#333", fontSize:12, fontWeight:800, letterSpacing:2, textTransform:"uppercase", cursor:character?"pointer":"not-allowed", marginTop:"auto" }}
            onMouseEnter={(e)=>{ if(character) e.currentTarget.style.boxShadow="0 0 24px #FFE04855"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow="none"; }}>
            {!character ? "LOAD A CHARACTER FIRST" : launched ? "↺ REBUILD SCENE" : "▶ BUILD & LAUNCH"}
          </button>
        </div>

        <div style={{ position:"relative", background:"#030303" }}>
          <canvas ref={canvasRef} style={{ display:launched?"block":"none", width:"100%", height:"100%", cursor:selectedCam.id==="orbit"?"grab":"default" }} />

          {launched && (building || !sceneReady) && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, background:"#030303" }}>
              <div style={{ width:40, height:40, border:"2px solid #1F1F1F", borderTop:`2px solid ${accentHex}`, borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
              <p style={{ color:accentHex, fontSize:11, letterSpacing:3, textTransform:"uppercase", animation:"pulse 2s ease infinite" }}>
                {building ? "BUILDING YOUR 3D CHARACTER···" : "LOADING SCENE···"}
              </p>
              {building && character && <p style={{ color:"#333", fontSize:10 }}>Generating model from {Object.keys(character.traits||{}).length} traits</p>}
            </div>
          )}

          {!launched && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"radial-gradient(ellipse at center, #0d0d1a 0%, #030303 70%)" }}>
              {[100,160,220].map((size,i)=>(<div key={i} style={{ position:"absolute", width:size, height:size, borderRadius:"50%", border:"1px solid #FFE04818", animation:`pulse ${2+i*0.5}s ease infinite`, animationDelay:`${i*0.3}s` }} />))}
              <div style={{ fontSize:48, opacity:0.2 }}>🧬</div>
              <p style={{ color:"#2a2a2a", fontSize:12, letterSpacing:3, textTransform:"uppercase", textAlign:"center", zIndex:1 }}>
                {character ? "Hit BUILD & LAUNCH to generate your 3D character" : "Load your GVC token to begin"}
              </p>
            </div>
          )}

          {launched && sceneReady && !building && (
            <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
              <div style={{ position:"absolute", top:20, left:20, background:"rgba(5,5,5,0.7)", border:"1px solid #1F1F1F", borderRadius:8, padding:"8px 14px", backdropFilter:"blur(8px)" }}>
                <p style={{ fontSize:9, letterSpacing:2, color:accentHex, textTransform:"uppercase", marginBottom:2 }}>● LIVE · {selectedScene.label}</p>
                <p style={{ fontSize:10, color:"#444" }}>{selectedAnim.label} · {selectedCam.label}</p>
              </div>
              {character && (
                <div style={{ position:"absolute", top:20, right:20, background:"rgba(5,5,5,0.7)", border:"1px solid #1F1F1F", borderRadius:8, padding:"8px 14px", backdropFilter:"blur(8px)", textAlign:"right" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#FFE048" }}>{character.name}</p>
                  <p style={{ fontSize:9, color:"#333", letterSpacing:1 }}>3D · TRAIT-GENERATED</p>
                </div>
              )}
              {selectedCam.id==="orbit" && (
                <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", background:"rgba(5,5,5,0.6)", border:"1px solid #1F1F1F", borderRadius:20, padding:"6px 16px", backdropFilter:"blur(8px)" }}>
                  <p style={{ fontSize:10, color:"#333", letterSpacing:1 }}>DRAG TO ROTATE · SCROLL TO ZOOM</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
      <span style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#333", fontWeight:700 }}>{children}</span>
      <div style={{ flex:1, height:1, background:"#111" }} />
    </div>
  );
}
