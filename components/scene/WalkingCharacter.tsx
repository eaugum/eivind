"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { AdventurerModel } from "@/components/scene/AdventurerModel";
import {
  getCharacterAnimationState,
  type CharacterAnimationState,
  type CharacterInputState,
} from "@/components/scene/characterState";

const WALK_SPEED = 2.5;
const ROTATE_SPEED = Math.PI;
const ROTATION_LERP_SPEED = 10;
const DEFAULT_ROTATION_Y = Math.PI / 2;
const VIEWPORT_WRAP_RATIO = 1.35;

export function WalkingCharacter({
  floorY = -2.2,
  muted = false,
  resetToken = 0,
  mobileInput,
}: {
  floorY?: number;
  muted?: boolean;
  resetToken?: number;
  mobileInput?: Partial<CharacterInputState>;
}) {
  const groupRef = useRef<Group>(null);
  const zRef = useRef(0);
  const keyboardRef = useRef<CharacterInputState>({
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
    arrowLeft: false,
    arrowRight: false,
    arrowUp: false,
    arrowDown: false,
  });
  const touchRef = useRef<CharacterInputState>({
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
    arrowLeft: false,
    arrowRight: false,
    arrowUp: false,
    arrowDown: false,
  });
  const [animation, setAnimation] = useState<CharacterAnimationState>("idle");
  const prevAnimationRef = useRef<CharacterAnimationState>("idle");
  const lastResetTokenRef = useRef(resetToken);
  const targetRotationYRef = useRef(DEFAULT_ROTATION_Y);
  const getCurrentInputState = (): CharacterInputState => ({
    a: keyboardRef.current.a || touchRef.current.a,
    d: keyboardRef.current.d || touchRef.current.d,
    w: keyboardRef.current.w || touchRef.current.w,
    s: keyboardRef.current.s || touchRef.current.s,
    space: keyboardRef.current.space || touchRef.current.space,
    arrowLeft: keyboardRef.current.arrowLeft || touchRef.current.arrowLeft,
    arrowRight: keyboardRef.current.arrowRight || touchRef.current.arrowRight,
    arrowUp: keyboardRef.current.arrowUp || touchRef.current.arrowUp,
    arrowDown: keyboardRef.current.arrowDown || touchRef.current.arrowDown,
  });

  useEffect(() => {
    touchRef.current = {
      a: Boolean(mobileInput?.a),
      d: Boolean(mobileInput?.d),
      w: Boolean(mobileInput?.w),
      s: Boolean(mobileInput?.s),
      space: Boolean(mobileInput?.space),
      arrowLeft: Boolean(mobileInput?.arrowLeft),
      arrowRight: Boolean(mobileInput?.arrowRight),
      arrowUp: Boolean(mobileInput?.arrowUp),
      arrowDown: Boolean(mobileInput?.arrowDown),
    };
  }, [mobileInput]);

  const resetCharacter = () => {
    keyboardRef.current = {
      a: false,
      d: false,
      w: false,
      s: false,
      space: false,
      arrowLeft: false,
      arrowRight: false,
      arrowUp: false,
      arrowDown: false,
    };
    touchRef.current = {
      a: false,
      d: false,
      w: false,
      s: false,
      space: false,
      arrowLeft: false,
      arrowRight: false,
      arrowUp: false,
      arrowDown: false,
    };
    zRef.current = 0;
    prevAnimationRef.current = "idle";
    setAnimation("idle");
    if (groupRef.current) {
      groupRef.current.position.z = 0;
      groupRef.current.rotation.y = DEFAULT_ROTATION_Y;
    }
    targetRotationYRef.current = DEFAULT_ROTATION_Y;
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyA") keyboardRef.current.a = true;
      if (e.code === "KeyD") keyboardRef.current.d = true;
      if (e.code === "KeyW") keyboardRef.current.w = true;
      if (e.code === "KeyS") keyboardRef.current.s = true;
      if (e.code === "ArrowLeft") keyboardRef.current.arrowLeft = true;
      if (e.code === "ArrowRight") keyboardRef.current.arrowRight = true;
      if (e.code === "Space") {
        e.preventDefault();
        keyboardRef.current.space = true;
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        keyboardRef.current.arrowUp = true;
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        keyboardRef.current.arrowDown = true;
      }
      if (e.code === "KeyR" && !e.repeat) {
        resetCharacter();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA") keyboardRef.current.a = false;
      if (e.code === "KeyD") keyboardRef.current.d = false;
      if (e.code === "KeyW") keyboardRef.current.w = false;
      if (e.code === "KeyS") keyboardRef.current.s = false;
      if (e.code === "ArrowLeft") keyboardRef.current.arrowLeft = false;
      if (e.code === "ArrowRight") keyboardRef.current.arrowRight = false;
      if (e.code === "Space") keyboardRef.current.space = false;
      if (e.code === "ArrowUp") keyboardRef.current.arrowUp = false;
      if (e.code === "ArrowDown") keyboardRef.current.arrowDown = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (lastResetTokenRef.current !== resetToken) {
      lastResetTokenRef.current = resetToken;
      resetCharacter();
    }

    const inputState = getCurrentInputState();
    const { a, d, s, arrowLeft, arrowRight, arrowDown } = inputState;
    const movingLeft = a || arrowLeft;
    const movingRight = d || arrowRight;
    const rotating = s || arrowDown;
    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
    const zLimit = (viewport.width * 0.5) * VIEWPORT_WRAP_RATIO;
    const zLeft = -zLimit;
    const zRight = zLimit;

    // Keep animation state in sync with keys every frame (keyup can be missed)
    const nextAnimation = getCharacterAnimationState(inputState);
    if (nextAnimation !== prevAnimationRef.current) {
      prevAnimationRef.current = nextAnimation;
      setAnimation(nextAnimation);
    }

    if (movingLeft) zRef.current += delta * WALK_SPEED;
    if (movingRight) zRef.current -= delta * WALK_SPEED;
    if (zRef.current > zRight) zRef.current = zLeft;
    if (zRef.current < zLeft) zRef.current = zRight;

    if (groupRef.current) {
      groupRef.current.position.z = zRef.current;
      if (rotating) {
        targetRotationYRef.current += delta * ROTATE_SPEED;
      }
      if (!rotating && movingLeft && !movingRight) targetRotationYRef.current = 0; // face +Z
      if (!rotating && movingRight && !movingLeft) targetRotationYRef.current = Math.PI; // face -Z
      const rotationAlpha = Math.min(1, delta * ROTATION_LERP_SPEED);
      groupRef.current.rotation.y +=
        (targetRotationYRef.current - groupRef.current.rotation.y) * rotationAlpha;
    }
  });

  const BOY_Y = floorY;

  return (
    <group ref={groupRef} position={[0, BOY_Y, 0]} rotation={[0, DEFAULT_ROTATION_Y, 0]}>
      <AdventurerModel
        scale={1}
        position={[0, 0, 0]}
        animation={animation}
        muted={muted}
      />
    </group>
  );
}
