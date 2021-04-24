function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 20);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFFAAAA);
	renderer.render(scene, camera);

	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}

		

		this.boxProperties = {
			width: 8,
			height: 8,
			depth: 8
		}

		this.circleProperties = {
			radius: 7,
			segments: 24
		}
	}
	gui.add(controls, 'outputObj');

	let currentMesh;

	const mat = new THREE.MeshNormalMaterial();

	//---------------------BOXGEOMETRY----------------------------
	{
		const properties = controls.boxProperties;
		const boxGeom = new THREE.BoxGeometry(properties.width, 
										properties.height, 
										properties.depth);
		const box = new THREE.Mesh(boxGeom, mat);
		currentMesh = box;
		scene.add(box);

		const boxFolder = gui.addFolder('BoxGeometry');
		boxFolder.add(properties, 'width', 1, 10).onChange(e => updateGeometry(box, new THREE.BoxGeometry(properties.width, 
											properties.height, 
											properties.depth)));
		boxFolder.add(properties, 'height', 1, 10).onChange(e => updateGeometry(box, new THREE.BoxGeometry(properties.width, 
											properties.height, 
											properties.depth)));
		boxFolder.add(properties, 'depth', 1, 10).onChange(e => updateGeometry(box, new THREE.BoxGeometry(properties.width, 
											properties.height, 
											properties.depth)));
	}
	//------------------------------------------------------
	//-------------------CIRCLEGEOMETRY--------------------------
	{
		const properties = controls.circleProperties;
		const circleGeom = new THREE.CircleGeometry(properties.radius, properties.segments);
		const circle = new THREE.Mesh(circleGeom, mat);
		circle.visible = false;
		scene.add(circle);
	}
	//-----------------------------------------------------------

	function render(time){
		time *= 0.001;
		animateMesh(currentMesh, time);
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	function animateMesh(mesh, time){
		mesh.rotation.x = time;
		mesh.rotation.y = time;
	}

	function updateGeometry(mesh, geometry){
		mesh.geometry.dispose();
		mesh.geometry = geometry;
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