THREE.CustomShader = {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        


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

        // used to determine the correct texel we're working on
        varying vec2 vUv;
        //https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
        

       
       
        void main() {

        

            vec2 uvo = vUv; // original uv coords
            vec3 outCol = texture2D(tDiffuse, uvo).rgb;

            if (outCol.r == 1.0 && outCol.g == .0) discard;
            gl_FragColor = vec4( outCol , 1.0 );

        }
    `
    ].join("\n")

};