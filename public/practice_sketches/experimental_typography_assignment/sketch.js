/*
TODO:
- ascii art in TextElement
- more 3d models that react to scroll
- create background title text with touchdesinger and make them move around in fun ways :)
- rectangular images -> various shapes
- scrollbar css
*/

let imageInfoArr = [];
let startTransition = false;
let totalScreenHeight2 = window.innerHeight;
let allOpacity = 1;
let flag500 = false;
let flag1000 = false;
let flag1500 = false;
let flag2000 = false;
let flag2500 = false;
let flag3000 = false;
let flag3500 = false;

let resetFlag = false;
let resetEndFlag = false;
let resetDoneFlag = false;
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
];

class TextElement {
  constructor(
    posX,
    posY,
    widthTexNum,
    heightTexNum,
    asciiFunc,
    destPosX = null,
    destPosY = null,
    mode,
    phraseIndex
  ) {
    this.widthTexNum = widthTexNum;
    this.heightTexNum = heightTexNum;
    this.asciiFunc = asciiFunc;

    this.posX = posX;
    this.posY = posY;

    this.destPosX = destPosX;
    this.destPosY = destPosY;

    this.asciiMode = mode;
    this.phraseIndex = phraseIndex;

    if (this.asciiMode == 0) this.fontSize = int(random(15, 20));
    else this.fontSize = int(random(70, 90));
  }

  updatePos() {
    if (this.destPosX != null && abs(this.destPosX - this.posX) > 10) {
      this.posX += (this.destPosX - this.posX) / 40;
      this.posY += (this.destPosY - this.posY) / 40;
      this.elem.position(this.posX, this.posY);
    }
  }

  create() {
    if (this.asciiMode == 0) this.text = this.generateText(this.asciiFunc);
    else this.text = this.generateText2(this.phraseIndex);
    this.elem = createElement("div", this.text);
    this.elem.style("font-weight", "bold");
    if (this.asciiMode == 0) {
      this.elem.position(this.posX, this.posY);
      this.elem.style("color", "rgb(255, 165, 0)");
    } else {
      this.elem.position(random(0, width), mouseY);

      this.elem.style("color", "rgb(173,216,230)");
    }
    this.elem.style("border", " solid white");
    this.elem.style("font-family", "Consolas");
    this.elem.style("font-size", this.fontSize + "px");

    this.elem.style("width", "fit-content");
    //this.elem.style("display", "inline-block");
    this.elem.style("margin", "10px");
    this.elem.style("z-index", "2");

    if (this.asciiMode == 1) {
      this.elem.mouseOver(() => {
        if (startTransition) {
          this.phraseIndex = 8;
        }
      });

      this.elem.mouseOut(() => {
        if (startTransition) {
          this.phraseIndex = 7;
        }
      });

      this.elem.mouseClicked(() => {
        if (startTransition) {
          startTransition = false;
          resetFlag = true;
        }
      });
    }
    //this.elem.style("justify-content", "center");
    //if (this.asciiMode == 1) this.elem.style("position", "fixed");
    //this.elem.style("position", "fixed");

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

  generateText2(phraseIndex) {
    let phrase = TextElement.phraseArr[phraseIndex];

    let startIndex = int(frameCount * 0.1);
    let text = "";
    for (let i = 0; i < phrase.length; i++) {
      let index = (startIndex + i) % phrase.length;
      text += phrase[index];
    }

    return text;
  }

  update() {
    if (this.asciiMode == 0) {
      this.text = this.generateText(
        this.widthTexNum,
        this.heightTexNum,
        this.asciiFunc
      );
    } else {
      this.text = this.generateText2(this.phraseIndex);
    }
    this.elem.html(this.text);
  }
}

TextElement.elementArr = [];
TextElement.greyScaleArr = [".", "-", "~", ":", ":", "=", "!", "*", "#", "$"];
TextElement.phraseArr = [
  "YOU.ARE.NOT.EVEN.CLOSE.TO.BEING.DONE!!",
  "STILL.NOT.DONE.YET..KEEP.STACKING!!",
  "YOU.ARE.ALMOST.HALFWAY.THERE!!",
  "A.BIT.CLOSER.TO.GETTING.THAT.CERTIFICATE!!",
  "THOUGHT.IT.WOULD.BE.OVER.BY.NOW.HUH?",
  "KEEP.IT.UP!!",
  "JUST.A.LITTLE.BIT.MORE!!",
  "THIS.IS.YOUR.CERTIFICATE!!",
  "CLICK.HERE.TO.STACK.MORE.KNOWLEDGE!!",
];

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
    imgIndex,
    destPosX = null,
    destPosY = null,
    destSize = null
  ) {
    this.size = size;
    this.posX = posX;
    this.posY = posY;
    this.imgIndex = imgIndex;
    this.img = "./images/" + imgIndex + ".png";

    this.destPosX = destPosX;
    this.destPosY = destPosY;
    this.destSize = destSize;

    this.elem = null;

    this.prevWindowWidth = window.innerWidth;
    this.prevWindowHeight = window.innerHeight;
    console.log(this.destPosX, this.destPosY);
    if (
      this.destPosX != null &&
      this.destPosX > 0 &&
      this.destPosX < window.innerWidth &&
      this.destPosY < totalScreenHeight2
    ) {
      imageInfoArr.push({
        x: this.destPosX,
        y: this.destPosY,
        index: this.imgIndex,
      });
    } else {
      imageInfoArr.push({
        x: this.posX,
        y: this.posY,
        index: this.imgIndex,
      });
    }
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
        int(random(0, 15)),
        randDestPosX1,
        randDestPosY1,
        defaultImageWidth
      );
      newElem.create();

      let newElem2 = new ImageElement(
        this.posX,
        this.posY,
        defaultImageWidth * 0.5,

        int(random(0, 15)),
        randDestPosX2,
        randDestPosY2,
        defaultImageWidth
      );
      newElem2.create();
      if (random() < 0.0) {
        let textHeightNum = int(random(8, 15));
        let newElem3 = new TextElement(
          this.posX,
          this.posY,
          textHeightNum * 2,
          textHeightNum,
          asciiFunc1,
          randDestPosX2,
          randDestPosY2,
          0,
          0
        );
        newElem3.create();
      }
      this.createTextElement();
      elemRef.remove();
    });

    ImageElement.elementArr.push(this);
  }

  createTextElement() {
    //widthTexNum, heightTexNum, asciiFunc, mode, phraseIndex = null

    if (totalScreenHeight2 > 500 && !flag500) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        0
      );
      textElem.create();
      flag500 = true;
    }
    if (totalScreenHeight2 > 1000 && !flag1000) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        1
      );
      textElem.create();
      flag1000 = true;
    }
    if (totalScreenHeight2 > 1500 && !flag1500) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        2
      );
      textElem.create();
      flag1500 = true;
    }
    if (totalScreenHeight2 > 2000 && !flag2000) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        3
      );
      textElem.create();
      flag2000 = true;
    }
    if (totalScreenHeight2 > 2500 && !flag2500) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        4
      );
      textElem.create();
      flag2500 = true;
    }
    if (totalScreenHeight2 > 3000 && !flag3000) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        5
      );
      textElem.create();
      flag3000 = true;
    }
    if (totalScreenHeight2 > 3500 && !flag3500) {
      let textElem = new TextElement(
        this.posX,
        this.posY,
        20,
        10,
        asciiFunc1,
        null,
        null,
        1,
        6
      );
      textElem.create();
      flag3500 = true;
    }
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

