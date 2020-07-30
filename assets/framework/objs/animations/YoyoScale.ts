import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;
@ccclass
export default class YoyoScale extends BaseBehaviour{
	@property
	public endScale:number=1.2;
	@property
	public duration:number=0.5;
	
	private _startScale:number;
	
	protected onLoad():void{
		super.onLoad();
		this._startScale=this.node.scale;
	}
	
	protected start():void{
		super.start();
		let t=cc.tween(this.node);
		t.repeatForever(
			t.to(this.duration,{scale:this.endScale})
			 .to(this.duration,{scale:this._startScale})
		).start();
	}
}