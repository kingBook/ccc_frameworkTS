import BaseBehaviour from "./BaseBehaviour";
import Mathk from "../utils/Mathk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneProgressBar extends BaseBehaviour{
	
	@property({type:cc.ProgressBar,visible:true})
	private _progressbar:cc.ProgressBar=null;
	
	@property({type:cc.Label,visible:true})
	private _label:cc.Label=null;
	
	protected onEnable():void{
		super.onEnable();
		//当前节点不在Canvas内，每次激活重新计算大小和缩放
		let winSize=cc.winSize;
		this.node.setPosition(winSize.width*0.5,winSize.height*0.5);
		this.node.scale=winSize.width/960;
	}
	
	/**
	 * 设置显示的进度
	 * @param value 范围：[0,1]
	 */
	public setProgress(value:number):void{
		this._progressbar.progress=Mathk.clamp01(value);
	}
	
	/**
	 * 设置进度条上的文本
	 * @param textString 显示的字符串
	 */
	public setText(textString:string):void{
		this._label.string=textString;
	}
}
