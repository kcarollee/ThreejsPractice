#version 100
#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform sampler2D mainTex;
uniform sampler2D dispTex;

varying vec2 vTexCoord;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}


void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;
  vec3 outCol = vec3(.0);
  
  vec3 dispTexCol = texture2D(dispTex, uv).rgb;
  float modVal = dispTexCol.r;
  modVal = pow(modVal, 2.0);
  vec2 uvMod = uv + vec2(modVal * 0.01);
  vec2 uvMod2 = uv + vec2(modVal * 0.012);
  vec2 uvMod3 = uv + vec2(modVal * 0.015);
  
  vec3 mainTexCol = texture2D(mainTex, uvMod).rgb;
  vec3 mainTexCol2 = texture2D(mainTex, uvMod2).rgb;
  vec3 mainTexCol3 = texture2D(mainTex, uvMod3).rgb;

  
  outCol += vec3(mainTexCol.r, mainTexCol2.g, mainTexCol3.b);
  gl_FragColor = vec4(outCol, 1.0);
}