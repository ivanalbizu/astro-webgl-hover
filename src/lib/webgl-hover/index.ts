/**
 * WebGL Hover - Punto de entrada principal
 *
 * Inicializa efectos WebGL hover con Curtains.js y GSAP
 */

import { Curtains } from 'curtainsjs';
import { WebglHover } from './WebglHover';
import { DEFAULT_CONFIG, type WebglHoverConfig, type WebglHoverOptions } from './config';
import { shouldUseFallback, applyFallbackStyles } from './performance';
import {
  getAttributeAsFloat,
  getAttributeAsString,
  calculateTextureScale,
} from './utils';

export { WebglHover } from './WebglHover';
export * from './config';
export * from './performance';
export * from './utils';

function getConfigFromDOM(): WebglHoverConfig {
  const configEl = document.getElementById('webgl-hover-config');

  if (!configEl) {
    return DEFAULT_CONFIG;
  }

  return {
    durationIn: parseFloat(configEl.dataset.durationIn || String(DEFAULT_CONFIG.durationIn)),
    durationOut: parseFloat(configEl.dataset.durationOut || String(DEFAULT_CONFIG.durationOut)),
    easeIn: configEl.dataset.easeIn || DEFAULT_CONFIG.easeIn,
    easeOut: configEl.dataset.easeOut || DEFAULT_CONFIG.easeOut,
    intensity: parseFloat(configEl.dataset.intensity || String(DEFAULT_CONFIG.intensity)),
    displacementAngle: parseFloat(configEl.dataset.displacementAngle || String(DEFAULT_CONFIG.displacementAngle)),
    zoom: parseFloat(configEl.dataset.zoom || String(DEFAULT_CONFIG.zoom)),
    imageRotation: parseFloat(configEl.dataset.imageRotation || String(DEFAULT_CONFIG.imageRotation)),
    noiseSpeed: parseFloat(configEl.dataset.noiseSpeed || String(DEFAULT_CONFIG.noiseSpeed)),
    noiseScale: parseFloat(configEl.dataset.noiseScale || String(DEFAULT_CONFIG.noiseScale)),
    rgbShiftIntensity: parseFloat(configEl.dataset.rgbShiftIntensity || String(DEFAULT_CONFIG.rgbShiftIntensity)),
    debug: configEl.dataset.debug === 'true',
  };
}

function getOptionsFromSlide(slide: Element, defaults: WebglHoverConfig): WebglHoverOptions {
  const planeWidth = getAttributeAsFloat(slide, 'data-width', 1);
  const planeHeight = getAttributeAsFloat(slide, 'data-height', 1);
  const tex1Width = getAttributeAsFloat(slide, 'data-width1', planeWidth);
  const tex1Height = getAttributeAsFloat(slide, 'data-height1', planeHeight);

  const tex1Scale = calculateTextureScale(planeWidth, planeHeight, tex1Width, tex1Height);

  return {
    durationIn: getAttributeAsFloat(slide, 'data-duration-in', defaults.durationIn),
    durationOut: getAttributeAsFloat(slide, 'data-duration-out', defaults.durationOut),
    easeIn: getAttributeAsString(slide, 'data-ease-in', defaults.easeIn),
    easeOut: getAttributeAsString(slide, 'data-ease-out', defaults.easeOut),
    intensity: getAttributeAsFloat(slide, 'data-intensity', defaults.intensity),
    displacementAngle: getAttributeAsFloat(slide, 'data-displacement-angle', defaults.displacementAngle),
    zoom: getAttributeAsFloat(slide, 'data-zoom', defaults.zoom),
    imageRotation: getAttributeAsFloat(slide, 'data-image-rotation', defaults.imageRotation),
    noiseSpeed: getAttributeAsFloat(slide, 'data-noise-speed', defaults.noiseSpeed),
    noiseScale: getAttributeAsFloat(slide, 'data-noise-scale', defaults.noiseScale),
    rgbShiftIntensity: getAttributeAsFloat(slide, 'data-rgb-shift-intensity', defaults.rgbShiftIntensity),
    tex1Scale,
  };
}

