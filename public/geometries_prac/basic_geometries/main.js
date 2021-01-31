import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

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

    camera.position.x = -20;
    camera.position.y = 30;
    camera.position.z = 40;
    camera.lookAt(new THREE.Vector3(10, 0, 0));

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    scene.add(spotLight);

    var matArr = [];
    var meshMat = new THREE.MeshNormalMaterial();
    meshMat.side = THREE.DoubleSide;

    var wireFrameMat = new THREE.MeshBasicMaterial({color: 0x000000});
    wireFrameMat.wireframe = true;

    matArr.push(meshMat);
    matArr.push(wireFrameMat);
    var planeGeo = new THREE.PlaneGeometry(10, 14, 4, 4);
    var plane = new THREE.Mesh(planeGeo, matArr);

    scene.add(plane);
    document.body.appendChild(renderer.domElement);

    renderScene();

    var controls = new function() {
        
        this.normalWireFrame = true;
        this.basicWireFrame = true;
        this.geometries = "plane";
    }
    gui.add(controls, 'normalWireFrame').onChange(e => {
        this.normalWireFrame = e;
        meshMat.wireframe = this.normalWireFrame;
    });
    gui.add(controls, 'basicWireFrame').onChange(e => {
        this.basicWireFrame = e;
        wireFrameMat.wireframe = this.basicWireFrame;
    });
    gui.add(controls, 'geometries', ["plane", "circle"]).onChange(e => {
        
        switch(e){
            case "plane":
                break;
            case "circle":
                break;
        }
    });

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