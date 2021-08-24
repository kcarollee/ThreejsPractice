// https://stackoverflow.com/questions/42562056/how-to-use-rendering-result-of-scene-as-texture-in-threejs
// https://threejs.org/examples/webgl_rtt.html
function main(){
	let step = 0;
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});




//CAMERA
	const cameraArr = [];
	const fov = 75;
	const aspect = canvas.clientWidth / canvas.clientHeight; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera1 = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera1.position.set(0, 0, 10);
	camera2.position.set(0, 0, -30);
	
	camera2.lookAt(new THREE.Vector3(0, 0, 0)); 

	cameraArr.push(camera1, camera2);
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	
//RENDERTARGETS
	const renderTarget0 = new THREE.WebGLRenderTarget(canvas.clientWidth , canvas.clientHeight );
	const renderTarget1 = new THREE.WebGLRenderTarget(canvas.clientWidth , canvas.clientHeight );

//GEOMETRIES

	const cubeMat = new THREE.MeshNormalMaterial();
	const cubeGeom = new THREE.BoxGeometry(1, 1, 1);
	const cubeNum = 1000;
	for (let i = 0; i < cubeNum; i++){
		const cube = new THREE.Mesh(cubeGeom, cubeMat);
		cube.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
		cube.scale.set(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5);
		scene.add(cube);
	}
	

	const planeGeom = new THREE.PlaneGeometry(10, 10, 10);
	const planeMat = new THREE.MeshBasicMaterial({
		map: renderTarget0.texture,
		side: THREE.DoubleSide
	});
	const plane = new THREE.Mesh(planeGeom, planeMat);
	//plane.rotation.set(0, 0, 0);
	scene.add(plane);
	
	

	
//GUI
	const gui = new dat.GUI();
	const controls = new function(){
		
		this.debug = function(){

		}
	}

	
	gui.add(controls, 'debug');


	let tick = true;
	function render(time){
		time *= 0.001;
		step += 1;
		

		
		renderer.setRenderTarget(renderTarget0);
		renderer.clear();
		renderer.render(scene, camera2);

		camera2.position.set(0, 0, -30 + 15 * Math.sin(step * 0.1));

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera1.aspect = canvas.clientWidth / canvas.clientHeight;
			camera1.updateProjectionMatrix();
		}

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene, camera1);

		
		requestAnimationFrame(render);
		

		
		
		/*
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
		*/
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