/*
TODO:
- ascii art in TextElement
- more 3d models that react to scroll
- create background title text with touchdesinger and make them move around in fun ways :)
- rectangular images -> various shapes
- scrollbar css
*/

const imgLinkArr = [
  "./images/0.png",
  "./images/1.png",
  "./images/2.png",
  "./images/3.png",
  "./images/4.png",
  "./images/5.png",
  "./images/6.png",
  "./images/7.png",
  "./images/8.png",
  "./images/9.png",
  "./images/10.png",
  "./images/11.png",
  "./images/12.png",
  "./images/13.png",
  "./images/14.png",
  "./images/15.png",
  "./images/16.png",
];

class TextElement {
  constructor(
    posX,
    posY,
    widthTexNum,
    heightTexNum,
    asciiFunc,
    destPosX = null,
    destPosY = null
  ) {
    this.widthTexNum = widthTexNum;
    this.heightTexNum = heightTexNum;
    this.asciiFunc = asciiFunc;

    this.posX = posX;
    this.posY = posY;

    this.destPosX = destPosX;
    this.destPosY = destPosY;

    this.asciiMode = int(random() * 2);
  }

  updatePos() {
    if (this.destPosX != null && abs(this.destPosX - this.posX) > 10) {
      this.posX += (this.destPosX - this.posX) / 40;
      this.posY += (this.destPosY - this.posY) / 40;
      this.elem.position(this.posX, this.posY);
    }
  }

  create() {
    this.text = this.generateText(this.asciiFunc);
    this.elem = createElement("div", this.text);
    this.elem.position(this.posX, this.posY);
    this.elem.style("border", " solid white");
    this.elem.style("font-family", "monospace");
    this.elem.style("color", "white");
    this.elem.style("width", "fit-content");

    TextElement.elementArr.push(this);
  }

  generateText(asciiFunc) {
    let text = "";
    let index = 0;
    for (let y = 0; y < this.heightTexNum; y++) {
      for (let x = 0; x < this.widthTexNum; x++) {
        let greyScale = this.asciiFunc(x, y);

        /*
        text +=
          TextElement.defaultString[index % TextElement.defaultString.length];
        */
        text += TextElement.greyScaleArr[int(greyScale)];
        index++;
      }
      text += "<br>";
    }
    return text;
  }

  update() {
    this.text = this.generateText(
      this.widthTexNum,
      this.heightTexNum,
      this.asciiFunc
    );
    this.elem.html(this.text);
  }
}

TextElement.elementArr = [];
TextElement.greyScaleArr = [".", "-", "~", ":", ":", "=", "!", "*", "#", "$"];
TextElement.defaultString =
  "It'sgettingharderandhardertocraminnewinformationintothistinybrainofmine;Imightaswellbeabirdbythispoint,butohno,wherethehellaremywingsat?I'vemanagedtopickupsomeofthescatteredpieces,andI'mjusthopingthatthesewillbeenoughformetoworkwithfortherestofmylife.Ifnot,ohwell,theworldismyresource.";
function asciiFunc1(x, y) {
  return (
    noise((x + frameCount * 0.1) * 0.05, (y + frameCount * 0.1) * 0.05) * 10
  );
}

function asciiFunc2(x, y) {}

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
        1,

        imgLinkArr[int(random(0, 17))],
        randDestPosX1,
        randDestPosY1,
        defaultImageWidth
      );
      newElem.create();

      let newElem2 = new ImageElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        imgLinkArr[int(random(0, 17))],
        randDestPosX2,
        randDestPosY2,
        defaultImageWidth
      );
      newElem2.create();
      if (random() < 0.3) {
        // gotta cram in as much as i can before today's critique

        // how're you doing?? hope everything's going swell :)
        let newElem3 = new TextElement(
          this.posX,
          this.posY,
          20,
          10,
          asciiFunc1,
          randDestPosX2,
          randDestPosY2
        );
        newElem3.create();
      }
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

let testTextElement;
let font;
let text =
  "It's getting harder and harder to cram in new information into this tiny brain of mine; I might as well be a bird by this point, but oh no, where the hell are my wings at? I've managed to pick up some of the scattered pieces, and I'm just hoping that these will be enough for me to work with for the rest of my life. If not, oh well, the world is my resource. ";
function preload() {
  font = loadFont("assets/fonts/helvetica.ttf");
}

function setup() {
  let defaultImageWidth = 25;
  let firstImagesNum = 5;
  for (let i = 0; i < firstImagesNum; i++) {
    let firstImage = new ImageElement(
      random(0, windowWidth * 0.75),
      random(0, windowHeight * 0.5),
      defaultImageWidth,
      "./images/" + int(random(0, 17)) + ".png"
    );
    firstImage.create();
  }

  let testTex = createDiv("FRAGMENTED MEMORIES OF THE SEMESTER");
  testTex.position(10, 10);
  testTex.style("color", "CornflowerBlue");
  testTex.style("font-family", "Helvetica");
  testTex.style("font-size", "50px");

  let testTextElement = new TextElement(0, 0, 40, 20, asciiFunc1);
  testTextElement.create();
}

function draw() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.updatePos();
    elem.updateSize();
  });

  TextElement.elementArr.forEach(function (elem) {
    elem.update();
    elem.updatePos();
  });
}

function windowResized() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.onWindowResize();
  });
}
