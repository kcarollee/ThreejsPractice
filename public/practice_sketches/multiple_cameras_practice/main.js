// https://stackoverflow.com/questions/42562056/how-to-use-rendering-result-of-scene-as-texture-in-threejs
// https://threejs.org/examples/webgl_rtt.html
import {OrbitControls} from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import {ImprovedNoise} from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/math/ImprovedNoise.js";

const DEFAULT_CAM_CONFIGS = {
	fov: 60, 
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

	updateCameraMeshRotation(){
		//this.cameraMesh.rotation.set(1, 1, 0);
		//this.cameraMesh.rotateX(1);
		//this.cameraMesh.rotateY();
		//this.cameraMesh.rotateZ();

		let bisectVec = new THREE.Vector3();
		let initVec = new THREE.Vector3(1, 0, 0);
		let subVec = new THREE.Vector3();
		subVec.subVectors(this.cameraLookAt, this.camera.position);
		bisectVec = initVec.add(subVec).normalize();
		

		this.cameraMesh.rotateOnWorldAxis(bisectVec, Math.PI);
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
RenderTargetCamera.camMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});



function main(){
	let step = 0;
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const cameraArr = [];
	
	const fov = 60;
	const aspect = canvas.clientWidth / canvas.clientHeight; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	
	let mainCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	let mainCameraCopy;
	mainCamera.position.set(0, 0, 10);

	const orbitControls = new OrbitControls(mainCamera, renderer.domElement);
	orbitControls.update();
	const testCamera = new RenderTargetCamera(0, 0, -30, new THREE.Vector3(0, 0, 0));
	const testCamera2 = new RenderTargetCamera(0, 0, -30, new THREE.Vector3(0, 0, 0));
	
	cameraArr.push(mainCamera, testCamera, testCamera2);
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	

//GEOMETRIES
	const dim = 100;
	const planeGeom = new THREE.PlaneGeometry(20, 20, 20);
	const planeMat = new THREE.MeshBasicMaterial({
		map: testCamera.getCameraViewTexture(),
		side: THREE.DoubleSide
	});
	const planeMat2 = new THREE.MeshBasicMaterial({
		map: testCamera2.getCameraViewTexture(),
		side: THREE.DoubleSide
	});
	const plane = new THREE.Mesh(planeGeom, planeMat);
	const plane2 = new THREE.Mesh(planeGeom, planeMat2);

	plane.position.set(-dim * 0.25, dim * 0.25, 0);
	plane2.position.set(dim * 0.25, dim * 0.25, 0);
	//plane.rotation.set(0, 0, 0);
	scene.add(plane);
	scene.add(plane2);

	const cubeMat = new THREE.MeshNormalMaterial();
	const cubeGeom = new THREE.BoxGeometry(1, 1, 1);
	const cubeNum = 1000;
	

	const shapeFunc1 = (x, y, z, steep) => (1000 / (10 + (Math.pow(x, steep) + Math.pow(y, steep) + Math.pow(z, steep))));
	for (let i = 0; i < cubeNum; i++){
		let rand = Math.random();
		let cube;
		if (rand < 0.6) cube = new THREE.Mesh(cubeGeom, cubeMat);
		else if (rand < 0.8) cube = new THREE.Mesh(cubeGeom, planeMat);
		else cube = new THREE.Mesh(cubeGeom, planeMat2);

		cube.position.set(Math.random() * dim - dim * 0.5, 0, Math.random() * dim - dim * 0.5);
		//cube.scale.set(Math.random() * 5, Math.random() * 10, Math.random() * 5);
		let scale = shapeFunc1(cube.position.x, cube.position.y, cube.position.z, 2);
		cube.scale.set(Math.random() * 5, Math.random() * scale, Math.random() * 5);
		scene.add(cube);
	}

	const torusNum = 50;
	const torusGeom = new THREE.TorusGeometry(10, 1, 4, 4);
	const torusMat = new THREE.MeshNormalMaterial();
	let torusArr = [];
	function getTorusPositionByIncrement(i){
		let radius = 50;
		let height = 40 + 20 * Math.sin(i * 3.0);
		let x = radius * Math.cos(i);
		let y = height;
		let z = radius * Math.sin(i);
		let pos = new THREE.Vector3(x, y, z);
		return pos;
	}

	let increment = Math.PI * 2.0 / torusNum;
	// init torus
	for (let i = 0; i < torusNum; i++){
		let torus = new THREE.Mesh(torusGeom, torusMat);
		let pos = getTorusPositionByIncrement(increment * i);
		let prevPos = getTorusPositionByIncrement(increment * (i - 1));
		let lookAtVec = new THREE.Vector3();
		lookAtVec.subVectors(prevPos, pos);
		torus.lookAt(lookAtVec);
		torus.position.copy(pos);
		torusArr.push(torus);
		scene.add(torus);
	}

	function distortTorus(){
		for (let i = 0; i < torusArr.length; i++){

			let torus = torusArr[i];
			let pos = getTorusPositionByIncrement(increment * (i));
			let prevPos = getTorusPositionByIncrement(increment * (i - 1));
			let lookAtVec = new THREE.Vector3();
			lookAtVec.subVectors(prevPos, pos);
			torus.lookAt(lookAtVec);
			torus.position.copy(pos);
		}
	}
	

	



	scene.add(testCamera.getMesh());
	scene.add(testCamera2.getMesh());
	

	
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
				mainCamera.position.set(0, 20, 100);
				new OrbitControls(mainCamera, renderer.domElement);
			}
			
			else {
				let temp = mainCamera;
				mainCameraCopy = temp;
				mainCamera = cameraArr[cameraIndex].getCamera();
			}
			
			
		}
	}

	
	gui.add(controls, 'debug');
	gui.add(controls, 'switchCamera');

	

	let tick = true;
	let incrementForTorusCam = 0.01;
	function render(time){
		time *= 0.001;
		step += 1;
		
		testCamera.updateCameraMeshRotation();
		testCamera.updateCameraPosition(40 *  Math.cos(step * 0.01), 10, 40 *  Math.sin(step * 0.01));
		testCamera.updateCameraLookAt(0, 0, 0);

		testCamera.renderOntoRenderTarget(renderer, scene);


		distortTorus();
		testCamera2.updateCameraMeshRotation();
		let newPos = getTorusPositionByIncrement(incrementForTorusCam * step);
		let lookAtPos = getTorusPositionByIncrement(incrementForTorusCam * (step + 10));
		/*
		testCamera2.updateCameraPosition(30 *  Math.sin((step - 0.01) * 0.01), 5 * Math.sin((step * 5 - 0.01) * 0.01), 30 *  Math.cos((step - 0.01) * 0.01));
		testCamera2.updateCameraLookAt(30 *  Math.sin(step * 0.01), 5 * Math.sin(step * 5 * 0.01), 30 *  Math.cos(step * 0.01));
		*/
		testCamera2.updateCameraPosition(newPos.x, newPos.y, newPos.z);
		testCamera2.updateCameraLookAt(lookAtPos.x, lookAtPos.y, lookAtPos.z);
		testCamera2.renderOntoRenderTarget(renderer, scene);
		
		
		

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