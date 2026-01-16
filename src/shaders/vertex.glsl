#ifdef GL_ES
precision mediump float;
#endif

// those are the mandatory attributes that the lib sets
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

// those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat4 texture0Matrix;
uniform mat4 texture1Matrix;
uniform mat4 mapMatrix;

// if you want to pass your vertex and texture coords to the fragment shader
varying vec3 vVertexPosition;
varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying vec2 vTextureCoordMap;

void main() {
  vec3 vertexPosition = aVertexPosition;

  gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

  // set the varyings
  vTextureCoord0 = (texture0Matrix * vec4(aTextureCoord, 0., 1.)).xy;
  vTextureCoord1 = (texture1Matrix * vec4(aTextureCoord, 0., 1.)).xy;
  vTextureCoordMap = (mapMatrix * vec4(aTextureCoord, 0., 1.)).xy;
  vVertexPosition = vertexPosition;
}
