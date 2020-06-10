import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

@ccclass
export default class MoveFrom extends BaseBehaviour{
	
	/** 完成事件，回调函数格式：():void */
	public static readonly COMPLETE:string="complete";
	
	@property({visible:true})
	private _from:cc.Vec2=cc.v2(0,650);
	@property({visible:true})
	private _duration:number=1.5;
	
	private _posRecord:cc.Vec2;
	
	
	protected onLoad():void{
		super.onLoad();
		this._posRecord=this.node.getPosition().clone();
	}
	
	protected onEnable():void{
		super.onEnable();
		this.node.setPosition(this._from);
		
		cc.tween(this.node)
			.to(this._duration,{ position: this._posRecord })
			.call(()=>{ this.onComplete(); })
			.start();
		
	}
	
	private onComplete():void{
		this.node.emit(MoveFrom.COMPLETE);
	}
	
	protected onDisable():void{
		cc.Tween.stopAllByTarget(this.node);
		this.node.setPosition(this._posRecord);
		super.onDisable();
	}
}