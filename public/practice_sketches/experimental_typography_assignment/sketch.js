/*
TODO:
- ascii art in TextElement
- more 3d models that react to scroll
- create background title text with touchdesinger and make them move around in fun ways :)
- rectangular images -> various shapes
- scrollbar css
*/

const imgLinkArr = [
  "./images/0.jpg",
  "./images/1.jpg",
  "./images/2.jpg",
  "./images/3.jpg",
  "./images/4.jpg",
  "./images/5.jpg",
  "./images/6.jpg",
  "./images/7.jpg",
  "./images/8.jpg",
  "./images/9.jpg",
  "./images/10.jpg",
  "./images/11.jpg",
  "./images/12.jpg",
  "./images/13.jpg",
  "./images/14.jpg",
  "./images/15.jpg",
  "./images/16.jpg",
  "./images/17.jpg",
  "./images/18.jpg",
];

class TextElement {
  constructor(
    posX,
    posY,
    size,
    img,
    destPosX = null,
    destPosY = null,
    destSize = null
  ) {
    this.size = size;
    this.posX = posX;
    this.posY = posY;
    this.img = img;

    this.destPosX = destPosX;
    this.destPosY = destPosY;
    this.destSize = destSize;

    this.elem = null;

    this.prevWindowWidth = window.innerWidth;
    this.prevWindowHeight = window.innerHeight;
  }

  updatePos() {
    if (this.destPosX != null && abs(this.destPosX - this.posX) > 10) {
      this.posX += (this.destPosX - this.posX) / 40;
      this.posY += (this.destPosY - this.posY) / 40;
      this.elem.position(this.posX, this.posY);
    }
  }

  updateSize() {
    if (this.destSize != null) {
      this.size += (this.destSize - this.size) / 40;
      this.elem.style("width", this.size + "vw");
    }
  }

  create() {
    this.elem = createDiv(this.img, "OOPS");
    this.elem.position(this.posX, this.posY);
    // px -> vw로 바꾸기: 화면에 따라 사이즈가 같이 바꿔진다.
    // 브라우저 창 자체를 키워보는 것도 한번 고려해보자
    // 전체적으로 위에서 바라보는것 같은 효과도
    // 네모들 말고 다른 모양들도 시도해보자
    // even the leaves on the buildings are turning red and then I realize it's already almost end of october
    //this.elem.style("position", "relative");
    this.elem.style("width", this.size + "vw");
    this.elem.style("z-index", "0");
    let elemRef = this.elem;
    this.elem.mouseOver(() => {
      elemRef.style("opacity", "0.5");
    });

    this.elem.mouseOut(() => {
      elemRef.style("opacity", "1.0");
    });

    this.elem.mouseClicked(() => {
      let defaultImageWidth = 25;

      let randDestPosX1 = this.posX + 200 * Math.cos(random(0, PI));

      let randDestPosY1 = this.posY + 200 * Math.sin(random(0, PI));

      let randDestPosX2 = this.posX + 200 * Math.cos(random(0, PI));
      let randDestPosY2 = this.posY + 200 * Math.sin(random(0, PI));

      let newElem = new TextElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        imgLinkArr[int(random(0, 19))],
        randDestPosX1,
        randDestPosY1,
        defaultImageWidth
      );
      newElem.create();

      let newElem2 = new TextElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        imgLinkArr[int(random(0, 19))],
        randDestPosX2,
        randDestPosY2,
        defaultImageWidth
      );
      newElem2.create();
      elemRef.remove();
    });

    TextElement.elementArr.push(this);
  }

  onWindowResize() {
    this.posX = (window.innerWidth * this.posX) / this.prevWindowWidth;
    this.posY = (window.innerHeight * this.posY) / this.prevWindowHeight;
    this.destPosX = (window.innerWidth * this.destPosX) / this.prevWindowWidth;
    this.destPosY =
      (window.innerHeight * this.destPosY) / this.prevWindowHeight;
    this.elem.position(this.posX, this.posY);
    this.prevWindowWidth = window.innerWidth;
    this.prevWindowHeight = window.innerHeight;
  }
}

