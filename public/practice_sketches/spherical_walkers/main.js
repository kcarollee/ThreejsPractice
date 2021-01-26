import * as THREE from "https://cdn.jsdelivr.net/npm/three@v0.124.0/build/three.module.js";
import {
    OrbitControls
} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

class Walker {
    constructor(trailNum, movementRadius, scene) {
        this.trailNum = trailNum;
        this.deg = 0;
        this.degInc = 0.1;
        this.noiseRadius;
        this.sphereArr = [];
        this.noiseInc = 0.03;
        this.startRand = Math.random() * 100.0;
        for (let i = 0; i < this.trailNum; i++) {
            var sphereGeo = new THREE.SphereGeometry(0.5, 10, 10);
            var sphereMat = new THREE.MeshBasicMaterial({
                color: 0xffffff
            });
            var sphere = new THREE.Mesh(sphereGeo, sphereMat);
            this.noiseRadius = 10 * noise.simplex2(this.startRand + i * this.noiseInc, 0) + 10;
            
            sphere.position.set(this.noiseRadius * Math.cos(this.startRand + this.deg), 
                this.noiseRadius * Math.sin(this.startRand + this.deg), 0);
            this.deg += this.degInc;
            scene.add(sphere);
            this.sphereArr.push(sphere);
        }
        this.movementRadius = movementRadius;
        this.positionVec3Arr = [];
    }

    update(step) {
        this.deg = 0;
        var noiseInc = 0.01;
        for (let i = 0; i < this.sphereArr.length; i++){
            this.noiseRadius = 10 * noise.simplex2(this.startRand + i * this.noiseInc + step, 0) + 10;
            this.sphereArr[i].position.set(this.noiseRadius * Math.cos(this.startRand + this.deg + step), 
                this.noiseRadius * Math.sin(this.startRand + this.deg + step), this.noiseRadius - 10);
            this.deg += this.degInc;
        }
    }
}
Walker.mat = new THREE.MeshBasicMaterial({
    color: 0xcccccc
});

function init() {
    noise.seed(Math.random());
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    var gui = new dat.GUI();

    var walkerArr = [];

    var walkerNum = 30;
    for (let i = 0; i < walkerNum; i++){
        var w = new Walker(10, 10, scene);
        walkerArr.push(w);
    }

    scene.add(camera);

    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;

    var orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();

    camera.position.set(0, 0, 100);

    camera.lookAt(scene.position);

    var ambLight = new THREE.AmbientLight({
        color: 0xffffff
    });
    

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
        step += 0.1;
        
        walkerArr.forEach(w => w.update(step * 0.1));
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