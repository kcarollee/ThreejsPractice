import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";



class HyperlinkSprite{
	constructor(posVec, destPosVec, spriteTexture, faceTexture, nameTexture, link, index, scale = 1){
		this.currentPosVec = posVec;
		this.destPosVec = destPosVec;

		this.spriteTexture = spriteTexture;
		this.faceSpriteTexture = faceTexture;
		this.nameSpriteTexture = nameTexture;

		this.link = link;
		this.scale = scale;

		this.spriteMat = new THREE.SpriteMaterial({map: this.spriteTexture});
		this.faceSpriteMat = new THREE.SpriteMaterial({map: this.faceSpriteTexture});
		this.nameSpriteMat = new THREE.SpriteMaterial({map: this.nameSpriteTexture});

		this.sprite = new THREE.Sprite(this.spriteMat);
		this.sprite.position.copy(this.currentPosVec);
		this.sprite.scale.set(this.scale, this.scale, this.scale);

		
		this.faceSprite = new THREE.Sprite(this.faceSpriteMat);
		//this.faceSprite.position.copy(this.currentPosVec);
		this.faceSprite.scale.set(this.scale * 0.1, this.scale * 0.1);

		this.nameSprite = new THREE.Sprite(this.nameSpriteMat);
		this.nameSprite.scale.set(this.scale *  0.15, this.scale  * 0.15);
		this.nameSprite.visible = false;

		this.sprite.add(this.faceSprite);
		this.sprite.add(this.nameSprite);

		this.id = index;
		this.sprite.name = index;
		this.faceSprite.name = index;
		this.nameSprite.name = index;
		// animation triggers 
		this.clickAnimationTriggered = false;
		this.centerTranslationTriggered = false;
		this.scaleUpTriggered = false;
		this.scaleDownTriggered = false;

		this.translationClock = new THREE.Clock();
		this.scaleUpClock = new THREE.Clock();

		this.scaleDownClock = new THREE.Clock();

		this.posBeforeTriggered = new THREE.Vector3();
		this.scaleBeforeClickTriggered = new THREE.Vector3();
	}

	addToScene(scene){
		scene.add(this.sprite);
		//scene.add(this.faceSprite);
	}

