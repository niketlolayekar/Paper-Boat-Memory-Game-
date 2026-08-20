import { useState, useEffect, useCallback, useRef, useMemo } from "react"

import aamrasImg      from "@/imports/Screenshot_2026-08-20_235551.png"
import chilliGuavaImg from "@/imports/Screenshot_2026-08-20_235607.png"
import jaljeeeraImg   from "@/imports/Screenshot_2026-08-20_235623.png"
import aamPannaImg    from "@/imports/Screenshot_2026-08-20_235639.png"
import santraImg      from "@/imports/Screenshot_2026-08-20_235655.png"
import coconutWaterImg from "@/imports/Screenshot_2026-08-20_235712.png"
import jamunImg       from "@/imports/Screenshot_2026-08-20_235741.png"
import anarImg        from "@/imports/Screenshot_2026-08-20_235757.png"
import mixedFruitImg  from "@/imports/Screenshot_2026-08-20_235816.png"
import lycheeImg      from "@/imports/Screenshot_2026-08-20_235837.png"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Flavour {
  id: string
  name: string
  img: string | null
  accent: string   // dominant colour for name pill
  bg: string       // card-front background
  emoji: string
}

interface GameCard {
  uid: number
  flavourId: string
  isFlipped: boolean
  isMatched: boolean
  isShaking: boolean
}

type Screen = "start" | "register" | "game" | "win"
type Feedback = "match" | "nomatch" | null

export interface UserInfo {
  name: string
  email: string
  phone: string
}

// ─── Flavour Data ───────────────────────────────────────────────────────────

const FLAVOURS: Flavour[] = [
  { id: "aamras",       name: "Aamras",        img: aamrasImg,       accent: "#C07A00", bg: "#FFFAE8", emoji: "🥭" },
  { id: "chilliguava",  name: "Chilli Guava",  img: chilliGuavaImg,  accent: "#4A8C1C", bg: "#F2FFED", emoji: "🌶️" },
  { id: "jaljeera",     name: "Jaljeera",      img: jaljeeeraImg,    accent: "#8B6914", bg: "#FFFBEF", emoji: "🌿" },
  { id: "aampanna",     name: "Aam Panna",     img: aamPannaImg,     accent: "#3A7D1A", bg: "#F2FFED", emoji: "🍃" },
  { id: "santra",       name: "Santra",        img: santraImg,       accent: "#C94A00", bg: "#FFF5EE", emoji: "🍊" },
  { id: "coconutwater", name: "Coconut Water", img: coconutWaterImg, accent: "#1B5E20", bg: "#EDF7EF", emoji: "🥥" },
  { id: "jamun",        name: "Jamun",         img: jamunImg,        accent: "#6A1B9A", bg: "#F9F0FF", emoji: "🫐" },
  { id: "anar",         name: "Anar",          img: anarImg,         accent: "#880E2F", bg: "#FFF0F3", emoji: "🍎" },
  { id: "mixedfruit",   name: "Mixed Fruit",   img: mixedFruitImg,   accent: "#B71C1C", bg: "#FFF3F3", emoji: "🍓" },
  { id: "lychee",       name: "Lychee",        img: lycheeImg,       accent: "#AD1457", bg: "#FFF0F6", emoji: "🍒" },
]

// ─── Utilities ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createDeck(): GameCard[] {
  const pairs = FLAVOURS.flatMap((f, i) => [
    { uid: i * 2,     flavourId: f.id, isFlipped: false, isMatched: false, isShaking: false },
    { uid: i * 2 + 1, flavourId: f.id, isFlipped: false, isMatched: false, isShaking: false },
  ])
  return shuffle(pairs)
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

function timeBonus(s: number): number {
  if (s < 60)  return 500
  if (s < 120) return 300
  if (s < 180) return 150
  if (s < 300) return 50
  return 0
}

// ─── Boat SVG ───────────────────────────────────────────────────────────────

