#version 100
#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform float time;
varying vec2 vTexCoord;

float metaBall(vec2 uv, vec2 pos, float scale){
  float val = scale / length(uv - pos);
 
  return val;
}

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  float circle = metaBall(uv, vec2(0.5, 0.5), 0.01);
  float circle2 = metaBall(uv, vec2(0.5 +  0.25 * sin(time * 2.0), 0.5), 0.01);

  float angle = 0.0;
  float radius = 0.01;
  float coef = 0.01;
  for (int i = 0; i < 100; i++){
    angle += PI * 0.1;
    float x = 0.5 + radius * cos(angle);
    float y = 0.5 + radius * sin(angle);
    outCol += metaBall(uv, vec2(x, y), 0.003 + 0.001 * sin(time));
    radius += coef;
  }
  //outCol += circle + circle2;

  if (outCol.r > 0.9) outCol = vec3(1.0);
  else if (outCol.r > 0.8) outCol = vec3(0.73, 1.0, 0.4);
  else outCol = vec3(0.15, 0.68, 0.99);
  //outCol = step(0.9, outCol);
  gl_FragColor = vec4(outCol, 1.0);
}