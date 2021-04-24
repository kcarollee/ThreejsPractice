let p5Canvas; // a p5 canvas to be used as a texture
let cubeMapTexture, textureCube;
function main(){
//----------------p5 SETUP---------------------------
	const p5Sketch = (sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(100, 100);
		}
		sketch.draw = () => {
			sketch.background(255, 0, 0);
			if (cubeMapTexture) cubeMapTexture.needsUpdate = true;
		}
	};
	p5Canvas = new p5(p5Sketch);

	cubeMapTexture = new THREE.CanvasTexture(p5Canvas.canvas);
	cubeMapTexture.mapping = THREE.CubeRefractionMapping;

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


	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);

//-------------------OBJECTS-------------------------

	const mat = new THREE.MeshLambertMaterial({envMap: cubeMapTexture})
	const icoGeom = new THREE.IcosahedronGeometry(400, 15);
	const icoMesh = new THREE.Mesh(icoGeom, mat);
	scene.add(icoMesh);

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