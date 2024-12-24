import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// TODO:
/*
- TRY GETTING DOOR DATA STRAIGHT FROM IMAGE
- FASTER SPRITES
- WHEN HOVERING OVER A SPRITE, MAKE INFO ABOUT THE CORRESPONDING STUDENT APPEAR

- HAVE CERTAIN PARTICLES REPRESENT DIFFERENT STUDENTS
- MAKE THE DOOR OPEN UP
- HAVE A DOOR MODEL THAT FILLS UP THE PAGE 
- SCROLLING PAGE 


*/
class HyperlinkSprite{
	constructor(posVec, destPosVec, spriteMaterial, link, index, scale = 1){
		this.currentPosVec = posVec;
		this.destPosVec = destPosVec;
		
		this.link = link;
		this.scale = scale;
		this.spriteMat = spriteMaterial;
		this.sprite = new THREE.Sprite(this.spriteMat);
		this.sprite.position.copy(this.currentPosVec);
		this.sprite.scale.set(this.scale, this.scale, this.scale);

		this.id = index;
		this.sprite.name = index;
				
	}

	addToScene(scene){
		scene.add(this.sprite);
		//scene.add(this.faceSprite);
	}

	moveToDest(){
		if (this.destPosVec.distanceTo(this.currentPosVec) > 0.001){
			//console.log("MOVING")
			let destPosVecCopy = new THREE.Vector3();
			destPosVecCopy.copy(this.destPosVec);
			this.currentPosVec.add(destPosVecCopy.sub(this.currentPosVec).multiplyScalar(0.1));
			
			this.sprite.position.copy(this.currentPosVec);
			//this.faceSprite.position.copy(this.currentPosVec);
		}
	}

	setNewDestPos(newDestPosVec){
		this.destPosVec.copy(newDestPosVec);
	}

	

	clickAnimationFallback(){

	}

	moveToLink(){
		window.open(this.link, '_self');
		THREE.Cache.clear();
	}
}

HyperlinkSprite.centerVec = new THREE.Vector3(0, 0, 0);
HyperlinkSprite.animationTriggered = false;
HyperlinkSprite.opacityClock = new THREE.Clock();

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
	//const camera = new THREE.OrthographicCamera( screenWidth / - 2, screenWidth / 2, screenHeight / 2, screenHeight / - 2, 1, 1000 );
	//camera.zoom = 50;
	camera.position.set(0, 0, 15);
	const scene = new THREE.Scene();
	const loader = new THREE.TextureLoader();
	// loader.load('assets/bg.0.png', function(texture){
	// 	scene.background = texture;
	// });
	scene.background = new THREE.Color(0x0055EE);
	//scene.background = imageLoader;
	renderer.render(scene, camera);
	

	// NOISE -> generates value between -1, 1
	noise.seed(Math.random());

	const controls = new OrbitControls( camera, renderer.domElement );


	// SPRITES
	let doorData = imageData;
	//console.log(doorData);
	const textureLoader = new THREE.TextureLoader();
	let spriteArr = [];
	let spriteTexture = textureLoader.load("./assets/student1.png");
	let spriteMaterial = new THREE.SpriteMaterial({map: spriteTexture});
	
	let totalWidth = 2.5;
	let totalHeight = 2.5;
	let sideNumX = 10;
	let sideNumY = 10;

	let offsetX = -totalWidth * 0.5;
	let offsetY = -totalHeight * 0.5;

	let gapX = totalWidth / sideNumX;
	let gapY = totalHeight / sideNumY;
	
	let index = 0;

	let imgWidth = 132;
	let imgHeight = 188;
	let randomRange = (coef) => {
		return (Math.random() - 0.5) * 2 * coef;
	}
	doorData.forEach(function(pos, i){
		let posX = (pos[0] - imgWidth * 0.5) / 10;
		let posY = -(pos[1] - imgHeight * 0.5) / 10;
		let posZ = 0;
		let tempSprite = new HyperlinkSprite(
			new THREE.Vector3(randomRange(50), randomRange(50), randomRange(50)), 
			new THREE.Vector3(posX, posY, posZ), spriteMaterial, 
			null, 
			i, 
			0.1
		);
		tempSprite.addToScene(scene);
		spriteArr.push(tempSprite);
	})
	
	
	let rotateDeg = 0;

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	function animate(time){
		animateCamera();
		spriteArr.forEach((sprite) => {
			sprite.moveToDest();
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

	
	function onPointerMove( event ) {

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
		//camera.position.set(-pointer.x, -pointer.y, 10);
	}

	window.addEventListener( 'pointermove', onPointerMove );

	let triggerCameraZoomIn = false;
	let triggerCameraZoomOut = false;
	function onPointerDown( event ){
		if (pointerInSprite) {
			if (camera.position.z < 1 && !triggerCameraZoomIn){
				triggerCameraZoomOut = true;
			}
			else {
				triggerCameraZoomIn = true;
			}
			
		}
	}

	function animateCamera(){
		if (triggerCameraZoomIn){
			camera.position.z += (0.5 - camera.position.z) * 0.1;
			if (Math.abs(camera.position.z - 0.5) < 0.0001) {
				triggerCameraZoomIn = false;
				return;
			} 
			camera.position.y += (intersectPoint.y - camera.position.y) * 0.1;
			camera.position.x += (intersectPoint.x - camera.position.x) * 0.1;
		}

		else if (triggerCameraZoomOut){
			camera.position.z += (15 - camera.position.z) * 0.025;
			if (Math.abs(camera.position.z - 15) < 0.0001) {
				triggerCameraZoomOut = false;
				return;
			} 
			camera.position.y += (0 - camera.position.y) * 0.025;
			camera.position.x += (0 - camera.position.x) * 0.025;
		}
	}

	window.addEventListener('pointerdown', onPointerDown);


	let pointerInSprite = false;
	let intersectPoint;
	function updateRaycaster(){
		if (!triggerCameraZoomIn){
			raycaster.setFromCamera( pointer, camera );
		
			const intersects = raycaster.intersectObjects( scene.children, true );
			if (intersects.length > 0){
				//intersects[0].object.scale.set(2, 2, 2);
				intersectPoint = intersects[0].point;
				pointerInSprite = true;
			}
			else {
				pointerInSprite = false;
			}
		}
	
	}
}

main();