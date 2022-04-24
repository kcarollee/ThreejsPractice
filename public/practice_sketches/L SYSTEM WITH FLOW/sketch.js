let branchShader, flowShader;
let pgBranch, pgLeaves, pgFlow, pgFlowFeedback;
let captureCur, capturePrev;
function preload(){
  // pixel displacement 셰이더
  branchShader = loadShader('shaders/branchShader.vert', 'shaders/branchShader.frag');
  // optical flow 셰이더
  flowShader = loadShader('shaders/flowShader.vert', 'shaders/flowShader.frag');
  
}

let testTree;

function setup(){
  createCanvas(800, 800, WEBGL);
  // 가지들을 그릴 WEBGL 캔버스
  pgBranch = createGraphics(800, 800, WEBGL);
  
  // 나뭇잎들을 그릴 WEBGL 캔버스
  pgLeaves = createGraphics(800, 800, WEBGL);
  pgLeaves.noStroke();
  
  // optical flow 텍스쳐를 위한 WEBGL 캔버스
  pgFlow = createGraphics(800, 800, WEBGL);

  // 테스트용 LSystemTree()
  testTree = new LSystemTree();
  testTree.generateFinalRule();
  testTree.generateLeaves();
  
  imageMode(CENTER);

  // 현재 웹캠 프레임
  captureCur = createCapture(VIDEO);
  captureCur.size(800, 800);
  // 전 웹캠 프레임을 저장할 캔버스. 
  // capturePrev = captureCur.get()방식을 사용하면 스케치가 30초 정도 지나 WEBGL CONTEXT LOST 에러가 나서 튕긴다. 
  capturePrev = createGraphics(800, 800);
  // feedback loop을 위해  pgFlow의 전 프레임을 저장할 캔버스
  pgFlowFeedback = createGraphics(800, 800);
  
 
  
}

function draw(){

  
  // pgBranch에서 background()를 콜하지 않는다
  // 매 프레임마다 가지를 그리는 것은 매우 비효율적이기 때문에 
  // 한번만 렌더한다. displayBranches()함수내의 this.singleRun 플래그가 한번만 렌더되게 한다. 
  pgBranch.stroke(255, 0, 0);
  testTree.displayBranches(pgBranch);

  
 


  // branchShader는 간단한 pixel displacement를 해준다. -> 가지가 흔들거리는 연출 
  shader(branchShader);
  branchShader.setUniform('resolution', [pgBranch.width, pgBranch.height]);
  branchShader.setUniform('time', frameCount * 0.1);
  branchShader.setUniform('texBranch', pgBranch);
  //quad(-1, -1, 1, -1, 1, 1, -1, 1);
  

  //image(pgBuffer, 0, 0);


  //////////////////// OPTICAL FLOW 
  
  pgFlow.shader(flowShader);
  flowShader.setUniform('resolution', [width, height]);
  flowShader.setUniform('tex0', captureCur);
  flowShader.setUniform('tex1', capturePrev);
  flowShader.setUniform('backbuffer', pgFlowFeedback);
  flowShader.setUniform('offset', 3.0);
  flowShader.setUniform('threshold', 0.2);
  flowShader.setUniform('force', [3.0, 3.0]);
  flowShader.setUniform('power', 2.0);
  pgFlow.rect(0, 0, 10, 10);
    
  capturePrev.image(captureCur, 0, 0, 800, 800);

  pgFlowFeedback.image(pgFlow, 0, 0);
  
  //image(pgFlow, 0, -400, 400, 800);

  pgLeaves.background(60);
  pgLeaves.stroke(255);
  pgFlow.loadPixels();
  testTree.updateLeaves(pgFlow);
  testTree.displayLeaves(pgLeaves);

  image(pgFlow, 0, 0);
  //console.log(pgFlow.get(0, 0));
}