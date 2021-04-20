import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

function init() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    var gui = new dat.GUI();
    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var cubeGeom = new THREE.BoxGeometry(1, 1, 1);
    var cubeMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var planeGeom = new THREE.PlaneGeometry(80, 80);
    var planeMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    var plane = new THREE.Mesh(planeGeom, planeMat);
    plane.name = "plane";
    //plane.rotateX(Math.PI * 0.5);
    scene.add(plane);
    var debugCube = new THREE.Mesh(cubeGeom, cubeMat);
    scene.add(debugCube);
    scene.add(camera);

    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;

    /*
    var orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();
    */
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    camera.lookAt(scene.position);

    document.body.appendChild(renderer.domElement);

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
    }
    gui.add(controls, 'outputObj');


    renderScene();
    var step = 0;
    function animateScene() {
        step++;
        var intersects = raycaster.intersectObjects(scene.children);
        
        intersects.forEach(function (p){
            if (p.object.name == "plane"){
                var point = p.point;
                debugCube.position.set(point.x, point.y, point.z);
            }
        });
    }

    function renderScene() {
        raycaster.setFromCamera(mouse, camera);
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

    function onMouseMove(){
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //debugCube.position.set(mouse.x, mouse.y);
    }

    window.addEventListener('resize', onResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
}



window.onload = init;