// noiseGenShader -> generates noise to be displaced
// noiseDispShader -> generates noise to displace above noise
// displaceShader -> actually does the displacing
let mainCanvas;
let noiseGenShader, noiseDispShader, backgroundNoiseShader, displaceShader, displaceShader2;
let noiseGenFbo, noiseDispFbo, displaceFbo, displaceTextFbo, textFbo, finalFbo, backgroundFbo;
let sketchWidth, sketchHeight;
let font, mainChar;
let charPosX, charPosY;
let displaceImage, noiseGenImage, noiseDispImage, textImage;
let movableImagesArr = [];

function preload() {
    noiseGenShader = loadShader('../shaders/noiseGenShader.vert', '../shaders/noiseGenShader.frag');
    noiseDispShader = loadShader('../shaders/noiseDispShader.vert', '../shaders/noiseDispShader.frag');
    displaceShader = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    displaceShader2 = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    backgroundNoiseShader = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    font = loadFont("../fonts/helvetica.ttf");
}


class MovableImage{
    constructor(posX, posY, imgWidth, imgHeight, fbo){
        this.posX = posX;
        this.posY = posY;
        this.prevPosX = null;
        this.prevPosY = null;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.fbo = fbo;
        this.moveMode = false;

        this.previousWindowWidth = windowWidth;
        this.previousWindowHeight = windowHeight;
    }

    display(){
        image(this.fbo, this.posX, this.posY, this.imgWidth, this.imgHeight);
    }

    updatePos(){
        if (this.moveMode) {
            this.prevPosX = this.posX;
            this.posX = mouseX;
        }
    }


    mouseIsInside(){
        if (mouseX < this.posX + this.imgWidth * 0.5 && mouseX > this.posX - this.imgWidth * 0.5){
            if (mouseY < this.posY + this.imgHeight * 0.5 && mouseY > this.posY - this.imgHeight * 0.5){
                return true;
            }
            return false;
        }
        return false;
    }
}


function setup() {
    mainCanvas = createCanvas(windowWidth, windowHeight);
    mainCanvas.position(0, 0);
    mainCanvas.style('z-index', '-1');
    /*
    image(displaceTextFbo, width * 0.5 - sketchWidth, height * 0.5, sketchWidth, sketchHeight);
    image(displaceTextFbo, width * 0.5, height * 0.5, sketchWidth, sketchHeight);
    image(displaceTextFbo, width * 0.5 + sketchWidth, height * 0.5, sketchWidth, sketchHeight);
    image(displaceFbo, 200, posYOffset + posYInc, sketchWidth * 0.25, sketchHeight * 0.25);
    image(noiseGenFbo, 200, posYOffset + posYInc * 2.0, sketchWidth * 0.25, sketchHeight * 0.25);
    image(noiseDispFbo, 200, posYOffset + posYInc * 3.0, sketchWidth * 0.25, sketchHeight * 0.25);
    image(textFbo, 200, posYOffset + posYInc * 4.0, sketchWidth * 0.25, sketchHeight * 0.25);
    */

    sketchWidth = min(windowWidth, windowHeight) * 0.75;
    sketchHeight = sketchWidth;
    noiseGenFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    noiseDispFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    displaceFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    displaceTextFbo = createGraphics(sketchWidth, sketchHeight, WEBGL);
    backgroundFbo = createGraphics(width, height, WEBGL);
    textFbo = createGraphics(sketchWidth, sketchHeight);

    let posYInc = sketchHeight * 0.25;
    let posYOffset = (height - sketchHeight) * 0.5 - posYInc * 0.5;
    displaceImage = new MovableImage(random() * windowWidth, posYOffset + posYInc * 1.0, sketchWidth * 0.25, sketchHeight * 0.25, displaceFbo);
    noiseGenImage = new MovableImage(random() * windowWidth, posYOffset + posYInc * 2.0, sketchWidth * 0.25, sketchHeight * 0.25, noiseGenFbo);
    noiseDispImage = new MovableImage(random() * windowWidth, posYOffset + posYInc * 3.0, sketchWidth * 0.25, sketchHeight * 0.25, noiseDispFbo);
    textImage = new MovableImage(random() * windowWidth, posYOffset + posYInc * 4.0, sketchWidth * 0.25, sketchHeight * 0.25, textFbo);
    
    movableImagesArr = [
        displaceImage, noiseGenImage, noiseDispImage, textImage
    ];
    textFbo.textFont(font);
    textFbo.textAlign(CENTER);
    textFbo.textSize(sketchWidth);
    //textFbo.textFont('Helvetica');
    mainChar = String.fromCharCode(int(random(65, 91)));
    charPosX;
    charPosY;
    imageMode(CENTER);

    let isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    //console.log(isMobile);
    if (isMobile){
        pixelDensity(0.75);
        noiseGenFbo.pixelDensity(0.75);
        noiseDispFbo.pixelDensity(0.75);
        displaceFbo.pixelDensity(0.75);
        displaceTextFbo.pixelDensity(0.75);
        backgroundFbo.pixelDensity(0.75);
        textFbo.pixelDensity(0.75);
    }
}

