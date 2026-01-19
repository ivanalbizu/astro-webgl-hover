# @ivanalbizu/astro-webgl-hover

WebGL image hover effects for Astro with displacement transitions using Curtains.js and GSAP.

## Installation

```bash
npm install @ivanalbizu/astro-webgl-hover
```

## Usage

```astro
---
import { WebglHoverImages, WebglHoverImage } from '@ivanalbizu/astro-webgl-hover';
---

<WebglHoverImages>
  <WebglHoverImage
    texture0="/image-default.jpg"
    texture1="/image-hover.jpg"
    map="/displacements/displacement.jpg"
  />
</WebglHoverImages>
```

## Components

### `<WebglHoverImages>`

Container component that initializes the WebGL context. Wrap all your `<WebglHoverImage>` components inside this.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `durationIn` | `number` | `0.8` | Duration of hover-in animation (seconds) |
| `durationOut` | `number` | `0.8` | Duration of hover-out animation (seconds) |
| `easeIn` | `string` | `'power2.out'` | GSAP easing for hover-in |
| `easeOut` | `string` | `'power2.out'` | GSAP easing for hover-out |
| `intensity` | `number` | `1` | Displacement intensity |
| `displacementAngle` | `number` | `0` | Displacement direction (degrees) |
| `zoom` | `number` | `0` | Zoom amount on hover (0-1) |
| `imageRotation` | `number` | `0` | Image rotation on hover (degrees) |
| `noiseSpeed` | `number` | `0.5` | Noise animation speed |
| `noiseScale` | `number` | `6.0` | Noise texture scale |
| `rgbShiftIntensity` | `number` | `0` | RGB shift/chromatic aberration intensity |
| `debug` | `boolean` | `false` | Show debug panel (lil-gui) |

### `<WebglHoverImage>`

Individual image component with hover effect.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `texture0` | `string` | Yes | Default image URL |
| `texture1` | `string` | Yes | Hover image URL |
| `map` | `string` | Yes | Displacement map URL |

All props from `<WebglHoverImages>` can also be passed to individual `<WebglHoverImage>` components to override the global settings.

## Displacement Maps

The `map` prop accepts a grayscale image that controls the displacement effect. You can find free displacement maps at:

- [Grayscale displacement textures](https://github.com/robin-dela/hover-effect/tree/master/images)
- Create your own using Photoshop/GIMP noise filters

## Debug Mode

Enable `debug={true}` on `<WebglHoverImages>` to show a control panel where you can adjust all parameters in real-time.

```astro
<WebglHoverImages debug={true}>
  <!-- ... -->
</WebglHoverImages>
```

## Advanced Usage

You can also import the library directly for more control:

```typescript
import { initWebglHover, WebglHover } from '@ivanalbizu/astro-webgl-hover';

// Initialize manually
const instances = initWebglHover();

// Control individual instances
instances[0].setProgress(0.5);
instances[0].destroy();
```

## Performance

The library includes several optimizations:

- Fallback for low-performance devices
- Render loop pauses when not animating
- Debounced resize handler
- Optimized mesh segments

## Browser Support

Requires WebGL support. Falls back to static images on unsupported devices.

## License

MIT
