import BaseBehaviour from "../framework/core/BaseBehaviour";
import DirectionButtonHandle from "../framework/objs/inputs/DirectionButtonHandle";
import DirectionCircleHandle from "../framework/objs/inputs/DirectionCircleHandle";
import DirectionKeyboardInput from "../framework/objs/inputs/DirectionKeyboardInput";
import Character from "./Character";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerCtrl extends BaseBehaviour {
	
	private _character:Character;
	
	private _directionCircleHandle:DirectionCircleHandle;
	private _directionButtonHandle:DirectionButtonHandle;
	private _directionKeyboardInput:DirectionKeyboardInput;
	private _isEnableMobileInput:boolean;
	
	protected onLoad():void{
		super.onLoad();
		this._character=this.getComponent(Character);
		this._directionKeyboardInput=this.getComponentInChildren(DirectionKeyboardInput);
		this._directionCircleHandle=cc.find("Canvas/UI Level/DirectionCircleHandle").getComponent(DirectionCircleHandle);
		this._directionButtonHandle=cc.find("Canvas/UI Level/DirectionButtonHandle").getComponent(DirectionButtonHandle);
		
		
		if(cc.sys.isMobile){
			this._directionCircleHandle.node.active=true;
			this._directionButtonHandle.node.active=true;
			this._directionKeyboardInput.node.active=false;
			this._directionButtonHandle.node.on(DirectionButtonHandle.PRESS_ONCE,this.onPressOnce,this);
		}else{
			this._directionKeyboardInput.node.active=true;
			this._directionKeyboardInput.node.on(DirectionKeyboardInput.PRESS_ONCE,this.onPressOnce,this);
		}
		
		this._isEnableMobileInput=this._directionCircleHandle.node.active;
	}
	
	private onPressOnce(directionNormalized:cc.Vec2):void{
		if(directionNormalized.y>0){
			// on press once up
			this._character.jump();
		}
	}
	
	protected update(dt:number):void{
		super.update(dt);
		let dirctionV2=this.getDirectionNormalized();
		if(dirctionV2.x!=0){
			this._character.moveX(dirctionV2.x>0?1:-1);
		}else{
			this._character.stopMoveSlowX();
		}
	}
	
	private getDirectionNormalized():cc.Vec2{
		let v:cc.Vec2;
		if(this._isEnableMobileInput){
			v=this._directionCircleHandle.directionOne;
		}else{
			v=this._directionKeyboardInput.directionNormalized;
		}
		return v;
	}
	
	protected onDestroy():void{
		if(this._directionKeyboardInput.node){
			this._directionKeyboardInput.node.off(DirectionKeyboardInput.PRESS_ONCE,this.onPressOnce,this);
		}
		if(this._directionButtonHandle.node){
			this._directionButtonHandle.node.off(DirectionButtonHandle.PRESS_ONCE,this.onPressOnce,this);
		}
		super.onDestroy();
	}
	
	
}
