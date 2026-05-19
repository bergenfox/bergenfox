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

function getTraitColors(traits: any) {
  const type = (traits?.Type || "").toLowerCase();
  const body = (traits?.Body || "").toLowerCase();
  const hair = (traits?.Hair || "").toLowerCase();
  const face = (traits?.Face || "").toLowerCase();

  let skinColor = 0xf0b882;
  if (type.includes("robot")) skinColor = 0x7a9ab0;
  else if (type.includes("alien")) skinColor = 0x5dba7a;
  else if (type.includes("zombie")) skinColor = 0x8fa870;
  else if (type.includes("skeleton")) skinColor = 0xe8e4cc;
  else if (type.includes("ape") || type.includes("monkey")) skinColor = 0x7a5c38;
  else if (type.includes("cat")) skinColor = 0xd4aa70;

  let outfitColor = 0x4a5568;
  if (body.includes("gold")) outfitColor = 0xf0c040;
  else if (body.includes("red")) outfitColor = 0xcc3333;
  else if (body.includes("blue")) outfitColor = 0x3366cc;
  else if (body.includes("green")) outfitColor = 0x2d9e55;
  else if (body.includes("black")) outfitColor = 0x1a1a2e;
  else if (body.includes("white")) outfitColor = 0xe8e8f0;
  else if (body.includes("pink")) outfitColor = 0xff6b9d;
  else if (body.includes("purple")) outfitColor = 0x7c3aed;
  else if (body.includes("orange")) outfitColor = 0xff5f1f;
  else if (body.includes("hoodie")) outfitColor = 0x2d3748;
  else if (body.includes("suit")) outfitColor = 0x1a2744;
  else if (body.includes("yellow")) outfitColor = 0xf0c040;

  let pantsColor = 0x2d3748;
  if (body.includes("gold") || body.includes("yellow")) pantsColor = 0xd4a030;
  else if (body.includes("blue")) pantsColor = 0x1e3a5f;
  else if (body.includes("white")) pantsColor = 0xd0d0d8;
  else if (body.includes("purple")) pantsColor = 0x4a1d96;

  let hairColor = 0x1a1a1a;
  if (hair.includes("gold") || hair.includes("blonde")) hairColor = 0xf0c040;
  else if (hair.includes("red")) hairColor = 0xcc3322;
  else if (hair.includes("blue")) hairColor = 0x3366ff;
  else if (hair.includes("green")) hairColor = 0x2dcc55;
  else if (hair.includes("pink")) hairColor = 0xff6b9d;
  else if (hair.includes("white") || hair.includes("silver")) hairColor = 0xd8d8e8;
  else if (hair.includes("purple")) hairColor = 0x9933ff;
  else if (hair.includes("orange")) hairColor = 0xff7733;
  else if (hair.includes("brown")) hairColor = 0x7a4a28;
  else if (hair.includes("yellow")) hairColor = 0xf0c040;

  let shoeColor = 0x222233;
  if (body.includes("gold") || body.includes("yellow")) shoeColor = 0xd4a030;
  else if (body.includes("blue")) shoeColor = 0x1a3a6a;
  else if (body.includes("red")) shoeColor = 0x8a1a1a;
  else if (body.includes("purple")) shoeColor = 0x3d1560;
  else if (body.includes("white")) shoeColor = 0xc0c0c8;

  let eyeColor = 0x4488ff;
  if (face.includes("laser")) eyeColor = 0xff2222;
  else if (face.includes("3d") || face.includes("glasses")) eyeColor = 0x00ffee;
  else if (face.includes("gold")) eyeColor = 0xffe048;
  else if (face.includes("angry")) eyeColor = 0xff4400;
  else if (face.includes("vr")) eyeColor = 0x00ff88;

  return {
    skinColor, outfitColor, pantsColor, hairColor, shoeColor, eyeColor,
    isRobot: type.includes("robot"),
    hasMohawk: hair.includes("mohawk"),
    hasAfro: hair.includes("afro"),
    hasBun: hair.includes("bun"),
    hasLong: hair.includes("long"),
    hasCap: hair.includes("cap") || hair.includes("hat") || body.includes("cap"),
    isBald: hair.includes("bald") || hair.includes("none") || hair === "",
  };
}

