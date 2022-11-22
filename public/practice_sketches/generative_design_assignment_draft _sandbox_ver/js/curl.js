function simplexNoise(vec) {
  let sample0 = noise.simplex3(vec.x, vec.y, vec.z);
  let sample1 = noise.simplex3(vec.y - 19.1, vec.z + 33.4, vec.x + 47.2);
  let sample2 = noise.simplex3(vec.z + 74.2, vec.x - 124.5, vec.y + 99.4);
  return new THREE.Vector3(sample0, sample1, sample2);
}

function curlNoise(p) {
  let e = 0.1;
  let dx = new THREE.Vector3(e, 0.0, 0.0);
  let dy = new THREE.Vector3(0.0, e, 0.0);
  let dz = new THREE.Vector3(0.0, 0.0, e);

  let p_x0 = simplexNoise(p.clone().sub(dx));
  let p_x1 = simplexNoise(p.clone().add(dx));
  let p_y0 = simplexNoise(p.clone().sub(dy));
  let p_y1 = simplexNoise(p.clone().add(dy));
  let p_z0 = simplexNoise(p.clone().sub(dz));
  let p_z1 = simplexNoise(p.clone().add(dz));

  let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  let divisor = 1.0 / (2.0 * e);
  let resVec = new THREE.Vector3(x, y, z);
  resVec.multiplyScalar(divisor);
  resVec.normalize();
  return resVec;
}

function computeCurl2(x, y, z) {
  let p = new THREE.Vector3(x, y, z);
  return curlNoise(p);
}

function computeCurl(x, y, z) {
  // offset?
  var eps = 0.0001;

  var curl = new THREE.Vector3();

  //Find rate of change in YZ plane
  var n1 = noise.simplex3(x, y + eps, z);
  var n2 = noise.simplex3(x, y - eps, z);
  //Average to find approximate derivative
  var a = (n1 - n2) / (2 * eps);
  var n1 = noise.simplex3(x, y, z + eps);
  var n2 = noise.simplex3(x, y, z - eps);
  //Average to find approximate derivative
  var b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = noise.simplex3(x, y, z + eps);
  n2 = noise.simplex3(x, y, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x + eps, y, z);
  n2 = noise.simplex3(x - eps, y, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noise.simplex3(x + eps, y, z);
  n2 = noise.simplex3(x - eps, y, z);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x, y + eps, z);
  n2 = noise.simplex3(x, y - eps, z);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}
