#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592

uniform vec2 resolution;
uniform float time;

float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy),       f.x), f.y);
}

float metaball(vec2 uv, vec2 pos){
	float dist = length(uv - pos);
    float val = 0.01 / pow(dist, 1.2);
   // val = smoothstep(0.1, 0.9, val);
    return val;
}

void main(){
	  vec2 uv = gl_FragCoord.xy / resolution.xy;
  	
    vec3 outCol = vec3(.0);

    
    float nc = 10.0;
    for (float i = .0; i < 10.0; i++){
        float nx = noise(vec2(uv.x * nc + time + i, uv.y * nc + time + i));
        float ny = noise(vec2(uv.x * nc + time * 2.0 + i, uv.y * nc + time * 2.0 + i));
        vec2 npos = vec2(nx, ny);
        outCol += metaball(uv, npos);
    }
    

    /*
    float nc2 = 1.0;
    float max = 0.0;
    for (float i = .0; i < 10.0; i++){
        float nx = noise(vec2(uv.x * nc2 + time + i, uv.y * nc2 + time + i));
        float ny = noise(vec2(uv.x * nc2 + time + i , uv.y * nc2 + time + i));
        vec2 npos = vec2(nx, ny);
        float m = metaball(uv, npos);
        if (m > max) max = m;
        //outCol += metaball(uv, npos);
    }
    outCol += max;
*/
  	gl_FragColor = vec4(outCol, 1.0);
}