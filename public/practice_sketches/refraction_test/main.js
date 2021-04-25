import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

let p5Canvas; // a p5 canvas to be used as a texture
let canvasTexture;
function main(){
//----------------p5 SETUP---------------------------
	const p5Sketch = (sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(500, 500);
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
			if (canvasTexture) canvasTexture.needsUpdate = true;
		}
	};
	p5Canvas = new p5(p5Sketch);
    canvasTexture = new THREE.CanvasTexture(p5Canvas.canvas);
    canvasTexture.needsUpdate = true;
    console.log(canvasTexture);
	
//---------------------------------------------------

	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

    const vp = {
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: Math.min(devicePixelRatio, 2||1)
    }
    console.log(vp);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, vp.width / vp.height, 0.1, 1000);
    const orthoCamera = new THREE.OrthographicCamera(vp.width * -0.5, vp.width * 0.5, vp.height * 0.5, vp.height * -0.5, 1, 1000);
    orthoCamera.layers.set(1);
    renderer.setSize(vp.width, vp.height);
    renderer.setPixelRatio(vp.dpr);
    renderer.autoClear = false;

    const envFbo = new THREE.WebGLRenderTarget(vp.width * vp.dpr, vp.height * vp.dpr);
    
    const quadGeom = new THREE.PlaneBufferGeometry();
    const quadMat = new THREE.MeshBasicMaterial({map: canvasTexture});
    const quad = new THREE.Mesh(quadGeom, quadMat);
    quad.layers.set(1);
    //scene.add(quad);

    

	
//-------------------OBJECTS-------------------------
    const boxGeom = new THREE.BoxGeometry(50, 50, 50);
    const boxMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
    const box = new THREE.Mesh(boxGeom, boxMat);
    scene.add(box);
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
		
	}
	function render(time){
		time *= 0.001;
        //quad.rotation.x = time;

        
       

        renderer.render(scene, camera);
		renderer.clear();

        renderer.setRenderTarget(envFbo);
        renderer.render(scene, orthoCamera);

        renderer.setRenderTarget(null);
        renderer.render(scene, orthoCamera);
        renderer.clearDepth();

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