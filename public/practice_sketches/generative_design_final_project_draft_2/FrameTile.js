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
      this.provokedFrameSource = null;
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
      this.provoked = false;
      this.provokeFlag = false;

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
      this.neighboringTilesArr = [];
    }
  
    setAdjacentTileRight(tile){ this.rightTile = tile; this.neighboringTilesArr.push(this.rightTile); }
    setAdjacentTileLeft(tile){ this.leftTile = tile; this.neighboringTilesArr.push(this.leftTile); }
    setAdjacentTileTop(tile){ this.topTile = tile; this.neighboringTilesArr.push(this.topTile); }
    setAdjacentTileBottom(tile){ this.bottomTile = tile; this.neighboringTilesArr.push(this.bottomTile); }
    
    setAdjacentTileRightBottom(tile){ this.rightBottomTile = tile; this.neighboringTilesArr.push(this.rightBottomTile); }
    setAdjacentTileRightTop(tile){ this.rightTopTile = tile; this.neighboringTilesArr.push(this.rightTopTile); }
    setAdjacentTileLeftBottom(tile){ this.leftBottomTile = tile; this.neighboringTilesArr.push(this.leftBottomTile); }
    setAdjacentTileLeftTop(tile){ this.leftTopTile = tile; this.neighboringTilesArr.push(this.leftTopTile); }
    
  
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
  
    updatePosition(movementFunc){
      /*
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
      */
      movementFunc(this);
    }
    
    // frameSource: an array of frames from a video
    setFrameSource(newFrameSource){
      this.frameSource = newFrameSource;
      this.frameSourceSize = this.frameSource.length;
    }

    setProvokedFrameSource(provokedFrameSource){
      this.provokedFrameSource = provokedFrameSource;
    }

    provokedMovement(){
        if (this.provoked){
          this.sizeFactor = 1.0 + 0.25 * sin(this.provokedCount);
          this.provokedCount += PI / 45;
          if (this.provokedCount > PI / 8 && !this.provokeFlag){
            for (let i = 0; i < this.neighboringTilesArr.length; i++){
              if (this.neighboringTilesArr[i] != null){
                if (this.neighboringTilesArr[i] != this.provoked) this.neighboringTilesArr[i].provoked = true;
              }
            }
            this.provokeFlag = true;
          }
          if (this.sizeFactor < 1.0) {
            this.sizeFactor = 1.0;
            this.provokedCount = 0;
            this.provoked = false;
            this.provokeFlag = false;
            
          }
        }
    }
  
  
    display(){
      if (this.sizeFactor < 1.0) this.sizeFactor += 0.05;
      this.provokedMovement();
    
      if (this.provoked) this.frameIndex = int(random(this.frameSourceSize));
      
      if (this.mouseIsInTile()){
        fill(255, 0, 0);
        stroke(255, 0, 0);
        rect(this.posVec.x, this.posVec.y, 
          this.sizex * 1.001 * this.sizeFactor, this.sizey * 1.001 * this.sizeFactor);
      }
      let imgRef = this.frameSource[this.frameIndex];
      
      if (!this.provoked){
        image(imgRef, this.posVec.x, this.posVec.y, 
          this.sizex * 0.95 * this.sizeFactor, this.sizey * 0.95 * this.sizeFactor);
      }
      else {
        let provokedFrameIndex = int(map(this.provokedCount, 0, PI, 0, this.provokedFrameSource.length - 1));
        image(this.provokedFrameSource[provokedFrameIndex], this.posVec.x, this.posVec.y, 
          this.sizex * 0.95 * this.sizeFactor, this.sizey * 0.95 * this.sizeFactor);
      }
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
  