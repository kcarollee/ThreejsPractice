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
        this.leafGroup = new THREE.Object3D();
        this.mat = new THREE.MeshBasicMaterial({color: 0xffffff});
        this.indexCount = 0;
        this.genComplete = false;
        this.rand = Math.random();
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
        // generateBranchPoints(basePos, pointsNum, spiralRadius, thickness, heightCoef, noiseCoef, iterNum)
        

    }

    generateWhole(){
        if (Math.random() < 0.5){
            for (let i = 0; i < this.pointsNum; i++){
                var x = this.trunkPos.x + 30 * Math.cos(i * 0.15);
                var z = this.trunkPos.z + 30 * Math.sin(i * 0.15);
                var n = mapLinear(noise.simplex2(x  * 0.01, z * 0.01), -1, 1, 0, 1);
                //console.log(n);
                var y = this.trunkPos.y + i * 5 * n;
                this.points.push(new THREE.Vector3(x, y, z));

                if (i != this.pointsNum - 1 && Math.random() > 0.1 && i > this.pointsNum * 0.25){
                    this.generateBranchPoints(this.points[i], 40, 20, 0.75, 1, 0.01, 3);
                }
            }
        }
        else{
             for (let i = 0; i < this.pointsNum; i++){
                var x = this.trunkPos.x - 30 * Math.cos(i * 0.15);
                var z = this.trunkPos.z - 30 * Math.sin(i * 0.15);
                var n = mapLinear(noise.simplex2(x  * 0.01, z * 0.01), -1, 1, 0, 1);
                //console.log(n);
                var y = this.trunkPos.y + i * 5 * n;
                this.points.push(new THREE.Vector3(x, y, z));

                if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.25){
                    this.generateBranchPoints(this.points[i], 40, 20, 0.75, 1, 0.01, 3);
                }
            }
        }
        this.completeMeshAfterGen();
    }

    generateIncrementally(i){
        var x = this.trunkPos.x + 30 * Math.cos(i * 0.05);
        var z = this.trunkPos.z + 30 * Math.sin(i * 0.05);
        var n = mapLinear(noise.simplex2(x  * 0.01 + this.rand, z * 0.01 + this.rand), -1, 1, 0, 1);
        //console.log(n);
        var y = this.trunkPos.y + i * 5 * n;
        this.points.push(new THREE.Vector3(x, y, z));


        if (i != this.pointsNum - 1 && Math.random() > 0.5 && i > this.pointsNum * 0.5){
            this.generateBranchPoints(this.points[i], this.pointsNum, 20, 0.5, 1, 0.01, 3);
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
                opacity: 0.025,
                color: 0xFFFFCC,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            var sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(10, 10, 10);
            sprite.position.set(p.x, p.y, p.z);
            sprite.initPos = {x: p.x, y: p.y, z: p.z};
            self.leafGroup.add(sprite);
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
        var r = Math.random();
        for (let i = 0; i < pointsNum; i++){
            var x, z;
            if (r % 2 == 0){
                x = centerX + spiralRadius * 0.5 * Math.cos(theta + i * 0.1);
                z = centerZ + spiralRadius * 0.5 * Math.sin(theta + i * 0.1);
            }
            else{
                x = centerX + spiralRadius * 0.5 * Math.cos(theta - i * 0.1);
                z = centerZ + spiralRadius * 0.5 * Math.sin(theta - i * 0.1);
            }
            var n = mapLinear(noise.simplex2(x  * noiseCoef, z * noiseCoef), -1, 1, 0, 1);
            var y = branchPos.y + i * heightCoef * n;
            branchPoints.push(new THREE.Vector3(x, y, z));
            if (iterNum == 0 && i == pointsNum - 1) self.leaves.push(new THREE.Vector3(x, y, z));
           // console.log(pointsNum/2);
            if (Math.random() > 0.5 && i > pointsNum * 0.5) self.generateBranchPoints(branchPoints[i], Math.floor(pointsNum * 0.5),
             spiralRadius * 1.2, thickness * 0.5, heightCoef * 0.95, noiseCoef * 2.0, iterNum);
        }

        var branchPath = new THREE.CatmullRomCurve3(branchPoints);
        var branchGeom = new THREE.TubeGeometry(branchPath, pointsNum, thickness, 10, false);
        var branchMesh = new THREE.Mesh(branchGeom, self.mat);

        self.tubeGroup.add(branchMesh);
    }

    scale(s){

    }

    getTreeMesh(){ 
        this.tubeGroup.name = "tubeGroup";
        return this.tubeGroup; 
    }

    getLeaveSprites(){
        this.leafGroup.name = "leafGroup";
        return this.leafGroup;
    }

    getGroup(){

    }

    animateLeaves(step){
        this.leafGroup.children.forEach(function(p){
            p.position.x = p.initPos.x + 3.0 * Math.sin(step + p.initPos.x);
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

    var tree = new CurvedTree(new THREE.Vector3(0, -70, 0), 60);
    //tree.generateWhole();
    scene.add(tree.getTreeMesh());
    scene.add(tree.getLeaveSprites());
    
    

    document.body.appendChild(renderer.domElement);

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
        this.createNewTree = function(){
            scene.remove(scene.getObjectByName("leafGroup"));
            scene.remove(scene.getObjectByName("tubeGroup"));
            tree = new CurvedTree(new THREE.Vector3(0, -70, 0), 60);
            scene.add(tree.getTreeMesh());
            scene.add(tree.getLeaveSprites());
        }
    }
    gui.add(controls, 'outputObj');
    gui.add(controls, 'createNewTree');
    
    renderScene();
    var step = 0;
    function animateScene() {
        step++;
        tree.animateLeaves(step * 0.01);

        if (!tree.genComplete){
            if (tree.indexCount < tree.pointsNum){
                tree.generateIncrementally(tree.indexCount);
                tree.indexCount++
            }
            else tree.completeMeshAfterGen();
                
        }
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