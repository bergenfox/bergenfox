"use client";
import { useState, useEffect, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const PANEL_LAYOUTS = [
  { id: "single", label: "SPLASH", desc: "One epic full-width panel", panels: 1 },
  { id: "duo", label: "DUO", desc: "Two panels side by side", panels: 2 },
  { id: "triptych", label: "TRIPTYCH", desc: "Three-act story beat", panels: 3 },
  { id: "quad", label: "QUAD", desc: "Four-panel sequence", panels: 4 },
];

const STYLES = [
  { id: "noir", label: "NOIR", desc: "High contrast ink, deep shadows" },
  { id: "vibrant", label: "VIBRANT", desc: "Bold colors, street art energy" },
  { id: "manga", label: "MANGA", desc: "Clean lines, dynamic motion" },
  { id: "watercolor", label: "WATERCOLOR", desc: "Loose, expressive washes" },
];

const MOODS = ["TRIUMPHANT", "MYSTERIOUS", "CHAOTIC", "MELANCHOLIC", "EUPHORIC", "DEFIANT"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getIpfsUrl(ipfs: string | null) {
  if (!ipfs) return null;
  return ipfs.replace("ipfs://", "https://ipfs.io/ipfs/");
}

// ── Claude API call ───────────────────────────────────────────────────────────
async function generatePanels({ character, scene, style, mood, layout, traits }) {
  const traitStr = traits
    ? Object.entries(traits).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "Unknown traits";

  const systemPrompt = `You are a master graphic novel writer and visual director for the Good Vibes Club universe — a vibrant, character-driven NFT world set in Vibetown. 
Your job is to generate vivid, cinematic comic panel descriptions and dialogue for GVC characters.
Style: Dark, gold-accented, premium. Characters are unique, expressive, with personality baked into their traits.
Always return ONLY valid JSON — no preamble, no markdown fences.`;

  const userPrompt = `Generate a ${layout.panels}-panel graphic novel sequence for this GVC character:

CHARACTER: ${character.name || `GVC #${character.id}`}
TRAITS: ${traitStr}
SCENE PREMISE: ${scene}
ART STYLE: ${style.label} — ${style.desc}
MOOD: ${mood}

Return JSON with this exact shape:
{
  "title": "story title in ALL CAPS",
  "logline": "one gripping sentence describing the story",
  "panels": [
    {
      "number": 1,
      "setting": "vivid visual description of the environment and lighting (2-3 sentences)",
      "action": "what is happening in this panel, camera angle, composition (2-3 sentences)",
      "dialogue": "spoken line or internal monologue — keep it punchy, max 12 words. Use null if silent panel.",
      "caption": "narrative caption box text (optional atmospheric narration, max 10 words, or null)",
      "sfx": "sound effect text if any (e.g. BOOM, CRACK, null)"
    }
  ],
  "epilogue": "one-line teaser hinting at what comes next"
}

Make the panels feel like a real comic — vary the pacing, use silent panels for tension, let the character's traits inform their personality and actions. The ${mood} mood should be felt throughout.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.map((b) => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Panel SVG Illustration ────────────────────────────────────────────────────
function PanelIllustration({ panel, style, characterImg, index, mood }) {
  const moodColors = {
    TRIUMPHANT: ["#FFE048", "#FF5F1F"],
    MYSTERIOUS: ["#6B4FFF", "#FF6B9D"],
    CHAOTIC: ["#FF5F1F", "#FF6B9D"],
    MELANCHOLIC: ["#4F7FFF", "#6B4FFF"],
    EUPHORIC: ["#2EFF2E", "#FFE048"],
    DEFIANT: ["#FF5F1F", "#FFE048"],
  };

  const stylePatterns = {
    noir: { bg: "#0a0a0a", accent: "#FFE048", lines: "#1a1a1a" },
    vibrant: { bg: "#1a0a2e", accent: "#FF6B9D", lines: "#2a1a3e" },
    manga: { bg: "#050510", accent: "#fff", lines: "#111120" },
    watercolor: { bg: "#080818", accent: "#FFE048", lines: "#101025" },
  };

  const sp = stylePatterns[style.id] || stylePatterns.noir;
  const [c1, c2] = moodColors[mood] || ["#FFE048", "#FF6B9D"];

  // Generate pseudo-random but deterministic lines based on panel index
  const seed = index * 7 + panel.number * 13;
  const lines = Array.from({ length: 8 }, (_, i) => ({
    x1: ((seed * (i + 1) * 37) % 100),
    y1: ((seed * (i + 2) * 17) % 100),
    x2: ((seed * (i + 3) * 53) % 100),
    y2: ((seed * (i + 4) * 29) % 100),
    op: 0.03 + (i % 4) * 0.02,
  }));

  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={`bg${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={sp.bg} />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`glow${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.15" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id={`spot${index}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip${index}`}>
          <rect width="400" height="300" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="400" height="300" fill={`url(#bg${index})`} />
      <rect width="400" height="300" fill={`url(#glow${index})`} />
      <rect width="400" height="300" fill={`url(#spot${index})`} />

      {/* Atmospheric lines */}
      {lines.map((l, i) => (
        <line
          key={i}
          x1={`${l.x1}%`} y1={`${l.y1}%`}
          x2={`${l.x2}%`} y2={`${l.y2}%`}
          stroke={c1} strokeOpacity={l.op} strokeWidth="0.5"
        />
      ))}

      {/* Halftone dots pattern suggestion */}
      {style.id === "manga" && (
        <>
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 50 + 25}
                cy={row * 50 + 25}
                r="1"
                fill={c1}
                opacity="0.06"
              />
            ))
          )}
        </>
      )}

      {/* Character image or silhouette */}
      {characterImg ? (
        <image
          href={characterImg}
          x="120" y="40" width="160" height="160"
          clipPath={`url(#clip${index})`}
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        /* Stylised silhouette */
        <g opacity="0.4">
          <ellipse cx="200" cy="110" rx="28" ry="28" fill={c1} opacity="0.6" />
          <rect x="172" y="138" width="56" height="70" rx="8" fill={c1} opacity="0.4" />
        </g>
      )}

      {/* Mood glow under character */}
      <ellipse cx="200" cy="230" rx="80" ry="16" fill={c1} opacity="0.08" />

      {/* SFX */}
      {panel.sfx && (
        <text
          x="20" y="50"
          fontFamily="serif"
          fontWeight="900"
          fontSize="28"
          fill={c1}
          opacity="0.9"
          transform={`rotate(-8 20 50)`}
          stroke="#050505"
          strokeWidth="4"
          paintOrder="stroke"
        >
          {panel.sfx}
        </text>
      )}

      {/* Caption box */}
      {panel.caption && (
        <>
          <rect x="0" y="0" width="400" height="36" fill="#050505" opacity="0.85" />
          <text x="12" y="22" fontFamily="Georgia, serif" fontSize="11" fill={c1} opacity="0.9">
            {panel.caption}
          </text>
        </>
      )}

      {/* Dialogue bubble */}
      {panel.dialogue && (
        <>
          <rect x="8" y="244" width="384" height="48" rx="6" fill="#050505" opacity="0.9" />
          <rect x="8" y="244" width="384" height="48" rx="6" fill="none" stroke={c1} strokeWidth="1" opacity="0.4" />
          <text x="20" y="264" fontFamily="Georgia, serif" fontSize="11" fill="#fff" opacity="0.95">
            <tspan x="20" dy="0">{panel.dialogue.slice(0, 55)}</tspan>
            {panel.dialogue.length > 55 && (
              <tspan x="20" dy="14">{panel.dialogue.slice(55, 110)}</tspan>
            )}
          </text>
        </>
      )}

      {/* Panel number badge */}
      <rect x="368" y="8" width="24" height="24" rx="4" fill={c1} opacity="0.9" />
      <text x="380" y="24" textAnchor="middle" fontFamily="serif" fontWeight="900" fontSize="12" fill="#050505">
        {panel.number}
      </text>

      {/* Corner accent lines */}
      <line x1="0" y1="0" x2="24" y2="0" stroke={c1} strokeWidth="2" opacity="0.6" />
      <line x1="0" y1="0" x2="0" y2="24" stroke={c1} strokeWidth="2" opacity="0.6" />
      <line x1="400" y1="300" x2="376" y2="300" stroke={c1} strokeWidth="2" opacity="0.6" />
      <line x1="400" y1="300" x2="400" y2="276" stroke={c1} strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

// ── Panel Card ────────────────────────────────────────────────────────────────
function PanelCard({ panel, style, characterImg, index, mood, isWide }) {
  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "2px solid #1F1F1F",
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gridColumn: isWide ? "1 / -1" : undefined,
      }}
    >
      {/* Visual panel */}
      <div style={{ aspectRatio: isWide ? "21/9" : "4/3", background: "#050505", position: "relative" }}>
        <PanelIllustration
          panel={panel}
          style={style}
          characterImg={characterImg}
          index={index}
          mood={mood}
        />
      </div>

      {/* Director's notes */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1F1F1F", flex: 1 }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: 12,
          color: "#555",
          lineHeight: 1.7,
          margin: "0 0 8px",
          fontStyle: "italic",
        }}>
          {panel.setting}
        </p>
        <p style={{
          fontFamily: "var(--font-mundial, sans-serif)",
          fontSize: 12,
          color: "#888",
          lineHeight: 1.6,
          margin: 0,
        }}>
          {panel.action}
        </p>
      </div>
    </div>
  );
}

