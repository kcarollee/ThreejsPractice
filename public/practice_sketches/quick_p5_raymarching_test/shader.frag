#ifdef GL_ES
precision highp float;
#endif
#define PI 3.141592
#define MAX_STEPS 500
#define SURFACE_DIST 0.001
#define MAX_DIST 200.
#define OCTAVE_NUM 8

uniform vec2 resolution;
uniform float time;

struct Surface{
    float sd;
    vec3 col;
};

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float opSub(float d1, float d2){
  return max(d1, -d2);
}
float opUnion(float d1, float d2){
  return min(d1, d2);
}

mat3 rotateX(float th){
  return mat3(
    1.0, .0, .0,
    .0, cos(th), -sin(th),
    .0, sin(th), cos(th) 
  );
}

mat3 rotateY(float th){
  return mat3(
    cos(th), .0, sin(th),
    .0, 1.0, .0,
    -sin(th), .0, cos(th) 
  );
}

mat3 rotateZ(float th){
  return mat3(
    cos(th), -sin(th), .0,
    sin(th), cos(th), .0,
    .0, .0, 1.0 
  );
}
float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}



float NoiseSphere(vec3 p, vec3 pos, float r){
  float ndensity = 1.0;
  float n = noise(p * ndensity + time * 0.01);
  float nheight = 0.12;
  n = map(n, .0, 1.0, -nheight, nheight);
  p += n;
  return length(p - pos) - r;
}

float sdBoxFrame( vec3 p, vec3 b, float e )
{

  p = abs(p  )-b;
  
  vec3 q = abs(p+e)-e;


  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

Surface sdBoxFrameSurface( vec3 p, vec3 b, float e, vec3 col)
{

  p = abs(p  )-b;
  
  vec3 q = abs(p+e)-e;


  float d =  min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));


    return Surface(d, col);
}


Surface sdNoiseBoxSurface( vec3 p, vec3 b, vec3 col)
{
  float n1 = map(noise(p * 2.0 + time * 0.05), .0, 1.0, -1.0, 1.0);
  n1 *= 0.2;
  b.xz += n1;
  
  vec3 q = abs(p) - b;
  
  float d = length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  return Surface(d, col);
}

Surface sdOctahedronSurface( vec3 p, float s, vec3 col)
{
  p = abs(p);
  float d = (p.x+p.y+p.z-s)*0.57735027;
  return Surface(d, col);
}

//https://www.shadertoy.com/view/fdlGWX

Surface minWithColor(Surface obj1, Surface obj2) {
  if (obj2.sd < obj1.sd) return obj2; // The sd component of the struct holds the "signed distance" value
  return obj1;
}

Surface smoothUnionWithColor( Surface d1, Surface d2, float k) {
    float h = clamp( 0.5 + 0.5*(d2.sd-d1.sd)/k, 0.0, 1.0 );
    float d = mix( d2.sd, d1.sd, h ) - k*h*(1.0-h); 
    vec3 col = mix(d2.col, d1.col, h) - k*h*(1.0-h);
    return Surface(d, col);
}

Surface sdXPlaneSurface(vec3 p, vec3 pos, vec3 col){
  float n = map(noise(p * 0.1 + time * 0.1), .0, 1.0, -1.0, 1.0);
  p.x += n * 10.0;

  float d = length(p.x - pos.x);

  return Surface(d, col);
}


Surface GetDistanceFromScene(vec3 p){
  

  Surface scene = Surface(9999999.0, vec3(.0));
  vec3 pcopy = p;

  //p += noise(p * 0.1);

/*
  float modgap = 15.0 + noise(p) * 10.0;
  p.y = mod(p.y, modgap);
  p.y -= modgap * 0.5;
*/
 
  

  /*
  vec3 dim = vec3(mod(time * 0.025, 5.0));
  Surface sbf = sdBoxFrameSurface(p, dim, 0.1, vec3(1.0));
  scene = minWithColor(scene, sbf);
  */


  float sbfNum = 3.0;

  for (float i = .0; i < 1000.0; i++){
    if (i >= sbfNum) break;

    p = pcopy;

    //p.y += 5.0 * sin(time * 0.01);
    p = rotateX(time * 0.01 + i) * p;
    p = rotateY(time * 0.01 + i) * p;
    
    //vec3 dim = vec3(mod(time * 0.025 + i, 5.0));
    vec3 dim = vec3(2.0 + 2.0 * sin(time * 0.025 + i));
    Surface sbf = sdBoxFrameSurface(p, dim, 0.1, vec3(1.0));
    

    
    scene = minWithColor(scene, sbf);
  }
  
  

  p = pcopy;
/*
  p.y = mod(p.y, modgap);
  p.y -= modgap * 0.5;
 
 */

  float fallLength = 30.0;
  float tickCount = floor(time * 0.05 / fallLength);
  float tick = mod(time * 0.05, fallLength);


  p = rotateZ(tickCount) * p; 
  p = rotateY(-time * 0.02) * p; 

  float r = 0.5 + 0.5 * sin(tickCount + 10.0);
  float g = 0.5 + 0.5 * cos(tickCount + 10.0);
  float b = 0.5 + 0.5 * tan(tickCount + 10.0);

 
  
  p.y += map(tick, .0, fallLength, -fallLength, fallLength);
  
  
  
  float sideDim = 1.0;
  Surface snb = sdNoiseBoxSurface(p, vec3(sideDim, fallLength * 0.5, sideDim), vec3(r,g,b));
  scene = smoothUnionWithColor(scene, snb, 3.0);




  return scene;
}

