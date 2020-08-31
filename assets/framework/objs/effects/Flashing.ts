import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

@ccclass
export default class Flashing extends BaseBehaviour{
	
	/** 完成事件，回调函数格式：():void */
	public static readonly COMPLETE:string="complete";
	
	@property({tooltip:"闪烁间隔"})
	public interval:number=0.03;
	private _isFlashing:boolean;
	private _opacityRecord:number;
	
	public get isFlashing():boolean{ return this._isFlashing; }
	
	/**
	 * 开始闪烁
	 * @param time 闪烁的时间<秒>
	 */
	public startFlashing(time:number=3):void{
		if(this._isFlashing)return;
		this._isFlashing=true;
		this._opacityRecord=this.node.opacity;
		let t=cc.tween(this.node);
		t.repeat(Math.floor(time/(2*this.interval)),
			t.to(this.interval,{opacity:0})
			.to(this.interval,{opacity:255})
		)
		.call(()=>{
			this.onComplete();
		})
		.start();
	}
	
	/**
	 * 结束闪烁
	 * @param isEmitComppleteEvent 是否发送闪烁完成事件
	 */
	public endFlashing(isEmitComppleteEvent:boolean=false):void{
		if(this._isFlashing){
			this._isFlashing=false;
			this.node.opacity=this._opacityRecord;
			if(isEmitComppleteEvent){
				this.node.emit(Flashing.COMPLETE);
			}
		}
	}
	
	private onComplete():void{
		this._isFlashing=false;
		this.node.opacity=this._opacityRecord;
		this.node.emit(Flashing.COMPLETE);
	}
	
	protected onDestroy():void{
		cc.Tween.stopAllByTarget(this.node);
		super.onDestroy();
	}
	
}