// based on https://tympanus.net/codrops/2020/01/07/playing-with-texture-projection-in-three-js/
import * as THREE from "https://cdn.skypack.dev/three@0.130.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/controls/OrbitControls.js";
import { BufferGeometryUtils } from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/utils/BufferGeometryUtils.js";
import { ImprovedNoise } from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/math/ImprovedNoise.js";
function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const perlin = new ImprovedNoise();
  let step = 0;
  //CAMERA

  const fov = 75;
  const aspect = 1; // display aspect of the canvas. set to 1 for proper projection
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const camera2 = new THREE.PerspectiveCamera(fov * 0.5, aspect, 1, 20);
  camera2.position.set(10, 10, 20);
  camera2.lookAt(0, 0, 0);
  const helper = new THREE.CameraHelper(camera2);
  const orthoWidth = 10;
  const orthoHeight = 10;
  const cameraOrtho = new THREE.OrthographicCamera(
    orthoWidth / -2,
    orthoWidth / 2,
    orthoHeight / 2,
    orthoHeight / -2,
    1,
    1000
  );
  camera.position.set(0, 0, 20);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();

  const scene = new THREE.Scene();
  scene.add(camera);
  scene.add(helper);
  scene.background = new THREE.Color(0xcccccc);
  renderer.render(scene, camera);
  //PROJECTED MATERIAL
  class ProjectedMaterial extends THREE.ShaderMaterial {
    constructor(camera, texture, color = 0xffffff) {
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      camera.updateWorldMatrix();

      const viewMatrixCamera = camera.matrixWorldInverse.clone();
      const projectionMatrixCamera = camera.projectionMatrix.clone();
      const modelMatrixCamera = camera.matrixWorld.clone();

      const projPosition = camera.position.clone();

      super({
        uniforms: {
          color: { value: new THREE.Color(color) },
          tex: { value: texture },
          viewMatrixCamera: {
            type: "m4v",
            value: [viewMatrixCamera, viewMatrixCamera],
          },
          projectionMatrixCamera: {
            type: "m4v",
            value: [projectionMatrixCamera, projectionMatrixCamera],
          },
          modelMatrixCamera: {
            type: "m4v",
            value: [modelMatrixCamera, modelMatrixCamera],
          },
          savedModelMatrix: { type: "mat4", value: new THREE.Matrix4() },
          projPosition: { type: "v3", value: projPosition },
          time: { value: step },
        },

        vertexShader: `
					uniform mat4 savedModelMatrix;
          			uniform mat4 viewMatrixCamera[2];
          			uniform mat4 projectionMatrixCamera[2];
          			uniform mat4 modelMatrixCamera[2];

          			varying vec4 vWorldPosition;
          			varying vec3 vNormal;
          			varying vec4 vTexCoords[2];
          			varying float dist;

          			void main(){
          				vNormal = mat3(savedModelMatrix) * normal;
            			vWorldPosition = savedModelMatrix * vec4(position, 1.0);
            			vTexCoords[0] = projectionMatrixCamera[0] * viewMatrixCamera[0] * vWorldPosition;
            			vTexCoords[1] = vec4(.0);
            			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          			}
				`,
        fragmentShader: `
					uniform vec3 color;
        			uniform sampler2D tex;
        			uniform vec3 projPosition;
        			uniform float time;

        			varying vec3 vNormal;
        			varying vec4 vWorldPosition;
        			varying vec4 vTexCoords[2];

        			float map(float value, float min1, float max1, float min2, float max2) {
 					 return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
					}
        			float rand(float n){return fract(sin(n) * 43758.5453123);}
        			float rand(vec2 n) { 
						return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
					}
					float noise(float p){
						float fl = floor(p);
					  float fc = fract(p);
						return mix(rand(fl), rand(fl + 1.0), fc);
					}
	
					float noise(vec2 n) {
						const vec2 d = vec2(0.0, 1.0);
					  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
						return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
					}

        			void main(){
        				float gap = 2.0;
        				vec2 uv = ((vTexCoords[0].xy) / vTexCoords[0].w) * 0.5 + 0.5;

        				//vec2 uvMod = ((vTexCoords[0].xy  * (gap + (gap - 1.0)  * sin(time * 0.01))) / vTexCoords[0].w) * 0.5 + 0.5;
        				//vec2 uvMod = ((vec2(vTexCoords[0].x, vTexCoords[0].y + gap  * sin(time * 0.01))) / vTexCoords[0].w) * 0.5 + 0.5;
        				float n = map(noise(vTexCoords[0].xy * 0.5 + time * 0.01), .0, 1.0, .0, 1.0);
        				vec2 uvMod = ((vTexCoords[0].xy + 10.0 * n) / vTexCoords[0].w) * 0.5 + 0.5;
        				
        				
        				uvMod = mix(uv, uvMod, 0.5 + 0.5 * sin(time * 0.01));
        				uvMod = uv;
        				vec3 outCol = vec3(.0);
          				vec4 texMod = texture2D(tex, uvMod);
          				vec4 texOrig = texture2D(tex, uv);

          				vec3 texModCol = texMod.rgb;
          				texModCol.r = sin(texModCol.r * 10.0);
          				outCol.rgb += texModCol;
          				
          				outCol.rgb += texOrig.rgb * 0.5;

          				outCol += color;

          				if (uv.x > 1.0 || uv.x < .0 || uv.y > 1.0 || uv.y < .0) outCol = vec3(.0);
        				
          				// this makes sure we don't render also the back of the object
          				vec3 projectorDirection = normalize(projPosition - vWorldPosition.xyz);
          				float dotProduct = dot(vNormal, projectorDirection);
          				if (dotProduct < 0.0) {
            				outCol = color;
          				}

          				vec2 uvd = abs(uv - uvMod);
          				float th = 0.001;
          				//if (uvd.x < th && uvd.y < th) outCol =color;

          				gl_FragColor = vec4(outCol, 1.0);
        			}

				`,
      });

      //this.isProjectedMaterial = true;
    }

    updateCameraMatirxUniforms(camera) {
      this.uniforms.viewMatrixCamera.value = camera.matrixWorldInverse.clone();
      this.uniforms.projectionMatrixCamera.value =
        camera.projectionMatrix.clone();
      this.uniforms.modelMatrixCamera.value = camera.matrixWorld.clone();
      this.uniforms.projPosition.value = camera.position.clone();
    }
  }

  //TEXTURES
  const textureLoader = new THREE.TextureLoader();
  const tex = textureLoader.load("test.jpg");
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  const video = document.getElementById("video");
  video.play();

  video.addEventListener("play", function () {
    this.currentTime = 3;
  });
  const texVid = new THREE.VideoTexture(video);

  const renderTarget = new THREE.WebGLRenderTarget(
    window.innderWidth,
    window.innerHeight
  );
  //renderTarget.texture.wrapS = THREE.RepeatWrapping;
  //renderTarget.texture.wrapT = THREE.RepeatWrapping;

  scene.background = new THREE.Color(0x000000);
  //GEOMETRIES

  const boxNum = 4000;
  const boxArr = [];
  for (let i = 0; i < boxNum; i++) {
    let randomDim = Math.random(0, 2);
    let boxGeom = new THREE.BoxGeometry(randomDim, randomDim, randomDim);
    let x = Math.sin(i) * 10.0;
    let y = Math.cos(i) * 10.0;
    let z = perlin.noise(x * 2.0, y * 2.0, 0);
    boxGeom.translate(x, y, z);
    boxGeom.rotateX(Math.random());
    boxGeom.rotateY(Math.random());
    boxGeom.rotateZ(Math.random());
    boxArr.push(boxGeom);
  }
  const boxGeometries = BufferGeometryUtils.mergeBufferGeometries(boxArr);
  const modelMat = new THREE.MeshLambertMaterial({ color: 0xfcfcfa });

  const projectedMat = new ProjectedMaterial(
    camera2,
    tex,
    new THREE.Color(0x000000)
  );

  const modelMesh = new THREE.Mesh(boxGeometries, projectedMat);

  scene.add(modelMesh);

  const planeGeom = new THREE.PlaneGeometry(30, 30, 1, 1);
  const projectedMat2 = new ProjectedMaterial(
    camera2,
    tex,
    new THREE.Color(0x111111)
  );
  // translations must be done to the geometry, and not the mesh.
  planeGeom.rotateX(-Math.PI * 0.4);
  planeGeom.translate(0, -5, 0);

  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const planeMesh = new THREE.Mesh(planeGeom, projectedMat2);

  scene.add(planeMesh);

  //LIGHTS
  const pointLight = new THREE.PointLight();
  const pointLight2 = new THREE.PointLight();
  pointLight.position.set(0, 0, 10);
  pointLight2.position.set(0, 0, -30);
  scene.add(pointLight);
  scene.add(pointLight2);
  //GUI
  const gui = new dat.GUI();

  const controls = new (function () {
    this.outputObj = function () {
      scene.children.forEach((c) => console.log(c));
    };

    this.enableProjection = false;
  })();
  gui.add(controls, "outputObj");
  gui.add(controls, "enableProjection", false);

  console.log(orbitControls);
  function render(time) {
    projectedMat.uniforms.time.value = step;
    projectedMat2.uniforms.time.value = step;
    texVid.update();
    time *= 0.001;
    step++;

    //camera.position.set(20 * Math.sin(step * 0.01), 2, 20 * Math.cos(step * 0.01));
    //camera.lookAt(0, 0, 0);
    camera2.position.set(
      10 * Math.sin(step * 0.01),
      10 * Math.cos(step * 0.01),
      20
    );
    camera2.lookAt(0, 0, 0);
    orbitControls.update();
    projectedMat.updateCameraMatirxUniforms(camera2);
    projectedMat2.updateCameraMatirxUniforms(camera2);

    if (controls.enableProjection) {
      planeMesh.material = planeMat;
      modelMesh.material = modelMat;
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, camera);

      planeMesh.material = projectedMat2;

      modelMesh.material = projectedMat;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
    } else {
      planeMesh.material = planeMat;
      modelMesh.material = modelMat;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
    }

    if (resizeRenderToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    //renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function resizeRenderToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
    const height = (canvas.clientHeight * pixelRatio) | 0; // 0
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      renderTarget.setSize(width, height);
    }
    return needResize;
  }
  requestAnimationFrame(render);
}

window.onload = main;
