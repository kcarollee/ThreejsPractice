

class FrameTileGroup{
    constructor(rowNum, colNum, sizew, sizeh, startingPosx, startingPosy, frameSource, provokedFrameSource, mode){
      this.rowNum = rowNum;
      this.colNum = colNum;
      this.sizew = sizew;
      this.sizeh = sizeh;
      this.xOffset = startingPosx;
      this.yOffset = startingPosy;
  
      this.frameTileArr = [];
      this.frameSource = frameSource;
      this.provokedFrameSource = provokedFrameSource;
  
      this.movementMode = mode;

      this.bassNotesArr = null;
      this.melodyNotesArr = null;
      
      this.bassOscillator = new p5.Oscillator('triangle');
      this.bassFreq;
      this.bassAmp = 0.001;
      this.bassNoteIndex = 0;
      this.bassEnvelope = new p5.Envelope();
      this.bassEnvelope.setADSR(0.01, 0.01, 0.1, 0.1);
      this.bassEnvelope.setRange(this.bassAmp, 0);
      this.delay = new p5.Delay();
      
      
      
      this.clickedOnce = false;

      this.melodyOscillator = new p5.Oscillator('triangle');
      //this.melodyOscillator.start();
      this.melodyFreq;
      this.melodyAmp = 0.1;
      this.melodyNoteIndex = 0;
      this.melodyEnvelope = new p5.Envelope();
      //attackTime, decayTime, sustainRatio, releaseTime
      this.melodyEnvelope.setADSR(0.0001, 0.5, 0.01, 0.0001);
      this.melodyEnvelope.setRange(0.5, 0);
      this.delay.process(this.melodyOscillator, 0.2, 0.8, 2300);
      this.generateGridTiles();
    }

    setNoteArrays(bassNotesArr, melodyNotesArr){
      this.bassNotesArr = bassNotesArr;
      this.melodyNotesArr = melodyNotesArr;
    }

    playOscillator(){
      if (frameCount % 6 == 0) {
        this.bassFreq = this.bassNotesArr[this.bassNoteIndex];
        this.bassNoteIndex++;
        this.bassNoteIndex %= this.bassNotesArr.length;
        //this.bassOscillator.start();
        //this.bassEnvelope.triggerAttack();
        this.bassOscillator.freq(this.bassFreq);
        this.bassOscillator.amp(this.bassAmp);
        this.bassEnvelope.setRange(this.bassAmp, 0);
        this.bassEnvelope.play();
      }
    }
  
    display(positionFunc){
      if (this.clickedOnce){
        this.playOscillator();
        
      }
      push();
      
      
      this.frameTileArr.forEach(function(frame){
        frame.updateFrameIndex();
        frame.updatePosition(positionFunc);
        frame.display();
      });
      pop();
    }
  
    mouseClickReactive(){
      
      for (let i = 0; i < this.frameTileArr.length; i++){
          if (this.frameTileArr[i].mouseIsInTile()){
              this.frameTileArr[i].provoked = true;
              // bass notes
              if (!this.clickedOnce){
                this.clickedOnce = true;
                this.bassOscillator.start();
                this.bassEnvelope.play(this.bassOscillator);
              }

              // melody notes
              this.melodyNoteIndex = int(random(0, this.melodyNotesArr.length));
              this.melodyFreq = this.melodyNotesArr[this.melodyNoteIndex];
              console.log(this.melodyFreq, this.melodyNoteIndex);
              this.melodyOscillator.freq(this.melodyFreq);
              //this.melodyOscillator.amp(this.melodyAmp * 0.5);
              this.melodyOscillator.start();
              this.melodyEnvelope.setRange(0.1, 0);
              this.melodyEnvelope.play(this.melodyOscillator);
              return true;
          }
      }
      return false;
    }

