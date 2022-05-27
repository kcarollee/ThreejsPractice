
precision highp float;


uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 texcol = texture2D(texture, vec2(uv.x, 1.0 - uv.y)).rgb; 
  texcol = vec3((texcol.r + texcol.g + texcol.b) / 3.0);
  vec2 center = vec2(0.5);
  float d = length(uv - center);
  outCol += texcol; 
  if (d > 0.5) discard;
  //float circles = sin(d * 50.0 + time * 10.0);
  //circles = step(circles, .0);
  //else outCol += texcol; 
  //outCol += vec3(circles);
  gl_FragColor = vec4(outCol, 1.0);
}