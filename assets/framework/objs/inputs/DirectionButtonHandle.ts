import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

/** 方向按钮手柄 */
@ccclass
export default class DirectionButtonHandle extends BaseBehaviour{
	
	private static readonly LEFT:number =0x0001;
	private static readonly RIGHT:number=0x0002;
	private static readonly UP:number   =0x0004;
	private static readonly DOWN:number =0x0008;
	
	@property({type:cc.Button,visible:true})
	private _buttonLeft:cc.Button=null;
	
	@property({type:cc.Button,visible:true})
	private _buttonRight:cc.Button=null;
	
	@property({type:cc.Button,visible:true})
	private _buttonUp:cc.Button=null;
	
	@property({type:cc.Button,visible:true})
	private _buttonDown:cc.Button=null;
	
	@property({type:cc.Button,visible:true,tooltip:"可选的，两个玩家时使用"})
	private _buttonSwapPlayer:cc.Button=null;
   
	protected _pressKeyFlags:number=0;//用于记录按下方向键的标记（一个二进制位表示一个方向键是否按下）
	private _playerId:number=0;
	private _directionNormalized:cc.Vec2=cc.Vec2.ZERO;
	
	public get playerId():number{ return this._playerId; }
	public get directionNormalized():cc.Vec2{ return this._directionNormalized; }
	
	
	protected onEnable():void{
		super.onEnable();
		if(this._buttonLeft!=null){
			this._buttonLeft.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonLeft.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonLeft.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonRight!=null){
			this._buttonRight.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonRight.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonRight.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonUp!=null){
			this._buttonUp.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonUp.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonUp.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonDown!=null){
			this._buttonDown.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonDown.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonDown.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonSwapPlayer!=null){
			this._buttonSwapPlayer.node.on(cc.Node.EventType.TOUCH_START,this.onTouchSwapPlayerStart,this);
		}
	}
	
	private onTouchStart(event:cc.Event.EventTouch):void{
		let isLeft=this._buttonLeft!=null&&event.target==this._buttonLeft.node;
		let isRight=this._buttonRight!=null&&event.target==this._buttonRight.node;
		let isUp=this._buttonUp!=null&&event.target==this._buttonUp.node;
		let isDown=this._buttonDown!=null&&event.target==this._buttonDown.node;
		if(isLeft){
			this._pressKeyFlags|=DirectionButtonHandle.LEFT;
		}else if(isRight){
			this._pressKeyFlags|=DirectionButtonHandle.RIGHT;
		}else if(isUp){
			this._pressKeyFlags|=DirectionButtonHandle.UP;
		}else if(isDown){
			this._pressKeyFlags|=DirectionButtonHandle.DOWN;
		}
		this.updateDirectionNormalized();
	}
	
	private onTouchEnd(event:cc.Event.EventTouch):void{
		let isLeft=this._buttonLeft!=null&&event.target==this._buttonLeft.node;
		let isRight=this._buttonRight!=null&&event.target==this._buttonRight.node;
		let isUp=this._buttonUp!=null&&event.target==this._buttonUp.node;
		let isDown=this._buttonDown!=null&&event.target==this._buttonDown.node;
		if(isLeft){
			this._pressKeyFlags&=~DirectionButtonHandle.LEFT;
		}else if(isRight){
			this._pressKeyFlags&=~DirectionButtonHandle.RIGHT;
		}else if(isUp){
			this._pressKeyFlags&=~DirectionButtonHandle.UP;
		}else if(isDown){
			this._pressKeyFlags&=~DirectionButtonHandle.DOWN;
		}
		this.updateDirectionNormalized();
	}
	
	private updateDirectionNormalized():void{
		let x:number=0,y:number=0;
		if((this._pressKeyFlags&(DirectionButtonHandle.LEFT|DirectionButtonHandle.RIGHT))>0){
			x=(this._pressKeyFlags&DirectionButtonHandle.LEFT)>0?-1:1;
		}
		if((this._pressKeyFlags&(DirectionButtonHandle.UP|DirectionButtonHandle.DOWN))>0){
			y=(this._pressKeyFlags&DirectionButtonHandle.DOWN)>0?-1:1;
		}
		
		this._directionNormalized.x=x;
		this._directionNormalized.y=y;
	}
	
	private onTouchSwapPlayerStart(event:cc.Event.EventTouch,customData:any){
		this._playerId=this._playerId==0?1:0;
	}
	
	protected onDisable():void{
		if(this._buttonLeft!=null){
			this._buttonLeft.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonLeft.node.off(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonLeft.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonRight!=null){
			this._buttonRight.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonRight.node.off(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonRight.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonUp!=null){
			this._buttonUp.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonUp.node.off(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonUp.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonDown!=null){
			this._buttonDown.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
			this._buttonDown.node.off(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
			this._buttonDown.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
		}
		if(this._buttonSwapPlayer!=null){
			this._buttonSwapPlayer.node.off(cc.Node.EventType.TOUCH_START,this.onTouchSwapPlayerStart,this);
		}
		this._pressKeyFlags=0;
		this.updateDirectionNormalized();
		super.onDisable();
	}
	
}