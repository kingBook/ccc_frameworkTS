import BaseBehaviour from "../../core/BaseBehaviour";
import Mathk from "../../utils/Mathk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraFollow2D extends BaseBehaviour{
	
	/** 移动事件，回调函数格式：(vx:number,vy:number):void */
	public static readonly MOVE:string="move";
	
	@property({type:cc.Node,visible:true})
	private _target:cc.Node=null;
	@property({visible:true})
	private _isLookToTargetOnStart:boolean=true;
	@property({range:[0,1],slide:true,visible:true,tooltip:"取值区间 (0,1] 值越大锁定到目标的速度越快"})
	private _learpTime:number=0.1;
	
	@property({displayName:"World Position Min",visible:true})
	private _worldPosMin:cc.Vec2=cc.Vec2.ZERO
	@property({displayName:"　　　　Use Node",visible:true,tooltip:"勾选后将在onLoad时将使用节点的世界坐标覆盖World Position Min的值"})
	private _isUseWorldMinNode:boolean=false;
	@property({displayName:" ",type:cc.Node,visible:true})
	private _worldMinNode:cc.Node=null;
	
	@property({displayName:"World Position Max",visible:true})
	private _worldPosMax:cc.Vec2=cc.Vec2.ZERO
	@property({displayName:"　　　　Use Node",visible:true,tooltip:"勾选后将在onLoad时将使用节点的世界坐标覆盖World Position Max的值"})
	private _isUseWorldMaxNode:boolean=false;
	@property({displayName:" ",type:cc.Node,visible:true})
	private _worldMaxNode:cc.Node=null;
	
	private _camera:cc.Camera;
	private _min:cc.Vec2;//将_worldPosMin转换为以父节点为原点的坐标（无父节点时则不变）
	private _max:cc.Vec2;//将_worldPosMax转换为以父节点为原点的坐标（无父节点时则不变）
	
	public setTarget(value:cc.Node):void{
		this._target=value;
	}
	
	protected onLoad():void{
		super.onLoad();
		this._camera=this.getComponent(cc.Camera);
		
		if(this._isUseWorldMinNode){
			let min=this._worldMinNode.parent.convertToWorldSpaceAR(this._worldMinNode.position);
			this._worldPosMin.x=min.x;
			this._worldPosMin.y=min.y;
		}
		if(this._isUseWorldMaxNode){
			let max=this._worldMaxNode.parent.convertToWorldSpaceAR(this._worldMaxNode.position);
			this._worldPosMax.x=max.x;
			this._worldPosMax.y=max.y;
		}
		this._min=this.node.parent.convertToNodeSpaceAR(this._worldPosMin);
		this._max=this.node.parent.convertToNodeSpaceAR(this._worldPosMax);
	}
	
	protected start():void{
		super.start();
		if(this._isLookToTargetOnStart){
			this.lookToTarget(1);
		}
	}
	
	protected update(dt:number):void{
		super.update(dt);
		this.lookToTarget(this._learpTime);
	}
	
	private lookToTarget(t:number):void{
		let size:cc.Size=cc.winSize;
		let extents:cc.Vec2=new cc.Vec2(size.width*0.5,size.height*0.5);
		let min:cc.Vec2=this._min.add(extents);
		let max:cc.Vec2=this._max.sub(extents);
		
		let targetWorldPos:cc.Vec2=this._target.convertToWorldSpaceAR(cc.Vec2.ZERO);
		let targetToParentPos:cc.Vec2=this.node.parent.convertToNodeSpaceAR(targetWorldPos);
		let myPosX=this.node.x;
		let myPosY=this.node.y;
		let x:number=myPosX+(targetToParentPos.x-myPosX)*t;
		let y:number=myPosY+(targetToParentPos.y-myPosY)*t;
		x=Mathk.clamp(x,min.x,max.x);
		y=Mathk.clamp(y,min.y,max.y);
		this.node.setPosition(x,y);
		//派发移动事件
		let vx:number=x-myPosX;
		let vy:number=y-myPosY;
		this.node.emit(CameraFollow2D.MOVE,vx,vy);
	}
}
