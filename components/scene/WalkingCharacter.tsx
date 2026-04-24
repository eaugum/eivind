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

const Z_LEFT = -5;
const Z_RIGHT = 5;
const WALK_SPEED = 2.5;
const ROTATE_SPEED = Math.PI;
const ROTATION_LERP_SPEED = 10;
const DEFAULT_ROTATION_Y = Math.PI / 2;

export function WalkingCharacter({
  floorY = -2.2,
  muted = false,
  resetToken = 0,
}: {
  floorY?: number;
  muted?: boolean;
  resetToken?: number;
}) {
  const groupRef = useRef<Group>(null);
  const zRef = useRef(0);
  const keysRef = useRef<CharacterInputState>({
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
  const resetCharacter = () => {
    keysRef.current = {
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
      if (e.code === "KeyA") keysRef.current.a = true;
      if (e.code === "KeyD") keysRef.current.d = true;
      if (e.code === "KeyW") keysRef.current.w = true;
      if (e.code === "KeyS") keysRef.current.s = true;
      if (e.code === "ArrowLeft") keysRef.current.arrowLeft = true;
      if (e.code === "ArrowRight") keysRef.current.arrowRight = true;
      if (e.code === "Space") {
        e.preventDefault();
        keysRef.current.space = true;
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        keysRef.current.arrowUp = true;
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        keysRef.current.arrowDown = true;
      }
      if (e.code === "KeyR" && !e.repeat) {
        resetCharacter();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA") keysRef.current.a = false;
      if (e.code === "KeyD") keysRef.current.d = false;
      if (e.code === "KeyW") keysRef.current.w = false;
      if (e.code === "KeyS") keysRef.current.s = false;
      if (e.code === "ArrowLeft") keysRef.current.arrowLeft = false;
      if (e.code === "ArrowRight") keysRef.current.arrowRight = false;
      if (e.code === "Space") keysRef.current.space = false;
      if (e.code === "ArrowUp") keysRef.current.arrowUp = false;
      if (e.code === "ArrowDown") keysRef.current.arrowDown = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (lastResetTokenRef.current !== resetToken) {
      lastResetTokenRef.current = resetToken;
      resetCharacter();
    }

    const { a, d, s, arrowLeft, arrowRight, arrowDown } = keysRef.current;
    const movingLeft = a || arrowLeft;
    const movingRight = d || arrowRight;
    const rotating = s || arrowDown;

    // Keep animation state in sync with keys every frame (keyup can be missed)
    const nextAnimation = getCharacterAnimationState(keysRef.current);
    if (nextAnimation !== prevAnimationRef.current) {
      prevAnimationRef.current = nextAnimation;
      setAnimation(nextAnimation);
    }

    if (movingLeft) zRef.current += delta * WALK_SPEED;
    if (movingRight) zRef.current -= delta * WALK_SPEED;
    if (zRef.current > Z_RIGHT) zRef.current = Z_LEFT;
    if (zRef.current < Z_LEFT) zRef.current = Z_RIGHT;

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
