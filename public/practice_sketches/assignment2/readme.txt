본 과제는 다수의 Viewport가 아닌 다수의 RenderTarget들을 상용해서 구현해봤다. 하나의 메인 scene이 있다면 렌더타겟 두개를 만들어서 하나는 고정적인 뷰를 담고, 다른 하나는 움직이는 카메라의 시선을 담게 하는 것이 최종 목표였다. 

RenderTargetCamera라는 간단한 객체를 만들어봤다.

this.camera: 렌더타겟에 저장할 시점
this.renderTarget: 위의 카메라의 시점에서 바라본 scene의 모습을 저장
this.line: 카메라와 lookAt 포인트를 연결해주는 선

updateCameraLine(x, y, z), updateCameraPosition(x, y, z), updateCameraLookAt(x, y, z): 카메라가 움직임에 따라 적합한 객체 변수들을 변형해주는 함수들

renderOntoRenderTarget(renderer, scene): 현 객체가 지니고 있는 this.renderTarget을 렌더하게끔 지정해주는 함수

GEOMETRIES (94번째 줄부터)부분에서 planeMesh와 planeMesh2는 각각 움직이는 카메라와 고정된 카메라의 시점에서의 렌더타겟의 텍스쳐를 입히게 될 평면 메쉬들이다. 

GUI (133번째 줄부터)에서 사용한 몇가지 함수들을 보자면:
latlonToCart (lat, lon, r): latitude, longtitude좌표계를 카테시안 공간으로 변환시켰다. x, y, z 순서는 Three.js의 좌표계 특성을 고려하여 z, x, y 순서로 바꿨다. 
mapValue(val, min1, max1, min2, max2): 각도를 라디안으로 매핑해주는 함수이다. 

render()함수를 보면 

		cubeMesh.visible = true;
		camTrailVert.visible = true;
		camTrailHori.visible = true;
		movingCamera.line.visible = true;
		planeMesh.visible = false;
		planeMesh2.visible = true;
		fixedCamera.renderOntoRenderTarget(renderer, scene);
		

		planeMesh.visible = true;
		planeMesh2.visible = false;
		movingCamera.renderOntoRenderTarget(renderer, scene);
		
		renderer.setRenderTarget(null);
		renderer.clear();
		scene.background = new THREE.Color(0xDDDDDD);
		cubeMesh.visible = false;
		camTrailVert.visible = false;
		camTrailHori.visible = false;
		movingCamera.line.visible = false;
		planeMesh2.visible = true;
		renderer.render(scene, camera);

와 같이 Object3D객체들의 visible 속성이 켜졌다가 꺼지는 것을 확인할 수 있다. 이는 하나의 scene을 여러개의 렌더타겟에 담는 과정에서 어떤 렌더타겟에 쓸데없는 것이 보이는 것을 방지하기 위해서이다. 

TODO: GET RID OF REPEATING CODE FOR THE SLIDERS; MENTION HOW USING RENDERTARGETS RATHER THAN VIEWPORTS WASN"T NECESSARILLY A GOOD IDEA