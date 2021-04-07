# ThreejsPractice
Learning Three.js
 *based on https://github.com/josdirksen/learning-threejs


**NOTES**
- THREE.WebGLDeferredRenderer has been removed
	- THREE.AreaLight -> THREE.RectAreaLight

- Setting the shading property of materials has changed
    - meshMaterial.shading = THREE.FlatShading => meshMaterial.flatShading = true

- THREE.MeshFaceMaterial has been removed. Use an array of material instead. 

        var mats = [];
        mats.push(new THREE.MeshBasicMaterial({color: 0x009e60}));
        mats.push(new THREE.MeshBasicMaterial({color: 0x009e60}));
        ...
        var cubeGeom = new THREE.BoxGeometry(2.9, 2.9, 2.9);
        var cube = new THREE.Mesh(cubeGeom, mats);

- computeLineDistances() for THREE.Geometry has been remvoed.
- THREE.PointCloudMaterial -> THREE.PointsMaterial
- THREE.PointCloud -> THREE.Points
- THREE.CanvasRenderer has been removed!!