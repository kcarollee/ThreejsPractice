import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

let p5Canvas; // a p5 canvas to be used as a texture
let cubeMapTexture, textureCube;
function main(){
//----------------p5 SETUP---------------------------
	const p5Sketch = (sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(200, 200);
			sketch.textSize(10);
			sketch.smooth();
		}
		sketch.draw = () => {
			sketch.background(255);
            //sketch.shader(leafShader);
            sketch.noFill();
           
            sketch.stroke(255, 0, 0);
            sketch.rectMode(sketch.CENTER);
            for (var i = 0; i < 40; i++){
                
                sketch.text("CREATIVE BANKRUPTCY", (10 * i + sketch.frameCount * 0.4) % (sketch.width / 2), 10 * i);
            }
            sketch.text("CREATIVE BANKRUPTCY", 0, 20);
			if (cubeMapTexture) cubeMapTexture.needsUpdate = true;
		}
	};
	p5Canvas = new p5(p5Sketch);

	cubeMapTexture = new THREE.CanvasTexture(p5Canvas.canvas);
	cubeMapTexture.mapping = THREE.EquirectangularRefractionMapping;
	console.log(cubeMapTexture);
	cubeMapTexture.encoding = THREE.sRGBEncoding;
	cubeMapTexture.needsUpdate = true;
//---------------------------------------------------

	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});


//------------------CAMERA---------------------------
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 20);


//---------------------------------------------------
	const scene = new THREE.Scene();


	scene.background = new THREE.Color(0xFFAAAA);
	renderer.render(scene, camera);

	const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();

//-------------------OBJECTS-------------------------

	const mat = new THREE.MeshBasicMaterial({envMap: cubeMapTexture});
	console.log(mat);
	mat.needsUpdate = true;
	const icoGeom = new THREE.IcosahedronGeometry(8, 15);
	const icoMesh = new THREE.Mesh(icoGeom, mat);
	scene.add(icoMesh);

	const spriteMat = new THREE.SpriteMaterial({
		map: cubeMapTexture
	});
	const sprite = new THREE.Sprite(spriteMat);
	scene.add(sprite);

//---------------------------------------------------

	
//---------------------GUI---------------------------
	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}
	}
	gui.add(controls, 'outputObj');

//----------------------------------------------------
	
	function updateBackground(){
		cubeMapTexture = new THREE.CanvasTexture(p5Canvas.canvas);
		cubeMapTexture.mapping = THREE.EquirectangularReflectionMapping;
		//console.log(cubeMapTexture);
		//cubeMapTexture.encoding = THREE.sRGBEncoding;
		cubeMapTexture.needsUpdate = true;
		scene.background = cubeMapTexture;
	}
	function render(time){
		time *= 0.001;
		updateBackground();
		cubeMapTexture.needsUpdate = true;
		icoMesh.material = new THREE.MeshBasicMaterial({envMap: cubeMapTexture});
		icoMesh.material.needsUpdate = true;
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