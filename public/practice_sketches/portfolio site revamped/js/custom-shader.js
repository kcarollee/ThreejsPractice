const CustomShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        texDiv: { type: "f", value: 170.0 },
        colorMode: { type: "f", value: 0.0 },
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
    `,
    ].join("\n"),

    fragmentShader: [
        `
        #ifdef GL_ES
        precision highp float;
        #endif
       

        // pass in the image/texture we'll be modifying
        uniform sampler2D tDiffuse;

        const float ditherMatrix[16] = float[16](
            1.0,  9.0,  3.0, 11.0,
            13.0,  5.0, 15.0,  7.0,
            4.0, 12.0,  2.0, 10.0,
            16.0,  8.0, 14.0,  6.0
        );

        // Function to get the dither value based on screen position
        float getDitherValue(ivec2 pixelPos) {
            int index = (pixelPos.y % 4) * 4 + (pixelPos.x % 4); // 4x4 matrix indexing
            return ditherMatrix[index] / 17.0;                  // Normalize to [0, 1]
        }


        // used to determine the correct texel we're working on
        varying vec2 vUv;
        

       
        void main() {
            vec4 textureIn = texture2D(tDiffuse, vUv);
            vec3 outCol = vec3(.0);
            ivec2 pixelPos = ivec2(gl_FragCoord.xy);
            float ditherValue = getDitherValue(pixelPos);
            float ditherScale = 0.7;
            float threshold = ditherValue * ditherScale;
            float ditheredRed = textureIn.r + threshold;
            // Quantize to nearest intensity step
            float quantizedRed = step(0.75, ditheredRed);

            outCol = vec3(quantizedRed);
            gl_FragColor = vec4( outCol , 1.0 );
        }
    `,
    ].join("\n"),
};
