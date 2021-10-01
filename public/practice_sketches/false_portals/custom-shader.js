THREE.CustomShader = {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        "resolution": {value: [window.innerWidth, window.innerHeight]},
        "renderTarget": {type: "t", value: null}

    },

    // 0.2126 R + 0.7152 G + 0.0722 B
    // vertexshader is always the same for postprocessing steps
    vertexShader: [
    `
        varying vec2 vUv;

        void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        }
    `
    ].join("\n"),

    fragmentShader: [
    `
        #ifdef GL_ES
        precision highp float;
        #endif
        // pass in our custom uniforms
        

        // pass in the image/texture we'll be modifying
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform sampler2D renderTarget;
        // used to determine the correct texel we're working on
        varying vec2 vUv;
        //https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
        

        float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p){
    float fl = floor(p);
  float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}
    
float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
        vec2 pc(vec2 d){
            vec2 uv = (gl_FragCoord.xy - d) / resolution.xy;
            //uv.y = 1.0 - uv.y;
            
            return uv;
        }

        vec3 bloom(){
            float bloomStrength = 10.0;
            float bloomIntensity = 20.0;
            float d = 2.0;
            float bloomCoef = 1.0;
            vec3 sum = vec3(.0);

            for (float i = 1.0; i < 10000.0; i++){
                if (i > bloomStrength) break;
                sum += texture2D(renderTarget, pc(vec2(i * d, .0))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(-i * d, .0))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(.0, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(.0, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(i * d, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(-i * d, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(i * d, i * d))).rgb / (bloomIntensity * i * bloomCoef);
                sum += texture2D(renderTarget, pc(vec2(-i * d, -i * d))).rgb / (bloomIntensity * i * bloomCoef);
            }
            return sum;
        }

        bool bloomCondition(vec2 uv){
            vec3 tex = texture2D(tDiffuse, pc(uv)).rgb;
            float r = tex.r;
            float g = tex.g;
            float b = tex.b;

            if (r == .0 && g == .0 && b > 0.1) return true;
            else return false;
        }

        vec3 bluebloom(){
            float bloomStrength = 10.0;
            float bloomIntensity = 0.001;
            vec3 sum = vec3(.0);
            for (float i = 1.0; i < 10.0; i++){
                
                if (bloomCondition(vec2(i, .0))) sum += texture2D(tDiffuse, pc(vec2(i, .0))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(-i, .0))) sum += texture2D(tDiffuse, pc(vec2(-i, .0))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(.0, i))) sum += texture2D(tDiffuse, pc(vec2(.0, i))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(.0, -i))) sum += texture2D(tDiffuse, pc(vec2(.0, -i))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(i, -i))) sum += texture2D(tDiffuse, pc(vec2(i, -i))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(-i, i))) sum += texture2D(tDiffuse, pc(vec2(-i, i))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(i, i))) sum += texture2D(tDiffuse, pc(vec2(i, i))).rgb / (bloomIntensity * i);
                if (bloomCondition(vec2(-i, -i))) sum += texture2D(tDiffuse, pc(vec2(-i, -i))).rgb / (bloomIntensity * i);
            }

            return sum;
        }

        void main() {

        

            vec2 uvo = vUv; // original uv coords
            vec3 outCol = vec3(.0);
            vec3 os = texture2D(tDiffuse, uvo).rgb; //  original scene
            vec3 rts = texture2D(renderTarget, uvo).rgb; // render target scene
            vec3 rtsg = vec3(rts.b);
            vec3 blm = bloom();
            vec3 blmg = vec3(blm.b);
            
            vec3 portalBloom = rts + blm;
            portalBloom = vec3(portalBloom.b);
            
            outCol = os;
            if (os.r == 1.0 && os.g == .0 && os.b == .0) {
                outCol = rts;
            }
            if (outCol.b == 1.0) outCol = vec3(1.0);
            if (outCol.r == outCol.g) {
               outCol += blmg;
            }

            if (outCol.g > .0 && outCol.r != outCol.g){
                outCol = vec3(1.0, sin(outCol.g), 1.0 - cos(outCol.g));
            }
            //outCol = rts;

            //if (outCol.r <0.15 && outCol.g <0.15 && outCol.b <0.15) outCol = vec3(0.25);
            gl_FragColor = vec4( outCol , 1.0 );

        }
    `
    ].join("\n")

};