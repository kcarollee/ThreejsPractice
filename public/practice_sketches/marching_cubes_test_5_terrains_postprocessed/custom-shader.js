THREE.CustomShader = {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        "texDiv": {type: "f", value: 100.0},
        


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
        uniform float texDiv;

        // pass in the image/texture we'll be modifying
        uniform sampler2D tDiffuse;

        // used to determine the correct texel we're working on
        varying vec2 vUv;

  
        float lines(vec2 uv, float gval){
            float greyStep = 10.0;
            gval = float(floor(gval * greyStep));
            return step(0.5, sin(uv.x * gval));
        }

        float lines2(vec2 uv, float gval){
            float greyStep = 10.0;
            gval = float(floor(gval * greyStep));
            return step(0.5, sin(uv.x * gval));
        }

        float circle(vec2 uv,float gval){
            float greyStep = 10.0;
            gval = float(floor(gval * greyStep))  / greyStep;
            return 1.0 - smoothstep(gval - 0.2, gval + 0.2, length(uv - vec2(0.5, 0.5)));
            //return 1.0 - step(gval, length(uv - vec2(0.5, 0.5)));
        }
        

        
        float tileViewer(vec2 uv, float funcVal){
            float v = 0.1;
            return v;
        }
        
        // executed, in parallel, for each pixel
        void main() {

        

        vec2 uvo = vUv; // original uv coords
        vec3 outCol = vec3(.0);
        float m = 0.1; // pixelate coef
        float divNum = texDiv;
        float gridDim = 1.0 / divNum;
        uvo.x = float(floor(uvo.x * divNum)) * gridDim;
        uvo.y = float(floor(uvo.y * divNum)) * gridDim;

        // get the pixel from the texture we're working with (called a texel)
        vec4 texel = texture2D( tDiffuse, uvo );
        vec4 texel2 = texture2D( tDiffuse, vec2(uvo.x + 1.0, uvo.y));
        float rm = 0.25;
        float gm = 0.95;
        float bm = 0.35;
        float mGreyVal = (texel.r * rm + texel.g * gm + texel.b * bm) / 3.0;

        float greyVal = texel.r;
        vec2 uvm = (vUv - uvo) * divNum; // modified uv coord.
        outCol += circle(uvm,mGreyVal);

        vec2 uv2 = vUv;
        uv2.x = float(floor(uv2.x * 10.0)) * 0.1;
        uv2.y = float(floor(uv2.y * 10.0)) * 0.1;
        for (float i = 0.0; i < 10.0; i++){
            if (abs(uv2.y - 0.5) < 0.001) {
                outCol = vec3(.0);
                outCol.r += circle((vUv - uv2) * 10.0, 0.1 * i);

            }
        }
       // outCol.r += circle(vec2(uvm.x - 0.5, uvm.y), mGreyVal);
       // outCol.bg += circle(vec2(uvm.x + 0.5, uvm.y + 0.5), mGreyVal * 0.5);
        // return this new color
        gl_FragColor = vec4( outCol * texture2D(tDiffuse, uvo).rgb, 1.0 );

        }
    `
    ].join("\n")

};