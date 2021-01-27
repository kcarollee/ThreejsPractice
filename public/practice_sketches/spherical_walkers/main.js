import * as THREE from "https://cdn.jsdelivr.net/npm/three@v0.124.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {SceneUtils} from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/utils/SceneUtils.js";
class Walker {
    constructor(trailNum, movementRadius, scene) {
        this.trailNum = trailNum;
        
        this.lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff * Math.random(),
            linewidth: 5
        });

        this.colorMat = new THREE.MeshBasicMaterial({
            color: 0xffffff * Math.random(),
        });
        
        this.movementRadius = movementRadius;
        this.sphereArr = [];

        this.startRand = Math.random() * 100.0;
        this.noiseStep = 0.01;
        this.pointArr = [];

        var randDeg1, randDeg2;
        for (let i = 0; i < this.trailNum; i++) {
            var sphereGeo = new THREE.SphereGeometry(0.1, 5, 5);
            var sphere = new SceneUtils.createMultiMaterialObject(sphereGeo, [this.colorMat]);
            randDeg1 = noise.simplex2(this.noiseStep * i, 0) * Math.PI * 2;
            randDeg2 = noise.simplex2(this.startRand + this.noiseStep * i, 0) * Math.PI * 2;
            var pos = this.getPos(randDeg1, randDeg2);
            
            sphere.position.set(pos[0], pos[1], pos[2]);
            
            scene.add(sphere);
            this.sphereArr.push(sphere);

            var point = new THREE.Vector3(pos[0], pos[1], pos[2]);
            this.pointArr.push(point);
        }

        this.lineGeo = new THREE.BufferGeometry().setFromPoints(this.pointArr);
        this.line =  new THREE.Line(this.lineGeo, this.lineMat);
        scene.add(this.line);
        this.positionVec3Arr = [];
    }

    getPos(deg1, deg2){
        var x = this.movementRadius * Math.cos(deg1) * Math.cos(deg2);
        var y = this.movementRadius * Math.sin(deg1) * Math.cos(deg2);
        var z = this.movementRadius * Math.sin(deg2);
        
        return [x, y, z];
    }

    update(step) {
        step *= 0.1;
        var randDeg1, randDeg2;
        for (let i = 0; i < this.sphereArr.length; i++) {
            randDeg1 = noise.simplex2(this.noiseStep * i + step, this.startRand) * Math.PI * 2;
            randDeg2 = noise.simplex2(this.startRand + this.noiseStep * i + step, this.startRand) * Math.PI * 2;
            var pos = this.getPos(randDeg1, randDeg2);
            this.sphereArr[i].position.set(pos[0], pos[1], pos[2]);
            this.pointArr[i].set(pos[0], pos[1], pos[2]);
            
        }
        this.lineGeo.setFromPoints(this.pointArr);
        
    }
}

Walker.depthMat = new THREE.MeshDepthMaterial();

function init() {
    noise.seed(Math.random());
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    var gui = new dat.GUI();

    var walkerArr = [];

    var walkerNum = 10;
    for (let i = 0; i < walkerNum; i++){
        var w = new Walker(10,  (i + 1) * 2, scene);
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