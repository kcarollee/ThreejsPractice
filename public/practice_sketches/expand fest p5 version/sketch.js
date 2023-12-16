class MovingText{
  constructor(posX, posY, finalSize, character){
    this.posX = posX;
    this.posY = posY;
    this.curSize = 0;
    this.finalSize = finalSize;
    this.char = character;
  }

  display(canvas){
    canvas.textSize(this.curSize);
    canvas.text(this.char, this.posX, this.posY);
  }

  updateSize(){
    if (this.curSize < this.finalSize){
      this.curSize += 2;
    }
  }
}

class MouseEllipse{
  constructor(posX, posY, radius){
    this.posX = posX;
    this.posY = posY;
    this.radius = radius;
  }

  changeScale(){

  }

  changePos(posX, posY){
    this.posX = posX;
    this.posY = posY;
  }

  mouseIsInside(){
    if (MouseEllipse.display){
      return dist(this.posX, this.posY, mouseX, mouseY) < this.radius;
    }
  }

  display(canvas){
    if (MouseEllipse.display){
      canvas.rect(this.posX, this.posY, this.radius, this.radius); 
    }
  }
}

MouseEllipse.display = true;




function preload(){
  firstPassShader = loadShader('./assets/shaders/blurShader.vert', './assets/shaders/blurShader.frag');
  secondPassShader = loadShader('./assets/shaders/blurShader.vert', './assets/shaders/blurShader.frag');
  sinePassShader = loadShader('./assets/shaders/sineShader.vert', './assets/shaders/sineShader.frag');
  font = loadFont('./assets/fonts/helvetica.ttf');

  bgImgArr = [];
  for (let i = 0; i < 4; i++){
    let bgImg = loadImage('./assets/images/bgImages/bg' + (i + 1)  + '.png');
    bgImgArr.push(bgImg);
  }
}

function setup(){
  
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', -1);

  firstPassCanvas = createGraphics(windowWidth, windowHeight, WEBGL);
  secondPassCanvas = createGraphics(windowWidth, windowHeight, WEBGL);
  sinePassCanvas = createGraphics(windowWidth, windowHeight, WEBGL);

  firstPassCanvas.smooth();
  secondPassCanvas.smooth();
  sinePassCanvas.smooth();
  smooth();

  textCanvas = createGraphics(windowWidth, windowHeight);
  textCanvas.rectMode(CENTER);
  checkForMobile();
  resetTextCanvas();
  // blur shader uniforms
  numSamples = 129;
  weightOffsets = [];
  passNum = 0;
  for (let i = 0; i < numSamples; i++){
    weightOffsets.push([offsetX[i], offsetY[i]]);
  }

  movingTextArr = [];

  //background
  dim = max(width, height);
  dimScale = 1.0;
  posOffset = 0;
  bgImageIndex = 0;

  // easing mouse
  easeMouseX = 0;
  easeMouseY = 0;

   // get infotext
  infoText = document.getElementById('infoText');

  // get refresh button
  refreshButton = document.getElementById('refreshButton');
  //refreshButton.addEventListener("onclick", refreshSketch());

  // sketch timeout 
  timeoutThresh = 600;

  gap = 0.2;
  heightCoef = 0.92;
  
  mouseEllipse1 = new MouseEllipse(textCanvas.width * 0.5, textCanvas.height * heightCoef, 25, 25);
  mouseEllipse2 = new MouseEllipse(textCanvas.width * (0.5 - gap), textCanvas.height * heightCoef, 25, 25);
  mouseEllipse3 = new MouseEllipse(textCanvas.width * (0.5 + gap), textCanvas.height * heightCoef, 25, 25);

  mouseEllipseArr = [mouseEllipse2, mouseEllipse1, mouseEllipse3];

}

