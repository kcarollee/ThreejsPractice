import * as THREE from "https://cdn.jsdelivr.net/npm/three@v0.124.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

class Walker{
    constructor(trailNum, movementRadius, scene){
        this.trailNum = trailNum;
        for (let i = 0; i < this.trailNum; i++){
            var sphereGeo = new THREE.SphereGeometry(2, 10, 10);
            var sphereMat = new THREE.MeshBasicMaterial({color: 0xffffff});
            var sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.set(0, 4 * i, 0);
            scene.add(sphere);
        }
        this.movementRadius = movementRadius;
        this.positionVec3Arr = [];
    }

    update(){

    }
}
Walker.mat = new THREE.MeshBasicMaterial({color: 0xcccccc});
function init(){
    noise.seed(Math.random());
var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  var stats = initStats();
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var gui = new dat.GUI();
  
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

  var ambLight = new THREE.AmbientLight({color: 0xffffff});
  //scene.add(ambLight);
  var testWalker = new Walker(10, 10, scene);
  
  document.body.appendChild(renderer.domElement);
  
  renderScene();

  var controls = new function(){
    this.outputObj = function(){
      console.log(scene.children);
    }
  }
  gui.add(controls, 'outputObj');
  
  function animateScene(){
    
  }
  
  function renderScene(){
    animateScene();
    stats.update();
    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
  }
  
  function initStats(){
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    return stats;
  }
  
  function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  window.addEventListener('resize', onResize, false);
}

  
  
window.onload = init;