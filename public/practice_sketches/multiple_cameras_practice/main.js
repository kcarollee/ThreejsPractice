// https://stackoverflow.com/questions/42562056/how-to-use-rendering-result-of-scene-as-texture-in-threejs
// https://threejs.org/examples/webgl_rtt.html
import {OrbitControls} from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
//import {ImprovedNoise} from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/math/ImprovedNoise.js";

const DEFAULT_CAM_CONFIGS = {
	fov: 75, 
	aspect: window.innerWidth/window.innerHeight, 
	near: 0.1, 
	far: 1000
}

class RenderTargetCamera{
	// lookAt: Vector3
	constructor(posx, posy, posz, lookAt, configs = DEFAULT_CAM_CONFIGS){
		this.camera = new THREE.PerspectiveCamera(configs.fov, configs.aspect, configs.near, configs.far);
		this.camera.position.set(posx, posy, posz);
		this.cameraLookAt = lookAt;
		this.camera.lookAt(lookAt);
		this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

		// CAMERA MODEL
		this.cameraMesh = new THREE.Mesh(RenderTargetCamera.camGeometry, RenderTargetCamera.camMaterial);

	}

	updateCameraPosition(x, y, z){
		this.camera.position.set(x, y, z);
		this.cameraMesh.position.set(x, y, z);
	}

	updateCameraLookAt(x, y, z){
		this.cameraLookAt.set(x, y, z);
		this.camera.lookAt(this.cameraLookAt);
	}

	renderOntoRenderTarget(renderer, scene){
		renderer.setRenderTarget(this.renderTarget);
		renderer.clear();
		renderer.render(scene, this.camera);
	}

	// don't forget to add mesh to the scene
	getMesh(){
		return this.cameraMesh;
	}	

	getCameraViewTexture(){
		return this.renderTarget.texture;
	}

	getCamera(){
		return this.camera;
	}
}

RenderTargetCamera.camGeometry = new THREE.BoxGeometry(1, 1, 1);
RenderTargetCamera.camMaterial = new THREE.MeshNormalMaterial();



function main(){
	let step = 0;
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const cameraArr = [];
	
	const fov = 75;
	const aspect = canvas.clientWidth / canvas.clientHeight; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	
	let mainCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	mainCamera.position.set(0, 0, 10);
	new OrbitControls(mainCamera, renderer.domElement);
	const testCamera = new RenderTargetCamera(0, 0, -30, new THREE.Vector3(0, 0, 0));
	
	cameraArr.push(mainCamera, testCamera);
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	

//GEOMETRIES
	//const perlin = new ImprovedNoise();
	const cubeMat = new THREE.MeshNormalMaterial();
	const cubeGeom = new THREE.BoxGeometry(1, 1, 1);
	const cubeNum = 100;
	for (let i = 0; i < cubeNum; i++){
		const cube = new THREE.Mesh(cubeGeom, cubeMat);

		cube.position.set(Math.random() * 50 - 25, 0, Math.random() * 50 - 25);
		cube.scale.set(Math.random() * 2, Math.random() * 10, Math.random() * 2);
		scene.add(cube);
	}
	

	const planeGeom = new THREE.PlaneGeometry(20, 20, 20);
	const planeMat = new THREE.MeshBasicMaterial({
		map: testCamera.getCameraViewTexture(),
		side: THREE.DoubleSide
	});
	const plane = new THREE.Mesh(planeGeom, planeMat);
	//plane.rotation.set(0, 0, 0);
	scene.add(plane);

	scene.add(testCamera.getMesh());
	
	

	
//GUI
	const gui = new dat.GUI();
	const controls = new function(){
		let cameraIndex = 0;
		this.debug = function(){

		}

		this.switchCamera = function(){
			
			cameraIndex++;
			cameraIndex %= cameraArr.length;
			

			if (cameraIndex == 0) {
				mainCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
				mainCamera.position.set(0, 0, 10);
				new OrbitControls(mainCamera, renderer.domElement);
			}
			
			else mainCamera = cameraArr[cameraIndex].getCamera();
			
			
		}
	}

	
	gui.add(controls, 'debug');
	gui.add(controls, 'switchCamera');

	

	let tick = true;
	function render(time){
		time *= 0.001;
		step += 1;
		

		testCamera.updateCameraPosition(15 * Math.cos(step * 0.01), 10, 15 * Math.sin(step * 0.01));
		testCamera.updateCameraLookAt(0, 0, 0);
		testCamera.renderOntoRenderTarget(renderer, scene);
		
		

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			mainCamera.aspect = canvas.clientWidth / canvas.clientHeight;
			mainCamera.updateProjectionMatrix();
		}

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene, mainCamera);

		
		requestAnimationFrame(render);
		

		
		
		/*
		cameraArr.forEach(function(c, i){
			if (i == 0){
				renderer.setViewport(0, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissor(0, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissorTest(true);
				renderer.setClearColor(scene.background);

				c.aspect = canvas.clientWidth / canvas.clientHeight;
				c.updateProjectionMatrix();
				renderer.render(scene, c);
			}
			else{
				renderer.setViewport(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissor(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissorTest(true);
				renderer.setClearColor(new THREE.Color(0xFFFFFF));

				c.aspect = canvas.clientWidth / canvas.clientHeight;
				c.updateProjectionMatrix();
				renderer.render(scene, c);
			}
		});
		requestAnimationFrame(render);
		*/
	}

	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
	requestAnimationFrame(render);
}

main();