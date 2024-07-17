import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
class SphereParticle {
	constructor(radius, posVec, randomPosVec){
		this.radius = radius;
		this.posVec = posVec;
		this.randomPosVec = randomPosVec;

		this.sphereMesh = new THREE.Mesh(SphereParticle.sphereGeometry, SphereParticle.sphereMaterial);
		this.sphereMesh.scale.set(this.radius, this.radius, this.radius);
		this.sphereMesh.position.copy(this.randomPosVec);
	}

	addToScene(scene){
		scene.add(this.sphereMesh);
	}

	display(){
	
	}

	update(){
		let subVec = new THREE.Vector3();
		subVec.subVectors(this.posVec, this.randomPosVec);
		subVec.multiplyScalar(0.01);
		this.randomPosVec.add(subVec);
		this.sphereMesh.position.copy(this.randomPosVec);
	}
}

SphereParticle.sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
SphereParticle.sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

	

	// CAMERA
	const fov = 75;
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const aspect = screenWidth / screenHeight;
	const near = 0.1;
	const far = 1000;
	const frustumCoef = 0.02;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	// const camera = new THREE.OrthographicCamera(
	// 	screenWidth * -frustumCoef, screenWidth * frustumCoef, 
	// 	screenHeight * frustumCoef, screenHeight * -frustumCoef, 
	// 	0.1, 1000
	// );
	
	// RENDERTARGET
	const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);


	camera.position.set(0, 0, 15);

	const scene = new THREE.Scene();

	const loader = new THREE.TextureLoader();
	// loader.load('assets/bg.0.png', function(texture){
	// 	scene.background = texture;
	// });
	scene.background = new THREE.Color(0x000000);
	//scene.background = imageLoader;
	renderer.render(scene, camera);

	
	// GUI
	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}
	}
	gui.add(controls, 'outputObj');

	// NOISE -> generates value between -1, 1
	noise.seed(Math.random());
	console.log(noise.simplex2(100, 100));

	// SPHERE

	let xLength = 10;
	let yLength = 20;
	let xNum = 40;
	let yNum = 100;
	let xInc = xLength / xNum;
	let yInc = yLength / yNum;

	let doorGap = 2;

	let xOffset1 = -yLength * 0.5;
	let yOffset1 = -yLength * 0.5;

	let xOffset2 = yLength * 0.5 - xLength;
	let yOffset2 = -yLength * 0.5;

	let noiseArr = [];

	let doorGroup1 = new THREE.Group();
	let doorGroup1Particles = [];
	doorGroup1.rotateDeg = Math.PI;
	for (let y = 0; y < yNum; y++){
		let noiseRowArr = [];
		for (let x = 0; x < xNum; x++){
			let xPos = x * xInc + xOffset1;
			let yPos = y * yInc + yOffset1;
			let radius = 0.1;
			let posVec = new THREE.Vector3(xPos, yPos, 0);
			let randomXPos = noise.simplex2(x, y) * 5;
			let randomYPos = noise.simplex2(y, x) * 5;
			
			let randomPosVec = new THREE.Vector3(randomXPos, randomYPos, 0);
			let sphereTemp = new SphereParticle(radius, posVec, randomPosVec);

			let n = noise.simplex2(xPos, yPos);
			noiseRowArr.push(n);
			if (n > 0.1) sphereTemp.sphereMesh.visible = false;
			doorGroup1.add(sphereTemp.sphereMesh);
			doorGroup1Particles.push(sphereTemp);
			//sphereTemp.addToScene(scene);
		}
		noiseArr.push(noiseRowArr);
	}
	scene.add(doorGroup1);
	doorGroup1.translateX(-xLength - doorGap * 0.5);
	doorGroup1.rotateY(doorGroup1.rotateDeg);

	let doorGroup2 = new THREE.Group();
	let doorGroup2Particles = [];
	doorGroup2.rotateDeg = Math.PI;
	let noiseIndex = 0;
	for (let y = 0; y < yNum; y++){
		for (let x = 0; x < xNum; x++){
			let xPos = x * xInc + xOffset2;
			let yPos = y * yInc + yOffset2;
			let radius = 0.1;
			let posVec = new THREE.Vector3(xPos, yPos, 0);
			let randomXPos = noise.simplex2(x, y) * 5;
			let randomYPos = noise.simplex2(y, x) * 5;
			let randomPosVec = new THREE.Vector3(randomXPos, randomYPos, 0);
			let sphereTemp = new SphereParticle(radius, posVec, randomPosVec);

			let flippedNoiseIndex = xNum - x - 1;
			let n = noiseArr[y][flippedNoiseIndex];
			
			if (n > 0.1) sphereTemp.sphereMesh.visible = false;
			doorGroup2.add(sphereTemp.sphereMesh);
			doorGroup2Particles.push(sphereTemp);
			//sphereTemp.addToScene(scene);
			
			noiseIndex++;
		}
	}
	scene.add(doorGroup2);
	doorGroup2.translateX(xLength + doorGap * 0.5);
	doorGroup2.rotateY(doorGroup2.rotateDeg);

	let rotateDeg = 0;

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	function animate(time){
		
		//doorGroup1.rotateOnAxis(new THREE.Vector3(0, -1, 0), 0.01);
		//doorGroup1.rotateY(-0.01);
		//doorGroup2.rotateY(0.01);
		doorGroup1.rotateY(-rotateDeg);
		doorGroup2.rotateY(rotateDeg);

		doorGroup1Particles.forEach(function(p){
			p.update();
		})

		doorGroup2Particles.forEach(function(p){
			p.update();
		})
	}
	


	function render(time){
		time *= 0.001;
		animate(time);
		updateRaycaster();
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
	requestAnimationFrame(render);

	let mouseOnDoor = false;
	function onPointerMove( event ) {

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
	}

	window.addEventListener( 'pointermove', onPointerMove );

	function onPointerClick( event ){
		if (mouseOnDoor) rotateDeg = 0.01;
	}

	window.addEventListener('pointerdown', onPointerClick);

	function updateRaycaster(){
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera( pointer, camera );
		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects( scene.children, true );
		if (intersects.length > 0) mouseOnDoor = true;
		else mouseOnDoor = false;
	}
}

main();