// ── GVC Chunky Toy Figure Builder ─────────────────────────────────────────────
function buildGVCCharacter(THREE: any, traits: any, faceTextureUrl: string | null) {
  const root = new THREE.Group();
  const c = getTraitColors(traits);

  // Materials - smooth, slightly glossy like the reference art
  const mkMat = (color: number, rough = 0.45, metal = 0.05) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

  const skinMat = mkMat(c.skinColor, 0.4, c.isRobot ? 0.7 : 0.05);
  const outfitMat = mkMat(c.outfitColor, 0.5, 0.05);
  const pantsMat = mkMat(c.pantsColor, 0.6, 0.02);
  const hairMat = mkMat(c.hairColor, 0.4, 0.1);
  const shoeMat = mkMat(c.shoeColor, 0.5, 0.1);
  const soleMatW = mkMat(0xffffff, 0.7, 0.0);
  const darkMat = mkMat(0x111111, 0.8, 0.0);
  const eyeGlowMat = new THREE.MeshStandardMaterial({ color: c.eyeColor, emissive: c.eyeColor, emissiveIntensity: 0.8, roughness: 0.1 });

  // ── HEAD — big egg shape, GVC style ──
  // Head is wider than tall, slightly flattened sphere
  const headGeo = new THREE.SphereGeometry(0.52, 32, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat.clone());
  headMesh.scale.set(1.0, 1.08, 0.92); // slightly oval
  headMesh.position.set(0, 1.82, 0);
  headMesh.castShadow = true;
  root.add(headMesh);

  // Face plane - NFT image or fallback face, large on the front of head
  if (faceTextureUrl) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(faceTextureUrl, (tex: any) => {
      tex.flipY = true;
      // Map to a curved surface on front of head
      const faceGeo = new THREE.PlaneGeometry(0.72, 0.72, 1, 1);
      const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, alphaTest: 0.01 });
      const facePlane = new THREE.Mesh(faceGeo, faceMat);
      facePlane.position.set(0, 1.84, 0.47);
      facePlane.rotation.x = -0.08;
      root.add(facePlane);
    }, undefined, () => addFallbackFace(THREE, root, c, eyeGlowMat));
  } else {
    addFallbackFace(THREE, root, c, eyeGlowMat);
  }

  // ── HAIR ──
  if (!c.isBald) {
    if (c.hasCap) {
      // Baseball cap - brim + dome
      const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      capDome.position.set(0, 2.02, 0);
      root.add(capDome);
      // Brim
      const brimGeo = new THREE.CylinderGeometry(0.62, 0.58, 0.06, 24, 1, false, Math.PI * 0.1, Math.PI * 0.8);
      const brim = new THREE.Mesh(brimGeo, hairMat);
      brim.position.set(0.12, 1.84, 0.28);
      brim.rotation.x = 0.3;
      root.add(brim);
      // Cap button
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), darkMat);
      btn.position.set(0, 2.32, 0);
      root.add(btn);
    } else if (c.hasMohawk) {
      for (let i = 0; i < 6; i++) {
        const h = 0.18 + Math.sin((i / 5) * Math.PI) * 0.12;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, h, 8), hairMat);
        spike.position.set(0, 2.38 + h / 2, (i - 2.5) * 0.1);
        root.add(spike);
      }
      // Mohawk base strip
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.62), hairMat);
      strip.position.set(0, 2.32, 0);
      root.add(strip);
    } else if (c.hasAfro) {
      const afro = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), hairMat);
      afro.scale.set(1.0, 0.9, 0.95);
      afro.position.set(0, 1.98, 0);
      root.add(afro);
    } else if (c.hasBun) {
      // Hair base
      const hBase = new THREE.Mesh(new THREE.SphereGeometry(0.53, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
      hBase.position.set(0, 1.9, 0);
      root.add(hBase);
      // Bun on top
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), hairMat);
      bun.position.set(0, 2.36, -0.1);
      root.add(bun);
    } else if (c.hasLong) {
      // Top
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.53, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
      top.position.set(0, 1.9, 0);
      root.add(top);
      // Long flowing sides
      const sideL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.7, 10), hairMat);
      sideL.position.set(-0.42, 1.55, 0);
      root.add(sideL);
      const sideR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.7, 10), hairMat);
      sideR.position.set(0.42, 1.55, 0);
      root.add(sideR);
      const back = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.8, 12), hairMat);
      back.position.set(0, 1.48, -0.22);
      root.add(back);
    } else {
      // Default: short hair cap - sits on top of head
      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
      hairCap.position.set(0, 1.9, 0);
      root.add(hairCap);
      // Small fringe at front
      const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), hairMat);
      fringe.position.set(0, 1.84, 0.34);
      fringe.rotation.x = -0.4;
      root.add(fringe);
    }
  }

  // Robot antenna
  if (c.isRobot) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), hairMat);
    stem.position.set(0, 2.5, 0);
    root.add(stem);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), eyeGlowMat);
    ball.position.set(0, 2.66, 0);
    root.add(ball);
  }

  // ── NECK — short and thick ──
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.2, 16), skinMat);
  neck.position.set(0, 1.24, 0);
  root.add(neck);

  // ── TORSO — wide, chunky, slightly tapered ──
  // Main body
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.72, 20);
  const torso = new THREE.Mesh(torsoGeo, outfitMat);
  torso.position.set(0, 0.78, 0);
  torso.castShadow = true;
  root.add(torso);

  // Torso top rounded cap
  const torsoTop = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), outfitMat);
  torsoTop.position.set(0, 1.14, 0);
  root.add(torsoTop);

  // Collar / neckline
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 10, 24), outfitMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.18, 0);
  root.add(collar);

  // Chain/necklace detail
  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 28), mkMat(0xc8c8c8, 0.2, 0.9));
  chain.rotation.x = Math.PI / 2;
  chain.position.set(0, 1.05, 0.05);
  root.add(chain);

  // ── ARMS — T-pose style (horizontal), thick and chunky ──
  // Shoulder balls
  [-1, 1].forEach((side) => {
    const shoulderX = side * 0.5;

    // Shoulder ball
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14), outfitMat);
    shoulder.position.set(shoulderX, 1.1, 0);
    root.add(shoulder);

    // Upper arm — horizontal T-pose
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.5, 14), outfitMat);
    upperArm.rotation.z = Math.PI / 2; // horizontal
    upperArm.position.set(shoulderX + side * 0.36, 1.02, 0);
    upperArm.castShadow = true;
    root.add(upperArm);

    // Elbow ball
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 10), outfitMat);
    elbow.position.set(shoulderX + side * 0.64, 1.0, 0);
    root.add(elbow);

    // Lower arm
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.42, 14), skinMat);
    lowerArm.rotation.z = Math.PI / 2;
    lowerArm.position.set(shoulderX + side * 0.92, 0.98, 0);
    lowerArm.castShadow = true;
    root.add(lowerArm);

    // Hand — round chunky mitten
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), skinMat);
    hand.scale.set(1.2, 0.9, 0.8);
    hand.position.set(shoulderX + side * 1.16, 0.96, 0);
    hand.castShadow = true;
    root.add(hand);

    // Thumb
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skinMat);
    thumb.position.set(shoulderX + side * 1.13, 1.08, 0.07);
    root.add(thumb);
  });

  // ── HIPS — wide block ──
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.28, 20), pantsMat);
  hips.position.set(0, 0.36, 0);
  root.add(hips);

  // ── LEGS — wide stance, chunky ──
  [-1, 1].forEach((side) => {
    const legX = side * 0.22;

    // Upper leg — thick
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.44, 16), pantsMat);
    upperLeg.position.set(legX, 0.06, 0);
    upperLeg.castShadow = true;
    root.add(upperLeg);

    // Knee ball
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 10), pantsMat);
    knee.position.set(legX, -0.18, 0);
    root.add(knee);

    // Lower leg
    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.38, 16), pantsMat);
    lowerLeg.position.set(legX, -0.4, 0);
    lowerLeg.castShadow = true;
    root.add(lowerLeg);

    // Ankle
    const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), pantsMat);
    ankle.position.set(legX, -0.62, 0);
    root.add(ankle);

    // ── SHOE — chunky sneaker ──
    // Main shoe body
    const shoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.42), shoeMat);
    shoeBody.position.set(legX, -0.74, 0.04);
    shoeBody.castShadow = true;
    root.add(shoeBody);

    // Toe box (rounded front)
    const toebox = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), shoeMat);
    toebox.scale.set(1.0, 0.65, 1.2);
    toebox.position.set(legX, -0.74, 0.2);
    root.add(toebox);

    // Heel
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.16), shoeMat);
    heel.position.set(legX, -0.74, -0.14);
    root.add(heel);

    // White sole strip
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.44), soleMatW);
    sole.position.set(legX, -0.83, 0.04);
    root.add(sole);

    // Sole bottom (slightly darker)
    const soleBtm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.44), mkMat(0xdddddd, 0.7, 0.0));
    soleBtm.position.set(legX, -0.87, 0.04);
    root.add(soleBtm);

    // Laces line
    const laces = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.18), mkMat(0xffffff, 0.6, 0.0));
    laces.position.set(legX, -0.67, 0.06);
    root.add(laces);
  });

  // ── GROUND ELEMENTS ──
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), new THREE.MeshBasicMaterial({ color: c.eyeColor, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.92;
  root.add(glow);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.91;
  root.add(shadow);

  return root;
}

function addFallbackFace(THREE: any, root: any, c: any, eyeGlowMat: any) {
  // Big eyes in GVC style
  [-0.18, 0.18].forEach((x) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    eyeWhite.position.set(x, 1.86, 0.44);
    root.add(eyeWhite);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), eyeGlowMat);
    iris.position.set(x, 1.86, 0.5);
    root.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupil.position.set(x, 1.86, 0.54);
    root.add(pupil);
    // Shine dot
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(x + 0.03, 1.9, 0.56);
    root.add(shine);
  });

  // Simple smile
  const smileMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for (let i = 0; i < 5; i++) {
    const angle = (i / 4) * Math.PI - Math.PI / 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), smileMat);
    dot.position.set(Math.cos(angle) * 0.12, 1.66 + Math.sin(angle) * 0.04, 0.48);
    root.add(dot);
  }
}