function createCanvasContainer(): HTMLElement {
  let container = document.getElementById('canvas-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'canvas-container';
    document.body.appendChild(container);
  }

  return container;
}

function initDebugMode(instances: WebglHover[], config: WebglHoverConfig): void {
  import('lil-gui').then(({ default: GUI }) => {
    const gui = new GUI({ title: 'WebGL Hover Debug' });

    // Selector de instancia (sin opción "All")
    const targetOptions: Record<string, number> = {};
    instances.forEach((_, i) => {
      targetOptions[`Image ${i + 1}`] = i;
    });

    const selectorConfig = { target: 0 };

    const getTargetInstance = (): WebglHover => {
      return instances[selectorConfig.target];
    };

    // Cargar config inicial de la primera imagen
    const initialConfig = instances[0].getConfig();
    const debugConfig = {
      intensity: initialConfig.intensity ?? config.intensity,
      displacementAngle: initialConfig.displacementAngle ?? config.displacementAngle,
      zoom: initialConfig.zoom ?? config.zoom,
      imageRotation: initialConfig.imageRotation ?? config.imageRotation,
      noiseSpeed: initialConfig.noiseSpeed ?? config.noiseSpeed,
      noiseScale: initialConfig.noiseScale ?? config.noiseScale,
      rgbShiftIntensity: initialConfig.rgbShiftIntensity ?? config.rgbShiftIntensity,
      durationIn: initialConfig.durationIn ?? config.durationIn,
      durationOut: initialConfig.durationOut ?? config.durationOut,
      easeIn: initialConfig.easeIn ?? config.easeIn,
      easeOut: initialConfig.easeOut ?? config.easeOut,
    };

    const timelineConfig = {
      progress: 0,
      manualControl: false,
    };

    // Controllers para actualizar valores al cambiar de imagen
    const controllers: any[] = [];
    // Controllers de animación (se deshabilitan en manual mode)
    const animControllers: any[] = [];

    const loadConfigFromInstance = (index: number) => {
      const instanceConfig = instances[index].getConfig();
      debugConfig.intensity = instanceConfig.intensity ?? debugConfig.intensity;
      debugConfig.displacementAngle = instanceConfig.displacementAngle ?? debugConfig.displacementAngle;
      debugConfig.zoom = instanceConfig.zoom ?? debugConfig.zoom;
      debugConfig.imageRotation = instanceConfig.imageRotation ?? debugConfig.imageRotation;
      debugConfig.noiseSpeed = instanceConfig.noiseSpeed ?? debugConfig.noiseSpeed;
      debugConfig.noiseScale = instanceConfig.noiseScale ?? debugConfig.noiseScale;
      debugConfig.rgbShiftIntensity = instanceConfig.rgbShiftIntensity ?? debugConfig.rgbShiftIntensity;
      debugConfig.durationIn = instanceConfig.durationIn ?? debugConfig.durationIn;
      debugConfig.durationOut = instanceConfig.durationOut ?? debugConfig.durationOut;
      debugConfig.easeIn = instanceConfig.easeIn ?? debugConfig.easeIn;
      debugConfig.easeOut = instanceConfig.easeOut ?? debugConfig.easeOut;

      // Actualizar todos los controllers
      controllers.forEach((c) => c.updateDisplay());
    };

    // Highlight inicial en la primera imagen
    instances[0].setDebugHighlight(true);

    gui.add(selectorConfig, 'target', targetOptions).name('Target').onChange((index: number) => {
      // Quitar highlight de todas y poner en la seleccionada
      instances.forEach((inst, i) => inst.setDebugHighlight(i === index));

      loadConfigFromInstance(index);
      // Reset timeline progress al cambiar
      timelineConfig.progress = 0;
      controllers.forEach((c) => c.updateDisplay());
    });

    const updateTargetInstance = () => {
      getTargetInstance().updateConfig(debugConfig);
    };

    const setTargetProgress = (value: number) => {
      getTargetInstance().setProgress(value);
    };

    const setTargetHoverEnabled = (enabled: boolean) => {
      getTargetInstance().setHoverEnabled(enabled);
    };

    // Timeline folder
    const folderTimeline = gui.addFolder('Timeline');
    controllers.push(
      folderTimeline
        .add(timelineConfig, 'progress', 0, 1, 0.01)
        .name('Progress')
        .onChange((value: number) => {
          if (timelineConfig.manualControl) {
            setTargetProgress(value);
          }
        })
    );

    controllers.push(
      folderTimeline.add(timelineConfig, 'manualControl').name('Manual Control').onChange((enabled: boolean) => {
        setTargetHoverEnabled(!enabled);
        if (enabled) {
          setTargetProgress(timelineConfig.progress);
        } else {
          // Volver a estado de reposo al desactivar
          setTargetProgress(0);
          timelineConfig.progress = 0;
          controllers.forEach((c) => c.updateDisplay());
        }
        // Deshabilitar/habilitar controles de animación
        animControllers.forEach((c) => c.enable(!enabled));
      })
    );

    folderTimeline.open();

    // Parameters folder
    const folderParams = gui.addFolder('Parameters');
    controllers.push(folderParams.add(debugConfig, 'intensity', 0, 2).name('Intensity').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'displacementAngle', 0, 360).name('Disp. Angle').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'zoom', 0, 0.5).name('Zoom').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'imageRotation', -45, 45).name('Rotation (deg)').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'noiseSpeed', 0, 2).name('Noise Speed').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'noiseScale', 0, 20).name('Noise Scale').onChange(updateTargetInstance));
    controllers.push(folderParams.add(debugConfig, 'rgbShiftIntensity', 0, 1).name('RGB Shift').onChange(updateTargetInstance));

    // Animation folder (se deshabilitan en manual mode)
    const folderAnim = gui.addFolder('Animation');
    const durationInCtrl = folderAnim.add(debugConfig, 'durationIn', 0.1, 3).name('Duration In').onChange(updateTargetInstance);
    const durationOutCtrl = folderAnim.add(debugConfig, 'durationOut', 0.1, 3).name('Duration Out').onChange(updateTargetInstance);
    controllers.push(durationInCtrl, durationOutCtrl);
    animControllers.push(durationInCtrl, durationOutCtrl);

    const easingOptions = [
      'none',
      'power1.in',
      'power1.out',
      'power1.inOut',
      'power2.in',
      'power2.out',
      'power2.inOut',
      'power3.in',
      'power3.out',
      'power3.inOut',
      'power4.in',
      'power4.out',
      'power4.inOut',
      'back.in(1.7)',
      'back.out(1.7)',
      'back.inOut(1.7)',
      'elastic.out(1, 0.3)',
      'elastic.out(1, 0.5)',
      'elastic.inOut(1, 0.3)',
      'bounce.out',
      'bounce.inOut',
      'circ.in',
      'circ.out',
      'circ.inOut',
      'expo.in',
      'expo.out',
      'expo.inOut',
    ];

    const easeInCtrl = folderAnim.add(debugConfig, 'easeIn', easingOptions).name('Ease In').onChange(updateTargetInstance);
    const easeOutCtrl = folderAnim.add(debugConfig, 'easeOut', easingOptions).name('Ease Out').onChange(updateTargetInstance);
    controllers.push(easeInCtrl, easeOutCtrl);
    animControllers.push(easeInCtrl, easeOutCtrl);

    folderParams.open();
  });
}

export function initWebglHover(): WebglHover[] {
  const planes = document.querySelectorAll('.whi-plane');

  if (shouldUseFallback()) {
    applyFallbackStyles(planes);
    return [];
  }

  const config = getConfigFromDOM();
  const container = createCanvasContainer();

  const webGLCurtain = new Curtains({
    container,
    pixelRatio: Math.min(1.5, window.devicePixelRatio),
  });

  const instances: WebglHover[] = [];

  document.querySelectorAll('.whi-slide').forEach((slide) => {
    const planeElement = slide.querySelector('.whi-plane') as HTMLElement;

    if (planeElement) {
      const options = getOptionsFromSlide(slide, config);
      instances.push(new WebglHover(webGLCurtain, planeElement, options));
    }
  });

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      instances.forEach((instance) => instance.resize());
    }, 150);
  });

  if (config.debug) {
    initDebugMode(instances, config);
  }

  return instances;
}
