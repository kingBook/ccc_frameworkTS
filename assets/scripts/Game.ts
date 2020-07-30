import BaseGame from "../framework/core/BaseGame";

const {ccclass, property} = cc._decorator;

/** 管理游戏全局变量、本地数据、场景切换，不访问关卡内的对象,使用以下代码访问：let game=App.instance.getGame<Game>();*/
@ccclass
export default class Game extends BaseGame{
	
	/** 是否解锁关卡 */
	public static readonly isUnlockLevel:boolean=true;
	
	/** 最大的关卡数 */
	public static readonly maxLevelNumber:number=30;
	
	/** 保存关卡数字到本地（已通关的最大数字 */
	public static setLevelNumberLocal(levelNumber:number):void{
		PlayerPrefs.setInt("levelNumber",levelNumber);
	}
	
	/** 返回本地保存的关卡数字（已通关的最大数字），如果没有保存，则默认返回0 */
	public static getLevelNumberLocal():number{
		return PlayerPrefs.getInt("levelNumber",0);
	}
	
	/** 返回[1,maxLevel]区间内已解锁的最关卡数字（[1,maxLevel]区间内已通关的最大数字+1），如果 Game.isUnlockLevel=true ，那么返回 Game.maxLevelNumber */
	public static getUnlockLevelNumber():number{
		let n=Mathk.clamp(Game.getLevelNumberLocal()+1,1,Game.maxLevelNumber);
		if(Game.isUnlockLevel)n=Game.maxLevelNumber;
		return n;
	}
	
	
	private _levelNumber:number;
	
	public get levelNumber():number{ return this._levelNumber; }
	
	protected onLoad():void{
		super.onLoad();
		cc.log("===Game by (kingBook)===");
		
	}
	
	protected start():void{
		super.start();
		this.gotoTitleScene();
	}
	
	public gotoTitleScene(){
		cc.director.loadScene("title");
	}
	
	public gotoLevelScene(levelNumber:number){
		this._levelNumber=levelNumber;
		
		cc.director.loadScene("level");
	}
	
}