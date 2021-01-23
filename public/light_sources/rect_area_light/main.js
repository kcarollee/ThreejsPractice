
function init(){
  
	var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  var stats = initStats();
  var renderer = new THREE.WebGLRenderer();
  var gui = new dat.GUI();
  
  scene.add(camera);
  
  renderer.setClearColor(0xEEEEEE, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  
  camera.position.set(-10, -60, 70);
  camera.lookAt(scene.position);
  

  var planeGeo = new THREE.PlaneGeometry(50, 50);
  var planeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    reflectivity: 2.0
  });
  var plane = new THREE.Mesh(planeGeo, planeMat);

  var sphereGeo = new THREE.SphereGeometry(5, 100);
  var sphereMat = new THREE.MeshStandardMaterial({
    color: 0x1cff1c,
    roughness: 0.1,
    emissive: 0xff1c1c,
    emissiveIntensity: 0.5,
    //metalness: 0.2
  });
  var sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.set(0, 0, 20);
  scene.add(sphere);
  //plane.receiveShadow = true;
  scene.add(plane);

  var rectLight = new THREE.RectAreaLight(0xffffff, 5, 30, 30);
  rectLight.position.set(0, 0, 60);
  rectLight.lookAt(0, 0, 0);
  scene.add(rectLight);


  document.body.appendChild(renderer.domElement);
  
  renderScene();

  var controls = new function(){
    this.outputObj = function(){
      console.log(scene.children);
    }
  }
  gui.add(controls, 'outputObj');
  
  var step = 0;
  function animateScene(){
    step += 0.01;
    sphere.rotation.x = step;
    sphere.rotation.y = step;
    sphere.rotation.z = step;
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