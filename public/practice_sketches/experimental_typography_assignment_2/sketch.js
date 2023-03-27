let sampleText =
  "In the center of Fedora, that gray stone metropolis,stands a metal building with a crystal globe in every room. Looking into each globe, you see a blue city, the model of a different Fedora. These are the forms the city could have taken if, for one' reason or another, it had not become what we see today. In every age someone, looking at Fedora as it was, imagined a way of making it the ideal city, but while he constructed his miniature model, Fedora was already no longer the same as before, and what had been until yesterday a possible future became only a toy in a glass globe. The building with the globes is now Fedora's museum: every inhabitant visits it, chooses the city that corresponds to his desires, contemplates it, imagining his reflection in the medusa pond that would have collected the waters of the canal (if it had not been dried up), the view from the high canopied box along the avenue reserved for elephants (now banished from the city), the fun of sliding down the spiral, twisting minaret (which never found a pedestal from which to rise). On the map of your empire, 0 Great Khan, there must be room both for the big, stone Fedora and the little Fedoras in glass globes. Not because they are all equally real, but because all are only assumptions.";
let scrambledSampleText;

let words = [];
let wordBlockArr = [];
let fontArr = [];
let font, font2;
let fontSize, pgFontSize;

let pg;
let pgString;

let wDiv, wInc;
let hDiv, hInc;

let stringUpdatePeriod = 5;

let viewBackground = false;

let disperseMode = false;
let convergeMode = false;

let cnv;

let pgTexPositions;
let pgTexString;

class WordBlock {
  constructor(wordString, defaultFontSize) {
    this.posx = null;
    this.posy = null;
    this.wordString = wordString;

    this.mouseIsIn = false;
    this.mouseClicked = false;
    this.mouseClickedSecond = false;
    this.wordLength = this.wordString.length;

    this.boundingBoxString = this._getBoundingBoxString();

    this.fontSize = defaultFontSize;

    this.characterPositions = []; // [[x0, y0], [x1, y1]...]
    this.characterInitialPositions = [];
    this.characterCenterPositions = [];
    this.characterPosRands = [];

    this.characterColors = [];
    this.colorsLoaded = false;

    this.appearCount = 0;

    this.alpha = 255;

    this.deleteFlag = false;

    let centerPosxOffset =
      width * 0.5 - this.wordLength * 0.5 * pgFontSize * 0.6;
    //console.log(pgFontSize);
    for (let i = 0; i < this.wordLength; i++) {
      let centerPosx = centerPosxOffset + i * pgFontSize * 0.6;
      this.characterCenterPositions.push([
        centerPosx,
        height * (0.6 + 0.2 * sin(random() * 100)),
      ]);
      this.characterPosRands.push([
        map(random(), 0, 1, -1, 1) * 10,
        map(random(), 0, 1, -1, 1) * 10,
      ]);
    }
  }

  _getBoundingBoxString() {
    let tempStr = "";
    for (let i = 0; i < this.wordLength; i++) {
      tempStr += this.wordString[i];
      if (i == this.wordLength - 1) break;
      tempStr += " ";
    }
    return tempStr;
  }

  _getBoundingBoxStringCenter() {
    let stringPos = this.characterCenterPositions[0];
  }

  setPosition(posx, posy) {
    this.posx = posx;
    this.posy = posy;
  }

  updateBoundingBox() {}

  getCharNum() {
    return this.wordLength;
  }

  onMouseOver() {
    if (!disperseMode) {
      let boundingBox = font.textBounds(
        this.boundingBoxString,
        this.posx,
        this.posy,
        fontSize
      );
      let leftBound = boundingBox.x;
      let rightBound = leftBound + boundingBox.w;
      let topBound = boundingBox.y;
      let bottomBound = boundingBox.y + boundingBox.h;
      if (mouseX > leftBound && mouseX < rightBound) {
        if (mouseY > topBound && mouseY < bottomBound) {
          this.mouseIsIn = true;
        } else this.mouseIsIn = false;
      } else this.mouseIsIn = false;
    }
  }

