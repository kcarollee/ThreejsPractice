
precision highp float;
//#define TINY 0.000001

uniform vec2 resolution;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D backbuffer;
uniform float offset;
uniform float threshold;
uniform vec2 force;
uniform float power;

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
  return origuv + offset;
}


void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 ouv = uv;
  uv.x = 1.0 - uv.x;
  uv.y = 1.0 - uv.y;
  
  vec2 of = opticalFlow(uv, tex0, tex1, offset / resolution.y, 0.0);
  outCol.rg += of;
  ouv.y = 1.0 - ouv.y;
  
  vec3 bb = texture2D(backbuffer, ouv).rgb;
  outCol += bb * 0.95;

  //float g1 = texture2D(tex0, uv).r;
  //float g2 = texture2D(tex1, uv).r;
  //if (abs(g1 - g2) > 0.2) outCol += vec3(1.0);
  //outCol.r += g2;
  gl_FragColor = vec4(outCol, 1.0);
}