function BoatIcon({ size = 40, color = "#2B7A42" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none">
      {/* sail */}
      <path d="M28 4 L28 30 L8 30 Z" fill={color} opacity="0.9" />
      {/* hull */}
      <path d="M4 30 Q30 40 56 30 L52 36 Q30 44 8 36 Z" fill={color} />
      {/* star on sail */}
      <path d="M22 14 L23.5 18.5 L28 18.5 L24.5 21 L26 25.5 L22 23 L18 25.5 L19.5 21 L16 18.5 L20.5 18.5 Z"
        fill="white" opacity="0.5" />
    </svg>
  )
}

// ─── Card Back Face ──────────────────────────────────────────────────────────

function CardBackFace() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative flex flex-col"
      style={{ background: "#FFFDF2", border: "2px solid #E8DCC0" }}>

      {/* subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #2B7A42 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }} />

      {/* corner leaves */}
      <span className="absolute top-2 left-2 text-xs opacity-30 select-none">🥭</span>
      <span className="absolute top-2 right-2 text-xs opacity-30 select-none">🌿</span>

      {/* center logo area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10">
        <div className="logo-bounce">
          <BoatIcon size={38} color="#2B7A42" />
        </div>
        <p style={{ fontFamily: "'Fredoka One', cursive", color: "#2B7A42", fontSize: "0.72rem", letterSpacing: "0.02em" }}>
          paper boat
        </p>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.5rem", color: "#8B7350", fontWeight: 600 }}>
          drinks and memories
        </p>
      </div>

      {/* wave stripes at bottom */}
      <div className="relative" style={{ height: "28%" }}>
        <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <path d="M0 10 Q25 0 50 10 Q75 20 100 10 Q125 0 150 10 Q175 20 200 10 L200 50 L0 50 Z"
            fill="#2B7A42" />
          <path d="M0 22 Q25 14 50 22 Q75 30 100 22 Q125 14 150 22 Q175 30 200 22 L200 50 L0 50 Z"
            fill="#F4782A" opacity="0.75" />
          <path d="M0 34 Q25 28 50 34 Q75 40 100 34 Q125 28 150 34 Q175 40 200 34 L200 50 L0 50 Z"
            fill="#2B7A42" opacity="0.55" />
        </svg>
        {/* tiny boat on wave */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-70">
          <svg width="22" height="14" viewBox="0 0 44 28" fill="none">
            <path d="M20 2 L20 18 L4 18 Z" fill="white" opacity="0.9"/>
            <path d="M2 18 Q22 26 42 18 L39 22 Q22 28 5 22 Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Chilli Guava Illustration (no product image uploaded) ──────────────────

function ChilliGuavaIllustration() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #FF8A80 0%, #D32F2F 55%, #B71C1C 100%)" }}>
      {/* wave lines like PB packaging */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 200 32" preserveAspectRatio="none"
        style={{ height: "22%" }}>
        <path d="M0 10 Q25 2 50 10 Q75 18 100 10 Q125 2 150 10 Q175 18 200 10 L200 32 L0 32 Z"
          fill="white" opacity="0.15" />
        <path d="M0 18 Q25 12 50 18 Q75 24 100 18 Q125 12 150 18 Q175 24 200 18 L200 32 L0 32 Z"
          fill="white" opacity="0.1" />
      </svg>
      {/* paper boat logo hint */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2">
        <BoatIcon size={22} color="rgba(255,255,255,0.6)" />
      </div>
      {/* fruit illustration */}
      <div className="flex gap-1 text-2xl sm:text-3xl mt-3 drop-shadow-sm">
        <span>🌶️</span>
        <span>🍐</span>
      </div>
      <p style={{ fontFamily: "'Fredoka One', cursive", color: "rgba(255,255,255,0.85)", fontSize: "0.55rem",
        letterSpacing: "0.08em", marginTop: "4px" }}>
        CHILLI GUAVA
      </p>
    </div>
  )
}

// ─── Card Front Face ─────────────────────────────────────────────────────────

function CardFrontFace({ flavour }: { flavour: Flavour }) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{ background: flavour.bg, border: `2px solid ${flavour.accent}33` }}>
      {/* image area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-1 sm:p-2">
        {flavour.img ? (
          <img
            src={flavour.img}
            alt={flavour.name}
            className="w-full h-full object-contain object-center drop-shadow-md"
            style={{ maxHeight: "100%", maxWidth: "100%" }}
          />
        ) : (
          <ChilliGuavaIllustration />
        )}
      </div>
      {/* name tag */}
      <div className="px-1.5 py-1 text-center"
        style={{ background: `${flavour.accent}18`, borderTop: `1px solid ${flavour.accent}22` }}>
        <p style={{ fontFamily: "'Fredoka One', cursive", color: flavour.accent, fontSize: "0.6rem",
          letterSpacing: "0.03em", lineHeight: 1.2 }}>
          {flavour.name}
        </p>
      </div>
    </div>
  )
}

