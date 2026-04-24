"use client";

import localFont from "next/font/local";
import { useEffect, useState } from "react";

const respira = localFont({
  src: [
    {
      path: "../../public/Respira-Black.woff2",
      weight: "900",
      style: "normal",
    },
    { path: "../../public/Respira-Black.woff", weight: "900", style: "normal" },
  ],
  variable: "--font-respira",
});

const WORDS = ["Eivind", "hjem", "fra", "byen"];

const SWITCH_INTERVAL_MS = 3000;

export function FadedBackgroundText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, SWITCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="pointer-events-none absolute top-[25vh] left-1/2 -translate-x-1/2 z-0 flex items-center justify-center"
      aria-hidden
    >
      <span
        className={`${respira.className} text-[min(28vw,22rem)] font-normal tracking-widest text-white/25 transition-opacity duration-700`}
      >
        {WORDS[index]}
      </span>
    </div>
  );
}
