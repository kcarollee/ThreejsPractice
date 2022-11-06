import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import openSimplexNoise from "https://cdn.skypack.dev/open-simplex-noise";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  // TEXTURE LOADER
  const texture = new THREE.TextureLoader().load("test2.jpg");
  const bgTexture = new THREE.TextureLoader().load("images/bg1.jpg");

  const paperTexturesArr = [];
  const spriteMaterialsArr = [];
  const planeMaterialsArr = [];
  let currentPaperTexNum = 0;
  for (let i = 0; i < 15; i++) {
    const pTex = new THREE.TextureLoader().load("images/" + i + ".png");
    const spriteMat = new THREE.SpriteMaterial({
      map: pTex,
      transparent: true,
    });
    const planeMat = new THREE.MeshBasicMaterial({
      map: pTex,
      transparent: true,
    });
    spriteMaterialsArr.push(spriteMat);
    planeMaterialsArr.push(planeMat);
    paperTexturesArr.push(pTex);
  }

  //CAMERA
  const fov = 75;
  const aspect = 2; // display aspect of the canvas
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 20);

  const scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);
  scene.background = bgTexture;

  renderer.render(scene, camera);

  //const orbitControls = new OrbitControls(camera, renderer.domElement);
  //orbitControls.update();
  //GUI
  /*
  const gui = new dat.GUI();
  const controls = new (function () {
    this.outputObj = function () {
      scene.children.forEach((c) => console.log(c));
    };
  })();
  */
  //gui.add(controls, "outputObj");

  //GEOMETRIES

  // BOX
  const boxLineGroup = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(15, 15, 15);
  const boxGeometry2 = new THREE.BoxGeometry(16, 16, 16);
  const boxEdgesGeometry = new THREE.EdgesGeometry(boxGeometry);
  const boxEdgesGeometry2 = new THREE.EdgesGeometry(boxGeometry2);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const boxLine = new THREE.LineSegments(boxEdgesGeometry, lineMat);
  const boxLine2 = new THREE.LineSegments(boxEdgesGeometry2, lineMat);

  boxLineGroup.add(boxLine);
  boxLineGroup.add(boxLine2);

  scene.add(boxLineGroup);

  // SPRITES
  class CustomSprite {
    constructor(posX, posY, posZ, boundW, boundH, boundD, textureIndex) {
      this.posX = posX;
      this.posY = posY;
      this.posZ = posZ;
      this.boundW = boundW;
      this.boundH = boundH;
      this.boundD = boundD;
      this.material = spriteMaterialsArr[textureIndex];
      this.sprite = new THREE.Sprite(this.material);
      this.sprite.name = "sprite";
      this.sprite.position.set(this.posX, this.posY, this.posZ);
      this.moveVec = new THREE.Vector3(
        Math.random() * 0.01,
        Math.random() * 0.01,
        Math.random() * 0.01
      );
      scene.add(this.sprite);
      CustomSprite.spriteArr.push(this);
    }

    updatePos() {
      this.posX += this.moveVec.x;
      this.posY += this.moveVec.y;
      this.posZ += this.moveVec.z;

      if (this.posX < -this.boundW * 0.5 || this.posX > this.boundW * 0.5) {
        this.moveVec.x *= -1;
      }
      if (this.posY < -this.boundH * 0.5 || this.posY > this.boundH * 0.5) {
        this.moveVec.y *= -1;
      }
      if (this.posZ < -this.boundD * 0.5 || this.posZ > this.boundD * 0.5) {
        this.moveVec.z *= -1;
      }
      this.sprite.position.set(this.posX, this.posY, this.posZ);
    }
  }
  CustomSprite.spriteArr = [];

  // TRANSITION
  // startTransition
  // alphaCounter => decrease alpha of the box
  // once the alpha reaches zero, the bound values for all the sprites should be infinity
  // getting them scattered all over the screen
  // rectWidthCounter => increase the size of the 'certificate' rectangle
  let alphaCounter = 200;
  let boundGoneFlag = false;
  let rectWidthCounter = 200;
  let totalScreenHeight;
  let certFrameLineNum = 10;
  let certLineGroup = new THREE.Group();
  let certFrameMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });

  let imageInfoArrIndex = 0;
  for (let i = 0; i < certFrameLineNum; i++) {
    let w = 57 + i * 0.2;
    let h = 20 + i * 0.2;
    let boxGeom = new THREE.BoxGeometry(w, h, 0);
    let boxEdgesGeom = new THREE.EdgesGeometry(boxGeom);
    let boxLineMesh = new THREE.LineSegments(boxEdgesGeom, certFrameMat);
    console.log(w);
    certLineGroup.add(boxLineMesh);
  }
  certLineGroup.visible = false;
  certLineGroup.scale.set(0, 1, 1);
  let rectGeom = new THREE.PlaneGeometry(3, 3);
  scene.add(certLineGroup);
  let certParticlesArr = [];
  function transitionAnimation() {
    if (startTransition) {
      // start box fading out animation
      if (alphaCounter != 0) {
        lineMat.opacity = mapValue(alphaCounter, 0, 100, 0, 1);
        console.log(lineMat.opacity);
        alphaCounter--;
        //console.log(boxLineGroup);
      } else {
        // get rid of bounds
        if (!boundGoneFlag) {
          boundGoneFlag = true;
          boxLineGroup.visible = false;
          CustomSprite.spriteArr.forEach(function (sp) {
            sp.boundW = 9999;
            sp.boundH = 9999;
            sp.boundD = 9999;
          });
          certLineGroup.visible = true;
        } else {
          if (rectWidthCounter != 0) {
            // rectangular 'certificate' animation
            let scale = 1.0 - mapValue(rectWidthCounter, 0, 100, 0, 1);
            certLineGroup.scale.set(scale, 1, 1);
            rectWidthCounter--;
          } else {
            // scatter in sprites
            if (imageInfoArrIndex < imageInfoArr.length) {
              let imgInfo = imageInfoArr[imageInfoArrIndex];
              //imgInfo.y = clamp(imgInfo.y, 0, totalScreenHeight);
              let rectMatIndex = imgInfo.index;
              let rectMat = planeMaterialsArr[rectMatIndex];

              let rectMesh = new THREE.Mesh(rectGeom, rectMat);
              rectMesh.name = "rectMesh";
              certParticlesArr.push(rectMesh);
              let posx = mapValue(imgInfo.y, 0, totalScreenHeight, -20, 20);
              console.log(posx);
              let posy = mapValue(imgInfo.x, 0, window.innerWidth, -6, 6);

              rectMesh.position.set(posx, posy, 0);
              scene.add(rectMesh);
              imageInfoArrIndex++;
            }
          }
        }
      }
    }
  }

  function resetAnimation() {
    if (resetFlag) {
      ImageElement.elementArr.forEach(function (imgElem) {
        imgElem.elem.remove();
      });

      TextElement.elementArr.forEach(function (textElem) {
        textElem.elem.remove();
      });

      imageInfoArr = [];
      TextElement.elementArr = [];
      ImageElement.elementArr = [];

      flag500 = false;
      flag1000 = false;
      flag1500 = false;
      flag2000 = false;
      flag2500 = false;
      flag3000 = false;
      flag3500 = false;

      boxLineGroup.visible = true;
      lineMat.opacity = 1;
      CustomSprite.spriteArr = [];
      certLineGroup.visible = false;
      alphaCounter = 200;
      boundGoneFlag = false;
      rectWidthCounter = 200;
      totalScreenHeight;
      certFrameLineNum = 10;
      imageInfoArrIndex = 0;

      for (let i = 0; i < scene.children.length; i++) {
        if (
          scene.children[i].name == "rectMesh" ||
          scene.children[i].name == "sprite"
        ) {
          scene.remove(scene.children[i]);
        }
      }
      certParticlesArr = [];

      resetFlag = false;

      let defaultImageWidth = 25;
      let firstImagesNum = 5;
      for (let i = 0; i < firstImagesNum; i++) {
        let x = random(0, windowWidth * 0.75);
        let y = random(0, windowHeight * 0.5);
        let firstImage = new ImageElement(
          x,
          y,
          defaultImageWidth,
          int(random(0, 15)),
          x,
          y
        );
        firstImage.create();
      }
    }
  }
  // NOISE
  const noise = openSimplexNoise.makeNoise4D(Date.now());
  let noiseHeight = 4.0;
  let noiseSpread = 0.25;

  function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
  }

  function render(time) {
    let scrollValue = document.body.getBoundingClientRect().top;
    let body = document.body;
    let html = document.documentElement;

    totalScreenHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    time *= 0.001;

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    //orbitControls.update();
    //console.log(imageInfoArr);
    animate(time);
  }

  function animate(time) {
    boxLineGroup.rotation.set(time * 0.5, time * 0.5, time * 0.5);
    addSprite();
    CustomSprite.spriteArr.forEach(function (sp) {
      sp.updatePos();
    });
    transitionAnimation();
    resetAnimation();
  }

  function addSprite() {
    if (currentPaperTexNum != imageInfoArr.length) {
      let addedNum = imageInfoArr.length - currentPaperTexNum;
      let addedLatestIndex = imageInfoArr.length - 1;
      for (let i = 0; i < addedNum; i++) {
        let textureIndex = imageInfoArr[addedLatestIndex - i].index;
        let sprite = new CustomSprite(0, 0, 0, 10, 10, 10, textureIndex);
      }
      currentPaperTexNum = imageInfoArr.length;
    }
  }

  function mapValue(val, min1, max1, min2, max2) {
    return min2 + ((val - min1) * (max2 - min2)) / (max1 - min1);
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
