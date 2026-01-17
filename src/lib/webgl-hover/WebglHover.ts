/**
 * Main class for handling WebGL hover effects with Curtains.js
 */

import { Plane } from 'curtainsjs';
import gsap from 'gsap';
import type { WebglHoverOptions } from './config';
import { degreesToRadians, calculateDisplacementVector } from './utils';
import vertexShader from '@/shaders/vertex.glsl?raw';
import fragmentShader from '@/shaders/fragment.glsl?raw';

export class WebglHover {
  private webGLCurtain: any;
  private planeElement: HTMLElement;
  private plane: any;
  private params: any;

  private durationIn: number;
  private durationOut: number;
  private easeIn: string;
  private easeOut: string;
  private zoom: number;
  private imageRotation: number;
  private noiseSpeed: number;
  private noiseScale: number;
  private rgbShiftIntensity: number;
  private intensity: number;
  private displacementAngle: number;

  private hoverEnabled: boolean = true;
  private isAnimating: boolean = false;

  private boundHandleMouseEnter: () => void;
  private boundHandleMouseOut: () => void;

  constructor(curtains: any, planeElement: HTMLElement, options: WebglHoverOptions) {
    this.webGLCurtain = curtains;
    this.planeElement = planeElement;

    // Bind handlers for proper cleanup on destroy
    this.boundHandleMouseEnter = this.handleMouseEnter.bind(this);
    this.boundHandleMouseOut = this.handleMouseOut.bind(this);

    this.durationIn = options.durationIn;
    this.durationOut = options.durationOut;
    this.easeIn = options.easeIn;
    this.easeOut = options.easeOut;
    this.zoom = options.zoom;
    this.imageRotation = degreesToRadians(options.imageRotation);
    this.noiseSpeed = options.noiseSpeed;
    this.noiseScale = options.noiseScale;
    this.rgbShiftIntensity = options.rgbShiftIntensity;
    this.intensity = options.intensity;
    this.displacementAngle = options.displacementAngle;

    // Convert intensity + angle to displacement vector [x, y]
    const displacement = calculateDisplacementVector(options.intensity, options.displacementAngle);

    this.params = {
      vertexShader,
      fragmentShader,
      widthSegments: 20,
      heightSegments: 20,
      uniforms: {
        time: { name: 'uTime', type: '1f', value: 0 },
        mousepos: { name: 'uMouse', type: '2f', value: [0, 0] },
        resolution: { name: 'uReso', type: '2f', value: [innerWidth, innerHeight] },
        progress: { name: 'uProgress', type: '1f', value: 0 },
        displacement: { name: 'uDisplacement', type: '2f', value: displacement },
        zoom: { name: 'uZoom', type: '1f', value: 1 },
        rotation: { name: 'uRotation', type: '1f', value: 0 },
        noiseSpeed: { name: 'uNoiseSpeed', type: '1f', value: this.noiseSpeed },
        noiseScale: { name: 'uNoiseScale', type: '1f', value: this.noiseScale },
        rgbShift: { name: 'uRgbShift', type: '1f', value: 0 },
        tex1Scale: { name: 'uTex1Scale', type: '2f', value: options.tex1Scale },
      },
    };

    this.initPlane();
  }

  private initPlane(): void {
    this.plane = new Plane(this.webGLCurtain, this.planeElement, this.params);

    if (this.plane) {
      this.plane.onReady(() => {
        this.startRenderLoop();
        this.bindEvents();
        this.hideOriginalImage();
      });
    }
  }

  // Only update time uniform when animating (performance optimization)
  private startRenderLoop(): void {
    this.plane.onRender(() => {
      if (this.isAnimating) {
        this.plane.uniforms.time.value += 0.01;
      }
    });
  }

  private hideOriginalImage(): void {
    const img = this.planeElement.querySelector('img[data-sampler="texture0"]') as HTMLElement;
    if (img) {
      img.style.opacity = '0';
    }
  }

  private bindEvents(): void {
    this.planeElement.addEventListener('mouseenter', this.boundHandleMouseEnter);
    this.planeElement.addEventListener('mouseout', this.boundHandleMouseOut);
  }

  private unbindEvents(): void {
    this.planeElement.removeEventListener('mouseenter', this.boundHandleMouseEnter);
    this.planeElement.removeEventListener('mouseout', this.boundHandleMouseOut);
  }