// ── Main Engine ───────────────────────────────────────────────────────────────
export default function GraphicNovelEngine() {
  const [tokenId, setTokenId] = useState("");
  const [character, setCharacter] = useState(null);
  const [characterImg, setCharacterImg] = useState(null);
  const [loadingChar, setLoadingChar] = useState(false);
  const [charError, setCharError] = useState("");

  const [scene, setScene] = useState("");
  const [selectedLayout, setSelectedLayout] = useState(PANEL_LAYOUTS[2]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMood, setSelectedMood] = useState("TRIUMPHANT");

  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [genError, setGenError] = useState("");

  const resultRef = useRef(null);

  // Load character from metadata
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
      if (!token) throw new Error("Token not found");

      setCharacter({ id, name: token.name, traits: token.traits });

      if (token.image) {
        const url = getIpfsUrl(token.image);
        setCharacterImg(url);
      }
    } catch (e) {
      setCharError("Could not load character. Check the token ID.");
    } finally {
      setLoadingChar(false);
    }
  };

  const handleGenerate = async () => {
    if (!character) { setGenError("Load a character first"); return; }
    if (!scene.trim()) { setGenError("Describe a scene"); return; }

    setGenerating(true);
    setGenError("");
    setStory(null);

    try {
      const result = await generatePanels({
        character,
        scene,
        style: selectedStyle,
        mood: selectedMood,
        layout: selectedLayout,
        traits: character.traits,
      });
      setStory(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setGenError("Generation failed. Try again.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const moodColors = {
    TRIUMPHANT: "#FFE048", MYSTERIOUS: "#6B4FFF", CHAOTIC: "#FF5F1F",
    MELANCHOLIC: "#4F7FFF", EUPHORIC: "#2EFF2E", DEFIANT: "#FF5F1F",
  };

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "var(--font-mundial, sans-serif)",
      paddingBottom: 80,
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #333; }
        input:focus, textarea:focus { outline: none; border-color: #FFE04844 !important; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1F1F1F; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1F1F1F",
        padding: "32px 40px 28px",
        background: "#080808",
      }}>
        <p style={{ color: "#FFE048", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
          BERGENFOX · GVC UNIVERSE
        </p>
        <h1 style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: 40,
          textTransform: "uppercase",
          letterSpacing: 1,
          background: "linear-gradient(135deg, #FFE048 0%, #FF6B9D 50%, #FFE048 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
        }}>
          GRAPHIC NOVEL ENGINE
        </h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 8, letterSpacing: 1 }}>
          Animate your GVC character into a comic panel sequence
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 40, alignItems: "start" }}>

          {/* ── LEFT PANEL: Controls ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Step 1: Character */}
            <div>
              <StepLabel number="01" label="YOUR CHARACTER" />
              <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
                <input
                  type="number"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadCharacter()}
                  placeholder="Token ID (0–6968)"
                  min={0} max={6968}
                  style={{
                    flex: 1,
                    background: "#0d0d0d",
                    border: "1px solid #1F1F1F",
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                    padding: "11px 14px",
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "var(--font-mundial, sans-serif)",
                  }}
                />
                <button
                  onClick={loadCharacter}
                  disabled={loadingChar}
                  style={{
                    background: "#1F1F1F",
                    border: "1px solid #1F1F1F",
                    borderRadius: "0 8px 8px 0",
                    padding: "11px 16px",
                    color: "#FFE048",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    cursor: loadingChar ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loadingChar ? "···" : "LOAD →"}
                </button>
              </div>

              {charError && <p style={{ color: "#FF5F1F", fontSize: 12, marginBottom: 8 }}>{charError}</p>}

              {character && (
                <div style={{
                  background: "#0d0d0d",
                  border: "1px solid #1F1F1F",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  animation: "fadeUp 0.3s ease",
                }}>
                  {characterImg && (
                    <img
                      src={characterImg}
                      alt={character.name}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#FFE048", marginBottom: 6 }}>
                      {character.name}
                    </p>
                    {character.traits && Object.entries(character.traits).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#444", letterSpacing: 1, textTransform: "uppercase", minWidth: 60 }}>{k}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Scene */}
            <div>
              <StepLabel number="02" label="THE SCENE" />
              <textarea
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="Describe what happens — the conflict, setting, or moment you want to capture. The more vivid, the better."
                rows={5}
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid #1F1F1F",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#fff",
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: "var(--font-mundial, sans-serif)",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Step 3: Layout */}
            <div>
              <StepLabel number="03" label="PANEL LAYOUT" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PANEL_LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLayout(l)}
                    style={{
                      background: selectedLayout.id === l.id ? "#FFE04812" : "#0d0d0d",
                      border: `1px solid ${selectedLayout.id === l.id ? "#FFE04844" : "#1F1F1F"}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: selectedLayout.id === l.id ? "#FFE048" : "#888", marginBottom: 2 }}>
                      {l.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#444", letterSpacing: 0.5 }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Art Style */}
            <div>
              <StepLabel number="04" label="ART STYLE" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s)}
                    style={{
                      background: selectedStyle.id === s.id ? "#FFE04812" : "#0d0d0d",
                      border: `1px solid ${selectedStyle.id === s.id ? "#FFE04844" : "#1F1F1F"}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: selectedStyle.id === s.id ? "#FFE048" : "#888" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#444" }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Mood */}
            <div>
              <StepLabel number="05" label="MOOD" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    style={{
                      background: selectedMood === m ? `${moodColors[m]}18` : "#0d0d0d",
                      border: `1px solid ${selectedMood === m ? `${moodColors[m]}55` : "#1F1F1F"}`,
                      borderRadius: 20,
                      padding: "7px 14px",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      color: selectedMood === m ? moodColors[m] : "#444",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            {genError && <p style={{ color: "#FF5F1F", fontSize: 12 }}>{genError}</p>}

            <button
              onClick={handleGenerate}
              disabled={generating || !character || !scene.trim()}
              style={{
                background: generating || !character || !scene.trim() ? "#111" : "#FFE048",
                border: "none",
                borderRadius: 12,
                padding: "16px 0",
                color: generating || !character || !scene.trim() ? "#333" : "#050505",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: generating || !character || !scene.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!generating && character && scene.trim()) {
                  e.target.style.boxShadow = "0 0 32px #FFE04844";
                }
              }}
              onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
            >
              {generating ? (
                <span style={{ animation: "pulse 1s ease infinite", display: "inline-block" }}>
                  GENERATING PANELS···
                </span>
              ) : "GENERATE COMIC →"}
            </button>
          </div>

          {/* ── RIGHT: Output ── */}
          <div ref={resultRef}>
            {!story && !generating && (
              <div style={{
                background: "#080808",
                border: "1px dashed #1F1F1F",
                borderRadius: 16,
                padding: 60,
                textAlign: "center",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}>
                <div style={{ fontSize: 48, opacity: 0.3 }}>📖</div>
                <p style={{ color: "#2a2a2a", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                  Your story will appear here
                </p>
                <p style={{ color: "#1a1a1a", fontSize: 11 }}>
                  Load a character · Set the scene · Generate
                </p>
              </div>
            )}

            {generating && (
              <div style={{
                background: "#080808",
                border: "1px solid #1F1F1F",
                borderRadius: 16,
                padding: 60,
                textAlign: "center",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}>
                <div style={{
                  width: 48, height: 48,
                  border: "2px solid #1F1F1F",
                  borderTop: "2px solid #FFE048",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }} />
                <p style={{ color: "#FFE048", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", animation: "pulse 2s ease infinite" }}>
                  SCRIPTING THE SCENE
                </p>
                <p style={{ color: "#333", fontSize: 11 }}>
                  The panel director is at work···
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {story && !generating && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                {/* Story header */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    display: "inline-block",
                    background: `${moodColors[selectedMood]}18`,
                    border: `1px solid ${moodColors[selectedMood]}33`,
                    borderRadius: 20,
                    padding: "4px 14px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: moodColors[selectedMood],
                    marginBottom: 12,
                  }}>
                    {selectedMood} · {selectedStyle.label} · {selectedLayout.label}
                  </div>
                  <h2 style={{
                    fontFamily: "var(--font-brice, serif)",
                    fontWeight: 900,
                    fontSize: 28,
                    textTransform: "uppercase",
                    color: "#fff",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}>
                    {story.title}
                  </h2>
                  <p style={{ color: "#666", fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>
                    {story.logline}
                  </p>
                </div>

                {/* Panels grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: selectedLayout.panels === 1 ? "1fr"
                    : selectedLayout.panels === 2 ? "1fr 1fr"
                    : selectedLayout.panels === 3 ? "1fr 1fr"
                    : "1fr 1fr",
                  gap: 12,
                  marginBottom: 24,
                }}>
                  {story.panels?.map((panel, i) => (
                    <PanelCard
                      key={i}
                      panel={panel}
                      style={selectedStyle}
                      characterImg={characterImg}
                      index={i}
                      mood={selectedMood}
                      isWide={selectedLayout.panels === 1 || (selectedLayout.panels === 3 && i === 0)}
                    />
                  ))}
                </div>

                {/* Epilogue */}
                {story.epilogue && (
                  <div style={{
                    background: "#0d0d0d",
                    border: "1px solid #1F1F1F",
                    borderLeft: `3px solid #FFE048`,
                    borderRadius: "0 10px 10px 0",
                    padding: "14px 20px",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}>
                    <span style={{ color: "#FFE048", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      NEXT TIME
                    </span>
                    <p style={{ color: "#666", fontSize: 13, fontStyle: "italic", margin: 0 }}>
                      {story.epilogue}
                    </p>
                  </div>
                )}

                {/* Regenerate */}
                <button
                  onClick={handleGenerate}
                  style={{
                    marginTop: 20,
                    background: "transparent",
                    border: "1px solid #1F1F1F",
                    borderRadius: 10,
                    padding: "12px 24px",
                    color: "#555",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "#FFE04844"; e.target.style.color = "#FFE048"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "#1F1F1F"; e.target.style.color = "#555"; }}
                >
                  ↺ REGENERATE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step Label ────────────────────────────────────────────────────────────────
function StepLabel({ number, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{
        fontFamily: "var(--font-brice, serif)",
        fontWeight: 900,
        fontSize: 11,
        color: "#FFE048",
        opacity: 0.5,
        letterSpacing: 1,
      }}>
        {number}
      </span>
      <span style={{
        fontSize: 10,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "#555",
        fontWeight: 700,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1F1F1F" }} />
    </div>
  );
}
