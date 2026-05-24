"use client";
import { useState, useEffect, useRef } from "react";

const PANEL_LAYOUTS = [
  { id: "single", label: "SPLASH", desc: "One epic full-width panel", panels: 1 },
  { id: "duo", label: "DUO", desc: "Two panels side by side", panels: 2 },
  { id: "triptych", label: "TRIPTYCH", desc: "Three-act story beat", panels: 3 },
  { id: "quad", label: "QUAD", desc: "Four-panel sequence", panels: 4 },
];

const STYLES = [
  { id: "comic", label: "COMIC BOOK", desc: "Bold outlines, halftone dots, vibrant" },
  { id: "noir", label: "NOIR", desc: "High contrast ink, deep shadows" },
  { id: "manga", label: "MANGA", desc: "Clean lines, dynamic motion" },
  { id: "retro", label: "RETRO POP", desc: "70s comic, warm tones, gritty" },
];

const MOODS = ["TRIUMPHANT", "MYSTERIOUS", "CHAOTIC", "MELANCHOLIC", "EUPHORIC", "DEFIANT"];

// ── Build DALL-E prompt for a panel ──────────────────────────────────────────
function buildImagePrompt(panel: any, character: any, style: any, mood: string, traits: any) {
  const type = traits?.Type || "human";
  const hair = traits?.Hair || "short hair";
  const body = traits?.Body || "casual outfit";
  const face = traits?.Face || "expressive face";

  // Character description from traits
  const charDesc = `a GVC NFT character who is ${type} with ${hair}, wearing ${body}, with ${face}`;

  // Style guidance
  const styleGuide = {
    comic: "comic book art style, bold black outlines, halftone dot shading, vivid saturated colors, dynamic action lines, speech bubbles, Marvel/DC comic aesthetic",
    noir: "noir comic book style, high contrast black and white with selective color, deep dramatic shadows, ink wash, film noir atmosphere",
    manga: "manga comic style, clean precise linework, speed lines, dynamic angles, expressive character, Japanese manga aesthetic",
    retro: "retro 1970s comic book style, slightly faded colors, gritty texture, old paper feel, vintage halftone dots, classic comic lettering",
  }[style.id] || "comic book art style";

  // Mood color palette
  const moodPalette = {
    TRIUMPHANT: "golden and warm colors, dramatic lighting from above",
    MYSTERIOUS: "deep purples and blues, misty atmosphere, mysterious shadows",
    CHAOTIC: "explosive reds and oranges, dynamic diagonal composition",
    MELANCHOLIC: "cool blues and grays, somber lighting, rain",
    EUPHORIC: "bright neon colors, energy bursts, vibrant atmosphere",
    DEFIANT: "high contrast, bold composition, dramatic backlighting",
  }[mood] || "vibrant colors";

  return `${styleGuide}, ${moodPalette}. Scene: ${panel.setting}. Action: ${panel.action}. The main character is ${charDesc}. The character is rendered as a chunky cartoon toy figure in the GVC NFT style - rounded head, expressive face, stylized proportions. Comic panel composition, cinematic framing. ${panel.dialogue ? `Speech bubble with text: "${panel.dialogue}"` : "No speech bubble."} ${panel.sfx ? `Sound effect text: "${panel.sfx}"` : ""} High quality comic book illustration. No text except dialogue/sfx specified.`;
}

