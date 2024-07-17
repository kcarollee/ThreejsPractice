let testJson;

function preload(){
  testJson = loadJSON('test.json');
}
function setup(){
  createCanvas(800, 800);
}

function draw(){
  background(220);
  if (frameCount % 60 == 0){
    loadJSON("test.json", jsonCallBack);
  }

  circle(200 + 100 * sin(frameCount * 0.01), 500, 10);
}

function jsonCallBack(e){
  console.log(e["values"]);
  return e["values"];
}