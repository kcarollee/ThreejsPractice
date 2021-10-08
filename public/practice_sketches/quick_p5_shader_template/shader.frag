#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592

uniform vec2 resolution;



void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution;
  
  gl_FragColor = vec4(outCol, 1.0);
}