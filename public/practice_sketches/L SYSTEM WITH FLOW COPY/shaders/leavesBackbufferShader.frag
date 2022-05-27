
precision highp float;


uniform vec2 resolution;
uniform float time;
uniform sampler2D currentBuffer;
uniform sampler2D backbuffer;

varying vec2 vTexCoord;

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec3 current = texture2D(currentBuffer, uv).rgb;
  
  vec3 back = texture2D(backbuffer, uv).rgb;
  outCol += current + back * 0.95; 
  float gs = (outCol.r + outCol.g + outCol.r) / 3.0;
  gl_FragColor = vec4(outCol, step(gs, 0.9));
}