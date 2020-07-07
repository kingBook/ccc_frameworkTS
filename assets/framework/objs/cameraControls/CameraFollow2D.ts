import BaseBehaviour from "../../core/BaseBehaviour";
import Mathk from "../../utils/Mathk";

const {ccclass, property} = cc._decorator;
/**
 * 相机跟随
 * （主相机位于Canvas下，Canvas.fitHeight=true）
 */
@ccclass
export default class CameraFollow2D extends BaseBehaviour{
	
	/** 移动事件，回调函数格式：(vx:number,vy:number):void */
	public static readonly MOVE:string="move";
	
	@property({type:[cc.Node],visible:true})
	private _targets:cc.Node[]=[];
	@property({visible:true})
	private _isLookToTargetOnStart:boolean=true;
	@property({range:[0,1],slide:true,visible:true,tooltip:"取值区间 (0,1] 值越大锁定到目标的速度越快"})
	private _learpTime:number=0.1;
	
	@property({displayName:"World Position Min",visible:true,tooltip:"world的左下角"})
	private _worldPosMin:cc.Vec2=cc.Vec2.ZERO
	@property({displayName:"　　　　Use Node",visible:true,tooltip:"勾选后将在onLoad时将使用节点的世界坐标覆盖World Position Min的值"})
	private _isUseWorldMinNode:boolean=false;
	@property({displayName:" ",type:cc.Node,visible(){return this._isUseWorldMinNode}})
	private _worldMinNode:cc.Node=null;
	
	@property({displayName:"World Position Max",visible:true,tooltip:"world的右上角"})
	private _worldPosMax:cc.Vec2=cc.v2(1e5,1e5);
	@property({displayName:"　　　　Use Node",visible:true,tooltip:"勾选后将在onLoad时将使用节点的世界坐标覆盖World Position Max的值"})
	private _isUseWorldMaxNode:boolean=false;
	@property({displayName:" ",type:cc.Node,visible(){return this._isUseWorldMaxNode}})
	private _worldMaxNode:cc.Node=null;
	
	private _camera:cc.Camera;
	private _min:cc.Vec2;//将_worldPosMin转换为以父节点为原点的坐标（无父节点时则不变）
	private _max:cc.Vec2;//将_worldPosMax转换为以父节点为原点的坐标（无父节点时则不变）
	
	public addTarget(value:cc.Node):void{
		let index=this._targets.indexOf(value);
		if(index>-1)return;
		this._targets.push(value);
	}
	
	public removeTarget(value:cc.Node):void{
		let index=this._targets.indexOf(value);
		if(index<0)return;
		this._targets.splice(index,1);
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
		//如果游戏窗口大于地图大小，则worldMin和worldMax都取world左下角加游戏窗口大小的一半
		//否则，worldMin加上游戏窗口大小的一半，worldMax减去游戏窗口大小的一半（因为相机原点在中心）
		let winExtents=cc.v2(cc.winSize.width*0.5,cc.winSize.height*0.5);//游戏窗口大小的一半
		let relativeExtents=(this._worldPosMax.sub(this._worldPosMin)).mulSelf(0.5);//世界坐标系max-min的一半
		if(winExtents.x>=relativeExtents.x){
			this._worldPosMin.x+=winExtents.x;
			this._worldPosMax.x=this._worldPosMin.x;
		}else{
			this._worldPosMin.x+=winExtents.x;
			this._worldPosMax.x-=winExtents.x;
		}
		if(winExtents.y>=relativeExtents.y){
			this._worldPosMin.y+=winExtents.y;
			this._worldPosMax.y=this._worldPosMin.y
		}else{
			this._worldPosMin.y+=winExtents.y;
			this._worldPosMax.y-=winExtents.y;
		}
		//转换到父级坐标系
		this._min=this.node.parent.convertToNodeSpaceAR(this._worldPosMin);
		this._max=this.node.parent.convertToNodeSpaceAR(this._worldPosMax);
	}
	
	protected start():void{
		super.start();
		if(this._isLookToTargetOnStart){
			this.lookToTargets(1);
		}
	}
	
	protected update(dt:number):void{
		super.update(dt);
		this.lookToTargets(this._learpTime);
	}
	
	/**
	 * 看向目标（将相机的中心移动到目标的中心）
	 * @param t 表示移动的插值，区间[0,1]值越大越快移动到目标中心
	 */
	private lookToTargets(t:number):void{
		let size:cc.Size=cc.winSize;
		let extents:cc.Vec2=new cc.Vec2(size.width*0.5,size.height*0.5);
		extents=this.node.parent.convertToNodeSpaceAR(extents);
		let min:cc.Vec2=this._min.add(extents);
		let max:cc.Vec2=this._max.sub(extents);
		
		let targetsWorldCenter:cc.Vec2=this.getTargetsWorldCenter();
		let targetsWorldCeneterOfParent:cc.Vec2=this.node.parent.convertToNodeSpaceAR(targetsWorldCenter);
		let myPosX=this.node.x;
		let myPosY=this.node.y;
		let x:number=myPosX+(targetsWorldCeneterOfParent.x-myPosX)*t;
		let y:number=myPosY+(targetsWorldCeneterOfParent.y-myPosY)*t;
		x=Mathk.clamp(x,min.x,max.x);
		y=Mathk.clamp(y,min.y,max.y);
		this.node.setPosition(x,y);
		//派发移动事件
		let vx:number=x-myPosX;
		let vy:number=y-myPosY;
		this.node.emit(CameraFollow2D.MOVE,vx,vy);
	}
	
	/** 返回世界坐标系下目标的中心 */
	private getTargetsWorldCenter():cc.Vec2{
		let len:number=this._targets.length;
		let sum:cc.Vec2=cc.Vec2.ZERO;
		for(let i=0;i<len;i++){
			let target:cc.Node=this._targets[i];
			let targetWorldPos:cc.Vec2=target.convertToWorldSpaceAR(cc.Vec2.ZERO);
			sum.addSelf(targetWorldPos);
		}
		sum.mulSelf(1/len);
		return sum;
	}
	
}
