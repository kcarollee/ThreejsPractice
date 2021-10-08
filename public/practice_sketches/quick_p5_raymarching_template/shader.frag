#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592
#define MAX_STEPS 100
#define SURFACE_DIST 0.001
#define MAX_DIST 100.
#define OCTAVE_NUM 8

uniform vec2 resolution;

float opSub(float d1, float d2){
  return max(d1, -d2);
}
float opUnion(float d1, float d2){
  return min(d1, d2);
}
float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float NoiseSphere(vec3 p, vec3 pos, float r){
  return length(p - pos) - r;
}

float GetDistanceFromScene(vec3 p){
  float final = 100000.0;
  float s1 = NoiseSphere(p, vec3(.0), 1.0);

  final = opUnion(final, s1);
  return final;
}

// ray march
float RayMarch(vec3 rayOrig, vec3 rayDir){
  float dist = 0.0;
  for (int i = 0; i < MAX_STEPS; i++){
    vec3 p = rayOrig + dist * rayDir; // new starting point
    float distScene = GetDistanceFromScene(p);
    dist += distScene;
    if (distScene < SURFACE_DIST || dist > MAX_DIST) break;
  }
  return dist;
}



// normals and lights
vec3 Normal(vec3 p){
  float a = 0.01;
  float dist = GetDistanceFromScene(p);
  vec3 norm = vec3(
    dist - GetDistanceFromScene(p - vec3(a, 0, 0)),
    dist - GetDistanceFromScene(p - vec3(0, a, 0)),
    dist - GetDistanceFromScene(p - vec3(0, 0, a))
  );
  return normalize(norm);
}

vec3 DiffuseLight(vec3 p, vec3 rayDir, float d){
  
  if (d > MAX_DIST * 0.2) return vec3(.0);

  vec3 normal = Normal(p);
  
  vec3 lightCol = vec3(1.0);
  vec3 lightPos = vec3(.0, .0, -2.0);
  vec3 lightDir = normalize(lightPos - p);
  float difLight = clamp(dot(normal, lightDir), .0, 1.0) / clamp(pow(d, 0.001), 0.75, MAX_DIST * 0.5); // clamp the value between 0 and 1
  
  //float shadowVal = RayMarch(p + normal * SURFACE_DIST, lightDir);
  //if (shadowVal < length(lightPos - p)) difLight *= 0.0;
    
  //if (difLight < .001) return vec3(2.0 * sin(ns * 10.0))/ clamp(pow(d, 2.0), 1.5, MAX_DIST);
  
  vec3 specLight = vec3(0.1);

  return (lightCol * difLight + specLight);

}


void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  vec2 st = gl_FragCoord.xy / resolution.xy * 10.0;
  vec3 outCol = vec3(0.0);

  vec3 color = vec3(1.0, .0, .0);

  // camera
  vec3 rayOrigin = vec3(0, 0, -5);
  vec3 rayDir = normalize(vec3(uv.x, uv.y, 1.0));

  float d = RayMarch(rayOrigin, rayDir);

  vec3 p = rayOrigin + rayDir * d;
  vec3 light = DiffuseLight(p, rayDir, d);

  outCol = vec3(light);
  
  gl_FragColor = vec4(outCol, 1.0);
}