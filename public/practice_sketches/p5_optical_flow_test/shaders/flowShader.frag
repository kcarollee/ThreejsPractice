
precision mediump float;
//#define TINY 0.000001

uniform vec2 resolution;

uniform sampler2D tex0;
uniform sampler2D tex1;
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
  uv.y = 1.0 - uv.y;
  /*
  // https://github.com/moostrik/ofxFlowTools/blob/master/src/core/opticalflow/ftOpticalFlowShader.h
  vec2 off_x = vec2(offset, 0.0);
	vec2 off_y = vec2(0.0, offset);
	
	//get the difference
	float scr_dif = texture2D(tex0, uv).x - texture2D(tex1, uv).x;
	vec3 t1  = texture2D(tex0, uv).rgb;
  vec3 t2 = texture2D(tex1, uv).rgb;
  float g1 = (t1.r + t1.g + t1.b) / 3.0;
  float g2 = (t2.r + t2.g + t2.b) / 3.0;

	//calculate the gradient
	float gradx; float grady; float gradmag; 
	gradx =  texture2D(tex1, get_offset_coord(off_x)).x - texture2D(tex1, get_offset_coord(off_x * -1.0)).x;
	gradx += texture2D(tex0, get_offset_coord(off_x)).x - texture2D(tex0, get_offset_coord(off_x * -1.0)).x;
	grady =  texture2D(tex1, get_offset_coord(off_y)).x - texture2D(tex1, get_offset_coord(off_y * -1.0)).x;
	grady += texture2D(tex0, get_offset_coord(off_y)).x - texture2D(tex0, get_offset_coord(off_y * -1.0)).x;
  
	gradmag = sqrt((gradx*gradx)+(grady*grady)+TINY);
	
  
	vec2 flow;
	flow.x = scr_dif*(gradx/gradmag);
	flow.y = scr_dif*(grady/gradmag);
	
  
	// apply force (to normalize)
	flow *= force;
	
	// apply treshold and clamp
	float magnitude = length(flow);
  
	magnitude = max(magnitude, threshold);
	magnitude -= threshold;
	magnitude /= (1.0 - threshold);
	magnitude = pow(magnitude, power);
  
  
	flow += TINY; // flow length cannot be 0 for normalization to work on windows
	flow = normalize(flow) * vec2(min(max(magnitude, 0.0), 1.0));
  

  outCol.rg += flow;
  */
  vec2 of = opticalFlow(uv, tex0, tex1, offset / resolution.y, 0.001);
  outCol.rg = of;
 
  gl_FragColor = vec4(outCol, 1.0);
}