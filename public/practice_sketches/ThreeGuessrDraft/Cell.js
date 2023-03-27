import * as THREE from 'three';

export default class Cell {
    constructor(value) {
        this.collapsed = false;
        if (value instanceof Array){
            this.options = value;
        }else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
        this.geometry = new THREE.PlaneGeometry(1, 1);
        this.material = new THREE.MeshBasicMaterial();

    }

    setTexture(tex){
        this.material.map = tex;
    }

    setPos(pos){
        this.pos = pos;
    }

    setRotationNum(num){
        this.rotationNum = num;
    
    }

    buildMesh(){
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //console.log(this.rotationNum);
        this.mesh.rotateZ(-Math.PI * 0.5 * this.rotationNum);
        this.mesh.position.set(this.pos[0] , this.pos[1] );
    }

    addToScene(scene){
        scene.add(this.mesh);
    }
}









