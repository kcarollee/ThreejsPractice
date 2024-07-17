let conversation = `
Emily: Hello, Linda. I’ve heard so much about your beautiful quilts. They must be a labor of love. (50)
Linda: Thank you, Emily. Yes, they are. I find sewing to be very fulfilling. I understand you’ve done quite a bit of research in genetics? (50)
Emily: Yes, I’ve spent many years studying hereditary diseases. It’s fascinating work, though sometimes very challenging. (55)
Linda: That sounds incredibly important. I’ve always been curious about how our genes affect our health. (55)
Emily: It is indeed important, and very rewarding when we make new discoveries. Do you ever feel that way about your sewing projects? (60)
Linda: Absolutely. Each quilt tells a story and seeing the joy they bring to people is immensely satisfying. Do you find time to sew or do any crafting yourself? (60)
Emily: I enjoy gardening more, but I appreciate the patience and creativity that goes into sewing. I imagine it’s very relaxing. (65)
Linda: It is, much like gardening. There’s something very meditative about creating something with your hands. What do you like to grow? (65)
Emily: Mostly flowers, though I have a small vegetable patch as well. There’s nothing like fresh produce from your own garden. (70)
Linda: That sounds wonderful. I’ve always admired people who can grow their own food. It must be so rewarding. (70)
Emily: It really is. And I find it very grounding after a long day at the lab. Do you have a favorite piece you’ve made? (75)
Linda: There are so many, but I think my favorite is a quilt I made for a local shelter. It was a community project and brought a lot of people together. (75)
Emily: That sounds amazing. Community projects are so important. I’ve tried to mentor young scientists as a way of giving back. (80)
Linda: Mentoring is so valuable. I’ve taught a few sewing classes at the community center. It’s wonderful to pass on skills to the next generation. (80)
Emily: Absolutely. It’s all about making a difference, isn’t it? Whether through science or sewing. (85)
Linda: Yes, it is. And finding joy in what we do. Have you ever thought about writing a book on your research? (85)
Emily: I have, actually. It’s something I’d like to do when I retire. There’s so much knowledge I’d love to share. Have you considered writing about your life and quilting? (90)
Linda: I have. People keep telling me I should. Maybe one day. It’s a nice thought, sharing my stories and patterns. (90)
Emily: I’d definitely read it. Your work sounds so inspiring. (95)
Linda: Thank you, Emily. And I’d love to read about your research. It’s been wonderful talking with you. (95)
Emily: Likewise, Linda. I feel like we’ve found quite a bit in common. (95)
Linda: We certainly have. Here’s to new friendships and shared passions. (95)
`;


let font;
let globalTextSize = 50;
let globalString = "";
function preload(){
  font = loadFont("HelveticaNeueMedium.otf");
}

function parsedConversationArr(string) {
  let strArr = [];
  let tempStr = "";
  for (let i = 0; i < string.length; i++) {
    let chr = string[i];
    if (chr != "\n") tempStr += chr;
    else {
      strArr.push(tempStr);
      tempStr = "";
    }
  }
  return strArr;
  
}

class TextBox{
  constructor(textin, x, y, maxWidth, maxHeight, myFontSize){
    this.boundingBox = { x: 0, y: 0, w: 0, h: 0 };
    this.wordsData = [];
    
    this.margin = 15;
    
    this.textIn = textin;
    this.x = x;
    this.y = y;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.myFontSize = myFontSize;
    
    this.myWrapText(this.textIn, this.x, this.y, this.maxWidth, this.maxHeight, this.myFontSize);
  }
  
  myWrapText(textin, x, y, maxWidth, maxHeight, myFontSize){
    let lineHeight = myFontSize * 1.2;
    let words = textin.split(' ');
    let line = '';
    let currentY = y;
    let minY = y;
    let maxY = y;

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let testLine = line + word + ' ';
      let metrics = textWidth(testLine);

      if (metrics > maxWidth && i > 0) {
        currentY += lineHeight;
        line = word + ' ';
      } else {
        line = testLine;
      }

      let finalX = x + textWidth(line) - textWidth(word + ' ');
      let finalY = currentY;
      maxY = max(maxY, finalY + lineHeight); // Update maxY for bounding box calculation

      this.wordsData.push({
        word: word,
        initialX: x+maxWidth/2+random(-maxWidth,maxWidth),
        initialY: y+maxHeight/2+random(-maxHeight,maxHeight),
        finalX: finalX,
        finalY: finalY,
        fontSize: myFontSize
      });
    }

    this.boundingBox.x = x;
    this.boundingBox.y = minY;
    this.boundingBox.w = maxWidth; // Assuming maxWidth is the bounding width
    this.boundingBox.h = maxY - minY; // Height from minY to maxY
  }
  
  display(){
    stroke(0);
    strokeWeight(5)
    fill(255);
    rect(this.boundingBox.x - this.margin, this.boundingBox.y - this.margin, this.boundingBox.w + 2 * this.margin, this.boundingBox.h + 2 * this.margin);
    
    for (let wd of this.wordsData) {
      let x = wd.finalX;
      let y = wd.finalY + wd.fontSize;
      noStroke();
      fill(0);
      textSize(wd.fontSize);
      text(wd.word, x, y);
    }
  }
}

