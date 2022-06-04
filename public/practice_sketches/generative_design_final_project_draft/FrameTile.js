class FrameTile{
    constructor(initPosx, initPosy, sizex, sizey){
      /*
      movementModes:
      0: rotational
      1: horizontal
      2: vertical
      */
      this.movementMode = 0; // default is rotational. 
      this.initPosVec = createVector(initPosx, initPosy);
      this.posVec = createVector(initPosx, initPosy);
      this.sizex = sizex;
      this.sizey = sizey;
      this.frameSource = null;
      this.frameSourceSize = null;
      this.frameIndex = 0;
  
      this.rightTile = null;
      this.leftTile = null;
      this.topTile = null;
      this.bottomTile = null;

      this.rightBottomTile = null;
      this.rightTopTile = null;
      this.leftBottomTile = null;
      this.leftTopTile = null;
  
      this.sizeFactor = 0;
      this.provokedByMouse = false;

      this.prvokedFromLeft = false;
      this.provokedFromRight = false;
      this.provokedFromTop = false;
      this.provokedFromBottom = false;

      this.provokedFromLeftBottom = false;
      this.provokedFromLeftTop = false;
      this.provokedFromRightBottom = false;
      this.provokedFromRightTop = false;

      this.provokedCount = 0;
    }
  
    setAdjacentTileRight(tile){ this.rightTile = tile; }
    setAdjacentTileLeft(tile){ this.leftTile = tile; }
    setAdjacentTileTop(tile){ this.topTile = tile; }
    setAdjacentTileBottom(tile){ this.bottomTile = tile; }
    
    setAdjacentTileRightBottom(tile){ this.rightBottomTile = tile; }
    setAdjacentTileRightTop(tile){ this.rightTopTile = tile; }
    setAdjacentTileLeftBottom(tile){ this.leftBottomTile = tile; }
    setAdjacentTileLeftTop(tile){ this.leftTopTile = tile; }
    
  
    setMovementMode(newMode){
      this.movementMode = newMode;
    }
  
    updateFrameIndexRotational(){
      let dx = mouseX - this.posVec.x;
      let dy = mouseY - this.posVec.y;
  
      let angle = atan2(dy, dx);
      this.frameIndex = map(angle, -Math.PI, Math.PI, 0, this.frameSourceSize - 1);
      //console.log(this.frameIndex);
      this.frameIndex = int(this.frameIndex);
    }
  
    updateFrameIndexHorizontal(){
      let dx = mouseX - this.posVec.x;
      let halfWidth = this.sizex * 0.5;
      if (dx < -halfWidth) this.frameIndex = 0;
      else if (dx > halfWidth) this.frameIndex = this.frameSourceSize - 1;
      else {
        this.frameIndex = map(dx, -halfWidth, halfWidth, 1, this.frameSourceSize - 1);
        this.frameIndex = int(this.frameIndex);
      }
    }
  
    updateFrameIndexVertical(){
      let dy = mouseY - this.posVec.y;
      let halfHeight = this.sizey * 0.5;
      if (dy < -halfHeight) this.frameIndex = 0;
      else if (dy > halfHeight) this.frameIndex = this.frameSourceSize - 1;
      else {
        this.frameIndex = map(dy, -halfHeight, halfHeight, 1, this.frameSourceSize - 1);
        this.frameIndex = int(this.frameIndex);
      }
    }
  
    updateFrameIndex(){
      switch(this.movementMode){
        case 0:
          this.updateFrameIndexRotational();
          break;
        case 1:
          this.updateFrameIndexHorizontal();
          break;
        case 2:
          this.updateFrameIndexVertical();
          break;
      }
    }
  
    updatePositionHorizontal(){
      
    }
  
    updatePositionVertical(){
  
    }
  
    updatePositionRotational(){
  
    }
  
    updatePosition(){
      switch(this.movementMode){
        case 0:
          this.updatePositionRotational();
          break;
        case 1:
          this.updatePositionHorizontal();
          break;
        case 2:
          this.updatePositionVertical();
          break;
      }
    }
    
    // frameSource: an array of frames from a video
    setFrameSource(newFrameSource){
      this.frameSource = newFrameSource;
      this.frameSourceSize = this.frameSource.length;
    }
  
    provokedMovementByMouse(){
      if (this.provokedByMouse){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.rightTile != null) this.rightTile.provokedFromLeft = true;
          if (this.leftTile != null) this.leftTile.provokedFromRight = true;
          if (this.topTile != null) this.topTile.provokedFromBottom = true;
          if (this.bottomTile != null) this.bottomTile.provokedFromTop = true;
          if (this.leftBottomTile != null) this.leftBottomTile.provokedFromRightTop = true;
          if (this.leftTopTile != null) this.leftTopTile.provokedFromRightBottom = true;
          if (this.rightBottomTile != null) this.rightBottomTile.provokedFromLeftTop = true;
          if (this.rightTopTile != null) this.rightTopTile.provokedFromLeftBottom = true;         

          
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedByMouse = false;
        }
      }
    }
  
    provokedMovementFromLeft(){
      if (this.provokedFromLeft){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.rightTile != null) {
            this.rightTile.provokedFromLeft = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromLeft = false;
        }
      }
    }
  
    provokedMovementFromRight(){
      if (this.provokedFromRight){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.leftTile != null) {
            this.leftTile.provokedFromRight = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromRight = false;
        }
      }
    }
  
    provokedMovementFromTop(){
      if (this.provokedFromTop){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.bottomTile != null) {
            this.bottomTile.provokedFromTop = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromTop = false;
        }
      }
    }
  
    provokedMovementFromBottom(){
      if (this.provokedFromBottom){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.topTile != null) {
            this.topTile.provokedFromBottom = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromBottom = false;
        }
      }
    }

    provokedMovementFromLeftBottom(){
      if (this.provokedFromLeftBottom){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.rightTopTile != null) {
            this.rightTopTile.provokedFromLeftBottom = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromLeftBottom = false;
        }
      }
    }

    provokedMovementFromLeftTop(){
      if (this.provokedFromLeftTop){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.rightBottomTile != null) {
            this.rightBottomTile.provokedFromLeftTop = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromLeftTop = false;
        }
      }
    }

    provokedMovementFromRightBottom(){
      if (this.provokedFromRightBottom){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.leftTopTile != null) {
            this.leftTopTile.provokedFromRightBottom = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromRightBottom = false;
        }
      }
    }

    provokedMovementFromRightTop(){
      if (this.provokedFromRightTop){
        this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
        this.provokedCount += PI / 45;
        if (this.provokedCount > PI / 8){
          if (this.leftBottomTile != null) {
            this.leftBottomTile.provokedFromRightTop = true;
          }
        }
  
        if (this.sizeFactor < 1.0) {
          this.sizeFactor = 1.0;
          this.provokedCount = 0;
          this.provokedFromRightTop = false;
        }
      }
    }
  
    display(){
      if (this.sizeFactor < 1.0) this.sizeFactor += 0.05;
  
      this.provokedMovementByMouse();
      this.provokedMovementFromLeft();
      this.provokedMovementFromRight();
      this.provokedMovementFromBottom();
      this.provokedMovementFromTop();

      this.provokedMovementFromLeftBottom();
      this.provokedMovementFromLeftTop();

      this.provokedMovementFromRightBottom();
      this.provokedMovementFromRightTop();
  
      let provoked = this.provokedByMouse || this.provokedFromBottom ||
                      this.provokedFromTop || this.provokedFromLeft || this.provokedFromRight;
      if (provoked) this.frameIndex = int(random(this.frameSourceSize));
      
      if (this.mouseIsInTile()){
        fill(255, 0, 0);
        stroke(255, 0, 0);
        rect(this.posVec.x, this.posVec.y, 
          this.sizex * 1.001 * this.sizeFactor, this.sizey * 1.001 * this.sizeFactor);
      }
      let imgRef = this.frameSource[this.frameIndex];
      image(imgRef, this.posVec.x, this.posVec.y, 
        this.sizex * 0.95 * this.sizeFactor, this.sizey * 0.95 * this.sizeFactor);
    }
  
    mouseIsInTile(){
      if (abs(mouseX - this.posVec.x) < this.sizex * 0.5){
        if (abs(mouseY - this.posVec.y) < this.sizey * 0.5){
          return true;
        }
        return false;
      }
      return false;
    }
  
    resize(newWidth, newHeight){
      this.sizex = newWidth;
      this.sizey = newHeight;
    }
  }
  