#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform sampler2D tex;
uniform bool flipY;
uniform float time;
uniform float sinDensity;
varying vec2 vTexCoord;


void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  if (flipY) uv.y = 1.0 - uv.y;
  vec3 texCol = texture2D(tex, uv).rgb;
  float g = sin(texCol.r * sinDensity + time);
  if (texCol.r < 0.05) discard;
  else outCol = vec3(g);
  //outCol = vec3(step(0.7, outCol.r));
  gl_FragColor = vec4(outCol, 1.0);
}