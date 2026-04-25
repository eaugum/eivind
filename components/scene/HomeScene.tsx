"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useState } from "react";

import { FadedBackgroundText } from "@/components/scene/FadedBackgroundText";
import { DiscoFloor } from "@/components/scene/DiscoFloor";
import { StrobeLights } from "@/components/scene/StrobeLights";
import { WalkingCharacter } from "@/components/scene/WalkingCharacter";
import type { CharacterInputState } from "@/components/scene/characterState";

const FLOOR_Y = -2.2;

export default function HomeScene() {
  const [muted, setMuted] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [mobileInput, setMobileInput] = useState<Partial<CharacterInputState>>({});

  const toggleMobileControl = (key: keyof CharacterInputState) => {
    setMobileInput((prev) => {
      const nextActive = !Boolean(prev[key]);
      const next: Partial<CharacterInputState> = { ...prev, [key]: nextActive };

      // Prevent contradictory movement toggles at the same time.
      if (key === "a" && nextActive) next.d = false;
      if (key === "d" && nextActive) next.a = false;
      // Jump and dance must be mutually exclusive.
      if (key === "space" && nextActive) next.w = false;
      if (key === "w" && nextActive) next.space = false;

      return next;
    });
  };

  const mobileActionClass = (
    active: boolean,
    colorClass: "fuchsia" | "cyan" | "lime" | "amber"
  ) => {
    const colorMap = {
      fuchsia:
        "border-fuchsia-300/40 text-fuchsia-100 shadow-[0_0_24px_rgba(168,85,247,0.35)]",
      cyan: "border-cyan-300/40 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.35)]",
      lime: "border-lime-300/40 text-lime-100 shadow-[0_0_24px_rgba(163,230,53,0.35)]",
      amber:
        "border-amber-300/40 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.35)]",
    };
    const activeClass = active
      ? "bg-slate-700/95 ring-2 ring-white/80 ring-offset-2 ring-offset-slate-950 scale-95 brightness-125 shadow-[0_0_32px_rgba(255,255,255,0.55)]"
      : "bg-slate-950/70";
    return `mobile-control-btn touch-none rounded-lg border px-0 py-2 text-xl font-semibold backdrop-blur-md transition ${colorMap[colorClass]} ${activeClass}`;
  };

  return (
    <div className="fixed inset-0 bg-[url('/byen.png')] bg-cover bg-center h-full w-full opacity-50">
      <FadedBackgroundText />
      <div className="absolute left-4 top-4 z-20 hidden rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 p-4 text-xs text-slate-100 shadow-[0_0_30px_rgba(168,85,247,0.35)] backdrop-blur-md sm:block">
        <p className="mb-2 font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
          Dance Controls
        </p>
        <p>Walk: A / D or Left / Right</p>
        <p>Jump: W or Up</p>
        <p>Dance: Space</p>
        <p>Rotate: S or Down</p>
        <p>Reset: R</p>
      </div>
      <div className="absolute right-4 top-4 z-20 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className="rounded-xl border border-cyan-300/40 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.35)] backdrop-blur-md transition hover:bg-slate-900/80"
        >
          {muted ? "Unmute sound" : "Mute sound"}
        </button>
        <button
          type="button"
          onClick={() => setResetToken((prev) => prev + 1)}
          className="rounded-xl border border-lime-300/40 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-lime-100 shadow-[0_0_24px_rgba(163,230,53,0.35)] backdrop-blur-md transition hover:bg-slate-900/80"
        >
          Reset
        </button>
      </div>
      <div className="absolute left-3 top-3 z-20 sm:hidden">
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          className="mobile-control-btn flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/40 bg-slate-950/70 text-base font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.35)] backdrop-blur-md transition active:bg-slate-800/90"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
      <div className="absolute right-3 top-3 z-20 sm:hidden">
        <button
          type="button"
          onClick={() => setResetToken((prev) => prev + 1)}
          aria-label="Reset position"
          className="mobile-control-btn flex h-9 w-9 items-center justify-center rounded-lg border border-lime-300/40 bg-slate-950/70 text-base font-semibold text-lime-100 shadow-[0_0_24px_rgba(163,230,53,0.35)] backdrop-blur-md transition active:bg-slate-800/90"
        >
          ↺
        </button>
      </div>
      <div className="absolute inset-x-3 bottom-3 z-20 grid grid-cols-5 gap-1.5 sm:hidden">
        <button
          type="button"
          onClick={() => toggleMobileControl("a")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Walk left"
          className={mobileActionClass(Boolean(mobileInput.a), "fuchsia")}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => toggleMobileControl("space")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Dance"
          className={mobileActionClass(Boolean(mobileInput.space), "lime")}
        >
          ♪
        </button>
        <button
          type="button"
          onClick={() => toggleMobileControl("s")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Rotate"
          className={mobileActionClass(Boolean(mobileInput.s), "amber")}
        >
          ↻
        </button>
        <button
          type="button"
          onClick={() => toggleMobileControl("w")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Jump"
          className={mobileActionClass(Boolean(mobileInput.w), "cyan")}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => toggleMobileControl("d")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Walk right"
          className={mobileActionClass(Boolean(mobileInput.d), "fuchsia")}
        >
          →
        </button>
      </div>
      <div className="relative z-1 h-full w-full">
        <Canvas
          shadows
          camera={{
            position: [7, 1.1, 0],
            fov: 50,
            up: [0, 1, 0],
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ camera, scene, gl }) => {
            camera.lookAt(0, 0.5, 0);
            scene.background = null;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="city" background={false} />
            <ambientLight intensity={0.15} />
            <StrobeLights />
            <DiscoFloor y={FLOOR_Y} />
            <WalkingCharacter
              floorY={FLOOR_Y}
              muted={muted}
              resetToken={resetToken}
              mobileInput={mobileInput}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
