/**
 * Performance detection and fallbacks for WebGL Hover
 */

interface NavigatorWithExtensions extends Navigator {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
}

export function isLowPerformance(): boolean {
  const nav = navigator as NavigatorWithExtensions;

  // 1. Detect "Data Saver" mode from Browser/OS
  if (nav.connection?.saveData) {
    return true;
  }

  // 2. Hardware Heuristics
  // deviceMemory (RAM in GB) - Chrome/Edge only. Values: 0.25, 0.5, 1, 2, 4, 8...
  const memory = nav.deviceMemory;
  // hardwareConcurrency (CPU Cores)
  const cores = navigator.hardwareConcurrency;

  // If less than 4GB RAM or 2 or fewer cores, assume low-end.
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
