import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import HyperlinkSprite from './js/HyperlinkSprite.js';
// TODO:
/*
-> more 'opening' animations
-> figure out a different way of placing the student tiles
-> disable scroll when in zoommode during intro
-> pdf flip book 

*/


function main() {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

	// CAMERA
	const fov = 75;
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const aspect = screenWidth / screenHeight;
	const near = 0.1;
	const far = 1000;
	const frustumCoef = 0.02;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const cameraZoomInPos = 0.3;
	const cameraZoomOutPos = 8;
	const cameraInitialPos = new THREE.Vector3(0, 3, cameraZoomOutPos);
	camera.name = "camera1";
	camera.position.copy(cameraInitialPos);

	//const camera = new THREE.OrthographicCamera( screenWidth / - 2, screenWidth / 2, screenHeight / 2, screenHeight / - 2, 1, 1000 );
	//camera.zoom = 50;

	
	// if (screenWidth > screenHeight) {
	// 	camera.position.z = cameraZoomOutPos * 1.5;
	// }
	// else {
	// 	camera.position.z = cameraZoomOutPos * aspect * 2;
	// }
	const scene = new THREE.Scene();
	scene.name = "scene1";
	scene.background = new THREE.Color(0x5c9cba)
	let currentScene = scene;
	let currentCamera = camera;

	const loader = new THREE.TextureLoader();
	renderer.render(scene, camera);

	// SPRITES -> SCENE 1
	let doorImageData = [];

	const textureLoader = new THREE.TextureLoader();

	const hyperlinkSpriteArr = [];
	const leftSpriteArr = [];
	const rightSpriteArr = [];
	const spriteTextureArr = [];
	const spriteMaterialArr = [];
	let spriteTextureNum = 4;

	for (let i = 0; i < spriteTextureNum; i++) {
		let url = "./assets/final sprites/p (" + (i + 1) + ").png";
		console.log(url);
		const spriteTexture = textureLoader.load(url);

		spriteTextureArr.push(spriteTexture);

		const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });
		spriteMaterialArr.push(spriteMaterial);
	}

	let imgWidth;
	let imgHeight;
	textureLoader.load('./assets/door_original_2.jpg', (texture) => {
		const imageCanvas = document.createElement('canvas');
		const context = imageCanvas.getContext('2d');

		let scale = 0.25;
		let aspectRatio = 1;
		if (window.innerHeight < window.innerWidth) {
			imageCanvas.width = texture.image.width * scale;
			imageCanvas.height = texture.image.height * scale * aspectRatio;
		}

		else {
			imageCanvas.width = texture.image.width * scale / aspectRatio;
			//imageCanvas.height = texture.image.height * scale * 0.5;
			imageCanvas.height = texture.image.height * scale;
		}


		imgWidth = imageCanvas.width;
		imgHeight = imageCanvas.height;

		context.drawImage(texture.image, 0, 0, imageCanvas.width, imageCanvas.height);
		const imageData = context.getImageData(0, 0, imageCanvas.width, imageCanvas.height);

		const pixels = imageData.data;

		let index = 0;
		let inc = 1;
		let threshold = 150;
		for (let i = 0; i < imageCanvas.height; i += inc) {
			for (let j = 0; j < imageCanvas.width; j += inc) {
				if (pixels[index] < threshold && j < imageCanvas.width * 0.5) doorImageData.push([j, i]);
				index += 4 * inc;
			}
		}
	});

	let particlesLoaded = false;
	const randomRange = (coef) => {
		return (Math.random() - 0.5) * 2 * coef;
	}



	const leftParticleGroup = new THREE.Group();
	const rightParticleGroup = new THREE.Group();
	function loadParticles() {
		if (doorImageData.length == 0) console.log("LOADING");
		else if (!particlesLoaded) {
			// left particles
			doorImageData.forEach(function (pos, i) {
				let posX = (pos[0] - imgWidth * 0.5) / 10;
				let posY = -(pos[1] - imgHeight * 0.5) / 10;
				let posZ = 0;
				let spriteMaterialIndex = Math.floor(Math.random() * spriteTextureNum);
				let tempSprite = new HyperlinkSprite(
					new THREE.Vector3(randomRange(100), randomRange(100), 0),
					new THREE.Vector3(posX, posY, posZ), spriteMaterialArr[spriteMaterialIndex],
					null,
					i,
					0.095
				);
				//tempSprite.addToScene(scene);
				hyperlinkSpriteArr.push(tempSprite);
				leftSpriteArr.push(tempSprite);
				leftParticleGroup.add(tempSprite.sprite);
				scene.add(leftParticleGroup);
			})

			//leftParticleGroup.translateX(-imgWidth / 20);
			//leftParticleGroup.rotateY(-Math.PI * 30);

			// right particles
			doorImageData.forEach(function (pos, i) {
				let posX = (imgWidth * 0.5 - pos[0]) / 10;
				let posY = -(pos[1] - imgHeight * 0.5) / 10;
				let posZ = 0;
				let spriteMaterialIndex = Math.floor(Math.random() * spriteTextureNum);
				let tempSprite = new HyperlinkSprite(
					new THREE.Vector3(randomRange(100), randomRange(100), 0),
					new THREE.Vector3(posX, posY, posZ), spriteMaterialArr[spriteMaterialIndex],
					null,
					i,
					0.095
				);
				//tempSprite.addToScene(scene);
				hyperlinkSpriteArr.push(tempSprite);
				rightSpriteArr.push(tempSprite);
				rightParticleGroup.add(tempSprite.sprite);
				scene.add(rightParticleGroup);
			})
			particlesLoaded = !particlesLoaded;
			//rightParticleGroup.translateX(imgWidth / 20);
		}
	}

	// const mainTitleTexture = textureLoader.load('./assets/main_title.png');
	// let ratio = 4904 / 1074;
	// const mainTitleGeometry = new THREE.PlaneGeometry(ratio * 1, 1);
	// const mainTitleMat = new THREE.MeshBasicMaterial({ map: mainTitleTexture });
	// const mainTitleMesh = new THREE.Mesh(mainTitleGeometry, mainTitleMat);
	// mainTitleMesh.position.set(0, 0, -100)
	// mainTitleMesh.name = "mainTitleMesh";
	// scene.add(mainTitleMesh);


	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	const clamp = (x, a, b) => {
		return Math.max(a, Math.min(x, b));
	}

	const doorflapArr = [];
	class DoorflapMesh {
		constructor(initPosVec, scale, frontpageMap, backpageMap) {
			this.initPosVec = initPosVec;
			this.scale = scale;
			this.backpageMat = new THREE.MeshBasicMaterial({ map: backpageMap });
			//this.backpageMat.map = studentNameCards[0]
			this.frontpageMat = new THREE.MeshBasicMaterial({ map: frontpageMap });
			this.frontpageMat.side = THREE.DoubleSide;
			this.backpageMesh = new THREE.Mesh(DoorflapMesh.backpageGeom, this.backpageMat);
			this.frontpageMesh = new THREE.Mesh(DoorflapMesh.frontpageGeom, this.frontpageMat);

			this.doorflapGroup = new THREE.Group();
			this.doorflapGroup.position.copy(this.initPosVec)
			//this.backpageMesh.position.x = 0.21 * 0.5;

			//this.frontpageMesh.position.x = this.scale * 4;
			//this.frontpageMesh.rotateY(-0.3);
			this.doorflapGroup.add(this.backpageMesh, this.frontpageMesh);
			this.doorflapGroup.scale.set(this.scale, this.scale, this.scale);

			this.pointerIsInside = false;
			this.openAnimationTriggered = false;
			this.closedAnimationTriggered = false;
			this.openCounterTriggered = false;
			this.openCounter = 0;
			this.openCounterMax = 100;
			this.deg;
			this.rotateDeg = 0.0;
		}

		scaleDoorFlapGroup(scale) {
			this.doorflapGroup.scale.set(this.scale * scale, this.scale * scale, this.scale * scale);
		}

		animateRotate() {
			if (this.openAnimationTriggered) {
				this.frontpageMesh.rotation.y += (-Math.PI - this.frontpageMesh.rotation.y) * 0.1;

				if (this.frontpageMesh.rotation.y + Math.PI < 0.001) {
					this.openAnimationTriggered = false;
					this.openCounterTriggered = true;
					//this.rotateDeg = 0.2;
				}
			}

			if (this.openCounterTriggered) {
				this.openCounter++;
				if (this.openCounter > this.openCounterMax) {
					this.openCounterTriggered = false;
					this.openCounter = 0;
					this.closedAnimationTriggered = true;
				}
			}

			if (this.closedAnimationTriggered) {
				this.rotateDeg += 0.1;
				if (this.rotateDeg > 0) {
					this.closedAnimationTriggered = false;
					this.pointerIsInside = false;
					this.rotateDeg = 0.0;
				}
				this.frontpageMesh.rotation.y = this.rotateDeg;
			}
		}

		animateSlide() {
			if (this.openAnimationTriggered) {
				this.frontpageMesh.position.x += (-1 - this.frontpageMesh.position.x) * 0.1;
				if (this.frontpageMesh.position.x + 1 < 0.001) {
					this.openAnimationTriggered = false;
					this.openCounterTriggered = true;
					//this.rotateDeg = 0.2;
				}
			}

			if (this.openCounterTriggered) {
				this.openCounter++;
				if (this.openCounter > this.openCounterMax) {
					this.openCounterTriggered = false;
					this.openCounter = 0;
					this.closedAnimationTriggered = true;
				}
			}

			if (this.closedAnimationTriggered) {
				this.frontpageMesh.position.x += (0 - this.frontpageMesh.position.x) * 0.1;
				if (Math.abs(this.frontpageMesh.position.x) < 0.001) {
					this.frontpageMesh.position.x = 0;
					this.closedAnimationTriggered = false;
					this.pointerIsInside = false;
					this.rotateDeg = 0.0;
				}
				this.frontpageMesh.rotation.y = this.rotateDeg;
			}
		}

		getWorldPosition(vec) {
			this.doorflapGroup.getWorldPosition(vec);
		}

		addToScene(scene) {
			scene.add(this.doorflapGroup);
		}
	}

	DoorflapMesh.backpageGeom = new THREE.PlaneGeometry(1, 1);
	DoorflapMesh.backpageGeom.translate(0.5, 0, 0);
	DoorflapMesh.frontpageGeom = new THREE.PlaneGeometry(1, 1);
	DoorflapMesh.frontpageGeom.translate(0.5, 0, 0);
	let rowNum = 5;
	let colNum = 21;
	let doorflapSize = 0.5;
	let offsetX = -doorflapSize * (colNum * 0.5 - 0.5);
	let offsetY = -doorflapSize * (rowNum * 0.5 - 0.5);

	let index = 0;
	let inc = 0;

	/*
	// CHECKER-GRID PLACEMENT
	for (let y = 0; y < rowNum; y++) {
		for (let x = 0; x < colNum; x++) {
			index++;

			if (index % 2 == 0) continue;
			let posX = offsetX + x * doorflapSize;
			let posY = offsetY + y * doorflapSize;
			let randInt = Math.floor(Math.random() * spriteTextureNum);
			//console.log(randInt)
			let doorflap = new DoorflapMesh(new THREE.Vector3(posX, posY, 0), doorflapSize - 0.01,
				studentNameCards[inc % 2], studentProfilePictures[inc % 2]);
			doorflap.doorflapGroup.index = doorflapArr.length;

			doorflap.addToScene(scene2);
			//doorflap.doorflapGroup.visible = false;
			console.log(doorflap);
			doorflapArr.push(doorflap);
			console.log(scene2);
			inc++;
			//movingHyperlinkSpritWeArr.push(doorFlap);
		}
	}

	
	*/
	//renderer.compile(scene2, camera2, scene2);


	// let randomModuleSpritesArr = [];
	// let randomMuduleSpritesNum = 100;
	// let randRange = 2
	// for (let i = 0; i < randomMuduleSpritesNum; i++){


	// 	let material = spriteMaterialArr[i % 4];
	// 	let sprite = new THREE.Sprite(material);
	// 	let posx = Math.random() * randRange - randRange * 0.5;
	// 	let posy  = Math.random() * randRange - randRange * 0.5;
	// 	let posz = -0.01;
	// 	sprite.position.set(posx, posy, posz);
	// 	sprite.scale.set(0.05, 0.05, 0.05);
	// 	sprite.name = "randomSprite";
	// 	scene2.add(sprite);
	// }

	function scaleAllDoorflapMesh(scale) {
		doorflapArr.forEach((doorflap) => {
			doorflap.scaleDoorFlapGroup(scale);
		})
	}

	function map(value, min1, max1, min2, max2) {
		return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
	}

	let doorflapVisibleIndex = 0;
	let tick = 0;

	function moveDoorflapMesh() {
		tick++;
		doorflapArr.forEach((doorflap, i) => {
			//if (i < doorflapVisibleIndex) doorflap.doorflapGroup.visible = true;
			doorflap.doorflapGroup.position.x -= 0.001;
			if (doorflap.doorflapGroup.position.x < offsetX) {
				doorflap.doorflapGroup.position.x = -offsetX
			}
			doorflap.animateSlide();

		})

		if (doorflapVisibleIndex < doorflapArr.length && tick % 3 == 0) doorflapVisibleIndex++;
	}



	const zoomThumbnailGeometry = new THREE.CircleGeometry(0.5, 10);
	const profileImage = textureLoader.load('./assets/student images/student1/profile1.png');
	const projectImage1 = textureLoader.load('./assets/student images/student1/project1.png');
	const projectImage2 = textureLoader.load('./assets/student images/student1/project2.png');
	const projectImage3 = textureLoader.load('./assets/student images/student1/project3.png');

	profileImage.colorSpace = THREE.SRGBColorSpace;
	projectImage1.colorSpace = THREE.SRGBColorSpace;
	projectImage2.colorSpace = THREE.SRGBColorSpace;
	projectImage3.colorSpace = THREE.SRGBColorSpace;

	const zoomProfileThumbnailMaterial1 = new THREE.MeshBasicMaterial({ map: profileImage });
	const zoomProjectThumbnailMaterial1 = new THREE.MeshBasicMaterial({ map: projectImage1 });
	const zoomProjectThumbnailMaterial2 = new THREE.MeshBasicMaterial({ map: projectImage2 });
	const zoomProjectThumbnailMaterial3 = new THREE.MeshBasicMaterial({ map: projectImage3 });

	const zoomProfileThumbnailMesh = new THREE.Mesh(zoomThumbnailGeometry, zoomProfileThumbnailMaterial1);
	const zoomProjectThumbnailMesh1 = new THREE.Mesh(zoomThumbnailGeometry, zoomProjectThumbnailMaterial1);
	const zoomProjectThumbnailMesh2 = new THREE.Mesh(zoomThumbnailGeometry, zoomProjectThumbnailMaterial2);
	const zoomProjectThumbnailMesh3 = new THREE.Mesh(zoomThumbnailGeometry, zoomProjectThumbnailMaterial3);
	
	const zoomProfileDoorflap = new DoorflapMesh(new THREE.Vector3(0, 0, 0), 0, profileImage);
	zoomProfileDoorflap.addToScene(scene);
	doorflapArr.push(zoomProfileDoorflap)

	const backarrowImage = textureLoader.load('./assets/student images/student1/back arrow.png');
	const backArrowThumbnailMaterial = new THREE.MeshBasicMaterial({ map: backarrowImage });
	const backArrowThumbnailMesh = new THREE.Mesh(zoomThumbnailGeometry, backArrowThumbnailMaterial);
	
	scene.add(zoomProfileThumbnailMesh, zoomProjectThumbnailMesh1, zoomProjectThumbnailMesh2, zoomProjectThumbnailMesh3, backArrowThumbnailMesh);

	zoomProfileThumbnailMesh.visible = false;
	zoomProjectThumbnailMesh1.visible = false;
	zoomProjectThumbnailMesh2.visible = false;
	zoomProjectThumbnailMesh3.visible = false;
	backArrowThumbnailMesh.visible = false;

	zoomProfileThumbnailMesh.name = "profileMesh";
	zoomProjectThumbnailMesh1.name = "projectMesh";
	zoomProjectThumbnailMesh2.name = "projectMesh";
	zoomProjectThumbnailMesh3.name = "projectMesh";

	zoomProjectThumbnailMesh1.projectNumber = 0;
	zoomProjectThumbnailMesh2.projectNumber = 1;
	zoomProjectThumbnailMesh3.projectNumber = 2;

	backArrowThumbnailMesh.name = 'backarrow';

	// SPRITES SCENE 2
	const scene2 = new THREE.Scene();
	scene2.name = "scene2";
	const camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera2.name = "camera2";


	// const movingHyperlinkSpriteArr = [];

	// class MovingHyperlinkSprite extends HyperlinkSprite{
	// 	constructor(posVec, destPosVec, spriteMaterial, link, index, scale = 1, limitX, startX){
	// 		super(posVec, destPosVec, spriteMaterial, link, index, scale);
	// 		this.limitX = limitX;
	// 		this.startX = startX;
	// 	}
	// }

	// for (let y = 0; y < rowNum; y++){
	// 	for (let x = 0; x < colNum; x++){
	// 		let posX = offsetX + x * spriteSize;
	// 		let posY = offsetY + y * spriteSize;
	// 		let randInt = Math.floor(Math.random() * spriteTextureNum);
	// 		console.log(randInt)
	// 		let tempSprite = new MovingHyperlinkSprite(
	// 			new THREE.Vector3(posX, posY, 0),
	// 			new THREE.Vector3(posX, posY, 0), spriteMaterialArr[randInt],
	// 			null,
	// 			0,
	// 			spriteSize,
	// 			offsetX,
	// 			-offsetX
	// 		);
	// 		tempSprite.setVisibleTrue();
	// 		//tempSprite.addToScene(scene2);
	// 		//movingHyperlinkSpriteArr.push(tempSprite);
	// 	}
	// }
	const movingHyperlinkSpriteArr = [];
	function moveHyperlinkSprite() {
		movingHyperlinkSpriteArr.forEach((hsSprite) => {
			hsSprite.sprite.position.x -= 0.01;
			if (hsSprite.sprite.position.x < hsSprite.limitX) {
				hsSprite.sprite.position.x = hsSprite.startX;
			}
		})
	}



	const studentNameCards = [];
	const studentProfilePictures = [];
	for (let i = 0; i < 2; i++) {

		let url = "./assets/student sils/student_sil" + (i + 1) + ".png";

		let nameCardTexture = textureLoader.load(url);
		nameCardTexture.colorSpace = THREE.SRGBColorSpace;
		studentNameCards.push(nameCardTexture);
	}

	for (let i = 0; i < 2; i++) {
		let url = "./assets/student images/testpic" + (i + 1) + ".png";

		let studentPicTexture = textureLoader.load(url);
		studentPicTexture.colorSpace = THREE.SRGBColorSpace;
		studentProfilePictures.push(studentPicTexture);
	}

	

	// RAYCASTER
	let pointerInSprite = false;
	let pointerInBackButton = false;
	let pointerInProfileImage = false;
	let pointerInProjectImage = false;
	let projectNumber;
	let intersectPoint = new THREE.Vector3();
	let intersects;
	let scale = 0.1;
	let scaleMax = 1.5;

	function updateRaycaster() {
		moveHyperlinkSprite();
		if (!triggerCameraZoomIn && !triggerSpriteScaleDown && !triggerProfileScaleUp && !triggerProfileScaleDown && !triggerSpriteScaleUp) {

			raycaster.setFromCamera(pointer, camera);

			intersects = raycaster.intersectObjects(currentScene.children, true);
			if (intersects.length == 1) {
				document.body.style.cursor = 'pointer';
				//intersects[0].object.scale.set(2, 2, 2);
				if (intersects[0].object.name == 'mainTitleMesh') return;
				// instead of having the intersectPoint be the literal intersecting point.
				// have it be the position of the sprite the pointer is casting the ray on
				//intersectPoint = intersects[0].point;
				intersects[0].object.getWorldPosition(intersectPoint);

				pointerInSprite = true;
				if (!zoominMode) intersects[0].object.scale.set(scale, scale, scale);
				scale += (scaleMax - scale) * 0.1;
			}
			else {
				document.body.style.cursor = 'auto';
				pointerInSprite = false;

				hyperlinkSpriteArr.forEach((hsSprite) => {
					hsSprite.sprite.scale.set(0.085, 0.085, 0.085);
				})
				scale = 0.1;
			}
		}

		if (triggerProfileScaleUp) {
			raycaster.setFromCamera(pointer, camera);
			intersects = raycaster.intersectObjects(scene.children, true);
			if (intersects.length == 1) {
				document.body.style.cursor = 'pointer';
				switch (intersects[0].object.name) {
					case "backarrow":
						pointerInBackButton = true;
						break;
					case "profileMesh":
						pointerInProfileImage = true;
						break;
					case "projectMesh":
						pointerInProjectImage = true;
						projectNumber = intersects[0].object.projectNumber;
						//console.log(projectNumber)
						break;
					default:
						pointerInBackButton = false;
						pointerInProfileImage = false;
						pointerInProjectImage = false;
				}
			}
			else {
				document.body.style.cursor = 'auto';
				pointerInBackButton = false;
				pointerInProfileImage = false;
				pointerInProjectImage = false;
			}
			//console.log(pointerInProfileImage, pointerInProjectImage);
		}
	}

	const intersectPoint2 = new THREE.Vector3();
	let doorflapGroupIndex = 0;
	function updateRaycaster2() {
		moveDoorflapMesh();
		if (scene2StartCounter / scene2FullThreshold < 1) {
			scaleAllDoorflapMesh(scene2StartCounter / scene2FullThreshold);
		}
		raycaster.setFromCamera(pointer, camera2);
		scene2StartCounter++;
		intersects = raycaster.intersectObjects(currentScene.children, true);
		//console.log(intersects);
		if (intersects.length == 2 || intersects.length == 1) {
			if (intersects[0].object.name == "randomSprite") return;
			document.body.style.cursor = 'pointer';
			//console.log(intersects[0].object.parent.index);
			doorflapGroupIndex = intersects[0].object.parent.index;
			//doorflapArr[doorflapGroupIndex].pointerIsInside = true;
			if (!doorflapArr[doorflapGroupIndex].pointerIsInside) {
				doorflapArr[doorflapGroupIndex].pointerIsInside = true;
				doorflapArr[doorflapGroupIndex].openAnimationTriggered = true;
			}
		}
		else {
			document.body.style.cursor = 'auto';
		}

	}

	const pointerVec = new THREE.Vector3(0, 0, 0);
	const objectWorldPos = new THREE.Vector3(0, 0, 0);
	const objectNDC = new THREE.Vector3();
	function reactToMouse() {
		pointerVec.x = pointer.x;
		pointerVec.y = pointer.y;
		//console.log(pointerVec);
		hyperlinkSpriteArr.forEach((hsSprite, i) => {
			//console.log(hsSprite.sprite.position)
			objectNDC.copy(hsSprite.sprite.getWorldPosition(objectWorldPos));
			objectNDC.normalize();
			//console.log(objectWorldPos, objectNDC)
			let dist = pointerVec.distanceTo(objectNDC);
			if (dist < 0.2) hsSprite.sprite.scale.set(0.5, 0.5, 0.5);
		});
	}

	// ANIMATIONS
	function animateSpriteScale() {
		hyperlinkSpriteArr.forEach((hsSprite) => {
			hsSprite.moveToDest();
		});
		if (triggerSpriteScaleDown) {
			hyperlinkSpriteArr.forEach((hsSprite) => {
				hsSprite.sprite.scale.set(zoominScale, zoominScale, zoominScale);
			});
			zoominScale -= zoominScale * scaleSpeed;

			if (zoominScale < 0.0001) {
				triggerProfileScaleUp = true;
				triggerSpriteScaleDown = false;
				//triggerSpriteScaleDown = false;
			}
		}

		if (triggerProfileScaleUp) {
			zoomProfileThumbnailMesh.visible = true;
			zoomProfileThumbnailMesh.position.copy(intersectPoint);
			zoomProfileThumbnailMesh.scale.set(profileScale, profileScale, 1);

			zoomProjectThumbnailMesh1.visible = true;
			zoomProjectThumbnailMesh1.position.set(intersectPoint.x, intersectPoint.y + 0.1, intersectPoint.z);
			zoomProjectThumbnailMesh1.scale.set(profileScale, profileScale, 1);

			zoomProjectThumbnailMesh2.visible = true;
			zoomProjectThumbnailMesh2.position.set(intersectPoint.x + 0.1, intersectPoint.y, intersectPoint.z);
			zoomProjectThumbnailMesh2.scale.set(profileScale, profileScale, 1);

			zoomProjectThumbnailMesh3.visible = true;
			zoomProjectThumbnailMesh3.position.set(intersectPoint.x - 0.1, intersectPoint.y, intersectPoint.z);
			zoomProjectThumbnailMesh3.scale.set(profileScale, profileScale, 1);

			backArrowThumbnailMesh.visible = true;
			backArrowThumbnailMesh.position.set(intersectPoint.x, intersectPoint.y - 0.1, intersectPoint.z);
			backArrowThumbnailMesh.scale.set(profileScale, profileScale, 1);

			zoomProfileDoorflap.doorflapGroup.position.copy(intersectPoint);
			zoomProfileDoorflap.doorflapGroup.scale.set(profileScale, profileScale, 1);

			profileScale += (profileScaleUpMax - profileScale) * scaleSpeed;
		}

		if (triggerProfileScaleDown) {

			zoomProfileThumbnailMesh.scale.set(profileScale, profileScale, 1);
			zoomProjectThumbnailMesh1.scale.set(profileScale, profileScale, 1);
			zoomProjectThumbnailMesh2.scale.set(profileScale, profileScale, 1);
			zoomProjectThumbnailMesh3.scale.set(profileScale, profileScale, 1);
			backArrowThumbnailMesh.scale.set(profileScale, profileScale, 1);

			profileScale -= profileScale * scaleSpeed;
			if (profileScale < 0.0001) {
				triggerProfileScaleDown = false;
				zoomProfileThumbnailMesh.visible = false;
				zoomProjectThumbnailMesh1.visible = false;
				zoomProjectThumbnailMesh2.visible = false;
				zoomProjectThumbnailMesh3.visible = false;
				triggerSpriteScaleUp = true;
			}
		}

		if (triggerSpriteScaleUp) {
			console.log(triggerSpriteScaleUp);
			hyperlinkSpriteArr.forEach((hsSprite) => {
				hsSprite.sprite.scale.set(zoominScale, zoominScale, zoominScale);
			});
			zoominScale += (0.1 - zoominScale) * scaleSpeed;
			console.log(zoominScale)
			if (Math.abs(zoominScale - 0.1) < 0.001) {
				zoominScale = 0.1;
				triggerSpriteScaleUp = false;
				triggerCameraZoomOut = true;
				pointerInBackButton = false;
				pointerInProfileImage = false;
				pointerInProjectImage = false;
			}
		}

	}

	// CAMERA ANIMATION
	let zoominScale = 0.1;
	let triggerSpriteScaleDown = false;
	let spriteScaleDownCounter = 0;

	let triggerProfileScaleUp = false;
	let profileScaleUpMax = 0.1;
	let profileScale = 0;

	let triggerProfileScaleDown = false;
	let profileScaleDownMin = 0;

	let triggerSpriteScaleUp = false;
	let scaleSpeed = 0.1;

	function animateCamera() {
		if (currentCamera.name == "camera2") return;

		if (triggerCameraZoomIn) {
			zoominMode = true;
			currentCamera.position.z += (cameraZoomInPos - currentCamera.position.z) * 0.1;
			if (Math.abs(currentCamera.position.z - cameraZoomInPos) < 0.01) {
				triggerCameraZoomIn = false;
				triggerSpriteScaleDown = true;
				return;
			}
			currentCamera.position.y += (intersectPoint.y - currentCamera.position.y) * 0.1;
			currentCamera.position.x += (intersectPoint.x - currentCamera.position.x) * 0.1;
			//displayZoomThumbnails();

			// hyperlinkSpriteArr.forEach((hsSprite) => {
			// 	hsSprite.sprite.scale.set(zoominScale, zoominScale, zoominScale);
			// });
			// zoominScale -= 0.001;
		}

		else if (triggerCameraZoomOut) {
			triggerSpriteScaleDown = false;
			currentCamera.position.z += (cameraInitialPos.z - currentCamera.position.z) * 0.1;
			
			currentCamera.position.y += (cameraInitialPos.y - currentCamera.position.y) * 0.1;
			currentCamera.position.x += (cameraInitialPos.x - currentCamera.position.x) * 0.1;

			if (Math.abs(currentCamera.position.z - cameraInitialPos.z) < 0.01) {
				zoominMode = false;
				console.log("STOP ZOOM OUT");
				triggerCameraZoomOut = false;
				return;
			}
		}

	}

	function getMenuBarOpacity() {
		let menuElem = document.getElementById('menu-bar');
		let computedStye = window.getComputedStyle(menuElem);
		let opacity = computedStye.opacity;
		return opacity;
	}

	let spriteDisplayIndex = 0;
	let spriteDisplayIncrement = 40;
	let mainTitleLingerCounter = 0;
	let mainTitleLingerMax = 50;

	// mainTitleMesh positioning
	function animateMainTitleMesh() {

		if (mainTitleMesh.position.z < 0) {
			if (mainTitleMesh.position.z < -50) mainTitleMesh.visible = false;
			else mainTitleMesh.visible = true;
			mainTitleMesh.position.z += leftScrollDist * 50;
			mainTitleMesh.position.z = clamp(mainTitleMesh.position.z, -100, 0);
		}
		else if (mainTitleMesh.position.z == 0 && mainTitleMesh.position.y == 0) {
			mainTitleLingerCounter++;
		}

		if (mainTitleLingerCounter > mainTitleLingerMax) {
			mainTitleMesh.position.y += leftScrollDist * 5;
			//mainTitleLingerCounter = 0;
		}

		if (mainTitleMesh.position.y < 0) {
			mainTitleMesh.position.y = 0;
			mainTitleMesh.position.z = -5;
			mainTitleLingerCounter = 0;
		}
	}

	function animateInitialAppearance() {
		if (leftSpriteArr.length > 0 && rightSpriteArr.length > 0) {
			// initial visibility
			let range = spriteDisplayIncrement + spriteDisplayIndex;
			if (range > leftSpriteArr.length - 1) range = leftSpriteArr.length - 1;
			for (let i = spriteDisplayIndex; i < range; i++) {
				//console.log(leftSpriteArr[i])
				let leftSprite = leftSpriteArr[i];
				let rightSprite = rightSpriteArr[i];
				leftSprite.setVisibleTrue();
				rightSprite.setVisibleTrue();
			}

			if (spriteDisplayIndex < leftSpriteArr.length) spriteDisplayIndex += spriteDisplayIncrement;

			// flickering effect
			for (let i = 0; i < leftSpriteArr.length; i++) {
				let leftSprite = leftSpriteArr[i];
				let rightSprite = rightSpriteArr[i];
				if (!leftSprite.sprite.visible) break;
				let randInt1 = Math.floor(Math.random() * spriteTextureArr.length);
				let randInt2 = Math.floor(Math.random() * spriteTextureArr.length);
				leftSprite.setMaterial(spriteMaterialArr[randInt1]);
				rightSprite.setMaterial(spriteMaterialArr[randInt2]);
			}
		}
	}

	function animate(time) {
		loadParticles();
		animateCamera();
		animateSpriteScale();
		//animateMainTitleMesh();
		//animateInitialAppearance();
		slideDoor();
	}


	function render(time) {
		//console.log(doorImageData);
		time *= 0.001;
		animate(time);
		if (currentScene.name == "scene1") updateRaycaster();
		else {
			//console.log("SCENE2")
			//updateRaycaster2();
		}
		if (resizeRenderToDisplaySize(renderer)) {
			const canvas = renderer.domElement;

			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

			camera2.aspect = canvas.clientWidth / canvas.clientHeight;
			camera2.updateProjectionMatrix();

			if (!zoominMode) camera.position.z = cameraZoomOutPos;

		}
		renderer.render(currentScene, currentCamera);
		requestAnimationFrame(render);
	}

	function resizeRenderToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
	requestAnimationFrame(render);


	function onPointerMove(event) {

		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

		//camera.position.set(-pointer.x, -pointer.y, 10);
	}

	window.addEventListener('pointermove', onPointerMove);

	let triggerCameraZoomIn = false;
	let triggerCameraZoomOut = false;
	let zoominMode = false;

	function onPointerDown(event) {

		if (pointerInSprite && !pointerInBackButton && !pointerInProfileImage && !pointerInProjectImage) {
			// the size of the object clicked on has to go back to 0.1
			intersects[0].object.scale.set(0.1, 0.1, 0.1);
			if (currentCamera.position.z < cameraZoomInPos + 1 && !triggerCameraZoomIn) {
				triggerCameraZoomOut = true;
			}
			else {
				triggerCameraZoomIn = true;
			}
		}

		if (pointerInBackButton) {
			triggerProfileScaleUp = false;
			triggerProfileScaleDown = true;
		}
		else if (pointerInProfileImage) {
			window.location.href = `./pages/student1/index.html`;
		}
		else if (pointerInProjectImage) {
			window.location.href = `./pages/student1/index.html?gallery=${"gallery" + (projectNumber + 1)}`;
		}

	}
	window.addEventListener('pointerdown', onPointerDown);


	let leftScrollDist = 0;
	let rightScrollDist = 0;
	let leftScrollDistMax = 0.07;
	let rightScrollDistMax = 0.07;

	const menuBar = document.getElementById('menu-bar');
	const scrollContainer = document.getElementById('scroll-container');
	const infoBar = document.getElementById('info-bar');
	const mainContents = document.getElementById('main-contents');
	const body = document.body;
	const titleBar = document.getElementById('title-bar');

	let scrollAccumulated = 0;
	let scene2StartCounter = 0;
	let scene2FullThreshold = 50;



	function onScroll(event) {
		if (zoominMode) {
			console.log("ZOOM IN MODE");
			return;
		}
		if (!zoominMode) {
			// upward scroll -> door opens
			if (event.deltaY > 0) {
				leftScrollDist = leftScrollDistMax;
				rightScrollDist = -rightScrollDistMax;
			}
			// downward scroll -> door closes
			else {
				leftScrollDist = -leftScrollDistMax;
				rightScrollDist = rightScrollDistMax;
			}

			HyperlinkSprite.resetMaterialChangeCount(0.5, 7);
			hyperlinkSpriteArr.forEach((hsSprite) => {
				//let randInt = Math.floor(Math.random() * spriteMaterialArr.length);
				//hsSprite.sprite.material = spriteMaterialArr[randInt];
				hsSprite.resetMaterialChangeCount();
			});

			//const scrollTop = scrollContainer.scrollTop;
			scrollAccumulated += event.deltaY;
			if (scrollAccumulated < 0) scrollAccumulated = 0;
			console.log(scrollAccumulated);
			if (scrollAccumulated > 2000) { // Adjust the value to show the menu earlier or later
				currentScene = scene2;
				currentCamera = camera2;
				currentCamera.position.z = 1
				menuBar.classList.add('visible');
				infoBar.classList.add('visible');
				mainContents.classList.add('visible');
				titleBar.classList.add('invisible');
				body.classList.add('change-color');
				body.style.overflowY = "scroll";
				scene2StartCounter += 1;

			}

			// UNCOMMENT TO GET INTRO SCREEN BACK WEHN SCROLLING UP

			// else if (scrollTop <= 1000) {
			// 	menuBar.classList.remove('visible');
			// 	currentScene = scene;
			// 	currentCamera = camera;
			// 	scene2StartCounter = 0;
			// }


		}
		else console.log("NOTHING")

	}
	window.addEventListener('wheel', onScroll);




	function pixelateDoor() {
		hyperlinkSpriteArr.forEach((hsSprite) => {
			let randInt = Math.floor(Math.random() * spriteMaterialArr.length);
			hsSprite.sprite.material = spriteMaterialArr[randInt];
		});
	}


	let leftParticleGroupInitPosX, rightParticleGroupInitPosX;
	let leftParticleGroupLoaded = false;
	let rightParticleGroupLoaded = false;

	function slideDoor() {
		// if the position of the door group is back at its original position
		// and the use attempts to scroll further up, return. 
		if (leftParticleGroup.position.x == leftParticleGroupInitPosX &&
			leftScrollDist < 0) return;

		// if the group is fully loaded
		if (leftParticleGroup.children.length > 0 && !leftParticleGroupLoaded) {
			leftParticleGroupInitPosX = leftParticleGroup.position.x;
			leftParticleGroupLoaded = true;

		}

		if (rightParticleGroup.children.length > 0 && !rightParticleGroupLoaded) {
			rightParticleGroupInitPosX = rightParticleGroup.position.x;
			rightParticleGroupLoaded = true;
		}
		let openScrollDistCoef = 20000;
		// when in zoomout view
		if (!zoominMode && currentScene.name == "scene1") {
			// if in the process of opening
			if (leftScrollDist > 0) {
				leftScrollDist -= 0.001;
				if (leftScrollDist < 0) leftScrollDist = 0;
				//pixelateDoor();
				//console.log(leftScrollDist);
			}
			else {
				//console.log(leftScrollDist);
				//if (leftScrollDist < 0) pixelateDoor();
				leftScrollDist += 0.001;
				if (leftScrollDist > 0) {
					leftScrollDist = 0;
				}

			}

			if (rightScrollDist < 0) {
				rightScrollDist += 0.001;
				if (rightScrollDist > 0) rightScrollDist = 0;

			}

			else {
				rightScrollDist -= 0.001;
				if (rightScrollDist < 0) rightScrollDist = 0;

			}
			//console.log(leftScrollDist);
			leftParticleGroup.position.x -= leftScrollDist;
			rightParticleGroup.position.x -= rightScrollDist;
			currentCamera.position.z -= leftScrollDist;

			if (leftParticleGroup.position.x > leftParticleGroupInitPosX) {
				leftParticleGroup.position.x = leftParticleGroupInitPosX;
			}

			if (rightParticleGroup.position.x < rightParticleGroupInitPosX) {
				rightParticleGroup.position.x = rightParticleGroupInitPosX;
			}


			//console.log(leftParticleGroup.position.x);
		}
	}
}

main();