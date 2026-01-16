/**
 * astro-webgl-hover
 *
 * WebGL image hover effects for Astro using Curtains.js and GSAP
 */

// Components (for Astro users)
export { default as WebglHoverImages } from './src/components/WebglHoverImages.astro';
export { default as WebglHoverImage } from './src/components/WebglHoverImage.astro';

// Library exports (for advanced usage)
export { WebglHover } from './src/lib/webgl-hover/WebglHover';
export { initWebglHover } from './src/lib/webgl-hover/index';
export * from './src/lib/webgl-hover/config';
export * from './src/lib/webgl-hover/utils';
export * from './src/lib/webgl-hover/performance';