  // after disperse and before converge.
  // converge mode is triggered when the mouse is clicked ON the center words
  // disperse mode ends when the word moving to the center is properly aligned to the center
  // converge mode ends when all the characters are back in place
  onMouseOverWhenCenter() {
    for (let i = 0; i < this.wordString.length; i++) {
      let stringPos = this.characterCenterPositions[i];
      let boundingBox = font.textBounds(
        this.wordString[i],
        stringPos[0], // x
        stringPos[1], // y
        pgFontSize
      );
      let leftBound = boundingBox.x;
      let rightBound = leftBound + boundingBox.w;
      let topBound = boundingBox.y;
      let bottomBound = boundingBox.y + boundingBox.h;
      if (mouseX > leftBound && mouseX < rightBound) {
        if (mouseY > topBound && mouseY < bottomBound) {
          this.mouseIsIn = true;
          break;
        } else this.mouseIsIn = false;
      } else this.mouseIsIn = false;
    }
  }

  onClick() {}

  moveToCenter() {
    if (this.fontSize < pgFontSize) this.fontSize += 10;
    let centerPosArr = this.characterCenterPositions;
    //console.log(centerPosArr);
    this.characterPositions.forEach(function (pair, i) {
      pair[0] += (centerPosArr[i][0] - pair[0]) / 30;
      pair[1] += (centerPosArr[i][1] - pair[1]) / 30;

      //pair[0] = centerPosArr[i][0];
      //pair[1] = centerPosArr[i][1];
    });
  }

  disperse() {
    let charRandArr = this.characterPosRands;
    this.characterPositions.forEach(function (pair, i) {
      pair[0] += charRandArr[i][0];
      pair[1] += charRandArr[i][1];
    });
  }

  converge() {
    if (this.colorsLoaded && !this.mouseClickedSecond) {
      this.colorsLoaded = false;
      this.characterColors = [];
    }
    if (!this.mouseClickedSecond) {
      let charInitPosArr = this.characterInitialPositions;
      this.characterPositions.forEach(function (pair, i) {
        pair[0] += (charInitPosArr[i][0] - pair[0]) / 10;
        pair[1] += (charInitPosArr[i][1] - pair[1]) / 10;
      });
    }
    // decrease alpha
    else {
      this.alpha -= 3;
      if (this.alpha < 0) {
        this.deleteFlag = true;
        convergeMode = false;
      }
    }
  }

  calculateCharacterPositions(xInc, yInc) {
    let characterBreakCount = 0;
    this.characterPositions = [];
    for (let i = 0; i < this.wordLength; i++) {
      let x = this.posx + xInc * i;
      let y = this.posy;
      if (x > cnv.width) {
        x = xInc * characterBreakCount;
        characterBreakCount++;
        y = this.posy + yInc;
      }
      this.characterPositions.push([x, y]);
      this.characterInitialPositions.push([x, y]);
    }
    //console.log(this.characterPositions, this.wordLength, this.wordString);
  }

  display(texture) {
    if (!disperseMode) this.onMouseOver();
    else if (disperseMode && this.mouseClicked) this.onMouseOverWhenCenter();
    if (this.mouseIsIn && !this.mouseClicked) {
      textSize(this.fontSize * 2.0);
      //console.log(this.id, this.characterPositions);
    } else textSize(this.fontSize);

    //text(this.wordString, this.posx, this.posy);
    //let characterBreakCount = 0;

    if (!this.colorsLoaded) {
      for (let i = 0; i < this.wordString.length; i++) {
        let x = this.characterPositions[i][0];
        let y = this.characterPositions[i][1];

        this.characterColors.push(texture.get(x, y));
        //console.log(i, this.appearCount, this.characterColors);
      }
    }
    this.colorsLoaded = true;

    for (let i = 0; i < this.appearCount; i++) {
      let x = this.characterPositions[i][0];
      let y = this.characterPositions[i][1];
      let char = this.wordString[i];

      let color = this.characterColors[i]; //texture.get(x, y);
      if (this.mouseIsIn && !this.mouseClicked) fill(255, 0, 0, this.alpha);
      else if (this.mouseIsIn && this.mouseClicked) fill(0, 255, 0, this.alpha);
      else fill(color[0], color[1], color[2], this.alpha);

      text(char, x, y);
    }
    if (this.appearCount < this.wordLength) this.appearCount += 1;
  }
}

