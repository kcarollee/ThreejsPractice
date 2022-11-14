import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
//import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "./THREE.MeshLine";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const scene = new THREE.Scene();
  /*
  const rendererWidth = window.innerWidth;
  const rendererHeight = window.innerHeight;
  */

  const rendererWidth = 800;
  const rendererHeight = 800;

  renderer.setSize(rendererWidth, rendererHeight);
  // TEXTURE
  const texture = new THREE.TextureLoader().load("tex1.png");
  const bgTexture = new THREE.TextureLoader().load("bgTex2.png");

  const titleTex = new THREE.TextureLoader().load("titleTex.png");

  // BACKGROUND PLANE
  const bgScene = new THREE.Scene();
  let uniforms = {
    tex: { value: bgTexture },
    resolution: { value: new THREE.Vector2(1000, 1000) },
    time: { value: 0 },
  };
  let planeGeom = new THREE.PlaneGeometry(1.55, 1.55);
  //let planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  let planeMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vert").textContent,
    fragmentShader: document.getElementById("frag").textContent,
  });

  let backgroundPlaneMesh = new THREE.Mesh(planeGeom, planeMaterial);
  bgScene.add(backgroundPlaneMesh);

  // BACKGROUND TEXTURE
  const bgRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
  );

  const bgRenderCamera = new THREE.PerspectiveCamera(
    75,
    rendererWidth / rendererHeight,
    0.1,
    100
  );
  bgRenderCamera.position.set(0, 0, 1);

  scene.background = bgRenderTarget.texture;
  console.log(scene.background);

  function renderRenderTargetScene() {
    renderer.setRenderTarget(bgRenderTarget);
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
  // startPosArr[i]: {THREE.Vector3(), boxMesh}
  /*
  function generateCurlMeshGroup(startPosArr) {
    let curlMeshGroup = new THREE.Group();
    let curlMeshNum = startPosArr.length;
    let colorVal = randomNumber(0, 0.5);
    //console.log(colorVal);
    let curlMeshMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(colorVal, colorVal, colorVal),
      side: THREE.DoubleSide,
      //map: texture,
    });
    for (let i = 0; i < curlMeshNum; i++) {
      let startingPoint = startPosArr[i].point;
      let boxMeshOnPoint = startPosArr[i].boxMesh;
      let x = startingPoint.x;
      let y = startingPoint.y;
      let z = startingPoint.z;

      // scale, startPos

      //let path = generateCurlPoints(new THREE.Vector3(x, y, z), 1000);
      let path = boxMeshOnPoint.trailPoints;
      // curve, tubular segments, radius, radial segments, closed
      //boxMeshOnPoint.curlPath = path;
      boxMeshOnPoint.curlPositionIndex = 0;
      //console.log(boxMeshOnPoint);
      let geometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(path),
        1000,
        1,
        3,
        false
      );

      let mesh = new THREE.Mesh(geometry, curlMeshMaterial);
      //mesh.position.set(x, y, z);
      curlMeshArr.push(mesh);
      mesh.geometry.setDrawRange(0, 0);
      curlMeshGroup.add(mesh);
    }
    scene.add(curlMeshGroup);
  }
  */

  //generateCurlMeshGroup([new THREE.Vector3(0, 0, 0)]);

  // TITLE CARD
  /*
  let rectGeom = new THREE.PlaneGeometry(100, 300, 3, 3);
  let rectMat = new THREE.MeshBasicMaterial({
    map: titleTex,
    side: THREE.DoubleSide,
  });
  let titleMesh = new THREE.Mesh(rectGeom, rectMat);
  titleMesh.position.set(275, 0, 0);
  scene.add(titleMesh);
  */
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

  //GUI
  const gui = new dat.GUI();
  const controls = new (function () {
    this.outputObj = function () {
      scene.children.forEach((c) => console.log(c));
    };
  })();
  gui.add(controls, "outputObj");

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function updateAnimation() {
    let updateSpeed = 50;
    light.position.copy(camera.position);
    /*
    curlMeshArr.forEach(function (mesh) {
      //let prevDrawRange = mesh.geometry.drawRange.count;

      if (
        mesh.geometry.drawRange.count < mesh.geometry.attributes.position.count
      )
        mesh.geometry.drawRange.count += updateSpeed;
    });
    */

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

  function updateRaycaster() {
    raycaster.setFromCamera(pointer, camera);
    let spiralArr = [];

    for (let i = 0; i < scene.children.length; i++) {
      if (scene.children[i].name == "boxgroup")
        spiralArr.push(scene.children[i]);
    }

    let intersects = raycaster.intersectObjects(spiralArr, true);
    if (intersects.length > 0) pointerIsInside = true;
    else pointerIsInside = false;
    //console.log(pointerIsInside, mouseClicked);
    if (allBoxesLoaded) {
      for (let i = 0; i < intersects.length; i++) {
        let spiralIndex = intersects[i].object.parent.index;
        let spiral = RectangularSpiral.spiralArr[spiralIndex];
        spiral.shiftTextures();
        // ON CLICKING A SPIRAL
        if (mouseClicked && pointerIsInside) {
          //console.log(spiral.getAllVertices());
          //generateCurlMeshGroup(spiral.getAllVertices());
          //spiral.triggerBoxMovement = true;
          //mouseClicked = false;
        }
        //break;
      }
    }
  }

  function render(time) {
    renderer.setRenderTarget(bgRenderTarget);
    renderer.clear();
    renderer.render(bgScene, bgRenderCamera);

    time *= 0.001;
    uniforms.time.value = time;
    //updateRaycaster();
    updateAnimation();

    camera.position.set(500 * Math.cos(time), 0, 500 * Math.sin(time));
    camera.lookAt(0, 0, 0);

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
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
