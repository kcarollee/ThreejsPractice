let sampleText =
  "In the center of Fedora, that gray stone metropolis,stands a metal building with a crystal globe in every room. Looking into each globe, you see a blue city, the model of a different Fedora. These are the forms the city could have taken if, for one' reason or another, it had not become what we see today. In every age someone, looking at Fedora as it was, imagined a way of making it the ideal city, but while he constructed his miniature model, Fedora was already no longer the same as before, and what had been until yesterday a possible future became only a toy in a glass globe. The building with the globes is now Fedora's museum: every inhabitant visits it, chooses the city that corresponds to his desires, contemplates it, imagining his reflection in the medusa pond that would have collected the waters of the canal (if it had not been dried up), the view from the high canopied box along the avenue reserved for elephants (now banished from the city), the fun of sliding down the spiral, twisting minaret (which never found a pedestal from which to rise). On the map of your empire, 0 Great Khan, there must be room both for the big, stone Fedora and the little Fedoras in glass globes. Not because they are all equally real, but because all are only assumptions.";
let scrambledSampleText;

let words = [];
let wordBlockArr = [];
let font;
let fontSize;
let img;

let pg;

let wDiv, wInc;
let hDiv, hInc;

let stringUpdatePeriod = 5;

let viewBackground = false;

let disperseMode = false;

class SingleChar {
  constructor(chr, posx, posy) {
    this.chr = chr;
    this.posx = posx;
    this.posy = posy;
  }
}

class WordBlock {
  constructor(wordString, defaultFontSize) {
    this.posx = null;
    this.posy = null;
    this.wordString = wordString;

    this.mouseIsIn = false;
    this.wordLength = this.wordString.length;

    this.boundingBoxString = this._getBoundingBoxString();

    this.fontSize = defaultFontSize;

    this.characterPositions = []; // [[x0, y0], [x1, y1]...]
    this.characterPosRands = [];

    this.appearCount = 0;
    for (let i = 0; i < this.wordLength; i++) {
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

  setPosition(posx, posy) {
    this.posx = posx;
    this.posy = posy;
  }

  getCharNum() {
    return this.wordLength;
  }

  onMouseOver() {
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

  disperse() {
    let charRandArr = this.characterPosRands;
    this.characterPositions.forEach(function (pair, i) {
      pair[0] += charRandArr[i][0];
      pair[1] += charRandArr[i][1];
    });
  }

  calculateCharacterPositions(xInc, yInc) {
    let characterBreakCount = 0;
    this.characterPositions = [];
    for (let i = 0; i < this.wordLength; i++) {
      let x = this.posx + xInc * i;
      let y = this.posy;
      if (x > windowWidth) {
        x = xInc * characterBreakCount;
        characterBreakCount++;
        y = this.posy + yInc;
      }
      this.characterPositions.push([x, y]);
    }
    //console.log(this.characterPositions, this.wordLength, this.wordString);
  }

  display(texture) {
    this.onMouseOver();
    if (this.mouseIsIn) {
      textSize(this.fontSize * 2.0);
      //console.log(this.id, this.characterPositions);
    } else textSize(this.fontSize);

    //text(this.wordString, this.posx, this.posy);
    //let characterBreakCount = 0;

    for (let i = 0; i < this.appearCount; i++) {
      let x = this.characterPositions[i][0];
      let y = this.characterPositions[i][1];
      let char = this.wordString[i];
      let color = texture.get(x, y);
      if (this.mouseIsIn) fill(255, 0, 0);
      else fill(color[0], color[1], color[2]);
      text(char, x, y);
    }
    if (this.appearCount < this.wordLength) this.appearCount += 0.25;
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
      } else if (offset < currentWord.length) {
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

function preload() {
  font = loadFont("monospace.otf");
  img = loadImage("cat3.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  wDiv = 30;
  wInc = width / wDiv;

  hDiv = 30;
  hInc = height / hDiv;

  incMin = min(wInc, hInc);
  wInc = hInc = incMin;

  fontSize = incMin * 1.25;

  sentenceToWords(sampleText, fontSize);
  setCharacterPositions();
  //console.log(wordBlockArr);
  //updateString();

  pg = createGraphics(windowWidth, windowHeight);
  pg.textFont(font);
  pg.textAlign(CENTER);
  pg.textSize(pg.width * 0.25);

  //rectMode(CENTER);
  textFont(font);
  textSize(fontSize);

  img.resize(width, height);
  console.log(wordBlockArr);
}

function draw() {
  background(20);
  fill(255, 0, 0);

  for (let i = 0; i < wordBlockArr.length; i++) {
    wordBlockArr[i].display(pg);
    if (disperseMode) wordBlockArr[i].disperse();
  }

  // initial background animation
  pg.background(200, 150, 0);
  pg.fill(200);
  //pg.rotate(0.1);
  pg.text("FEDORA", pg.width * 0.5, pg.height * 0.5);
  if (viewBackground) image(pg, 0, 0);
}

function drawPG() {
  pg.background(255);
  pg.text("T");
}

function updateString() {
  shuffle(words, true);
  scrambledSampleText = wordsToSentence();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight);
  pg.textSize(pg.width * 0.25);
  img.resize(windowWidth, windowHeight);

  wDiv = 50;
  wInc = windowWidth / wDiv;

  hDiv = 50;
  hInc = windowHeight / hDiv;

  incMin = min(wInc, hInc);
  wInc = hInc = incMin;
}

function keyPressed() {
  switch (key) {
    case "b":
      viewBackground = !viewBackground;
      break;
    case "r":
      disperseMode = true;
      break;
  }
}
