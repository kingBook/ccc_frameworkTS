import BaseBehaviour from "../core/BaseBehaviour";
import Random from "../utils/Random";

const{ccclass,property}=cc._decorator;
/** 雪（单粒子） */
@ccclass
export default class SnowSingle extends BaseBehaviour{
	
	private _worldMin:cc.Vec2=new cc.Vec2(-1e5,-1e5);
	private _worldMax:cc.Vec2=new cc.Vec2(1e5,1e5);
	private _gravity:cc.Vec2=new cc.Vec2(0,-0.00098);
	private _minScale:number=0.3;
	private _maxScale:number=1;
	private _velocity:cc.Vec2=new cc.Vec2(0,0);
	
	public get isOutBottom():boolean{
		return this.node.y-this.node.getBoundingBox().height*0.5<this._worldMin.y;
	}
	
	protected update(dt:number):void{
		super.update(dt);
		
		this._velocity.addSelf(this._gravity);
		
		let pos=this.node.getPosition();
		pos.addSelf(this._velocity);
		this.node.setPosition(pos);
	}
	
	public setScaleRange(min:number,max:number):void{
		this._minScale=min;
		this._maxScale=max;
	}
	
	public setScaleToRandom():void{
		this.node.scale=Random.rangeFloat(this._minScale,this._maxScale);
	}
	
	public setVelocity(x:number,y:number):void{
		cc.Vec2.set(this._velocity,x,y);
	}
	
	/** 设置World范围，以this.node.parent为坐标系原点 */
	public setWorldRange(min:cc.Vec2,max:cc.Vec2):void{
		this._worldMin.set(min);
		this._worldMax.set(max);
	}
	
	public setPositionToRandom():void{
		let x=Random.rangeFloat(this._worldMin.x,this._worldMax.x);
		let y=Random.rangeFloat(this._worldMin.y,this._worldMax.y);
		this.node.setPosition(x,y);
	}
	
	public setPositionToTop(isResetVelocityY:boolean,resetVelocityY_Value:number):void{
		let pos=this.node.getPosition();
		pos.y=this._worldMax.y+this.node.getBoundingBox().height*0.5;
		this.node.setPosition(pos);
		
		if(isResetVelocityY){
			this._velocity.y=resetVelocityY_Value;
		}
	}
	
}