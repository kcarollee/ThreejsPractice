#version 100
#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform sampler2D mainTex;
uniform vec2 mouse;

varying vec2 vTexCoord;

vec4 pixel(sampler2D texture, vec2 uv) {
  return texture2D(texture, uv);
}

vec2 get_offset_coord(vec2 offset){
  vec2 uv = (gl_FragCoord.xy + offset) / resolution;
  vec2 origuv  = (gl_FragCoord.xy) / resolution;
  return origuv + offset;
}


void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;
  
  float mdist = length(mouse - uv);

  float xDivNum = 150.0;
  float yDivNum = 150.0;
  float xGridDim = 1.0 / xDivNum;
  float yGridDim = 1.0 / yDivNum;

  float gxIndex = floor(xGridDim * uv.x * xDivNum);
  float gyIndex = floor(yGridDim * uv.y * yDivNum);

  vec2 offset = get_offset_coord(vec2(gxIndex, gyIndex));
  
  vec2 uvc = uv;
  uvc.x = float(floor(uvc.x * xDivNum)) * xGridDim;
  uvc.y = float(floor(uvc.y * yDivNum)) * yGridDim;

  
  
  //vec2 posShift = vec2(xGridDim * gxIndex, yGridDim * gyIndex);
  
  vec3 texCol = pixel(mainTex, uvc).rgb;


  gl_FragColor = vec4(texCol, 1.0);
}