class TextChunk {
  constructor(string, posX, posY) {
    this.string = string;
    this.stringLen = this.string.length - 5;
    this.dialogue = this.string.substring(0, this.stringLen);
    this.quotient = parseInt(
      this.string.substring(this.string.length - 3, this.string.length - 1)
    );

    this.posX = posX;
    this.posY = posY;
    
    this.nameCount = 0;
    this.name = this.getName();
    
    this.quote = this.dialogue.substring(this.nameCount + 2, this.dialogue.length);

    this.textBox;
    this.createTextBox();
    
    
    for (let i = 0; i < this.quotient * 0.5; i++){
      this.quote = "-" + this.quote;
    }
    this.quote = this.quotient + this.quote;
    //this.quote = this.name + this.quote;
    console.log(this.quote);
  }
  
  getName(){
   
    for(let i = 0; i < this.stringLen; i++){
      if (this.string[i] != ':') this.nameCount++;
      else break;
    }
    return this.string.substring(0, this.nameCount);
  }
  
  createTextBox(){
    this.textBox = new TextBox(this.quote, this.posX + this.quotient * 20, this.posY, 1000, 200, globalTextSize);
  }

  display() {
    
    // let bbox = font.textBounds(this.quote, this.posX, this.posY);
    // let coef = 1.2;
    // rect(bbox.x, bbox.y, bbox.w, bbox.h);
    
    // textStyle(BOLD)
    text(this.quote, this.posX , this.posY);
    // textLeading(15);
    
    //this.textBox.display();
    //textWrap(WORD);
    
  }
}

let parsedTextArray;
let textChunkArr = [];
let testBox;
let questions = [
"1.How anxious are you of facing death?",
"2.How lonely do you feel currently?",
"3.How motivated are you to complete your bucket list?",
"4.How emotionally connected are you to your GM?",
"5.How frequently have you interacted with your GM?",
"6.How much time are you willing to spend with your GM?",
"7.How cooperative is your GM?",
"8.How willing are you to adjust burial plans for your GM?",
"9.How much do you fear potential conflict with your GM?",
];

let questions2 = [
  "1.How comfortable do you feel about each other?",
  "2.How comfortable are your families about the burial?",
  "3.How similar are your hobbies?",
  "4.How similar are your views in life?",
  "5.How much do you enjoy each other's company?",
  "6.How motivated are you to finish the bucket list together?",
];
let answers = [30, 20, 90, 95, 85, 90, 95, 80, 10]
let answers2 = [70, 60, 60, 85, 70, 75, 80, 70, 20]
let answers3 = [90, 80, 85, 75, 95, 90]
function setup() {
  createCanvas(4000,  2828 * 2);
  smooth();
  textFont(font);
  textSize(globalTextSize);

  
  parsedTextArray = parsedConversationArr(conversation);
  parsedTextArray.forEach(function (string, i) {
    let tempChunk = new TextChunk(string, 0, 300 * (i + 1));
    textChunkArr.push(tempChunk);
    globalString += tempChunk.quote + "\n";
  });
  console.log("HELLO");
  console.log(globalString);

  let totalAnswerStr = "";
  let totalAnswerStr2 = "";
  let totalAnswerStr3 = "";
  answers.forEach(function(ans, i){
    totalAnswerStr += questions[i] + "\n";
    let answerStr = "";
    let perc = ans / 100;
    let index = 0;
    for (; index < 68;){
      if (index == 0 || index == 67) {
        answerStr += "|";
        index++;
      }
      else if (index / 67 < perc && (index + 1) / 67 > perc){
        answerStr += "[]"
        index += 2;
      }
      else {
        answerStr += "-";
        index++;
      }
    }
    totalAnswerStr += answerStr + "\n";
  });
  console.log(totalAnswerStr);

  answers2.forEach(function(ans, i){
    totalAnswerStr2 += questions[i] + "\n";
    let answerStr = "";
    let perc = ans / 100;
    let index = 0;
    for (; index < 68;){
      if (index == 0 || index == 67) {
        answerStr += "|";
        index++;
      }
      else if (index / 67 < perc && (index + 1) / 67 > perc){
        answerStr += "[]"
        index += 2;
      }
      else {
        answerStr += "-";
        index++;
      }
    }
    totalAnswerStr2 += answerStr + "\n";
  });
  console.log(totalAnswerStr2);

  answers3.forEach(function(ans, i){
    totalAnswerStr3 += questions2[i] + "\n";
    let answerStr = "";
    let perc = ans / 100;
    let index = 0;
    for (; index < 68;){
      if (index == 0 || index == 67) {
        answerStr += "|";
        index++;
      }
      else if (index / 67 < perc && (index + 1) / 67 > perc){
        answerStr += "[]"
        index += 2;
      }
      else {
        answerStr += "-";
        index++;
      }
    }
    totalAnswerStr3 += answerStr + "\n";
  });
  console.log(totalAnswerStr3);
}

function draw() {
  background(0, 0);
  //testChunk.display();
  textChunkArr.forEach(function(textChunk){
    textChunk.display();
  })

  //testBox.display();
}
