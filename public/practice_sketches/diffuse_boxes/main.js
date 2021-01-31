import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";

const mod = (x, n) => (x % n + n) % n;
class Cell{
    constructor(size, posx, posy, posz, index){
        this.index = index; // flat index
        this.sizeCoef = Math.random();
        this.size = size * this.sizeCoef;
        this.geom = new THREE.BoxGeometry(this.size, this.size, this.size);
        this.cellMesh = new THREE.Mesh(this.geom, Cell.mat);
        this.cellMesh.position.set(posx, posy, posz);
        this.prevSizeCoef = this.sizeCoef;
    }
    addToScene(scene){scene.add(this.cellMesh);}
    calculateAdjacentIndices(cellMeshObjects){
        var rowNum = cellMeshObjects.rowNum;
        var colNum = cellMeshObjects.colNum;
        var totalNum = cellMeshObjects.arr.length;
        this.upperCellIndex = mod(this.index - colNum, totalNum);
        this.lowerCellIndex = mod(this.index + colNum, totalNum);
        this.leftCellIndex = mod(this.index - 1, totalNum);
        this.rightCellIndex = mod(this.index + 1, totalNum);
    }

    diffuse(cellMeshObjects){
        var upperCell = cellMeshObjects.arr[this.upperCellIndex];
        var lowerCell = cellMeshObjects.arr[this.lowerCellIndex];
        var leftCell = cellMeshObjects.arr[this.leftCellIndex];
        var rightCell = cellMeshObjects.arr[this.rightCellIndex];
        var f = 0.2;
        var temp = this.sizeCoef;
        this.prevSizeCoef = temp;
        this.sizeCoef = f * (upperCell.prevSizeCoef + lowerCell.prevSizeCoef + 
            leftCell.prevSizeCoef + rightCell.prevSizeCoef - 4.0 * this.prevSizeCoef);
        /*
        this.cellMesh.geometry.width = this.sizeCoef * this.size;
        this.cellMesh.geometry.height = this.sizeCoef * this.size;
        this.cellMesh.geometry.depth = this.sizeCoef * this.size;
        */
        //if (this.sizeCoef < 0.05) this.sizeCoef = 0.1;
       if (this.sizeCoef > 0.999) this.sizeCoef = 0.9;
        this.cellMesh.scale.x = this.sizeCoef;
        this.cellMesh.scale.y = this.sizeCoef;
        this.cellMesh.scale.z = this.sizeCoef;

    }

}
Cell.mat = new THREE.MeshNormalMaterial();

function init() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var stats = initStats();
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
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

    var ambLight = new THREE.AmbientLight({color: 0xEEEEEE});
    scene.add(ambLight);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    camera.lookAt(scene.position);

    

    var depthNum = 1;
    var rowNum = 20;
    var colNum = 20;
    var cellSize = 5;
    var initposx = -cellSize * colNum * 0.5;
    var initposy = -cellSize * rowNum * 0.5;
    var cellMeshObjects = {
        arr: [],
        rowNum: rowNum,
        colNum: colNum
    };
    var index = 0;
    for (let zi = 0; zi < depthNum; zi++){
        for (let ri = 0; ri < rowNum; ri++){
            for (let ci = 0; ci < colNum; ci++){
                var cell = new Cell(cellSize, initposx + cellSize * ci, initposy + cellSize * ri, 0, index++);
                cellMeshObjects.arr.push(cell);
            }
        }
    }
    cellMeshObjects.arr.forEach(c => {
        c.calculateAdjacentIndices(cellMeshObjects);
        c.addToScene(scene)
    });

    


    document.body.appendChild(renderer.domElement);

    renderScene();

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
    }
    gui.add(controls, 'outputObj');

    var step = 0;
    function animateScene() {
        step++;
        cellMeshObjects.arr.forEach(c => c.diffuse(cellMeshObjects));
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