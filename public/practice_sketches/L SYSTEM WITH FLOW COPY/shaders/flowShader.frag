
precision highp float;
//#define TINY 0.000001

uniform vec2 resolution;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D backbuffer;
uniform float offset;
uniform float time;

varying vec2 vTexCoord;

// noise algorithm from: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

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

// https://github.com/keeffEoghan/glsl-optical-flow/blob/master/index.glsl

vec4 pixel(sampler2D texture, vec2 uv) {
        return texture2D(texture, uv);
    }
  
vec2 opticalFlow(vec2 uv, sampler2D next, sampler2D past,float offset,
        float lambda) {
    vec2 off = vec2(offset, 0.0);

    vec4 gradX = (pixel(next, uv+off.xy)-pixel(next, uv-off.xy))+
        (pixel(past, uv+off.xy)-pixel(past, uv-off.xy));

    vec4 gradY = (pixel(next, uv+off.yx)-pixel(next, uv-off.yx))+
        (pixel(past, uv+off.yx)-pixel(past, uv-off.yx));

    vec4 gradMag = sqrt((gradX*gradX)+(gradY*gradY)+vec4(lambda));

    vec4 diff = pixel(next, uv)-pixel(past, uv);

    return vec2((diff*(gradX/gradMag)).x, (diff*(gradY/gradMag)).x);
}

vec2 get_offset_coord(vec2 offset){
  vec2 uv = (gl_FragCoord.xy + offset) / resolution;
  vec2 origuv  = (gl_FragCoord.xy) / resolution;
  return uv;
}

vec3 get(float x, float y){
  
  //y = 1.0 - y; // uncomment to move smoke upwards
  //x = 10.0 * cos(time * 10.0) - y;
  //vec2 uv = (gl_FragCoord.xy + vec2(x,y)) / resolution;
  vec2 uv = vTexCoord + (vec2(x, y) / resolution);
  float n1 = noise(vec3(uv * 10.0, time));
  float n2 = noise(vec3(uv * 10.0, time + 14.0));
  n1 = map(n1, .0, 1.0, -1.0, 1.0);
  n2 = map(n2, .0, 1.0, -1.0, 1.0);

  uv.x += n1 * 0.01;

  uv.y = 1.0 - uv.y;
  uv.y += n2 * 0.01;
  return texture2D(backbuffer, uv).rgb;
}

vec3 diffuseFour(float f, float d){
  vec3 c = vec3(.0);
  c += f * (get(d, .0) + get(d, d) + get(d, -d) + 
            get(-d, .0) + get(-d, d) + get(-d, -d) + 
            get(.0, d) + get(.0, -d) - 8.0 * get(.0, .0));
  return c;
}


void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  vec2 ouv = uv;
  uv.x = 1.0 - uv.x;
  uv.y = 1.0 - uv.y;
  
  vec2 of = opticalFlow(uv, tex0, tex1, offset / resolution.y, 0.0);
  outCol.rg += of;
  ouv.y = 1.0 - ouv.y;
  
  float n1 = noise(vec3(uv * 10.0, time));
  float n2 = noise(vec3(uv * 10.0, time + 14.0));

  outCol += get(.0, .0);
  outCol += diffuseFour(0.2, 2.0);
  
  
  
  gl_FragColor = vec4(outCol, 1.0);
}