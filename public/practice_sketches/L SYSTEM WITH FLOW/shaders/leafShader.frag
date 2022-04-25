
precision highp float;


uniform vec2 resolution;
uniform float time;


void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec2 center = vec2(0.5);
  float d = length(uv - center);
  if (d > 0.5) discard;
  float circles = sin(d * 50.0 + time * 10.0);
  circles = step(circles, .0);
  
  outCol += vec3(circles);
  gl_FragColor = vec4(outCol, 1.0);
}