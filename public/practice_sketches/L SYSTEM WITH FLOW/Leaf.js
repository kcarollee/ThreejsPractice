class Leaf{
    constructor(posx, posy, size){
      this.posx = posx;
      this.posy = posy;
      this.size = size; // initial size
      this.sizeMod = size;
      this.move = false;
      this.lifecount = 0;
      this.alpha = 255;
      
      this.id;
    }
  
    setId(id){this.id = id;}
  
    // GET RED AND GREEN VALUES FROM FLOW TEXTURE
    updateBasedOnTexture(tex){
      // USING GET() IS EXTREMELY SLOW!!!!!!!
      //let color = tex.get(this.posx + tex.width * 0.5, this.posy + tex.height);
      // tex's y coordinates are flipped for some reason
      let colorIndexStart = int(this.posx) + int(tex.width * 0.5) + tex.width * (-int(this.posy));
      
      let red = tex.pixels[4 * colorIndexStart];
      let green = tex.pixels[4 * colorIndexStart + 1];
  
      
      let avg = (red + green) * 0.5;
      
      let unnormalizedRG = createVector(red, green);
      let normalizedRG = p5.Vector.normalize(unnormalizedRG);
      let mappedR = map(normalizedRG.x, 0, 1, -1, 1);
      let mappedG = map(normalizedRG.y, 0, 1, -1, 1);
      let moveVel = map(avg, 0, 255, 0, 5);
      
      
      if (red > Leaf.threshold || green > Leaf.threshold){
        // stays as true once it is triggered
        this.move = true;
        //console.log("MOVE");
      }
      if (this.move){
        this.posx += mappedR * moveVel;
        this.posy += mappedG * moveVel;
        this.lifecount++;
      }
    }
  
    display(renderer, leafTexture){
      this.sizeMod = map(this.lifecount, 0, Leaf.lifespan, this.size, 0);  
      //renderer.fill(0, 0, 255, this.alpha);
      renderer.noStroke();
      renderer.texture(leafTexture);
      renderer.rect(this.posx, this.posy, this.sizeMod, this.sizeMod);
    }
  }
  
  Leaf.threshold = 100;
  Leaf.lifespan = 200;