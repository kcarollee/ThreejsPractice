import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    //CAMERA
    const fov = 90;
    const aspect = 2; // display aspect of the canvas
    const near = 0.0001;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    renderer.render(scene, camera);
    renderer.setPixelRatio(window.devicePixelRatio);

    // TEXTURE
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const cubeEnvMap = cubeTextureLoader.load([
        "./assets/envMaps/cubeMap3/px.png",
        "./assets/envMaps/cubeMap3/nx.png", // Positive/Negative X
        "./assets/envMaps/cubeMap3/py.png",
        "./assets/envMaps/cubeMap3/ny.png", // Positive/Negative Y
        "./assets/envMaps/cubeMap3/pz.png",
        "./assets/envMaps/cubeMap3/nz.png", // Positive/Negative Z
    ]);
    cubeEnvMap.mapping = THREE.CubeReflectionMapping;
    const objMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        reflectivity: 1.0,
        refractionRatio: 0.95,
        transparent: true,
        shininess: 100,
        envMap: cubeEnvMap,
        side: THREE.DoubleSide,
    });

    const light = new THREE.PointLight();
    light.intensity = 10;
    light.position.set(0, 0, 2);
    scene.add(light);
    let objMeshArr = [];

    const objLoader = new OBJLoader();
    objLoader.load("./assets/models/d2.obj", function (object) {
        console.log(object);
        let objMesh = object.children[0];
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = objMaterial;
                child.geometry.setDrawRange(0, 0);
            }
        });
        objMeshArr.push(objMesh);
        scene.add(object);
    });

    // objLoader.load("./assets/models/l.obj", function (object) {
    //     console.log(object);
    //     let objMesh = object.children[0];
    //     object.traverse((child) => {
    //         if (child.isMesh) {
    //             child.material = objMaterial;
    //             // child.geometry.setDrawRange(0, 0);
    //         }
    //     });
    //     objMeshArr.push(objMesh);
    //     scene.add(object);
    // });

    // POST PROCESSING
    const composer = new EffectComposer(
        renderer,
        new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        })
    );
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    console.log(CustomShader);
    const shaderPass = new ShaderPass(CustomShader);
    shaderPass.enabled = true;
    composer.addPass(shaderPass);
    //GUI
    // const gui = new dat.GUI();
    // const controls = new (function () {
    //     this.outputObj = function () {
    //         scene.children.forEach((c) => console.log(c));
    //     };
    // })();
    // gui.add(controls, "outputObj");

    const clock = new THREE.Clock();

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.maxPolarAngle = Math.PI * 0.5;
    orbitControls.minPolarAngle = Math.PI * 0.25;
    orbitControls.minAzimuthAngle = -Math.PI / 4; // -45 degrees
    orbitControls.maxAzimuthAngle = Math.PI / 4; // 45 degrees

    orbitControls.screenSpacePanning = false;
    orbitControls.enablePan = false;
    orbitControls.enabled = true;
    orbitControls.update();
    // test render
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const testMesh = new THREE.Mesh(boxGeo, boxMat);

    // scene.add(testMesh);
    let count = 0;
    let shaderPassView = false;
    function render() {
        orbitControls.update();
        objMeshArr.forEach(function (objMesh) {
            objMesh.geometry.setDrawRange(0, count);
            // objMesh.rotateX(0.001);
        });

        count += 30;
        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        //renderer.render(scene, camera);
        if (count % 100 == 0) shaderPassView = !shaderPassView;
        if (shaderPassView) composer.render();
        else renderer.render(scene, camera);

        // testMesh.rotateX(0.01);
        count++;
        requestAnimationFrame(render);
    }

    function resizeRenderToDisplaySize(renderer) {
        // fpControls.handleResize();
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
        const height = (canvas.clientHeight * pixelRatio) | 0; // 0
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    requestAnimationFrame(render);
}
main();
