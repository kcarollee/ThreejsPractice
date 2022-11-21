import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
//import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "./THREE.MeshLine";

function main() {
  let p5Texture, p5Canvas;
  let p5CanvasLoadedFlag = false;
  let p5LoopStarted = false;
  const canvas = document.querySelector("#c");
  // P5 SKETCH

  const p5Sketch = (sketch) => {
    let bgTex;
    let backbuffer;
    let pg1;
    let shd;
    sketch.setup = () => {
      sketch.createCanvas(800, 800, sketch.WEBGL);

      bgTex = sketch.loadImage("bgTex2Inverted.png", sketch.getImage);
      shd = sketch.loadShader(
        "assets/shaders/shader.vert",
        "assets/shaders/shader.frag",
        sketch.getShader
      );

      bgTex.resize(sketch.width, sketch.height);
      backbuffer = sketch.createGraphics(
        sketch.width,
        sketch.height,
        sketch.WEBGL
      );
      pg1 = sketch.createGraphics(sketch.width, sketch.height, sketch.WEBGL);
    };

    sketch.draw = () => {
      try {
        p5LoopStarted = true;

        pg1.shader(shd);
        shd.setUniform("resolution", [sketch.width, sketch.height]);
        shd.setUniform("backbuffer", backbuffer);
        shd.setUniform("time", sketch.frameCount * 0.01);
        shd.setUniform("startTex", bgTex);
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
  };
  p5Canvas = new p5(p5Sketch);
  console.log(p5Canvas.canvas);

  try {
    p5Canvas.canvas.style.display = "none";
  } catch {}
  //p5Canvas.canvas.style.display = "none";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserverDrawingBuffer: true,
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
  const texture = new THREE.TextureLoader().load("tex1.png");
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

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();

  // NOISE
  noise.seed(Math.random());

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
  const rectSpiralNum = 5;
  let segmentLength = 10;
  let rectSpiralArr = [];
  let allBoxesLoaded = false;
  let allTrailPointsLoaded = false;
  let animationStartIndex = 0;
  let densityCoef = randomNumber(0.001, 0.01);
  for (let i = 0; i < rectSpiralNum; i++) {
    let startAnimation;
    i == 0 ? (startAnimation = true) : (startAnimation = false);
    const tempSpiral = new RectangularSpiral(
      new THREE.Vector3(0, 0, -rectSpiralNum * segmentLength + i * 20),
      segmentLength,
      5,
      1000,
      densityCoef,
      startAnimation
    );

    tempSpiral.setRotation(
      randomNumber(0, Math.PI * 2),
      randomNumber(0, Math.PI * 2),
      randomNumber(0, Math.PI * 2)
    );

    tempSpiral.setPosition(
      randomNumber(-100, 100),
      randomNumber(-100, 100),
      randomNumber(-100, 100)
    );

    //tempSpiral.setPosition(0, 0, -i * segmentLength);

    tempSpiral.addToScene(scene);
    rectSpiralArr.push(tempSpiral);
  }

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
      //console.log("HEY");
    }

    time *= 0.001;

    updateAnimation();

    // think about easing camera movement at one point
    //camera.position.set(500 * Math.cos(time), 0, 500 * Math.sin(time));
    //camera.lookAt(0, 0, 0);

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
    return Math.random() * (max - min) + min;
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
