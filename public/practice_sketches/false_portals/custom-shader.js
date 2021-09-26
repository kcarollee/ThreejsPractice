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
        
        vec2 pc(vec2 d){
            vec2 uv = (gl_FragCoord.xy - d) / resolution.xy;
            //uv.y = 1.0 - uv.y;
            
            return uv;
        }

        vec3 bloom(){
            float bloomStrength = 10.0;
            float bloomIntensity = 0.01;

            vec3 sum = vec3(.0);

            for (float i = 1.0; i < 10000.0; i++){
                if (i > bloomStrength) break;
                sum += texture2D(tDiffuse, pc(vec2(i, .0))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(-i, .0))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(.0, i))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(.0, -i))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(i, -i))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(-i, i))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(i, i))).rgb / (bloomIntensity * i);
                sum += texture2D(tDiffuse, pc(vec2(-i, -i))).rgb / (bloomIntensity * i);
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
            vec3 os = texture2D(tDiffuse, uvo).rgb; //  riginal scene
            vec3 rts = texture2D(renderTarget, uvo).rgb; // render target scene

            outCol = os;
            if (outCol.r == 1.0 && outCol.g == .0) outCol = vec3(.0);

            //outCol += bluebloom();

            outCol = rts;
            gl_FragColor = vec4( outCol , 1.0 );

        }
    `
    ].join("\n")

};