// ─── Game Card ───────────────────────────────────────────────────────────────

interface GameCardProps {
  card: GameCard
  onClick: (uid: number) => void
  locked: boolean
  justMatched: boolean
}

function GameCardComponent({ card, onClick, locked, justMatched }: GameCardProps) {
  const flavour = FLAVOURS.find(f => f.id === card.flavourId)!
  const flipped = card.isFlipped || card.isMatched

  const innerClass = [
    "card-inner",
    flipped       ? "is-flipped"  : "",
    justMatched   ? "is-matched"  : "",
    card.isShaking ? "is-shaking" : "",
  ].join(" ")

  const clickable = !locked && !card.isFlipped && !card.isMatched

  return (
    <div
      className={`card-container w-full h-full aspect-[3/4] flex-shrink-0 ${
        clickable ? "cursor-pointer hover:scale-[1.03]" : "cursor-default"
      } transition-transform duration-200`}
      onClick={() => clickable && onClick(card.uid)}
      style={{
        filter: card.isMatched ? "drop-shadow(0 4px 12px rgba(43,122,66,0.35))" : "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
      }}
    >
      <div className={innerClass}>
        <div className="card-face card-back-face">
          <CardBackFace />
        </div>
        <div className="card-face card-front-face">
          <CardFrontFace flavour={flavour} />
        </div>
      </div>
    </div>
  )
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

function GameHUD({
  score, moves, seconds, matchedPairs, onRestart,
}: { score: number; moves: number; seconds: number; matchedPairs: number; onRestart: () => void }) {
  return (
    <header className="sticky top-0 z-30 w-full"
      style={{ background: "rgba(255,249,238,0.95)", backdropFilter: "blur(8px)",
        borderBottom: "2px solid #E8D8B0" }}>
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

        {/* brand */}
        <div className="flex items-center gap-2 min-w-0">
          <BoatIcon size={30} color="#2B7A42" />
          <div className="hidden sm:block">
            <p style={{ fontFamily: "'Fredoka One', cursive", color: "#2B7A42", fontSize: "1.1rem", lineHeight: 1 }}>
              paper boat
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.6rem", color: "#F4782A",
              fontWeight: 800, letterSpacing: "0.1em" }}>
              MEMORY MATCH
            </p>
          </div>
        </div>

        {/* stats row */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Stat icon="⭐" label="Score" value={score} color="#C07A00" />
          <Stat icon="🔄" label="Moves" value={moves} color="#2B7A42" />
          <Stat icon="⏱️" label="Time"  value={formatTime(seconds)} color="#C94A00" />
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: "#2B7A4220", color: "#2B7A42" }}>
            <span>{matchedPairs}</span>
            <span className="opacity-50">/</span>
            <span>10</span>
            <span className="ml-1 hidden md:inline">Pairs</span>
          </div>
        </div>

        {/* restart */}
        <button onClick={onRestart}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            hover:scale-105 active:scale-95"
          style={{ background: "#F4782A", color: "white", fontFamily: "'Nunito', sans-serif",
            boxShadow: "0 2px 8px rgba(244,120,42,0.35)" }}>
          <span>↺</span>
          <span className="hidden sm:inline">Restart</span>
        </button>
      </div>

      {/* progress bar */}
      <div className="h-1 w-full bg-[#E8D8B0]">
        <div className="h-1 transition-all duration-500 rounded-r-full"
          style={{ width: `${(matchedPairs / 10) * 100}%`,
            background: "linear-gradient(90deg, #2B7A42, #F4782A)" }} />
      </div>
    </header>
  )
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-[0.6rem] font-bold opacity-50" style={{ color }}>{label}</span>
      <span className="text-sm sm:text-base font-black" style={{ fontFamily: "'Fredoka One', cursive", color }}>
        {icon} {value}
      </span>
    </div>
  )
}

