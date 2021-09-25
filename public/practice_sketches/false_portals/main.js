import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {ImprovedNoise} from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/math/ImprovedNoise.js";
//import {CopyShader} from "https://cdn.skypack.dev/three@0.124.0/examples/js/shaders/CopyShader.js"
function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

	const perlin = new ImprovedNoise();
	let step = 0;
//CAMERA
	const fov = 45;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 50);

	const orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	renderer.render(scene, camera);

//LIGHTS
	const pointLight = new THREE.PointLight(0xFFFFFF, 5, 1000);
	pointLight.position.copy(camera.position);
	scene.add(pointLight);
//GEOMETRIES
	const tubeDim = 10;
	const tubeShape = new THREE.Shape();
	tubeShape.moveTo(-tubeDim * 0.5, -tubeDim * 0.5);
	tubeShape.lineTo(tubeDim * 0.5, -tubeDim * 0.5);
	tubeShape.lineTo(tubeDim * 0.5, tubeDim * 0.5);
	tubeShape.lineTo(-tubeDim * 0.5, tubeDim * 0.5);
	tubeShape.lineTo(-tubeDim * 0.5, -tubeDim * 0.5);

	const tubeHoleShape = new THREE.Shape();
	tubeHoleShape.moveTo(-tubeDim * 0.4, -tubeDim * 0.4);
	tubeHoleShape.lineTo(tubeDim * 0.4, -tubeDim * 0.4);
	tubeHoleShape.lineTo(tubeDim * 0.4, tubeDim * 0.4);
	tubeHoleShape.lineTo(-tubeDim * 0.4, tubeDim * 0.4);
	tubeHoleShape.lineTo(-tubeDim * 0.4, -tubeDim * 0.4);
	
	tubeShape.holes.push(tubeHoleShape);

	const bodyExtrudeSettings = {
		steps: 2,
		depth: tubeDim * 2.0,
		bevelEnabled: false
	}

	const entranceExtrudeSettings = {
		steps: 2,
		depth: 1,
		bevelEnabled: false
	}

	const tubeBodyGeom = new THREE.ExtrudeGeometry(tubeShape, bodyExtrudeSettings);
	const tubeBodyMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
	const tubeBodyMesh = new THREE.Mesh(tubeBodyGeom, tubeBodyMat);
	tubeBodyMesh.position.set(0, 0, -bodyExtrudeSettings.depth);
	const tubeEntranceGeom = new THREE.ExtrudeGeometry(tubeShape, entranceExtrudeSettings);
	const tubeEntranceMat = new THREE.MeshBasicMaterial({color: 0x0000FF});
	const tubeEntranceMesh = new THREE.Mesh(tubeEntranceGeom, tubeEntranceMat);

	// this is the mesh group to use for the PortalTube class
	const tubeGroup = new THREE.Group();
	tubeGroup.add(tubeBodyMesh);
	tubeGroup.add(tubeEntranceMesh);


	
	

	class PortalTube {
		constructor(posx, posy, posz, rotx, roty, rotz){
			this.meshGroup = tubeGroup.clone();

			
			this.initialPos = new THREE.Vector3(posx, posy, posz);
			this.initialRotation = new THREE.Vector3(rotx, roty, rotz);
			
			this.meshGroup.translateX(this.initialPos.x);
			this.meshGroup.translateY(this.initialPos.y);
			this.meshGroup.translateZ(this.initialPos.z);
			this.meshGroup.rotateX(this.initialRotation.x);
			this.meshGroup.rotateY(this.initialRotation.y);
			this.meshGroup.rotateZ(this.initialRotation.z);
			
			/*
			this.bodyPosition = this.meshGroup.children[0].position;
			this.entrancePosition = this.meshGroup.children[1].position;
			*/

			this.bodyPosition = new THREE.Vector3();
			this.entrancePosition = new THREE.Vector3();

			this.bodyPosition.copy(PortalTube.defaultBodyPosition);
			this.entrancePosition.copy(PortalTube.defaultEntrancePosition);

			// must be called whenever rotations or translations occur
			this.updateChildrenMatrices();
			this.curveHelperPosition = new THREE.Vector3();
			// must be called to update curve helper's position appropriate to whatever transformations
			this.updateCurveHelperPosition();
			
			/*
			console.log(this.bodyPosition);
			console.log(this.entrancePosition);
			console.log(this.curveHelperPosition);
			*/

			let dc0 = PortalTube.debugCube.clone();
			dc0.position.copy(this.curveHelperPosition);
			scene.add(dc0);

			this.scaleFactor = 0;
			this.step = 0;
			this.randomOffset = Math.random() * 10;
		}

		addToScene(){
			scene.add(this.meshGroup);
		}

		animate(){
			this.step++;
			if (this.scaleFactor < 1.0){
				this.scaleFactor += 0.1;
				this.meshGroup.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
				
			}
			this.meshGroup.rotateZ(0.05 + 0.025 * Math.sin((this.step + this.randomOffset) * 0.1 ));
			this.meshGroup.updateMatrix();
		}

		updateChildrenMatrices(){
			this.meshGroup.updateMatrix();
			let meshGroupMatrix = this.meshGroup.matrix;

			// the problem with the code below is that 
			// the transformation is repeated again 
			// when the only thing we need are the transformed
			// positions of body and entrance positions/
			
			/*
			this.meshGroup.children.forEach(function(c){
				c.applyMatrix4(meshGroupMatrix);
			})
			*/

			this.bodyPosition.applyMatrix4(meshGroupMatrix);
			this.entrancePosition.applyMatrix4(meshGroupMatrix);
				
		}

		updateCurveHelperPosition(){
			this.curveHelperPosition.subVectors(this.entrancePosition, this.bodyPosition);
			this.curveHelperPosition.normalize();
			this.curveHelperPosition.multiplyScalar(PortalTube.curveHelperCoef);
			this.curveHelperPosition.add(this.entrancePosition);
		}

		getBodyPosition(){
			return this.bodyPosition;
		}

		getCurveHelperPosition(){
			return this.curveHelperPosition;
		}

		getEntrancePosition(){
			return this.entrancePosition;
		}
	}


	PortalTube.curveHelperCoef = 3;
	PortalTube.debugCube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial());
	PortalTube.defaultEntrancePosition = new THREE.Vector3(0, 0, 0);
	PortalTube.defaultBodyPosition = new THREE.Vector3(0, 0, -bodyExtrudeSettings.depth * 0.75);
	
	const testTube1 = new PortalTube(0, 12, 0, Math.PI * 0.15, 0, 0);
	const testTube2 = new PortalTube(0, -12, 0, Math.PI * -0.15, 0, 0);

	testTube1.addToScene();
	testTube2.addToScene();

	const portalTubeArr = [];
	portalTubeArr.push(testTube1, testTube2);


	class VineCylinder{
		constructor(p0, p1, p2, p3){
			this.randomOffset = Math.random();
			
			this.curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
			this.curvePointsNum = 1000;
			this.curvePointsArr = this.curve.getPoints(this.curvePointsNum);
			this.addNoiseToCurve();
			//console.log(this.curvePointsArr);

			//this.partialCurve = new THREE.CatmullRomCurve3();



			this.subArrayIndex = 1;
			this.subArray = this.curvePointsArr.slice(0, this.subArrayIndex);
			this.subArrayCopy = Array.from(this.subArray);
			//console.log(this.subArray);
			this.curveGeom = new THREE.BufferGeometry().setFromPoints(this.subArray);
			this.curveLine = new THREE.Line(this.curveGeom, VineCylinder.vineMaterial);

			this.bufferGeomVerts = new Float32Array();

			
			this.walkerMeshArr = [];
			this.walkerNum = 10;

			for (let i = 0; i < this.walkerNum; i++){
				let walkerMat = new THREE.MeshStandardMaterial({color: 0x00FF00 * Math.random()})
				let walkerMesh = new THREE.Mesh(VineCylinder.walkerGeom, walkerMat);
				walkerMesh.walkerMeshIndex = Math.floor(Math.random() * this.curvePointsArr.length);
				walkerMesh.position.copy(this.curvePointsArr[walkerMesh.walkerMeshIndex]);
				walkerMesh.visible = false;
				this.walkerMeshArr.push(walkerMesh);
			}


			
		}




		
		generatePoints(){

		}

		addNoiseToCurve(){
			let r = this.randomOffset;
			let nc = VineCylinder.noiseCoef;
			let nh = VineCylinder.noiseHeight;
			this.curvePointsArr.forEach(function(p){
				//let n = perlin.noise(p.x * nc + r, p.y * nc + r, p.z * nc + r) ;
				let nx = perlin.noise(p.x * nc + r, p.y * nc + r, p.z * nc + r) * nh;
				let ny = perlin.noise(p.z * nc + r, p.x * nc + r, p.y * nc + r) * nh;
				let nz = perlin.noise(p.y * nc + r, p.z * nc + r, p.x * nc + r) * nh;
				p.add(new THREE.Vector3(nx, ny, nz));
			});
		}

		indexBasedPerlin(i, px, py, pz, r, nc, nh){
			let nx = perlin.noise(px * nc + r + i, py * nc + r + i, pz * nc + r + i) * nh;
			let ny = perlin.noise(pz * nc + r + i, px * nc + r + i, py * nc + r + i) * nh;
			let nz = perlin.noise(py * nc + r + i, pz * nc + r + i, px * nc + r + i) * nh;

			return [nx, ny, nz];
		}

		updateCurve(){
			this.subArrayIndex++;
			//this.addNoiseToSubArray();
			if (this.subArrayIndex < this.curvePointsNum){
				this.subArray = this.curvePointsArr.slice(0, this.subArrayIndex);
			}
			/*
			this.curveLine.geometry.setFromPoints(this.subArray);
			this.curveLine.geometry.attributes.position.needsUpdate = true;
			*/

			
			let cpArr = this.curvePointsArr;
			let cpArrLength = this.curvePointsArr.length;

			this.walkerMeshArr.forEach(function(w){
				w.walkerMeshIndex %= cpArrLength;
				if (w.walkerMeshIndex == 1) w.visible = true;
				w.position.copy(cpArr[w.walkerMeshIndex++ % cpArrLength]);
				
				w.lookAt(cpArr[w.walkerMeshIndex % cpArrLength]);
			});

		}

		addNoiseToSubArray(){
			let r = this.randomOffset;
			let nc = VineCylinder.noiseCoef;
			let nh = VineCylinder.noiseHeight;
			let pFunc = this.indexBasedPerlin;
			this.subArray.forEach(function(p, i){
				
				let nArr = pFunc(i + step * 0.01, p.x, p.y, p.z, r, nc, nh);
				p.x += nArr[0];
				p.y += nArr[1];
				p.z += nArr[2];


				
				
			});
		}

		addToScene(){
			scene.add(this.curveLine);
			this.walkerMeshArr.forEach(w => scene.add(w));
		}
	}
	
	VineCylinder.vineMaterial = new THREE.MeshBasicMaterial({
		color: 0xFFFFFF
	});

	VineCylinder.noiseHeight = 6;
	VineCylinder.noiseCoef = 0.15;

	VineCylinder.walkerGeom = new THREE.BoxGeometry(0.25, 0.25, 2.5);
	


	const testVineArr = [];
	const testVineNum = 100;
	for (let i = 0; i < testVineNum; i++){
		let testVine = new VineCylinder(
			testTube1.getBodyPosition(), 
			testTube1.getCurveHelperPosition(),		
			testTube2.getCurveHelperPosition(),	
			testTube2.getBodyPosition()
		);
		testVineArr.push(testVine);
	}

	

	

	testVineArr.forEach(v => v.addToScene());

