"use client";
import { useState, useEffect, useRef } from "react";

// ── Ember Particle Component ──────────────────────────────────────────────────
function Ember({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "#FFE048",
        opacity: 0,
        animation: "floatEmber 6s ease-in infinite",
        ...style,
      }}
    />
  );
}

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "#2EFF2E",
    error: "#FF5F1F",
    info: "#FFE048",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#121212",
        border: `1px solid ${colors[type] || "#FFE048"}`,
        color: colors[type] || "#FFE048",
        padding: "12px 24px",
        borderRadius: 12,
        fontFamily: "var(--font-mundial, sans-serif)",
        fontSize: 14,
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: `0 0 20px ${colors[type]}44`,
        animation: "fadeSlideUp 0.3s ease",
        whiteSpace: "nowrap",
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: 12,
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          opacity: 0.6,
          fontSize: 16,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("https://api-hazel-pi-72.vercel.app/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const items = stats
    ? [
        { label: "FLOOR", value: `${Number(stats.floorPrice).toFixed(3)} ETH` },
        { label: "FLOOR USD", value: `$${Number(stats.floorPriceUsd).toFixed(0)}` },
        { label: "OWNERS", value: stats.numOwners?.toLocaleString() },
        { label: "VOLUME 24H", value: `${Number(stats.volume24h).toFixed(2)} ETH` },
        { label: "TOTAL SALES", value: stats.totalSales?.toLocaleString() },
        { label: "AVG PRICE", value: `${Number(stats.avgPrice).toFixed(3)} ETH` },
      ]
    : Array(6).fill({ label: "···", value: "···" });

  return (
    <div
      style={{
        background: "#0a0a0a",
        borderBottom: "1px solid #1F1F1F",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          animation: "ticker 24s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-mundial, monospace)",
                fontSize: 11,
                color: "#555",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mundial, monospace)",
                fontSize: 12,
                color: "#FFE048",
                fontWeight: 700,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ onMute, muted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 33,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1F1F1F" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/gvc-logotype.svg"
          alt="GVC"
          style={{ height: 28 }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-brice, serif)",
            fontWeight: 900,
            fontSize: 20,
            color: "#FFE048",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          GVC ANIMATION
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMute}
          style={{
            background: "none",
            border: "1px solid #1F1F1F",
            borderRadius: 8,
            padding: "6px 10px",
            color: muted ? "#555" : "#FFE048",
            cursor: "pointer",
            fontSize: 16,
          }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>


      </div>
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  const embers = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${4 + Math.random() * 4}s`,
  }));

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #FFE04808 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Embers */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {embers.map((e, i) => (
          <Ember key={i} style={{ left: e.left, bottom: "-8px", animationDelay: e.animationDelay, animationDuration: e.animationDuration }} />
        ))}
      </div>

      {/* Shaka icon */}
      <img
        src="/shaka.png"
        alt="shaka"
        style={{
          width: 48,
          height: 48,
          marginBottom: 24,
          animation: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.target.style.animation = "wiggle 0.4s ease")}
        onMouseLeave={(e) => (e.target.style.animation = "none")}
        onError={(e) => (e.target.style.display = "none")}
      />

      <p
        style={{
          fontFamily: "var(--font-mundial, sans-serif)",
          fontSize: 12,
          letterSpacing: 5,
          color: "#FFE048",
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: 0.7,
        }}
      >
        GOOD VIBES CLUB · LORE UNIVERSE
      </p>

      <h1
        style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: "clamp(52px, 8vw, 96px)",
          lineHeight: 1.0,
          margin: "0 0 16px",
          textTransform: "uppercase",
          background: "linear-gradient(135deg, #FFE048 0%, #FF6B9D 40%, #FFE048 80%, #FF5F1F 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
          letterSpacing: "-1px",
        }}
      >
        GVC ANIMATION
      </h1>

      <h2
        style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: "clamp(18px, 3vw, 32px)",
          color: "#fff",
          textTransform: "uppercase",
          margin: "0 0 28px",
          letterSpacing: 4,
        }}
      >
        BUILD THE LORE · ANIMATE THE LEGEND
      </h2>

      <p
        style={{
          fontFamily: "var(--font-mundial, sans-serif)",
          fontSize: 16,
          color: "#888",
          maxWidth: 560,
          lineHeight: 1.8,
          margin: "0 0 40px",
        }}
      >
        A collaborative story universe powered by GVC characters. Craft graphic novel panels,
        spawn 3D animation shorts, and expand the mythology of Vibetown — one scene at a time.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href="#features"
          style={{
            display: "inline-block",
            background: "#FFE048",
            border: "none",
            borderRadius: 12,
            padding: "15px 36px",
            color: "#050505",
            fontFamily: "var(--font-mundial, sans-serif)",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 0 32px #FFE04866";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "none";
            e.target.style.transform = "scale(1)";
          }}
        >
          EXPLORE
        </a>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#333",
          fontSize: 12,
          letterSpacing: 2,
          animation: "bounce 2s ease infinite",
        }}
      >
        ↓
      </div>
    </section>
  );
}

// ── About Section ─────────────────────────────────────────────────────────────
function About() {
  return (
    <section
      style={{
        padding: "120px 24px",
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}
    >
      <div>
        <p style={{ color: "#FFE048", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
          ABOUT THE PROJECT
        </p>
        <h2
          style={{
            fontFamily: "var(--font-brice, serif)",
            fontWeight: 900,
            fontSize: "clamp(36px, 4vw, 52px)",
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            margin: "0 0 24px",
          }}
        >
          WHERE VIBES BECOME LEGEND
        </h2>
        <p style={{ color: "#777", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 15, lineHeight: 1.9, marginBottom: 16 }}>
          GVC Animation is the official lore engine for the Good Vibes Club universe. 6,969 Citizens
          of Vibetown, each with their own traits, history, and untold stories — now given voice
          through graphic novel panels and animated short films.
        </p>
        <p style={{ color: "#555", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 15, lineHeight: 1.9 }}>
          Holders animate their characters. The community votes on canon. The universe expands
          with every story told.
        </p>
      </div>

      <div
        style={{
          background: "#121212",
          border: "1px solid #1F1F1F",
          borderRadius: 20,
          padding: 40,
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 40px #FFE04822")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 180,
            height: 180,
            background: "radial-gradient(circle, #FFE04810 0%, transparent 70%)",
          }}
        />
        {[
          { num: "6,969", label: "CITIZENS OF VIBETOWN" },
          { num: "3", label: "ANIMATION STYLES" },
          { num: "∞", label: "STORIES TO TELL" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "20px 0",
              borderBottom: i < 2 ? "1px solid #1F1F1F" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-brice, serif)",
                fontWeight: 900,
                fontSize: 40,
                color: "#FFE048",
                textTransform: "uppercase",
              }}
            >
              {item.num}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mundial, sans-serif)",
                fontSize: 11,
                letterSpacing: 3,
                color: "#555",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features Grid ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: "🎨",
    title: "GRAPHIC NOVEL ENGINE",
    desc: "Bring your GVC character to life in full comic-panel format. Choose art styles, set scenes, and generate panels with cinematic framing and GVC-authentic aesthetics.",
    accent: "#FF6B9D",
    href: "/graphic-novel",
    live: true,
  },
  {
    icon: "🎬",
    title: "3D SHORT FILMS",
    desc: "Transform your lore into animated short stories. Place your GVC character in a live Vibetown environment with full camera and animation control. Coming soon.",
    accent: "#FFE048",
    href: null,
    live: false,
  },
  {
    icon: "📖",
    title: "LORE ARCHIVE",
    desc: "Every story submitted becomes part of the living GVC canon archive. Community voting determines what's official lore — your story could shape the universe.",
    accent: "#FF5F1F",
    href: null,
    live: false,
  },
  {
    icon: "🔮",
    title: "TRAIT FUSION",
    desc: "Combine traits from across the 6,969-token collection. Robot body + Laser Eyes + Mohawk Gold — the system understands your NFT and animates it faithfully.",
    accent: "#FF6B9D",
    href: null,
    live: false,
  },
  {
    icon: "🏆",
    title: "VIBESTR REWARDS",
    desc: "Top stories earn VIBESTR token rewards. The more the community engages with your lore, the more you earn. Quality storytelling pays in Vibetown.",
    accent: "#2EFF2E",
    href: null,
    live: false,
  },
  {
    icon: "🌐",
    title: "COLLAB UNIVERSE",
    desc: "Cross-over stories, alliance arcs, villain narratives — collaborate with other holders to build multi-character storylines that span the whole GVC world.",
    accent: "#FFE048",
    href: null,
    live: false,
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px", background: "#080808" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "#FFE048", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
            PLATFORM FEATURES
          </p>
          <h2
            style={{
              fontFamily: "var(--font-brice, serif)",
              fontWeight: 900,
              fontSize: "clamp(32px, 4vw, 52px)",
              color: "#fff",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            EVERYTHING YOUR STORY NEEDS
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {features.map((f, i) => {
            const Tag = f.href ? "a" : "div";
            return (
              <Tag
                key={i}
                href={f.href || undefined}
                style={{
                  background: "#121212",
                  border: `1px solid ${f.live ? f.accent + "33" : "#1F1F1F"}`,
                  borderRadius: 16,
                  padding: 32,
                  cursor: f.href ? "pointer" : "default",
                  transition: "all 0.25s",
                  position: "relative",
                  overflow: "hidden",
                  textDecoration: "none",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 32px ${f.accent}22`;
                  e.currentTarget.style.borderColor = `${f.accent}55`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = f.live ? f.accent + "33" : "#1F1F1F";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Live / Coming Soon badge */}
                <div style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: f.live ? `${f.accent}18` : "#1F1F1F",
                  border: `1px solid ${f.live ? f.accent + "44" : "#2a2a2a"}`,
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: f.live ? f.accent : "#333",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mundial, sans-serif)",
                }}>
                  {f.live ? "● LIVE" : "SOON"}
                </div>

                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-brice, serif)",
                    fontWeight: 900,
                    fontSize: 16,
                    color: f.accent,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: "0 0 12px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-mundial, sans-serif)",
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.8,
                    margin: "0 0 20px",
                  }}
                >
                  {f.desc}
                </p>

                {f.href && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: f.accent,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mundial, sans-serif)",
                  }}>
                    OPEN ENGINE →
                  </div>
                )}
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Recent Sales ──────────────────────────────────────────────────────────────
function RecentSales() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("https://api-hazel-pi-72.vercel.app/api/sales?limit=5")
      .then((r) => r.json())
      .then(setSales)
      .catch(() => {});
  }, []);

  if (!sales.length) return null;

  return (
    <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <p style={{ color: "#FFE048", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>
        LIVE MARKET
      </p>
      <h2
        style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: 32,
          color: "#fff",
          textTransform: "uppercase",
          margin: "0 0 32px",
        }}
      >
        RECENT SALES
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sales.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#121212",
              border: "1px solid #1F1F1F",
              borderRadius: 12,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FFE04833")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1F1F1F")}
          >
            {s.imageUrl && (
              <img
                src={s.imageUrl}
                alt="GVC"
                style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mundial, sans-serif)", fontSize: 13, color: "#555", letterSpacing: 1 }}>
                {new Date(s.timestamp * 1000).toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-brice, serif)", fontWeight: 900, fontSize: 18, color: "#FFE048" }}>
                {Number(s.priceEth).toFixed(3)} ETH
              </div>
              <div style={{ fontFamily: "var(--font-mundial, sans-serif)", fontSize: 12, color: "#555" }}>
                ${Number(s.priceUsd).toFixed(0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section
      style={{
        padding: "140px 24px",
        textAlign: "center",
        background: "#080808",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800,
          height: 400,
          background: "radial-gradient(ellipse, #FFE04806 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <p style={{ color: "#FFE048", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>
        JOIN THE UNIVERSE
      </p>

      <h2
        style={{
          fontFamily: "var(--font-brice, serif)",
          fontWeight: 900,
          fontSize: "clamp(36px, 5vw, 64px)",
          textTransform: "uppercase",
          margin: "0 0 20px",
          background: "linear-gradient(135deg, #FFE048, #FF6B9D)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        YOUR STORY IS WAITING
      </h2>

      <p
        style={{
          fontFamily: "var(--font-mundial, sans-serif)",
          fontSize: 16,
          color: "#666",
          maxWidth: 480,
          margin: "0 auto 48px",
          lineHeight: 1.8,
        }}
      >
        Connect your wallet, mint your character, and begin building the lore that defines Vibetown.
      </p>


      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {submitted ? (
          <p style={{ color: "#2EFF2E", fontFamily: "var(--font-mundial, sans-serif)", fontSize: 14, letterSpacing: 1 }}>
            ✓ YOU'RE ON THE LIST — VIBETOWN AWAITS
          </p>
        ) : (
          <div style={{ display: "flex", gap: 0 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="your@email.com"
              style={{
                flex: 1,
                background: "#121212",
                border: "1px solid #1F1F1F",
                borderRight: "none",
                borderRadius: "10px 0 0 10px",
                padding: "12px 16px",
                color: "#fff",
                fontFamily: "var(--font-mundial, sans-serif)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                background: "#1F1F1F",
                border: "1px solid #1F1F1F",
                borderRadius: "0 10px 10px 0",
                padding: "12px 20px",
                color: "#FFE048",
                fontFamily: "var(--font-mundial, sans-serif)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#2a2a2a")}
              onMouseLeave={(e) => (e.target.style.background = "#1F1F1F")}
            >
              NOTIFY ME
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const socials = [
    { label: "X / TWITTER", href: "https://twitter.com/goodvibesclub" },
    { label: "OPENSEA", href: "https://opensea.io/collection/goodvibesclub" },
    { label: "DISCORD", href: "https://discord.gg/goodvibesclub" },
    { label: "GOODVIBESCLUB.AI", href: "https://goodvibesclub.ai" },
  ];

  return (
    <footer
      style={{
        background: "#050505",
        borderTop: "1px solid #1F1F1F",
        padding: "60px 24px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 40,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-brice, serif)",
              fontWeight: 900,
              fontSize: 24,
              color: "#FFE048",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            GVC ANIMATION
          </div>
          <p
            style={{
              fontFamily: "var(--font-mundial, sans-serif)",
              fontSize: 13,
              color: "#444",
              lineHeight: 1.7,
              maxWidth: 280,
            }}
          >
            The official lore &amp; animation platform of the Good Vibes Club universe.
            Build stories. Animate legends. Expand Vibetown.
          </p>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-mundial, sans-serif)",
              fontSize: 11,
              letterSpacing: 3,
              color: "#333",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            LINKS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-mundial, sans-serif)",
                  fontSize: 13,
                  color: "#555",
                  textDecoration: "none",
                  letterSpacing: 1,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#FFE048")}
                onMouseLeave={(e) => (e.target.style.color = "#555")}
              >
                {s.label} →
              </a>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-mundial, sans-serif)",
              fontSize: 11,
              letterSpacing: 3,
              color: "#333",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            CONTRACTS
          </p>
          {[
            { label: "GVC NFT", addr: "0xB8Ea...33c4" },
            { label: "VIBESTR", addr: "0xd0cC...7196" },
          ].map((c, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-mundial, sans-serif)", fontSize: 11, color: "#333", textTransform: "uppercase", letterSpacing: 1 }}>
                {c.label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#FFE04866" }}>
                {c.addr}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto 0",
          borderTop: "1px solid #111",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <p style={{ fontFamily: "var(--font-mundial, sans-serif)", fontSize: 12, color: "#2a2a2a", margin: 0 }}>
          © 2024 GOOD VIBES CLUB · ALL RIGHTS RESERVED
        </p>
        <p style={{ fontFamily: "var(--font-mundial, sans-serif)", fontSize: 12, color: "#2a2a2a", margin: 0 }}>
          NOT FINANCIAL ADVICE · DYOR · WAGMI
        </p>
      </div>
    </footer>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [toast, setToast] = useState(null);
  const [muted, setMuted] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  return (
    <div
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "var(--font-mundial, sans-serif)",
      }}
    >
      <Nav onMute={() => setMuted(!muted)} muted={muted} />
      <Hero />
      <About />
      <Features />
      <RecentSales />
      <CTA />
      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
