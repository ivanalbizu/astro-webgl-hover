#ifdef GL_ES
precision mediump float;
#endif

#define PI2 6.28318530718
#define PI 3.14159265359
#define S(a,b,n) smoothstep(a,b,n)

uniform float uTime;
uniform float uProgress;
uniform vec2 uReso;
uniform vec2 uMouse;
uniform vec2 uDisplacement;
uniform float uZoom;
uniform float uRotation;
uniform float uNoiseSpeed;
uniform float uNoiseScale;
uniform float uRgbShift;
uniform vec2 uTex1Scale;

// get our varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying vec2 vTextureCoordMap;

// the uniform we declared inside our javascript

// our texture sampler (default name, to use a different name please refer to the documentation)
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D map;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// http://www.flong.com/texts/code/shapers_exp/
float exponentialEasing (float x, float a){

  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  a = max(min_param_a, min(max_param_a, a));

  if (a < 0.5){
    // emphasis
    a = 2.0 * a;
    float y = pow(x, a);
    return y;
  } else {
    // de-emphasis
    a = 2.0 * (a-0.5);
    float y = pow(x, 1.0 / (1.-a));
    return y;
  }
}

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main(){
  vec2 uv0 = vTextureCoord0;
  vec2 uv1 = vTextureCoord1;

  vec2 center = vec2(0.5);
  uv0 = (uv0 - center) * (1.0 / uZoom) * rotate(uRotation) + center; // texture0 uses the plane's aspect ratio
  uv1 = (uv1 - center) * uTex1Scale * (1.0 / uZoom) * rotate(uRotation) + center; // texture1 is corrected

  float progress0 = uProgress;
  float progress1 = 1. - uProgress;

  vec4 map = blur13(map, vTextureCoordMap, uReso, vec2(2.)) + 0.5;

  float noise = snoise(vTextureCoordMap * uNoiseScale + vec2(uTime * uNoiseSpeed));
  vec2 organicDisplacement = uDisplacement * (1.0 + noise * 0.5);

  uv0 += progress0 * map.r * organicDisplacement;
  uv1 -= progress1 * map.r * organicDisplacement;

  vec2 shift = uDisplacement * uRgbShift * 0.01;

  vec4 c0 = texture2D(texture0, uv0);
  float r0 = texture2D(texture0, uv0 + shift).r;
  float b0 = texture2D(texture0, uv0 - shift).b;
  vec4 color = vec4(r0, c0.g, b0, c0.a);

  vec4 c1 = texture2D(texture1, uv1);
  float r1 = texture2D(texture1, uv1 + shift).r;
  float b1 = texture2D(texture1, uv1 - shift).b;
  vec4 color1 = vec4(r1, c1.g, b1, c1.a);

  gl_FragColor = mix(color, color1, progress0 );          
}