  private handleMouseEnter(): void {
    if (!this.hoverEnabled) return;

    this.isAnimating = true;

    const commonIn = {
      duration: this.durationIn,
      ease: this.easeIn,
      overwrite: true,
    };

    gsap.to(this.plane.uniforms.progress, { ...commonIn, value: 1 });
    gsap.to(this.plane.uniforms.zoom, { ...commonIn, value: 1 + this.zoom });
    gsap.to(this.plane.uniforms.rotation, { ...commonIn, value: this.imageRotation });
    gsap.to(this.plane.uniforms.rgbShift, { ...commonIn, value: this.rgbShiftIntensity });
  }

  private handleMouseOut(): void {
    if (!this.hoverEnabled) return;

    const commonOut = {
      duration: this.durationOut,
      ease: this.easeOut,
      overwrite: true,
      onComplete: () => {
        this.isAnimating = false;
      },
    };

    gsap.to(this.plane.uniforms.progress, { ...commonOut, value: 0 });
    gsap.to(this.plane.uniforms.zoom, { ...commonOut, value: 1 });
    gsap.to(this.plane.uniforms.rotation, { ...commonOut, value: 0 });
    gsap.to(this.plane.uniforms.rgbShift, { ...commonOut, value: 0 });
  }

  public resize(): void {
    if (this.plane) {
      this.plane.uniforms.resolution.value = [window.innerWidth, window.innerHeight];
    }
  }

  // Manual progress control (used by debug panel timeline)
  public setProgress(progress: number): void {
    if (!this.plane) return;

    this.isAnimating = progress > 0;

    this.plane.uniforms.progress.value = progress;
    this.plane.uniforms.zoom.value = 1 + this.zoom * progress;
    this.plane.uniforms.rotation.value = this.imageRotation * progress;
    this.plane.uniforms.rgbShift.value = this.rgbShiftIntensity * progress;
  }

  public setHoverEnabled(enabled: boolean): void {
    this.hoverEnabled = enabled;
  }

  public destroy(): void {
    this.unbindEvents();
    if (this.plane) {
      this.plane.remove();
      this.plane = null;
    }
  }

  public setDebugHighlight(enabled: boolean): void {
    if (enabled) {
      this.planeElement.style.outline = '3px solid #00ff00';
      this.planeElement.style.outlineOffset = '-3px';
    } else {
      this.planeElement.style.outline = '';
      this.planeElement.style.outlineOffset = '';
    }
  }

  public getConfig(): Partial<WebglHoverOptions> {
    return {
      durationIn: this.durationIn,
      durationOut: this.durationOut,
      easeIn: this.easeIn,
      easeOut: this.easeOut,
      zoom: this.zoom,
      imageRotation: this.imageRotation * (180 / Math.PI), // radians to degrees
      noiseSpeed: this.noiseSpeed,
      noiseScale: this.noiseScale,
      rgbShiftIntensity: this.rgbShiftIntensity,
      intensity: this.intensity,
      displacementAngle: this.displacementAngle,
    };
  }

  public updateConfig(config: Partial<WebglHoverOptions>): void {
    if (config.durationIn !== undefined) this.durationIn = config.durationIn;
    if (config.durationOut !== undefined) this.durationOut = config.durationOut;
    if (config.easeIn !== undefined) this.easeIn = config.easeIn;
    if (config.easeOut !== undefined) this.easeOut = config.easeOut;
    if (config.zoom !== undefined) this.zoom = config.zoom;
    if (config.imageRotation !== undefined) this.imageRotation = degreesToRadians(config.imageRotation);
    if (config.rgbShiftIntensity !== undefined) this.rgbShiftIntensity = config.rgbShiftIntensity;
    if (config.intensity !== undefined) this.intensity = config.intensity;
    if (config.displacementAngle !== undefined) this.displacementAngle = config.displacementAngle;

    if (this.plane) {
      if (config.noiseSpeed !== undefined) {
        this.noiseSpeed = config.noiseSpeed;
        this.plane.uniforms.noiseSpeed.value = this.noiseSpeed;
      }
      if (config.noiseScale !== undefined) {
        this.noiseScale = config.noiseScale;
        this.plane.uniforms.noiseScale.value = this.noiseScale;
      }

      const displacement = calculateDisplacementVector(this.intensity, this.displacementAngle);
      this.plane.uniforms.displacement.value = displacement;
    }
  }
}
