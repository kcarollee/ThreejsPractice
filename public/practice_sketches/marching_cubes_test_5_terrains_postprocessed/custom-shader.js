THREE.CustomShader = {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        "rPower": {type: "f", value: 0.0126},
        "gPower": {type: "f", value: 0.6152},
        "bPower": {type: "f", value: 0.0722},


    },

    // 0.2126 R + 0.7152 G + 0.0722 B
    // vertexshader is always the same for postprocessing steps
    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        // pass in our custom uniforms
        "uniform float rPower;",
        "uniform float gPower;",
        "uniform float bPower;",


        // pass in the image/texture we'll be modifying
        "uniform sampler2D tDiffuse;",

        // used to determine the correct texel we're working on
        "varying vec2 vUv;",

        "float greyBasedVal(vec2 uv, vec2 uv2, float d){",
            "float v;",
            "return v;",
        "}",

        "float circle(vec2 uv,float gval){",
            "return 1.0 - step(gval, length(uv - vec2(0.5, 0.5)));",
        "}",

        // executed, in parallel, for each pixel
        "void main() {",

        

        "vec2 uvo = vUv;", // original uv coords
        "vec3 outCol = vec3(.0);",
        "float m = 0.1;", // pixelate coef
        "float divNum = 200.0;",
        "float gridDim = 1.0 / divNum;",
        "uvo.x = float(floor(uvo.x * divNum)) * gridDim;",
        "uvo.y = float(floor(uvo.y * divNum)) * gridDim;",

        // get the pixel from the texture we're working with (called a texel)
        "vec4 texel = texture2D( tDiffuse, uvo );",

        "float greyVal = texel.r;",
        "vec2 uvm = (vUv - uvo) * divNum;", // modified uv coord.
        "outCol += circle(uvm, greyVal);",
        // return this new color
        "gl_FragColor = vec4( outCol, 1.0 );",

        "}"

    ].join("\n")

};