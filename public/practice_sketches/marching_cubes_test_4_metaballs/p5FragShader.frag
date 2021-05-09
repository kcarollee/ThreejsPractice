#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592

uniform vec2 resolution;
float metaball(vec2 uv){
	float v;
	return v;
}

void main(){
	vec2 uv = gl_FragCoord.xy / resolution.xy;
  	vec3 outCol = vec3(uv.x, uv.y, .5);
  
  	gl_FragColor = vec4(outCol, 1.0);
}