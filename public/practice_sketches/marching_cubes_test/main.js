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