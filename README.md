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
- The .sortParticles property of Points has been removed.
- THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader instead.
        
        // deprecated
        var texture = THREE.ImageUtils.loadTexture("assets/raindrop-1.png");
        // valid
        var texture = new THREE.TextureLoader().load("assets/raindrop-1.png");
- THREE.Points takes a THREE.BufferGeometry object as a parameter instead of the deprecated THREE.Geometry object. 
- It is still possible to pass a THREE.Geometry object as an parameter to THREE.Points. Don't forget to set the verticesNeedUpdate attribute of the geometry to true when vertices need update.
- THREE.TrackballControls: The second parameter "domElement" is now mandatory.

        //deprecated
        var trackballControls = new TrackballControls(camera);
        // valid
        var trackballControls = new TrackballControls(camera, renderer.domElement);

- should've realized how outadated the book was months ago ffs
- will be basing this prac folder on https://threejsfundamentals.org/ from now on.