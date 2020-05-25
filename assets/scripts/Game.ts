import BaseGame from "../framework/core/BaseGame";

const {ccclass, property} = cc._decorator;

/** 管理游戏全局变量、本地数据、场景切换，不访问关卡内的对象*/
@ccclass
export default class Game extends BaseGame{
	
	protected onLoad():void{
		super.onLoad();
		cc.log("===Game.onLoad()===");
		
	}
	
	protected start():void{
		super.start();
		this.gotoTitleScene();
	}
	
	public gotoTitleScene(){
		cc.director.loadScene("scenes/title");
	}
	
	public gotoLevelScenen(){
		cc.director.loadScene("scenes/level");
	}
	
}