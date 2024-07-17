import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 참고한 링크:
// https://iconscout.com/blog/export-gltf-files-from-blender
// https://stackoverflow.com/questions/60704912/play-a-gltf-animation-three-js

//index.html도 중요한데 일단 전 three.js 최신 CDN을 임포트해서 썼습니다. 
/*
이렇게 그대로 가져오는게 속편할거에요: 

<script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/"
        }
      }
</script>

그리고 이 페이지 상단처럼 import로 THREE와 GLTFLoader를 가져오면 됩니다. 
*/

function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

	//CAMERA
	
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 10);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);

	// GLTF LOADER
	const loader = new GLTFLoader();

	// 이 THREE.AnimationMixer가 있어야 블렌더에서 만들어낸 애니메이션을 재생할 수 있습니다. 
	let mixer;

	loader.load( 'testcube.glb', function ( gltf ) {
		
		mixer = new THREE.AnimationMixer(gltf.scene);
		let action = mixer.clipAction(gltf.animations[0]);
		action.play();
		scene.add( gltf.scene );

	}, undefined, function ( error ) {
		console.error( error );
	});

	// 위에 블락 주석처리하고 다음 코드 블락들을 실행시키면 외부 링크에서도 gltf 모델들을 가져와 줍니다. 
	// // 회전하는 큐브 
	// loader.load( 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AnimatedCube/glTF/AnimatedCube.gltf', function ( gltf ) {
		
	// 	mixer = new THREE.AnimationMixer(gltf.scene);
	// 	let action = mixer.clipAction(gltf.animations[0]);
	// 	action.play();
	// 	scene.add( gltf.scene );

	// }, undefined, function ( error ) {
	// 	console.error( error );
	// });

	
	// // 여우
	// loader.load( 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF/Fox.gltf', function ( gltf ) {
		
	// 	mixer = new THREE.AnimationMixer(gltf.scene);
	// 	let action = mixer.clipAction(gltf.animations[0]);
	// 	action.play();
	// 	gltf.scene.scale.set(0.05, 0.05, 0.05);
	// 	scene.add( gltf.scene );

	// }, undefined, function ( error ) {
	// 	console.error( error );
	// });


	function render(time){
		time *= 0.001;

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		// 믹서를 업데이트를 해줘야 애니메이션이 재생됩니다. 매개변수는 재생 속도라고 보시면 됩니다. 
		if (mixer) mixer.update(0.01);
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