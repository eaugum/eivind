"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useGraph, useThree } from "@react-three/fiber";
import { LoopRepeat } from "three";
import type { Bone, Group, MeshStandardMaterial, SkinnedMesh } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  getCharacterModelConfig,
  type CharacterAnimationState,
} from "@/components/scene/characterState";

const BACKGROUND_MUSIC_SRC = "/idle.mp3";
const EFFECT_SOUND_BY_ANIMATION: Partial<Record<CharacterAnimationState, string>> = {
  jump: "/jump.mp3",
  dance: "/dance.mp3",
};

const CHARACTER_MODEL_URL = "/Eivind.glb";
const MODEL_SCALE = 0.02;

type ModelGraph = {
  nodes: {
    node_0: SkinnedMesh;
    mixamorigHips: Bone;
  };
  materials: Record<string, MeshStandardMaterial>;
};

type AdventurerModelProps = React.ComponentProps<"group"> & {
  animation?: CharacterAnimationState;
  muted?: boolean;
};

export function AdventurerModel({
  animation = "idle",
  muted = false,
  ...props
}: AdventurerModelProps) {
  const group = useRef<Group>(null);
  const backgroundSoundRef = useRef<HTMLAudioElement | null>(null);
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const danceSoundRef = useRef<HTMLAudioElement | null>(null);
  const { gl } = useThree();
  const { rotation } = getCharacterModelConfig(animation);
  const ktx2Loader = useMemo(
    () => new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl),
    [gl]
  );
  const { scene, animations } = useGLTF(
    CHARACTER_MODEL_URL,
    true,
    undefined,
    (loader) => {
      loader.setKTX2Loader(
        ktx2Loader as unknown as Parameters<typeof loader.setKTX2Loader>[0]
      );
    }
  );
  const modelScene = useMemo(() => clone(scene), [scene]);
  const { nodes, materials } = useGraph(modelScene) as unknown as ModelGraph;
  const material = Object.values(materials)[0];
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    useGLTF.preload(CHARACTER_MODEL_URL, true, undefined, (loader) => {
      loader.setKTX2Loader(
        ktx2Loader as unknown as Parameters<typeof loader.setKTX2Loader>[0]
      );
    });
  }, [ktx2Loader]);

  useEffect(() => {
    const allActions = Object.values(actions);
    allActions.forEach((a) => a?.stop());

    const actionFromName =
      actions[animation] ??
      Object.entries(actions).find(([name]) => name.toLowerCase() === animation)
        ?.[1];
    const fallbackClip = animations.find((clip) => clip.name === animation);
    const action =
      actionFromName ??
      (fallbackClip && group.current
        ? mixer.clipAction(fallbackClip, group.current)
        : undefined);
    if (action) {
      action.setLoop(LoopRepeat, Infinity);
      action.reset().play();
    }

    return () => {
      allActions.forEach((a) => a?.stop());
    };
  }, [actions, animation, animations, mixer]);

  useEffect(() => {
    if (muted) return;

    const audio = new Audio(BACKGROUND_MUSIC_SRC);
    backgroundSoundRef.current = audio;

    audio.loop = true;
    audio.volume = 0.5;
    audio.autoplay = true;

    const interactionEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];

    const removeInteractionListeners = () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, retryPlaybackOnInteraction);
      });
    };

    const startPlayback = () =>
      audio
        .play()
        .then(() => {
          removeInteractionListeners();
        })
        .catch(() => {
          // Browser may block autoplay with sound.
        });

    const retryPlaybackOnInteraction = () => {
      startPlayback();
    };

    startPlayback();
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, retryPlaybackOnInteraction, {
        once: true,
      });
    });

    return () => {
      removeInteractionListeners();
      audio.pause();
      audio.currentTime = 0;
      backgroundSoundRef.current = null;
    };
  }, [muted]);

  useEffect(() => {
    if (muted) return;

    const effectSrc = EFFECT_SOUND_BY_ANIMATION[animation];
    if (!effectSrc) return;

    const backgroundAudio = backgroundSoundRef.current;
    const resumeBackgroundMusic = () => {
      if (!backgroundAudio) return;
      backgroundAudio.play().catch(() => {
        // Browser may block playback until interaction.
      });
    };

    let jumpIntervalId: ReturnType<typeof setInterval> | null = null;
    if (animation === "jump") {
      if (backgroundAudio) {
        backgroundAudio.pause();
      }
      if (!jumpSoundRef.current) {
        jumpSoundRef.current = new Audio(effectSrc);
        jumpSoundRef.current.volume = 0.6;
      }
      const jumpAudio = jumpSoundRef.current;
      jumpAudio.currentTime = 0;
      jumpAudio.play().catch(() => {
        // Browser may block playback until interaction.
      });
      const jumpClipDurationMs =
        Math.max(
          0.1,
          animations.find((clip) => clip.name === "jump")?.duration ?? 2
        ) * 1000;
      jumpIntervalId = setInterval(() => {
        jumpAudio.currentTime = 0;
        jumpAudio.play().catch(() => {
          // Browser may block playback until interaction.
        });
      }, jumpClipDurationMs);
    } else if (animation === "dance") {
      if (backgroundAudio) {
        backgroundAudio.pause();
      }
      if (!danceSoundRef.current) {
        danceSoundRef.current = new Audio(effectSrc);
        danceSoundRef.current.volume = 0.6;
      }
      const danceAudio = danceSoundRef.current;
      danceAudio.currentTime = 0;
      danceAudio.addEventListener("ended", resumeBackgroundMusic, { once: true });
      danceAudio.play().catch(() => {
        // Browser may block playback until interaction.
        resumeBackgroundMusic();
      });
    }

    return () => {
      if (jumpIntervalId) {
        clearInterval(jumpIntervalId);
      }
      if (animation === "jump" && jumpSoundRef.current) {
        jumpSoundRef.current.pause();
        jumpSoundRef.current.currentTime = 0;
      }
      if (animation === "dance" && danceSoundRef.current) {
        danceSoundRef.current.pause();
        danceSoundRef.current.currentTime = 0;
      }
      resumeBackgroundMusic();
    };
  }, [animation, animations, muted]);

  if (!material) {
    return null;
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={rotation} scale={MODEL_SCALE}>
          <primitive object={nodes.mixamorigHips} />
        </group>
        <skinnedMesh
          name="node_0"
          geometry={nodes.node_0.geometry}
          material={material}
          skeleton={nodes.node_0.skeleton}
          rotation={rotation}
          scale={MODEL_SCALE}
        />
      </group>
    </group>
  );
}