function sentenceToWords(sentence, defaultFontSize) {
  let tempStr = "";

  for (let i = 0; i < sentence.length; i++) {
    let char = sentence[i];
    if (char == " ") {
      words.push(tempStr);
      tempStr = "";
      continue;
    }
    tempStr += char;
  }
  shuffle(words, true);
}

function wordsToSentence() {
  let tempStr = "";
  for (let i = 0; i < words.length; i++) {
    tempStr += words[i];
    tempStr += " ";
  }
  return tempStr;
}

function setCharacterPositions() {
  let wordsIndex = 0;
  let offset = 0;
  let currentWord;
  for (let y = 0; y < height; y += hInc) {
    for (let x = 0; x < width; x += wInc) {
      if (offset == 0) {
        currentWord = words[wordsIndex];
        let wordBlock = new WordBlock(currentWord, fontSize);
        //console.log(currentWord.id, currentWord.wordString, x, y);
        //currentWord.setPosition(x, y);
        wordBlock.setPosition(x, y);
        wordBlock.calculateCharacterPositions(wInc, hInc);
        wordBlockArr.push(wordBlock);
        offset++;
      } else if (offset < currentWord.length - 1) {
        offset++;
      } else {
        //console.log(wordsIndex);
        offset = 0;
        wordsIndex++;
        wordsIndex %= words.length;
      }
    }
  }
}

// 다른 형상들에 대한 구현도 생각해보기
// 지금이: 흩어졌다 모이는 것이면
// 녹았다가 다시 굳는
// 쪼개졌다가 다시 붙는
// 이런것들에 대해서 생각을 해보기

// 다양한 폰트 (한 화면에)
// 메인 글자의 다양한 위치
// 사진을 실루엣으로 생각해보기도 하자

let bgImages = [];
let bgImageIndex = 0;

let imgBoxArr = [];

function preload() {
  font = loadFont("monospace_1.otf");
  font2 = loadFont("SpaceMono-Italic.ttf");
  fontArr.push(font, font2);

  for (let i = 1; i <= 5; i++) {
    let bgImg = loadImage("p" + i + ".jpg");
    bgImages.push(bgImg);
  }
}

function setup() {
  cnv = createCanvas(800, 400);
  cnv.style("display", "block");
  cnv.position(
    windowWidth * 0.5 - cnv.width * 0.5,
    windowHeight * 0.5 - cnv.height * 0.5
  );
  cnv.style("position", "fixed");

  for (let i = 0; i < bgImages.length; i++) {
    let imgBoxElem = new ImageBox("./p" + (i + 1) + ".jpg");
    imgBoxArr.push(imgBoxElem);
  }

  bgImages.forEach(function (img) {
    img.resize(cnv.width, cnv.height);
  });

  wDiv = 20;
  wInc = width / wDiv;

  hDiv = 20;
  hInc = height / hDiv;

  incMin = min(wInc, hInc);
  wInc = hInc = incMin;

  fontSize = incMin;

  pg = createGraphics(cnv.width, cnv.height);
  pgFontSize = pg.width * 0.25;
  pg.textFont(font);
  //pg.textAlign(CENTER);
  pg.textSize(pgFontSize);
  pgString = "FEDORA";
  sentenceToWords(sampleText, fontSize);
  setCharacterPositions();
  //console.log(wordBlockArr);
  //updateString();

  //rectMode(CENTER);
  textFont(font);
  textSize(fontSize);
}