	moveToDest(){
		if (this.destPosVec.distanceTo(this.currentPosVec) > 0.1 && !HyperlinkSprite.animationTriggered){
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

	clickAnimationZoom(){
		// move sprite to center
		if (this.centerTranslationTriggered){
			let centerVec = new THREE.Vector3(0, 0, 0);
			this.currentPosVec.add(centerVec.sub(this.currentPosVec).multiplyScalar(this.translationClock.getElapsedTime() * 0.1));
			
			this.sprite.position.copy(this.currentPosVec);
			this.faceSprite.position.set(0, 0, 0);

			if (centerVec.distanceTo(this.currentPosVec) < 0.1){
				this.translationClock.stop();
				
				this.centerTranslationTriggered = false;
				this.scaleUpTriggered = true;

				this.scaleUpClock.start();
			}
		}
		
		// scale sprite so it fills up the page
		if (this.scaleUpTriggered){
			// use get elapsed time instead bc devices run on 
			this.scale += this.scaleUpClock.getElapsedTime() * 2.5;
			
			this.sprite.scale.set(this.scale, this.scale);
			this.faceSprite.scale.set(2.5 / this.scale, 2.5 / this.scale);
			this.nameSprite.scale.set(3.8 / this.scale, 3.8 / this.scale)
			if (this.scale > 100) {
				//this.clickAnimationTriggered = false;
				this.scaleUpTriggered = false;
				this.scaleDownTriggered = true;
				this.scaleUpClock.stop();
				this.scaleDownClock.start();
				HyperlinkSprite.opacityClock.start();
				// move to student detail page when the animation is done
				this.moveToLink();
				//this.sprite.scale.set(1, 1, 1);
			}
			
		}

		/*
		if (this.scaleDownTriggered){
			this.scale += (this.scaleBeforeClickTriggered - this.scale) * this.scaleDownClock.getElapsedTime() * 0.05;
			this.sprite.scale.set(this.scale, this.scale);

			let originalPosVec = new THREE.Vector3();
			originalPosVec.copy(this.posBeforeTriggered);
			this.currentPosVec.add(originalPosVec.sub(this.currentPosVec).multiplyScalar(0.2));
			this.sprite.position.copy(this.currentPosVec);

			let scaleDiff = Math.abs(this.scale - this.scaleBeforeClickTriggered);
			let posDiff = this.currentPosVec.distanceTo(this.posBeforeTriggered);
			//console.log(posDiff);
			if (scaleDiff < 0.01 && posDiff < 0.01){
				//console.log("ANIMATION OVER");
				this.scaleDownTriggered = false;
				this.scaleDownClock.stop();
				this.clickAnimationTriggered = false;
				HyperlinkSprite.animationTriggered = false;
				HyperlinkSprite.opacityClock.stop();
			}
		}
		*/
		
		

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

function map(value, min1, max1, min2, max2) {
	return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

async function main(){
	// MOBILE CHECK
	let isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
	// P5 SKETCH
	let p5Texture, p5Canvas;
	let p5CanvasLoadedFlag = false;
  	let p5LoopStarted = false;
	let bgPicLoaded = false;
	let imageLoading = true;
	const p5Sketch = (sketch) => {
		let bgBorderPic;
		let bgPic;
		let mouseLerp = [-10000, -10000];
		let mouseLerpSet = false;
		let mouseLerpCoef = 0.01
		let curPosX, curPosY;
		
		sketch.setup = async () => {
			sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
			//bgBorderPic = await sketch.loadImage("./assets/graphic elements/bgBorderTop.png", sketch.getImage);
			//bgPic = sketch.loadImage("./assets/graphic elements/bgNoisy.png", sketch.getImage);
			//console.log(bgPic.canvas.style.display = 'none');
			//bgPic.resize(0, 0);
			//bgPic = null;
			// check for mobile
			sketch.checkForMobile();
			sketch.imageMode(sketch.CENTER);
			sketch.background(bgColorArr[curBgColorIndex]);
		};
	  
		sketch.draw = async () => {
			try {
				sketch.background(bgColorArr[curBgColorIndex]);
				
				p5LoopStarted = true;
				// first time logo is clicked
				if (logoClickCount == 1){
					if (logoClicked){
						bgPic = await sketch.loadImage("./assets/graphic elements/bgNoisyCompressed.png", sketch.getImage);
						//console.log(mouseLerp);
						logoClicked = false;
					}
					if (bgPic != null) {
						if (bgPic.width != 1 && !mouseLerpSet){
							mouseLerp = [bgPic.width, bgPic.height];
							//console.log(bgPic.width)
							mouseLerpSet = true;
						}
						if (bgPic.width != 1) {
							sketch.image(bgPic, mouseLerp[0], mouseLerp[1], bgPic.width * 1, bgPic.height * 1);
							imageLoading = false;
						}
						else imageLoading = true;
						curPosX = mouseLerp[0];
						curPosY = mouseLerp[1];
						mouseLerp[0] = sketch.lerp(mouseLerp[0], sketch.mouseX, mouseLerpCoef);
						mouseLerp[1] = sketch.lerp(mouseLerp[1], sketch.mouseY, mouseLerpCoef);
					}
				}

				else {
					
					let mode = logoClickCount % 2;
					//console.log(mode == 1);
					// sketch moves towards mouse
					if (mode == 0){
						sketch.image(bgPic, curPosX, curPosY, bgPic.width * 1, bgPic.height * 1);
						curPosX = sketch.lerp(curPosX, -bgPic.width, mouseLerpCoef);
						curPosY = sketch.lerp(curPosY, -bgPic.height, mouseLerpCoef);
					}
					// sketch moves outside
					else if (mode == 1) {
						sketch.image(bgPic, curPosX, curPosY, bgPic.width * 1, bgPic.height * 1);
						curPosX = sketch.lerp(curPosX, sketch.mouseX, mouseLerpCoef);
						curPosY = sketch.lerp(curPosY, sketch.mouseY, mouseLerpCoef);
						// sketch.image(bgPic, 0, 0, bgPic.width * 1, bgPic.height * 1);
						//console.log("HERE2");
					}
					
				}
				
				
				// DRAW
				// sketch.image(bgBorderPic, (sketch.frameCount * 1.5) % sketch.windowWidth, 3);
				// sketch.image(bgBorderPic, (sketch.frameCount * 1.5) % sketch.windowWidth - bgBorderPic.width, 3);

				// sketch.image(bgBorderPic, (sketch.frameCount * 1.5) % sketch.windowWidth, sketch.windowHeight - bgBorderPic.height);
				// sketch.image(bgBorderPic, (sketch.frameCount * 1.5) % sketch.windowWidth - bgBorderPic.width, sketch.windowHeight - bgBorderPic.height);
			} catch {}
			if (p5Texture && p5LoopStarted) {
				p5Texture.needsUpdate = true;
			}

			
		};

		sketch.windowResized = async () => {
			sketch.clear();
			//console.log(sketch.windowWidth, sketch.windowHeight);
			sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
			p5Texture.dispose();
			//p5Texture = new THREE.CanvasTexture(p5Canvas.canvas);
			//p5Texture.needsUpdate = true;
		}

		sketch.getImage = (i) => {
			sketch.image(i, 0, 0);
		};

		sketch.checkForMobile = () =>{
			let isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
			if (isMobile){
			  sketch.pixelDensity(1);
			}
			
		}
	}
	p5Canvas = new p5(p5Sketch);
	
	

	// THREEJS CANVAS & RENDERER
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	const studentNames = [
		"강지현", "권나경", "권채현", "김로영", "김민서", "김민주", "김성희", "김승희", "김예영", "김용규", "나미", "변민경", "박언진", "김성현", "안지민", "오예지", "이덕원", "이연호", "정서윤", "이주희", "한세흔", "황예인", "Maria"
	]
	const studentAdjectives = [
		"바글바글","뒹굴댕굴","포롱포롱","오잉또잉","몽글몽글","헤롱헤롱","희죽희죽","허둥지둥","소복소복","두두두두","두근두근","둥실둥실","보잉보잉","얼렁뚱땅","새콤달콤","가릉가릉","산만산만","피융피융","소곤소곤","데구르르","버블버블","또랑또랑", "딩동댕동"
	]


	// CAMERA 
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;

	let frustumSize = 20;
	if (isMobile) frustumSize = 40;
	
	let oaspect = window.innerWidth / window.innerHeight;

	const camera = new THREE.OrthographicCamera(frustumSize * oaspect / - 2, frustumSize * oaspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 100);
	camera.position.set(0, 0, 20);

	// RAYCASTER
	const raycaster = new THREE.Raycaster();
	const pointerLerp = new THREE.Vector2(0, 0);
	const pointer = new THREE.Vector2(0, 0);

	// CONTROLS
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.enablePan = false;
	controls.update();

	// SCENE
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFFFFFF);
	renderer.render(scene, camera);

	// TEXTURES
	const textureLoader = new THREE.TextureLoader();
	const loadingManager = new THREE.LoadingManager();
	
	const textureNum = 24;
	const spriteTextureArr = [];
	for (let i = 0; i < textureNum; i++){
		let url = "./assets/sprites/sprite (" + (i + 1).toString() + ").png";
		let textureTemp = textureLoader.load(url);
		spriteTextureArr.push(textureTemp); 
	}

	
	const faceTextureArr = [];
	for (let i = 0; i < textureNum; i++){
		let url = "./assets/faces/face (" + (i + 1).toString() + ").png";
		let textureTemp = textureLoader.load(url);
		faceTextureArr.push(textureTemp); 
	}

	const nameTextureArr = [];
	for (let i = 0; i < textureNum; i++){
		let url = "./assets/names/name (" + (i + 1).toString() + ").png";
		let textureTemp = textureLoader.load(url);
		nameTextureArr.push(textureTemp); 
	}
	
	// SPRTIES VER
	const instanceNum = 24;
	const posRange = 10;
	const spritesArr = [];
	const hyperlinkSpritesArr = [];
	for (let i = 0; i < instanceNum; i++){
		let x = map(Math.random(), 0, 1, -posRange, posRange);
		let y = map(Math.random(), 0, 1, -posRange, posRange);
		let z = map(Math.random(), 0, 1, -posRange, posRange);

		let scaleCoef = map(Math.random(), 0, 1, 5,  5);
		// let tempSpriteMaterial= new THREE.SpriteMaterial({map: spriteTextureArr[i]});
		// let sprite = new THREE.Sprite(tempSpriteMaterial);
		// sprite.position.set(x, y, z);
		// sprite.scale.set(scaleCoef, scaleCoef);
		// spritesArr.push(sprite);
		// scene.add(sprite);

		let hyperlinkSprite = new HyperlinkSprite(
			new THREE.Vector3(0, 0, 0), 
			new THREE.Vector3(x, y, z), 
			spriteTextureArr[i],
			faceTextureArr[i],
			nameTextureArr[i],
			'./students/student_' + (i + 1) + '/index.html',
			i,
			scaleCoef
		);

		hyperlinkSprite.addToScene(scene);
		hyperlinkSpritesArr.push(hyperlinkSprite);
	}



	
	// GUI
	// const gui = new dat.GUI();
	// const controls = new function(){
	// 	this.outputObj = function(){
	// 		scene.children.forEach(c => console.log(c));
	// 	}
	// }
	// gui.add(controls, 'outputObj');
	let clickedSprite;
	let globalOpacity = 1.0;
	
	function spriteAnimationHandler(time){
		hyperlinkSpritesArr.forEach(function(hyperlinkSprite){
		

			hyperlinkSprite.moveToDest();
			// zoom animation for the clicked sprite
			if (hyperlinkSprite.clickAnimationTriggered){
				hyperlinkSprite.clickAnimationZoom();
				hyperlinkSprite.nameSprite.visible = true;
			}

			// fall back animation for the rest
			else{
				// face mouse tracking only works when animation is not triggered
				// get the camera object from orbitcontrols
				let cam = controls.object;
				// get camera's world position
				let campPos = cam.position;
				// since the scene is rotating, we need to get the world position of the sprites
				// the lookAt point for each of the sprite should be a positionVec + camPos, and not jsut camPos 
				let lookAtVec = scene.localToWorld(hyperlinkSprite.sprite.position.clone()).add(campPos);
				hyperlinkSprite.sprite.lookAt(lookAtVec);

				// bring the sprite's position to camera's local space and normalized the vector
				let normalizedSpriteScreenPosition = cam.worldToLocal(hyperlinkSprite.sprite.position.clone().normalize());
				// don't forget to normalize the pointer vector as well!!!
				let normalizedDirectionVec = pointerLerp.clone().normalize().sub(normalizedSpriteScreenPosition).normalize();
				let directionVec = normalizedDirectionVec.multiplyScalar(0.25);
				hyperlinkSprite.faceSprite.position.set(directionVec.x, directionVec.y, 0.001);
				
				//console.log(normalizedDirectionVec);
				// if clickedSprite gets defined upon mouse click
				if (clickedSprite != undefined){
					// if the clicked sprite is moving to center
					if (clickedSprite.centerTranslationTriggered){
						if (globalOpacity > 0) globalOpacity -= HyperlinkSprite.opacityClock.getElapsedTime() * 0.01;
						hyperlinkSprite.sprite.material.opacity = globalOpacity;
						hyperlinkSprite.faceSprite.material.opacity = globalOpacity;
						hyperlinkSprite.nameSprite.material.opacity = globalOpacity;
					}
					// if the clicked sprite is moving back to its original pos
					// if (clickedSprite.scaleDownTriggered){
					// 	if (globalOpacity < 1) globalOpacity += HyperlinkSprite.opacityClock.getElapsedTime() * 0.01;
					// 	hyperlinkSprite.sprite.material.opacity = globalOpacity;
					// }
				}
				
			}
		})
	}



	function render(time){
		if (p5Canvas.canvas != undefined && !p5CanvasLoadedFlag) {
			p5Canvas.canvas.style.display = "none";
			p5Texture = new THREE.CanvasTexture(p5Canvas.canvas);
			p5Texture.needsUpdate = true;
			
			p5CanvasLoadedFlag = true;
		}
		if (imageLoading) scene.background.set(0x7A33FF);
		else scene.background = p5Texture;
		  //console.log("HEY");
		  //console.log(imageLoading);
		time *= 0.001;
		controls.update();
		pointerLerp.lerp(pointer, 0.01);
		scene.rotateX(0.001);
		scene.rotateY(0.001);
		
		
		spriteAnimationHandler(time);
		
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			oaspect = window.innerWidth / window.innerHeight;
  
			camera.left = frustumSize * oaspect / - 2;
			camera.right = frustumSize * oaspect / 2;
			camera.top = frustumSize / 2;
			camera.bottom = - frustumSize / 2;
			camera.updateProjectionMatrix();
		}

		
		if (!isMobile) {
			raycaster.setFromCamera( pointer, camera );
			updateRaycaster();
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

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
	
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		//console.log(pointer)
	}


	window.addEventListener( 'pointermove', onPointerMove );

	let intersects;
	function updateRaycaster(){
		// calculate objects intersecting the picking ray
		intersects = raycaster.intersectObjects( scene.children );
		if (intersects.length > 0){
			let firstIntersectSprite = intersects[0].object;
			//console.log(firstIntersectSprite.name);
			document.body.style.cursor = 'pointer';

			if (!HyperlinkSprite.animationTriggered){
				hyperlinkSpritesArr[firstIntersectSprite.name].nameSprite.visible = true;
				for (let i = 0; i < hyperlinkSpritesArr.length; i++){
					if (i == firstIntersectSprite.name) {
						hyperlinkSpritesArr[i].faceSprite.position.set(0, 0, 0);
						hyperlinkSpritesArr[i].nameSprite.visible = true;
					}
					else hyperlinkSpritesArr[i].nameSprite.visible = false;
				}
			}
			
			//console.log(firstIntersectSprite.name);
		}
		else {
			if (!mouseIsInLogo) document.body.style.cursor = 'default';
			if (!HyperlinkSprite.animationTriggered){
				for (let i = 0; i < hyperlinkSpritesArr.length; i++){
					hyperlinkSpritesArr[i].nameSprite.visible = false;
				}
			}
			
		}
	}

	

	
	function onPointerDown( event ){
		// the latter is needed to prevent clicking other sprites when 
		// animation is triggered
		if (isMobile){
			pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			raycaster.setFromCamera( pointer, camera );
			updateRaycaster();
		}
		if (intersects.length > 0 && !HyperlinkSprite.animationTriggered && !mouseIsInLogo){
			let firstIntersectSprite = intersects[0].object;
			let index = firstIntersectSprite.name;
			clickedSprite = hyperlinkSpritesArr[index];
			clickedSprite.clickAnimationTriggered = true;
			clickedSprite.centerTranslationTriggered = true;
			clickedSprite.translationClock.start();
			HyperlinkSprite.animationTriggered = true;
			//window.open(clickedSprite.link, '_self');
			//controls.enabled = false;

			// these need to be set so the sprites can 
			// return to their original position and scale 
			// when coming back from the details page
			// clickedSprite.posBeforeTriggered.copy(clickedSprite.posVec);
			// clickedSprite.scaleBeforeClickTriggered = clickedSprite.scale;
		}

		else if (mouseIsInLogo){
			resetDestPos();
		}

		//console.log(pointer)
	}
	window.addEventListener('pointerdown', onPointerDown);

	function resetDestPos(){
		for (let i = 0; i < instanceNum; i++){
			let hyperlinkSprite = hyperlinkSpritesArr[i];
			let x = map(Math.random(), 0, 1, -posRange, posRange);
			let y = map(Math.random(), 0, 1, -posRange, posRange);
			let z = map(Math.random(), 0, 1, -posRange, posRange);

			let scaleCoef = map(Math.random(), 0, 1, 5,  5);
			
			hyperlinkSprite.setNewDestPos(new THREE.Vector3(x, y, z));
		}
	}

	function onPointerUp(event){
		controls.enabled = true;
	}
	window.addEventListener('pointerup', onPointerUp);


	// TOUCH EVENTS
	function onDocumentTouchStart(event){
		event.preventDefault();
		event.clien
	}
}

main();