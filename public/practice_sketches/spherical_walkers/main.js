//import * as THREE from "https://cdn.jsdelivr.net/npm/three@v0.124.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {SceneUtils} from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/utils/SceneUtils.js";
//import EffectComposer from "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/postprocessing/EffectComposer.js";
//import Composer from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/postprocessing/RenderPass.js";
class Walker {
    constructor(trailNum, movementRadius, scene) {
        this.trailNum = trailNum;
        
        this.lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff * Math.random(),
            linewidth: Walker.linewidth
        });

        this.colorMat = new THREE.MeshStandardMaterial({
            color: 0xffffff * Math.random(),
            roughness: 0.1
        });
        
        this.movementRadius = movementRadius;
        this.sphereArr = [];

        this.startRand = Math.random() * 100.0;
       
        this.pointArr = [];

        var randDeg1, randDeg2;
        for (let i = 0; i < this.trailNum; i++) {
            var sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
            var sphere = new SceneUtils.createMultiMaterialObject(sphereGeo, [this.colorMat]);
            randDeg1 = noise.simplex2(Walker.noiseStep * i, 0) * Math.PI * 2;
            randDeg2 = noise.simplex2(this.startRand + Walker.noiseStep * i, 0) * Math.PI * 2;
            var pos = this.getPos(randDeg1, randDeg2);
            
            sphere.position.set(pos[0], pos[1], pos[2]);
            
            //scene.add(sphere);
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
        var vel =  step * 0.01;
        var randDeg1, randDeg2;
        var i = step % Walker.modBy;

        for (; i < this.sphereArr.length; i += Walker.modBy) {
            randDeg1 = noise.simplex2(Walker.noiseStep * i + vel, this.startRand) * Math.PI * 2;
            randDeg2 = noise.simplex2(this.startRand + Walker.noiseStep * i + vel, this.startRand) * Math.PI * 2;
            var pos = this.getPos(randDeg1, randDeg2);
            //this.sphereArr[i].position.set(pos[0], pos[1], pos[2]);
            this.pointArr[i].set(pos[0], pos[1], pos[2]);
            
        }
        this.lineGeo.setFromPoints(this.pointArr);
        
        
    }
}
Walker.depthMat = new THREE.MeshDepthMaterial();
Walker.noiseStep = 0.01;
Walker.modBy = 1;
Walker.linewidth = 1;

const params = {
				exposure: 1,
				bloomStrength: 1.5,
				bloomThreshold: 0,
				bloomRadius: 0
			};
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

    var walkerNum = 10;
    var sphereMaxRadius = 50;
    var gapSize = sphereMaxRadius / walkerNum;
    var walkerNumPerRadius = 1;
    for (let i = 0; i < walkerNum; i++){
        for (let j = 0; j < walkerNumPerRadius; j++){
            var w = new Walker(30,  (i + 1) * gapSize, scene);
            walkerArr.push(w);
        }
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
        color: 0xffffff,
        instensity: 0.0
    });
    //scene.add(ambLight);
    var spotLight = new THREE.SpotLight({
        color: 0xffffff,
        intensity: 3.0
    });
    
    spotLight.position.set(0, 0, 100);
    scene.add(spotLight);

    var composer = new THREE.EffectComposer(renderer);
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;
    composer.addPass(bloomPass);

    document.body.appendChild(renderer.domElement);

    renderScene();

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
        this.noiseStep = 0.1;
        this.indexMod = 1;
        this.lineWidth = 1;
    }
    gui.add(controls, 'outputObj');
    
    gui.add(controls, 'noiseStep', 0.001, 0.1).onChange(function(e){
        Walker.noiseStep = e;
    });
    gui.add(controls, 'indexMod', 1, 10).onChange(function(e){
        Walker.modBy = Math.floor(e);
    });
    gui.add(controls, 'lineWidth', 1, 10).onChange(function(e){
        Walker.modBy = Math.floor(e);
    });

    var step = 0;
    function animateScene() {
        step++;
        spotLight.position.set(0, 0, 10);
        walkerArr.forEach(w => w.update(step));
    }

    var clock = new THREE.Clock();
    
    function renderScene() {
        
        //var delta = clock.getDelta();
        animateScene();
        stats.update();
        requestAnimationFrame(renderScene);
        //renderer.render(scene, camera);
        composer.render();
        
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