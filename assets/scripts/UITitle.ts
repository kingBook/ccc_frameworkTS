import App from "../framework/core/App";
import Game from "./Game";
import UIBase from "../framework/objs/uiControls/UIBase";
import PlayerPrefs from "../framework/core/PlayerPrefs";

const {ccclass,property}=cc._decorator;

/** 标题场景的UI */
@ccclass
export default class UITitle extends UIBase{
	
	/**
	 * 点击“开始游戏按钮”时（编辑器引用）
	 * @param event 
	 * @param customEventData 
	 */
	public onStartGame(event:cc.Event.EventTouch,customEventData:any):void{
		App.instance.getGame<Game>().gotoLevelScene();
	}
	
	/**
	 * 清除本地数据（编辑器引用）
	 * @param event 
	 * @param customEventData 
	 */
	public onClearLocal(event:cc.Event.EventTouch,customEventData:any):void{
		PlayerPrefs.deleteAll();
	}
	
}

