import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

@ccclass
export default class MoveFrom extends BaseBehaviour{
	
	/** 完成事件，回调函数格式：():void */
	public static readonly COMPLETE:string="complete";
	
	@property({visible:true})
	private _from:cc.Vec3=cc.v3(0,650,0);
	@property({visible:true})
	private _duration:number=1.5;
	
	private _posRecord:cc.Vec3;
	private _widget:cc.Widget;
	
	protected onEnable():void{
		super.onEnable();
		//如果存在Widget组件，则手动调用对齐然后设置为不可用，否则会导致位置无法正常移动
		this._widget=this.node.getComponent(cc.Widget);
		if(this._widget){
			this._widget.updateAlignment();
			this._widget.enabled=false;
		}
		
		this._posRecord=this.node.position;
		this.node.position=this._from;
		
		cc.tween(this.node)
			.to(this._duration,{ position: this._posRecord })
			.call(()=>{ this.onComplete(); })
			.start();
		
	}
	
	private onComplete():void{
		//Widget组件对齐模式不为ONCE时恢复可用
		if(this._widget){
			if(this._widget.alignMode!=cc.Widget.AlignMode.ONCE){
				this._widget.enabled=true;
			}
		}
		this.node.emit(MoveFrom.COMPLETE);
	}
	
	protected onDisable():void{
		cc.Tween.stopAllByTarget(this.node);
		this.node.setPosition(this._posRecord);
		super.onDisable();
	}
}