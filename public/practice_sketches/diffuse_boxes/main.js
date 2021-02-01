import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@v0.124.0/examples/jsm/controls/OrbitControls.js";
import {Reflector} from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/objects/Reflector.js";
import {SceneUtils} from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/utils/SceneUtils.js";
const mod = (x, n) => (x % n + n) % n;
function mapLinear(x, a1, a2, b1, b2){
    return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}
class Cell{
    constructor(size, posx, posy, posz, index){
        this.index = index; // flat index
        this.noiseVal = 0;
        this.sizeCoef = 1.0;
        this.size = size;
        this.geom = new THREE.BoxGeometry(this.size, this.size, this.size);
        //this.cellMesh = new THREE.Mesh(this.geom, Cell.standardMat);
        this.cellMesh = new SceneUtils.createMultiMaterialObject(this.geom,
            [Cell.standardMat, Cell.normalMat]);
        this.cellMesh.position.set(posx, posy, posz);
        this.prevSizeCoef = this.sizeCoef;
        this.noiseParams = {x:0, y: 0, z: 0};
        
        
    }

    setNoiseParameters(x, y, z){
        this.noiseParams.x = x;
        this.noiseParams.y = y;
        this.noiseParams.z = z;
    }

    updateNoise(step){
        this.noiseVal = noise.simplex3(this.noiseParams.x + step, this.noiseParams.y + step, this.noiseParams.z + step);
        var mappedNoise = mapLinear(this.noiseVal, -1, 1, 0, 1);
        if (Cell.hardCutoff){
            if (mappedNoise < Cell.cutoffThreshold) this.cellMesh.visible = false;
                
            else {
                this.cellMesh.visible = true;
                mappedNoise = 0.9;
            }
        }
        else if (Cell.exponentialCutoff){
            mappedNoise = Math.pow(mappedNoise, Cell.cutoffExponent);
            if (mappedNoise < Cell.cutoffThreshold) this.cellMesh.visible = false;
            else  this.cellMesh.visible = true;
        }
        this.setNewSizeCoef(mappedNoise);
    }
    setNewSizeCoef(sizeCoef){
        this.sizeCoef = sizeCoef;
        this.size *= this.sizeCoef;
        this.cellMesh.scale.x = this.sizeCoef;
        this.cellMesh.scale.y = this.sizeCoef;
        this.cellMesh.scale.z = this.sizeCoef;
    }
    addToScene(scene){scene.add(this.cellMesh);}

    /* save for a different project
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
        this.sizeCoef += f * (upperCell.prevSizeCoef + lowerCell.prevSizeCoef + 
            leftCell.prevSizeCoef + rightCell.prevSizeCoef - 4.0 * this.prevSizeCoef);
        
        //this.cellMesh.geometry.width = this.sizeCoef * this.size;
        //this.cellMesh.geometry.height = this.sizeCoef * this.size;
        //this.cellMesh.geometry.depth = this.sizeCoef * this.size;
        
        //if (this.sizeCoef < 0.05) this.sizeCoef = 0.1;
       if (this.sizeCoef > 0.999) this.sizeCoef = 0.9;
        this.cellMesh.scale.x = this.sizeCoef;
        this.cellMesh.scale.y = this.sizeCoef;
        this.cellMesh.scale.z = this.sizeCoef;

    }
    */

}
Cell.standardMat = new THREE.MeshStandardMaterial({
    color: 0xEEEEEE,
    roughness: 0.0,
    transparent: true,
    opacity: 1.0
});
Cell.normalMat = new THREE.MeshNormalMaterial();
Cell.exponentialCutoff = true;
Cell.cutoffExponent = 3.0;
Cell.cutoffThreshold = 0.25;
Cell.hardCutoff = false;

function init() {
    noise.seed(Math.random());
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
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
    //scene.add(ambLight);

    var spotLight = new THREE.SpotLight({color: 0xff0000});
    spotLight.position.set(0, 100, 500);
    scene.add(spotLight);

    
    
    

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    camera.lookAt(scene.position);

    

    var depthNum = 15;
    var rowNum = 15;
    var colNum = 15;
    var cellSize = 10;
    var initposx = -cellSize * colNum * 0.5;
    var initposy = -cellSize * rowNum * 0.5;
    var initposz = -cellSize * depthNum * 0.5;
    var cellMeshObjects = {
        arr: [],
        rowNum: rowNum,
        colNum: colNum
    };
    var index = 0;
    var noiseDiv = 10;
    
    for (let zi = 0; zi < depthNum; zi++){
        for (let ri = 0; ri < rowNum; ri++){
            for (let ci = 0; ci < colNum; ci++){
                var cell = new Cell(cellSize, initposx + cellSize * ci, 
                    initposy + cellSize * ri, initposz + cellSize * zi, index++);
                cell.setNoiseParameters(ci / noiseDiv, ri / noiseDiv, zi / noiseDiv);
                var n = noise.simplex3(ci / noiseDiv, ri / noiseDiv, zi / noiseDiv);
                cell.setNewSizeCoef(mapLinear(n, -1, 1, 0, 1));
                cellMeshObjects.arr.push(cell);
            }
        }
    }
    cellMeshObjects.arr.forEach(c => {
        c.addToScene(scene)
    });

    var boxSize = rowNum * cellSize;
    var planeGeo = new THREE.PlaneGeometry(boxSize * 1.5, boxSize * 8.0);
    var planeMat = new THREE.MeshBasicMaterial();
    
    var plane = new THREE.Mesh(planeGeo, planeMat);
    
    plane.rotation.x = -Math.PI *0.5;
    plane.position.y = -boxSize;
    //scene.add(plane);
    
    
    var reflectivePlane = new Reflector(planeGeo);
    reflectivePlane.color = 0x889999;
    reflectivePlane.rotation.x = -Math.PI * 0.5;
    reflectivePlane.position.y= -boxSize;
   
    scene.add(reflectivePlane);


    document.body.appendChild(renderer.domElement);

    renderScene();

    var controls = new function() {
        this.outputObj = function() {
            console.log(scene.children);
        }
        this.exponentialCutoff = true;
        this.hardCutoff = false;
        this.cutoffExponent = 3.0;
        this.cutoffThreshold = 0.25;
    }
    gui.add(controls, 'outputObj');
    gui.add(controls, 'hardCutoff').onChange(e => {
        Cell.hardCutoff = e;
        Cell.exponentialCutoff = !Cell.hardCutoff;
        controls.exponentialCutoff = !controls.hardCutoff;
    });
    gui.add(controls, 'exponentialCutoff').onChange(e => {
        Cell.exponentialCutoff = e;
        Cell.hardCutoff = !Cell.exponentialCutoff;
        controls.hardCutoff = !controls.exponentialCutoff;
    });
    gui.add(controls, 'cutoffExponent', 1.0, 6.0).onChange(e => Cell.cutoffExponent = e);
    gui.add(controls, 'cutoffThreshold', 0.0, 1.0).onChange(e => Cell.cutoffThreshold = e);
    var step = 0;

   
    
    function animateScene() {
        step++;
        cellMeshObjects.arr.forEach(c => c.updateNoise(step * 0.01));
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