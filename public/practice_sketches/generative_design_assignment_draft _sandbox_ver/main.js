async function main() {
  let p5Texture, p5Canvas;
  let p5CanvasLoadedFlag = false;
  let p5LoopStarted = false;
  const canvas = document.querySelector("#dwklCanvas");
  // P5 SKETCH

  let nRed, nGreen, nBlue;
  let nAmp, nPeriod;
  let nBBCoef, nOffset;

  let testTexture;

  let fxStart = false;

  const p5Sketch = (sketch) => {
    let bgTex;
    let backbuffer;
    let pg1, pgImg;
    let font;
    let shd;
    let numImgs = [];
    let posArr = [];
    let gap;

    let bgRefreshPeriod;
    sketch.setup = async () => {
      await sketch.createCanvas(800, 800, sketch.WEBGL);

      bgTex = await sketch.loadImage(
        "assets/images/bgTex3Inverted.png",
        sketch.getImage
      );

      shd = await sketch.loadShader(
        "assets/shaders/shader.vert",
        "assets/shaders/shader.frag",
        sketch.getShader
      );

      font = await sketch.loadFont(
        "assets/fonts/typewriter_font.ttf",
        sketch.getFont
      );

      for (let i = 0; i < 10; i++) {
        let img = await sketch.loadImage(
          "assets/images/" + i + "_inverted.png",
          sketch.getImage
        );
        numImgs.push(img);
      }

      bgTex.resize(sketch.width, sketch.height);
      backbuffer = await sketch.createGraphics(
        sketch.width,
        sketch.height,
        sketch.WEBGL
      );

      pgImg = await sketch.createGraphics(sketch.width, sketch.height);
      pgImg.textFont(font);
      pgImg.textSize(20);
      pgImg.textAlign(sketch.CENTER);
      pg1 = await sketch.createGraphics(
        sketch.width,
        sketch.height,
        sketch.WEBGL
      );

      nRed = fxrand();
      nGreen = fxrand();
      nBlue = fxrand();
      nAmp = fxrand() * 5;
      nPeriod = fxrand() * 20;
      nOffset = fxrand() * 10;
      nBBCoef = 0.7 + fxrand() * 0.25;
      gap = randomNumber(0.15, 0.25);

      bgRefreshPeriod = Math.floor(randomNumber(1, 10));
    };

    sketch.draw = () => {
      try {
        p5LoopStarted = true;

        pgImg.image(bgTex, 0, 0);

        // bg version 1
        if (sketch.frameCount % bgRefreshPeriod == 0) {
          for (let i = 0; i < 10; i++) {
            pgImg.image(
              numImgs[i],
              sketch.width * randomNumber(gap * 0.7, 1.0 - gap),
              sketch.height * randomNumber(gap * 0.7, 1.0 - gap)
            );
          }
        }

        pgImg.fill(255);

        // show hash string on the bottom of the screen
        if (sketch.frameCount % 10 == 0) {
          fxhashTrunc += fxhashTrunc[0];
          fxhashTrunc = fxhashTrunc.substring(1);
        }
        pgImg.text(fxhashTrunc, sketch.width * 0.5, sketch.height * 0.9);
        // bg version 2

        pg1.shader(shd);
        shd.setUniform("resolution", [sketch.width, sketch.height]);
        shd.setUniform("backbuffer", backbuffer);
        shd.setUniform("time", sketch.frameCount * 0.002);
        shd.setUniform("startTex", pgImg);
        shd.setUniform("nRed", nRed);
        shd.setUniform("nGreen", nGreen);
        shd.setUniform("nBlue", nBlue);
        shd.setUniform("nAmp", nAmp);
        shd.setUniform("nPeriod", nPeriod);
        shd.setUniform("nBBCoef", nBBCoef);
        shd.setUniform("nOffset", nOffset);

        pg1.rect(0, 0, sketch.width, sketch.height);
        pg1.resetMatrix();
        pg1._renderer._update();

        backbuffer.rotateX(Math.PI);
        backbuffer.image(pg1, -sketch.width * 0.5, -sketch.height * 0.5);

        backbuffer.resetMatrix();
        backbuffer._renderer._update();

        sketch.image(backbuffer, -sketch.width * 0.5, -sketch.height * 0.5);

        //sketch.background(200 + 50 * Math.sin(sketch.frameCount * 0.1), 0, 0);
      } catch {}
      if (p5Texture && p5LoopStarted) {
        //console.log("HEY");
        //console.log(p5Texture);

        p5Texture.needsUpdate = true;
      }
    };

    sketch.getShader = (s) => {
      sketch.shader(s);
    };
    sketch.getImage = (i) => {
      sketch.image(i, 0, 0);
    };

    sketch.getFont = (f) => {
      sketch.text(f, 0, 0);
    };
  };
  p5Canvas = await new p5(p5Sketch);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  /*
  const rendererWidth = window.innerWidth;
  const rendererHeight = window.innerHeight;
  */

  const rendererWidth = 800;
  const rendererHeight = 800;

  // TRY USING TWO RENDERTARGETS WITH THE FIRST ONE HAVING A CUSTOM SHADER PASS AND THE SECONDS ONE BEING THE BACKBUFFER
  const bgRenderTarget = new THREE.WebGLRenderTarget(
    rendererWidth,
    rendererHeight
  );

  const backbufferRenderTarget = new THREE.WebGLRenderTarget(
    rendererWidth,
    rendererHeight
  );

  renderer.setSize(rendererWidth, rendererHeight);
  // TEXTURE

  const bgTexture = new THREE.TextureLoader().load("bgTex2Inverted.png");

  const titleTex = new THREE.TextureLoader().load("titleTex.png");

  function renderRenderTargetScene() {
    renderer.setRenderTarget(bgRenderTargetPing);
    renderer.clear();
    renderer.render(bgScene, bgRenderCamera);
  }
  //CAMERA
  const fov = 75;
  const aspect = rendererWidth / rendererHeight; // display aspect of the canvas
  const near = 0.1;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);

  //scene.background = bgTexture;
  //scene.background = new THREE.Color(0x000000);
  const scene = new THREE.Scene();
  //scene.background = p5Texture;
  renderer.render(scene, camera);

  // NOISE
  noise.seed(fxrand());

  // RAYCASTER
  let raycaster = new THREE.Raycaster();
  let pointer = new THREE.Vector2();
  let mouseClicked = false;
  let pointerIsInside = false;
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("click", onPointerClick);

  // LIGHTS
  let light = new THREE.PointLight(0xffffff, 10, 1000);
  light.position.copy(camera.position);

  let light2 = new THREE.PointLight(0xffffff, 10, 1000);
  light.position.set(0, 0, -200);
  scene.add(light);

  // RECTANGULAR SPIRALS
  const rectSpiralNum = 7;

  const MODE = Math.floor(fxrand() * 3);
  /*
    MODE
    0: random pyramids
    1: cube
  */
  let segmentLength = Math.floor(randomNumber(10, 16));
  let rectSpiralArr = [];
  let allBoxesLoaded = false;
  let allTrailPointsLoaded = false;
  let animationStartIndex = 0;
  let densityCoef = randomNumber(0.002, 0.01);
  let baseColor = new THREE.Color(
    randomNumber(0, 1.0),
    randomNumber(0, 1.0),
    randomNumber(0, 1.0)
  );

  for (let i = 0; i < rectSpiralNum; i++) {
    let startAnimation;
    i == 0 ? (startAnimation = true) : (startAnimation = false);
    let tempSpiral;
    if (MODE == 0) {
      let spiralCount = Math.floor(randomNumber(7, 11));
      tempSpiral = new RectangularSpiral(
        new THREE.Vector3(0, 0, 0),
        segmentLength,
        spiralCount,
        1000,
        densityCoef,
        startAnimation,
        baseColor,
        MODE,
        10,
        10,
        10,
        testTexture
      );

      if (fxrand() < 0.5) {
        tempSpiral.setRotation(-Math.PI * 0.5, 0, 0);
        tempSpiral.setPosition(0, segmentLength * spiralCount * 1.75, 0);
      } else {
        tempSpiral.setRotation(Math.PI * 0.5, 0, 0);
        tempSpiral.setPosition(0, -segmentLength * spiralCount * 1.75, 0);
      }
      tempSpiral.addToScene(scene);
      rectSpiralArr.push(tempSpiral);
      break;
    } else if (MODE == 1) {
      let sideCubeNum = Math.floor(randomNumber(10, 15));
      tempSpiral = new RectangularSpiral(
        new THREE.Vector3(0, 0, 0),
        segmentLength,
        6,
        1000,
        densityCoef,
        startAnimation,
        baseColor,
        MODE,
        sideCubeNum,
        sideCubeNum,
        sideCubeNum,
        testTexture
      );
      tempSpiral.setRotation(
        randomNumber(0, Math.PI * 2),
        randomNumber(0, Math.PI * 2),
        randomNumber(0, Math.PI * 2)
      );
      tempSpiral.addToScene(scene);
      rectSpiralArr.push(tempSpiral);
      break;
    } else if (MODE == 2) {
      tempSpiral = new RectangularSpiral(
        new THREE.Vector3(0, 0, 0),
        segmentLength,
        6,
        1000,
        densityCoef,
        startAnimation,
        baseColor,
        MODE,
        10,
        10,
        10,
        testTexture
      );
      tempSpiral.setRotation(
        randomNumber(0, Math.PI * 2),
        randomNumber(0, Math.PI * 2),
        randomNumber(0, Math.PI * 2)
      );
      tempSpiral.addToScene(scene);
      rectSpiralArr.push(tempSpiral);
      break;
    }
  }

  //console.log(fxhashTrunc);

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function updateAnimation() {
    let updateSpeed = 50;
    light.position.copy(camera.position);

    // manage start of animation
    if (animationStartIndex < rectSpiralArr.length - 1) {
      if (rectSpiralArr[animationStartIndex].boxesFullyLoaded) {
        rectSpiralArr[animationStartIndex + 1].animationStartFlag = true;
        animationStartIndex++;
      }
    }

    let boxLoadFlag = true;
    let trailLoadFlag = true;
    let s = scene;
    rectSpiralArr.forEach(function (spiral) {
      spiral.updateAnimation(s);
      boxLoadFlag &= spiral.boxesFullyLoaded;
      trailLoadFlag &= spiral.trailLoadFlag;
    });
    allBoxesLoaded = boxLoadFlag;
    allTrailPointsLoaded = trailLoadFlag;
    if (allBoxesLoaded && !fxStart) {
      fxpreview();
      fxStart = true;
    }
  }

  function render(time) {
    if (p5Canvas.canvas != undefined && !p5CanvasLoadedFlag) {
      p5Canvas.canvas.style.display = "none";
      p5Texture = new THREE.CanvasTexture(p5Canvas.canvas);
      p5Texture.needsUpdate = true;
      p5Texture.wrapS = THREE.RepeatWrapping;
      p5Texture.wrapT = THREE.RepeatWrapping;
      p5CanvasLoadedFlag = true;

      scene.background = p5Texture;
      testTexture = new THREE.CanvasTexture(p5Canvas.canvas);
      rectSpiralArr.forEach(function (rectSpiral) {
        rectSpiral.envMap = testTexture;
      });
      //console.log("HEY");
    }

    time *= 0.001;

    updateAnimation();

    // think about easing camera movement at one point
    camera.rotateY(0.01);
    camera.position.set(500 * Math.cos(time), 0, 500 * Math.sin(time));
    camera.lookAt(0, 0, 0);

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
    //console.log(p5LoopStarted);

    //if (p5LoopStarted) scene.background = p5Texture;
    //p5Texture.needsUpdate = true;
    //console.log(p5Texture.image);
    //p5Texture.dispose();
  }

  function randomNumber(min, max) {
    return fxrand() * (max - min) + min;
  }

  function mapValue(value, min1, max1, min2, max2) {
    return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onPointerClick(event) {
    if (pointerIsInside) {
      mouseClicked = true;
    }
    //mouseClicked = true;
  }

  function resizeRenderToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
    const height = (canvas.clientHeight * pixelRatio) | 0; // 0
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  requestAnimationFrame(render);
}

main();
