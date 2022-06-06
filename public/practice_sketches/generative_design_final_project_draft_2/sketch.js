
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

let provokedAnimationFrameArr1 = [];

let rotationalFrameArr1 = [];
let rotationalFrameArr2 = [];
let rotationalFrameArr3 = [];
let rotationalFrameArr4 = [];

let provokedFrameArr1 = [];
let provokedFrameArr2 = [];
let provokedFrameArr3 = [];
let provokedFrameArr4 = []; // RED EYE

let groupArr = []; // mainly used to determine correct mouse clicks

let customFont;
let fontSize;

let titleText;

let testTileGroup, testTileGroup1, testTileGroup2, testTileGroup3, testTileGroup4;

// Amaj7
let bassNoteGroup1 = [
  55.0, 69.30, 82.41, 103.83, 110.0, 138.59, 164.81, 207.65
];

// Bmaj7
let bassNoteGroup2 = [
  55.0 * 1.122545, 69.30 * 1.122545, 82.41 * 1.122545, 103.83 * 1.122545, 110.0 * 1.122545, 138.59 * 1.122545, 164.81 * 1.122545, 207.65 * 1.122545
];

// C#min7
let bassNoteGroup3 = [
  69.30, 82.41, 103.83, 123.47, 138.59, 164.81, 207.65, 246.94
];

// D#maj
let bassNoteGroup4 = [
  77.78, 92.50, 123.47, 155.56
];

// Emaj7
let bassNoteGroup5 = [
  55.0 * 1.5, 69.30 * 1.5, 82.41 * 1.5, 103.83 * 1.5, 110.0 * 1.5, 138.59 * 1.5, 164.81 * 1.5, 207.65
];

let melodyNoteGroup1 = [
  164.81 * 2, 185.00 * 2, 207.65 * 2, 220 * 2, 246.94 * 2, 277.18 * 2, 311.13 * 2, 329.63 * 2
];

