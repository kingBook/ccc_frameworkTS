import BaseBehaviour from "../../core/BaseBehaviour";


const{ccclass,property}=cc._decorator;
/** 交换Sprite组件的SpriteFrame */
@ccclass
export default class SwapSpriteFrame extends BaseBehaviour{
    @property({type:cc.Sprite,visible:true,tooltip:"用于切换SpriteFrame的Sprite组件"})
	private _sprite:cc.Sprite=null;
    @property({type:[cc.SpriteFrame],visible:true,tooltip:"切换的SpriteFrame列表，长度为:2"})
	private _spriteFrames:cc.SpriteFrame[]=[null,null];
	
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
}