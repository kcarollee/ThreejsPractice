import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";


class CurvedTree{
    constructor(trunkPosVec, trunkPointsNum){
        this.points = [];
        this.trunkPos = trunkPosVec;
        this.pointsNum = trunkPointsNum;
        this.tubeGroup = new THREE.Group();
        this.mat = new THREE.MeshNormalMaterial();
        //console.log(trunkPosVec);
        for (let i = 0; i < this.pointsNum; i++){
            var x = this.trunkPos.x + 30 * Math.cos(i * 0.15);
            var y = this.trunkPos.y + i * 5;
            var z = this.trunkPos.z + 30 * Math.sin(i * 0.15);
            this.points.push(new THREE.Vector3(x, y, z));

            if (Math.random() > 0.5 && i > this.pointsNum * 0.25){
                this.generateBranchPoints(this.points[i], 40, 10, 0.75, 1, 3);
            }
        }

        this.trunkPath = new THREE.CatmullRomCurve3(this.points);
        this.geom = new THREE.TubeGeometry(this.trunkPath, 30, 1, 4, false);
        
        this.mesh = new THREE.Mesh(this.geom, this.mat);

        this.tubeGroup.add(this.mesh);
    }

    generateBranchPoints(basePos, pointsNum, spiralRadius, thickness, heightCoef, iterNum){
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
            var y = branchPos.y + i * heightCoef;
            var z = centerZ + spiralRadius * 0.5 * Math.sin(theta + i * 0.1);
            branchPoints.push(new THREE.Vector3(x, y, z));
           // console.log(pointsNum/2);
            if (Math.random() > 0.5 && i > pointsNum * 0.25) self.generateBranchPoints(branchPoints[i], Math.floor(pointsNum / 2),
             spiralRadius * 1.2, thickness * 0.5, heightCoef * 0.5, iterNum);
        }

        var branchPath = new THREE.CatmullRomCurve3(branchPoints);
        var branchGeom = new THREE.TubeGeometry(branchPath, pointsNum, thickness, 4, false);
        var branchMesh = new THREE.Mesh(branchGeom, self.mat);

        self.tubeGroup.add(branchMesh);
    }

    scale(s){

    }

    getMesh(){ 
        return this.tubeGroup; 
    }

}
function init() {
    var scene = new THREE.Scene();
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
    camera.position.y = 0;
    camera.position.z = 300;
    camera.lookAt(scene.position);

    var testTree = new CurvedTree(new THREE.Vector3(0, -window.innerHeight * 0.06, 0), 30);
    scene.add(testTree.getMesh());

    document.body.appendChild(renderer.domElement);

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
    }
    gui.add(controls, 'outputObj');

    console.log(testTree.tubeGroup);
    renderScene();
    var step = 0;
    function animateScene() {
        step++;
        testTree.tubeGroup.rotation.y = step * 0.01;
        testTree.scale(10);
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