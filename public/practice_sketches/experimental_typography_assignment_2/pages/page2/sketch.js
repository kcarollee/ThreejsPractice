let textToShow = `We would frequent this playground for various activities such as making silly videos for a friend's birthday, getting inebriated throughout the entire night while talking about stuff that we felt that mattered at the time being, coming up with ideas for a concert poster, and etc. All of those happened during the latter half of the 8 year stay, by the way. `;
let pgMain, pgMainPost;

let textCopy;

let font;
let fontSize = 40;

let shd;

let centerImage;
let centerImagePosX, centerImagePosY; // DO NOT USE CENTER MODE

let easeMouseX = 1,
  easeMouseY = 1,
  easeVal = 0.05;

let imgRectXNum = 25;
let imgRectYNum = 25;
let imgRectWidth, imgRectHeight;

let bgImage;

let imgRectArr = [];

class ImageRect {
  constructor(posx, posy, width, height) {
    this.targetPosx = posx;
    this.targetPosy = posy;
    this.width = width;
    this.height = height;
    this.posx =
      random() > 0.5
        ? random(windowWidth, windowWidth * 1.5)
        : random(-windowWidth * 1.5, -windowWidth);
    this.posy =
      random() > 0.5
        ? random(windowHeight, windowHeight * 1.5)
        : random(-windowHeight * 1.5, -windowHeight);

    this.randx = map(random(), 0, 1, -100, 100);
    this.randy = map(random(), 0, 1, -100, 100);

    this.imageMask;
    this.setFlag = false;
  }

  updatePosition() {
    let mdx = mouseX - this.targetPosx;
    let mdy = mouseY - this.targetPosy;
    let mdist = dist(mouseX, mouseY, this.targetPosx, this.targetPosy);
    this.posx += (this.targetPosx - this.posx) / 10;
    this.posy += (this.targetPosy - this.posy) / 10;

    let mouseSpeedVal = dist(mouseX, mouseY, pmouseX, pmouseY);

    if (mdist < mouseSpeedVal) {
      this.posx += this.randx;
      this.posy += this.randy;
    }

    //this.posx = this.targetPosx;
    //this.posy = this.targetPosy;
  }

  setImageMask(img) {
    if (!this.setFlag) {
      this.imageMask = img.get(
        this.targetPosx,
        this.targetPosy,
        this.width,
        this.height
      );
    }
    this.setFlag = true;
  }

  display(img, pg) {
    this.updatePosition();
    this.setImageMask(img);
    pg.image(this.imageMask, this.posx, this.posy);

    //pg.rect(this.posx, this.posy, this.width, this.height);
  }

  // call this upon window resize
  resetSize(newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
  }
}

function generteImageRects() {
  imgRectArr = [];
  for (let y = 0; y < windowHeight; y += imgRectHeight) {
    for (let x = 0; x < windowWidth; x += imgRectWidth) {
      let imgRect = new ImageRect(x, y, imgRectWidth, imgRectHeight);
      imgRectArr.push(imgRect);
    }
  }
}

function preload() {
  centerImage = loadImage("p2.jpg");
  bgImage = loadImage("b3.jpg");
  font = loadFont("monospace.otf");
  shd = loadShader("shader.vert", "shader.frag");
}

function setup() {
  centerImage.resize(800, 400);

  pgMain = createGraphics(windowWidth, windowHeight);
  pgMain.textFont(font);
  pgMain.textSize(fontSize);

  pgMainPost = createGraphics(windowWidth, windowHeight);

  imgRectWidth = float(windowWidth) / float(imgRectXNum);
  imgRectHeight = float(windowHeight) / float(imgRectYNum);

  generteImageRects();
  createCanvas(windowWidth, windowHeight);
  centerImagePosX = windowWidth * 0.5 - centerImage.width * 0.5;
  centerImagePosY = windowHeight * 0.5 - centerImage.height * 0.5;

  textCopy = generateFullText();
}

function draw() {
  easeMouse();
  drawPg(pgMain);

  /*
  pgMainPost.shader(shd);
  shd.setUniform("resolution", [windowWidth, windowHeight]);
  shd.setUniform("mouse", [mouseX / windowWidth, mouseY / windowHeight]);
  shd.setUniform("mainTex", pgMain);
  */
  //pgMainPost.rect(0, 0, 10, 10);

  //pgMainPost.background(200, 150, 100);
  pgMainPost.image(bgImage, 0, 0, windowWidth, windowHeight);
  for (const imgRect of imgRectArr) {
    imgRect.display(pgMain, pgMainPost);
  }
  //image(pgMain, -windowWidth * 0.5, -windowHeight * 0.5);
  //resetMatrix();
  image(pgMainPost, 0, 0);
  if (mouseIsInImage()) tint(255, 50);
  else tint(255, 255);
  image(centerImage, centerImagePosX, centerImagePosY);
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

  centerImagePosX = windowWidth * 0.5 - centerImage.width * 0.5;
  centerImagePosY = windowHeight * 0.5 - centerImage.height * 0.5;
  resizeCanvas(windowWidth, windowHeight);

  generteImageRects();
  textCopy = generateFullText();
}
