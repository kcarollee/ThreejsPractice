class RectangularSpiral {
  constructor(startPos, segmentLength, spiralCount) {
    this.startPos = startPos;

    this.spiralCount = spiralCount;
    this.segmentLength = segmentLength;

    this.boxGeometryHori = new THREE.BoxGeometry(
      this.segmentLength,
      this.segmentLength,
      this.segmentLength
    );

    this.boxGeometryVert = new THREE.BoxGeometry(
      this.segmentLength,
      this.segmentLength,
      this.segmentLength
    );

    this.boxGroup = new THREE.Group();
    this.boxGroup.name = "boxgroup";

    this.points = [];
    this.materialIndices = [];
    //console.log("HEY");
    this._plotSpiral(
      this.startPos.x,
      this.startPos.y,
      this.startPos.z,
      1,
      this.spiralCount
    );
    console.log(this.points);
    this.boxVisibleCount = 0;
    //this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

    //this.line = new THREE.Line(this.geometry, this.material);

    this.index = RectangularSpiral.spiralArr.length;
    this.boxGroup.index = this.index;
    RectangularSpiral.spiralArr.push(this);

    this.fullyLoaded = false;
    this.shiftCount = 0;
  }

  setRotation(x, y, z) {
    this.boxGroup.rotateX(x);
    this.boxGroup.rotateY(y);
    this.boxGroup.rotateZ(z);
    //console.log(this.boxGroup.matrixWorld);
  }

  setPosition(x, y, z) {
    this.boxGroup.position.set(x, y, z);
  }

  getAllVertices() {
    let quaternion = this.boxGroup.matrixWorld;
    let pointsCopyArr = [];
    this.points.forEach(function (p) {
      let pCopy = p.clone();
      pCopy.applyMatrix4(quaternion);
      pointsCopyArr.push(pCopy);
    });
    return pointsCopyArr;
  }

  // iter must always be given as 1
  _plotSpiral(x, y, z, iter, count) {
    //console.log(iter, count);
    if (iter > count) {
      console.log(iter);
      return;
    }
    let lengthVal = 2 * iter - 1;
    // go down
    for (let i = 1; i <= lengthVal; i++) {
      this.points.push(new THREE.Vector3(x, y - i * this.segmentLength, z));
      let textureIndex = Math.floor(Math.random() * 10);
      this.materialIndices.push(textureIndex);
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[textureIndex]
      );
      boxMesh.position.set(x, y - i * this.segmentLength, z);
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }

    z -= this.segmentLength;

    // turn right
    for (let i = 1; i <= lengthVal; i++) {
      this.points.push(
        new THREE.Vector3(
          x + i * this.segmentLength,
          y - lengthVal * this.segmentLength,
          z
        )
      );
      let textureIndex = Math.floor(Math.random() * 10);
      this.materialIndices.push(textureIndex);
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[textureIndex]
      );
      boxMesh.position.set(
        x + i * this.segmentLength,
        y - lengthVal * this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }
    z -= this.segmentLength;
    // go up
    for (let i = 1; i <= lengthVal + 1; i++) {
      this.points.push(
        new THREE.Vector3(
          x + this.segmentLength * lengthVal,
          y - lengthVal * this.segmentLength + i * this.segmentLength,
          z
        )
      );
      let textureIndex = Math.floor(Math.random() * 10);
      this.materialIndices.push(textureIndex);
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[textureIndex]
      );
      boxMesh.position.set(
        x + this.segmentLength * lengthVal,
        y - lengthVal * this.segmentLength + i * this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }
    z -= this.segmentLength;
    // go left
    for (let i = 1; i <= lengthVal + 1; i++) {
      if (iter == count && i == lengthVal + 1) continue;
      this.points.push(
        new THREE.Vector3(
          x + lengthVal * this.segmentLength - i * this.segmentLength,
          y + this.segmentLength,
          z
        )
      );
      let textureIndex = Math.floor(Math.random() * 10);
      this.materialIndices.push(textureIndex);
      let boxMesh = new THREE.Mesh(
        this.boxGeometryVert,
        RectangularSpiral.materials[textureIndex]
      );
      boxMesh.position.set(
        x + lengthVal * this.segmentLength - i * this.segmentLength,
        y + this.segmentLength,
        z
      );
      boxMesh.visible = false;
      this.boxGroup.add(boxMesh);
    }

    // new starting point

    this._plotSpiral(
      x - this.segmentLength,
      y + this.segmentLength,
      z,
      ++iter,
      count
    );
  }

  updateAnimation() {
    /*
      if (
        this.line.geometry.drawRange.count >=
        this.line.geometry.attributes.position.count
      )
        this.line.geometry.drawRange.count = 0;
      else this.line.geometry.drawRange.count++;
      */

    if (this.boxVisibleCount < this.boxGroup.children.length) {
      this.boxGroup.children[this.boxVisibleCount].visible = true;
      this.boxVisibleCount++;
    } else this.fullyLoaded = true;

    //this.shiftTextures();
  }

  addToScene(scene) {
    //scene.add(this.line);
    scene.add(this.boxGroup);
  }

  shiftTextures() {
    let boxNum = this.boxGroup.children.length;
    let materialIndicesRef = this.materialIndices;
    this.shiftCount += 0.01;
    let sc = this.shiftCount;
    this.boxGroup.children.forEach(function (boxMesh, i) {
      let newIndex = materialIndicesRef[Math.floor(i + sc) % boxNum];
      //console.log(newIndex);
      //console.log(newIndex);
      boxMesh.material = RectangularSpiral.materials[newIndex];
      boxMesh.material.needsUpdate = true;
    });
  }
}

RectangularSpiral.materials = [
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/0.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/1.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/2.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/3.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/4.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/5.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/6.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/7.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/8.png"),
    side: THREE.DoubleSide,
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./assets/images/9.png"),
    side: THREE.DoubleSide,
  }),
];

RectangularSpiral.spiralArr = [];
