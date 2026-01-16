/**
 * Funciones utilitarias para WebGL Hover
 */

export function getAttributeAsFloat(
  element: Element,
  attribute: string,
  defaultValue: number
): number {
  const value = element.getAttribute(attribute);
  return value !== null ? parseFloat(value) : defaultValue;
}

export function getAttributeAsString(
  element: Element,
  attribute: string,
  defaultValue: string
): string {
  return element.getAttribute(attribute) || defaultValue;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDisplacementVector(
  intensity: number,
  angleInDegrees: number
): [number, number] {
  const angleRad = degreesToRadians(angleInDegrees);
  return [intensity * Math.cos(angleRad), intensity * Math.sin(angleRad)];
}

export function calculateTextureScale(
  planeWidth: number,
  planeHeight: number,
  textureWidth: number,
  textureHeight: number
): [number, number] {
  const planeRatio = planeWidth / planeHeight;
  const textureRatio = textureWidth / textureHeight;

  let scaleX = 1.0;
  let scaleY = 1.0;

  if (planeRatio > textureRatio) {
    scaleX = planeRatio / textureRatio;
  } else {
    scaleY = textureRatio / planeRatio;
  }

  return [scaleX, scaleY];
}
