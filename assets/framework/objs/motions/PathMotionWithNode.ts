import BaseBehaviour from "../../core/BaseBehaviour";
import NodeUtil from "../../utils/NodeUtil";

const{ccclass,property}=cc._decorator;

/** 移动节点的路径运动 */
@ccclass
export default class PathMotionWithNode extends BaseBehaviour{
	
	/** 完成一次事件（再次回到初始点时完成一次） */
	public static readonly COMPLETE_ONCE:string="completeOnce";
	/** 到达一次终点事件 */
	public static readonly GOTO_END_POINT_ONCE:string="gotoEndPointOnce";
	
	@property({range:[0,1e6],visible:true,tooltip:"移动速度（像素/秒）"})
	public speed:number=90;
	@property({type:cc.Node,visible:true})
	public targetNode:cc.Node=null;
	@property({type:[cc.Node],visible:true,tooltip:"运动的路径节点列表"})
	private _pathNodes:cc.Node[]=[null,null];
	
	private _index:number;
	private _closestIndex:number;
	private _gotoClosestIndexCount:number=0;
	private _points:cc.Vec2[];
	
	protected resetInEditor():void{
		super.resetInEditor();
		if(!this.targetNode){
			this.targetNode=this.node;
		}
	}
	
	protected onLoad():void{
		super.onLoad();
		//创建父级坐标系的路径点数组
		this._points=this.createPointsWithNodes();
		this._closestIndex=this.getClosestPointIndex();
		//设置最近点索引为初始索引
		this._index=this._closestIndex;
	}
	
	protected update(dt:number):void{
		super.update(dt);
		let len=this._points.length;
		if(len>1){
			if(this.gotoPoint(this._points[this._index],dt)){
				let endPointIndex=(this._closestIndex-1+len)%len;
				if(this._index==endPointIndex){
					this.node.emit(PathMotionWithNode.GOTO_END_POINT_ONCE);
				}
				//第二次回到起始点，则完成一次路径运动
				if(this._index==this._closestIndex){
					this._gotoClosestIndexCount++;
					if(this._gotoClosestIndexCount==2){
						this._gotoClosestIndexCount=0;
						this.node.emit(PathMotionWithNode.COMPLETE_ONCE);
					}
				}
				this._index=(this._index+1)%len;
			}
		}
	}
	
	private gotoPoint(target:cc.Vec2,dt:number):boolean{
		let relative:cc.Vec2=target.sub(this.targetNode.getPosition());
		let difference:number=relative.len()-this.speed*dt;
		if(difference>=0){
			//与目标点的距离>=速度，进行速度量位移
			let pos=this.targetNode.getPosition();
			pos.addSelf(relative.normalize().mulSelf(this.speed*dt));
			this.targetNode.setPosition(pos);
		}else{
			//与目标点的距离<速度，移到目标点后再位移多出的速度量
			//下一个目标点
			let len=this._points.length;
			let nextPoint0=this._points[(this._index+1)%len];
			//下下个目标点
			let nextPoint1=this._points[(this._index+2)%len];
			//
			relative=nextPoint1.sub(nextPoint0);
			let newPosition=this.targetNode.getPosition().addSelf(relative.normalizeSelf().mulSelf(-difference));
			this.targetNode.setPosition(newPosition);
			return true;
		}
		return false;
	}
	
	private createPointsWithNodes():cc.Vec2[]{
		let points:cc.Vec2[]=[];
		let parent=this.targetNode.parent;
		for(let i=0,len=this._pathNodes.length;i<len;i++){
			let node=this._pathNodes[i];
			let point=NodeUtil.getLocalPositionV2UnderNode(node,parent);
			points[i]=point;
		}
		return points;
	}
	
	private getClosestPointIndex():number{
		let closestIndex:number=-1;
		
		let i=this._points.length;
		let pos=this.targetNode.getPosition();
		let minDistance:number=Number.MAX_VALUE;
		while(--i>=0){
			let point:cc.Vec2=this._points[i];
			let distance:number=cc.Vec2.distance(point,pos);
			if(distance<minDistance){
				minDistance=distance;
				closestIndex=i;
			}
		}
		return closestIndex;
	}
	
}