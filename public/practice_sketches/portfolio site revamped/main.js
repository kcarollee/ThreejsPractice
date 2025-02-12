import * as THREE from "three";

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
    camera.position.set(0, 0, 2);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    renderer.render(scene, camera);

    //GUI
    // const gui = new dat.GUI();
    // const controls = new (function () {
    //     this.outputObj = function () {
    //         scene.children.forEach((c) => console.log(c));
    //     };
    // })();
    // gui.add(controls, "outputObj");

    const clock = new THREE.Clock();

    // test render
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const testMesh = new THREE.Mesh(boxGeo, boxMat);

    scene.add(testMesh);
    function render() {
        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        testMesh.rotateX(0.01);
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
