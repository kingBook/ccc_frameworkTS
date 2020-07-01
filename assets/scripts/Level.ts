import BaseBehaviour from "../framework/core/BaseBehaviour";
import Game from "./Game";
import App from "../framework/core/App";

const{ccclass}=cc._decorator;

/**
 * 关卡类（管理关卡内的对象）
 */
@ccclass
export default class Level extends BaseBehaviour{
	
	private _game:Game;
	
	protected onLoad():void{
		super.onLoad();
		this._game=App.instance.getGame<Game>();
	}
	
	protected start():void{
		
	}
	
	public victory():void{
		
	}
	
	public failure():void{
		
	}
	
	protected onDestroy():void{
		super.onDestroy();
	}
	
}