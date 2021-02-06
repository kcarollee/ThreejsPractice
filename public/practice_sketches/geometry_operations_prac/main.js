import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
class CustomSphere {
    constructor(){
        
    }
}
function init() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    var gui = new dat.GUI();

    scene.add(camera);

    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;

    var orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    var sg1 = new THREE.SphereGeometry(7, 60, 60);
    var sg2 = new THREE.SphereGeometry(7, 60, 60);
    var c1 = new THREE.BoxGeometry(10, 50, 10, 20, 20, 20);
    var sm = new THREE.MeshStandardMaterial({color: 0xFF0000});
    sm.side = THREE.DoubleSide;
    var s1 = new THREE.Mesh(sg1, sm);
    var s2 = new THREE.Mesh(sg2, sm);
    var c1 = new THREE.Mesh(c1, sm);
    s1.position.set(-5, 0, 0);
    s2.position.set(0, 0, 0);
    c1.position.set(5, 0, 0);
    //scene.add(s1, s2);

    var s1BSP = new ThreeBSP(s1);
    var s2BSP = new ThreeBSP(s2);
    var c1BSP = new ThreeBSP(c1);
    var resultBSP;
    var result;
    resultBSP = c1BSP.subtract(s1BSP);
    result = resultBSP.toMesh(new THREE.MeshLambertMaterial({
        //wireframe: true,
        flatShading: true
    }));
    result.geometry.computeFaceNormals();
    result.geometry.computeVertexNormals();
    

    var pointLight = new THREE.PointLight();
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);
    scene.add(result);
    s2.visible = false;
    s1.visible = false;
    c1.visible = false;
    document.body.appendChild(renderer.domElement);

    renderScene();

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
    }
    gui.add(controls, 'outputObj');

    var step = 0;
    function animateScene() {
        step++;
    }

    function renderScene() {
        animateScene();
        stats.update();
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

    function initStats() {
        var stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        return stats;
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize, false);
}



window.onload = init;