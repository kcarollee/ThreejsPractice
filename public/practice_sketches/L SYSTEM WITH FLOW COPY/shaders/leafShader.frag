
precision highp float;


uniform vec2 resolution;
uniform float time;


varying vec2 vTexCoord;

mat2 rotate(float deg){
  float s = sin(deg);
  float c = cos(deg);

  return mat2(c, -s, s, c);
}
void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  vec2 uvCopy = uv;
  /*
  uv.y -= 0.5;
  uv.x -= 0.5;
  uv = rotate(time * 10.0) * uv + vec2(0.5);
 */
  outCol = vec3(sin(uv.x + time), cos(uv.y + time * 2.0), 0.25);
  //outCol = vec3(1.0, .0, .0);
  gl_FragColor = vec4(outCol, 1.0);
}