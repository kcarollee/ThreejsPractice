import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import openSimplexNoise from "https://cdn.skypack.dev/open-simplex-noise";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  //CAMERA
  const fov = 75;
  const aspect = 2; // display aspect of the canvas
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 20);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
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

  // TEXTURE LOADER
  const texture = new THREE.TextureLoader().load("test2.jpg");

  //GEOMETRIES
  const planeGeomMain = new THREE.PlaneGeometry(20, 20, 100, 100);
  const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const posAttribute = planeGeomMain.getAttribute("position");
  const vertex = new THREE.Vector3();
  const mainPlane = new THREE.Mesh(planeGeomMain, planeMaterial);

  scene.add(mainPlane);

  // NOISE
  const noise = openSimplexNoise.makeNoise4D(Date.now());
  let noiseHeight = 4.0;
  let noiseSpread = 0.25;

  function render(time) {
    time *= 0.001;

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    //orbitControls.update();
    distortPlane(time);
  }

  function changeNoiseHeight() {
    noiseHeight =
      10 * Math.sin(document.body.getBoundingClientRect().top * 0.005);

    console.log(document.body.getBoundingClientRect().top);
  }

  function distortPlane(time) {
    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      vertex.z =
        /*
        noise(vertex.x * noiseSpread, vertex.y * noiseSpread, 0.0, time) *
        noiseHeight;
        */

        noise(vertex.x * noiseSpread, vertex.y * noiseSpread, 0.0, time);

      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    posAttribute.needsUpdate = true;
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

  document.body.onscroll = changeNoiseHeight;
  changeNoiseHeight();

  requestAnimationFrame(render);
}

main();
