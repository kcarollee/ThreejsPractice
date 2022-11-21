let sampleText =
  "In the center of Fedora, that gray stone metropolis,stands a metal building with a crystal globe in every room. Looking into each globe, you see a blue city, the model of a different Fedora. These are the forms the city could have taken if, for one' reason or another, it had not become what we see today. In every age someone, looking at Fedora as it was, imagined a way of making it the ideal city, but while he constructed his miniature model, Fedora was already no longer the same as before, and what had been until yesterday a possible future became only a toy in a glass globe. The building with the globes is now Fedora's museum: every inhabitant visits it, chooses the city that corresponds to his desires, contemplates it, imagining his reflection in the medusa pond that would have collected the waters of the canal (if it had not been dried up), the view from the high canopied box along the avenue reserved for elephants (now banished from the city), the fun of sliding down the spiral, twisting minaret (which never found a pedestal from which to rise). On the map of your empire, 0 Great Khan, there must be room both for the big, stone Fedora and the little Fedoras in glass globes. Not because they are all equally real, but because all are only assumptions.";
let scrambledSampleText;

let words = [];
let font;
let fontSize;
let img;

let pg;

let wDiv, wInc;
let hDiv, hInc;

let stringUpdatePeriod = 50;

class WordBlock {
  constructor() {}
}

function sentenceToWords(sentence) {
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
}

function wordsToSentence() {
  let tempStr = "";
  for (let i = 0; i < words.length; i++) {
    tempStr += words[i];
    tempStr += " ";
  }
  return tempStr;
}

function preload() {
  font = loadFont("monospace.otf");
  img = loadImage("hand.png");
}

function setup() {
  sentenceToWords(sampleText);
  updateString();
  createCanvas(windowWidth, windowHeight);

  pg = createCanvas(windowWidth, windowHeight);
  pg.textFont(font);
  pg.textSie(fontSize);
  fontSize = 15;

  rectMode(CENTER);
  textFont(font);
  textSize(fontSize);
  wDiv = 50;
  wInc = width / wDiv;

  hDiv = 50;
  hInc = height / hDiv;

  incMin = min(wInc, hInc);
  wInc = hInc = incMin;

  img.resize(width, height);
}

function draw() {
  //background(255);
  //fill(0);

  //if (frameCount % stringUpdatePeriod == 0) updateString();

  if (frameCount % stringUpdatePeriod == 0) {
    background(100);
    updateString();
    let index = 0;
    for (let y = 0; y < height; y += hInc) {
      for (let x = 0; x < width; x += wInc) {
        chr = scrambledSampleText[index];
        let col = img.get(x, y);
        if (col[0] < 150) fill(0);
        else fill(col[0], 0, 0);
        //console.log(col);
        //else fill(0);
        //fill(img.get(x, y));
        text(chr, x, y);
        index++;
        index %= scrambledSampleText.length;
      }
    }
  }
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
  img.resize(windowWidth, windowHeight);

  wDiv = 50;
  wInc = windowWidth / wDiv;

  hDiv = 50;
  hInc = windowHeight / hDiv;

  incMin = min(wInc, hInc);
  wInc = hInc = incMin;
}
