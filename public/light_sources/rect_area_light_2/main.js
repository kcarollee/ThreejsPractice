import * as THREE from "https://cdn.jsdelivr.net/npm/three@v0.124.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {RectAreaLightUniformsLib} from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightHelper} from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/helpers/RectAreaLightHelper.js";
function init(){
  
	var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  var stats = initStats();
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  //var gui = new dat.GUI();
  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  
  var orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.target.copy(scene.position);
  orbitControls.update();
  
  //renderer.setClearColor(0xEEEEEE, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //renderer.outputEncoding = THREE.sRGBEndocing;
  
  camera.position.set(-50, 30, 50);
  camera.lookAt(scene.position);
  scene.add(camera);
  
  
  var planeGeo = new THREE.PlaneGeometry(70, 70, 1, 1);
  var planeMat = new THREE.MeshStandardMaterial({
    roughness: 0.044676705160855,
    metalness: 0.0,
    color:0xA00c000
  });
  var plane = new THREE.Mesh(planeGeo, planeMat);

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  scene.add(plane);

  var spotLight0 = new THREE.SpotLight(0xcccccc);
  spotLight0.position.set(-40, 60, -10);
  spotLight0.intensity = 0.1;
  spotLight0.lookAt(plane);
  scene.add(spotLight0);

  var areaLight1 = new THREE.RectAreaLight(0xff0000, 500, 4, 10);
  areaLight1.position.set(-10, 10, -35);
  scene.add(areaLight1);

  var areaLight2 = new THREE.RectAreaLight(0x00ff00, 500, 4, 10);
  areaLight2.position.set(0, 10, -35);
  scene.add(areaLight2);

  var areaLight3 = new THREE.RectAreaLight(0x0000ff, 500, 4, 10);
  areaLight3.position.set(10, 10, -35);
  scene.add(areaLight3);

  var planeGeometry1 = new THREE.BoxGeometry(4, 10, 0);
  var planeGeometry1Mat = new THREE.MeshBasicMaterial({
    color: 0xff0000
  });
  var plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
  plane1.position.copy(areaLight1.position);
  scene.add(plane1);

  var planeGeometry2 = new THREE.BoxGeometry(4, 10, 0);
  var planeGeometry2Mat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  var plane2 = new THREE.Mesh(planeGeometry2, planeGeometry2Mat);

  plane2.position.copy(areaLight2.position);
  scene.add(plane2);

  var planeGeometry3 = new THREE.BoxGeometry(4, 10, 0);
  var planeGeometry3Mat = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
  var plane3 = new THREE.Mesh(planeGeometry3, planeGeometry3Mat);

  plane3.position.copy(areaLight3.position);
  scene.add(plane3);

  var controls = new function () {
    this.rotationSpeed = 0.02;
    this.color1 = 0xff0000;
    this.intensity1 = 500;
    this.color2 = 0x00ff00;
    this.intensity2 = 500;
    this.color3 = 0x0000ff;
    this.intensity3 = 500;
  };

  var gui = new dat.GUI();
  gui.addColor(controls, 'color1').onChange(function (e) {
    areaLight1.color = new THREE.Color(e);
    planeGeometry1Mat.color = new THREE.Color(e);
    scene.remove(plane1);
    plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
    plane1.position.copy(areaLight1.position);
    scene.add(plane1);

  });
  gui.add(controls, 'intensity1', 0, 1000).onChange(function (e) {
    areaLight1.intensity = e;
  });
  gui.addColor(controls, 'color2').onChange(function (e) {
    areaLight2.color = new THREE.Color(e);
    planeGeometry2Mat.color = new THREE.Color(e);
    scene.remove(plane2);
    plane2 = new THREE.Mesh(planeGeometry2, planeGeometry2Mat);
    plane2.position.copy(areaLight2.position);
    scene.add(plane2);
  });
  gui.add(controls, 'intensity2', 0, 1000).onChange(function (e) {
    areaLight2.intensity = e;
  });
  gui.addColor(controls, 'color3').onChange(function (e) {
    areaLight3.color = new THREE.Color(e);
    planeGeometry3Mat.color = new THREE.Color(e);
    scene.remove(plane3);
    plane3 = new THREE.Mesh(planeGeometry1, planeGeometry3Mat);
    plane3.position.copy(areaLight3.position);
    scene.add(plane3);
  });
  gui.add(controls, 'intensity3', 0, 1000).onChange(function (e) {
    areaLight3.intensity = e;
  });


  document.body.appendChild(renderer.domElement);
  renderScene();
  var step = 0;
  function animateScene(){
    step += 0.01;
    

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