// ── Animations ────────────────────────────────────────────────────────────────
function animateCharacter(char: any, anim: string, clock: any, delta: number, camera: any) {
  if (!char) return;
  const t = clock.elapsedTime;

  // Reset
  char.position.x = char.userData.baseX || 0;
  char.position.y = char.userData.baseY || 0;

  if (anim === "idle") {
    char.position.y = (char.userData.baseY || 0) + Math.sin(t * 1.4) * 0.035;
    char.rotation.y = Math.sin(t * 0.5) * 0.06;
  } else if (anim === "strut") {
    char.position.x = Math.sin(t * 0.9) * 0.5;
    char.position.y = (char.userData.baseY || 0) + Math.abs(Math.sin(t * 1.8)) * 0.1;
    char.rotation.y = Math.cos(t * 0.9) * 0.35;
  } else if (anim === "vibe") {
    char.position.y = (char.userData.baseY || 0) + Math.abs(Math.sin(t * 3.5)) * 0.14;
    char.rotation.z = Math.sin(t * 3.5) * 0.1;
    char.rotation.y += delta * 0.6;
  } else if (anim === "pose") {
    char.position.y = (char.userData.baseY || 0) + Math.sin(t * 0.6) * 0.06;
    char.rotation.y = Math.sin(t * 0.25) * 0.18;
    char.rotation.z = Math.sin(t * 0.8) * 0.04;
  }

  // Face camera during idle/pose
  if (anim !== "vibe" && camera) {
    const targetY = Math.atan2(camera.position.x - char.position.x, camera.position.z - char.position.z);
    if (anim === "idle" || anim === "pose") {
      char.rotation.y += (targetY - char.rotation.y) * 0.025;
    }
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
    let phi = Math.PI / 2.6, theta = 0, radius = 5.5;
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
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      threeScene = new THREE.Scene();
      threeScene.fog = new THREE.Fog(scene.fogColor, scene.fogNear, scene.fogFar);
      threeScene.background = new THREE.Color(scene.fogColor);

      camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      setCameraMode(currentCamMode);

      threeScene.add(new THREE.AmbientLight(scene.ambientColor, scene.ambientIntensity));

      // Key light from front-above for that toy render look
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(2, 5, 4);
      keyLight.castShadow = true;
      threeScene.add(keyLight);

      scene.lights.forEach((l: any) => {
        const light = new THREE.PointLight(l.color, l.intensity, 20);
        light.position.set(l.x, l.y, l.z);
        light.castShadow = true;
        threeScene.add(light);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: l.color }));
        orb.position.set(l.x, l.y, l.z);
        threeScene.add(orb);
      });

      // Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: scene.floorColor, roughness: 0.2, metalness: 0.8 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      threeScene.add(floor);

      const grid = new THREE.GridHelper(30, 30, scene.lights[0].color, scene.lights[0].color);
      grid.material.opacity = 0.07;
      grid.material.transparent = true;
      threeScene.add(grid);

      // Buildings
      [[-8,0,-10],[-5,0,-12],[-2,0,-11],[3,0,-10],[6,0,-12],[9,0,-10],[-10,0,-6],[10,0,-6]].forEach(([x,_y,z], i) => {
        const h = [6,9,5,7,10,6,8,7][i], w = 1.5 + (i%3)*0.5;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), new THREE.MeshStandardMaterial({ color: new THREE.Color(scene.floorColor).multiplyScalar(1.6), roughness:0.7, metalness:0.2 }));
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

      // Build character
      const charGroup = buildGVCCharacter(THREE, character?.traits, characterImg);
      charGroup.position.set(0, 0.92, 0);
      charGroup.userData.baseY = 0.92;
      charGroup.userData.baseX = 0;
      threeScene.add(charGroup);
      characterMesh = charGroup;
      setBuilding(false);

      // Controls
      canvas.addEventListener("mousedown", (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
      canvas.addEventListener("mousemove", (e) => {
        if (!isDragging || currentCamMode !== "orbit") return;
        theta -= (e.clientX - lastX) * 0.01;
        phi = Math.max(0.2, Math.min(Math.PI * 0.8, phi - (e.clientY - lastY) * 0.01));
        lastX = e.clientX; lastY = e.clientY;
      });
      canvas.addEventListener("mouseup", () => { isDragging = false; });
      canvas.addEventListener("wheel", (e) => { if (currentCamMode !== "orbit") return; radius = Math.max(2.5, Math.min(14, radius + e.deltaY * 0.006)); });

      // Touch
      let ltx = 0, lty = 0;
      canvas.addEventListener("touchstart", (e) => { ltx = e.touches[0].clientX; lty = e.touches[0].clientY; });
      canvas.addEventListener("touchmove", (e) => {
        if (currentCamMode !== "orbit") return;
        theta -= (e.touches[0].clientX - ltx) * 0.01;
        phi = Math.max(0.2, Math.min(Math.PI * 0.8, phi - (e.touches[0].clientY - lty) * 0.01));
        ltx = e.touches[0].clientX; lty = e.touches[0].clientY;
      });

      window.addEventListener("resize", onResize);
      setSceneReady(true);
      animate();
    };
    document.head.appendChild(script);

    function setCameraMode(mode: string) {
      if (mode === "closeup") { radius = 3; phi = Math.PI/2.3; theta = 0.2; }
      else if (mode === "wide") { radius = 11; phi = Math.PI/2.8; theta = 0.4; }
      else if (mode === "cinematic") { radius = 6.5; phi = Math.PI/2.5; theta = 0; }
      else { radius = 5.5; phi = Math.PI/2.6; theta = 0; }
      updateCamera();
    }
    function updateCamera() {
      if (!camera) return;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi)+1.0, radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0, 1.0, 0);
    }
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animateCharacter(characterMesh, currentAnim, clock, delta, camera);
      if (particles) {
        const pa = particles.geometry.attributes.position.array as Float32Array;
        const sp = particles.userData.speeds;
        for (let i = 0; i < pa.length/3; i++) {
          pa[i*3+1] += scene.particles.speed * sp[i];
          if (pa[i*3+1] > 10) { pa[i*3+1]=0; pa[i*3]=(Math.random()-0.5)*20; pa[i*3+2]=(Math.random()-0.5)*20; }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
      if (currentCamMode === "cinematic") {
        cinematicT += delta*0.12;
        theta = Math.sin(cinematicT)*0.7;
        phi = Math.PI/2.5+Math.sin(cinematicT*0.4)*0.12;
      }
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
    <div style={{ background:"#050505", minHeight:"100vh", color:"#fff", fontFamily:"var(--font-mundial, sans-serif)" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::placeholder{color:#2a2a2a} input:focus{outline:none;border-color:#FFE04844!important} @keyframes shimmer{0%{background-position:0% center}100%{background-position:200% center}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#050505} ::-webkit-scrollbar-thumb{background:#1F1F1F;border-radius:2px}`}</style>

      <div style={{ borderBottom:"1px solid #1F1F1F", padding:"28px 40px 24px", background:"#080808" }}>
        <p style={{ color:"#FFE048", fontSize:10, letterSpacing:4, textTransform:"uppercase", marginBottom:8, opacity:0.6 }}>BERGENFOX · GVC UNIVERSE</p>
        <h1 style={{ fontFamily:"var(--font-brice, serif)", fontWeight:900, fontSize:36, textTransform:"uppercase", background:"linear-gradient(135deg, #FFE048 0%, #FF5F1F 50%, #FFE048 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>3D SCENE VIEWER</h1>
        <p style={{ color:"#444", fontSize:13, marginTop:6 }}>Your GVC citizen — chunky toy figure built from traits, placed in a live Vibetown scene</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", minHeight:"calc(100vh - 100px)" }}>
        <div style={{ borderRight:"1px solid #1F1F1F", padding:"28px 24px", display:"flex", flexDirection:"column", gap:24, overflowY:"auto", background:"#070707" }}>

          <div>
            <SideLabel>01 · YOUR GVC</SideLabel>
            <div style={{ display:"flex", gap:0, marginBottom:10 }}>
              <input type="number" value={tokenId} onChange={(e)=>setTokenId(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&loadCharacter()} placeholder="Token ID  0–6968" min={0} max={6968}
                style={{ flex:1, background:"#0d0d0d", border:"1px solid #1F1F1F", borderRight:"none", borderRadius:"8px 0 0 8px", padding:"10px 12px", color:"#fff", fontSize:13, fontFamily:"var(--font-mundial, sans-serif)" }} />
              <button onClick={loadCharacter} disabled={loadingChar} style={{ background:"#1F1F1F", border:"1px solid #1F1F1F", borderRadius:"0 8px 8px 0", padding:"10px 14px", color:"#FFE048", fontSize:11, fontWeight:700, letterSpacing:1, cursor:loadingChar?"not-allowed":"pointer" }}>
                {loadingChar?"···":"LOAD"}
              </button>
            </div>
            {charError && <p style={{ color:"#FF5F1F", fontSize:11, marginBottom:8 }}>{charError}</p>}
            {character && (
              <>
                <div style={{ background:"#0d0d0d", border:"1px solid #1F1F1F", borderRadius:10, padding:12, display:"flex", gap:12 }}>
                  {characterImg && <img src={characterImg} alt={character.name} style={{ width:52, height:52, borderRadius:8, objectFit:"cover", flexShrink:0 }} onError={(e)=>(e.currentTarget.style.display="none")} />}
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#FFE048", marginBottom:4 }}>{character.name}</p>
                    {character.traits&&Object.entries(character.traits).map(([k,v]: any)=>(
                      <div key={k} style={{ fontSize:10, color:"#555", marginBottom:2 }}><span style={{ color:"#333", textTransform:"uppercase", letterSpacing:1 }}>{k} </span>{v}</div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:10, background:"#0d0d1a", border:"1px solid #FFE04822", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:10, color:"#FFE048", letterSpacing:1 }}>✦ GVC TOY FIGURE — TRAIT GENERATED</p>
                  <p style={{ fontSize:9, color:"#444", marginTop:3 }}>Chunky cartoon style · NFT face · Colors from traits</p>
                </div>
              </>
            )}
          </div>

          <div>
            <SideLabel>02 · ENVIRONMENT</SideLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {SCENES.map((s)=>(
                <button key={s.id} onClick={()=>setSelectedScene(s)} style={{ background:selectedScene.id===s.id?"#ffffff08":"transparent", border:`1px solid ${selectedScene.id===s.id?"#ffffff22":"#1F1F1F"}`, borderRadius:8, padding:"10px 12px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:selectedScene.id===s.id?"#fff":"#555" }}>{s.label}</div><div style={{ fontSize:10, color:"#333", marginTop:2 }}>{s.desc}</div></div>
                  {selectedScene.id===s.id&&<div style={{ width:6, height:6, borderRadius:"50%", background:accentHex, flexShrink:0 }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SideLabel>03 · ANIMATION</SideLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {ANIMATIONS.map((a)=>(
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
              {CAMERA_MODES.map((cm)=>(
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
            {!character?"LOAD A CHARACTER FIRST":launched?"↺ REBUILD SCENE":"▶ BUILD & LAUNCH"}
          </button>
        </div>

        <div style={{ position:"relative", background:"#030303" }}>
          <canvas ref={canvasRef} style={{ display:launched?"block":"none", width:"100%", height:"100%", cursor:selectedCam.id==="orbit"?"grab":"default" }} />

          {launched&&(building||!sceneReady)&&(
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, background:"#030303" }}>
              <div style={{ width:40, height:40, border:"2px solid #1F1F1F", borderTop:`2px solid ${accentHex}`, borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
              <p style={{ color:accentHex, fontSize:11, letterSpacing:3, textTransform:"uppercase", animation:"pulse 2s ease infinite" }}>
                {building?"SCULPTING YOUR GVC FIGURE···":"LOADING SCENE···"}
              </p>
              {building&&character&&<p style={{ color:"#333", fontSize:10 }}>Building chunky toy figure from {Object.keys(character.traits||{}).length} traits</p>}
            </div>
          )}

          {!launched&&(
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"radial-gradient(ellipse at center, #0d0d1a 0%, #030303 70%)" }}>
              {[100,160,220].map((size,i)=>(<div key={i} style={{ position:"absolute", width:size, height:size, borderRadius:"50%", border:"1px solid #FFE04818", animation:`pulse ${2+i*0.5}s ease infinite`, animationDelay:`${i*0.3}s` }} />))}
              <div style={{ fontSize:48, opacity:0.2 }}>🧸</div>
              <p style={{ color:"#2a2a2a", fontSize:12, letterSpacing:3, textTransform:"uppercase", textAlign:"center", zIndex:1 }}>
                {character?"Hit BUILD & LAUNCH to generate your GVC figure":"Load your GVC token to begin"}
              </p>
            </div>
          )}

          {launched&&sceneReady&&!building&&(
            <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
              <div style={{ position:"absolute", top:20, left:20, background:"rgba(5,5,5,0.7)", border:"1px solid #1F1F1F", borderRadius:8, padding:"8px 14px", backdropFilter:"blur(8px)" }}>
                <p style={{ fontSize:9, letterSpacing:2, color:accentHex, textTransform:"uppercase", marginBottom:2 }}>● LIVE · {selectedScene.label}</p>
                <p style={{ fontSize:10, color:"#444" }}>{selectedAnim.label} · {selectedCam.label}</p>
              </div>
              {character&&(
                <div style={{ position:"absolute", top:20, right:20, background:"rgba(5,5,5,0.7)", border:"1px solid #1F1F1F", borderRadius:8, padding:"8px 14px", backdropFilter:"blur(8px)", textAlign:"right" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#FFE048" }}>{character.name}</p>
                  <p style={{ fontSize:9, color:"#333", letterSpacing:1 }}>GVC TOY FIGURE · 3D</p>
                </div>
              )}
              {selectedCam.id==="orbit"&&(
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
