import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

var KEY=cc.Enum({});
Object.assign(KEY,cc.macro.KEY);

/**
 * 方向键盘输入
 * @property {cc.Vec2}  directionNormalized 表示按下的方向x和y的值只能是1或-1（每一帧都更新）。
 * @event {string} PRESS_ONCE (任何一个方向键按下时派发事件一次，松开再按下再派发一次事件)。
 * 	例：
 * ```
 * this.directionKeyboardInput.node.on(DirectionKeyboardInput.PRESS_ONCE,function(directionNormalized:cc.Vec2):void{
 * 	if(directionNormalized.y<0){
 * 		
 * 	}
 * },this);
 * ```
 */
@ccclass
export default class DirectionKeyboardInput extends BaseBehaviour{
	
	/** 按下一次事件，回调函数格式：
	 * ```
	 * (directionNormalized:cc.Vec2):void
	 * ```
	 */
	public static readonly PRESS_ONCE:string="pressOnce";
	
	private static readonly LEFT:number =0x0001;
	private static readonly RIGHT:number=0x0002;
	private static readonly UP:number   =0x0004;
	private static readonly DOWN:number =0x0008;
	private static readonly LEFT2:number =0x0010;
	private static readonly RIGHT2:number=0x0020;
	private static readonly UP2:number   =0x0040;
	private static readonly DOWN2:number =0x0080;
	
	@property({type:KEY,visible:true})
	private _leftKey:cc.macro.KEY=cc.macro.KEY.a;
	@property({type:KEY,visible:true})
	private _rightKey:cc.macro.KEY=cc.macro.KEY.d;
	@property({type:KEY,visible:true})
	private _upKey:cc.macro.KEY=cc.macro.KEY.w;
	@property({type:KEY,visible:true})
	private _downKey:cc.macro.KEY=cc.macro.KEY.s;
	
	@property({visible:true,})
	private _enableSecondKey:boolean=false;
	@property({type:KEY, visible(){return this._enableSecondKey;} })
	private _leftKey2:cc.macro.KEY=cc.macro.KEY.left;
	@property({type:KEY, visible(){return this._enableSecondKey;} })
	private _rightKey2:cc.macro.KEY=cc.macro.KEY.right;
	@property({type:KEY, visible(){return this._enableSecondKey;} })
	private _upKey2:cc.macro.KEY=cc.macro.KEY.up;
	@property({type:KEY, visible(){return this._enableSecondKey;} })
	private _downKey2:cc.macro.KEY=cc.macro.KEY.down;
	
	/** 用于记录按下方向键的标记（一个二进制位表示一个方向键） */
	private _pressKeyFlags:number=0;
	private _directionNormalized:cc.Vec2=cc.Vec2.ZERO;
	
	public get directionNormalized():cc.Vec2{ return this._directionNormalized; }
	
	protected onEnable():void{
		super.onEnable();
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
	}
	
	private onKeyDown(event:cc.Event.EventKeyboard):void{
		switch (event.keyCode){
			case this._leftKey:
				if((this._pressKeyFlags&(DirectionKeyboardInput.LEFT|DirectionKeyboardInput.LEFT2))===0){
					this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(-1,0));
				}
				this._pressKeyFlags|=DirectionKeyboardInput.LEFT;
				break;
			case this._rightKey:
				if((this._pressKeyFlags&(DirectionKeyboardInput.RIGHT|DirectionKeyboardInput.RIGHT2))===0){
					this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(1,0));
				}
				this._pressKeyFlags|=DirectionKeyboardInput.RIGHT;
				break;
			case this._upKey:
				if((this._pressKeyFlags&(DirectionKeyboardInput.UP|DirectionKeyboardInput.UP2))===0){
					this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(0,1));
				}
				this._pressKeyFlags|=DirectionKeyboardInput.UP;
				break;
			case this._downKey:
				if((this._pressKeyFlags&(DirectionKeyboardInput.DOWN|DirectionKeyboardInput.DOWN2))===0){
					this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(0,-1));
				}
				this._pressKeyFlags|=DirectionKeyboardInput.DOWN;
				break;
			case this._leftKey2:
				if(this._enableSecondKey){
					if((this._pressKeyFlags&(DirectionKeyboardInput.LEFT|DirectionKeyboardInput.LEFT2))===0){
						this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(-1,0));
					}
					this._pressKeyFlags|=DirectionKeyboardInput.LEFT2;
				}
				break;
			case this._rightKey2:
				if(this._enableSecondKey){
					if((this._pressKeyFlags&(DirectionKeyboardInput.RIGHT|DirectionKeyboardInput.RIGHT2))===0){
						this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(1,0));
					}
					this._pressKeyFlags|=DirectionKeyboardInput.RIGHT2;
				}
				break;
			case this._upKey2:
				if(this._enableSecondKey){
					if((this._pressKeyFlags&(DirectionKeyboardInput.UP|DirectionKeyboardInput.UP2))===0){
						this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(0,1));
					}
					this._pressKeyFlags|=DirectionKeyboardInput.UP2;
				}
				break;
			case this._downKey2:
				if(this._enableSecondKey){
					if((this._pressKeyFlags&(DirectionKeyboardInput.DOWN|DirectionKeyboardInput.DOWN2))===0){
						this.node.emit(DirectionKeyboardInput.PRESS_ONCE,new cc.Vec2(0,-1));
					}
					this._pressKeyFlags|=DirectionKeyboardInput.DOWN2;
				}
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
			case this._leftKey2:
				if(this._enableSecondKey){
					this._pressKeyFlags&=~DirectionKeyboardInput.LEFT2;
				}
				break;
			case this._rightKey2:
				if(this._enableSecondKey){
					this._pressKeyFlags&=~DirectionKeyboardInput.RIGHT2;
				}
				break;
			case this._upKey2:
				if(this._enableSecondKey){
					this._pressKeyFlags&=~DirectionKeyboardInput.UP2;
				}
				break;
			case this._downKey2:
				if(this._enableSecondKey){
					this._pressKeyFlags&=~DirectionKeyboardInput.DOWN2;
				}
				break;
			default:
				break;
		}
		this.updateDirectionNormalized();
	}
	
	private updateDirectionNormalized():void{
		let x:number=0,y:number=0;
		let horizontalValue=DirectionKeyboardInput.LEFT|DirectionKeyboardInput.LEFT2|DirectionKeyboardInput.RIGHT|DirectionKeyboardInput.RIGHT2;
		if((this._pressKeyFlags&horizontalValue)>0){
			x=(this._pressKeyFlags&(DirectionKeyboardInput.LEFT|DirectionKeyboardInput.LEFT2))>0?-1:1;
		}
		let verticalValue=DirectionKeyboardInput.UP|DirectionKeyboardInput.UP2|DirectionKeyboardInput.DOWN|DirectionKeyboardInput.DOWN2;
		if((this._pressKeyFlags&verticalValue)>0){
			y=(this._pressKeyFlags&(DirectionKeyboardInput.DOWN|DirectionKeyboardInput.DOWN2))>0?-1:1;
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