class TreeNode{
  constructor(posX, posY){
    this.posX = posX;
    this.posY = posY;
    
    this.initPosX = null;
    this.initPosY = null;
    
    this.currentPosX = null;
    this.currentPosY = null;
    
    this.parentNode = null;
    this.leftNode = null;
    this.rightNode = null;
  }
  
  isLeafNode(){
    return this.leftNode == null && this.rightNode == null;
  } 
  
  updatePosition(){
    this.currentPosX += (this.posX - this.currentPosX) * 0.1;
    this.currentPosY += (this.posY - this.currentPosY) * 0.1;
    
  }
}

class SimpleTree{
  constructor(rootPosX, rootPosY, depth, nodeNum, rot, branchLength){
    this.rootPosX = rootPosX;
    this.rootPosY = rootPosY;
    this.rootNode = new TreeNode(this.rootPosX, this.rootPosY);
    this.rootNode.currentPosX = this.rootPosX;
    this.rootNode.currentPosY = this.rootPosY;
    this.depth = depth;
    this.nodeNum = nodeNum;
    this.rot = rot;
    this.branchLength = branchLength;
    this.nodeArr = [];
  }
  
  insertSingleNode(){
    this.insertNode(this.rootNode, this.depth, this.rot, this.branchLength, this.nodeArr);
  }
  
  insertNode(rootNode, depth, rot, branchLength, nodeArr){
    if (depth == 0) return;
    let rand = random(0, 1);
    branchLength -= random(1, 10);
    //console.log(rand)
    let posX, posY;
    let spread = 0.2;
    // create left node
    if (rand < 0.5){
      // if the left node hasn't been created
      if (rootNode.leftNode == null){
        rot -= PI * random(-spread, spread);
        posX = rootNode.posX + branchLength * Math.cos(rot);
        posY = rootNode.posY + branchLength * Math.sin(rot);
        rootNode.leftNode = new TreeNode(posX, posY);
        rootNode.leftNode.parentNode = rootNode;
//         rootNode.leftNode.initPosX = rootNode.posX;
//         rootNode.leftNode.initPosY = rootNode.posY;
        
        rootNode.leftNode.currentPosX = rootNode.posX;
        rootNode.leftNode.currentPosY = rootNode.posY;
        nodeArr.push(rootNode.leftNode);
        return;
      }
      // if it's already created
      else this.insertNode(rootNode.leftNode, depth - 1, rot, branchLength, nodeArr);
    }
    
    // create right node
    else {
      //console.log(rot)
      if (rootNode.rightNode == null){
        rot += PI * random(-spread, spread);
        posX = rootNode.posX + branchLength * Math.cos(rot);
        posY = rootNode.posY + branchLength * Math.sin(rot);
        rootNode.rightNode = new TreeNode(posX, posY);
        rootNode.rightNode.parentNode = rootNode;
//         rootNode.rightNode.initPosX = rootNode.posX;
//         rootNode.rightNode.initPosY = rootNode.posY;
        
        rootNode.rightNode.currentPosX = rootNode.posX;
        rootNode.rightNode.currentPosY = rootNode.posY;
        nodeArr.push(rootNode.rightNode);
        return;
      }
     
      else this.insertNode(rootNode.rightNode, depth - 1, rot, branchLength, nodeArr);
    }
  }
  
  displayNodes(rootNode){
    if (rootNode == null) return;
    if (rootNode.isLeafNode()){
      noStroke();
      fill(255, 0, 0);
      ellipse(rootNode.currentPosX, rootNode.currentPosY, 5, 5);
      
      return;
    }
    this.displayNodes(rootNode.leftNode);
    fill(255);
    ellipse(rootNode.currentPosX, rootNode.currentPosY, 5, 5);
    stroke(255);
    if (rootNode.leftNode != null){
      line(rootNode.currentPosX, rootNode.currentPosY,
           rootNode.leftNode.currentPosX, rootNode.leftNode.currentPosY);
    }
    
    if (rootNode.rightNode != null){
      line(rootNode.currentPosX, rootNode.currentPosY,
           rootNode.rightNode.currentPosX, rootNode.rightNode.currentPosY);
    }
    this.displayNodes(rootNode.rightNode);
  }
  
