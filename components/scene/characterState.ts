export type CharacterAnimationState = "idle" | "walk" | "jump" | "dance";

export type CharacterInputState = {
  a: boolean;
  d: boolean;
  w: boolean;
  s: boolean;
  space: boolean;
  arrowLeft: boolean;
  arrowRight: boolean;
  arrowUp: boolean;
  arrowDown: boolean;
};

type CharacterModelConfig = {
  rotation: [number, number, number];
};

const MODEL_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];

const MODEL_CONFIG: Record<CharacterAnimationState, CharacterModelConfig> = {
  idle: {
    rotation: MODEL_ROTATION,
  },
  walk: {
    rotation: MODEL_ROTATION,
  },
  jump: {
    rotation: MODEL_ROTATION,
  },
  dance: {
    rotation: MODEL_ROTATION,
  },
};

export function getCharacterAnimationState(
  input: CharacterInputState
): CharacterAnimationState {
  if (input.space) return "dance";
  if (input.arrowUp || input.w) return "jump";
  if (input.a || input.d || input.arrowLeft || input.arrowRight) return "walk";
  return "idle";
}

export function getCharacterModelConfig(
  state: CharacterAnimationState
): CharacterModelConfig {
  return MODEL_CONFIG[state];
}
