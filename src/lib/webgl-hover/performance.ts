/**
 * Detección de rendimiento y fallbacks para WebGL Hover
 */

interface NavigatorWithExtensions extends Navigator {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
}

export function isLowPerformance(): boolean {
  const nav = navigator as NavigatorWithExtensions;

  // 1. Detectar modo "Ahorro de datos" del navegador/SO
  if (nav.connection?.saveData) {
    return true;
  }

  // 2. Heurística de Hardware
  // deviceMemory (RAM en GB) - Solo Chrome/Edge. Valores: 0.25, 0.5, 1, 2, 4, 8...
  const memory = nav.deviceMemory;
  // hardwareConcurrency (Núcleos CPU)
  const cores = navigator.hardwareConcurrency;

  // Si tiene menos de 4GB de RAM o 2 o menos núcleos, asumimos gama baja.
  return (memory !== undefined && memory < 4) || (cores !== undefined && cores <= 2);
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function shouldUseFallback(): boolean {
  return prefersReducedMotion() || isLowPerformance();
}

export function applyFallbackStyles(planes: NodeListOf<Element>): void {
  planes.forEach((plane) => {
    const planeEl = plane as HTMLElement;
    planeEl.style.position = 'relative';

    const img = planeEl.querySelector('img[data-sampler="texture0"]') as HTMLImageElement;
    if (img) {
      Object.assign(img.style, {
        display: 'block',
        opacity: '1',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      });
    }
  });
}
