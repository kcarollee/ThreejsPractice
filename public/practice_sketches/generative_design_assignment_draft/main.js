import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

class CustomCurve extends THREE.Curve {
  // startPos: THREE.Vector3()
  constructor(scale = 1, startPos) {
    super();
    this.scale = scale;
    this.curPos = startPos.clone();
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    let v = computeCurl2(this.curPos.x, this.curPos.y, this.curPos.z);

    const tx = this.curPos.x;
    const ty = this.curPos.y;
    const tz = this.curPos.z;
    //console.log(tx, ty, tz);

    this.curPos.addScaledVector(v, 0.001);

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

CustomCurve.noiseScale = 1;

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  //CAMERA
  const fov = 75;
  const aspect = 2; // display aspect of the canvas
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  renderer.render(scene, camera);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();

  // NOISE
  noise.seed(Math.random());

  // TEXTURE
  const texture = new THREE.TextureLoader().load("tex1.png");

  // GEOMETRY

  const curlMeshNum = 1000;
  const meshArr = [];
  for (let i = 0; i < curlMeshNum; i++) {
    let x = randomNumber(-1.0, 1.0) * 0.25;
    let y = randomNumber(-1.0, 1.0) * 0.25;
    let z = randomNumber(-1.0, 1.0) * 0.25;
    let path = new CustomCurve(100, new THREE.Vector3(x, y, z));
    let geometry = new THREE.TubeGeometry(path, 1000, 1, 4, false);
    let material = new THREE.MeshBasicMaterial({
      //color: 0x000000,
      map: texture,
    });
    let mesh = new THREE.Mesh(geometry, material);
    meshArr.push(mesh);
    mesh.geometry.setDrawRange(0, 0);
    scene.add(mesh);
  }

  //GUI
  const gui = new dat.GUI();
  const controls = new (function () {
    this.outputObj = function () {
      scene.children.forEach((c) => console.log(c));
    };
  })();
  gui.add(controls, "outputObj");

  function updateDrawRange() {
    let updateSpeed = 50;
    meshArr.forEach(function (mesh) {
      //let prevDrawRange = mesh.geometry.drawRange.count;
      mesh.geometry.drawRange.count += updateSpeed;
    });
  }

  function render(time) {
    time *= 0.001;
    updateDrawRange();
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