// ─── Match Toast ─────────────────────────────────────────────────────────────

function MatchToast({ type }: { type: Feedback }) {
  if (!type) return null
  const isMatch = type === "match"
  return (
    <div className="toast-anim fixed z-50 pointer-events-none"
      style={{ top: "50%", left: "50%", transform: "translateX(-50%) translateY(-50%)" }}>
      <div className="px-5 py-3 rounded-2xl text-white font-black text-sm sm:text-base text-center shadow-2xl"
        style={{
          fontFamily: "'Fredoka One', cursive",
          background: isMatch
            ? "linear-gradient(135deg, #2B7A42, #4CAF50)"
            : "linear-gradient(135deg, #F4782A, #E53935)",
          boxShadow: `0 8px 32px ${isMatch ? "rgba(43,122,66,0.5)" : "rgba(244,120,42,0.5)"}`,
        }}>
        {isMatch ? "✨ Perfect Match!" : "🔄 Not this time..."}
      </div>
    </div>
  )
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_EMOJIS = ["🥭","🍊","🫐","🌿","⭐","🍒","🥥","🌶️","🍎","🎉","✨","🍃","💛","🧡"]

function Confetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      left:  `${5 + Math.random() * 90}%`,
      dur:   `${2.5 + Math.random() * 2.5}s`,
      del:   `${Math.random() * 1.5}s`,
      spin:  Math.random() > 0.5 ? 540 : -540,
      sz:    `${1 + Math.random() * 0.8}rem`,
    }))
  }, [])

  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece select-none"
          style={{
            left: p.left,
            "--dur": p.dur,
            "--del": p.del,
            "--spin": p.spin,
            "--sz": p.sz,
          } as React.CSSProperties}>
          {p.emoji}
        </span>
      ))}
    </>
  )
}

// ─── Start Screen ─────────────────────────────────────────────────────────────

