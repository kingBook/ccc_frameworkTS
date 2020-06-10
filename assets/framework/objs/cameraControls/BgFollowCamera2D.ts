import BaseBehaviour from "../../core/BaseBehaviour";
import CameraFollow2D from "./CameraFollow2D";

const{ccclass,property}=cc._decorator;

/** 背景跟随相机移动 */
@ccclass
export default class BgFollowCamera2D extends BaseBehaviour{
	
	@property({type:CameraFollow2D,visible:true})
	private _cameraFollow:CameraFollow2D=null;
	@property({range:[0,1],slide:true,visible:true,tooltip:"0：和墙体同步移动，1：在相机中始终保持一个静止的画面"})
	private _ratioX:number=0.8;
	@property({range:[0,1],slide:true,visible:true,tooltip:"0：和墙体同步移动，1：在相机中始终保持一个静止的画面"})
	private _ratioY:number=0.8;
	
	protected onLoad():void{
		super.onLoad();
		this._cameraFollow.node.on(CameraFollow2D.MOVE,this.onCameraMove,this);
	}
	
	protected update(dt:number):void{
		super.update(dt);
	}
	
	private onCameraMove(vx:number,vy:number):void{
		let x:number=this.node.x+vx*this._ratioX;
		let y:number=this.node.y+vy*this._ratioY;
		this.node.setPosition(x,y);
	}
	
	protected onDestroy():void{
		if(this._cameraFollow.node){
			this._cameraFollow.node.off(CameraFollow2D.MOVE,this.onCameraMove,this);
		}
		super.onDestroy();
	}
	
}