// noiseGenShader -> generates noise to be displaced
// noiseDispShader -> generates noise to displace above noise
// displaceShader -> actually does the displacing

let noiseGenShader, displaceShader, displaceShader2;
let noiseGenFbo, noiseDispFbo, displaceFbo, displaceTextFbo, textFbo;
let sketchWidth, sketchHeight;
let font;
function preload() {
    noiseGenShader = loadShader('shaders/noiseGenShader.vert', 'shaders/noiseGenShader.frag');
    noiseDispShader = loadShader('shaders/noiseDispShader.vert', 'shaders/noiseDispShader.frag');
    displaceShader = loadShader('shaders/displaceShader.vert', 'shaders/displaceShader.frag');
    displaceShader2 = loadShader('shaders/displaceShader.vert', 'shaders/displaceShader.frag');
}



function setup() {
    createCanvas(windowWidth, windowHeight);

    sketchWidth = min(windowWidth, windowHeight) * 0.75;
    sketchHeight = sketchWidth;
    noiseGenFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    noiseDispFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    displaceFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    displaceTextFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    textFbo = createGraphics(sketchWidth, sketchHeight);

    textFbo.textAlign(CENTER);
    textFbo.textSize(800);
    textFbo.textFont('Helvetica');

    imageMode(CENTER);
}

function draw() {
    background(0);
    // draw text to be distorted
    textFbo.background(0)
    textFbo.noFill();
    textFbo.stroke(255);
    textFbo.strokeWeight(10);
    textFbo.text("T", sketchWidth * 0.5, sketchHeight * 0.9);
    

    noiseGenFbo.shader(noiseGenShader);
    noiseGenShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    noiseGenShader.setUniform('time', frameCount * 0.01);
    noiseGenShader.setUniform('density', 100.0);
    noiseGenFbo.rect(0, 0, 50, 50);

    noiseDispFbo.shader(noiseDispShader);
    noiseDispShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    noiseDispShader.setUniform('time', frameCount * 0.01);
    noiseDispShader.setUniform('density', 2);
    noiseDispFbo.rect(0, 0, 50, 50);

    displaceFbo.shader(displaceShader);
    displaceShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    displaceShader.setUniform('time', frameCount * 0.01);
    displaceShader.setUniform('dispTargetTex', noiseGenFbo);
    displaceShader.setUniform('dispSourceTex', noiseDispFbo);
    displaceShader.setUniform('dispStrength', 0.1);
    displaceFbo.rect(0, 0, 50, 50);

    displaceTextFbo.shader(displaceShader2);
    displaceShader2.setUniform('resolution', [sketchWidth, sketchHeight]);
    displaceShader2.setUniform('time', frameCount * 0.01);
    displaceShader2.setUniform('flipY', true);
    displaceShader2.setUniform('dispTargetTex', textFbo);
    displaceShader2.setUniform('dispSourceTex', displaceFbo);
    displaceShader2.setUniform('dispStrength', 0.05);
    displaceTextFbo.rect(0, 0, 50, 50);

    displaceTextFbo.smooth();
    //image(displaceFbo, width * 0.5, height * 0.5, width, height);
    image(displaceTextFbo, width * 0.5, height * 0.5, sketchWidth, sketchHeight);
    image(displaceFbo, 400, 400, sketchWidth * 0.25, sketchHeight * 0.25);
    image(noiseGenFbo, 200, 200, sketchWidth * 0.25, sketchHeight * 0.25);
    image(noiseDispFbo, 600, 600, sketchWidth * 0.25, sketchHeight * 0.25);
    image(textFbo, 800, 800, sketchWidth * 0.25, sketchHeight * 0.25);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight)
    sketchWidth = min(windowWidth, windowHeight) * 0.75;
    sketchHeight = sketchWidth;
}