/// <reference types="astro/client" />

interface ButterflyFieldState {
  paused: boolean;
  reducedMotion: boolean;
  time: number;
}

interface ButterflyFieldApi {
  ready: boolean;
  pause(): void;
  play(): void;
  getState(): ButterflyFieldState;
}

interface Window {
  butterflyField?: ButterflyFieldApi;
}