function draw() {
  background(20);
  fill(255, 0, 0);

  // if pg is properly loaded
  if (pg.get(0, 0)[0] != 0) {
    for (let i = 0; i < wordBlockArr.length; i++) {
      wordBlockArr[i].display(pg);
      if (wordBlockArr[i].mouseClicked) wordBlockArr[i].moveToCenter();
      if (disperseMode && !wordBlockArr[i].mouseClicked && !convergeMode)
        wordBlockArr[i].disperse();
      if (convergeMode) wordBlockArr[i].converge();
      if (wordBlockArr[i].deleteFlag) {
        wordBlockArr.splice(i, 1);
      }
    }
  }

  // initial background animation
  pg.background(200, 150, 0);
  pg.image(bgImages[bgImageIndex], 0, 0);
  pg.fill(0, 0, 255);
  //pg.rotate(0.1);
  if (pgTexPositions == null) {
    pg.textAlign(CENTER);
    pg.text(pgString, pg.width * 0.5, pg.height * 0.6);
  } else {
    pg.textAlign(LEFT);
    for (let i = 0; i < pgString.length; i++) {
      let pos = pgTexPositions[i];
      let posx = pos[0];
      let posy = pos[1];
      pg.text(pgString[i], posx, posy);
    }
  }
  if (viewBackground) image(pg, 0, 0);
}

function updateString() {
  shuffle(words, true);
  scrambledSampleText = wordsToSentence();
}

function windowResized() {
  cnv.position(
    windowWidth * 0.5 - cnv.width * 0.5,
    windowHeight * 0.5 - cnv.height * 0.5
  );
  cnv.style("position", "fixed");
}

function keyPressed() {
  switch (key) {
    case "b":
      viewBackground = !viewBackground;
      break;
    case "r":
      disperseMode = !disperseMode;
      break;
    case "c":
      convergeMode = !convergeMode;
      break;
  }
}

let prevScrollHeight;
function mouseClicked() {
  for (wordBlock of wordBlockArr) {
    if (wordBlock.mouseIsIn) {
      if (!wordBlock.mouseClicked) {
        wordBlock.mouseClicked = true;
        disperseMode = true;

        imgBoxArr[bgImageIndex].display();

        // if all the images are shown
        if (prevScrollHeight == document.body.scrollHeight) {
          bgImageIndexRand = int(random() * 5);
          window.scrollTo({
            top:
              (document.body.scrollHeight / imgBoxArr.length) *
              bgImageIndexRand,
            left: 0,
            behavior: "smooth",
          });
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: "smooth",
          });
        }
        prevScrollHeight = document.body.scrollHeight;
      } else if (wordBlock.mouseClicked && disperseMode) {
        pgString = wordBlock.wordString;
        convergeMode = true;
        disperseMode = false;
        wordBlock.mouseClickedSecond = true;
        pgTexPositions = wordBlock.characterCenterPositions;
        bgImageIndex++;
        bgImageIndex %= bgImages.length;
      }
      break;
    }
  }
}

class ImageBox {
  constructor(imgLink) {
    this.imgLink = imgLink;
    console.log(this.imgLink);
    this.elem = createImg(imgLink);
    //this.elem.style("display", flex);
    this.setStyle();
    this.elem.mouseOver(this.onMouseOver);
    this.elem.mouseOut(this.onMouseOut);
    let link = this.imgLink;
    this.elem.mouseClicked(() => {
      console.log(link[1]);
      location.href = "./pages/page" + link[3];
    });
    this.elem.attribute("href", "./pages/page1/index.html");
    this.elem.attribute("title", "Welcome to Seolleung");
    //this.elem.style("height", "50vh");
    ImageBox.elementCount++;
  }

  setStyle() {
    this.elem.style("cursor", "pointer");
    this.elem.style("display", "none");
    this.elem.style("max-width", "auto");
    this.elem.style("max-height", "100vh");
    this.elem.style("margin-left", "auto");
    this.elem.style("margin-right", "auto");
  }

  display() {
    this.elem.style("display", "block");
  }

  onMouseOver() {
    cnv.style("opacity", "10%");
  }

  onMouseOut() {
    cnv.style("opacity", "100%");
  }

  onMouseClicked() {
    location.href = "./pages/page1";
  }
}

ImageBox.elementCount = 0;
