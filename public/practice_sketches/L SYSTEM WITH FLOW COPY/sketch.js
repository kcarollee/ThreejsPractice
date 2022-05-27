let leafShader,  flowShader, combineShader, leavesBackbufferShader;
let pgBranch, pgLeafTexture, pgLeafIdleTexture, pgLeaves, pgFlow, pgFlowFeedback;

let pgLeavesAdditive, pgLeavesPrev;
let pgLeafTextureArr = [];
let pgLeafTextureArrFilled = false;
let pgLeafTextureNum = 50;
let captureCur, capturePrev;
let loadCount = 0;
let leafTexVideo;

let MAX_BOID_LEAVES_NUM = 50;
let boidLeavesArr = [];
let wokenBoidLeavesArr = [];

let idleLeafTex;
function preload(){
  // 움직이는 나뭇잎의 텍스쳐를 그려줄 셰이더
  leafShader = loadShader('shaders/leafShader.vert', 'shaders/leafShader.frag');

  // optical flow 셰이더
  flowShader = loadShader('shaders/flowShader.vert', 'shaders/flowShader.frag');
  // pgBranch, pgLeaves, pgFlow를 합칠 셰이더
  combineShader = loadShader('shaders/combineShader.vert', 'shaders/combineShader.frag');
  leavesBackbufferShader = loadShader('shaders/leavesBackbufferShader.vert', 'shaders/leavesBackbufferShader.frag');


}

let testTree;

function setup(){
  createCanvas(800, 800, WEBGL);
  // 가지들을 그릴 WEBGL 캔버스
  //pgBranch = createGraphics(800, 800, WEBGL);
  
  // 나뭇잎 텍스쳐를 그릴  WEBGL 캔버스
  pgLeafTexture = createGraphics(200, 200, WEBGL);
  
  pgLeavesAdditive = createGraphics(800, 800, WEBGL);
  // 나뭇잎들을 그릴 WEBGL 캔버스
  pgLeaves = createGraphics(800, 800, WEBGL);
  pgLeaves.rectMode(pgLeaves.CENTER);
  pgLeaves.noStroke();
  pgLeavesPrev = createGraphics(800, 800);

  
  // optical flow 텍스쳐를 위한 WEBGL 캔버스
  pgFlow = createGraphics(800, 800, WEBGL);

 
  
  imageMode(CENTER);

  // 현재 웹캠 프레임
  captureCur = createCapture(VIDEO);
  captureCur.hide();
  captureCur.size(800, 800);
  // 전 웹캠 프레임을 저장할 캔버스. 
  // capturePrev = captureCur.get()방식을 사용하면 스케치가 30초 정도 지나 WEBGL CONTEXT LOST 에러가 나서 튕긴다. 
  capturePrev = createGraphics(800, 800);
  // feedback loop을 위해  pgFlow의 전 프레임을 저장할 캔버스
  pgFlowFeedback = createGraphics(800, 800);
  
  for (let i = 0; i < MAX_BOID_LEAVES_NUM; i++){
    let tempLeaf = new Leaf(random(-1, 1), random(-1, 1), random(30, 60));
    boidLeavesArr.push(tempLeaf);
  }
  
}

function draw(){

  
  // leafShader는 나뭇잎 텍스쳐를 그려준다. 
  pgLeafTexture.shader(leafShader);
  leafShader.setUniform('resolution', [pgLeafTexture.width, pgLeafTexture.height]);
  leafShader.setUniform('time', frameCount * 0.01);
  pgLeafTexture.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  
 
  // pgLeafTexture.loadPixels();
  // loadCount가 어느 정도 지나야 pgLeafTextureArr에 빈 프레임이 안들어간다. 
  if (loadCount > 10){
    if (pgLeafTextureArr.length < pgLeafTextureNum){
      let pgLeafCopy = pgLeafTexture.get();
      pgLeafTextureArr.push(pgLeafCopy);
    }

    else {
      let pgLeafTemp = pgLeafTextureArr.shift();
      pgLeafTextureArr.push(pgLeafTemp);
      pgLeafTextureArrFilled = true;
    }
  } 
  
  //pgLeafTexture.updatePixels();
  
  //console.log(pgLeafTextureArr.length);

  //image(pgLeafTexture, 0, 0);
  

  // OPTICAL FLOW 
  
  pgFlow.shader(flowShader);
  flowShader.setUniform('resolution', [width, height]);
  flowShader.setUniform('tex0', captureCur);
  flowShader.setUniform('tex1', capturePrev);
  flowShader.setUniform('backbuffer', pgFlowFeedback);
  flowShader.setUniform('offset', 1.0);
  flowShader.setUniform('time', frameCount * 0.01);
  pgFlow.rect(0, 0, 10, 10);
  
  // 웹캠 캡쳐 이전 프레임
  capturePrev.image(captureCur, 0, 0, 800, 800);
  
  // diffuse효과를 주기위해 pgFlow캔버스의 이전 프레임을 저장한다. 
  pgFlowFeedback.image(pgFlow, 0, 0);
  
  //image(pgFlow, 0, -400, 400, 800);

  // LEAVES

  pgLeaves.background(0);
  
  pgFlow.loadPixels();

  if (loadCount < 40) loadCount++;
  else {
    let leavesArrPtr = boidLeavesArr;
    boidLeavesArr.forEach(function(leaf){
      leaf.updateBasedOnTexture(pgFlow);
      // kill leaves based on lifespan
      if (leaf.lifecount > Leaf.lifespan){
        let leafIndex = leavesArrPtr.indexOf(leaf);
        leavesArrPtr.splice(leafIndex, 1);
      }
    });

    if (boidLeavesArr.length < MAX_BOID_LEAVES_NUM){
      let fillNum = MAX_BOID_LEAVES_NUM - boidLeavesArr.length;
      for (let i = 0; i < fillNum; i++){
        let tempLeaf = new Leaf(random(-1, 1), random(-1, 1), random(30, 60));
          boidLeavesArr.push(tempLeaf);
      }
    }
  }
  //testTree.updateLeaves(pgFlow);
  //testTree.displayLeaves(pgLeaves, pgLeafTextureArr);
  boidLeavesArr.forEach(function(leaf){
    leaf.simulateFlock(boidLeavesArr);
    leaf.updateBasedOnFlocking();
    leaf.display(pgLeaves, pgLeafTextureArr);
    
  });

  pgLeavesAdditive.shader(leavesBackbufferShader);
  leavesBackbufferShader.setUniform('currentBuffer', pgLeaves);
  leavesBackbufferShader.setUniform('backbuffer', pgLeavesPrev);
  pgLeavesAdditive.rect(0, 0, 10, 10);

  
  
  // COMBINE EVERYTHING
  shader(combineShader);
  combineShader.setUniform('resolution', [width, height]);
  combineShader.setUniform('leavesTex', pgLeavesAdditive);


  combineShader.setUniform('flowTex', pgFlow);
  combineShader.setUniform('time', frameCount * 0.01);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);

  pgLeavesPrev.image(pgLeavesAdditive, 0, 0);
 
}

function keyPressed(){
  switch(key){
    case 1:
      Leaf.boidMovementMode++;
      Leaf.boidMovementMode %= 2;
      break;
  }
}