const START_DECO: Array<{ img: string | null; rot: number; x: string; y: string; dur: string; del: string; scale: number }> = [
  { img: aamrasImg,       rot: -12, x: "8%",  y: "15%", dur: "3.2s", del: "0s",    scale: 0.9 },
  { img: santraImg,       rot:  8,  x: "78%", y: "10%", dur: "3.8s", del: "0.4s",  scale: 0.85 },
  { img: coconutWaterImg, rot: -5,  x: "60%", y: "65%", dur: "4.1s", del: "0.8s",  scale: 0.8 },
  { img: jamunImg,        rot:  14, x: "15%", y: "62%", dur: "3.5s", del: "0.2s",  scale: 0.9 },
  { img: lycheeImg,       rot: -8,  x: "88%", y: "50%", dur: "3.0s", del: "0.6s",  scale: 0.75 },
  { img: anarImg,         rot:  6,  x: "3%",  y: "42%", dur: "4.3s", del: "1.0s",  scale: 0.7 },
]

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(160deg, #FFF9EE 0%, #FFF0D0 50%, #FFE8B8 100%)" }}>

      {/* background texture dots */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #2B7A42 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }} />

      {/* floating product pouches */}
      {START_DECO.map((d, i) => (
        <div key={i}
          className="absolute float-bob pointer-events-none"
          style={{
            left: d.x, top: d.y,
            transform: `rotate(${d.rot}deg) scale(${d.scale})`,
            "--rot": `${d.rot}deg`,
            "--dur": d.dur,
            "--del": d.del,
            width: "90px",
            opacity: 0.55,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
          } as React.CSSProperties}>
          {d.img && <img src={d.img} alt="" className="w-full object-contain" />}
        </div>
      ))}

      {/* hero content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-lg">

        {/* logo */}
        <div className="slide-up" style={{ "--del": "0s" } as React.CSSProperties}>
          <div className="flex items-center justify-center gap-3 mb-1">
            <BoatIcon size={52} color="#2B7A42" />
          </div>
          <p style={{ fontFamily: "'Fredoka One', cursive", color: "#2B7A42", fontSize: "1.8rem",
            lineHeight: 1, letterSpacing: "0.01em" }}>
            paper boat
          </p>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.65rem", color: "#F4782A",
            fontWeight: 900, letterSpacing: "0.25em" }}>
            DRINKS AND MEMORIES
          </p>
        </div>

        {/* title */}
        <div className="slide-up" style={{ "--del": "0.1s" } as React.CSSProperties}>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "clamp(2.5rem, 8vw, 4rem)",
            color: "#1A4D2A", lineHeight: 1, letterSpacing: "0.02em" }}>
            MEMORY
          </h1>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "clamp(2.5rem, 8vw, 4rem)",
            color: "#F4782A", lineHeight: 1, letterSpacing: "0.02em" }}>
            MATCH
          </h1>
        </div>

        {/* subtitle */}
        <p className="slide-up" style={{ "--del": "0.2s", fontFamily: "'Nunito', sans-serif",
          color: "#6B5230", fontSize: "1rem", fontWeight: 600 } as React.CSSProperties}>
          Find the flavours. Make memories.
        </p>

        {/* flavour pills preview */}
        <div className="slide-up flex flex-wrap justify-center gap-1.5 max-w-xs"
          style={{ "--del": "0.3s" } as React.CSSProperties}>
          {FLAVOURS.map(f => (
            <span key={f.id} className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: `${f.accent}18`, color: f.accent, fontFamily: "'Nunito', sans-serif",
                border: `1px solid ${f.accent}30` }}>
              {f.emoji} {f.name}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="slide-up mt-2" style={{ "--del": "0.4s" } as React.CSSProperties}>
          <button onClick={onStart}
            className="px-10 py-3.5 rounded-full font-black text-white text-lg transition-all
              hover:scale-105 hover:shadow-2xl active:scale-95"
            style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.2rem",
              background: "linear-gradient(135deg, #2B7A42 0%, #F4782A 100%)",
              boxShadow: "0 6px 24px rgba(244,120,42,0.45)",
              letterSpacing: "0.05em" }}>
            🎮 Start Game
          </button>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.75rem", color: "#9B7A40",
            marginTop: "8px", fontWeight: 600 }}>
            Match all 10 flavours — 20 cards total
          </p>
        </div>
      </div>

      {/* bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: "60px", width: "100%" }}>
          <path d="M0 40 Q180 20 360 40 Q540 60 720 40 Q900 20 1080 40 Q1260 60 1440 40 L1440 80 L0 80 Z"
            fill="#2B7A42" opacity="0.15" />
          <path d="M0 55 Q180 38 360 55 Q540 72 720 55 Q900 38 1080 55 Q1260 72 1440 55 L1440 80 L0 80 Z"
            fill="#F4782A" opacity="0.10" />
        </svg>
      </div>
    </div>
  )
}

// ─── Win Screen ───────────────────────────────────────────────────────────────

function WinScreen({
  score, moves, seconds, onPlayAgain,
}: { score: number; moves: number; seconds: number; onPlayAgain: () => void }) {
  const bonus = timeBonus(seconds)
  const finalScore = score + bonus

  const getReward = (s: number) => {
    if (s >= 1300) return { name: "Electric Bike", icon: "🏍️", color: "#6A1B9A" }
    if (s >= 1100) return { name: "Gaming Laptop", icon: "💻", color: "#1B5E20" }
    if (s >= 900) return { name: "Smartphone", icon: "📱", color: "#C94A00" }
    if (s >= 600) return { name: "Tablet", icon: "📟", color: "#2B7A42" }
    return null
  }
  const reward = getReward(finalScore)

  const shareScore = (platform: 'facebook' | 'instagram') => {
    const text = `I just scored ${finalScore} points in the Paper Boat Memory Match Game!${reward ? ` I won a ${reward.name}! 🎉` : ''}`
    
    // In a real app, this would use specific SDKs or deep links.
    // For now, we simulate using the Web Share API if available, or fallback to an alert.
    if (navigator.share) {
      navigator.share({
        title: 'Paper Boat Memory Match',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Simulating ${platform} share:\\n\\n${text}\\n\\n[Image attached]`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FFF9EE 0%, #FFE8B8 100%)" }}>
      <Confetti />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 max-w-md w-full max-h-screen overflow-y-auto py-8">

        {/* trophy */}
        <div className="text-6xl sm:text-7xl animate-bounce select-none">🏆</div>

        {/* headline */}
        <div>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", color: "#1A4D2A",
            fontSize: "clamp(2rem, 7vw, 3rem)", lineHeight: 1 }}>
            All Flavours Matched!
          </h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5230", fontWeight: 700,
            fontSize: "1rem", marginTop: "6px" }}>
            You found every Paper Boat flavour! 🎉
          </p>
        </div>

        {/* Reward Section */}
        {reward && (
          <div className="w-full rounded-3xl px-6 py-4 flex flex-col items-center gap-2 transform scale-105"
            style={{ 
              background: `linear-gradient(135deg, ${reward.color}15 0%, ${reward.color}30 100%)`, 
              border: `2px solid ${reward.color}50`,
              boxShadow: `0 8px 32px ${reward.color}25`
            }}>
            <span className="text-4xl">{reward.icon}</span>
            <p style={{ fontFamily: "'Fredoka One', cursive", color: reward.color, fontSize: "1.4rem" }}>
              You Won a {reward.name}!
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5230", fontSize: "0.8rem", fontWeight: 700 }}>
              Claim your reward with the registered email!
            </p>
          </div>
        )}

        {/* stats card */}
        <div className="w-full rounded-3xl px-6 py-5 flex flex-col gap-3"
          style={{ background: "white", boxShadow: "0 8px 40px rgba(43,122,66,0.15)",
            border: "2px solid #E8D8B0" }}>

          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "#F0E8D0" }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#6B5230" }}>Base Score</span>
            <span style={{ fontFamily: "'Fredoka One', cursive", color: "#2B7A42", fontSize: "1.1rem" }}>
              ⭐ {score}
            </span>
          </div>
          {bonus > 0 && (
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "#F0E8D0" }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#6B5230" }}>⚡ Speed Bonus</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", color: "#F4782A", fontSize: "1.1rem" }}>
                +{bonus}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "#F0E8D0" }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#6B5230" }}>🔄 Total Moves</span>
            <span style={{ fontFamily: "'Fredoka One', cursive", color: "#2B7A42", fontSize: "1.1rem" }}>
              {moves}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "#F0E8D0" }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#6B5230" }}>⏱️ Time</span>
            <span style={{ fontFamily: "'Fredoka One', cursive", color: "#C94A00", fontSize: "1.1rem" }}>
              {formatTime(seconds)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span style={{ fontFamily: "'Fredoka One', cursive", color: "#1A4D2A", fontSize: "1.1rem" }}>
              🏅 Final Score
            </span>
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.6rem",
              background: "linear-gradient(135deg, #2B7A42, #F4782A)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {finalScore}
            </span>
          </div>
        </div>

        {/* Social Share */}
        <div className="w-full flex gap-3 mt-1">
          <button onClick={() => shareScore('facebook')}
            className="flex-1 py-3 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{ background: "#1877F2", boxShadow: "0 4px 15px rgba(24,119,242,0.3)", fontFamily: "'Nunito', sans-serif" }}>
            📘 Share on Facebook
          </button>
          <button onClick={() => shareScore('instagram')}
            className="flex-1 py-3 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", boxShadow: "0 4px 15px rgba(220,39,67,0.3)", fontFamily: "'Nunito', sans-serif" }}>
            📸 Share on Instagram
          </button>
        </div>

        {/* play again */}
        <button onClick={onPlayAgain}
          className="px-10 py-3.5 rounded-full font-black text-white transition-all
            hover:scale-105 hover:shadow-2xl active:scale-95 mt-2"
          style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1.2rem",
            background: "linear-gradient(135deg, #2B7A42 0%, #F4782A 100%)",
            boxShadow: "0 6px 24px rgba(244,120,42,0.4)", letterSpacing: "0.05em" }}>
          🎮 Play Again
        </button>
      </div>
    </div>
  )
}