function preload(){

  // ROTATIONAL FRAMES
  for (let i = 0; i < 117; i++){
    let temp = loadImage('assets/vidSourceTest/rotationalSources/rs1/rs (' + (i + 1) + ').jpg'); 
    rotationalFrameArr1.push(temp);
  }

  for (let i = 0; i < 130; i++){
    let temp = loadImage('assets/vidSourceTest/rotationalSources/rs2/rs (' + (i + 1) + ').jpg'); 
    rotationalFrameArr2.push(temp);
  }

  for (let i = 0; i < 110; i++){
    let temp = loadImage('assets/vidSourceTest/rotationalSources/rs3/rs (' + (i + 1) + ').jpg'); 
    rotationalFrameArr3.push(temp);
  }

  for (let i = 0; i < 63; i++){
    let temp = loadImage('assets/vidSourceTest/rotationalSources/rs4/rs (' + (i + 1) + ').jpg'); 
    rotationalFrameArr4.push(temp);
  }

  
  // PROVOKED FRAMES
  for (let i = 0; i < 90; i++){
    let temp = loadImage('assets/vidSourceTest/provokedSources/ps1/ps (' + (1 + i) + ').jpg');
    provokedFrameArr1.push(temp);
  }

  for (let i = 0; i < 110; i++){
    let temp = loadImage('assets/vidSourceTest/provokedSources/ps2/ps (' + (1 + i) + ').jpg');
    provokedFrameArr2.push(temp);
  }

  for (let i = 0; i < 60; i++){
    let temp = loadImage('assets/vidSourceTest/provokedSources/ps3/ps (' + (1 + i) + ').jpg');
    provokedFrameArr3.push(temp);
  }

  for (let i = 0; i < 60; i++){
    let temp = loadImage('assets/vidSourceTest/provokedSources/eye2/ps (' + (1 + i) + ').jpg');
    provokedFrameArr4.push(temp);
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
  
  //(rowNum, colNum, sizew, sizeh, startingPosx, startingPosy, frameSource, mode)
  let CGRowNum = 20;
  let CGColNum = 4;
  let CGSizew = 100;
  let CGSizeh = 100;
  let CGStartingPos = getStartingPos(CGRowNum, CGColNum, CGSizew, CGSizeh, windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup = new FrameTileGroup(CGRowNum, CGColNum, CGSizew, CGSizeh, 
    CGStartingPos[0], CGStartingPos[1], rotationalFrameArr1, provokedFrameArr1, 0);

  testTileGroup.setNoteArrays(bassNoteGroup2, melodyNoteGroup1);

  let CGRowNum1 = 10;
  let CGColNum1 = 5;
  let CGSizew1 = 100;
  let CGSizeh1  = 100;
  let CGStartingPos1 = getStartingPos(CGRowNum1, CGColNum1, CGSizew1, CGSizeh1, windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup1 = new FrameTileGroup(CGRowNum1, CGColNum1, CGSizew1, CGSizeh1, 
    CGStartingPos1[0], CGStartingPos1[1], rotationalFrameArr2, provokedFrameArr2, 0);

  testTileGroup1.setNoteArrays(bassNoteGroup3, melodyNoteGroup1);

  let HGRowNum = 3;
  let HGColNum = 36;
  let HGSizew = 50;
  let HGSizeh = 50;
  let HGStartingPos = getStartingPos(HGRowNum, HGColNum, HGSizew, HGSizeh, windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup2 = new FrameTileGroup(HGRowNum, HGColNum, HGSizew, HGSizeh,
     HGStartingPos[0], HGStartingPos[1], rotationalFrameArr3, provokedFrameArr3, 0);

  testTileGroup2.setNoteArrays(bassNoteGroup4, melodyNoteGroup1);

  let VGRowNum = 2;
  let VGColNum = 72;
  let VGSizew = 50;
  let VGSizeh = 50;
  let VGStartingPos = getStartingPos(VGRowNum, VGColNum, VGSizew, VGSizeh, windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup3 = new FrameTileGroup(VGRowNum, VGColNum, VGSizew, VGSizeh,
     VGStartingPos[0], VGStartingPos[1], rotationalFrameArr2, provokedFrameArr2, 0);

  testTileGroup3.setNoteArrays(bassNoteGroup5, melodyNoteGroup1);

  let BGRowNum = 2;
  let BGColNum = 5;
  let BGSizew = min(height, width) * 0.5;
  let BGSizeh = min(height, width) * 0.5;
  let BGStartingPos = getStartingPos(BGRowNum, BGColNum, BGSizew, BGSizeh, windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup4 = new FrameTileGroup(BGRowNum, BGColNum, BGSizew, BGSizeh,
     BGStartingPos[0], BGStartingPos[1], rotationalFrameArr4, provokedFrameArr4, 0);

  testTileGroup4.setNoteArrays(bassNoteGroup1, melodyNoteGroup1);


  groupArr.push(testTileGroup4, testTileGroup1, testTileGroup2, testTileGroup, testTileGroup3);
}

function draw() {
  //background(255, 126, 126);
  background(0);
  testTileGroup4.display(positionFunc1);
  testTileGroup1.display(positionFunc4);
  testTileGroup2.display(positionFunc2);
  testTileGroup.display(positionFunc1);
  testTileGroup3.display(positionFunc3);
}

function getStartingPos(rowNum, colNum, sizew, sizeh, groupCenterX, groupCenterY){
  let startingPosx = groupCenterX - sizew * (colNum - 1) * 0.5;
  let startingPosy = groupCenterY - sizeh * (rowNum - 1) * 0.5;
  return [startingPosx, startingPosy];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  testTileGroup1.repositionFrames(windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup.repositionFrames(windowWidth * 0.5, windowHeight * 0.5);
  
  
  testTileGroup2.repositionFrames(windowWidth * 0.5, windowHeight * 0.5);

  testTileGroup3.repositionFrames(windowWidth * 0.5, windowHeight * 0.5);
  testTileGroup4.repositionFrames(windowWidth * 0.5, windowHeight * 0.5);
}




function keyPressed(){
  
}



function mouseClicked(){
  let currentlyPlayingIndex;
  for (let i = groupArr.length - 1; i >= 0; i--){
    currentlyPlayingIndex = i;
    if (groupArr[i].mouseClickReactive()) {
      groupArr[i].bassOscillator.start();
      break;
    }
  }

  for (let i = groupArr.length - 1; i >= 0; i--){
    if (i != currentlyPlayingIndex){
      groupArr[i].bassOscillator.stop();
    }
  }
}

function positionFunc1(frame){
  frame.posVec.x = frame.initPosVec.x + 10 * Math.sin(frame.posVec.y + frameCount * 0.025);
}

function positionFunc2(frame){
  let d = 0.0005;
  let n = noise(frame.initPosVec.x * d + frameCount * 0.005);
  let amp = 200;
  n = map(n, 0, 1, -amp, amp);
  frame.posVec.y = frame.initPosVec.y + n;
}

function positionFunc3(frame){
  let d = 0.0005;
  let n = noise(frame.initPosVec.x * d + frameCount * 0.005 + 10);
  let amp = 400;
  n = map(n, 0, 1, -amp, amp);
  frame.posVec.y = frame.initPosVec.y + n;
}

function positionFunc4(frame){
  frame.posVec.x = frame.initPosVec.x + windowWidth * 0.25 * Math.sin(frame.posVec.y + frameCount * 0.005);
}


