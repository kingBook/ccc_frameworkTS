import BaseBehaviour from "../../core/BaseBehaviour";
import App, { Language } from "../../core/App";
import SwapSpriteFrame from "./SwapSpriteFrame";
/**
 * 根据语言自动交换图片
 */
const {ccclass,property}=cc._decorator;
@ccclass
export default class LanguageSwapImage extends BaseBehaviour{
	@property({type:cc.Sprite,visible:true})
	private _sprite:cc.Sprite=null;
	@property({type:cc.SpriteFrame,visible:true})
	private _en:cc.SpriteFrame=null;
	@property({type:cc.SpriteFrame,visible:true})
	private _cn:cc.SpriteFrame=null;
	
	protected resetInEditor():void{
		super.resetInEditor();
		if(this._sprite===null){
			let tempSprite=this.getComponent(cc.Sprite);
			if(tempSprite){
				this._sprite=tempSprite;
			}else{
				let button=this.getComponent(cc.Button);
				if(button && button.target){
					this._sprite=button.target.getComponent(cc.Sprite);
				}
			}
		}
	}
	
	protected onLoad():void{
		super.onLoad();
	}
	
	protected start():void{
		super.start();
		this.swapToLanguage(App.instance.language);
		App.instance.node.on(App.CHANGE_LANGUAGE,this.onChangeLanguage,this);
	}
	
	private onChangeLanguage(language:Language):void{
		this.swapToLanguage(language);
	}
	
	private swapToLanguage(language:Language):void{
		this._sprite.spriteFrame=(language===Language.EN)?this._en:this._cn;
	}
	
	protected onDestroy():void{
		App.instance.node.off(App.CHANGE_LANGUAGE,this.onChangeLanguage,this);
		super.onDestroy();
	}
	
}