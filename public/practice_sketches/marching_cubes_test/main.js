import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";


class Cube{
    constructor(centerX, centerY, centerZ){
    	this.centerX = centerX;
    	this.centerY = centerY;
    	this.centerZ = centerZ;
    	this.cubeVertArr = []; // [x0, y0, z0, x1, y1, z1..., x7, y7, z7]
    	this.meshVertArr = [];

    	/*****************
		  4________5
		 /		   /
		7_________6 |
		|         | |
		| 0________1
		|/		  |/
		3_________2
			
		0: left down back   | cx-hw cy-hh cz-hd
		1: right down back  | cx+hw cy-hh cz-hd 
		2: right down front | cx+hw cy-hh cz+hd
		3: left down front  | cx-hw cy-hh cz+hd
		4: left up back     | cx-hw cy+hh cz-hd
		5: right up back    | cx+hw cy+hh cz-hd
        6: right up front   | cx+hw cy+hh cz+hd
        7: left up front    | cx-hw cy+hh cz+hd

        testing should be done in a decreasing order to create the correct configIndex.
    	******************/

    	this.configIndex = 0; // index in the triangulation table
    	this.triangulationEdgeIndices;
    }

    setCubeCorners(){
    	// half width, height, depth
    	let hw = Cube.width * 0.5;
    	let hh = Cube.height * 0.5;
    	let hd = Cube.depth * 0.5;
    	let mult = [
    		-1, -1, -1,
    		1, -1, -1,
    		1, -1, 1,
    		-1, -1, 1,
    		-1, 1, -1,
    		1, 1, -1,
    		1, 1, 1,
    		-1, 1, 1
    	];
    	for (let i = 0; i < 24; i++){
    		switch(i % 3){
    			// push xpos of the corner
    			case 0:
    				let x = this.centerX + mult[i] * hw;
    				this.cubeVertArr.push(x);
    				break;
    			// push ypos of the corner
    			case 1:
    				let y = this.centerY + mult[i] * hh;
    				this.cubeVertArr.push(y);
    				break;
    			// push zpos of the corner
    			case 2:
    				let z = this.centerZ + mult[i] * hd;
    				this.cubeVertArr.push(z);
    				break;
    		}
    	}
    	//console.log(this.cubeVertArr);
    }


    // f is a shape function that takes x, y, z as arguments
    // threshold is a threshold value over which we define as being 'inside' (1)
    setConfigIndex(f, threshold){
    	// start from vert # 7 since that's how the configIndex is generated.
    	for (let i = 7; i > -1; i--){
    		let x = this.cubeVertArr[i * 3];
    		let y = this.cubeVertArr[i * 3 + 1];
    		let z = this.cubeVertArr[i * 3 + 2];
    		if (f(x, y, z) > threshold) this.configIndex |= 1 << i;
    	}
    	//console.log(this.configIndex);

    	// set the array of triangulation edge indices based on the configIndex.
    	this.triangulationEdgeIndices = Cube.triangulationTable[this.configIndex];
    	//console.log(this.triangulationEdgeIndices);
    }

    setMeshVertices(){
    	for (let i = 0; i < 16; i++){
    		if (this.triangulationEdgeIndices[i] == -1) break;
    		
    		// 1. get edge index in triEdgeIndices 
    		let edgeIndex = this.triangulationEdgeIndices[i];
    		
    		// 2. use Cube.edgeToVerticesIndices to determine which two vertices the edge is in between
    		let vertIndices = Cube.edgeToVerticesIndices[edgeIndex];
    		let vertIndex1 = vertIndices[0];
    		let vertIndex2 = vertIndices[1];

    		let v1x = this.cubeVertArr[vertIndex1 * 3];
    		let v1y = this.cubeVertArr[vertIndex1 * 3 + 1];
    		let v1z = this.cubeVertArr[vertIndex1 * 3 + 2];

    		let v2x = this.cubeVertArr[vertIndex2 * 3];
    		let v2y = this.cubeVertArr[vertIndex2 * 3 + 1];
    		let v2z = this.cubeVertArr[vertIndex2 * 3 + 2];
    		
    		// 3. get the midpoint of the two vertices
    		let mx = (v1x + v2x) * 0.5;
    		let my = (v1y + v2y) * 0.5;
    		let mz = (v1z + v2z) * 0.5;

    		// 4. push the coordinates of the midpoint to meshVertArr
    		this.meshVertArr.push(mx, my, mz);
    	}

    	//console.log(this.meshVertArr);
    }

    createMesh(scene){
    	let geom = new THREE.BufferGeometry();
    	let vertices = new Float32Array(this.meshVertArr);
    	geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    	let mat = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
    	let mesh = new THREE.Mesh(geom, mat);
    	scene.add(mesh);
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
Cube.edgeToVerticesIndices = [
	[0, 1], // edge number 0 is between vert0 & vert1
	[1, 2], // edge number 1 is between vert1 & vert2
	[2, 3], // edge number 2
	[3, 0], // edge number 3 
	[4, 5], // edge number 4
	[5, 6], // edge number 5
	[6, 7], // edge number 6
	[7, 4], // edge number 7
	[0, 4], // edge number 8
	[1, 5], // edge number 9
	[2, 6], // edge number 10
	[3, 7]  // edge number 11
];	


function main(){

	// how to get configIndex
	let b = 0;
	for (let i = 7; i >= 0; i--){
		if (i == 7 || i == 5 || i == 1){ // if (cond) b |= 1 << i
			b |= 1 << i;
		}
		
	}
	console.log(b);

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

	const f3 = (x, y, z) => {
		return Math.sin(x * 10 + y * 10 + z * z);
	}

	console.log(f2(f1, f1));

	

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

	Cube.setDimensions(singleCubeParams.width, singleCubeParams.height, singleCubeParams.depth);
	
	/*
	let testCube = new Cube(0, 0, 0);
	testCube.setCubeCorners();
	testCube.setConfigIndex(f3, 0);
	testCube.setMeshVertices();
	testCube.createMesh(scene);
	*/
	let marchingCubes = [];

	for (let w = testSpace.width * -0.5; w < testSpace.width * 0.5; w += singleCubeParams.width){
		for (let h = testSpace.height * -0.5; h < testSpace.height * 0.5; h += singleCubeParams.height){
			for (let d = testSpace.depth * -0.5; d < testSpace.depth * 0.5; d += singleCubeParams.depth){
				let cube = new Cube(w, h, d);
				marchingCubes.push(cube);
			}
		}	
	}

	marchingCubes.forEach(function(c){
		c.setCubeCorners();
		c.setConfigIndex(f3, 0);
		c.setMeshVertices();
		c.createMesh(scene);
	});

	
	const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();



// DEBUG SPRITES
	
	/*
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
	*/

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