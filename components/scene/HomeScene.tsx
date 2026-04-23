"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useState } from "react";

import { FadedBackgroundText } from "@/components/scene/FadedBackgroundText";
import { DiscoFloor } from "@/components/scene/DiscoFloor";
import { StrobeLights } from "@/components/scene/StrobeLights";
import { WalkingCharacter } from "@/components/scene/WalkingCharacter";

const FLOOR_Y = -2.2;

export default function HomeScene() {
  const [muted, setMuted] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  return (
    <div className="fixed inset-0 bg-[url('/byen.png')] bg-cover bg-center h-full w-full opacity-50">
      <FadedBackgroundText />
      <div className="absolute left-4 top-4 z-20 rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 p-4 text-xs text-slate-100 shadow-[0_0_30px_rgba(168,85,247,0.35)] backdrop-blur-md">
        <p className="mb-2 font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
          Dance Controls
        </p>
        <p>Walk: A / D or Left / Right</p>
        <p>Jump: W or Up</p>
        <p>Dance: Space</p>
        <p>Rotate: S or Down</p>
        <p>Reset: R</p>
      </div>
      <div className="absolute right-4 top-4 z-20 flex gap-2">
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
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