// ── Generate story via Claude ─────────────────────────────────────────────────
async function generateStory({ character, scene, style, mood, layout, traits }: any) {
  const traitStr = traits
    ? Object.entries(traits).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "Unknown traits";

  const systemPrompt = `You are a master graphic novel writer for the Good Vibes Club universe — a vibrant NFT world set in Vibetown. Generate vivid comic panel descriptions. Always return ONLY valid JSON.`;

  const userPrompt = `Generate a ${layout.panels}-panel graphic novel sequence for this GVC character:

CHARACTER: ${character.name || `GVC #${character.id}`}
TRAITS: ${traitStr}
SCENE: ${scene}
STYLE: ${style.label}
MOOD: ${mood}

Return JSON:
{
  "title": "STORY TITLE IN CAPS",
  "logline": "one gripping sentence",
  "panels": [
    {
      "number": 1,
      "setting": "vivid visual description of environment and lighting (2-3 sentences)",
      "action": "what is happening, camera angle, composition (2-3 sentences)",
      "dialogue": "spoken line max 10 words or null",
      "caption": "narrative caption max 8 words or null",
      "sfx": "sound effect like BOOM or null"
    }
  ],
  "epilogue": "one-line teaser for what comes next"
}`;

  const response = await fetch("/api/generate", {
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
  const text = data.content?.map((b: any) => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Generate image via DALL-E 3 ───────────────────────────────────────────────
async function generatePanelImage(prompt: string): Promise<string> {
  const response = await fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// ── Panel Card ────────────────────────────────────────────────────────────────
function PanelCard({ panel, style, mood, traits, character, isWide }: any) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const moodColors: any = {
    TRIUMPHANT: "#FFE048", MYSTERIOUS: "#6B4FFF", CHAOTIC: "#FF5F1F",
    MELANCHOLIC: "#4F7FFF", EUPHORIC: "#2EFF2E", DEFIANT: "#FF5F1F",
  };
  const accent = moodColors[mood] || "#FFE048";

  useEffect(() => {
    const prompt = buildImagePrompt(panel, character, style, mood, traits);
    generatePanelImage(prompt)
      .then((url) => { setImageUrl(url); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div style={{
      background: "#0d0d0d",
      border: `2px solid ${accent}33`,
      borderRadius: 6,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gridColumn: isWide ? "1 / -1" : undefined,
      position: "relative",
    }}>
      {/* Image panel */}
      <div style={{
        aspectRatio: isWide ? "21/9" : "1/1",
        background: "#050505",
        position: "relative",
        overflow: "hidden",
      }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, border: "2px solid #1F1F1F", borderTop: `2px solid ${accent}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <p style={{ color: "#333", fontSize: 10, letterSpacing: 2, fontFamily: "var(--font-mundial, sans-serif)" }}>GENERATING PANEL {panel.number}···</p>
          </div>
        )}
        {error && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#333", fontSize: 11, fontFamily: "var(--font-mundial, sans-serif)" }}>Panel generation failed</p>
          </div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Panel ${panel.number}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}

        {/* Panel number badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: accent, color: "#050505",
          width: 28, height: 28, borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 14,
        }}>
          {panel.number}
        </div>

        {/* Caption box */}
        {panel.caption && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            background: "rgba(5,5,5,0.85)", padding: "8px 12px",
          }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: accent, fontStyle: "italic", margin: 0 }}>
              {panel.caption}
            </p>
          </div>
        )}

        {/* SFX */}
        {panel.sfx && (
          <div style={{ position: "absolute", top: "30%", left: "10%", transform: "rotate(-8deg)" }}>
            <p style={{
              fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 36,
              color: accent, textShadow: "3px 3px 0 #000, -1px -1px 0 #000",
              WebkitTextStroke: "2px #050505",
            }}>
              {panel.sfx}
            </p>
          </div>
        )}
      </div>

      {/* Director's notes */}
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${accent}22` }}>
        {panel.dialogue && (
          <div style={{
            background: "#fff", borderRadius: 12, padding: "8px 14px",
            marginBottom: 10, position: "relative", display: "inline-block",
            maxWidth: "100%",
          }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#111", margin: 0, fontWeight: 600 }}>
              "{panel.dialogue}"
            </p>
            {/* Speech bubble tail */}
            <div style={{ position: "absolute", bottom: -8, left: 20, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #fff" }} />
          </div>
        )}
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#555", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
          {panel.setting}
        </p>
      </div>
    </div>
  );
}

// ── Main Engine ───────────────────────────────────────────────────────────────
export default function GraphicNovelEngine() {
  const [tokenId, setTokenId] = useState("");
  const [character, setCharacter] = useState<any>(null);
  const [characterImg, setCharacterImg] = useState<string | null>(null);
  const [loadingChar, setLoadingChar] = useState(false);
  const [charError, setCharError] = useState("");

  const [scene, setScene] = useState("");
  const [selectedLayout, setSelectedLayout] = useState(PANEL_LAYOUTS[2]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMood, setSelectedMood] = useState("TRIUMPHANT");

  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [genError, setGenError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

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

  const handleGenerate = async () => {
    if (!character) { setGenError("Load a character first"); return; }
    if (!scene.trim()) { setGenError("Describe a scene"); return; }
    setGenerating(true); setGenError(""); setStory(null);
    try {
      const result = await generateStory({
        character, scene, style: selectedStyle,
        mood: selectedMood, layout: selectedLayout, traits: character.traits,
      });
      setStory(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setGenError("Story generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const moodColors: any = {
    TRIUMPHANT: "#FFE048", MYSTERIOUS: "#6B4FFF", CHAOTIC: "#FF5F1F",
    MELANCHOLIC: "#4F7FFF", EUPHORIC: "#2EFF2E", DEFIANT: "#FF5F1F",
  };

  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-mundial, sans-serif)", paddingBottom: 80 }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #333; }
        input:focus, textarea:focus { outline: none; border-color: #FFE04844 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1F1F1F; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1F1F1F", padding: "32px 40px 28px", background: "#080808" }}>
        <p style={{ color: "#FFE048", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>BERGENFOX · GVC UNIVERSE</p>
        <h1 style={{ fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 40, textTransform: "uppercase", letterSpacing: 1, background: "linear-gradient(135deg, #FFE048 0%, #FF6B9D 50%, #FFE048 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>
          GRAPHIC NOVEL ENGINE
        </h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 8, letterSpacing: 0.5 }}>
          AI-illustrated comic panels — your GVC character, your story, generated by DALL-E 3
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 48, alignItems: "start" }}>

          {/* ── Controls ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Character */}
            <div>
              <StepLabel number="01" label="YOUR CHARACTER" />
              <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
                <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadCharacter()} placeholder="Token ID (0–6968)" min={0} max={6968}
                  style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1F1F1F", borderRight: "none", borderRadius: "8px 0 0 8px", padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "var(--font-mundial, sans-serif)" }} />
                <button onClick={loadCharacter} disabled={loadingChar} style={{ background: "#1F1F1F", border: "1px solid #1F1F1F", borderRadius: "0 8px 8px 0", padding: "11px 16px", color: "#FFE048", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: loadingChar ? "not-allowed" : "pointer" }}>
                  {loadingChar ? "···" : "LOAD →"}
                </button>
              </div>
              {charError && <p style={{ color: "#FF5F1F", fontSize: 12, marginBottom: 8 }}>{charError}</p>}
              {character && (
                <div style={{ background: "#0d0d0d", border: "1px solid #1F1F1F", borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "flex-start", animation: "fadeUp 0.3s ease" }}>
                  {characterImg && <img src={characterImg} alt={character.name} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={(e) => (e.currentTarget.style.display = "none")} />}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#FFE048", marginBottom: 6 }}>{character.name}</p>
                    {character.traits && Object.entries(character.traits).map(([k, v]: any) => (
                      <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#444", letterSpacing: 1, textTransform: "uppercase", minWidth: 60 }}>{k}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scene */}
            <div>
              <StepLabel number="02" label="THE SCENE" />
              <textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="Describe what happens — the conflict, setting, or moment you want to capture." rows={4}
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1F1F1F", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, lineHeight: 1.7, fontFamily: "var(--font-mundial, sans-serif)", resize: "vertical" }} />
            </div>

            {/* Layout */}
            <div>
              <StepLabel number="03" label="PANEL LAYOUT" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PANEL_LAYOUTS.map((l) => (
                  <button key={l.id} onClick={() => setSelectedLayout(l)} style={{ background: selectedLayout.id === l.id ? "#FFE04812" : "#0d0d0d", border: `1px solid ${selectedLayout.id === l.id ? "#FFE04844" : "#1F1F1F"}`, borderRadius: 10, padding: "12px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: selectedLayout.id === l.id ? "#FFE048" : "#888", marginBottom: 2 }}>{l.label}</div>
                    <div style={{ fontSize: 10, color: "#444" }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <StepLabel number="04" label="ART STYLE" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setSelectedStyle(s)} style={{ background: selectedStyle.id === s.id ? "#FFE04812" : "#0d0d0d", border: `1px solid ${selectedStyle.id === s.id ? "#FFE04844" : "#1F1F1F"}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.15s" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: selectedStyle.id === s.id ? "#FFE048" : "#888" }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: "#444" }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <StepLabel number="05" label="MOOD" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setSelectedMood(m)} style={{ background: selectedMood === m ? `${moodColors[m]}18` : "#0d0d0d", border: `1px solid ${selectedMood === m ? `${moodColors[m]}55` : "#1F1F1F"}`, borderRadius: 20, padding: "7px 14px", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: selectedMood === m ? moodColors[m] : "#444", cursor: "pointer", transition: "all 0.15s" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost note */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1F1F1F", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 10, color: "#555", letterSpacing: 0.5 }}>
                ✦ Each panel uses DALL-E 3 (~$0.04/panel). A 4-panel comic costs ~$0.16.
              </p>
            </div>

            {genError && <p style={{ color: "#FF5F1F", fontSize: 12 }}>{genError}</p>}

            <button onClick={handleGenerate} disabled={generating || !character || !scene.trim()}
              style={{ background: generating || !character || !scene.trim() ? "#111" : "#FFE048", border: "none", borderRadius: 12, padding: "16px 0", color: generating || !character || !scene.trim() ? "#333" : "#050505", fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: generating || !character || !scene.trim() ? "not-allowed" : "pointer", width: "100%", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!generating && character && scene.trim()) e.currentTarget.style.boxShadow = "0 0 32px #FFE04844"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
              {generating ? <span style={{ animation: "pulse 1s ease infinite", display: "inline-block" }}>SCRIPTING STORY···</span> : "GENERATE COMIC →"}
            </button>
          </div>

          {/* ── Output ── */}
          <div ref={resultRef}>
            {!story && !generating && (
              <div style={{ background: "#080808", border: "1px dashed #1F1F1F", borderRadius: 16, padding: 60, textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ fontSize: 48, opacity: 0.3 }}>🎨</div>
                <p style={{ color: "#2a2a2a", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>Your illustrated comic will appear here</p>
                <p style={{ color: "#1a1a1a", fontSize: 11 }}>Load a character · Set the scene · Generate</p>
              </div>
            )}

            {generating && (
              <div style={{ background: "#080808", border: "1px solid #1F1F1F", borderRadius: 16, padding: 60, textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <div style={{ width: 48, height: 48, border: "2px solid #1F1F1F", borderTop: "2px solid #FFE048", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#FFE048", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", animation: "pulse 2s ease infinite" }}>SCRIPTING THE STORY···</p>
                <p style={{ color: "#333", fontSize: 11 }}>Claude is writing your panels — images will generate after</p>
              </div>
            )}

            {story && !generating && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                {/* Story header */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "inline-block", background: `${moodColors[selectedMood]}18`, border: `1px solid ${moodColors[selectedMood]}33`, borderRadius: 20, padding: "4px 14px", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: moodColors[selectedMood], marginBottom: 12 }}>
                    {selectedMood} · {selectedStyle.label} · {selectedLayout.label}
                  </div>
                  <h2 style={{ fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 28, textTransform: "uppercase", color: "#fff", letterSpacing: 1, marginBottom: 10 }}>
                    {story.title}
                  </h2>
                  <p style={{ color: "#666", fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>{story.logline}</p>
                  <p style={{ color: "#333", fontSize: 11, marginTop: 8, letterSpacing: 1 }}>
                    ✦ Generating {story.panels?.length} illustrated panels with DALL-E 3 — this may take 30-60 seconds
                  </p>
                </div>

                {/* Panels grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: selectedLayout.panels === 1 ? "1fr" : selectedLayout.panels === 2 ? "1fr 1fr" : "1fr 1fr",
                  gap: 14,
                  marginBottom: 24,
                }}>
                  {story.panels?.map((panel: any, i: number) => (
                    <PanelCard
                      key={i}
                      panel={panel}
                      style={selectedStyle}
                      mood={selectedMood}
                      traits={character?.traits}
                      character={character}
                      isWide={selectedLayout.panels === 1 || (selectedLayout.panels === 3 && i === 0)}
                    />
                  ))}
                </div>

                {/* Epilogue */}
                {story.epilogue && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1F1F1F", borderLeft: "3px solid #FFE048", borderRadius: "0 10px 10px 0", padding: "14px 20px", display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                    <span style={{ color: "#FFE048", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>NEXT TIME</span>
                    <p style={{ color: "#666", fontSize: 13, fontStyle: "italic", margin: 0 }}>{story.epilogue}</p>
                  </div>
                )}

                <button onClick={handleGenerate} style={{ background: "transparent", border: "1px solid #1F1F1F", borderRadius: 10, padding: "12px 24px", color: "#555", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFE04844"; e.currentTarget.style.color = "#FFE048"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1F1F1F"; e.currentTarget.style.color = "#555"; }}>
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

function StepLabel({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 11, color: "#FFE048", opacity: 0.5, letterSpacing: 1 }}>{number}</span>
      <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#555", fontWeight: 700 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#1F1F1F" }} />
    </div>
  );
}