    repositionFrames(groupCenterX, groupCenterY){
        this.xOffset = groupCenterX - this.sizew * (this.colNum - 1) * 0.5;
        this.yOffset = groupCenterY - this.sizeh * (this.rowNum - 1) * 0.5;
        let idx = 0;
        for (let row = 0; row < this.rowNum; row++){
            for (let col = 0; col < this.colNum; col++){
              
              let y = this.yOffset + row * this.sizeh; 
              let x = this.xOffset + col * this.sizew;
              let frameTile = this.frameTileArr[idx];
              frameTile.initPosVec.x = x;
              frameTile.initPosVec.y = y;
              frameTile.posVec.x = x;
              frameTile.posVec.y = y;
    
              idx++;
            }
        }
    }
  
    generateGridTiles(){
      for (let row = 0; row < this.rowNum; row++){
        for (let col = 0; col < this.colNum; col++){
          
          let y = this.yOffset + row * this.sizeh; 
          let x = this.xOffset + col * this.sizew;
          let frameTile = new FrameTile(x, y, this.sizew, this.sizeh);

          frameTile.setFrameSource(this.frameSource);
          frameTile.setMovementMode(this.movementMode);
          frameTile.setProvokedFrameSource(this.provokedFrameSource);
          this.frameTileArr.push(frameTile);
        }
      }
  
      let idx = 0;
      for (let row = 0; row < this.rowNum; row++){
        for (let col = 0; col < this.colNum; col++){
          
          let currentIndex = idx;
          let rightIndex = idx + 1;
          let leftIndex = idx - 1;
          let topIndex = idx - this.colNum;
          let bottomIndex = idx + this.colNum;
  
          let leftBottomIndex = bottomIndex - 1;
          let leftTopIndex = topIndex - 1;
          let rightBottomIndex = bottomIndex + 1;
          let rightTopIndex = topIndex + 1;
  
          let currentTile = this.frameTileArr[currentIndex];
          // CORNER CASE 1: right, bottom, rightBottom
          if (row == 0 && col == 0){
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileRightBottom(this.frameTileArr[rightBottomIndex]);
  
        
          }
          // CORNER CASE 2: left, bottom, leftBottom
          else if (row == 0 && col == this.colNum - 1){
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileLeftBottom(this.frameTileArr[leftBottomIndex]);
          }
          // CORNER CASE 3: top, right, rightTop
          else if (row == this.rowNum - 1 && col == 0){
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
            currentTile.setAdjacentTileRightTop(this.frameTileArr[rightTopIndex]);
  
          }
          // CORNER CASE 4: left, top, leftTop
          else if (row == this.rowNum - 1 && col == this.colNum - 1){
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
            currentTile.setAdjacentTileLeftTop(this.frameTileArr[leftTopIndex]);
          }
  
          // SIDE CASE 1: left, right, bottom, leftBottom, rightBottom
          else if (row == 0){
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
  
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftBottomIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[rightBottomIndex]);
          }
          // SIDE CASE 2: left, right, top, leftTop, rightTop
          else if (row == this.rowNum - 1){
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
  
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftTopIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[rightTopIndex]);
          }
          // SIDE CASE 3: top, bottom, right, rightTop, rightBottom
          else if (col == 0){
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
  
            currentTile.setAdjacentTileLeft(this.frameTileArr[rightTopIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[rightBottomIndex]);
          }
  
          // SIDE CASE 4: left, top, bottom, leftTop, leftBottom
          else if (col == this.colNum - 1){
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
  
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftTopIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftBottomIndex]);
          }
  
          // REST: left, right, bottom, top, rightTop, rightBottom, leftTop, leftBottom
          else {
            currentTile.setAdjacentTileRight(this.frameTileArr[rightIndex]);
            currentTile.setAdjacentTileBottom(this.frameTileArr[bottomIndex]);
            currentTile.setAdjacentTileLeft(this.frameTileArr[leftIndex]);
            currentTile.setAdjacentTileTop(this.frameTileArr[topIndex]);
  
            currentTile.setAdjacentTileLeftBottom(this.frameTileArr[leftBottomIndex]);
            currentTile.setAdjacentTileLeftTop(this.frameTileArr[leftTopIndex]);
  
            currentTile.setAdjacentTileRightBottom(this.frameTileArr[rightBottomIndex]);
            currentTile.setAdjacentTileRightTop(this.frameTileArr[rightTopIndex]);
          }
          idx++;
        }
      }
    }
  
    
  }