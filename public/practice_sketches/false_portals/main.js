import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {ImprovedNoise} from "https://cdn.skypack.dev/three@0.130.0/examples/jsm/math/ImprovedNoise.js";//import {CopyShader} from "https://cdn.skypack.dev/three@0.124.0/examples/js/shaders/CopyShader.js"
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
	orbitControls.enableDamping = true;
	orbitControls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	renderer.render(scene, camera);

//LIGHTS
	const pointLight = new THREE.PointLight(0xFFFFFF, 1, 1000);
	const pointLight2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
	pointLight.position.copy(camera.position);
	scene.add(pointLight);
//TEXTURES
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load('tex.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapS = THREE.RepeatWrapping;
	texture.repeat.set(10, 10);
	texture.mapping = THREE.UVMapping;
//RENDER TARGETS
	const renderTarget = new THREE.WebGLRenderTarget(window.innderWidth, window.innerHeight);
	

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

	const tubeFloorMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(tubeDim, tubeDim),
		new THREE.MeshBasicMaterial({color: 0xFF0000, side: THREE.DoubleSide})
	);
	tubeFloorMesh.position.set(0, 0, -bodyExtrudeSettings.depth);
	// this is the mesh group to use for the PortalTube class
	const tubeGroup = new THREE.Group();
	tubeGroup.add(tubeBodyMesh);
	tubeGroup.add(tubeEntranceMesh);
	tubeGroup.add(tubeFloorMesh);

	
	

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
			/*
			let dc0 = PortalTube.debugCube.clone();
			dc0.position.copy(this.curveHelperPosition);
			scene.add(dc0);
			*/
			this.scaleFactor = 0;
			this.step = 0;
			this.randomOffset = Math.random() * 10;

			this.portalOpened = false;

			this.connectedVineArr = [];
			
		}

		addToVineArr(vine){
			this.connectedVineArr.push(vine);
		}

		addToScene(){
			scene.add(this.meshGroup);
		}

		animate(){
			this.step++;
			if (this.scaleFactor < 1.0){
				this.scaleFactor += 0.01;
				this.meshGroup.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
				
			}

			else this.portalOpened = true;
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
			this.curvePointsNum = 300;
			this.curvePointsArr = this.curve.getPoints(this.curvePointsNum);

			this.curvePointsArrOriginal = [];

			let cpArr = this.curvePointsArr;
			let cpArrOrig = this.curvePointsArrOriginal;
			this.curvePointsArr.forEach(function(p){
				let temp = new THREE.Vector3();
				temp.copy(p);
				cpArrOrig.push(temp);
			});

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
				let walkerMat = new THREE.MeshStandardMaterial({
					color:new THREE.Color(0, Math.random(), 0),
					metalness: .0,
					//wireframe: true
					//refractionRatio: 0.99,
					envMap: texture
				})
				let walkerMesh = new THREE.Mesh(VineCylinder.walkerGeom, walkerMat);
				walkerMesh.walkerMeshIndex = Math.floor(Math.random() * this.curvePointsArr.length);
				if (i % 2 == 0) walkerMesh.material.wireframe = true;
				walkerMesh.position.copy(this.curvePointsArr[walkerMesh.walkerMeshIndex]);
				//walkerMesh.visible = true;
				walkerMesh.scale.set(0, 0, 0);
				this.walkerMeshArr.push(walkerMesh);
			}

			this.startingPortal;
			this.addNoiseIndex = 0;
			this.scale = 1;
			this.globalVisibility = true;
		}

		setStartingPortal(portal){
			this.startingPortal = portal;
		}
	
		generatePoints(){

		}

		enableWalkerVisibility(){
			this.walkerMeshArr.forEach(v => v.visible = true);
		}

		disableWalkerVisibility(){
			this.walkerMeshArr.forEach(v => v.visible = false);
		}

		addNoiseToCurve(){
			let r = this.randomOffset;
			let nc = VineCylinder.noiseCoef;
			let nh = VineCylinder.noiseHeight * 0.5;
			let ns = step * 0.01;
			let cpArrOrig = this.curvePointsArrOriginal;
			this.curvePointsArr.forEach(function(p, i){
				//let n = perlin.noise(p.x * nc + r, p.y * nc + r, p.z * nc + r) ;
				let nx = perlin.noise(p.x * nc + r + ns, p.y * nc + r + ns, p.z * nc + r + ns) * nh;
				let ny = perlin.noise(p.z * nc + r + ns, p.x * nc + r + ns, p.y * nc + r + ns) * nh;
				let nz = perlin.noise(p.y * nc + r + ns, p.z * nc + r + ns, p.x * nc + r + ns) * nh;
				//p.add(new THREE.Vector3(nx, ny, nz));
				let temp = new THREE.Vector3();
				let nvec = new THREE.Vector3(nx, ny, nz);
				temp.add(nvec);
				temp.add(cpArrOrig[i]);
				p.set(temp.x, temp.y, temp.z);
			});
		}

		addNoiseToCurveIncrementally(index){
			let r = this.randomOffset;
			let nc = VineCylinder.noiseCoef;
			let nh = VineCylinder.noiseHeight * 0.5;
			let ns = step * 0.01;
			let cpArrOrig = this.curvePointsArrOriginal;
			let p = this.curvePointsArr[index];
				//let n = perlin.noise(p.x * nc + r, p.y * nc + r, p.z * nc + r) ;
				let nx = perlin.noise(p.x * nc + r + ns, p.y * nc + r + ns, p.z * nc + r + ns) * nh;
				let ny = perlin.noise(p.z * nc + r + ns, p.x * nc + r + ns, p.y * nc + r + ns) * nh;
				let nz = perlin.noise(p.y * nc + r + ns, p.z * nc + r + ns, p.x * nc + r + ns) * nh;
				//p.add(new THREE.Vector3(nx, ny, nz));
				let temp = new THREE.Vector3();
				let nvec = new THREE.Vector3(nx, ny, nz);
				temp.add(nvec);
				temp.add(cpArrOrig[index]);
				p.set(temp.x, temp.y, temp.z);
			
		}

		indexBasedPerlin(i, px, py, pz, r, nc, nh){
			let nx = perlin.noise(px * nc + r + i, py * nc + r + i, pz * nc + r + i) * nh;
			let ny = perlin.noise(pz * nc + r + i, px * nc + r + i, py * nc + r + i) * nh;
			let nz = perlin.noise(py * nc + r + i, pz * nc + r + i, px * nc + r + i) * nh;

			return [nx, ny, nz];
		}

		updateCurve(){
			/*
			this.subArrayIndex++;
			//this.addNoiseToSubArray();
			if (this.subArrayIndex < this.curvePointsNum){
				this.subArray = this.curvePointsArr.slice(0, this.subArrayIndex);
			}
			*/
			/*
			this.curveLine.geometry.setFromPoints(this.subArray);
			this.curveLine.geometry.attributes.position.needsUpdate = true;
			*/

			if (VineCylinder.addNoise){
				
				this.addNoiseToCurve();
				//this.addNoiseToCurve += 3;
				//this.addNoiseToCurveIncrementally(this.addNoiseIndex % this.curvePointsArr.length);
			}

			
			
			if (this.startingPortal.portalOpened == true){
				let cpArr = this.curvePointsArr;
				let cpArrLength = this.curvePointsArr.length;
				let visible = this.globalVisibility;
				let scale = this.scale;
				this.walkerMeshArr.forEach(function(w){
					w.walkerMeshIndex %= cpArrLength;
					if (w.walkerMeshIndex == 1 && visible) w.scale.set(scale, scale, scale);
					w.position.copy(cpArr[w.walkerMeshIndex++ % cpArrLength]);
					
					w.lookAt(cpArr[w.walkerMeshIndex % cpArrLength]);
				});
			}

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

	VineCylinder.walkerGeom = new THREE.BoxGeometry(0.5, 0.5, 2);
	VineCylinder.addNoise = false;


	const testVineArr = [];
	const testVineNum = 50;
	for (let i = 0; i < testVineNum; i++){
		

		let testVine;

		

		if (Math.random() < 0.5){
			testVine = new VineCylinder(
				testTube1.getBodyPosition(), 
				testTube1.getCurveHelperPosition(),		
				testTube2.getCurveHelperPosition(),	
				testTube2.getBodyPosition()
			);

			testTube1.addToVineArr(testVine);

			testVine.setStartingPortal(testTube1);
		}

		else{
			testVine = new VineCylinder(
				testTube2.getBodyPosition(), 
				testTube2.getCurveHelperPosition(),		
				testTube1.getCurveHelperPosition(),	
				testTube1.getBodyPosition()
			);
			testTube2.addToVineArr(testVine);
			testVine.setStartingPortal(testTube2);
		}

		testVineArr.push(testVine);
	}

	

	

	testVineArr.forEach(v => v.addToScene());

//POST-PROCESSING
	
	//resizeRenderToDisplaySize(renderer); // not calling this function prior to the passes yields low-res frames
	const renderPass = new THREE.RenderPass(scene, camera);
	const effectCopy = new THREE.ShaderPass(THREE.CopyShader);
	effectCopy.renderToScreen = true;

	
	console.log(THREE.CustomShader);
	const shaderPass = new THREE.ShaderPass(THREE.CustomShader);

	/*
		// DO NOT DO THE FOLLOWING:
		THREE.CustomShader.uniforms.renderTarget.value = renderTarget.texture;
	*/

	// DO THIS INSTEAD
	shaderPass.uniforms.renderTarget.value = renderTarget.texture;
	const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);

	shaderPass.enabled = true;

	const composer = new THREE.EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.addPass(renderPass);
	composer.addPass(shaderPass);
	composer.addPass(effectCopy);
	composer.addPass(fxaaPass);

