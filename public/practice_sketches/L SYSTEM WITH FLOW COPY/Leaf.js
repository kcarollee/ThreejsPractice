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
    let moveSpeed = map(avg, 0, 255, 1, 10);
    
    
    if (red > Leaf.threshold || green > Leaf.threshold){
      // stays as true once it is triggered
      this.move = true;
      //console.log("MOVE");
    }
    if (this.move){
      this.position.x += mappedR * moveSpeed;
      this.position.y += mappedG * moveSpeed;
      this.lifecount += 0.5;
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
        if (boidCount == Leaf.MAX_SEARCH_COUNT) return;
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
        if (Leaf.boidMovementMode == 0) steerVec.add(boid.velocity);
        else steerVec.add(boid.position);
        boidCount++;
        if (boidCount == Leaf.MAX_SEARCH_COUNT) return;
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
        if (boidCount == Leaf.MAX_SEARCH_COUNT) return;
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
    renderer.push();
    renderer.translate(this.position.x, this.position.y);
    renderer.rotate(atan(this.velocity.y / this.velocity.x));
    
    if (leafTextureArr[this.textureIndexOffset] != undefined) {
      /*
      if (this.move) renderer.texture(leafTextureArr[this.textureIndexOffset]);
      else renderer.texture(pgLeafIdleTexture);
      */
      renderer.texture(leafTextureArr[this.textureIndexOffset]);
    }
    
    // still in the state of appearing
    if (this.appearCount < this.size && !this.move){
      //renderer.push();
      //renderer.translate(this.position.x, this.position.y);
      //renderer.rotate(100);
      //renderer.rect(0, 0, this.appearCount, this.appearCount);
      renderer.rect(0, 0, this.appearCount , this.appearCount * 0.25);
      //renderer.pop();
    }
    else {
      //renderer.rect(0.0, this.sizeMod, this.sizeMod);
      renderer.rect(0, 0, this.sizeMod , this.sizeMod * 0.25);
    }
    renderer.pop();
  }
}

Leaf.threshold = 50;
Leaf.lifespan = 200;
Leaf.viewRange = 200;
Leaf.alignCoef = 1.0;
Leaf.cohesionCoef = 0.6;
Leaf.separationCoef = 0.6;
Leaf.maxSpeed = 4.0;
Leaf.maxForce = 0.05;
Leaf.alignRadius = 100;
Leaf.separationRadius = 50;
Leaf.cohesionRadius = 110;

Leaf.MAX_SEARCH_COUNT = 3;
Leaf.boidMovementMode = 0; // 0: boids tend to be in the center, 1: boids spread out evenly


