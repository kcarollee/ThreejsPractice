import * as THREE from "https://cdn.skypack.dev/three@0.130.0/build/three.module.js";


function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});
	
	const DEFAULT_CAM_CONFIGS = {
		fov: 45, 
		aspect: 1, 
		near: 0.1, 
		far: 1000
	}

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

//SEPARATE CAMERA & RENDERTARGET INTEGRATION
	class RenderTargetCamera{
		// lookAt: Vector3
		constructor(posx, posy, posz, lookAt, configs = DEFAULT_CAM_CONFIGS){
			this.camera = new THREE.PerspectiveCamera(configs.fov, configs.aspect, configs.near, configs.far);
			this.camera.position.set(posx, posy, posz);
			this.cameraLookAt = lookAt;
			this.lookAt = lookAt;
			this.camera.lookAt(lookAt);
			this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

			// CAMERA LINE
			this.linePoints = [lookAt, new THREE.Vector3(posx, posy, posz)];
			this.lineGeom =  new THREE.BufferGeometry().setFromPoints(this.linePoints);
			this.line = new THREE.Line(this.lineGeom, RenderTargetCamera.material);
			this.line.name = 'line';
			

		}

		addCameraLineToScene(){
			scene.add(this.line);
		}

		updateCameraLine(x, y, z){
			let prevLine = scene.getObjectByName('line');
			scene.remove(prevLine);
			this.linePoints = [this.lookAt, new THREE.Vector3(x, y, z)];
			this.lineGeom =  new THREE.BufferGeometry().setFromPoints(this.linePoints);
			this.line = new THREE.Line(this.lineGeom, RenderTargetCamera.material);
			this.line.name = 'line';
			scene.add(this.line);
		}

		updateCameraPosition(x, y, z){
			this.camera.position.set(x, y, z);
			
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

	
	
		getCamera(){
			return this.camera;
		}
	}

	RenderTargetCamera.material = new THREE.LineBasicMaterial({
		color: 0x000ff
	})

	const movingCamera = new RenderTargetCamera(0, 0, 10, new THREE.Vector3(0, 0, 0));
	movingCamera.addCameraLineToScene();
	const fixedCamera = new RenderTargetCamera(20, 20, 20, new THREE.Vector3(0, 0, 0));

//GEOMETRIES

	const cubeGeom = new THREE.BoxGeometry(2, 2, 2);
	const matArray = [];
	for (let i = 0; i < 6; i++){
		let c = 0xFFFFFF * Math.random();
		let faceMat = new THREE.MeshBasicMaterial({color: c});
		matArray.push(faceMat);
	}

	const cubeMesh = new THREE.Mesh(cubeGeom, matArray);
	scene.add(cubeMesh);

	const horiCamTrailCurve = new THREE.EllipseCurve(0, 0, 10, 10);
	const points = horiCamTrailCurve.getPoints(50);
	const camTrailHoriGeom = new THREE.BufferGeometry().setFromPoints(points);

	const lineMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 5});
	const lineMat2 = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 5});
	const camTrailHori = new THREE.Line(camTrailHoriGeom, lineMat);
	const camTrailVert = new THREE.Line(camTrailHoriGeom, lineMat2);

	camTrailHori.rotateX(Math.PI * 0.5);
	camTrailVert.rotateY(Math.PI * 0.5);

	const planeGeom = new THREE.PlaneGeometry(20, 20);
	const planeMat = new THREE.MeshBasicMaterial({map: movingCamera.renderTarget.texture});
	const planeMesh = new THREE.Mesh(planeGeom, planeMat);
	planeMesh.position.set(10, 0, 0);
	scene.add(planeMesh);

	const planeMat2 = new THREE.MeshBasicMaterial({map: fixedCamera.renderTarget.texture});
	const planeMesh2 = new THREE.Mesh(planeGeom, planeMat2);
	planeMesh2.position.set(-10, 0, 0);
	scene.add(planeMesh2);

	scene.add(camTrailHori);
	scene.add(camTrailVert);
	
