import BaseBehaviour from "../core/BaseBehaviour";
import NodeUtil from "../utils/NodeUtil";
import Random from "../utils/Random";

const{ccclass,property}=cc._decorator;
/**多个云朵 */
@ccclass
export default class CloudGroup extends BaseBehaviour{
	
	@property({visible:true,tooltip:"云的数量"})
	private _cloudCount:number=10;
	@property({visible:true,tooltip:"用于随机位置(世界坐标系)格子大小，不能大于minPositionNode和maxPositionNode规定的范围"})
	private _cellSize:cc.Vec2=new cc.Vec2(10,10);
	@property({visible:true,tooltip:"单位：像素/秒"})
	private _minSpeedX:number=50;
	@property({visible:true,tooltip:"单位：像素/秒"})
	private _maxSpeedX:number=200;
	@property({type:cc.Node,visible:true,tooltip:"创建云朵的最小位置"})
	private _minPositionNode:cc.Node=null;
	@property({type:cc.Node,visible:true,tooltip:"创建云朵的最大位置"})
	private _maxPositionNode:cc.Node=null;
	@property({type:[cc.Node],visible:true,tooltip:"云朵预制件节点列表"})
	private _cloudPrefabNodes:cc.Node[]=[];
	
	/** 云实例列表 */
	private _cloudNodes:cc.Node[]=[];
	/** min世界坐标 */
	private _min:cc.Vec2;
	/** max世界坐标 */
	private _max:cc.Vec2;
	
	protected onLoad():void{
		super.onLoad();
		this._min=NodeUtil.getWorldPositionV2(this._minPositionNode);
		this._max=NodeUtil.getWorldPositionV2(this._maxPositionNode);
	}
	
	protected start():void{
		super.start();
		this.createClouds();
	}
	
	private createClouds():void{
		let row=Math.max((this._max.x-this._min.x)/this._cellSize.x, 1);
		let col=Math.max((this._max.y-this._min.y)/this._cellSize.y, 1);
		for(let i=0;i<this._cloudCount;i++){
			let prefabNode=this._cloudPrefabNodes[Random.randomInt(this._cloudPrefabNodes.length)];
			let instance=cc.instantiate(prefabNode);
			instance.parent=prefabNode.parent;
			instance.active=true;
			this._cloudNodes.push(instance);
			let pos=new cc.Vec2(this._min.x+Random.randomInt(row)*this._cellSize.x,
								this._min.y+Random.randomInt(col)*this._cellSize.y);
			pos=NodeUtil.getLocalPositionV2(instance.parent,pos);
			instance.setPosition(pos);
			instance["__vx"]=Random.rangeFloat(this._minSpeedX,this._maxSpeedX);
		}
	}
	
	protected update(dt:number):void{
		super.update(dt);
		for(let i=0,len=this._cloudNodes.length;i<len;i++){
			let cloud=this._cloudNodes[i];
			let vx=cloud["__vx"]*dt;
			cloud.x+=vx;
			let worldPos=NodeUtil.getWorldPositionV2(cloud);
			if(vx>0){
				if(worldPos.x>this._max.x){
					worldPos.x=this._min.x;
					cloud.x=NodeUtil.getLocalPositionV2(cloud.parent,worldPos).x;
				}
			}else if(vx<0){
				if(worldPos.x<this._min.x){
					worldPos.x=this._max.x;
					cloud.x=NodeUtil.getLocalPositionV2(cloud.parent,worldPos).x;
				}
			}
		}
	}
	
	protected onDestroy():void{
		super.onDestroy();
	}
}