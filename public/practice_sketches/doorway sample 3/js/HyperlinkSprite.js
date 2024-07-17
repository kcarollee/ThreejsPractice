import * as THREE from 'three';

export default class HyperlinkSprite{
	constructor(posVec, destPosVec, spriteMaterial, link, index, scale = 1){
		this.currentPosVec = posVec;
		//this.destPosVec = destPosVec;
		this.destPosVec = destPosVec;
		this.link = link;
		this.scale = scale;
		//console.log(this.scale)
		this.spriteMat = spriteMaterial;
		this.sprite = new THREE.Sprite(this.spriteMat);
		this.sprite.position.copy(this.currentPosVec);
		this.sprite.scale.set(this.scale, this.scale, this.scale);
		this.sprite.visible = true;
		this.sprite.material.color = new THREE.Color(0x5383ac);
		this.id = index;
		this.sprite.name = index;
		
		this.textureChangeCount = 0;
		this.textureChangeNext = 1;

		this.materialChangeCount = 0;
		this.materialChangeNext = 1;

		this.distToMouse = 1.0;
	}

	static resetMaterialChangeCount(inc, max){
		HyperlinkSprite.materialChangeIncrement = inc;
		HyperlinkSprite.materialChangeNextMax = max;
	}

	resetMaterialChangeCount(){
		this.materialChangeCount = 0;
		this.materialChangeNext = 1;
	}
	

	addToScene(scene){
		scene.add(this.sprite);
		console.log(this.sprite.visible)
		//scene.add(this.faceSprite);
	}

	moveToDest(){
		if (this.destPosVec.distanceTo(this.currentPosVec) > 0.0125){
			//console.log("MOVING")
			let destPosVecCopy = new THREE.Vector3();
			destPosVecCopy.copy(this.destPosVec);
			this.currentPosVec.add(destPosVecCopy.sub(this.currentPosVec).multiplyScalar(0.1));
			
			this.sprite.position.copy(this.currentPosVec);
			
			//this.faceSprite.position.copy(this.currentPosVec);
		}
		else {
			this.sprite.position.copy(this.destPosVec);
		}
	}

	setNewDestPos(newDestPosVec){
		this.destPosVec.copy(newDestPosVec);
	}

	

	setMaterial(newMaterial){
		if (this.materialChangeNext < HyperlinkSprite.materialChangeNextMax){
			if (this.materialChangeCount < this.materialChangeNext){
				this.materialChangeCount += 1;
			} 
			else {
				this.sprite.material = newMaterial;
				this.materialChangeCount = 0;
				this.materialChangeNext += HyperlinkSprite.materialChangeIncrement;
			}	
		}
	}
	
	setVisibleTrue(){
		this.sprite.visible = true;
	}

	setVisibleFalse(){
		this.sprite.visible = false;
	}



	clickAnimationFallback(){

	}

	moveToLink(){
		window.open(this.link, '_self');
		THREE.Cache.clear();
	}
}

HyperlinkSprite.centerVec = new THREE.Vector3(0, 0, 0);
HyperlinkSprite.animationTriggered = false;
HyperlinkSprite.opacityClock = new THREE.Clock();
HyperlinkSprite.materialChangeNextMax = 20;
HyperlinkSprite.materialChangeIncrement = 1;