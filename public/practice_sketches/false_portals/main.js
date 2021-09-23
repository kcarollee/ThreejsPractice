import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 20);

	const orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	renderer.render(scene, camera);
//GEOMETRIES
	const tubeDim = 5;
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
			
			this.bodyPosition = this.meshGroup.children[0].position;
			this.entrancePosition = this.meshGroup.children[1].position;


			// must be called whenever rotations or translations occur
			this.updateChildrenMatrices();
			this.curveHelperPosition = new THREE.Vector3();
			// must be called to update curve helper's position appropriate to whatever transformations
			this.updateCurveHelperPosition();
			
			
			console.log(this.bodyPosition);
			console.log(this.entrancePosition);
			console.log(this.curveHelperPosition);

			
		}

		addToScene(){
			scene.add(this.meshGroup);
		}

		updateChildrenMatrices(){
			this.meshGroup.updateMatrix();
			let meshGroupMatrix = this.meshGroup.matrix;

			// the problem with the code below is that 
			// the transformation is repeated again 
			// when the only thing we need are the transformed
			// positions of body and entrance positions/
			
			this.meshGroup.children.forEach(function(c){
				c.applyMatrix4(meshGroupMatrix);
			})
				
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
	PortalTube.curveHelperCoef = 2;

	const testTube1 = new PortalTube(2, 2, 0, Math.PI * 0.25, 0, -0.2);
	const testTube2 = new PortalTube(-2, -2, 0, -Math.PI * 0.25, 0, -0.2);

	testTube1.addToScene();
	testTube2.addToScene();



	class VineCylinder{
		constructor(p0, p1, p2, p3){
			
			this.curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
			this.curvePointsNum = 50;
			this.curvePointsArr = this.curve.getPoints(this.curvePointsNum);

			//console.log(this.curvePointsArr);


			this.subArrayIndex = 1;
			this.subArray = this.curvePointsArr.slice(this.subArrayIndex);

			this.curveGeom = new THREE.BufferGeometry().setFromPoints(this.subArray);
			this.curveLine = new THREE.Line(this.curveGeom, VineCylinder.vineMaterial);
		}

		
		generatePoints(){

		}

		updateCurve(){
			t
		}
	}
	VineCylinder.vineMaterial = new THREE.MeshBasicMaterial({
		color: 0xFFFFFF
	});

	const testVine = new VineCylinder(
		testTube1.getBodyPosition(), 
		testTube1.getCurveHelperPosition(),
		testTube2.getBodyPosition(),
		testTube2.getCurveHelperPosition()	
	);




	
//GUI
	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}
	}
	gui.add(controls, 'outputObj');



	function render(time){
		time *= 0.001;
		
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
}

main();