// ─── Registration Screen ──────────────────────────────────────────────────────

function RegistrationScreen({ onRegister }: { onRegister: (info: UserInfo) => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim() && phone.trim()) {
      onRegister({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #FFF9EE 0%, #FFF0D0 50%, #FFE8B8 100%)" }}>
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle, #2B7A42 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full"
        style={{ border: "2px solid #E8D8B0" }}>
        
        <div className="text-center mb-6">
          <BoatIcon size={48} color="#2B7A42" />
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: "#1A4D2A", fontSize: "2rem", marginTop: "10px" }}>
            Join the Fun!
          </h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5230", fontWeight: 600 }}>
            Enter your details to start matching and win exciting rewards!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#2B7A42", fontSize: "0.9rem" }}>Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
              style={{ background: "#FFF9EE", border: "1px solid #E8D8B0", fontFamily: "'Nunito', sans-serif", color: "#1A4D2A" }}
              placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#2B7A42", fontSize: "0.9rem" }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
              style={{ background: "#FFF9EE", border: "1px solid #E8D8B0", fontFamily: "'Nunito', sans-serif", color: "#1A4D2A" }}
              placeholder="e.g. rahul@example.com" />
          </div>
          <div>
            <label style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#2B7A42", fontSize: "0.9rem" }}>Phone Number</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
              style={{ background: "#FFF9EE", border: "1px solid #E8D8B0", fontFamily: "'Nunito', sans-serif", color: "#1A4D2A" }}
              placeholder="e.g. 9876543210" />
          </div>
          
          <button type="submit"
            className="w-full mt-4 py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
            style={{ fontFamily: "'Fredoka One', cursive", background: "linear-gradient(135deg, #2B7A42 0%, #F4782A 100%)" }}>
            Let's Play! 🚀
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,       setScreen]       = useState<Screen>("start")
  const [userInfo,     setUserInfo]     = useState<UserInfo | null>(null)
  const [cards,        setCards]        = useState<GameCard[]>([])
  const [isChecking,   setIsChecking]   = useState(false)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves,        setMoves]        = useState(0)
  const [score,        setScore]        = useState(0)
  const [seconds,      setSeconds]      = useState(0)
  const [feedback,     setFeedback]     = useState<Feedback>(null)
  const [justMatchedUids, setJustMatchedUids] = useState<number[]>([])
  const [finalSeconds, setFinalSeconds] = useState(0)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const matchRef    = useRef(matchedPairs)
  matchRef.current  = matchedPairs

  // timer
  useEffect(() => {
    if (screen === "game") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [screen])

  const startRegistration = useCallback(() => {
    setScreen("register")
  }, [])

  const startGame = useCallback((info?: UserInfo) => {
    if (info) setUserInfo(info)
    if (timerRef.current)    clearInterval(timerRef.current)
    if (feedbackRef.current) clearTimeout(feedbackRef.current)
    setCards(createDeck())
    setIsChecking(false)
    setMatchedPairs(0)
    setMoves(0)
    setScore(0)
    setSeconds(0)
    setFeedback(null)
    setJustMatchedUids([])
    setScreen("game")
  }, [])

  const handleCardClick = useCallback((uid: number) => {
    if (isChecking) return

    setCards(prev => {
      const card = prev.find(c => c.uid === uid)
      if (!card || card.isFlipped || card.isMatched) return prev

      const updated = prev.map(c => c.uid === uid ? { ...c, isFlipped: true } : c)
      const openCards = updated.filter(c => c.isFlipped && !c.isMatched)

      if (openCards.length === 2) {
        const [c1, c2] = openCards
        setIsChecking(true)
        setMoves(m => m + 1)

        if (c1.flavourId === c2.flavourId) {
          // MATCH
          const matched = updated.map(c =>
            c.uid === c1.uid || c.uid === c2.uid ? { ...c, isMatched: true } : c
          )
          setScore(s => s + 100)
          setJustMatchedUids([c1.uid, c2.uid])
          setFeedback("match")
          const newCount = matchRef.current + 1
          setMatchedPairs(newCount)
          feedbackRef.current = setTimeout(() => {
            setFeedback(null)
            setJustMatchedUids([])
            setIsChecking(false)
            if (newCount === 10) {
              setFinalSeconds(prev => prev) // will use current via closure workaround below
              clearInterval(timerRef.current!)
              setScreen("win")
            }
          }, 900)
          return matched
        } else {
          // NO MATCH — mark shaking
          const shaking = updated.map(c =>
            c.uid === c1.uid || c.uid === c2.uid ? { ...c, isShaking: true } : c
          )
          setFeedback("nomatch")
          feedbackRef.current = setTimeout(() => {
            setCards(p => p.map(c =>
              (c.uid === c1.uid || c.uid === c2.uid)
                ? { ...c, isFlipped: false, isShaking: false }
                : c
            ))
            setScore(s => Math.max(0, s - 10))
            setFeedback(null)
            setIsChecking(false)
          }, 950)
          return shaking
        }
      }

      return updated
    })
  }, [isChecking])

  // capture final time before transitioning to win
  useEffect(() => {
    if (screen === "win") setFinalSeconds(seconds)
  }, [screen]) // eslint-disable-line

  if (screen === "start") return <StartScreen onStart={startRegistration} />

  if (screen === "register") return <RegistrationScreen onRegister={startGame} />

  if (screen === "win") {
    return (
      <WinScreen
        score={score}
        moves={moves}
        seconds={finalSeconds || seconds}
        onPlayAgain={startGame}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF9EE" }}>
      <GameHUD
        score={score}
        moves={moves}
        seconds={seconds}
        matchedPairs={matchedPairs}
        onRestart={startGame}
      />

      {/* board */}
      <main className="flex-1 flex flex-col items-center py-6 px-3 sm:px-6">

        {/* subtitle */}
        <p className="mb-4 text-center"
          style={{ fontFamily: "'Nunito', sans-serif", color: "#9B7A40", fontSize: "0.8rem", fontWeight: 600 }}>
          {matchedPairs === 0
            ? "Flip two cards to find a matching pair! 🍹"
            : matchedPairs < 10
            ? `${10 - matchedPairs} pair${10 - matchedPairs === 1 ? "" : "s"} left — keep going! 🥭`
            : "Almost done!"}
        </p>

        {/* cards grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 max-w-5xl w-full">
          {cards.map(card => (
            <GameCardComponent
              key={card.uid}
              card={card}
              onClick={handleCardClick}
              locked={isChecking}
              justMatched={justMatchedUids.includes(card.uid)}
            />
          ))}
        </div>

        {/* pair dots progress */}
        <div className="mt-6 flex items-center gap-2 flex-wrap justify-center">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="transition-all duration-500"
              style={{
                width: i < matchedPairs ? "24px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: i < matchedPairs
                  ? "linear-gradient(90deg, #2B7A42, #4CAF50)"
                  : "#E8D8B0",
              }} />
          ))}
        </div>
        <p className="mt-1.5" style={{ fontFamily: "'Nunito', sans-serif",
          fontSize: "0.7rem", color: "#9B7A40", fontWeight: 700 }}>
          {matchedPairs} / 10 pairs found
        </p>
      </main>

      {/* match feedback toast */}
      <MatchToast type={feedback} />
    </div>
  )
}
