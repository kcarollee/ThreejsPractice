function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 5;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 2);

	const scene = new THREE.Scene();

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geom = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const mat = new THREE.MeshBasicMaterial({color: 0x44aa88});
	const cube = new THREE.Mesh(geom, mat);
	scene.add(cube);

	renderer.render(scene, camera);

	function render(time){
		time *= 0.001;

		cube.rotation.x = time;
		cube.rotation.y = time;

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();