import * as THREE from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import HyperlinkSprite from "./js/HyperlinkSprite.js";
// TODO:
/*
-> more 'opening' animations
-> figure out a different way of placing the student tiles
-> disable scroll when in zoommode during intro
-> pdf flip book 

*/

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    // CAMERA
    const fov = 75;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspect = screenWidth / screenHeight;
    const near = 0.1;
    const far = 1000;
    const frustumCoef = 0.02;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const cameraZoomInPos = 0.3;
    const cameraZoomOutPos = 12;
    const cameraInitialPos = new THREE.Vector3(0, -1.25, cameraZoomOutPos);
    camera.name = "camera1";
    camera.position.copy(cameraInitialPos);

    const scene = new THREE.Scene();
    scene.name = "scene1";
    //scene.background = new THREE.Color(0x5c9cba)
    let currentScene = scene;
    let currentCamera = camera;

    const loader = new THREE.TextureLoader();
    renderer.render(scene, camera);

    // SPRITES -> SCENE 1
    let doorImageData = [];

    const textureLoader = new THREE.TextureLoader();

    const hyperlinkSpriteArr = [];
    const leftSpriteArr = [];
    const rightSpriteArr = [];
    const spriteTextureArr = [];
    const spriteMaterialArr = [];
    let spriteTextureNum = 4;

    for (let i = 0; i < spriteTextureNum; i++) {
        let url = "./assets/final sprites/p (" + (i + 1) + ").png";
        console.log(url);
        const spriteTexture = textureLoader.load(url);

        spriteTextureArr.push(spriteTexture);

        const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });
        spriteMaterialArr.push(spriteMaterial);
    }

    let imgWidth;
    let imgHeight;
    textureLoader.load("./assets/door_original_3.png", (texture) => {
        const imageCanvas = document.createElement("canvas");
        const context = imageCanvas.getContext("2d");

        let scale = 0.125;
        let aspectRatio = 1;
        if (window.innerHeight < window.innerWidth) {
            imageCanvas.width = texture.image.width * scale;
            imageCanvas.height = texture.image.height * scale * aspectRatio;
        } else {
            imageCanvas.width = (texture.image.width * scale) / aspectRatio;
            //imageCanvas.height = texture.image.height * scale * 0.5;
            imageCanvas.height = texture.image.height * scale;
        }

        imgWidth = imageCanvas.width;
        imgHeight = imageCanvas.height;

        context.drawImage(
            texture.image,
            0,
            0,
            imageCanvas.width,
            imageCanvas.height
        );
        const imageData = context.getImageData(
            0,
            0,
            imageCanvas.width,
            imageCanvas.height
        );

        const pixels = imageData.data;

        let index = 0;
        let inc = 1;
        let threshold = 10;
        for (let i = 0; i < imageCanvas.height; i += inc) {
            for (let j = 0; j < imageCanvas.width; j += inc) {
                if (pixels[index] < threshold && j < imageCanvas.width * 0.5)
                    doorImageData.push([j, i]);
                index += 4 * inc;
            }
        }
    });

    let particlesLoaded = false;
    const randomRange = (coef) => {
        return (Math.random() - 0.5) * 2 * coef;
    };

    const leftParticleGroup = new THREE.Group();
    const rightParticleGroup = new THREE.Group();
    function loadParticles() {
        if (doorImageData.length == 0) console.log("LOADING");
        else if (!particlesLoaded) {
            // left particles
            doorImageData.forEach(function (pos, i) {
                let posX = (pos[0] - imgWidth * 0.5) / 10;
                let posY = -(pos[1] - imgHeight * 0.5) / 10;
                let posZ = 0;
                let spriteMaterialIndex = Math.floor(
                    Math.random() * spriteTextureNum
                );
                let tempSprite = new HyperlinkSprite(
                    new THREE.Vector3(randomRange(100), randomRange(100), 0),
                    new THREE.Vector3(posX, posY, posZ),
                    spriteMaterialArr[spriteMaterialIndex],
                    null,
                    i,
                    0.075
                );
                //tempSprite.addToScene(scene);
                hyperlinkSpriteArr.push(tempSprite);
                leftSpriteArr.push(tempSprite);
                leftParticleGroup.add(tempSprite.sprite);
                scene.add(leftParticleGroup);
            });

            //leftParticleGroup.translateX(-imgWidth / 20);
            //leftParticleGroup.rotateY(-Math.PI * 30);

            // right particles
            doorImageData.forEach(function (pos, i) {
                let posX = (imgWidth * 0.5 - pos[0]) / 10;
                let posY = -(pos[1] - imgHeight * 0.5) / 10;
                let posZ = 0;
                let spriteMaterialIndex = Math.floor(
                    Math.random() * spriteTextureNum
                );
                let tempSprite = new HyperlinkSprite(
                    new THREE.Vector3(randomRange(100), randomRange(100), 0),
                    new THREE.Vector3(posX, posY, posZ),
                    spriteMaterialArr[spriteMaterialIndex],
                    null,
                    i,
                    0.075
                );
                //tempSprite.addToScene(scene);
                hyperlinkSpriteArr.push(tempSprite);
                rightSpriteArr.push(tempSprite);
                rightParticleGroup.add(tempSprite.sprite);
                scene.add(rightParticleGroup);
            });
            particlesLoaded = !particlesLoaded;
            //rightParticleGroup.translateX(imgWidth / 20);
        }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const easePointer = new THREE.Vector2();
    const prevPointer = new THREE.Vector2();

    const clamp = (x, a, b) => {
        return Math.max(a, Math.min(x, b));
    };

    let height = 2;
    const leftTitleCardTexture = textureLoader.load(
        "./assets/leftTitleCard.png"
    );
    leftTitleCardTexture.minFilter = THREE.LinearMipMapLinearFilter;
    leftTitleCardTexture.magFilter = THREE.LinearMipMapLinearFilter;
    let ratio1 = 2.8608;
    const leftTitleCardGeo = new THREE.PlaneGeometry(height * ratio1, height);
    const leftTitleCardMat = new THREE.MeshBasicMaterial({
        map: leftTitleCardTexture,
        transparent: true,
        opacity: 0,
        color: new THREE.Color(0x5c9cba),
    });
    const leftTitleCardMesh = new THREE.Mesh(
        leftTitleCardGeo,
        leftTitleCardMat
    );

    leftTitleCardMesh.position.set(-12, -2, 0);

    const rightTitleCardTexture = textureLoader.load(
        "./assets/rightTitleCard.png"
    );
    rightTitleCardTexture.minFilter = THREE.LinearMipMapLinearFilter;
    rightTitleCardTexture.magFilter = THREE.LinearMipMapLinearFilter;
    let ratio2 = 2.68171557562;
    const rightTitleCardGeo = new THREE.PlaneGeometry(height * ratio2, height);
    const rightTitleCardMat = new THREE.MeshBasicMaterial({
        map: rightTitleCardTexture,
        transparent: true,
        opacity: 0,
        color: new THREE.Color(0x5c9cba),
    });
    const rightTitleCardMesh = new THREE.Mesh(
        rightTitleCardGeo,
        rightTitleCardMat
    );

    rightTitleCardMesh.position.set(12, -2.1, 0);
    //rightTitleCardMesh.scale.y = 0.98;
    scene.add(leftTitleCardMesh, rightTitleCardMesh);

    // const movingHyperlinkSpriteArr = [];

    // RAYCASTER
    let pointerInSprite = false;
    let pointerInBackButton = false;
    let pointerInProfileImage = false;
    let pointerInProjectImage = false;
    let projectNumber;
    let intersectPoint = new THREE.Vector3();
    let spritePosition = new THREE.Vector3();
    let intersects;
    let scale = 0.1;
    let scaleMax = 1.5;

    // the pointer intersects ONLY with this mesh in updateRaycaster()
    // the particles will react
    const pointerIntersectGeom = new THREE.PlaneGeometry(100, 100);
    const pointerIntersectMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
        color: new THREE.Color(0x00ff00),
    });
    const pointerIntersectMesh = new THREE.Mesh(
        pointerIntersectGeom,
        pointerIntersectMat
    );
    pointerIntersectMesh.name = "pointerIntersectMesh";
    scene.add(pointerIntersectMesh);

    function updateRaycaster() {
        if (
            !triggerCameraZoomIn &&
            !triggerSpriteScaleDown &&
            !triggerProfileScaleUp &&
            !triggerProfileScaleDown &&
            !triggerSpriteScaleUp
        ) {
            raycaster.setFromCamera(easePointer, camera);
            intersects = raycaster.intersectObjects(
                currentScene.children,
                true
            );
            intersectPoint = intersects[0].point;

            let mouseVel = prevPointer.distanceTo(pointer);
            let diffVec = new THREE.Vector3();
            hyperlinkSpriteArr.forEach((hsSprite) => {
                // world position of each sprite:
                hsSprite.sprite.getWorldPosition(spritePosition);
                // distance from pointer to each sprite:
                let dist = spritePosition.distanceTo(intersectPoint);
                diffVec.subVectors(spritePosition, intersectPoint);

                hsSprite.sprite.position.add(
                    diffVec.multiplyScalar(mouseVel / Math.pow(dist, 2))
                );
                //console.log(hsSprite.sprite.position)
            });
        }
    }

    const pointerVec = new THREE.Vector3(0, 0, 0);
    const objectWorldPos = new THREE.Vector3(0, 0, 0);
    const objectNDC = new THREE.Vector3();
    function reactToMouse() {
        pointerVec.x = pointer.x;
        pointerVec.y = pointer.y;
        //console.log(pointerVec)
        //console.log(pointerVec);
        hyperlinkSpriteArr.forEach((hsSprite, i) => {
            //console.log(hsSprite.sprite.position)
            objectNDC.copy(hsSprite.sprite.getWorldPosition(objectWorldPos));
            objectNDC.normalize();
            //console.log(objectWorldPos, objectNDC)
            let dist = pointerVec.distanceTo(objectNDC);
            if (dist < 0.2) hsSprite.sprite.scale.set(0.5, 0.5, 0.5);
            else hsSprite.sprite.scale.set(0.075, 0.075, 0.075);
        });
    }

    // ANIMATIONS
    function animateSpriteScale() {
        hyperlinkSpriteArr.forEach((hsSprite) => {
            hsSprite.moveToDest();
        });
    }

    // CAMERA ANIMATION
    let zoominScale = 0.1;
    let triggerSpriteScaleDown = false;
    let spriteScaleDownCounter = 0;

    let triggerProfileScaleUp = false;
    let profileScaleUpMax = 0.1;
    let profileScale = 0;

    let triggerProfileScaleDown = false;
    let profileScaleDownMin = 0;

    let triggerSpriteScaleUp = false;
    let scaleSpeed = 0.1;

    function getMenuBarOpacity() {
        let menuElem = document.getElementById("menu-bar");
        let computedStye = window.getComputedStyle(menuElem);
        let opacity = computedStye.opacity;
        return opacity;
    }

    let spriteDisplayIndex = 0;
    let spriteDisplayIncrement = 40;
    let mainTitleLingerCounter = 0;
    let mainTitleLingerMax = 50;

    function animate(time) {
        loadParticles();
        updateEasePointer();
        animateSpriteScale();
        slideDoor();
        updateTitleCardOpacity();
        checkTransitionThreshold();
        //reactToMouse();
    }

    let easeCoef = 0.1;
    function updateEasePointer() {
        // destination: current pointer position

        prevPointer.x = easePointer.x;
        prevPointer.y = easePointer.y;

        easePointer.x += (pointer.x - easePointer.x) * easeCoef;
        easePointer.y += (pointer.y - easePointer.y) * easeCoef;
    }

    function updateTitleCardOpacity() {
        if (leftTitleCardMesh.material.opacity < 1) {
            leftTitleCardMesh.material.opacity += 0.025;
            rightTitleCardMesh.material.opacity += 0.025;
        }
        if (transitionThresholdPassed) {
            leftTitleCardMesh.material.opacity = 0;
            rightTitleCardMesh.material.opacity = 0;
        }
    }

    function render(time) {
        //console.log(doorImageData);
        time *= 0.001;
        animate(time);
        updateRaycaster();
        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;

            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

            if (!zoominMode) camera.position.z = cameraZoomOutPos;
        }
        renderer.render(currentScene, currentCamera);
        requestAnimationFrame(render);
    }

    function resizeRenderToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
        const height = (canvas.clientHeight * pixelRatio) | 0; // 0
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
    requestAnimationFrame(render);

    function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //camera.position.set(-pointer.x, -pointer.y, 10);
    }

    window.addEventListener("pointermove", onPointerMove);

    let triggerCameraZoomIn = false;
    let triggerCameraZoomOut = false;
    let zoominMode = false;

    function onPointerDown(event) {}
    window.addEventListener("pointerdown", onPointerDown);

    let leftScrollDist = 0;
    let rightScrollDist = 0;
    let leftScrollDistMax = 0.07;
    let rightScrollDistMax = 0.07;

    const menuBar = document.getElementById("menu-bar");
    const scrollContainer = document.getElementById("scroll-container");
    const infoBar = document.getElementById("info-bar");
    const mainContents = document.getElementById("main-contents");
    const body = document.body;
    const titleBar = document.getElementById("title-bar");

    let scrollAccumulated = 0;
    let scene2StartCounter = 0;
    let scene2FullThreshold = 50;

    let transitionThresholdPassed = false;
    function onScroll(event) {
        if (transitionThresholdPassed) return;
        // upward scroll -> door opens
        if (event.deltaY > 0) {
            leftScrollDist = leftScrollDistMax;
            rightScrollDist = -rightScrollDistMax;
        }
        // downward scroll -> door closes
        else {
            leftScrollDist = -leftScrollDistMax;
            rightScrollDist = rightScrollDistMax;
        }
        hyperlinkSpriteArr.forEach((hsSprite) => {
            //let randInt = Math.floor(Math.random() * spriteMaterialArr.length);
            //hsSprite.sprite.material = spriteMaterialArr[randInt];
            hsSprite.resetMaterialChangeCount();
        });
        //const scrollTop = scrollContainer.scrollTop;
        scrollAccumulated += event.deltaY;
        if (scrollAccumulated < 0) scrollAccumulated = 0;
        //console.log(scrollAccumulated);
    }
    window.addEventListener("wheel", onScroll);

    function changeParticleColor() {
        hyperlinkSpriteArr.forEach((hsSprite) => {
            hsSprite.sprite.material.color = new THREE.Color(0x5c9cba);
        });
    }

    function pixelateDoor() {
        hyperlinkSpriteArr.forEach((hsSprite) => {
            let randInt = Math.floor(Math.random() * spriteMaterialArr.length);
            hsSprite.sprite.material = spriteMaterialArr[randInt];
        });
    }

    let leftParticleGroupInitPosX, rightParticleGroupInitPosX;
    let leftParticleGroupLoaded = false;
    let rightParticleGroupLoaded = false;

    let slideSpeedCoef = 3.0;
    let cameraZoominCoef = 0.5;
    let slideSpeedDecreaseAmount = 0.001;
    function slideDoor() {
        // if the position of the door group is back at its original position
        // and the use attempts to scroll further up, return.
        if (
            leftParticleGroup.position.x == leftParticleGroupInitPosX &&
            leftScrollDist < 0
        )
            return;

        // if the group is fully loaded
        if (leftParticleGroup.children.length > 0 && !leftParticleGroupLoaded) {
            leftParticleGroupInitPosX = leftParticleGroup.position.x;
            leftParticleGroupLoaded = true;
        }

        if (
            rightParticleGroup.children.length > 0 &&
            !rightParticleGroupLoaded
        ) {
            rightParticleGroupInitPosX = rightParticleGroup.position.x;
            rightParticleGroupLoaded = true;
        }

        if (transitionThresholdPassed) slideSpeedDecreaseAmount = 0.0025;
        // when in zoomout view
        if (!zoominMode && currentScene.name == "scene1") {
            // if in the process of opening
            if (leftScrollDist > 0) {
                leftScrollDist -= slideSpeedDecreaseAmount;
                if (leftScrollDist < 0) leftScrollDist = 0;
                //pixelateDoor();
                //console.log(leftScrollDist);
            } else {
                //console.log(leftScrollDist);
                //if (leftScrollDist < 0) pixelateDoor();
                leftScrollDist += slideSpeedDecreaseAmount;
                if (leftScrollDist > 0) {
                    leftScrollDist = 0;
                }
            }

            if (rightScrollDist < 0) {
                rightScrollDist += slideSpeedDecreaseAmount;
                if (rightScrollDist > 0) rightScrollDist = 0;
            } else {
                rightScrollDist -= slideSpeedDecreaseAmount;
                if (rightScrollDist < 0) rightScrollDist = 0;
            }
            //console.log(leftScrollDist);
            leftParticleGroup.position.x -= leftScrollDist * slideSpeedCoef;
            rightParticleGroup.position.x -= rightScrollDist * slideSpeedCoef;

            leftTitleCardMesh.position.x -= leftScrollDist * slideSpeedCoef;
            rightTitleCardMesh.position.x -= rightScrollDist * slideSpeedCoef;

            currentCamera.position.z += leftScrollDist * cameraZoominCoef;

            if (leftParticleGroup.position.x > leftParticleGroupInitPosX) {
                leftParticleGroup.position.x = leftParticleGroupInitPosX;
            }

            if (rightParticleGroup.position.x < rightParticleGroupInitPosX) {
                rightParticleGroup.position.x = rightParticleGroupInitPosX;
            }
            //console.log(leftParticleGroup.position.x);
        }
    }

    function checkTransitionThreshold() {
        // TRY PUTTING THIS PART IN A DIFFERENT FUNCTION. (keep in mind that scrolling is a very discrete action)
        if (leftParticleGroup.position.x <= -10) {
            // Adjust the value to show the menu earlier or later
            //currentScene = scene2;
            //currentCamera = camera2;
            //currentCamera.position.z = 1
            changeParticleColor();
            menuBar.classList.add("visible");
            //infoBar.classList.add('visible');
            mainContents.classList.add("visible");
            //titleBar.classList.add('invisible');
            body.classList.add("change-color");
            body.classList.add("scroll-snap");
            body.style.overflowY = "scroll";
            transitionThresholdPassed = true;
        }
    }
}

main();
