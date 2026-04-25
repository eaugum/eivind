# Eivind — Home From the City

An interactive 3D character scene built with Next.js, React Three Fiber, and Drei.

The project includes:
- A merged GLB character model with multiple animations
- Keyboard-driven movement and actions
- Background music + action sound effects
- In-scene control UI (mute + reset)

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React](https://react.dev/)
- [Three.js](https://threejs.org/)
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei)
- TypeScript + ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

- `A` / `D` or `Left` / `Right`: Walk
- `W` or `Up`: Jump
- `Space`: Dance
- `S` or `Down`: Rotate
- `R`: Reset position + default rotation

UI buttons:
- `Mute/Unmute sound`
- `Reset`

## Audio Behavior

- Background music loops during normal gameplay.
- Jump and dance trigger dedicated effect sounds.
- While jump/dance effect sound is active, background music pauses and resumes afterward.
- Autoplay is attempted on load. If blocked by browser policy, playback starts on first user interaction.

## 3D Assets and Textures

- Character model: `public/Eivind.glb`
- KTX2/Basis transcoder files: `public/basis/`
- Character animation sounds: `public/idle.mp3`, `public/jump.mp3`, `public/dance.mp3`

## Project Structure

- `app/` — Next.js app router files
- `components/scene/` — 3D scene components and character logic
- `public/` — models, textures, audio, and static assets

## Scripts

- `npm run dev` — Start dev server
- `npm run lint` — Run ESLint
- `npm run build` — Build for production
- `npm run start` — Start production server

## Notes

- The repo was cleaned to remove unused large assets in `public/`.
- The scene is optimized around a single merged character model for better loading performance.
