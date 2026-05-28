"use client";

type AudioState = {
  context: AudioContext | null;
  master: GainNode | null;
  ambience: OscillatorNode | null;
};

type ReadyAudioState = {
  context: AudioContext;
  master: GainNode;
  ambience: OscillatorNode | null;
};

const audioState: AudioState = {
  context: null,
  master: null,
  ambience: null,
};

function getAudio(): ReadyAudioState | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioState.context) {
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.08;
    master.connect(context.destination);
    audioState.context = context;
    audioState.master = master;
  }

  if (!audioState.context || !audioState.master) return null;
  return {
    context: audioState.context,
    master: audioState.master,
    ambience: audioState.ambience,
  };
}

export async function startPixelAmbience(mood: string) {
  const audio = getAudio();
  if (!audio) return;
  if (audio.context.state === "suspended") await audio.context.resume();

  if (audio.ambience) {
    audio.ambience.stop();
    audio.ambience.disconnect();
    audioState.ambience = null;
  }

  const oscillator = audio.context.createOscillator();
  const filter = audio.context.createBiquadFilter();
  const gain = audio.context.createGain();
  const frequencies: Record<string, number> = {
    soft: 196,
    warm: 220,
    night: 146,
    glitch: 110,
    danger: 98,
  };

  oscillator.type = mood === "glitch" ? "square" : "triangle";
  oscillator.frequency.value = frequencies[mood] ?? 164;
  filter.type = "lowpass";
  filter.frequency.value = mood === "danger" ? 420 : 620;
  gain.gain.value = 0.035;

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audio.master);
  oscillator.start();
  audio.ambience = oscillator;
}

export function stopPixelAmbience() {
  if (audioState.ambience) {
    audioState.ambience.stop();
    audioState.ambience.disconnect();
    audioState.ambience = null;
  }
}

export async function playPixelTone(kind: "choice" | "confirm" | "bad" | "ending") {
  const audio = getAudio();
  if (!audio) return;
  if (audio.context.state === "suspended") await audio.context.resume();

  const now = audio.context.currentTime;
  const patterns = {
    choice: [440, 660],
    confirm: [523, 659, 784],
    bad: [196, 155],
    ending: [392, 523, 659, 880],
  };

  patterns[kind].forEach((frequency, index) => {
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    oscillator.type = kind === "bad" ? "sawtooth" : "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.12);
    oscillator.connect(gain);
    gain.connect(audio.master);
    oscillator.start(now + index * 0.08);
    oscillator.stop(now + index * 0.08 + 0.13);
  });
}
