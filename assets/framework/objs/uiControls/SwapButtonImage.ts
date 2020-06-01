import BaseBehaviour from "../../core/BaseBehaviour";

const {ccclass, property} = cc._decorator;

/** 交换按钮图片 */
@ccclass
export default class SwapButtonImage extends BaseBehaviour{
	
	@property({type:[cc.SpriteFrame],visible:true,tooltip:"切换的图片列表，长度为:2"})
	private _spriteFrames:cc.SpriteFrame[]=[];
	
	@property({type:cc.Sprite,visible:true,tooltip:"用于切换图片的Sprite组件,null时取Button.target的Sprite"})
	private _sprite:cc.Sprite=null;
	
	@property({visible:true,tooltip:"点击按钮是否自动切换图片"})
	private _isSwapOnClick:boolean=true;
	
	private _button:cc.Button;
	
	protected onLoad():void{
		super.onLoad();
		this._button=this.getComponent(cc.Button);
		//添加onClick函数到按钮点击事件列表
		if(this._isSwapOnClick){
			this._button.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
		}
		//
		if(this._sprite==null){
			this._sprite=this._button.target.getComponent(cc.Sprite);
		}
	}
	
	private onTouchStart(event:cc.Event.EventTouch):void{
		this.autoSwap();
	}
	
	public autoSwap():void{
		if(this._sprite.spriteFrame==this._spriteFrames[0]){
			this.swapTo(1);
		}else{
			this.swapTo(0);
		}
	}

	public swapTo(spriteFrameId:number):void{
		this._sprite.spriteFrame=this._spriteFrames[spriteFrameId];
	}
	
	protected onDestroy():void{
		if(this._isSwapOnClick){
			this._button.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
		}
		super.onDestroy();
	}
	
}
