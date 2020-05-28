import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

/** 方向键盘输入 */
@ccclass
export default class DirectionKeyboardInput extends BaseBehaviour{
	
	private static readonly LEFT:number =0x0001;
	private static readonly RIGHT:number=0x0002;
	private static readonly UP:number   =0x0004;
	private static readonly DOWN:number =0x0008;
	
	@property({type:cc.Enum(cc.macro.KEY),visible:true})
	private _leftKey:cc.macro.KEY=cc.macro.KEY.a;
	
	@property({type:cc.Enum(cc.macro.KEY),visible:true})
	private _rightKey:cc.macro.KEY=cc.macro.KEY.d;
	
	@property({type:cc.Enum(cc.macro.KEY),visible:true})
	private _upKey:cc.macro.KEY=cc.macro.KEY.w;
	
	@property({type:cc.Enum(cc.macro.KEY),visible:true})
	private _downKey:cc.macro.KEY=cc.macro.KEY.s;
	
	private _pressKeyFlags:number=0;//用于记录按下方向键的标记（一个二进制位表示一个方向键是否按下）
	private _directionNormalized:cc.Vec2=cc.Vec2.ZERO;
	
	public get directionNormalized():cc.Vec2{ return this._directionNormalized; }
	
	protected onEnable():void{
		super.onEnable();
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
	}
	
	private onKeyDown(event:cc.Event.EventKeyboard):void{
		switch (event.keyCode) {
			case this._leftKey:
				this._pressKeyFlags|=DirectionKeyboardInput.LEFT;
				break;
			case this._rightKey:
				this._pressKeyFlags|=DirectionKeyboardInput.RIGHT;
				break;
			case this._upKey:
				this._pressKeyFlags|=DirectionKeyboardInput.UP;
				break;
			case this._downKey:
				this._pressKeyFlags|=DirectionKeyboardInput.DOWN;
				break;
			default:
				break;
		}
		this.updateDirectionNormalized();
	}
	
	private onKeyUp(event:cc.Event.EventKeyboard):void{
		switch (event.keyCode) {
			case this._leftKey:
				this._pressKeyFlags&=~DirectionKeyboardInput.LEFT;
				break;
			case this._rightKey:
				this._pressKeyFlags&=~DirectionKeyboardInput.RIGHT;
				break;
			case this._upKey:
				this._pressKeyFlags&=~DirectionKeyboardInput.UP;
				break;
			case this._downKey:
				this._pressKeyFlags&=~DirectionKeyboardInput.DOWN;
				break;
			default:
				break;
		}
		this.updateDirectionNormalized();
	}
	
	private updateDirectionNormalized():void{
		let x:number=0,y:number=0;
		if((this._pressKeyFlags&(DirectionKeyboardInput.LEFT|DirectionKeyboardInput.RIGHT))>0){
			x=(this._pressKeyFlags&DirectionKeyboardInput.LEFT)>0?-1:1;
		}
		if((this._pressKeyFlags&(DirectionKeyboardInput.UP|DirectionKeyboardInput.DOWN))>0){
			y=(this._pressKeyFlags&DirectionKeyboardInput.DOWN)>0?-1:1;
		}
		this._directionNormalized.x=x;
		this._directionNormalized.y=y;
	}
	
	protected onDisable():void{
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
		this._pressKeyFlags=0;
		this.updateDirectionNormalized();
		super.onDisable();
	}
	
}