//GUI
	const gui = new dat.GUI();
	let camPos = [0, 0, 10];
	const latlonToCart = (lat, lon, r) => {
		let z = r * Math.cos(lat) * Math.cos(lon);
		let x = r * Math.cos(lat) * Math.sin(lon);
		let y = r * Math.sin(lat);
		camPos = [x, y, z];
	}

	const mapValue = (val, min1, max1, min2, max2) => {
		return min2 + (val - min1) * (max2 - min2) / (max1 - min1);
	}

	const sliderLat = document.getElementById('lat');
	sliderLat.oninput = function(){
		
		controls.currentLatitude = sliderLat.value;
		let mappedLat = mapValue(controls.currentLatitude, -90, 90, -Math.PI * 0.5, Math.PI * 0.5);
		let mappedLong = mapValue(controls.currentLongitude, 0, 360, 0, Math.PI * 2);
		latlonToCart(mappedLat, mappedLong, 10);
		movingCamera.updateCameraLine(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraPosition(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraLookAt(0, 0, 0);
	}

	const sliderLong = document.getElementById('long');
	sliderLong.oninput = function(){
		
		controls.currentLongitude = sliderLong.value;
		let mappedLat = mapValue(controls.currentLatitude, -90, 90, -Math.PI * 0.5, Math.PI * 0.5);
		let mappedLong = mapValue(controls.currentLongitude, 0, 360, 0, Math.PI * 2);
		latlonToCart(mappedLat, mappedLong, 10);
		movingCamera.updateCameraLine(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraPosition(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraLookAt(0, 0, 0);
		camTrailVert.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), mappedLong + Math.PI * 0.5);
	}
	
	
	
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}
		this.currentLatitude = 0;
		this.currentLongitude = 0;
		
	}

	function updateCameraParams(){
		let mappedLat = mapValue(controls.currentLatitude, -90, 90, -Math.PI * 0.5, Math.PI * 0.5);
		let mappedLong = mapValue(controls.currentLongitude, 0, 360, 0, Math.PI * 2);
		latlonToCart(mappedLat, mappedLong, 10);
		movingCamera.updateCameraLine(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraPosition(camPos[0], camPos[1], camPos[2]);
		movingCamera.updateCameraLookAt(0, 0, 0);
		return mappedLong;
	}
	
	gui.add(controls, 'currentLongitude', 0, 360).onChange(function(e){
		controls.currentLongitude = e;
		let mappedLong = updateCameraParams();
		camTrailVert.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), mappedLong - Math.PI * 0.5);
	});

	gui.add(controls, 'currentLatitude', -90, 90).onChange(function(e){
		controls.currentLatitude = e;
		updateCameraParams();
	});



	function render(time){
		time *= 0.001;

		scene.background = new THREE.Color(0x000000);

		cubeMesh.visible = true;
		camTrailVert.visible = true;
		camTrailHori.visible = true;
		movingCamera.line.visible = true;
		planeMesh.visible = false;
		planeMesh2.visible = true;
		fixedCamera.renderOntoRenderTarget(renderer, scene);
		

		planeMesh.visible = true;
		planeMesh2.visible = false;
		movingCamera.renderOntoRenderTarget(renderer, scene);
		
		renderer.setRenderTarget(null);
		renderer.clear();
		scene.background = new THREE.Color(0xDDDDDD);
		cubeMesh.visible = false;
		camTrailVert.visible = false;
		camTrailHori.visible = false;
		movingCamera.line.visible = false;
		planeMesh2.visible = true;
		renderer.render(scene, camera);

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);
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
		}
		return needResize;
	}

	document.onkeydown = function(e){
		
		switch(e.key){
			case 'ArrowLeft':
				if (controls.currentLongitude > 0) {
					controls.currentLongitude--;
					let mappedLong = updateCameraParams();
					camTrailVert.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), mappedLong - Math.PI * 0.5);
				}
				break;
			case 'ArrowRight':
				if (controls.currentLongitude < 360) {
					controls.currentLongitude++;
					let mappedLong = updateCameraParams();
					camTrailVert.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), mappedLong - Math.PI * 0.5);
				}
				break;
			case 'ArrowUp':
				if (controls.currentLatitude < 90) {
					controls.currentLatitude++;
					updateCameraParams();
				}
				break;
			case 'ArrowDown':
				if (controls.currentLatitude > -90) {
					controls.currentLatitude--;
					updateCameraParams();
				}
				break;
		}
	}
	requestAnimationFrame(render);
}

main();