//POST-PROCESSING
	
	//resizeRenderToDisplaySize(renderer); // not calling this function prior to the passes yields low-res frames
	const renderPass = new THREE.RenderPass(scene, camera);
	const effectCopy = new THREE.ShaderPass(THREE.CopyShader);
	effectCopy.renderToScreen = true;
	const shaderPass = new THREE.ShaderPass(THREE.CustomShader);

	shaderPass.enabled = true;

	const composer = new THREE.EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.addPass(renderPass);
	composer.addPass(shaderPass);
	composer.addPass(effectCopy);


	
//GUI
	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}

		this.enableShaderPass = true;

		this.addPortalTube = function(){
			const tube = new PortalTube(0,0, 20, Math.PI , 0, 0);
			
			tube.addToScene();
			portalTubeArr.push(tube);
			let addNum = 200;
			for (let i = 0; i < addNum; i++){
				let testVine;
				if (Math.random() > 0.5){
					testVine = new VineCylinder(
						tube.getBodyPosition(), 
						tube.getCurveHelperPosition(),		
						testTube1.getCurveHelperPosition(),	
						testTube1.getBodyPosition()
					);
				}
				else{
					testVine = new VineCylinder(
						tube.getBodyPosition(), 
						tube.getCurveHelperPosition(),		
						testTube2.getCurveHelperPosition(),	
						testTube2.getBodyPosition()
					);
				}
				testVine.addToScene();
				testVineArr.push(testVine);
			}

		}

		this.addVines = function(){

		}
	}
	gui.add(controls, 'outputObj');
	gui.add(controls, 'enableShaderPass').onChange(c => shaderPass.enabled = controls.enableShaderPass);
	gui.add(controls, 'addPortalTube');
	function animate(){
		testVineArr.forEach(v => v.updateCurve());
		portalTubeArr.forEach(function(t){
			t.animate();
		})
	}

	const clock = new THREE.Clock();
	function render(time){
		time *= 0.001;
		step++;
		animate();
		
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		
		//renderer.render(scene, camera);
		requestAnimationFrame(render);

		composer.render(clock.getDelta());
	}

	function resizeRenderToDisplaySize(renderer){
		let canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}

		composer.setSize(window.innerWidth, window.innerHeight);
		return needResize;
	}

	window.addEventListener('resize', resizeRenderToDisplaySize);
	requestAnimationFrame(render);
}

main();