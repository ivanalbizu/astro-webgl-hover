/**
 * Configuration and interfaces for WebGL Hover
 */

export interface WebglHoverOptions {
  durationIn: number;
  durationOut: number;
  easeIn: string;
  easeOut: string;
  intensity: number;
  displacementAngle: number;
  zoom: number;
  imageRotation: number;
  noiseSpeed: number;
  noiseScale: number;
  rgbShiftIntensity: number;
  tex1Scale: [number, number];
}

export interface WebglHoverConfig {
  durationIn: number;
  durationOut: number;
  easeIn: string;
  easeOut: string;
  displacementAngle: number;
  intensity: number;
  zoom: number;
  imageRotation: number;
  noiseSpeed: number;
  noiseScale: number;
  rgbShiftIntensity: number;
  debug: boolean;
}

export const DEFAULT_CONFIG: WebglHoverConfig = {
  durationIn: 0.8,
  durationOut: 0.8,
  easeIn: 'power2.out',
  easeOut: 'power2.out',
  displacementAngle: 0,
  intensity: 1,
  zoom: 0.1,
  imageRotation: 0,
  noiseSpeed: 0.5,
  noiseScale: 6.0,
  rgbShiftIntensity: 0,
  debug: false,
};
