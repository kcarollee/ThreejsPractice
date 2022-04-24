let shaderFile;
let captureCur, capturePrev;
let stats;

let pgFlow, pgFlowFeedback;
function preload(){
  shaderFile = loadShader('shader.vert', 'shader.frag');
}

function setup(){
  createCanvas(800, 800);
  pgFlow = createGraphics(800, 800, WEBGL);
  captureCur = createCapture(VIDEO);
  captureCur.size(800, 800);
  //capturePrev = createImage(captureCur.width, captureCur.height);
  initStats();
  capturePrev = createGraphics(800, 800);
  pgFlowFeedback = createGraphics(800, 800);
}
let count = 0;
function draw(){
  stats.update();
  pgFlow.shader(shaderFile);
  shaderFile.setUniform('resolution', [width, height]);
  shaderFile.setUniform('tex0', captureCur);
  shaderFile.setUniform('tex1', capturePrev);
  shaderFile.setUniform('backbuffer', pgFlowFeedback);
  shaderFile.setUniform('offset', 3.0);
  shaderFile.setUniform('threshold', 0.1);
  shaderFile.setUniform('force', [3.0, 3.0]);
  shaderFile.setUniform('power', 2.0);
  pgFlow.rect(0, 0, 10, 10);
    
  capturePrev.image(captureCur, 0, 0, 800, 800);

  pgFlowFeedback.image(pgFlow, 0, 0);
  image(pgFlow, 0, 0);
}

function initStats(){
  stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    return stats;
}