let titleTextElement;
let font;
let sampleText =
  "It's getting harder and harder to cram in new information into this tiny brain of mine; I might as well be a bird by this point, but oh no, where the hell are my wings at? I've managed to pick up some of the scattered pieces, and I'm just hoping that these will be enough for me to work with for the rest of my life. If not, oh well, the world is my resource. ";
function preload() {
  font = loadFont("assets/fonts/Onyx.otf");
}

function setup() {
  let defaultImageWidth = 25;
  let firstImagesNum = 5;
  for (let i = 0; i < firstImagesNum; i++) {
    let x = random(0, windowWidth * 0.75);
    let y = random(0, windowHeight * 0.5);
    let firstImage = new ImageElement(
      x,
      y,
      defaultImageWidth,
      int(random(0, 15)),
      x,
      y
    );
    firstImage.create();
  }

  let titleTex = createDiv("FRAGMENTED MEMORIES<br>");
  let titleTexInMouseOpacity = 1;
  titleTex.position(20, 2);
  titleTex.style("position", "fixed");
  titleTex.style("color", "WHITE");
  titleTex.style("font-family", "Onyx");

  titleTex.style("font-size", "5vw");
  titleTex.style("z-index", "1");

  titleTex.mouseOver(() => {
    if (!startTransition) {
      ImageElement.elementArr.forEach(function (imgElem) {
        imgElem.elem.style("opacity", 0);
      });
      titleTex.html("YOU STILL HAVE PLENTY MORE TO LEARN");
    } else titleTex.html("THIS IS YOUR CERTIFICATE");
  });

  titleTex.mouseOut(() => {
    ImageElement.elementArr.forEach(function (imgElem) {
      imgElem.elem.style("opacity", 1);
    });
    titleTex.html("FRAGMENTED MEMORIES<br>");
  });
}

function draw() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.updatePos();
    elem.updateSize();
  });

  TextElement.elementArr.forEach(function (elem) {
    elem.update();
    if (elem.asciiMode == 0) elem.updatePos();
  });

  let body = document.body;
  let html = document.documentElement;

  totalScreenHeight2 = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  //console.log(totalScreenHeight2);
  if (totalScreenHeight2 > 4000) {
    if (allOpacity > 0.0) {
      allOpacity -= 0.05;
      ImageElement.elementArr.forEach(function (imgElem) {
        imgElem.elem.style("opacity", allOpacity);
      });
    } else {
      //console.log("HELLO");
      if (!startTransition) removeImageElements();
      startTransition = true;
    }
  }
}
/*
function updateUponHeightChange() {
  if (prevTotalScreenHeight != totalScreenHeight) {
    imageInfoArr.forEach(function (img) {});
  }
}
*/
function windowResized() {
  ImageElement.elementArr.forEach(function (elem) {
    elem.onWindowResize();
  });
}

function removeImageElements() {
  TextElement.elementArr.forEach(function (textElem) {
    if (textElem.asciiMode == 1) textElem.phraseIndex = 7;
  });
  ImageElement.elementArr.forEach(function (imgElem) {
    imgElem.elem.remove();
  });
  ImageElement.elementArr = [];
}

function keyPressed() {
  if (key == "p") {
    startTransition = true;
    removeImageElements();
  }
  console.log("trasition debugging", startTransition);
}
