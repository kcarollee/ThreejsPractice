let video;
let videoResized = false;
let indicesNeedingWarp = [];
let auxPixelArr = [];
let indicesToWarp = [];

let chooseIndicesToWarp = false;
function setup() {
  createCanvas(400, 400);
  video = createVideo('test1.mp4');
 
  video.loop();
}

function draw() {
  background(220);
  
  // resize video when video is loaded
  if (video.width != 300 && !videoResized) {
    resizeCanvas(video.width, video.height);
    
    // set flag to true
    videoResized = true;
    
    // initialize indicesNeedingWarp
    let pixelNum = video.width * video.height;
    for (let i = 0; i < pixelNum; i++){
      indicesNeedingWarp.push(0);
      auxPixelArr.push(0, 0, 0, 0);
    }
  }


  video.loadPixels();

  if (chooseIndicesToWarp) fillIndicesToWarp();
  //if (frameCount % 100 == 0) fillIndicesToWarp();
  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      const index = y * width + x;
      const offset = 4 * index;
      //video.pixels[offset] = 155;

      // if the pixel at the current index needs warping
      if (indicesNeedingWarp[index] == 1){
        // upon first random selection of the pixel, 
        // copy current frame's color values to auxPixelArr
        // use the alpha channel to determine whether this pixel has been analyzed
        if (chooseIndicesToWarp && auxPixelArr[offset + 3] == 0){
          auxPixelArr[offset] = video.pixels[offset];
          auxPixelArr[offset + 1] = video.pixels[offset + 1];
          auxPixelArr[offset + 2] = video.pixels[offset + 2];
          auxPixelArr[offset + 3] = video.pixels[offset + 3];

        }

        // else use auxPixelArr's color values as video pixels.
        else {
          video.pixels[offset] = auxPixelArr[offset];
          video.pixels[offset + 1] = auxPixelArr[offset + 1];
          video.pixels[offset + 2] = auxPixelArr[offset + 2];
          video.pixels[offset + 3] = auxPixelArr[offset + 3];
        }
      }
    }
  }

  // falsify flag
  chooseIndicesToWarp = false;
 
  video.updatePixels();

  warpAuxPixelArr();
  image(video, 0, 0);
}

function fillIndicesToWarp(){
  indicesToWarp = [];

  /*
  let indicesToWarpNum = 10000;
  for (let i = 0; i < indicesToWarpNum; i++){
    indicesToWarp.push(Math.floor(Math.random() * video.width * video.height));
  }
  */

  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      const index = y * width + x;
      const offset = 4 * index;
      if (Math.abs(y - mouseY) < 4 ) indicesToWarp.push(index);
    }
  }



  indicesToWarp.forEach(function(index){
    indicesNeedingWarp[index] = 1;
  });
  //chooseIndicesToWarp = false;
}

function mouseDragged(){
  chooseIndicesToWarp = true;
}

function mouseReleased(){

}

function warpAuxPixelArr(){
  indicesToWarp.forEach(function(index, i){
    let offset = 4 * index;
    auxPixelArr[offset] += 100 * Math.sin(frameCount + i);
    auxPixelArr[offset + 1] += 80 * Math.cos(frameCount + i);
    auxPixelArr[offset + 2] -= 200 * Math.cos(frameCount + i * 2);
  }); 
}