//DEBUG
/*
	const debugPlane = new THREE.Mesh(
		new THREE.PlaneGeometry(10, 10, 10),
		new THREE.MeshBasicMaterial({
			map: renderTarget.texture
		})
	);

	scene.add(debugPlane);
*/
//GUI
	const gui = new dat.GUI();
	//const testTube1 = new PortalTube(0, 12, 0, Math.PI * 0.15, 0, 0);
	const preconfiguredTubeSettingsArr = [
	{
		px: 0,
		py: 0,
		pz: 20,
		rx: Math.PI,
		ry: 0,
		rz: 0
	},
	{
		px: 20,
		py: 0,
		pz: 10,
		rx: 0,
		ry: Math.PI * -0.5,
		rz:0
	}

	
	];

	
	const controls = new function(){
		this.tubeConfigIndex = 0;
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}

		this.enableShaderPass = true;

		this.addPortalTube = function(){
			if (this.tubeConfigIndex < preconfiguredTubeSettingsArr.length){
				const config = preconfiguredTubeSettingsArr[this.tubeConfigIndex];
				const tube = new PortalTube(config.px, config.py, config.pz, config.rx, config.ry, config.rz);
				
				tube.addToScene();
				portalTubeArr.push(tube);
				let addNum = 50;
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
					testVine.setStartingPortal(tube);
					testVine.addToScene();
					testVineArr.push(testVine);
				}
				this.tubeConfigIndex++;
			}
		}

		this.addNoiseToCurve = false;

		this.debug = function(){
			console.log(portalTubeArr);
		}
	}
	gui.add(controls, 'outputObj');
	gui.add(controls, 'enableShaderPass').onChange(c => shaderPass.enabled = controls.enableShaderPass);
	gui.add(controls, 'addNoiseToCurve').onChange(c => VineCylinder.addNoise = controls.addNoiseToCurve);
	gui.add(controls, 'addPortalTube');
	gui.add(controls, 'debug');
	function animate(){
		orbitControls.update();
		pointLight.position.copy(camera.position);
		testVineArr.forEach(v => v.updateCurve());
		portalTubeArr.forEach(function(t){
			t.animate();
		});

		//THREE.CustomShader.uniforms.renderTarget.value = renderTarget.texture;
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
		//???


		
		portalTubeArr.forEach(function(p){
			p.meshGroup.children[0].visible = false;
			p.meshGroup.children[2].visible = false;
		})
		testVineArr.forEach(function(v){
			v.globalVisibility = false;
			v.disableWalkerVisibility();
		});
		renderer.setRenderTarget(renderTarget);
		renderer.clear();
		renderer.render(scene, camera);

		
		requestAnimationFrame(render);

		portalTubeArr.forEach(function(p){
			p.meshGroup.children[0].visible = true;
			p.meshGroup.children[2].visible = true;
		})
		testVineArr.forEach(function(v){
			v.globalVisibility = true;
			v.enableWalkerVisibility();
		});

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
			renderTarget.setSize(width, height);
		}
		//renderTarget.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
		return needResize;
	}

	window.addEventListener('resize', resizeRenderToDisplaySize);
	requestAnimationFrame(render);
}

main();