function draw(){
  background(0);

  easeMouseX = lerp(easeMouseX, mouseX, 0.05);
  easeMouseY = lerp(easeMouseY, mouseY, 0.05);

  let cnv = textCanvas;
  movingTextArr.forEach(function(movingText){
    movingText.display(cnv);
    movingText.updateSize();
  })

  if (framesElapsedSinceMouseClicked == 0){
    console.log(framesElapsedSinceMouseClicked)
    mouseEllipseArr.forEach(function(mouseEllipse, i){
      mouseEllipse.radius = 20 + 5 * Math.sin(frameCount * 0.1 + HALF_PI * i * 3);
      mouseEllipse.display(cnv);
    });
  }
  

  for (let i = 0; i < 3; i++){
    let me = mouseEllipseArr[i];
    if (me.mouseIsInside()){
      document.body.style.cursor = 'pointer';
      break;
    }
    else {
      document.body.style.cursor = 'default';
    }
  }
  
  
  firstPassCanvas.shader(firstPassShader);
  firstPassShader.setUniform('resolution', [width, height]);
  firstPassShader.setUniform('tex', textCanvas);
  firstPassShader.setUniform('weightOffsetsX', offsetX);
  firstPassShader.setUniform('weightOffsetsY', offsetY);
  firstPassShader.setUniform('numSamples', numSamples);
  firstPassShader.setUniform('flipY', true);
  firstPassShader.setUniform('isSecondPass', false);
  firstPassCanvas.rect(0, 0, 50, 50);

  secondPassCanvas.shader(secondPassShader);
  secondPassShader.setUniform('resolution', [width, height]);
  secondPassShader.setUniform('tex', firstPassCanvas);
  secondPassShader.setUniform('weightOffsetsX', offsetX);
  secondPassShader.setUniform('weightOffsetsY', offsetY);
  secondPassShader.setUniform('numSamples', numSamples);
  secondPassShader.setUniform('flipY', true);
  secondPassShader.setUniform('isSecondPass', true);
  secondPassCanvas.rect(0, 0, 50, 50);

  sinePassCanvas.clear();
  sinePassCanvas.shader(sinePassShader);
  sinePassShader.setUniform('resolution', [width, height]);
  sinePassShader.setUniform('tex', secondPassCanvas);
  sinePassShader.setUniform('flipY', true);
  sinePassShader.setUniform('time', frameCount * 0.2);
  sinePassShader.setUniform('sinDensity', map((easeMouseY / windowHeight), 0, 1, 20, 100));
  sinePassCanvas.rect(0, 0, 50, 50);

 
  if (frameCount % 60 == 0){
    dimScale = random(1.0, 3.0);
    posOffset = random(0, dim * dimScale - dim);
    bgImageIndex++;
    bgImageIndex  = bgImageIndex % 4;
    //console.log(bgImageIndex)
  }

  if (clickCount > 0){
    framesElapsedSinceMouseClicked++;
    if (framesElapsedSinceMouseClicked > timeoutThresh){
      refreshSketchbyTimeOut();
      framesElapsedSinceMouseClicked = 0;
    }
  }

  

  push();
  translate(-posOffset, -posOffset);
  //rotate(frameCount * 0.01);
  image(bgImgArr[bgImageIndex], 0, 0, dim * dimScale, dim * dimScale);
  pop();

  image(sinePassCanvas, 0, 0, width, height);
  //image(textCanvas,  0, 0, width * 0.25, height * 0.25);

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  firstPassCanvas.resizeCanvas(windowWidth, windowHeight);
  secondPassCanvas.resizeCanvas(windowWidth, windowHeight);
  sinePassCanvas.resizeCanvas(windowWidth, windowHeight);
  textCanvas.resizeCanvas(windowWidth, windowHeight);
  resetTextCanvas();

  

  mouseEllipse1.changePos(textCanvas.width * 0.5, textCanvas.height * heightCoef);
  mouseEllipse2.changePos(textCanvas.width * (0.5 - gap), textCanvas.height * heightCoef);
  mouseEllipse3.changePos(textCanvas.width * (0.5 + gap), textCanvas.height * heightCoef);
}

function resetTextCanvas(){
  textCanvas.clear();
  textCanvas.background(0);
  textCanvas.textAlign(CENTER, CENTER);
  textCanvas.textFont(font);
  textCanvas.fill(255);

  if (windowWidth < windowHeight){
    let boundaryX = 0.15 * windowWidth;
    let w = (windowWidth - 2 * boundaryX) * 0.25;

    let boundaryY = 0.2 * windowHeight;
    let h = (windowHeight - 2 * boundaryY) * 0.25;

    let str = 'EXP&';

    textCanvas.textSize(windowHeight * 0.3);
    for (let i = 0; i < 4; i++){
      let posX = boundaryX + w * 0.5 * (2 * i + 1);
      let posY = boundaryY + h * 0.5 * (2 * i + 1);
      textCanvas.text(str[i], posX, posY);
    }
  }

  else{ 
    textCanvas.textSize(windowHeight * 0.4);
    textCanvas.text("EXP&", textCanvas.width * 0.5, textCanvas.height * 0.5);
  }

  dim = max(windowWidth, windowHeight);
}

function checkForMobile(){
  let isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  if (isMobile){
    pixelDensity(0.75);
    textCanvas.pixelDensity(0.75);
    firstPassCanvas.pixelDensity(0.75);
    secondPassCanvas.pixelDensity(0.75);
    sinePassCanvas.pixelDensity(0.75);

    //infoText.innerHTML = "touch anywhere on the screen"
  }
  else {
    pixelDensity(1);
    textCanvas.pixelDensity(1);
    firstPassCanvas.pixelDensity(1);
    secondPassCanvas.pixelDensity(1);
    sinePassCanvas.pixelDensity(1);

    //infoText.innerHTML = "click anywhere on the screen"
  }
}


let clickCount = 0;
let charArr = ['E', 'X', 'P', '&'];
let sketchRefreshed = false;
let framesElapsedSinceMouseClicked = 0;
function mouseClicked(){
  framesElapsedSinceMouseClicked = 0;
  if (!sketchRefreshed){
    let chr = charArr[clickCount % 4];
    let tempMovingText = new MovingText(mouseX, mouseY, 
      windowWidth < windowHeight ? windowHeight * 0.3 : windowHeight * 0.4, chr);
    movingTextArr.push(tempMovingText);
    clickCount++;
    if (clickCount > 0) {
      infoText.style.display = 'none';
      refreshButton.style.display = 'block'
    }
  }
  else sketchRefreshed = false;
}

function refreshSketch(){
  sketchRefreshed = true;
  resetTextCanvas();
  movingTextArr = [];
  refreshButton.style.display = 'none';
  infoText.style.display = 'inline-block';
}

function refreshSketchbyTimeOut(){
  resetTextCanvas();
  movingTextArr = [];
  refreshButton.style.display = 'none';
  infoText.style.display = 'inline-block';
}