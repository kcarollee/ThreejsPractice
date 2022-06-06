
/*
Notes about video sources:
0. Rotational video sources must start from 9'o clock direction and progress clockwise.
1. Horizontal video sources must
2. Vertical video sources must
*/

let testFrameArrRotational = [];
let testFrameArrHori = [];
let testFrameArrVert = [];
let frameTileArr = [];
let tileGroupArr = [];

let customFont;
let fontSize;

let titleText;

function preload(){
  for (let i = 0; i < 20; i++){
    let temp = loadImage('assets/vidSourceTest/rotationalSources/r' + i + '.jpg'); 
    testFrameArrRotational.push(temp);
  }

  for (let i = 0; i < 9; i++){
    let temp2 = loadImage('assets/vidSourceTest/horizontalSources/h' + i + '.jpg');
    testFrameArrHori.push(temp2);
  }

  for (let i = 0; i < 7; i++){
    let temp3 = loadImage('assets/vidSourceTest/verticalSources/v' + i + '.jpg');
    testFrameArrVert.push(temp3);
  }

  customFont = loadFont('assets/fonts/time_font_fixed_2.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  rectMode(CENTER);
  fontSize = windowWidth * 0.05;
  titleText = "WATCHFUL INHABITANTS";
  textSize(fontSize);
  
  generateGridTiles();
  //generateHorizontalTiles();
  //generateVerticalTiles();
}

function draw() {
  background(0);
  
  frameTileArr.forEach(function(frame){
    frame.updateFrameIndex();
    frame.updatePosition();
    frame.display();
    
  });

  /*
  fill(255, 0, 0);
  textFont(customFont);
  text(titleText, 10, fontSize);
  */
  //glitchOutText();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  fontSize = windowWidth * 0.05;
  textSize(fontSize);
}

let nextGlitchOutMod;

function glitchOutText(){
  nextGlitchOutMod = int(random(10, 20));
  if (frameCount % nextGlitchOutMod == 0){
    for (let i = 0; i < titleText.length; i++){
      let r = random(0, 1);
      if (r < 0.8){
        titleText = titleText.substring(0, i) + 'X' + titleText.substring(i + 1);
        console.log(titleText);
      }
    }
  }
  else titleText = "WATCHFUL INHABITANTS";
}

let cCount = 0;
function keyPressed(){
  switch(key){
    case 'c':
      cCount++;
      if (cCount % 3 == 1) generateHorizontalTiles();
      else if (cCount % 3 == 2) generateVerticalTiles();
      else if (cCount % 3 == 0) generateGridTiles();

      break;

  }
}



function mouseClicked(){
  frameTileArr.forEach(function(tile){
    if (tile.mouseIsInTile()) tile.provoked = true;
  });
}

function generateHorizontalTiles(){
  frameTileArr = [];
  let initialDim = height * 0.1;
  let initialNum = width / initialDim;
  for (let i = 0; i < initialNum; i++){
    let frameTile = new FrameTile(width / initialNum * i + initialDim * 0.5, height * 0.5,
     initialDim, initialDim * 2);
    frameTile.setFrameSource(testFrameArrHori);
    frameTile.setMovementMode(1);
    frameTileArr.push(frameTile);
  }

  for (let i = 0; i < frameTileArr.length; i++){
    
    if (i == 0) {
      frameTileArr[i].setAdjacentTileRight(frameTileArr[i + 1]);
      continue;
    }
    if (i == frameTileArr.length - 1) {
      frameTileArr[i].setAdjacentTileLeft(frameTileArr[i - 1]);
      continue;
    }
    frameTileArr[i].setAdjacentTileRight(frameTileArr[i + 1]);
    frameTileArr[i].setAdjacentTileLeft(frameTileArr[i - 1]);
  }
}

function generateVerticalTiles(){
  frameTileArr = [];
  let initialDim = width * 0.05;
  let initialNum = height / initialDim;
  for (let i = 0; i < initialNum; i++){
    let frameTile = new FrameTile(width * 0.5, height / initialNum * i + initialDim * 0.5,
     initialDim * 3.0, initialDim);
    frameTile.setFrameSource(testFrameArrVert);
    frameTile.setMovementMode(2);
    frameTileArr.push(frameTile);
  }

  for (let i = 0; i < frameTileArr.length; i++){
    
    if (i == 0) {
      frameTileArr[i].setAdjacentTileBottom(frameTileArr[i + 1]);
      continue;
    }
    if (i == frameTileArr.length - 1) {
      frameTileArr[i].setAdjacentTileTop(frameTileArr[i - 1]);
      continue;
    }
    frameTileArr[i].setAdjacentTileBottom(frameTileArr[i + 1]);
    frameTileArr[i].setAdjacentTileTop(frameTileArr[i - 1]);
  }
}

class FrameTileGroup{
  constructor(rowNum, colNum, sizew, sizeh, startingPosx, startingPosy, frameSource){
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.sizew = sizew;
    this.sizeh = sizeh;
    this.xOffset = startingPosx;
    this.yOffset = startingPosy;

    this.frameTileArr = [];
    this.frameSource = frameSource;
  }

  
}

function generateGridTiles(){
  frameTileArr = [];
  let initialDim = 50;
  let initialNum = int(max(width, height) / initialDim * 0.5);

  let rowNum = initialNum * 3;
  let colNum = initialNum;
  let xOffset = width * 0.5 - initialDim * (colNum - 1) * 0.5;
  let yOffset = height * 0.5 - initialDim * (rowNum - 1) * 0.5;

  for (let row = 0; row < rowNum; row++){
    for (let col = 0; col < colNum; col++){
      
      let y = yOffset + row * initialDim; 
      let x = xOffset + col * initialDim + 10 * sin(y * 2.0);
      let frameTile = new FrameTile(x, y, initialDim, initialDim);
      frameTile.setFrameSource(testFrameArrRotational);
      frameTile.setMovementMode(0);
      frameTileArr.push(frameTile);
    }
  }

  let idx = 0;
  for (let row = 0; row < rowNum; row++){
    for (let col = 0; col < colNum; col++){
      let currentIndex = idx;
      let rightIndex = idx + 1;
      let leftIndex = idx - 1;
      let topIndex = idx - colNum;
      let bottomIndex = idx + colNum;

      let leftBottomIndex = bottomIndex - 1;
      let leftTopIndex = topIndex - 1;
      let rightBottomIndex = bottomIndex + 1;
      let rightTopIndex = topIndex + 1;

      let currentTile = frameTileArr[currentIndex];
       // CORNER CASE 1: right, bottom, rightBottom
      if (row == 0 && col == 0){
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileRightBottom(frameTileArr[rightBottomIndex]);

    
      }
      // CORNER CASE 2: left, bottom, leftBottom
      else if (row == 0 && col == colNum - 1){
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileLeftBottom(frameTileArr[leftBottomIndex]);
      }
      // CORNER CASE 3: top, right, rightTop
      else if (row == rowNum - 1 && col == 0){
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);
        currentTile.setAdjacentTileRightTop(frameTileArr[rightTopIndex]);

      }
      // CORNER CASE 4: left, top, leftTop
      else if (row == rowNum - 1 && col == colNum - 1){
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);
        currentTile.setAdjacentTileLeftTop(frameTileArr[leftTopIndex]);
      }

      // SIDE CASE 1: left, right, bottom, leftBottom, rightBottom
      else if (row == 0){
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);

        currentTile.setAdjacentTileLeft(frameTileArr[leftBottomIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[rightBottomIndex]);
      }
      // SIDE CASE 2: left, right, top, leftTop, rightTop
      else if (row == rowNum - 1){
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);

        currentTile.setAdjacentTileLeft(frameTileArr[leftTopIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[rightTopIndex]);
      }
      // SIDE CASE 3: top, bottom, right, rightTop, rightBottom
      else if (col == 0){
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);

        currentTile.setAdjacentTileLeft(frameTileArr[rightTopIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[rightBottomIndex]);
      }

      // SIDE CASE 4: left, top, bottom, leftTop, leftBottom
      else if (col == colNum - 1){
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);

        currentTile.setAdjacentTileLeft(frameTileArr[leftTopIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[leftBottomIndex]);
      }

      // REST: left, right, bottom, top, rightTop, rightBottom, leftTop, leftBottom
      else {
        currentTile.setAdjacentTileRight(frameTileArr[rightIndex]);
        currentTile.setAdjacentTileBottom(frameTileArr[bottomIndex]);
        currentTile.setAdjacentTileLeft(frameTileArr[leftIndex]);
        currentTile.setAdjacentTileTop(frameTileArr[topIndex]);

        currentTile.setAdjacentTileLeftBottom(frameTileArr[leftBottomIndex]);
        currentTile.setAdjacentTileLeftTop(frameTileArr[leftTopIndex]);

        currentTile.setAdjacentTileRightBottom(frameTileArr[rightBottomIndex]);
        currentTile.setAdjacentTileRightTop(frameTileArr[rightTopIndex]);
      }
      idx++;
    }
  }
}