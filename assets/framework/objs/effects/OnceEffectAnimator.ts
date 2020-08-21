import BaseBehaviour from "../../core/BaseBehaviour";

const {ccclass,property,requireComponent}=cc._decorator;
/**
 * 一次性特效播放
 */
@ccclass
@requireComponent(cc.Animation)
export default class OnceEffectAnimator extends BaseBehaviour{
	
	/** 播放完成事件 */
	public static readonly COMPLETE:string="complete";
	
	@property({type:cc.Animation,visible:true})
	private _animation:cc.Animation=null;
	@property({visible:true})
	private _clipKey:string="";
	@property({visible:true})
	private _startTime:number=0;
	@property({visible:true})
	private _isDestroyOnComplete:boolean=true;
	@property({visible:true})
	private _isPlayOnEnable:boolean=true;
	private _isPlaying:boolean;
	
	public get isPlaying():boolean{
		return this._isPlaying;
	}
	
	protected resetInEditor():void{
		super.resetInEditor();
		if(!this._animation){
			this._animation=this.node.getComponent(cc.Animation);
		}
		if(!this._clipKey){
			if(this._animation){
				if(this._animation.defaultClip){
					this._clipKey=this._animation.defaultClip.name;
				}else if(this._animation.getClips().length>0){
					let clip0=this._animation.getClips()[0];
					if(clip0){
						this._clipKey=clip0.name;
					}
				}
			}
		}
	}
	
	protected onLoad():void{
		super.onLoad();
		if(!this._isPlayOnEnable){
			this.node.active=false;
		}
	}
	
	protected onEnable():void{
		super.onEnable();
		if(this._isPlayOnEnable){
			this.play();
		}
	}
	
	protected start():void{
		super.start();
	}
	
	public play():void{
		if(this._isPlaying)return;
		this._isPlaying=true;
		this.node.active=true;
		let animState=this._animation.play(this._clipKey,this._startTime);
		animState.wrapMode=cc.WrapMode.Normal;
		this._animation.once("finished",this.onComplete,this);
	}
	
	private onComplete():void{
		this._isPlaying=false;
		this.node.active=false;
		this.node.emit(OnceEffectAnimator.COMPLETE);
		
		if(this._isDestroyOnComplete){
			this.node.destroy();
		}
	}
	
	protected onDestroy():void{
		if(this._isPlaying && this._animation){
			this._animation.off("finished",this.onComplete,this);
		}
		super.onDestroy();
	}
	
}