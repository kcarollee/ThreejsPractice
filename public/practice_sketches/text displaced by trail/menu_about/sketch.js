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



let imgElemArr = [];
let imgElemShowcount = 0;
let testImgElem;

let textElemArr = [];
let isMobile;

function preload() {
    noiseGenShader = loadShader('../shaders/noiseGenShader.vert', '../shaders/noiseGenShader.frag');
    noiseDispShader = loadShader('../shaders/noiseDispShader.vert', '../shaders/noiseDispShader.frag');
    displaceShader = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    displaceShader2 = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    backgroundNoiseShader = loadShader('../shaders/displaceShader.vert', '../shaders/displaceShader.frag');
    font = loadFont("../fonts/helvetica.ttf");
}


class MovableImage {
    constructor(posX, posY, imgWidth, imgHeight, fbo) {
        this.posX = posX;
        this.posY = posY;
        this.prevPosX = null;
        this.prevPosY = null;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.fbo = fbo;
        this.moveMode = false;
    }

    display() {
        image(this.fbo, this.posX, this.posY, this.imgWidth, this.imgHeight);
    }

    updatePos() {
        if (this.moveMode) {
            this.prevPosX = this.posX;
            this.posX = mouseX;
        }

    }

    mouseIsInside() {
        if (mouseX < this.posX + this.imgWidth * 0.5 && mouseX > this.posX - this.imgWidth * 0.5) {
            if (mouseY < this.posY + this.imgHeight * 0.5 && mouseY > this.posY - this.imgHeight * 0.5) {
                return true;
            }
            return false;
        }
        return false;
    }
}


class ImageElement {
    constructor(posX, posY, imgLink, hrefLink) {
        this.posX = posX;
        this.posY = posY;

        this.posYDest = this.posY + 20;

        this.size = 0; // initialSize;

        this.anchorElem = createElement('a');
        this.anchorElem.attribute('href', hrefLink);

        this.imgElem = createImg(imgLink);
        this.imgElem.style('z-index', 0);
        this.imgElem.style('opacity', 0.5);
        this.imgElem.style('width', '20vw');
        //this.imgElem.style('filter', 'grayscale(100%)');
        this.imgElem.style('display', 'none');

        this.imgElem.parent(this.anchorElem);
        this.imgElem.position(this.posX, this.posY, 'relative');

        this.imgElem.mouseOver(this.onMouseOver);
        this.imgElem.mouseOut(this.onMouseOut);

        this.appearAnimationTriggered = false;
        console.log(this.imgElem);
    }

    onMouseOver() {
        this.style('opacity', 1);
        this.style('z-index', 9999);
    }

    onMouseOut() {
        this.style('opacity', 0.5);
        this.style('z-index', 0);
    }

    updatePos(deltaY) {
        this.posY += deltaY;
        this.posYDest += deltaY;
        this.imgElem.position(this.posX, this.posY);
    }

    // called when window is resized
    repositionImage() {
        this.posX = map(this.posX, 0, width, 0, windowWidth);
        this.imgElem.position(this.posX, this.posY);
    }

    appearAnimation() {
        if (this.appearAnimationTriggered) {
            //if (this.size < 10) this.size += 0.5;
            this.imgElem.style('display', 'block');
            //this.imgElem.style('width', this.size + 'vw');
            this.posY += (this.posYDest - this.posY) * 0.1
            this.imgElem.position(this.posX, this.posY);
            if (abs(this.posY - this.posYDest) < 0.001) this.appearAnimationTriggered = false;
        }
    }


