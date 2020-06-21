import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

@ccclass
export default class YoyoRotation extends BaseBehaviour{
	
	@property({visible:true})
	private _distance:number=15;
	@property({visible:true})
	private _stepValue:number=0.1;
	
	private _angleOnLoad:number;
	private _stepCount:number=0;
	
	protected onLoad():void{
		super.onLoad();
		this._angleOnLoad=this.node.angle;
	}
	
	protected update(dt:number):void{
		super.update(dt);
		this._stepCount+=this._stepValue;
		let offset=Math.sin(this._stepCount)*this._distance;
		this.node.angle=this._angleOnLoad+offset;
	}
}