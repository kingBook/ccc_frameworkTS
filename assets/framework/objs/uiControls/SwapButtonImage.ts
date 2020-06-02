import BaseBehaviour from "../../core/BaseBehaviour";
import SwapSpriteFrame from "../SwapSpriteFrame";

const {ccclass,requireComponent}=cc._decorator;

/** 交换按钮图片 */
@ccclass
@requireComponent(SwapSpriteFrame)
@requireComponent(cc.Button)
export default class SwapButtonImage extends BaseBehaviour{
	private _button:cc.Button;
	private _swapSpriteFrame:SwapSpriteFrame;
	
	protected onLoad():void{
		super.onLoad();
		this._button=this.getComponent(cc.Button);
		this._swapSpriteFrame=this.getComponent(SwapSpriteFrame);
		//添加onClick函数到按钮点击事件列表
		this._button.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
	}
	
	private onTouchStart(event:cc.Event.EventTouch):void{
		this._swapSpriteFrame.autoSwap();
	}
	
	protected onDestroy():void{
		this._button.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
		super.onDestroy();
	}
	
}
