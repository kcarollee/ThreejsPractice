class Leaf{
    constructor(posx, posy, size){
      this.posx = posx;
      this.posy = posy;
      this.appearSize = 0;
      this.size = size; // max size
      this.sizeMod = size;
      this.move = false;
      this.lifecount = 0;
      this.appearCount = 0;
      this.alpha = 255;
      this.textureIndexOffset = int(random(0, pgLeafTextureNum));
      this.id;
      this.velocity = createVector(random(-50, 50), random(-50, 50));
      this.acceleration = createVector(random(-10, 10), random(-10, 10));
      this.position = createVector(this.posx, this.posy);
    }
  
    setId(id){this.id = id;}
  
    // GET RED AND GREEN VALUES FROM FLOW TEXTURE
    updateBasedOnTexture(tex){
      // USING GET() IS EXTREMELY SLOW!!!!!!!
      // let color = tex.get(this.posx + tex.width * 0.5, this.posy + tex.height);
      // tex's y coordinates are flipped for some reason
      let colorIndexStart = int(this.position.x) + int(tex.width * 0.5) + tex.width * (-int(this.position.y - tex.height * 0.5));
      
      let red = tex.pixels[4 * colorIndexStart];
      let green = tex.pixels[4 * colorIndexStart + 1];
  
      
      let avg = (red + green) * 0.5;
      
      let unnormalizedRG = createVector(red, green);
      let normalizedRG = p5.Vector.normalize(unnormalizedRG);
      let mappedR = map(normalizedRG.x, 0, 1, -1, 1);
      let mappedG = map(normalizedRG.y, 0, 1, -1, 1);
      let moveVel = map(avg, 0, 255, 1, 10);
      
      
      if (red > Leaf.threshold || green > Leaf.threshold){
        // stays as true once it is triggered
        this.move = true;
        //console.log("MOVE");
      }
      if (this.move){
        this.position.x += mappedR * moveVel;
        this.position.y += mappedG * moveVel;
        this.lifecount++;
      }
      else {
        if (this.appearCount < this.size) this.appearCount += 4;
      }
    }

    updateBasedOnFlocking(){
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      if (this.velocity.mag() > Leaf.maxSpeed){
        this.velocity.normalize();
        this.velocity.mult(Leaf.maxSpeed);
      }
    }

    simulateFlock(leafArray){
      let alignVec = this.getAlignmentVector(leafArray);
      let cohesionVec = this.getCohesionVector(leafArray);
      let separationVec = this.getSeparationVector(leafArray);

      alignVec.mult(Leaf.alignCoef);
      cohesionVec.mult(Leaf.cohesionCoef);
      separationVec.mult(Leaf.separationCoef);

      this.acceleration.add(alignVec);
      this.acceleration.add(cohesionVec);
      this.acceleration.add(separationVec);

    }

    getAlignmentVector(leafArray){
      let steerVec = createVector(0, 0);
      let boidCount = 0;
      let thisRef = this;
      leafArray.forEach(function(boid){
        let d = dist(thisRef.position.x, thisRef.position.y, boid.position.x, boid.position.y);
        if (boid !== thisRef && d < Leaf.alignRadius){
          steerVec.add(boid.velocity);
          boidCount++;
        }
      });

      if (boidCount > 0){
        steerVec.div(boidCount);
        
        steerVec.normalize();
        steerVec.mult(Leaf.maxSpeed);
        steerVec.sub(this.velocity);
        if (steerVec.mag() > Leaf.maxForce) {
          steerVec.normalize();
          steerVec.mult(Leaf.maxForce);
        }
      }
      return steerVec;
    }

    getCohesionVector(leafArray){
      let steerVec = createVector(0, 0);
      let boidCount = 0;
      let thisRef = this;
      leafArray.forEach(function(boid){
        let d = dist(thisRef.position.x, thisRef.position.y, boid.position.x, boid.position.y);
        
        if (boid !== thisRef && d < Leaf.cohesionRadius){
          steerVec.add(boid.position);
          boidCount++;
        }
      });

      if (boidCount > 0){
        steerVec.div(boidCount);
        steerVec.sub(thisRef.position);
        
        steerVec.normalize();
        steerVec.mult(Leaf.maxSpeed);
        steerVec.sub(this.velocity);
        if (steerVec.mag() > Leaf.maxForce) {
          steerVec.normalize();
          steerVec.mult(Leaf.maxForce);
        }
      }
      return steerVec;
    }

    getSeparationVector(leafArray){
      let steerVec = createVector(0, 0);
      let boidCount = 0;
      let thisRef = this;
      leafArray.forEach(function(boid){
        let d = dist(thisRef.position.x, thisRef.position.y, boid.position.x, boid.position.y);
        if (boid !== thisRef && d < Leaf.separationRadius){
          let otherToThis = p5.Vector.sub(thisRef.position, boid.position);
          otherToThis.div(d * d);
          steerVec.add(otherToThis);
          boidCount++;
        }
      });

      if (boidCount > 0){
        steerVec.div(boidCount);
        
        steerVec.normalize();
        steerVec.mult(Leaf.maxSpeed);
        steerVec.sub(this.velocity);
        if (steerVec.mag() > Leaf.maxForce) {
          steerVec.normalize();
          steerVec.mult(Leaf.maxForce);
        }
      }
      return steerVec;
    }
  
    display(renderer, leafTextureArr){
      if (this.position.x > renderer.width * 0.5 + this.size || 
        this.position.x < - renderer.width * 0.5 - this.size) this.position.x *= -1;

      if (this.position.y > renderer.height * 0.5 + this.size || 
        this.position.y < - renderer.height * 0.5 - this.size) this.position.y *= -1;
      if (this.move){
        this.sizeMod = map(this.lifecount, 0, Leaf.lifespan, this.size, 0);  
      }
      else{
        this.appearSize = map(this.appearCount, 0, this.size, 0, this.size); 
      }
      
      //renderer.fill(0, 0, 255, this.alpha);
      renderer.noStroke();
      if (leafTextureArr[this.textureIndexOffset] != undefined) {
        if (this.move) renderer.texture(leafTextureArr[this.textureIndexOffset]);
        else renderer.texture(pgLeafIdleTexture);
      }
      // still in the state of appearing
      if (this.appearCount < this.size && !this.move){
        //renderer.push();
        //renderer.translate(this.position.x, this.position.y);
        //renderer.rotate(100);
        renderer.rect(this.position.x, this.position.y, this.appearCount, this.appearCount);
        //renderer.pop();
      }
      else {
        renderer.rect(this.position.x, this.position.y, this.sizeMod, this.sizeMod);
      }
    }
  }
  
  Leaf.threshold = 50;
  Leaf.lifespan = 200;
  
  Leaf.alignCoef = 1.0;
  Leaf.cohesionCoef = 0.4;
  Leaf.separationCoef = 0.6;
  Leaf.maxSpeed = 3.0;
  Leaf.maxForce = 0.5;
  Leaf.alignRadius = 50;
  Leaf.separationRadius = 25;
  Leaf.cohesionRadius = 55;
  

  