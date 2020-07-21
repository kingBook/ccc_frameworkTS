import BaseBehaviour from "../core/BaseBehaviour";
import SnowSingle from "./SnowSingle";
import NodeUtil from "../utils/NodeUtil";
import Random from "../utils/Random";

const{ccclass,property}=cc._decorator;
/** 随机飘落的雪景 */
@ccclass
export default class SnowScene extends BaseBehaviour{
	@property
	private _snowPrefab:cc.Node=null;
	@property({type:cc.Node,visible:true})
	private _worldMinNode:cc.Node=null;
	@property({type:cc.Node,visible:true})
	private _worldMaxNode:cc.Node=null;
	@property({visible:true})
	private _snowTotal:number=100;
	
	@property({type:cc.Node,visible:true})
	private set snowPrefab(value:cc.Node){
		if(!value||value.getComponent(SnowSingle)){
			this._snowPrefab=value;
		}else{
			cc.error("Snow Prefab必须绑定有SnowSingle组件");
		}
	}
	
	private _snowSingleList:SnowSingle[]=[];
	
	private get snowPrefab():cc.Node{
		return this._snowPrefab;
	}

	protected onLoad():void{
		super.onLoad();
		this._snowPrefab.active=false;
	}
	
	protected start():void{
		super.start();
		this._snowSingleList=this.createSnows();
	}
	
	protected update():void{
		for(let i=0,len=this._snowSingleList.length;i<len;i++){
			let snowSingle=this._snowSingleList[i];
			if(snowSingle.isOutBottom){
				snowSingle.setPositionToTop(true,-Random.randomFloat(1));
			}
		}
	}
	
	private createSnows():SnowSingle[]{
		let list=[];
		let minPos=NodeUtil.getLocalPositionV2UnderNode(this._worldMinNode,this.snowPrefab.parent);
		let maxPos=NodeUtil.getLocalPositionV2UnderNode(this._worldMaxNode,this.snowPrefab.parent);
		for(let i=0;i<this._snowTotal;i++){
			let inst=cc.instantiate(this._snowPrefab);
			inst.active=true;
			inst.parent=this._snowPrefab.parent;
			inst.setSiblingIndex(this._snowPrefab.getSiblingIndex());
			
			let snowSingle=inst.getComponent(SnowSingle);
			snowSingle.setWorldRange(minPos,maxPos);
			snowSingle.setPositionToRandom();
			snowSingle.setScaleToRandom();
			snowSingle.setVelocity(0,-Random.randomFloat(1));
			list[i]=snowSingle;
		}
		return list;
	}
	
	
}