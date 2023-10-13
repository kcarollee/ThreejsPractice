#version 100
#ifdef GL_ES
precision highp float;
#endif

#define PI 3.141592

uniform vec2 resolution;
uniform float time;

uniform sampler2D dispTargetTex;
uniform sampler2D dispSourceTex;
uniform float dispStrength;
uniform bool flipY;
varying vec2 vTexCoord;

// https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main(){
    
    vec2 uv = vTexCoord;
    if (flipY) uv.y = 1.0 - uv.y;
   
    // dispSourceTex
    vec4 nd = texture2D(dispSourceTex, uv);
    float dx = nd.r;
    float dy = nd.g;

    dx = map(dx, .0, 1.0, -dispStrength, dispStrength);
    dy = map(dy, .0, 1.0, -dispStrength, dispStrength);

    vec2 disp = vec2(dx, dy);
    // dispTargetTex
    vec4 ng = texture2D(dispTargetTex, uv + disp);

    gl_FragColor = vec4(ng.rgb, 1.0);
}