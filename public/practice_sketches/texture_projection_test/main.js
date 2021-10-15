// based on https://tympanus.net/codrops/2020/01/07/playing-with-texture-projection-in-three-js/
import * as THREE from "https://cdn.skypack.dev/three@0.130.0/build/three.module.js";
import {OrbitControls} from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/controls/OrbitControls.js";
import {BufferGeometryUtils} from 'https://cdn.skypack.dev/three@0.130.0/examples/jsm/utils/BufferGeometryUtils.js';
import {ImprovedNoise} from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/math/ImprovedNoise.js";
function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});
	const perlin = new ImprovedNoise();
	let step = 0;
//CAMERA

	const fov = 75;
	const aspect = 1; // display aspect of the canvas. set to 1 for proper projection
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const orthoWidth = 10;
	const orthoHeight = 10;
	const cameraOrtho = new THREE.OrthographicCamera(
		orthoWidth / - 2, orthoWidth / 2, 
		orthoHeight / 2, orthoHeight / - 2, 
		1, 1000 
	);
	camera.position.set(0, 0, 20);



	const orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.update();
	
	

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);
//PROJECTED MATERIAL
	class ProjectedMaterial extends THREE.ShaderMaterial{
		constructor(camera, texture, color = 0xffffff){
			
			camera.updateProjectionMatrix();
			camera.updateMatrixWorld();
			camera.updateWorldMatrix();

			const viewMatrixCamera = camera.matrixWorldInverse.clone();
			const projectionMatrixCamera = camera.projectionMatrix.clone();
			const modelMatrixCamera = camera.matrixWorld.clone();

			const projPosition = camera.position.clone();



			super({
				uniforms:{
					color: {value: new THREE.Color(color)},
					tex: {value: texture},
					viewMatrixCamera: {type: 'm4', value: viewMatrixCamera},
					projectionMatrixCamera: {type: 'm4', value: projectionMatrixCamera},
					modelMatrixCamera: {type: 'mat4', value: modelMatrixCamera},
					savedModelMatrix: {type: 'mat4', value: new THREE.Matrix4()},
					projPosition: {type: 'v3', value: projPosition},
					time: {value: step}
				},

				vertexShader: `
					uniform mat4 savedModelMatrix;
          			uniform mat4 viewMatrixCamera;
          			uniform mat4 projectionMatrixCamera;
          			uniform mat4 modelMatrixCamera;

          			varying vec4 vWorldPosition;
          			varying vec3 vNormal;
          			varying vec4 vTexCoords;

          			void main(){
          				vNormal = mat3(savedModelMatrix) * normal;
            			vWorldPosition = savedModelMatrix * vec4(position, 1.0);
            			vTexCoords = projectionMatrixCamera * viewMatrixCamera * vWorldPosition;
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
        			varying vec4 vTexCoords;

        			void main(){
        				float gap = 5.0;
        				vec2 uv = ((vTexCoords.xy) / vTexCoords.w) * 0.5 + 0.5;
        				vec2 uvMod = ((vTexCoords.xy + gap + gap * sin(time * 0.01)) / vTexCoords.w) * 0.5 + 0.5;
        				//uv = uvMod;
          				vec4 outColor = texture2D(tex, uv);

          				// this makes sure we don't render also the back of the object
          				vec3 projectorDirection = normalize(projPosition - vWorldPosition.xyz);
          				float dotProduct = dot(vNormal, projectorDirection);
          				if (dotProduct < 0.0) {
            				outColor = vec4(color, 1.0);
          				}

          				gl_FragColor = outColor;
        			}
				`
			});

			//this.isProjectedMaterial = true;
		}
	}

//TEXTURES
	const textureLoader = new THREE.TextureLoader();
	const tex = textureLoader.load('test.jpg');

	const renderTarget = new THREE.WebGLRenderTarget(window.innderWidth, window.innerHeight);
	renderTarget.wrapS = THREE.RepeatWrapping;
	renderTarget.wrapT = THREE.RepeatWrapping;
//GEOMETRIES
	
	
	const boxNum = 2000;
	const boxArr = [];
	for (let i = 0; i < boxNum; i++){
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
	const modelMat = new THREE.MeshLambertMaterial({color: 0xFCFCFA});
	
	const projectedMat = new ProjectedMaterial(camera, tex);

	const modelMesh = new THREE.Mesh(boxGeometries, projectedMat);

	scene.add(modelMesh);

	const planeGeom = new THREE.PlaneGeometry(30, 30);
	const planeMat = new THREE.MeshBasicMaterial({color:0xFF0000});
	const planeMesh = new THREE.Mesh(planeGeom, projectedMat);

	//planeMesh.position.set(0, -2, 0);
	planeMesh.rotateX(-Math.PI * 0.25);
	scene.add(planeMesh);

//LIGHTS
	const pointLight = new THREE.PointLight();
	pointLight.position.set(0, 0, 10);
	scene.add(pointLight);
//GUI
	const gui = new dat.GUI();

	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}

		this.enableProjection = false;
	}
	gui.add(controls, 'outputObj');
	gui.add(controls, 'enableProjection', false);


	function render(time){
		projectedMat.uniforms.time.value = step;
		time *= 0.001;
		step++;
		if (controls.enableProjection){
			planeMesh.material = planeMat;
			modelMesh.material = modelMat;
			renderer.setRenderTarget(renderTarget);
			renderer.clear();
			renderer.render(scene, camera);

			planeMesh.material = projectedMat;
			modelMesh.material = projectedMat;
			renderer.setRenderTarget(null);
			renderer.clear();
			renderer.render(scene, camera);
		}

		else {
			planeMesh.material = planeMat;
			modelMesh.material = modelMat;

			renderer.setRenderTarget(null);
			renderer.clear();
			renderer.render(scene, camera);
		}

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			//camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		//renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
			renderTarget.setSize(width, height);
		}
		return needResize;
	}
	requestAnimationFrame(render);
}

main();