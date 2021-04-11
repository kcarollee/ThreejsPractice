import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
let scene;

function mapLinear(x, a1, a2, b1, b2){
    return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}

class CurvedTree{
    constructor(trunkPosVec, trunkPointsNum){
        this.points = [];
        this.leaves = [];
        this.trunkPos = trunkPosVec;
        this.pointsNum = trunkPointsNum;
        this.tubeGroup = new THREE.Group();
        this.leaveGroup = new THREE.Object3D();
        this.mat = new THREE.MeshNormalMaterial();
        this.indexCount = 0;
        this.genComplete = false;
        //console.log(trunkPosVec);
        /*
        for (let i = 0; i < this.pointsNum; i++){
            var x = this.trunkPos.x + 30 * Math.cos(i * 0.15);
            var z = this.trunkPos.z + 30 * Math.sin(i * 0.15);
            var n = mapLinear(noise.simplex2(x  * 0.01, z * 0.01), -1, 1, 0, 1);
            //console.log(n);
            var y = this.trunkPos.y + i * 5 * n;
            this.points.push(new THREE.Vector3(x, y, z));

            if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.25){
                this.generateBranchPoints(this.points[i], 30, 30, 0.75, 1, 0.01, 2);
            }
        }
        this.generateLeaveSprites();
        this.trunkPath = new THREE.CatmullRomCurve3(this.points);
        this.geom = new THREE.TubeGeometry(this.trunkPath, 30, 1, 4, false);
        
        this.mesh = new THREE.Mesh(this.geom, this.mat);

        this.tubeGroup.add(this.mesh);
        */
    }

