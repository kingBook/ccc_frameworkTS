import BaseBehaviour from "./BaseBehaviour";
import NodeUtil from "../utils/NodeUtil";

const{ccclass,property}=cc._decorator;
/** 调试绘画（世界坐标系为单位，需每帧调用绘画接口），绑定此组件的节点和所有父节点不能缩放和旋转*/
@ccclass
export default class DebugDraw extends BaseBehaviour{
	@property({visible:true})
	private _strokeColor:cc.Color=cc.Color.GREEN;
	private _graphics:cc.Graphics;
	
	public get graphics():cc.Graphics{
		return this._graphics;
	}
	
	protected onLoad():void{
		super.onLoad();
		this._graphics=this.node.addComponent(cc.Graphics);
		this._graphics.strokeColor=this._strokeColor;
		//设置坐标位置：(0,0)
		let zeroPos=this.node.parent.convertToNodeSpaceAR(cc.Vec2.ZERO_R);
		this.node.setPosition(zeroPos);
	}
	
	/**
	 * 擦除之前绘制的所有内容的方法
	 * @param clean 是否清除Graphics内的缓存
	 */
	public clear(clean?:boolean):void{
		this.graphics.clear(clean);
	}
	
	/** 画矩形（世界坐标系为单位） */
	public drawRect(rect:cc.Rect):void;
	/** 画矩形（以 parentNode 坐标系为单位） */
	public drawRect(rect:cc.Rect,parentNode:cc.Node):void;
	//实现
	public drawRect(rect:cc.Rect,parentNode?:cc.Node):void{
		let xMin=rect.xMin, xMax=rect.xMax;
		let yMin=rect.yMin, yMax=rect.yMax;
		if(parentNode){
			let min=new cc.Vec2(xMin,yMin);
			let max=new cc.Vec2(xMax,yMax);
			min=NodeUtil.getLocalPositionV2UnderLocal(parentNode,min,this.node);
			max=NodeUtil.getLocalPositionV2UnderLocal(parentNode,max,this.node);
			xMin=min.x, xMax=max.x;
			yMin=min.y, yMax=max.y;
		}
		this._graphics.moveTo(xMin,yMin);
		this._graphics.lineTo(xMax,yMin);
		this._graphics.lineTo(xMax,yMax);
		this._graphics.lineTo(xMin,yMax);
		this._graphics.close();
		this._graphics.stroke();
	}
	
	/** 画圆（世界坐标系为单位） */
	public drawCircle(center:cc.Vec2,radius:number):void;
	/** 画圆（以 parentNode 坐标系为单位） */
	public drawCircle(center:cc.Vec2,radius:number,parentNode:cc.Node):void;
	//实现
	public drawCircle(center:cc.Vec2,radius:number,parentNode?:cc.Node):void{
		if(parentNode){
			center=NodeUtil.getLocalPositionV2UnderLocal(parentNode,center,this.node);
			radius=NodeUtil.getLocalPositionV2UnderLocal(parentNode,new cc.Vec2(radius,0),this.node).x;
		}
		this._graphics.circle(center.x,center.y,radius);
		this._graphics.stroke();
	}
	
	/** 画多个点（世界坐标系为单位） */
	public drawPoints(points:cc.Vec2[],isClose:boolean):void;
	/** 画多个点（以 parentNode 坐标系为单位） */
	public drawPoints(points:cc.Vec2[],isClose:boolean,parentNode:cc.Node):void;
	//实现
	public drawPoints(points:cc.Vec2[],isClose:boolean,parentNode?:cc.Node):void{
		let len=points.length;
		if(parentNode){
			let tempPoints=[];
			for(let i=0;i<len;i++){
				tempPoints[i]=NodeUtil.getLocalPositionV2UnderLocal(parentNode,points[i],this.node);
			}
			points=tempPoints;
		}
		this._graphics.moveTo(points[0].x,points[0].y);
		for(let i=1;i<len;i++){
			let p=points[i];
			this._graphics.lineTo(p.x,p.y);
		}
		if(isClose){
			this._graphics.close();
		}
		this._graphics.stroke();
	}
	
	
}