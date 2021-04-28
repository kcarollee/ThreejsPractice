import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";


class Cube{
    constructor(){
    	this.vertArr = [];

    	/*****************
		  4________5
		 /		   /
		7_________6 |
		|         | |
		| 0________1
		|/		  |/
		3_________2
			
		0: left down back
		1: right down back 
		2: right down front
		3: left down front
		4: left up back
		5: right up back
        6: right up front
        7: left up front
    	******************/
    }

    static setDimensions(x, y, z){
    	Cube.width = x;
    	Cube.height = y;
    	Cube.depth = z;
    }
}
Cube.width;
Cube.height;
Cube.depth;
Cube.edgeIndices = edgeIndices;
Cube.triangulationTable = triangulationTable;



function main(){

	// how to get configIndex
	let b = 0;
	for (let i = 7; i >= 0; i--){
		if (i == 7 || i == 5 || i == 1){ // if (cond) b |= 1 << i
			b |= 1 << i;
		}
		
	}
	console.log(b);

	console.log(Cube.edgeIndices);
	console.log(Cube.triangulationTable);
	
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 30);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);

	const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();

// TEST SHAPE FUNCTIONS
	const f1 = (x, y, z) =>{
		let val = 10000.0 / 
			(
				Math.pow(x, 2) +
				Math.pow(y, 2) + 
				Math.pow(z, 2)
			);
		return  val > 999 ? 1 : val;
	} 

	const f2 = (g, h) => {
		console.log(g);
		return g(1, 1, 1) + h(2, 2, 2);
	}

	console.log(f2(f1, f1));
// TEST SPACE
	let testSpace = {
		width: 10,
		height: 10,
		depth: 10
	}
// SINGLE CUBE PARAMS
	let singleCubeParams = {
		width: 1,
		height: 1,
		depth: 1
	}
// DEBUG SPRITES

	for (let w = -testSpace.width * 0.5; w < testSpace.width * 0.5; w += singleCubeParams.width){
		for (let h =  testSpace.height * -0.5; h < testSpace.height * 0.5; h += singleCubeParams.height){
			for (let d = -testSpace.depth * 0.5; d < testSpace.depth * 0.5; d += singleCubeParams.depth){
				const s = f1(w, h, d) * 0.0005;
				const spriteMat = new THREE.SpriteMaterial({color: new THREE.Color(s, s, s)});
				const sprite = new THREE.Sprite(spriteMat);

				sprite.position.set(w, h, d);
				sprite.scale.set(s, s, s);
				scene.add(sprite);
			}
		}
	}

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