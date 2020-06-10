import BaseBehaviour from "../../core/BaseBehaviour";


const{ccclass,property}=cc._decorator;
/** 交换Sprite组件的SpriteFrame */
@ccclass
export default class SwapSpriteFrame extends BaseBehaviour{
    @property({type:cc.Sprite,visible:true,tooltip:"用于切换SpriteFrame的Sprite组件,null时自动从当前节点获取"})
	private _sprite:cc.Sprite=null;
    @property({type:[cc.SpriteFrame],visible:true,tooltip:"切换的SpriteFrame列表，长度为:2"})
	private _spriteFrames:cc.SpriteFrame[]=[null,null];
	
	protected onLoad():void{
		super.onLoad();
		//
		if(this._sprite==null){
			this._sprite=this.getComponent(cc.Sprite);
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