function draw() {
    background(0);
    image(backgroundFbo, width * 0.5, height * 0.5, width, height);
    smooth();
    // draw text to be distorted
    textFbo.background(100);
    textFbo.noFill();
    textFbo.stroke(255);
    textFbo.strokeWeight(10);
    textFbo.textSize(sketchWidth);
    let bbox = font.textBounds(mainChar, 0, 0, sketchWidth);
    textFbo.text(mainChar, 0.5 * (sketchWidth), (bbox.h + sketchHeight) * 0.5);

    textImage.display();
    textImage.updatePos();

    if (textImage.moveMode){
        if (textImage.prevPosX == textImage.posX){}
        else{
            if (frameCount % 5 == 0) mainChar = String.fromCharCode(int(random(65, 91)));
        }
        
    }

    // if noiseGenImage is in moveMode, let the normalized mouseX position value in 
    // respect of windowWidth be the density controller

    let density = noiseGenImage.posX / windowWidth;
    density = map(density, 0, 1, 10, 100);
    
    noiseGenFbo.shader(noiseGenShader);
    noiseGenShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    noiseGenShader.setUniform('time', frameCount * 0.001);
    noiseGenShader.setUniform('density', density);
    noiseGenFbo.rect(0, 0, 50, 50);

    noiseGenImage.display();
    noiseGenImage.updatePos();

    let density2 = noiseDispImage.posX / windowWidth;
    density2 = map(density2, 0, 1, 1, 5);

    noiseDispFbo.shader(noiseDispShader);
    noiseDispShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    noiseDispShader.setUniform('time', frameCount * 0.001);
    noiseDispShader.setUniform('density', density2);
    noiseDispFbo.rect(0, 0, 50, 50);

    noiseDispImage.display();
    noiseDispImage.updatePos();

    let displaceStrength = displaceImage.posX / windowWidth;
    displaceStrength = map(displaceStrength, 0, 1, 0, 0.3);

    displaceFbo.shader(displaceShader);
    displaceShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    displaceShader.setUniform('time', frameCount * 0.001);
    displaceShader.setUniform('dispTargetTex', noiseGenFbo);
    displaceShader.setUniform('dispSourceTex', noiseDispFbo);
    displaceShader.setUniform('dispStrength', displaceStrength);
    displaceFbo.rect(0, 0, 50, 50);

    displaceImage.display();
    displaceImage.updatePos();

    displaceTextFbo.clear();
    displaceTextFbo.shader(displaceShader2);
    displaceShader2.setUniform('resolution', [sketchWidth, sketchHeight]);
    displaceShader2.setUniform('time', frameCount * 0.001);
    displaceShader2.setUniform('flipY', true);
    displaceShader2.setUniform('postProcessOn', true);
    displaceShader2.setUniform('dispTargetTex', textFbo);
    displaceShader2.setUniform('dispSourceTex', displaceFbo);
    displaceShader2.setUniform('dispStrength', 0.05);
    displaceTextFbo.rect(0, 0, 0, 0);

    //displaceTextFbo.smooth();

    backgroundFbo.clear();
    backgroundFbo.shader(backgroundNoiseShader);
    backgroundNoiseShader.setUniform('resolution', [width, height]);
    backgroundNoiseShader.setUniform('time', frameCount * 0.001);
    backgroundNoiseShader.setUniform('flipY', true);
    //backgroundNoiseShader.setUniform('postProcessOn', true);
    backgroundNoiseShader.setUniform('backgroundMode', true);
    backgroundNoiseShader.setUniform('dispTargetTex', noiseGenFbo);
    backgroundNoiseShader.setUniform('dispSourceTex', noiseDispFbo);
    backgroundNoiseShader.setUniform('dispStrength', displaceStrength);
    backgroundFbo.rect(0, 0, 50, 50);

    //image(backgroundFbo, width * 0.5, height * 0.5, width, height);

    let posYInc = sketchHeight * 0.25;
    let posYOffset = (height - sketchHeight) * 0.5 - posYInc * 0.5;
    
    //image(displaceTextFbo, width * 0.5 - sketchWidth, height * 0.5, sketchWidth, sketchHeight);
    image(displaceTextFbo, width * 0.5, height * 0.5, sketchWidth, sketchHeight);
    //image(displaceTextFbo, width * 0.5 + sketchWidth, height * 0.5, sketchWidth, sketchHeight);
    
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight)
    
    sketchWidth = min(windowWidth, windowHeight) * 0.75;
    sketchHeight = sketchWidth;
    //textFbo.textSize(sketchWidth);

    noiseGenFbo.resizeCanvas(sketchWidth, sketchHeight);
    noiseDispFbo.resizeCanvas(sketchWidth, sketchHeight);
    displaceFbo.resizeCanvas(sketchWidth, sketchHeight);
    displaceTextFbo.resizeCanvas(sketchWidth, sketchHeight);
    backgroundFbo.resizeCanvas(windowWidth, windowHeight);
    textFbo.resizeCanvas(sketchWidth, sketchHeight);

    movableImagesArr.forEach(function(img){
        console.log(width, windowWidth)
        img.posX = map(img.posX, 0, img.previousWindowWidth, 0, windowWidth);
        img.posY = map(img.posY, 0, img.previousWindowHeight, 0, windowHeight);
    
        img.previousWindowWidth = windowWidth;
        img.previousWindowHeight = windowHeight;

        img.imgWidth = sketchWidth * 0.25;
        img.imgHeight = sketchHeight * 0.25;
    });
}

function mousePressed(){
    movableImagesArr.forEach(function(img){
        if (img.mouseIsInside()){
            img.moveMode = true;
        }
    });
}

function mouseReleased(){
    movableImagesArr.forEach(function(img){
            img.moveMode = false;
    });
}