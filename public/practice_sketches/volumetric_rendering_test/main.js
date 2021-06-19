
import {OrbitControls} from "../../../../node_modules/three/build/three.module.js";
import {ImprovedNoise} from "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/math/ImprovedNoise.js";
// basically a copy and paste of https://github.com/mrdoob/three.js/blob/master/examples/webgl2_volume_perlin.html
function main(){
	const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setPixelRatio(window.innerWidth, window.innerHeight);

//CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 2);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
    renderer.render(scene, camera);
    
// TEXTURE
    const size = 128;
    const data = new Uint8Array(size * size * size); // 3 dimensional array flattened
    
    let i = 0;
    const perlin = new ImprovedNoise();
    const vector = new THREE.Vector3();

    // filling the data array with values
    for (let z = 0; z < size; z++){
        for (let y = 0; y < size; y++){
            for (let x = 0; x < size; x++){
                vector.set(x, y, z).divideScalar(size);
                const d = perlin.noise(vector.x * 6.5, vector.y * 6.5, vector.z * 6.5);
                data[i++] = d * 128 + 128;
            }
        }
    }

    const texture = new THREE.DataTexture3D(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1; // 4 b y default. 
    
// MATERIAL

    // your run of the mill vert shader. 
    const vertexShader = `
        in vec3 position;
        uniform mat4 modelMatrix;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
        uniform vec3 cameraPos;
        
        // view origin (camera position) and view direction must be sent to the fragment shader.
		out vec3 vOrigin;
		out vec3 vDirection;
		void main() {
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
			vDirection = position - vOrigin;
			gl_Position = projectionMatrix * mvPosition;
		}


    `;

    const fragmentShader = `
        precision highp float;
		precision highp sampler3D;
		uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        // sent from the vert shader with appropriate matrix multiplications
		in vec3 vOrigin;
        in vec3 vDirection;
        
        out vec4 color;
        
        // 
        uniform sampler3D map;
        
       
		uniform float threshold;
        uniform float steps;
        
        vec2 hitBox( vec3 orig, vec3 dir ) {
						const vec3 box_min = vec3( - 0.5 );
						const vec3 box_max = vec3( 0.5 );
						vec3 inv_dir = 1.0 / dir;
						vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
						vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
						vec3 tmin = min( tmin_tmp, tmax_tmp );
						vec3 tmax = max( tmin_tmp, tmax_tmp );
						float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
						float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
						return vec2( t0, t1 );
					}
					float sample1( vec3 p ) {
						return texture( map, p ).r;
					}
					#define epsilon .0001
					vec3 normal( vec3 coord ) {
						if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
						if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
						if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
						if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
						if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
						if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );
						float step = 0.01;
						float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
						float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
						float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );
						return normalize( vec3( x, y, z ) );
					}
					void main(){
						vec3 rayDir = normalize( vDirection );
						vec2 bounds = hitBox( vOrigin, rayDir );
						if ( bounds.x > bounds.y ) discard;
						bounds.x = max( bounds.x, 0.0 );
						vec3 p = vOrigin + bounds.x * rayDir;
						vec3 inc = 1.0 / abs( rayDir );
						float delta = min( inc.x, min( inc.y, inc.z ) );
						delta /= steps;
						for ( float t = bounds.x; t < bounds.y; t += delta ) {
							float d = sample1( p + 0.5 );
							if ( d > threshold ) {
								color.rgb = normal( p + 0.5 ) * 0.5 + ( p * 1.5 + 0.25 );
								color.a = 1.;
								break;
							}
							p += rayDir * delta;
						}
						if ( color.a == 0.0 ) discard;
					}
    `;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms:{
            map: {value: texture},
            cameraPos: {value: new THREE.Vector3()},
            threshold: {value: 0.6},
            steps: {value: 200}
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        
    });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

	
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
		mesh.material.uniforms.cameraPos.value.copy( camera.position );
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