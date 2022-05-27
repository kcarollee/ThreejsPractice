#version 100
#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;

varying vec2 vTexCoord;

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  float circle = step(length(uv - vec2(0.5)), 0.25);
  outCol += circle;
  gl_FragColor = vec4(outCol, 1.0);
}