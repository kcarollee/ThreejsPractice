let shaderFile;
let pg;
let img;
let texXDim, texYDim;
let wDiv, hDiv;
function preload(){
  shaderFile = loadShader('shader.vert', 'shader.frag');
}

function setup(){
  createCanvas(800, 800, WEBGL);
  texXDim = 25;
  texYDim = 25;
  pg = createGraphics(texXDim, texYDim, WEBGL);
  pg.pixelDensity(1);
  img = createImage(texXDim, texYDim);
  imageMode(CENTER);
  rectMode(CENTER);

  wDiv = width / texXDim;
  hDiv = height / texYDim;
}

function draw(){
  background(0);
  
  pg.background(210);
  pg.shader(shaderFile);
  shaderFile.setUniform('resolution', [pg.width, pg.height]);
  shaderFile.setUniform('time', frameCount * 0.01);
  pg.rect(0, 0, texXDim, texYDim);
  

  
  // keep in mind that the origin is in the CENTER of the canvas in WEBGL mode
  img.copy(pg, -texXDim * 0.5, -texYDim * 0.5, texXDim, texYDim, 0, 0, texXDim, texYDim);
  //img.loadPixels();
  
  //noStroke();

  stroke(255);
  for (let y = 0; y < texYDim; y++){
    for (let x = 0; x < texXDim; x++){
      let c = img.get(x, y);
      let x1, x2, y1, y2;
      x1 = -0.5 * width + wDiv * x;
      x2 = -0.5 * width + wDiv * (x + 1);

      y1 = -0.5 * height + hDiv * y;
      y2 = -0.5 * height + hDiv * (y + 1);

      let centerX = (x1 + x2) * 0.5;
      let centerY = (y1 + y2) * 0.5;
      push();
      translate(-centerX, -centerY);
      rotate(map(c[0], 0, 255, 0, 2 * Math.PI));
      line(-wDiv * 0.5, -hDiv * 0.5, wDiv * 0.5, hDiv * 0.5);
      pop();
      /*
      let n = c[0] + c[1];
      n = map(n, 0, 510, 1, 2);
      
      n = Math.pow(n, 2);
      let xpos = -0.5 * width + wDiv * (0.5 + x);
      let ypos = -0.5 * height + hDiv * (0.5 + y);

      fill(c[0] + c[1]);
      rect(xpos, ypos, 10 * n, 10 * n);
      */


    }
  }
  

  
  
  
  image(img, 0, 0);
  console.log(getFrameRate());
}