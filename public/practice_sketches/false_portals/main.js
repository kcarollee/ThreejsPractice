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
	scene.background = new THREE.Color(0xCCCCCC);
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


	const tubeGroup = new THREE.Group();
	tubeGroup.add(tubeBodyMesh);
	tubeGroup.add(tubeEntranceMesh);
	scene.add(tubeGroup);

	const tubeGroup2 = tubeGroup.clone();
	tubeGroup2.position.set(10, 0, 0);
	scene.add(tubeGroup2);
	class PortalBox {
		constructor(){
			this.geom = portalTotalGeom;

		}
	}





	class VineCylinder{
		constructor(){
			this.curvePointsArr = [];
			this.curve = new THREE.CatmullRomCurve3([]);
			this.vineGeometry;
			this.vineMesh;
			this.beginPoint = new THREE.Vector3();
			this.endPoint = new THREE.Vector3();
			this.vectorIncrement = new THREE.Vector3();

		}

		setBeginPoint(point){
			this.beginPoint.copy(point);
		}

		setEndPoint(point){
			this.endPoint.copy(point);
		}

		generatePoints(){

		}

		updateCurve(){

		}
	}
	VineCylinder.vineMaterial = new THREE.MeshBasicMaterial({
		color: 0xFF0000
	});


	
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