    generateWhole(){
        if (Math.random() < 0.5){
            for (let i = 0; i < this.pointsNum; i++){
                var x = this.trunkPos.x + 30 * Math.cos(i * 0.15);
                var z = this.trunkPos.z + 30 * Math.sin(i * 0.15);
                var n = mapLinear(noise.simplex2(x  * 0.001, z * 0.001), -1, 1, 0, 1);
                //console.log(n);
                var y = this.trunkPos.y + i * 10 * n;
                this.points.push(new THREE.Vector3(x, y, z));

                if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.25){
                    this.generateBranchPoints(this.points[i], 40, 20, 0.75, 1, 0.01, 2);
                }
            }
        }
        else{
             for (let i = 0; i < this.pointsNum; i++){
                var x = this.trunkPos.x - 30 * Math.cos(i * 0.15);
                var z = this.trunkPos.z - 30 * Math.sin(i * 0.15);
                var n = mapLinear(noise.simplex2(x  * 0.01, z * 0.01), -1, 1, 0, 1);
                //console.log(n);
                var y = this.trunkPos.y + i * 10 * n;
                this.points.push(new THREE.Vector3(x, y, z));

                if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.25){
                    this.generateBranchPoints(this.points[i], 40, 20, 0.75, 1, 0.01, 2);
                }
            }
        }
        this.completeMeshAfterGen();
    }

    generateIncrementally(i){
        var x = this.trunkPos.x + 30 * Math.cos(i * 0.15);
        var z = this.trunkPos.z + 30 * Math.sin(i * 0.15);
        var n = mapLinear(noise.simplex2(x  * 0.01, z * 0.01), -1, 1, 0, 1);
        //console.log(n);
        var y = this.trunkPos.y + i * 5 * n;
        this.points.push(new THREE.Vector3(x, y, z));

        if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.25){
            this.generateBranchPoints(this.points[i], 30, 30, 0.75, 10, 0.01, 2);
        }
    }

    completeMeshAfterGen(){
        this.genComplete = true;
        this.generateLeaveSprites();
        this.trunkPath = new THREE.CatmullRomCurve3(this.points);
        this.geom = new THREE.TubeGeometry(this.trunkPath, 30, 1, 4, false);
        
        this.mesh = new THREE.Mesh(this.geom, this.mat);

        this.tubeGroup.add(this.mesh);
    }

    generateLeaveSprites(){
        var self = this;
        this.leaves.forEach(function (p){
            var spriteMat = new THREE.SpriteMaterial({
                opacity: 0.1,
                color: 0xFFFFFF,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            var sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(10, 10, 10);
            sprite.position.set(p.x, p.y, p.z);
            sprite.initPos = {x: p.x, y: p.y, z: p.z};
            self.leaveGroup.add(sprite);
        });
    }


    generateBranchPoints(basePos, pointsNum, spiralRadius, thickness, heightCoef, noiseCoef, iterNum){
        if (iterNum == 0 || pointsNum < 1 || spiralRadius < 1) return;
        iterNum--;
        var self = this;
        var branchPoints = [];
        var branchPos = basePos;
        var randomAngle = (Math.random() * Math.PI - 1.5 * Math.PI);
        var centerX = branchPos.x + spiralRadius * 0.5 * Math.cos(randomAngle);
        var centerZ = branchPos.z + spiralRadius * 0.5 * Math.sin(randomAngle);
        var theta = Math.atan((branchPos.z - centerZ) / (branchPos.x - centerX));
        //console.log(branchPos.x + " " + (centerX + spiralRadius * 0.5 * Math.cos(theta)));
        //console.log(iterNum);
        for (let i = 0; i < pointsNum; i++){
            var x = centerX + spiralRadius * 0.5 * Math.cos(theta + i * 0.1);
            var z = centerZ + spiralRadius * 0.5 * Math.sin(theta + i * 0.1);
            var n = mapLinear(noise.simplex2(x  * noiseCoef, z * noiseCoef), -1, 1, 0, 1);
            var y = branchPos.y + i * heightCoef * n;
            branchPoints.push(new THREE.Vector3(x, y, z));
            if (iterNum == 0 && i == pointsNum - 1) self.leaves.push(new THREE.Vector3(x, y, z));
           // console.log(pointsNum/2);
            if (Math.random() > 0.5 && i > pointsNum * 0.25) self.generateBranchPoints(branchPoints[i], Math.floor(pointsNum / 2),
             spiralRadius * 1.2, thickness * 0.5, heightCoef * 0.95, noiseCoef * 4.0, iterNum);
        }

        var branchPath = new THREE.CatmullRomCurve3(branchPoints);
        var branchGeom = new THREE.TubeGeometry(branchPath, pointsNum, thickness, 4, false);
        var branchMesh = new THREE.Mesh(branchGeom, self.mat);

        self.tubeGroup.add(branchMesh);
    }

    scale(s){

    }

    getTreeMesh(){ 
        return this.tubeGroup; 
    }

    getLeaveSprites(){
        return this.leaveGroup;
    }

    getGroup(){

    }

    animateLeaves(step){
        this.leaveGroup.children.forEach(function(p){
            p.position.x = p.initPos.x + Math.sin(step + p.initPos.x);
        });
    }

}
function init() {
    noise.seed(Math.random());
    scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    var gui = new dat.GUI();
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    scene.add(camera);

    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;

    
    
    var orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(scene.position);
    orbitControls.update();
    
    camera.position.x = 0;
    camera.position.y = 60;
    camera.position.z = 300;
    camera.lookAt(scene.position);

    var treeArr = [];
    var newTreeArr = [];
    var initTreeNum = 40;
    for (var i = 0; i < initTreeNum; i++){
        var gap = 75;
        var r = Math.random() * 600;
        var t = Math.random() * Math.PI * 2;
        var x = r * Math.cos(t);
        var z = r * Math.sin(t);
        var tree = new CurvedTree(new THREE.Vector3(x, -window.innerHeight * 0.05, z), 20);
        tree.name = "tree";
        tree.generateWhole();
        scene.add(tree.getTreeMesh());
        scene.add(tree.getLeaveSprites());
        treeArr.push(tree);
    }
    

    document.body.appendChild(renderer.domElement);

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
    }
    gui.add(controls, 'outputObj');

    
    renderScene();
    var step = 0;
    function animateScene() {
        step++;
        //testTree.tubeGroup.rotation.y = step * 0.01;
        //testTree.leaveGroup.rotation.y = step * 0.01;
        //testTree.scale(10);
        //testTree.animateLeaves(step * 0.1);

        treeArr.forEach(t => t.animateLeaves(step * 0.1));
        //camera.position.z -= 1;
        //manageScene();
        //console.log(camera.position.z);
    }

    function manageScene(){
        if (-camera.position.z % 75 == 0) {
            //console.log(scene.children);
            for (var i = 0; i < 3; i++){
                scene.remove(scene.children[i]);
            }

            for (var i = 0; i < 1; i++){
                var gap = 75;
                var x = i % 2 == 0 ? gap : -gap;
                var tree = new CurvedTree(new THREE.Vector3(x, -window.innerHeight * 0.05, camera.position.z - gap * 6), 20);
                tree.name = "tree";
                scene.add(tree.getTreeMesh());
                scene.add(tree.getLeaveSprites());
                newTreeArr.push(tree);
            }
        }
        newTreeArr.forEach(function(t){
            if (!t.genComplete){
                if (t.indexCount < t.pointsNum){
                    t.generateIncrementally(t.indexCount);
                    t.indexCount++;
                }
                else t.completeMeshAfterGen();
            }
        });
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