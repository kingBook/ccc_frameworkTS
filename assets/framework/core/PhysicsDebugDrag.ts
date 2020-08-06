import PhysicsMouseJoint from "../extensions/PhysicsMouseJoint";
import BaseBehaviour from "./BaseBehaviour";
const{ccclass}=cc._decorator;
const eventManager=cc["internal"]["eventManager"];
const EventListener=cc["EventListener"];

@ccclass
export default class PhysicsDebugDrag extends BaseBehaviour{
	
	private _touchListener:any;
	private _touchWorldPos:cc.Vec2=new cc.Vec2();
	private _mouseJoint:PhysicsMouseJoint;
	
	protected start():void{
		super.start();
		this._touchListener=EventListener.create({
			event:EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches:false,
			owner:this.node,
			mask:null,
			onTouchBegan:this.onTouchStart.bind(this),
			onTouchMoved:this.onTouchMoved.bind(this),
			onTouchEnded:this.onTouchEnded.bind(this),
			onTouchCancelled:this.onTouchEnded.bind(this)
		});
		eventManager.addListener(this._touchListener,this.node);
	}
	
	private onTouchStart(touch:cc.Touch,event:cc.Event.EventTouch):boolean{
		let camera=cc.Camera.main;
		if(camera){
			camera.getScreenToWorldPoint(touch.getLocation(),this._touchWorldPos);
		}else{
			this._touchWorldPos.set(touch.getLocation());
		}
		let collider=cc.director.getPhysicsManager().testPoint(this._touchWorldPos);
		if(collider){
			this._mouseJoint=this.node.addComponent(PhysicsMouseJoint);
			this._mouseJoint.isManual=true;
			this._mouseJoint.target=this._touchWorldPos;
			this._mouseJoint.connectedBody=collider.body;
			this._mouseJoint.apply();
		}
		//此处必须返回true（表示接触到了节点）,否则TOUCH_MOVE,TOUCH_END,TOUCH_CANCEL不触发。
		return true;
	}
	
	private onTouchMoved(touch:cc.Touch,event:cc.Event.EventTouch):void{
		if(this._mouseJoint){
			let camera=cc.Camera.main;
			if(camera){
				camera.getScreenToWorldPoint(touch.getLocation(),this._touchWorldPos);
			}else{
				this._touchWorldPos.set(touch.getLocation());
			}
			this._mouseJoint.target=this._touchWorldPos;
		}
	}
	
	private onTouchEnded(touch:cc.Touch,event:cc.Event.EventTouch):void{
		if(this._mouseJoint){
			this.node.removeComponent(this._mouseJoint);
			this._mouseJoint=null;
		}
	}
	
	protected onDestroy():void{
		super.onDestroy();
		eventManager.removeListener(this._touchListener,this.node);
	}
	
	
	
	
}