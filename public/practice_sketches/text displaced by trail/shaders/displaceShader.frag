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
uniform bool postProcessOn;
uniform bool backgroundMode;
varying vec2 vTexCoord;

// https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){
    
    vec2 uv = vTexCoord;
    vec2 uvOrig = vTexCoord;
    if (flipY) uv.y = 1.0 - uv.y;
    
    // dispSourceTex
    vec4 nd = texture2D(dispSourceTex, uv);
    float dx = nd.r;
    float dy = nd.g;

    dx = map(dx, .0, 1.0, -dispStrength, dispStrength);
    dy = map(dy, .0, 1.0, -dispStrength, dispStrength);

    vec2 disp = vec2(dx, dy);
    // grainy texture
    if (postProcessOn ||backgroundMode){
        float random = rand(vec2(uv.x, uv.y)); 
        uv += vec2(random * 0.01);
    }
    // dispTargetTex
    vec2 newUV = uv + disp;
    vec4 ng = texture2D(dispTargetTex, newUV);

    if (backgroundMode) {
        float gap = 0.4;
        float random = rand(vec2(uv.x, uv.y)); 
        newUV += vec2(random * 0.01);
        if (newUV.x > 1.0 - gap || newUV.x < gap) ng.rgb = vec3(.0);
    }

    if (postProcessOn){
        float rr = rand(vec2(uv.x + 13.0, uv.y + 289.0));
        float rg = rand(vec2(uv.x + 179.0, uv.y + 17.0));
        float rb = rand(vec2(uv.x + 179.0, uv.y + 17.0));
        ng.rgb += vec3(rr, rg, rb) * 0.05;
        if (ng.r < 0.5) discard;
    }

    if (backgroundMode){
        ng.rgb = vec3(sin(ng.r * 100.0));
        ng.rgb = vec3(step(0.5, ng.r));
        
        float rr = rand(vec2(uvOrig.x + 13.0, uvOrig.y + 289.0));
        float rg = rand(vec2(uvOrig.x + 179.0, uvOrig.y + 17.0));
        float rb = rand(vec2(uvOrig.x + 11.0, uvOrig.y + 97.0));
        //ng.rgb *= 0.05;
        
        //ng.rgb *= 0.5;
        //if (ng.r < 0.5) discard;
        ng.rgb += vec3(rr, rg, rb) * 0.25;
        //ng.rgb += vec3(rr * 0.1);
        ng.rgb *= 0.1;
        
    }
    
    
    gl_FragColor = vec4(ng.rgb, 1.0);
}