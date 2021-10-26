let img;
let imgComp;
let firstLoop = true;
function setup(){
  img = loadImage('test.jpg');


  imgComp = createImage(800, 800);
  createCanvas(800, 800);
}

function draw(){
  background(220);
  image(img, 0, 0);
  if (firstLoop){
    img.loadPixels();
    console.log(img.pixels);
    img.updatePixels();
    firstLoop = !firstLoop;
  }
}

function DiscreteCosineTransform(){

}