    mouseIsInside() {
        if (mouseX < this.posX + this.imgWidth * 0.5 && mouseX > this.posX - this.imgWidth * 0.5) {
            if (mouseY < this.posY + this.imgHeight * 0.5 && mouseY > this.posY - this.imgHeight * 0.5) {
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
    mainCanvas.style('position', 'fixed');
    mainCanvas.style('z-index', '-1');

    isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);

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


    //testImgElem = new ImageElement(width * 0.5, height * 0.5, './images/img_1.png', 'https://google.com');
    /*
    let imgNum = 30;
    for (let i = 0; i < imgNum; i++){
        let posX = width * 0.5 + map(noise(i * 10), 0, 1, -width * 0.3, width * 0.3);
        let posY = i * width * 0.1;

        let imgElemTemp =  new ImageElement(posX, posY, './images/img_1.png', 'https://google.com');
        imgElemArr.push(imgElemTemp);
    }
    */

    /*
    TRAIL IS A SERVICE CATERING
    TO THE NEEDS OF CLINETS WHO
    HAVE A DESIRE TO MANIPULATE
    THEIR CONTENTS AND USE THEM
    IN THEIR OWN CREATIVE WAYS.

    
    SHARE YOUR SOURCE MATERIALS
    WITH US AND THE RESULTS MAY
    BE SOMETHING UNPRECEDENTED. 

    OUR SERVICES ARE AS FOLLOWS
    __VIDEO MANIPULATION_______
    ____GLITCHED OUT FONTS_____
    __PROJECTION MAPPING_______
    ____GENERATIVE AUDIO_______
    ______WEB BASED GRAPHICS___
    __REAL TIME GRAPHICS_______

    CONTACT US: trail@gmail.com
    INSTAGRAM: @trail__services
    */
    let textElemNum = 20;
    let textElemStr = 'LEAVE BEHIND TASTEFUL NOISE<br>';
    let strArr = [
        'leave behind tasteful noise<br>',
        // 1 ~5
        'traillll: A SERVICE CATERING<br>',
        'TO THE NEEDS OF CLIENTS WHO<br>',
        'HAVE A DESIRE TO MANIPULATE<br>',
        'THEIR CONTENTS AND USE THEM<br>',
        'IN THEIR OWN CREATIVE WAYS.<br>',
        // 6 ~ 8
        'SHARE YOUR SOURCE MATERIALS<br>',
        'WITH US AND THE RESULTS MAY<br>',
        'BE SOMETHING UNPRECEDENTED.<br>',
        // 9 ~ 15
        'OUR SERVICES ARE AS FOLLOWS<br>',
        '__VIDEO MANIPULATION_______<br>',
        '____GLITCHED OUT FONTS_____<br>',
        '__PROJECTION MAPPING_______<br>',
        '____GENERATIVE AUDIO_______<br>',
        '______WEB BASED GRAPHICS___<br>',
        '__REAL TIME GRAPHICS_______<br>',
        // 16 ~ 17
        'CONTACT US: trail@gmail.com<br>',
        'INSTAGRAM: @traillll_services<br>',
    ]

    let noiseIncrement = 0.2;
    let noiseStep = 0;

    let textElemPosYOffset = height * 0.1;
    let textElemPosYIncrement = 35;
    for (let i = 1; i < 6; i++) {

        let textElem = createElement('a', strArr[i]);
        textElem.style('color', 'white');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh'); 
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = textElemPosYOffset + textElemPosYIncrement * i;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElem.style('white-space', 'nowrap');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == 5) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < textElemNum; i++) {
        let textElem = createElement('a', strArr[0]);
        textElem.style('color', 'rgb(100, 100, 100)');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == textElemNum - 1) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < 4; i++) {
        let textElem = createElement('a', strArr[i + 5]);
        textElem.style('color', 'white');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == 3) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < textElemNum; i++) {
        let textElem = createElement('a', strArr[0]);
        textElem.style('color', 'rgb(100, 100, 100)');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == textElemNum - 1) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < 8; i++) {
        let textElem = createElement('a', strArr[i + 8]);
        textElem.style('color', 'white');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == 7) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < textElemNum; i++) {
        let textElem = createElement('a', strArr[0]);
        textElem.style('color', 'rgb(100, 100, 100)');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == textElemNum - 1) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < 3; i++) {
        let textElem = createElement('a', strArr[i + 15]);
        textElem.style('color', 'white');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == 2) textElemPosYOffset = textElem.posY;
    }

    for (let i = 1; i < textElemNum; i++) {
        let textElem = createElement('a', strArr[0]);
        textElem.style('color', 'rgb(100, 100, 100)');
        textElem.style('opacity', '90');
        isMobile ? textElem.style('font-size', '3vw') : textElem.style('font-size', '3vh');
        textElem.style('letter-spacing', '0.1em');
        textElem.style('font-family', 'Custom Font');
        textElem.posY = i * textElemPosYIncrement + textElemPosYOffset;
        textElem.posX = width * 0.25 + map(noise(noiseIncrement * noiseStep), 0, 1, -200, 200);
        textElem.style('white-space', 'nowrap');
        textElem.position(textElem.posX, textElem.posY);
        textElem.style('display', 'none');
        textElemArr.push(textElem);
        noiseStep += 1;

        if (i == textElemNum - 1) textElemPosYOffset = textElem.posY;
    }



    /*
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    LEAVE BEHIND TASTEFUL NOISE
    TRAIL IS A SERVICE CATERING
    TO THE NEEDS OF CLINETS WHO
    HAVE A DESIRE TO MANIPULATE
    THEIR CONTENTS AND USE THEM
    IN THEIR OWN CREATIVE WAYS.
    
    SHARE YOUR SOURCE MATERIALS
    WITH US AND THE RESULTS MAY
    BE SOMETHING UNPRECEDENTED. 

    OUR SERVICES ARE AS FOLLOWS
    __VIDEO MANIPULATION_______
    ____GLITCHED OUT FONTS_____
    __PROJECTION MAPPING_______
    ____GENERATIVE AUDIO_______
    ______WEB BASED GRAPHICS___
    __REAL TIME GRAPHICS_______


    CONTACT US: trail@gmail.com
    INSTAGRAM: @trail__services
    CREATING MANIPULAED MEDIA BASED
    ON OUR CLIENTS' REQUESTS
    */

    
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
    /*
    if (imgElemShowcount < imgElemArr.length){
        imgElemShowcount = int(imgElemShowcount);
        imgElemArr[imgElemShowcount].appearAnimationTriggered = true;
    }
    imgElemShowcount = frameCount * 0.25;
    
    imgElemArr.forEach(function(imgElem){
        imgElem.appearAnimation();
    })
    */
     // mouse movement only available on web due to overflow issues
     
     if (!isMobile){
        textElemArr.forEach(function (textElem, i) {

            textElem.posX += map(noise(i * 0.1 + frameCount * 0.01), 0, 1, -2, 2);
            let d = dist(textElem.posX, textElem.posY, mouseX, mouseY);
            textElem.posX += (mouseX - textElem.posX) / d;
            textElem.position(textElem.posX, textElem.posY);
    
        })
     }


    let currentVisibleIndex = int(frameCount * 0.25);
    if (currentVisibleIndex < textElemArr.length) {
        textElemArr[currentVisibleIndex].style('display', 'block');
    }
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

    //textImage.display();
    //textImage.updatePos();

    if (textImage.moveMode) {
        if (textImage.prevPosX == textImage.posX) { }
        else {
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

    //noiseGenImage.display();
    //noiseGenImage.updatePos();

    let density2 = noiseDispImage.posX / windowWidth;
    density2 = map(density2, 0, 1, 1, 5);

    noiseDispFbo.shader(noiseDispShader);
    noiseDispShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    noiseDispShader.setUniform('time', frameCount * 0.001);
    noiseDispShader.setUniform('density', density2);
    noiseDispFbo.rect(0, 0, 50, 50);

    //noiseDispImage.display();
    //noiseDispImage.updatePos();

    let displaceStrength = displaceImage.posX / windowWidth;
    displaceStrength = map(displaceStrength, 0, 1, 0, 0.3);

    displaceFbo.shader(displaceShader);
    displaceShader.setUniform('resolution', [sketchWidth, sketchHeight]);
    displaceShader.setUniform('time', frameCount * 0.001);
    displaceShader.setUniform('dispTargetTex', noiseGenFbo);
    displaceShader.setUniform('dispSourceTex', noiseDispFbo);
    displaceShader.setUniform('dispStrength', displaceStrength);
    displaceFbo.rect(0, 0, 50, 50);

    //displaceImage.display();
    //displaceImage.updatePos();

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
    //image(displaceTextFbo, width * 0.5, height * 0.5, sketchWidth, sketchHeight);
    //image(displaceTextFbo, width * 0.5 + sketchWidth, height * 0.5, sketchWidth, sketchHeight);

}

function windowResized() {
    imgElemArr.forEach(function (imgElem) {
        imgElem.repositionImage();
    });

    resizeCanvas(windowWidth, windowHeight)
    sketchWidth = min(windowWidth, windowHeight) * 0.75;
    sketchHeight = sketchWidth;
    //textFbo.textSize(sketchWidth);

    movableImagesArr.forEach(function (img) {

    });
}

function mousePressed() {
    movableImagesArr.forEach(function (img) {
        if (img.mouseIsInside()) {
            img.moveMode = true;
        }
    });
}

function mouseReleased() {
    movableImagesArr.forEach(function (img) {
        img.moveMode = false;
    });
}
let totalDeltaY = 0;
let mouseWheelTickNum = 0;
function mouseWheel(event) {

}