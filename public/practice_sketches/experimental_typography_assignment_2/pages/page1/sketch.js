let textToShow = `8 years, half of which went by with nothing significant ever happening, but the other half was an absolutely turbulent ride. I'd be lying if I said I did not enjoy the ride at all, but some parts of the trip was pretty damn excrucating. `;
let pgMain, pgMainPost, pgPre, pgPost, pgBackbuffer;

let textCopy;

let font;
let fontSize = 40;

let shd, shd2;

let centerImage;
let centerImagePosX, centerImagePosY; // DO NOT USE CENTER MODE

let easeMouseX = 1,
  easeMouseY = 1,
  easeVal = 0.05;

function preload() {
  centerImage = loadImage("p1.jpg");
  font = loadFont("monospace.otf");
  shd = loadShader("shader.vert", "shader.frag");
  shd2 = loadShader("shader2.vert", "shader2.frag");
}

function setup() {
  centerImage.resize(800, 400);

  pgMain = createGraphics(windowWidth, windowHeight);
  pgMain.textFont(font);
  pgMain.textSize(fontSize);

  pgMainPost = createGraphics(windowWidth, windowHeight, WEBGL);

  pgPre = createGraphics(windowWidth, windowHeight, WEBGL);
  pgPost = createGraphics(windowWidth, windowHeight, WEBGL);
  pgPost.textureWrap(REPEAT);

  pgBackbuffer = createGraphics(windowWidth, windowHeight);

  createCanvas(windowWidth, windowHeight);
  centerImagePosX = windowWidth * 0.5 - centerImage.width * 0.5;
  centerImagePosY = windowHeight * 0.5 - centerImage.height * 0.5;

  textCopy = generateFullText();
}

function draw() {
  easeMouse();
  drawPg(pgMain);

  pgPre.background(0);
  pgPre.noStroke();
  pgPre.ellipse(
    mouseX - windowWidth * 0.5,
    mouseY - windowHeight * 0.5,
    100,
    100
  );
  pgPre.resetMatrix();
  pgPre._renderer._update();

  pgPost.shader(shd);
  shd.setUniform("texture", pgPre);

  shd.setUniform("time", frameCount * 0.01);
  shd.setUniform("backbuffer", pgBackbuffer);
  shd.setUniform("resolution", [windowWidth, windowHeight]);
  shd.setUniform("mouse", [
    easeMouseX / windowWidth,
    easeMouseY / windowHeight,
  ]);
  pgPost.rect(0, 0, 10, 10);

  pgMainPost.shader(shd2);
  shd2.setUniform("resolution", [windowWidth, windowHeight]);
  shd2.setUniform("mainTex", pgMain);
  shd2.setUniform("dispTex", pgPost);
  pgMainPost.rect(0, 0, 10, 10);
  //image(pgMain, -windowWidth * 0.5, -windowHeight * 0.5);
  //resetMatrix();
  image(pgMainPost, 0, 0);
  if (mouseIsInImage()) tint(255, 50);
  else tint(255, 255);
  image(centerImage, centerImagePosX, centerImagePosY);

  pgBackbuffer.image(pgPost, 0, 0);
  //image(pgBackbuffer, 0, 0, 100, 100);
}

function easeMouse() {
  let tx = mouseX;
  let dx = tx - easeMouseX;
  easeMouseX += dx * easeVal;

  let ty = mouseY;
  let dy = ty - easeMouseY;
  easeMouseY += dy * easeVal;
}

function mouseClicked() {
  if (mouseIsInImage()) {
    location.href = "../../";
  }
}

function mouseIsInImage() {
  if (
    mouseX > centerImagePosX &&
    mouseX < centerImagePosX + centerImage.width
  ) {
    if (
      mouseY > centerImagePosY &&
      mouseY < centerImagePosY + centerImage.height
    )
      return true;
    return false;
  }
  return false;
}

function generateFullText() {
  let str = "";
  let totalHeight = 0;
  let textIndex = 0;

  // since it's a monospace font, do a quick bound check
  let boundX = 0;
  let testStr = "";
  while (font.textBounds(testStr, 0, 0, fontSize).w < windowWidth) {
    testStr += "a";
    boundX++;
  }

  // now we have our boundX value, which is the max number of characters we can have horizontally
  for (; totalHeight < windowHeight; totalHeight += fontSize) {
    for (let i = 0; i < boundX; i++) {
      if (i == boundX - 1) {
        str += "\n";
        continue;
      }
      str += textToShow[textIndex];
      textIndex++;
      textIndex %= textToShow.length;
    }
  }

  return str;
}

function drawPg(pg) {
  pg.background(0);
  pg.fill(255);
  pg.text(textCopy, 0, fontSize);
}

function windowResized() {
  pgMain.resizeCanvas(windowWidth, windowHeight);
  pgMainPost.resizeCanvas(windowWidth, windowHeight);
  pgPre.resizeCanvas(windowWidth, windowHeight);
  pgPost.resizeCanvas(windowWidth, windowHeight);
  pgBackbuffer.resizeCanvas(windowWidth, windowHeight);
  centerImagePosX = windowWidth * 0.5 - centerImage.width * 0.5;
  centerImagePosY = windowHeight * 0.5 - centerImage.height * 0.5;
  resizeCanvas(windowWidth, windowHeight);
  textCopy = generateFullText();
}
