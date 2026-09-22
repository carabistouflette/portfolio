/// <reference types="astro/client" />

interface ButterflyFieldState {
  paused: boolean;
  reducedMotion: boolean;
  time: number;
}

interface ButterflyFieldApi {
  ready: boolean;
  getState(): ButterflyFieldState;
}

interface Window {
  butterflyField?: ButterflyFieldApi;
}
