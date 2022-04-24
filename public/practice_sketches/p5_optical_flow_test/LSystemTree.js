class LSystemTree{
    constructor(){
      this.axiom = 'X';
      this.ruleF = 'FF';
      this.ruleX = 'F-[[X]+X]+F[+FX]-X';
      this.iterNum = 5;
      this.ruleFinal = '';
      this.ruleFinal += (this.ruleX);
      this.rotation = PI * 0.25;
      this.branchLength = 10;
      this.displayIndex = 0;
  
      this.pointsArr = [];
    }
  
    generateFinalRule(){
      for (let i = 0; i < this.iterNum - 1; i++){
        this.ruleFinal = this.generateNextRule(this.ruleFinal);
      }
    }
  
    
  
    generatePoints(){
      let incVecStack = [];
      let posVecStack = [];
      let incVec = createVector(0, -this.branchLength);
      let posVec = createVector(0, 0);
      for (let i = 0; i < this.ruleFinal.length; i++){
        let curChar = this.ruleFinal[i];
        switch(curChar){
          case 'F':
            //renderer.line(0, 0, 0, -this.branchLength);
            //renderer.translate(0, -this.branchLength);
           
            posVec.add(incVec);
            
            
            break;
          case 'X':
            //renderer.translate(0, -this.branchLength);
            break;
          case '+':
            //renderer.rotate(this.rotation);
            incVec.rotate(this.rotation);
            break;
          case '-':
            //renderer.rotate(-this.rotation);
            incVec.rotate(-this.rotation);
            break;
          case '[':
            let incVecCopy = incVec.copy();
            let posVecCopy = posVec.copy();
            incVecStack.push(incVecCopy);
            posVecStack.push(posVecCopy);
            //console.log(incVecCopy);
            //renderer.push();
            break;
          case ']':
            incVec=incVecStack.pop();
            posVec=posVecStack.pop();
            console.log("POP " + incVecStack + "incVec " + incVec);
            let posCopy = posVec.copy();
        
            this.pointsArr.push(posCopy);
            //renderer.pop();
            break;
          
        }
      }
      console.log(this.pointsArr);
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
  
    
    displayBody(renderer){
      let len = this.ruleFinal.length;
      //if (this.displayIndex <= len) this.displayIndex++;
      renderer.push();
      renderer.translate(0, height * 0.5);
  
      let coordHistory = [0, height * 0.5];
  
      for (let i = 0; i < len; i++){
        let curChar = this.ruleFinal[i];
        switch(curChar){
          case 'F':
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
            break;
          case ']':
           
            renderer.pop();
            break;
  
          
        }
      }
      renderer.pop();
  
      
    }
  
    displayLeaves(renderer){
      renderer.push();
      renderer.translate(0, height * 0.5);
      this.pointsArr.forEach(function(p){
        renderer.rect(p.x, p.y, 10, 10);
      });
      renderer.pop();
    }
  }