import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
//import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "./THREE.MeshLine";
class CustomCurve extends THREE.Curve {
  // startPos: THREE.Vector3()
  constructor(scale = 1, startPos) {
    super();
    this.scale = scale;
    this.curPos = startPos.clone();
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    let v = computeCurl2(this.curPos.x, this.curPos.y, this.curPos.z);
    let tempVec = this.curPos.clone();
    const tx = this.curPos.x;
    const ty = this.curPos.y;
    const tz = this.curPos.z;
    //console.log(tx, ty, tz);
    // the smaller the scale coef, the closer the cluster of mesh will resemble the original function
    // 0.00001 : basically the original function
    // 0.0001 : a bit screwed version of the original function
    // 0.001 : resembles what we commonly associate as curl noise
    this.curPos.addScaledVector(v, 0.001);

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

class RectangularSpiral {
  constructor(startPos, segmentLength, spiralCount) {
    this.startPos = startPos;

    this.spiralCount = spiralCount;
    this.segmentLength = segmentLength;

    this.boxGeometryHori = new THREE.BoxGeometry(
      this.segmentLength,
      this.segmentLength,
      this.segmentLength
    );

    this.boxGeometryVert = new THREE.BoxGeometry(
      this.segmentLength,
      this.segmentLength,
      this.segmentLength
    );

    this.boxGroup = new THREE.Group();

    this.points = [];
    //console.log("HEY");
    this._plotSpiral(
      this.startPos.x,
      this.startPos.y,
      this.startPos.z,
      1,
      this.spiralCount
    );
    console.log(this.points);
    this.boxVisibleCount = 0;
    //this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

    //this.line = new THREE.Line(this.geometry, this.material);

    this.boxGroup.rotateX(Math.random() * 180);
    this.boxGroup.rotateY(Math.random() * 180);
    this.boxGroup.rotateZ(Math.random() * 180);
  }

  // iter must always be given as 1
  _plotSpiral(x, y, z, iter, count) {
    //console.log(iter, count);
    if (iter > count) {
      console.log(iter);
      return;
    }
    let lengthVal = 2 * iter - 1;
    // go down
    for (let i = 1; i <= lengthVal; i++) {
      this.points.push(new THREE.Vector3(x, y - i * this.segmentLength, z));
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[Math.floor(Math.random() * 10)]
      );
      boxMesh.position.set(x, y - i * this.segmentLength, z);
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }

    z -= this.segmentLength;

    // turn right
    for (let i = 1; i <= lengthVal; i++) {
      this.points.push(
        new THREE.Vector3(
          x + i * this.segmentLength,
          y - lengthVal * this.segmentLength,
          z
        )
      );
      let boxMesh = new THREE.Mesh(
        this.boxGeometryHori,
        RectangularSpiral.materials[Math.floor(Math.random() * 10)]
      );
      boxMesh.position.set(
        x + i * this.segmentLength,
        y - lengthVal * this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }
    z -= this.segmentLength;
    // go up
    for (let i = 1; i <= lengthVal + 1; i++) {
      this.points.push(
        new THREE.Vector3(
          x + this.segmentLength * lengthVal,
          y - lengthVal * this.segmentLength + i * this.segmentLength,
          z
        )
      );
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[Math.floor(Math.random() * 10)]
      );
      boxMesh.position.set(
        x + this.segmentLength * lengthVal,
        y - lengthVal * this.segmentLength + i * this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }
    z -= this.segmentLength;
    // go left
    for (let i = 1; i <= lengthVal + 1; i++) {
      this.points.push(
        new THREE.Vector3(
          x + lengthVal * this.segmentLength - i * this.segmentLength,
          y + this.segmentLength,
          z
        )
      );
      let boxMesh = new THREE.Mesh(
        this.boxGeometryHori,
        RectangularSpiral.materials[Math.floor(Math.random() * 10)]
      );
      boxMesh.position.set(
        x + lengthVal * this.segmentLength - i * this.segmentLength,
        y + this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }

    // new starting point

    this._plotSpiral(
      x - this.segmentLength,
      y + this.segmentLength,
      z,
      ++iter,
      count
    );
  }

  updateAnimation() {
    /*
    if (
      this.line.geometry.drawRange.count >=
      this.line.geometry.attributes.position.count
    )
      this.line.geometry.drawRange.count = 0;
    else this.line.geometry.drawRange.count++;
    */

    if (this.boxVisibleCount < this.boxGroup.children.length) {
      this.boxGroup.children[this.boxVisibleCount].visible = true;
      this.boxVisibleCount++;
    }
  }

  addToScene(scene) {
    //scene.add(this.line);
    scene.add(this.boxGroup);
    console.log(this.boxGroup);
  }
}

RectangularSpiral.materials = [
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/0.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/1.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/2.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/3.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/4.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/5.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/6.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/7.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/8.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/9.png"),
    side: THREE.DoubleSide,
  }),
];

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });
  // TEXTURE
  const texture = new THREE.TextureLoader().load("tex1.png");
  const bgTexture = new THREE.TextureLoader().load("bgTex1.png");

  const titleTex = new THREE.TextureLoader().load("titleTex.png");

  //CAMERA
  const fov = 75;
  const aspect = 2; // display aspect of the canvas
  const near = 0.1;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = bgTexture;
  //scene.background = new THREE.Color(0x000000);
  renderer.render(scene, camera);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();

  // NOISE
  noise.seed(Math.random());

  // GEOMETRY

  const curlMeshNum = 0;
  const meshArr = [];
  const curlMeshGroup = new THREE.Group();
  for (let i = 0; i < curlMeshNum; i++) {
    let x = Math.cos(i * 0.1);
    let y = Math.sin(i * 0.1);
    let z = 0;
    // scale, startPos
    let path = new CustomCurve(100, new THREE.Vector3(x, y, z));
    // curve, tubular segments, radius, radial segments, closed
    let geometry = new THREE.TubeGeometry(path, 1000, 1, 2, false);
    let material = new THREE.MeshNormalMaterial({
      //color: 0x000000,
      map: texture,
    });
    let mesh = new THREE.Mesh(geometry, material);
    meshArr.push(mesh);
    mesh.geometry.setDrawRange(0, 0);
    curlMeshGroup.add(mesh);
  }
  scene.add(curlMeshGroup);
  // TITLE CARD
  let rectGeom = new THREE.PlaneGeometry(100, 300, 3, 3);
  let rectMat = new THREE.MeshBasicMaterial({
    map: titleTex,
    side: THREE.DoubleSide,
  });
  let titleMesh = new THREE.Mesh(rectGeom, rectMat);
  titleMesh.position.set(275, 0, 0);
  scene.add(titleMesh);

  // RECTANGULAR SPIRALS
  const rectSpiralNum = 10;
  let rectSpiralArr = [];
  for (let i = 0; i < rectSpiralNum; i++) {
    const tempSpiral = new RectangularSpiral(
      new THREE.Vector3(
        randomNumber(-200, 200),
        randomNumber(-200, 200),
        randomNumber(-200, 200)
      ),
      10,
      8
    );
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
    meshArr.forEach(function (mesh) {
      //let prevDrawRange = mesh.geometry.drawRange.count;

      if (
        mesh.geometry.drawRange.count < mesh.geometry.attributes.position.count
      )
        mesh.geometry.drawRange.count += updateSpeed;
    });

    rectSpiralArr.forEach(function (spiral) {
      spiral.updateAnimation();
    });
  }

  function render(time) {
    time *= 0.001;
    updateAnimation();
    /*
    curlMeshGroup.rotateX(0.001);
    curlMeshGroup.rotateY(0.001);
    curlMeshGroup.rotateZ(0.001);
    */

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
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