// ray march
Surface RayMarch(vec3 rayOrig, vec3 rayDir){
  float dist = 0.0;
  Surface co; // closest object
  for (int i = 0; i < MAX_STEPS; i++){
    vec3 p = rayOrig + dist * rayDir; // new starting point
    co = GetDistanceFromScene(p);
    dist += co.sd;
    if (co.sd < SURFACE_DIST || dist > MAX_DIST) break;
  }
  co.sd = dist;
  return co;
}



// normals and lights
vec3 Normal(vec3 p){
  float a = 0.01;
  float dist = GetDistanceFromScene(p).sd;
  vec3 norm = vec3(
    dist - GetDistanceFromScene(p - vec3(a, 0, 0)).sd,
    dist - GetDistanceFromScene(p - vec3(0, a, 0)).sd,
    dist - GetDistanceFromScene(p - vec3(0, 0, a)).sd
  );
  return normalize(norm);
}

vec3 DiffuseLight(vec3 p, vec3 rayDir, Surface co){
  
  if (co.sd > MAX_DIST ) {
    return vec3(1.0, .0, .0);
  }

  vec3 normal = Normal(p);
  
  vec3 lightCol = vec3(10.0);
  vec3 lightPos = vec3(.0, .0, -10.0);
  vec3 lightDir = normalize(lightPos - p);

  
  
  float difLight = clamp(dot(normal, lightDir), .0, 1.0) / clamp(pow(co.sd, 0.001), 0.75, MAX_DIST); // clamp the value between 0 and 1

  Surface refVal = RayMarch(p + normal * SURFACE_DIST, normal);
  if (refVal.sd > MAX_DIST) refVal.sd = .0;

  
  //float shadowVal = RayMarch(p + normal * SURFACE_DIST, lightDir);
  //if (shadowVal < length(lightPos - p)) difLight *= 0.0;
    
  //if (difLight < .001) return vec3(2.0 * sin(ns * 10.0))/ clamp(pow(d, 2.0), 1.5, MAX_DIST);
  
  vec3 viewDir = normalize(-rayDir);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(halfDir, normal), 0.0);
  float specular = pow(specAngle, 16.0);
  vec3 specLight = vec3(1.0);

  vec3 refSurface = vec3(refVal.sd);

  float refIntensity = 1.0;

  return (co.col * difLight + specLight * specular + refSurface * refIntensity);

}


void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  vec2 uvc = uv;
  float gap = 0.25 + 0.25 * sin(time * 0.01);
  if (uv.x > -gap && uv.x < gap && uv.y > -gap && uv.y < gap){
    //uv *= 0.5;
  }

  float tickCount = floor(time * 100.0);
  float tickMod = floor(mod(tickCount, 4.0));

  vec2 st = gl_FragCoord.xy / resolution.xy * 10.0;
  vec3 outCol = vec3(0.0);

  vec3 color = vec3(1.0, .0, .0);

  // camera
  vec3 rayOrigin = vec3(0, 0, -20);
  vec3 rayDir = normalize(vec3(uv.x, uv.y, 1.0));

  Surface d = RayMarch(rayOrigin, rayDir);

  vec3 p = rayOrigin + rayDir * d.sd;
  vec3 light = DiffuseLight(p, rayDir, d);

  outCol = vec3(light);

  if (uvc.x > -gap && uvc.x < gap && uvc.y > -gap && uvc.y < gap){
    outCol.r = 1.0 - outCol.r;
  }



  //if (mod(floor((uv.y + time) * 100.0), 2.0) == .0) outCol.r *= .0 ;
  gl_FragColor = vec4(outCol, 1.0);
}