  display(){
    this.displayNodes(this.rootNode);
  }
  
  update(){
    let noiseCoef = 2;
    this.nodeArr.forEach((node) => {
      node.posX += map(noise(node.posX * 50), 0, 1, -noiseCoef, noiseCoef);
      node.posY += map(noise(node.posY * 50), 0, 1, -noiseCoef, noiseCoef);
      node.updatePosition();
    })
  }
  
  reset(){
    this.nodeArr = [];
    this.rootNode = new TreeNode(this.rootPosX, this.rootPosY);
    this.rootNode.currentPosX = this.rootPosX;
    this.rootNode.currentPosY = this.rootPosY;
  }
}

let testTree;
let treeArr = [];
let treeNum = 0;
let nodeLimit = 100;
let branchLength = 80;
let rotDiv;
let font;

let sketchTriggered = false;

function preload(){
  font = loadFont("./Gilroy-Light.ttf")
}

function setup() {
  createCanvas(1080, 1350);
  smooth();
  textFont(font)
  textSize(20);
  textAlign(RIGHT, CENTER);
  for (let i = 0; i < treeNum; i++){
    let tempTree = new SimpleTree(0, 0, 10, 50, -PI * 0.5, branchLength);
    treeArr.push(tempTree);
  }
  
  rotDiv = TWO_PI / treeNum;
  console.log(rotDiv);
  strokeWeight(0.25);
}

function draw() {
  background(0, 50);
  //translate(0, height * 0.5);

  if (frameCount > 60 && !sketchTriggered){
    resetTreeArr();
    sketchTriggered = true;
  }  
  fill(255);
  stroke(255);
  textAlign(RIGHT, CENTER);
  text("tree num: \nnode num limit: \ninitial branch length: ", width * 0.875, height * 0.925)

  textAlign(RIGHT, CENTER);
  text(treeNum + "\n" + nodeLimit + "\n" + branchLength, width * 0.925, height * 0.925)
  translate(width * 0.5, height * 0.5);
  if (frameCount % 2 == 0){
    for (let i = 0; i < treeNum; i++){
      if (treeArr[i].nodeArr.length < nodeLimit) treeArr[i].insertSingleNode();
      else {
        resetTreeArr();
        break;
      }
    }
  }
  
   treeArr.forEach((tree, i) => {
    rotate(rotDiv);
    //console.log(i * rotDiv);
    tree.update();
    tree.display();
  })
  
  
 
}

function resetTreeArr(){
  nodeLimit = int(random(50, 100));
  treeNum = int(random(8, 16));
  branchLength = int(random(40, 150));
  treeArr = [];
  for (let i = 0; i < treeNum; i++){
    // rootPosX, rootPosY, depth, nodeNum, rot, branchLength
    let tempTree = new SimpleTree(0, 0, 10, 50, -PI * 0.5, branchLength);
    treeArr.push(tempTree);
  }
  rotDiv = TWO_PI / treeNum;
}

function mouseClicked(){
//   treeArr.forEach((tree, i) => {
    
//     if (tree.nodeArr.length < 75) tree.insertSingleNode();
//     else tree.reset();
    
//   })
}

// function mouseMoved(){
//   let d = dist(mouseX, mouseY, width * 0.5, height * 0.5);
//   let iterNum = map(d, 0, width * 0.5, 1, 0);
//   //console.log(iterNum);
//   d = map(d, 0, width * 0.5, 200, 20);
//   //for (let idx = 0; idx < iterNum; idx++){
//     treeArr.forEach((tree, i) => {
    
//       if (tree.nodeArr.length < d) tree.insertSingleNode();
//       else tree.reset();
    
//     })
//   //}
// }