class ImageElement {
  constructor(
    posX,
    posY,
    size,
    img,
    destPosX = null,
    destPosY = null,
    destSize = null
  ) {
    this.size = size;
    this.posX = posX;
    this.posY = posY;
    this.img = img;

    this.destPosX = destPosX;
    this.destPosY = destPosY;
    this.destSize = destSize;

    this.elem = null;

    this.prevWindowWidth = window.innerWidth;
    this.prevWindowHeight = window.innerHeight;
  }

  updatePos() {
    if (this.destPosX != null && abs(this.destPosX - this.posX) > 10) {
      this.posX += (this.destPosX - this.posX) / 40;
      this.posY += (this.destPosY - this.posY) / 40;
      this.elem.position(this.posX, this.posY);
    }
  }

  updateSize() {
    if (this.destSize != null) {
      this.size += (this.destSize - this.size) / 40;
      this.elem.style("width", this.size + "vw");
    }
  }

  create() {
    this.elem = createImg(this.img, "OOPS");
    this.elem.position(this.posX, this.posY);
    // px -> vw로 바꾸기: 화면에 따라 사이즈가 같이 바꿔진다.
    // 브라우저 창 자체를 키워보는 것도 한번 고려해보자
    // 전체적으로 위에서 바라보는것 같은 효과도
    // 네모들 말고 다른 모양들도 시도해보자
    // even the leaves on the buildings are turning red and then I realize it's already almost end of october
    //this.elem.style("position", "relative");
    this.elem.style("width", this.size + "vw");
    this.elem.style("z-index", "0");
    let elemRef = this.elem;
    this.elem.mouseOver(() => {
      elemRef.style("opacity", "0.5");
    });

    this.elem.mouseOut(() => {
      elemRef.style("opacity", "1.0");
    });

    this.elem.mouseClicked(() => {
      let defaultImageWidth = 25;

      let randDestPosX1 = this.posX + 200 * Math.cos(random(0, PI));

      let randDestPosY1 = this.posY + 200 * Math.sin(random(0, PI));

      let randDestPosX2 = this.posX + 200 * Math.cos(random(0, PI));
      let randDestPosY2 = this.posY + 200 * Math.sin(random(0, PI));

      let newElem = new ImageElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        imgLinkArr[int(random(0, 19))],
        randDestPosX1,
        randDestPosY1,
        defaultImageWidth
      );
      newElem.create();

      let newElem2 = new ImageElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        imgLinkArr[int(random(0, 19))],
        randDestPosX2,
        randDestPosY2,
        defaultImageWidth
      );
      newElem2.create();
      elemRef.remove();
    });

    ImageElement.elementArr.push(this);
  }

  onWindowResize() {
    this.posX = (window.innerWidth * this.posX) / this.prevWindowWidth;
    this.posY = (window.innerHeight * this.posY) / this.prevWindowHeight;
    this.destPosX = (window.innerWidth * this.destPosX) / this.prevWindowWidth;
    this.destPosY =
      (window.innerHeight * this.destPosY) / this.prevWindowHeight;
    this.elem.position(this.posX, this.posY);
    this.prevWindowWidth = window.innerWidth;
    this.prevWindowHeight = window.innerHeight;
  }
}

ImageElement.elementArr = [];
TextElement.elementArr = [];

let firstImage;
let font;
let text =
  "It's getting harder and harder to cram in new information into this tiny brain of mine; I might as well be a bird by this point, but oh no, where the hell are my wings at? I've managed to pick up some of the scattered pieces, and I'm just hoping that these will be enough for me to work with for the rest of my life. If not, oh well, the world is my resource. ";
function preload() {
  font = loadFont("assets/fonts/helvetica.ttf");
}

function setup() {
  let defaultImageWidth = 25;
  firstImage = new ImageElement(
    window.innerWidth * 0.5 - defaultImageWidth * 0.5,
    window.innerHeight * 0.5 - defaultImageWidth * 0.5,
    defaultImageWidth,
    "./images/0.jpg"
  );
  firstImage.create();

  let testTex = createDiv("FRAGMENTED MEMORIES OF THE SEMESTER");
  testTex.position(10, 10);
  testTex.style("color", "CornflowerBlue");
  testTex.style("font-family", "Helvetica");
  testTex.style("font-size", "50px");
}

function draw() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.updatePos();
    elem.updateSize();
  });

  TextElement.elementArr.forEach(function (elem) {
    elem.updatePos();
    elem.updateSize();
  });
}

function windowResized() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.onWindowResize();
  });
}
