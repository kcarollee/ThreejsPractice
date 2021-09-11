import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

function main(){
// P5 SKETCH
	const p5Sketch = (sketch) => {

		let width;
		let height;
        sketch.setup = () => {
        	sketch.createCanvas(400, 400);
        	width = sketch.width;
        	height = sketch.height;
		}
		sketch.draw = () => {
			if (p5Texture) p5Texture.needsUpdate = true;
			sketch.background(255, 10);

			sketch.rectMode(sketch.CENTER);
			sketch.translate(width * 0.5, height * 0.5);
			sketch.rotate(sketch.frameCount * 0.01);
			sketch.strokeWeight(5);
			sketch.rect(0, 0, width * 0.25, height * 0.25);	
		}

		
    };

    const p5Canvas = new p5(p5Sketch);
	const p5Texture = new THREE.CanvasTexture(p5Canvas.canvas);
	p5Texture.wrapS = THREE.RepeatWrapping;
	p5Texture.wrapT = THREE.RepeatWrapping;
	p5Texture.needsUpdate = true;
	//p5Canvas.canvas.style.display = "none";
	
//CANVAS AND RENDERER
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});
	let step = 0;
//TEXTURES
	const textureLoader = new THREE.TextureLoader();
	/*
	textureArr[n] : ARRAY OF 11 TEXTURES OF THE NUMBER 'n-1' (n < 10)
	textureArr[10] : ARRAY OF 11 DOT TEXTURES
	*/ 
	const textureArr = [];
	let fileName;

	// numbers
	for (let i = 0; i < 10; i++){
		let numTexArr = [];
		for (let j = 0; j <= 10; j++){
			if (j == 10) fileName = "img/n" + i.toString() + j.toString() + ".png";
			else fileName = "img/n" + i.toString() + "0" + j.toString() + ".png";
			let texture =  textureLoader.load(fileName);
			numTexArr.push(texture);
		}
		textureArr.push(numTexArr);
	}

	// dots
	let dotTexArr = [];
	for (let i = 0; i <= 10; i++){
		if (i == 10) fileName = "img/d0" + i.toString() + ".png";
		else fileName = "img/d00" + i.toString() + ".png";
		let texture =  textureLoader.load(fileName);
		dotTexArr.push(texture);
	}
	textureArr.push(dotTexArr);

	const debugTex = textureLoader.load('test.jpg');
	

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
	scene.background = new THREE.Color(0xFFFFFF);
	renderer.render(scene, camera);


//GEOMETRIES
	const planeGeom = new THREE.PlaneGeometry(20, 20);
	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms:{
			mainTexture: {value: p5Texture},
			testTex: {value: textureArr[1][2]},
			tex0: {value: textureArr[0]},
			tex1: {value: textureArr[1]},
			tex2: {value: textureArr[2]},
			tex3: {value: textureArr[3]},
			tex4: {value: textureArr[4]},
			tex5: {value: textureArr[5]},
			tex6: {value: textureArr[6]},
			tex7: {value: textureArr[7]},
			tex8: {value: textureArr[8]},
			tex9: {value: textureArr[9]},
			texd: {value: textureArr[10]},
			sideTileNum: {value: 100.0},
			time: step * 0.01,
			side: THREE.DoubleSide
		},

		vertexShader: document.getElementById('vertexShader').textContent,

		fragmentShader: document.getElementById('fragmentShader').textContent
	});

	const mainPlane = new THREE.Mesh(planeGeom, shaderMaterial);
	scene.add(mainPlane);

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

window.onload = main;