import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;
/** 方向圆形手柄 */
@ccclass
export default class DirectionCircleHandle extends BaseBehaviour{
	/** 按下时的透明度 */
	private readonly OPACITY_ON_PRESSED:number=180;
	/** 未按下时的透明度 */
	private readonly OPACITY_ON_DISABLED:number=140;
	
	@property({type:cc.Node,visible:true})
	private _topNode:cc.Node=null;
	@property({visible:true,tooltip:"在圆形感应区域内点击，是否立即移动中间滑块到点击的位置"})
	private _snapOnTouchStart:boolean=true;
	@property({visible:true,tooltip:"表示在当前node坐标系下可移动的半径范围"})
	private _radius:number=80;
	
	private _isDraging:boolean;
	private _onTouchStartOffset:cc.Vec2;
	private _directionSize:cc.Vec2=cc.Vec2.ZERO;
	
	/** 输入的方向向量，值区间[-1,1]，表示输入的方向、大小（滑块离中心点越远越大）。 */
	public get directionSize():cc.Vec2{ return this._directionSize; }
	/** 输入的方向单位化向量，值区间[-1,1]，表示输入的方向，不表示大小。 */
	public get directionNormalized():cc.Vec2{ return this._directionSize.normalize(); }
	/** 输入的方向x,y都取值：1，-1，0 */
	public get directionOne():cc.Vec2{
		let v=new cc.Vec2();
		v.x=this._directionSize.x>0?1:this._directionSize.x<0?-1:0;
		v.y=this._directionSize.y>0?1:this._directionSize.y<0?-1:0;
		return v;
	 }
	
	protected onEnable():void{
		super.onEnable();
		//设置透明度
		this.node.opacity=this.OPACITY_ON_DISABLED;
		this.node.on(cc.Node.EventType.TOUCH_START,this.onTouchHandler,this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE,this.onTouchHandler,this);
		this.node.on(cc.Node.EventType.TOUCH_END,this.onTouchHandler,this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchHandler,this);
	}
	
	private onTouchHandler(event:cc.Event.EventTouch):void{
		if(event.type==cc.Node.EventType.TOUCH_START){
			this._isDraging=true;
			//touch在this.node坐标系的位置
			let touchPos=this.node.convertToNodeSpaceAR(event.touch.getLocation());
			if(this._snapOnTouchStart){
				this.setTopNodePosition(touchPos,true,true);
			}
			//记录touch点与圆心的偏移量
			this._onTouchStartOffset=touchPos.sub(this._topNode.getPosition());
			//设置透明度
			this.node.opacity=this.OPACITY_ON_PRESSED;
		}else if(event.type==cc.Node.EventType.TOUCH_MOVE){
			if(this._isDraging){
				let touchPos=this.node.convertToNodeSpaceAR(event.touch.getLocation());//touch在this.node坐标系的位置
				//减圆心偏移量得到要移动的位置
				let targetPos=touchPos.sub(this._onTouchStartOffset);
				this.setTopNodePosition(targetPos,true,true);
			}
		}else{
			this._isDraging=false;
			cc.Vec2.set(this._directionSize,0,0);
			//设置透明度
			this.node.opacity=this.OPACITY_ON_DISABLED;
		}
	}
	
	protected update(dt:number):void{
		super.update(dt);
		//释放时，移动回圆心
		if(!this._isDraging){
			let pos=this._topNode.getPosition();
			pos.mulSelf(0.8);
			this.setTopNodePosition(pos,false,false);
		}
	}
	
	/**
	 * 设置圆形滑块的位置
	 * @param pos 要设置的位置
	 * @param isLimitedToRadius 是否限制在半径指定的圆形范围内
	 * @param isCalculateDirectionSize 
	 */
	private setTopNodePosition(pos:cc.Vec2,isLimitedToRadius:boolean,isCalculateDirectionSize:boolean):void{
		//限制在半径指定的圆形范围内
		if(isLimitedToRadius){
			if(pos.len()>this._radius){
				pos=pos.normalizeSelf().mulSelf(this._radius);
			}
		}
		this._topNode.setPosition(pos);
		//计算输入方向
		if(isCalculateDirectionSize){
			cc.Vec2.set(this._directionSize, pos.x/this._radius,pos.y/this._radius);
		}
	}
	
	protected onDisable():void{
		cc.Vec2.set(this._directionSize,0,0);
		this.node.off(cc.Node.EventType.TOUCH_START,this.onTouchHandler,this);
		this.node.off(cc.Node.EventType.TOUCH_END,this.onTouchHandler,this);
		this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchHandler,this);
		super.onDisable();
	}
}