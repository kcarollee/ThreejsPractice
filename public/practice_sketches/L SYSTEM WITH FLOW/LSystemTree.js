class Leaf{
  constructor(posx, posy, size){
    this.posx = posx;
    this.posy = posy;
    this.size = size;
    this.move = false;

  }

  // GET RED AND GREEN VALUES FROM FLOW TEXTURE
  updateBasedOnTexture(tex){
    // note that tex.height is added instead of tex.height * 0.5 bc you need to take in consideration
    // the translate operation done in the displayLeaves function.
    let color = tex.get(this.posx + tex.width * 0.5, this.posy + tex.height);
    
    let red = color[0];
    let green = color[1];
    red = map(red, 0, 255, 0, 1);
    green = map(green, 0, 255, 0, 1);
    let avg = (red + green) * 0.5;
    
    if (avg > Leaf.threshold){
      // stays as true once it is triggered
      //console.log(avg);
      this.move = true;
    }
    if (this.move){
      this.posx += 10;
      this.posy += 10;
    }
  }

  display(renderer){
    renderer.rect(this.posx, this.posy, this.size, this.size);
  }
}

Leaf.threshold = 0.2;

class LSystemTree{
    constructor(){
      this.axiom = 'X';
      this.ruleF = 'FF';
      this.ruleX = 'F-[[X]+X]+F[+FX]-X';
      this.iterNum = 4;
      this.ruleFinal = '';
      this.ruleFinal += (this.ruleX);
      this.rotation = PI * 0.2;
      this.branchLength = 20;
      this.displayIndex = 0;
  
      this.leavesArr = [];
      this.singleRun = true;
    }
  
    generateFinalRule(){
      for (let i = 0; i < this.iterNum - 1; i++){
        this.ruleFinal = this.generateNextRule(this.ruleFinal);
      }
    }
  
    
  
    generateLeaves(){
      let incVecStack = [];
      let posVecStack = [];
      let incVec = createVector(0, -this.branchLength);
      let posVec = createVector(0, 0);
      for (let i = 0; i < this.ruleFinal.length; i++){
        let curChar = this.ruleFinal[i];
        switch(curChar){
          case 'F':
            posVec.add(incVec);
            break;
          case 'X':
            let posCopy = posVec.copy();
            let leaf = new Leaf(posCopy.x, posCopy.y, 10);
            this.leavesArr.push(leaf);
            break;
          case '+':
            incVec.rotate(this.rotation);
            break;
          case '-':           
            incVec.rotate(-this.rotation);
            break;
          case '[':
            let incVecCopy = incVec.copy();
            let posVecCopy = posVec.copy();
            incVecStack.push(incVecCopy);
            posVecStack.push(posVecCopy);
            
            break;
          case ']':
            incVec=incVecStack.pop();
            posVec=posVecStack.pop();
            
            break;
          
        }
      }
      //console.log(this.leavesArr);
    }
  
    generateNextRule(rule){
      let len = rule.length;
      let strTemp = '';
      for (let i = 0; i < len; i++){
        let curChar = rule[i];
        switch(curChar){
          case 'F':
            strTemp += this.ruleF;
            break;
          case 'X':
            strTemp += this.ruleX;
            break;
          default:
            strTemp += curChar;
            break;
        }
      }
      return strTemp;
    }
  
    
    displayBranches(renderer){
        let pushCount = 1;
        if (this.singleRun){
            let len = this.ruleFinal.length;
            //if (this.displayIndex <= len) this.displayIndex++;
            renderer.push();
            renderer.translate(0, height * 0.5);

            let coordHistory = [0, height * 0.5];

            for (let i = 0; i < len; i++){
              let curChar = this.ruleFinal[i];
              switch(curChar){
                case 'F':
                  renderer.strokeWeight(15 / pushCount);
                  renderer.line(0, 0, 0, -this.branchLength);
                  renderer.translate(0, -this.branchLength);
                  break;
                case 'X':
                  //renderer.translate(0, -this.branchLength);
                  break;
                case '+':

                  renderer.rotate(this.rotation);
                  break;
                case '-':
                  renderer.rotate(-this.rotation);
                  break;
                case '[':

                  renderer.push();
                  pushCount++;
                  break;
                case ']':
                  renderer.pop();
                  pushCount--;
                  break;
              }
            }
            renderer.pop();
        }
        // render ONLY ONCE
        this.singleRun = false;   
    }

    updateLeaves(flowTex){
      this.leavesArr.forEach(function(leaf){
        //renderer.rect(p.x, p.y, 10, 10);
        leaf.updateBasedOnTexture(flowTex);
      });
    }

    /*
    // GET RED AND GREEN VALUES FROM FLOW TEXTURE
  updateBasedOnTexture(tex){
    let color = tex.get(this.posx, this.posy);
    let red = color[0];
    let green = color[1];
    red = map(red, 0, 255, 0, 1);
    green = map(green, 0, 255, 0, 1);
    let avg = (red + green) * 0.5;
    if (avg > Leaf.threshold){
      // stays as true once it is triggered
      this.move = true;
    }
    if (this.move){
      this.posx += 1;
      this.posy += 1;
    }
    */

  
    displayLeaves(renderer){
      renderer.push();
      renderer.translate(0, height * 0.5);
      this.leavesArr.forEach(function(leaf){
        //renderer.rect(p.x, p.y, 10, 10);
        leaf.display(renderer);
      });
      renderer.pop();
    }
  }

  