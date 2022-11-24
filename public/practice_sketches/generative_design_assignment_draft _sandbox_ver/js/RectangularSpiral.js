class RectangularSpiral {
  constructor(
    startPos,
    segmentLength,
    spiralCount,
    trailPointsNum = 1000,
    densityCoef = 0.05,
    startAnimation = false,
    color = null,
    mode = 0,
    xnum = 10,
    ynum = 10,
    znum = 10
  ) {
    this.startPos = startPos;

    this.spiralCount = spiralCount;
    this.segmentLength = segmentLength;

    this.boxGeometry = new THREE.BoxGeometry(
      this.segmentLength,
      this.segmentLength,
      this.segmentLength
    );

    this.boxGroup = new THREE.Group();
    this.boxGroup.name = "boxgroup";

    this.points = [];
    this.transformedPoints = [];
    this.materialIndices = [];

    this.mode = mode;

    this.xnum = xnum;
    this.ynum = ynum;
    this.znum = znum;

    switch (this.mode) {
      case 0:
        this._plotSpiral(
          this.startPos.x,
          this.startPos.y,
          this.startPos.z,
          1,
          this.spiralCount
        );
        break;
      case 1:
        this._plotSpiral2(
          this.startPos.x,
          this.startPos.y,
          this.startPos.z,
          1,
          this.spiralCount
        );
        break;
      case 2:
        this._plotSpiral3(this.xnum, this.znum, this.ynum);
        break;
    }

    this.boxVisibleCount = 0;
    //this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

    //this.line = new THREE.Line(this.geometry, this.material);

    this.index = RectangularSpiral.spiralArr.length;
    this.boxGroup.index = this.index;
    RectangularSpiral.spiralArr.push(this);

    this.animationStartFlag = startAnimation;

    this.boxesFullyLoaded = false;
    this.shiftCount = 0;

    this.triggerBoxMovement = false;
    this.trailPointsNum = trailPointsNum;
    this.trailPointIndex = 0;

    this.trailPointsLoaded = false;

    this.densityCoef = densityCoef;

    this.curlMeshIndex = 0;
    this.curlMeshArr = [];
    let colorVal = fxrand();

    this.color = new THREE.Color(colorVal, colorVal, colorVal);
    if (color != null) {
      this.color = color.clone();
      //console.log(this.color);
      this.color.multiplyScalar(colorVal);
    }
    this.curlMeshMaterial = new THREE.MeshLambertMaterial({
      color: this.color,
      side: THREE.DoubleSide,
      //map: texture,
    });

    this.curlMeshFullyLoaded = false;
  }

  setEnvMap(envMap) {
    this.curlMeshMaterial.envMap;
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
    let groupMatrixWorld = this.boxGroup.matrixWorld;
    let pointsCopyArr = this.transformedPoints;

    let boxMeshArr = this.boxGroup.children;
    this.points.forEach(function (p, i) {
      let pCopy = p.clone();
      pCopy.applyMatrix4(groupMatrixWorld);
      pointsCopyArr.push({ point: pCopy, boxMesh: boxMeshArr[i] });
    });
    //console.log(this.transformedPoints);
    return pointsCopyArr;
  }

  calculateTrailPointsIncrementally() {
    if (this.trailPointIndex < this.trailPointsNum) {
      let boxMeshArr = this.boxGroup.children;
      let groupMatrixWorld = this.boxGroup.matrixWorld;
      let tpi = this.trailPointIndex;
      let densityCoef = this.densityCoef;
      boxMeshArr.forEach(function (boxMesh, i) {
        if (tpi == 0) {
          let pCopy = boxMesh.position.clone();
          pCopy.applyMatrix4(groupMatrixWorld);
          boxMesh.trailPoints.push(pCopy);
        } else {
          let tpiPrev = tpi - 1;

          let pPrevCopy = boxMesh.trailPoints[tpiPrev].clone();

          let v = computeCurl2(
            pPrevCopy.x * densityCoef,
            pPrevCopy.y * densityCoef,
            pPrevCopy.z * densityCoef
          );
          pPrevCopy.addScaledVector(v, 1);
          boxMesh.trailPoints.push(pPrevCopy.clone());
        }
      });
      this.trailPointIndex++;
    } else this.trailPointsLoaded = true;
  }

  generateCurlMeshIncrementally(scene) {
    let boxMeshArr = this.boxGroup.children;
    if (this.curlMeshIndex < boxMeshArr.length) {
      let boxMeshOnPoint = boxMeshArr[this.curlMeshIndex];
      boxMeshOnPoint.curlPositionIndex = 0;
      let path = boxMeshOnPoint.trailPoints;
      let geometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(path),
        this.trailPointsNum,
        1,
        3,
        false
      );
      let mesh = new THREE.Mesh(geometry, this.curlMeshMaterial);
      mesh.geometry.setDrawRange(0, 0);
      this.curlMeshArr.push(mesh);
      scene.add(mesh);

      this.curlMeshIndex++;
    } else this.curlMeshFullyLoaded = true;
  }

  updateCurlMesh() {
    this.curlMeshArr.forEach(function (curlMesh) {
      let vertCount = curlMesh.geometry.attributes.position.count;
      let drawRangeCount = curlMesh.geometry.drawRange.count;

      if (drawRangeCount < vertCount) {
        curlMesh.geometry.drawRange.count += 20;
      }
    });
  }

  _createBoxMesh(posx, posy, posz) {
    this.points.push(new THREE.Vector3(posx, posy, posz));
    let textureIndex = Math.floor(Math.random() * 10);
    this.materialIndices.push(textureIndex);
    let boxMesh = new THREE.Mesh(
      this.boxGeometry,
      RectangularSpiral.materials[textureIndex]
    );
    boxMesh.trailPoints = [];
    boxMesh.position.set(posx, posy, posz);
    boxMesh.visible = false;
    this.boxGroup.add(boxMesh);
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
      this._createBoxMesh(x, y - i * this.segmentLength, z);
    }

    z -= this.segmentLength;

    // turn right
    for (let i = 1; i <= lengthVal; i++) {
      this._createBoxMesh(
        x + i * this.segmentLength,
        y - lengthVal * this.segmentLength,
        z
      );
    }
    z -= this.segmentLength;
    // go up
    for (let i = 1; i <= lengthVal + 1; i++) {
      this._createBoxMesh(
        x + this.segmentLength * lengthVal,
        y - lengthVal * this.segmentLength + i * this.segmentLength,
        z
      );
    }
    z -= this.segmentLength;
    // go left
    for (let i = 1; i <= lengthVal + 1; i++) {
      if (iter == count && i == lengthVal + 1) continue;
      this._createBoxMesh(
        x + lengthVal * this.segmentLength - i * this.segmentLength,
        y + this.segmentLength,
        z
      );
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

  // without the z difference
  _plotSpiral2(x, y, z, iter, count) {
    //console.log(iter, count);
    if (iter > count) {
      //console.log(iter);
      return;
    }
    let lengthVal = 2 * iter - 1;
    // go down
    for (let i = 1; i <= lengthVal; i++) {
      this._createBoxMesh(x, y - i * this.segmentLength, z);
    }

    // turn right
    for (let i = 1; i <= lengthVal; i++) {
      this._createBoxMesh(
        x + i * this.segmentLength,
        y - lengthVal * this.segmentLength,
        z
      );
    }

    // go up
    for (let i = 1; i <= lengthVal + 1; i++) {
      this._createBoxMesh(
        x + this.segmentLength * lengthVal,
        y - lengthVal * this.segmentLength + i * this.segmentLength,
        z
      );
    }

    // go left
    for (let i = 1; i <= lengthVal + 1; i++) {
      if (iter == count && i == lengthVal + 1) continue;
      this._createBoxMesh(
        x + lengthVal * this.segmentLength - i * this.segmentLength,
        y + this.segmentLength,
        z
      );
    }

    // new starting point

    this._plotSpiral2(
      x - this.segmentLength,
      y + this.segmentLength,
      z,
      ++iter,
      count
    );
  }

  // noise cube
  _plotSpiral3() {
    let sideLenX = this.segmentLength * this.xnum;
    let sideLenY = this.segmentLength * this.ynum;
    let sideLenZ = this.segmentLength * this.znum;
    let startOffsetX = -sideLenX * 0.5 + this.segmentLength;
    let startOffsetY = -sideLenY * 0.5 + this.segmentLength;
    let startOffsetZ = -sideLenZ * 0.5 + this.segmentLength;
    let x, y, z;
    for (let zi = 0; zi < this.znum; zi++) {
      z = this.startPos.z + startOffsetZ + zi * this.segmentLength;
      for (let yi = 0; yi < this.ynum; yi++) {
        y = this.startPos.y + startOffsetY + yi * this.segmentLength;
        for (let xi = 0; xi < this.xnum; xi++) {
          x = this.startPos.x + startOffsetX + xi * this.segmentLength;
          if (fxrand() > 0.5) this._createBoxMesh(x, y, z);
        }
      }
    }
  }

  updateAnimation(scene) {
    /*
      if (
        this.line.geometry.drawRange.count >=
        this.line.geometry.attributes.position.count
      )
        this.line.geometry.drawRange.count = 0;
      else this.line.geometry.drawRange.count++;
      */

    if (this.animationStartFlag) {
      if (this.boxVisibleCount < this.boxGroup.children.length) {
        this.boxGroup.children[this.boxVisibleCount].visible = true;
        this.boxVisibleCount++;
      } else this.boxesFullyLoaded = true;

      if (this.boxesFullyLoaded && !this.trailPointsLoaded) {
        //console.log("LOADING TRAIL POINTS");
        this.calculateTrailPointsIncrementally();
      }

      if (this.trailPointsLoaded) {
        this.generateCurlMeshIncrementally(scene);
        this.triggerBoxMovement = true;
        this.updateCurlMesh();
      }

      if (this.triggerBoxMovement) {
        let matrixWorldInverse = new THREE.Matrix4();
        matrixWorldInverse.copy(this.boxGroup.matrixWorld).invert();

        let boxMeshArr = this.boxGroup.children;
        let tpn = this.trailPointsNum;
        boxMeshArr.forEach(function (boxMesh) {
          //console.log(boxMesh.curlPositionIndex);
          if (boxMesh.curlPositionIndex < tpn) {
            let newPos = boxMesh.trailPoints[boxMesh.curlPositionIndex];
            let scale = 1.0 - boxMesh.curlPositionIndex / tpn;
            scale = Math.pow(scale, 3.0);
            newPos.applyMatrix4(matrixWorldInverse);
            boxMesh.position.set(newPos.x, newPos.y, newPos.z);
            boxMesh.curlPositionIndex++;
            boxMesh.scale.set(scale, scale, scale);
          }
        });
      }
    }

    this.shiftTextures();
  }

  addToScene(scene) {
    //scene.add(this.line);
    scene.add(this.boxGroup);
  }

  shiftTextures() {
    let boxNum = this.boxGroup.children.length;
    let materialIndicesRef = this.materialIndices;
    this.shiftCount += 0.05;
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
