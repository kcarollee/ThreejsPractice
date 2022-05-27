let shaderFile;
function preload(){
  shaderFile = loadShader('shader.vert', 'shader.frag');
}

function setup(){
  createCanvas(800, 800, WEBGL);
  
}

function draw(){
  background(220);
  shader(shaderFile);
  shaderFile.setUniform('resolution', [width, height]);
  rect(0, 0, 50, 50);

}