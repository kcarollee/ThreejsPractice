#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform float weightOffsetsX[129];
uniform float weightOffsetsY[129];
uniform int numSamples;
uniform bool flipY;
uniform bool isSecondPass;
uniform float passNum;
uniform sampler2D tex;
varying vec2 vTexCoord;

vec4 GaussianBlur( sampler2D tex0, vec2 uv, vec2 pixelOffset )
{
	vec4 colOut = vec4(0.);
  int ns = numSamples;
	for( int i = 0; i < 129; i++ )
	{
		// slower but can be used if more than 1022 samples needed
		//vec2 weightOffset = texelFetch(weightOffsets, i).st;

		vec2 texCoordOffset = weightOffsetsY[i] * pixelOffset * 0.25;
		vec4 col = texture2D( tex0, uv + texCoordOffset ) + 
					texture2D( tex0, uv - texCoordOffset );
		colOut += weightOffsetsX[i] * col;                                                                              
	}

	return colOut;  
}

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  if (flipY) uv.y = 1.0 - uv.y;
  vec3 texCol = texture2D(tex, uv).rgb;
  
  float spread = 2.0;
  vec2 texelSize = vec2(0.0005);
  vec2 offset = texelSize * spread;

  vec4 gb = GaussianBlur(tex, uv, vec2(.0, 1.0 / resolution.y));
  if (isSecondPass) gb = GaussianBlur(tex, uv, vec2(.0, 1.0 / resolution.y));
  else gb = GaussianBlur(tex, uv, vec2(1.0 / resolution.x, .0));

  gl_FragColor = vec4(gb.rgb, 1.0);
}