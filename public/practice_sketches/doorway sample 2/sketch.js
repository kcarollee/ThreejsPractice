let shaderFile;
function preload(){
  shaderFile = loadShader('shader.vert', 'shader.frag');
}

function setup(){
  createCanvas(800, 800, WEBGL);
  smooth(8);
}

function draw(){
  background(220);
  shader(shaderFile);
  shaderFile.setUniform('resolution', [width, height]);
  shaderFile.setUniform('time', frameCount * 0.01);
  rect(0, 0, 50, 50);

}