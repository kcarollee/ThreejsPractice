class LSystemTree{
    constructor(){
      this.axiom = 'X';
      this.ruleF = 'FF';
      this.ruleX = 'F-[[X]+X]+F[+FX]-X';
      this.iterNum = 4;
      //this.ruleFinal = '';
      this.ruleFinal = this.ruleX;
      this.rotation = PI * random(0.1, 0.25);
      this.branchLength = 20;
      this.displayIndex = 0;
  
      this.leavesArr = [];
      this.initialLeavesNum = 0;
      this.singleRun = true;

      this.initialThickness = 40;
    }
  
    generateFinalRule(){
      for (let i = 0; i < this.iterNum - 1; i++){
        this.ruleFinal = this.generateNextRule(this.ruleFinal);
      }
    }

    reset(){
      this.leavesArr = [];
      this.ruleFinal = this.ruleX;
      this.rotation = PI * random(0.1, 0.25);
      this.generateFinalRule();
      this.generateLeaves();
      this.singleRun = true;
    }

    generateRuleX(){

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
            let leaf = new Leaf(posCopy.x, posCopy.y, random(50, 100));
            leaf.setId(this.leavesArr.length);
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
      this.initialLeavesNum = this.leavesArr.length;
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
                  renderer.strokeWeight(this.initialThickness / pow(2, pushCount));
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
      let leavesArrPtr = this.leavesArr;
      this.leavesArr.forEach(function(leaf){
        //renderer.rect(p.x, p.y, 10, 10);
        leaf.updateBasedOnTexture(flowTex);

        // kill leaves based on lifespan
        if (leaf.lifecount > Leaf.lifespan){
          let leafIndex = leavesArrPtr.indexOf(leaf);
          leavesArrPtr.splice(leafIndex, 1);
        }
      });
    }

    
  
    displayLeaves(renderer, leafTexture){
      renderer.push();
      renderer.translate(0, height * 0.5);
      this.leavesArr.forEach(function(leaf){
        //renderer.rect(p.x, p.y, 10, 10);
        leaf.display(renderer, leafTexture);
      });
      renderer.pop();
    }
  }

  