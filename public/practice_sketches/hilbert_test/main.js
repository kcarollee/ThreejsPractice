import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});
	let step = 0;
//CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.update();
	camera.position.set(0, 0, 10);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);

//L-SYSTEM
	const operators = ["<", ">", "^", "&", '-', '+'];
	const operands = ["X", "F"];
	const incAngle = Math.PI * 0.5;
	const angleOffset = new THREE.Vector3(0, 0, 0); 
	const euler = new THREE.Euler();
	const dirVec = new THREE.Vector3(1, 0, 0);


	let angleX = 0;
	let angleY = 0;
	let angleZ = 0;

	const axisX = new THREE.Vector3(1, 0, 0);
	const axisY = new THREE.Vector3(0, 1, 0);
	const axisZ = new THREE.Vector3(0, 0, 1);

	const hilbertRuleString = "^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->";

	const testRule = "X+F";

	function generateNextInstruction(curStr, ruleStr){
		let tempStr = "";
		
		for (let i = 0; i < curStr.length; i++){
			if (curStr[i] == 'X') tempStr += ruleStr;
			else tempStr += curStr[i];
		}
		return tempStr;
	}

	function generateInstruction(initStr, ruleStr, iterNum){
		
		let tempStr = generateNextInstruction(initStr, ruleStr);
		
		for (let i = 0; i < iterNum - 1; i++){
			tempStr = generateNextInstruction(tempStr, ruleStr);
		}
		return tempStr;
	}

	function oprateOnAngleVec(operator){
		switch(operator){
			case "<":

				dirVec.applyAxisAngle(axisY, -incAngle);
				break;
			case ">":

				dirVec.applyAxisAngle(axisY, incAngle);
				break;
			case "^":

				dirVec.applyAxisAngle(axisX, incAngle);
				break;
			case "&":

				dirVec.applyAxisAngle(axisX, -incAngle);
				break;
			case "-":

				dirVec.applyAxisAngle(axisZ, -incAngle);
				break;
			case "+":

				dirVec.applyAxisAngle(axisZ, incAngle);
				break;
			default:
				
				break;
		}

		console.log(dirVec);
		
	}


	
	const hilbertInstruction = generateInstruction("X", hilbertRuleString, 1);
	console.log(hilbertInstruction);


	const testLinePoints = [];
	const initialPos = new THREE.Vector3(0, 0, 0);
	for (let i = 0; i < hilbertInstruction.length; i++){
		if (hilbertInstruction[i] == "F"){
			let tempVec = new THREE.Vector3();
			let tempVec2 = new THREE.Vector3();
			/*
			tempVec.set(Math.sin(angleOffset.x), Math.sin(angleOffset.y), Math.sin(angleOffset.z));
			//tempVec.normalize();
			
			initialPos.add(tempVec);
			tempVec2.copy(initialPos);
			*/
			dirVec.normalize();
			initialPos.add(dirVec);	
			tempVec2.copy(initialPos);
			testLinePoints.push(tempVec2);
			

		
		}
		else {
			oprateOnAngleVec(hilbertInstruction[i]);
			
		}
	}

	console.log(testLinePoints);
// SOME OF THE CONCEPTS TO THINK ABOUT:

//GEOMETRIES
	const lineGeom = new THREE.BufferGeometry().setFromPoints(testLinePoints);
	const line = new THREE.Line(lineGeom, new THREE.MeshBasicMaterial({color: 0x000000}));
	line.geometry.setDrawRange(0, 0);
	scene.add(line);
//TEXTURES

//POST-PROCESSING


	
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
		step++;
		line.geometry.setDrawRange(0, step * 5);
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