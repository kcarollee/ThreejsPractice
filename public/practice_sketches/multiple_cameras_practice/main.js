function main(){
	let step = 0;
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const cameraArr = [];
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera1.position.set(0, 0, 20);
	camera2.position.set(0, 0, -20);
	camera2.position.lookAt = new THREE.Vector3(0, 0, 0);

	cameraArr.push(camera1, camera2);
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera1);

//GEOMETRIES
	const cubeMat = new THREE.MeshNormalMaterial();
	const cubeGeom = new THREE.BoxGeometry(10, 10, 10);
	const cube = new THREE.Mesh(cubeGeom, cubeMat);
	scene.add(cube);

	
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
		step += 1;

		/*
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera1.aspect = canvas.clientWidth / canvas.clientHeight;
			camera1.updateProjectionMatrix();
		}
		renderer.render(scene, camera1);
		requestAnimationFrame(render);
		*/
		cameraArr.forEach(function(c, i){
			if (i == 0){
				renderer.setViewport(0, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissor(0, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissorTest(true);
				renderer.setClearColor(scene.background);

				c.aspect = canvas.clientWidth / canvas.clientHeight;
				c.updateProjectionMatrix();
				renderer.render(scene, c);
			}
			else{
				renderer.setViewport(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissor(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 1 * window.innerHeight);
				renderer.setScissorTest(true);
				renderer.setClearColor(new THREE.Color(0xFFFFFF));

				c.aspect = canvas.clientWidth / canvas.clientHeight;
				c.updateProjectionMatrix();
				renderer.render(scene, c);
			}
		});
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