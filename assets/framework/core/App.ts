import BaseBehaviour from "./BaseBehaviour";
import BaseGame from "./BaseGame";

const {ccclass, property} = cc._decorator;

export enum Language{AUTO,CN,EN};

/** 整个应用程序的单例 */
@ccclass
export default class App extends BaseBehaviour{
	
	public static readonly CHANGE_LANGUAGE:string="changeLanguage";
	public static readonly PAUSE_OR_RESUME:string="pauseOrResume";
	
	private static _instance:App;
	public static get instance():App{
		return App._instance;
	}
	
	@property({type:cc.Enum(Language),displayName:"Language"})
	private m_language:Language=Language.AUTO;
	@property({type:[BaseGame]})
	private games:BaseGame[]=[];
	
	private _openCount:number;
	private _isPause:boolean;
	
	/** 返回应用的语言CN|EN */
	public get language():Language{
		return this.m_language;
	}
	/** 返回应用打开的次数 */
	public get openCount():number{
		return this._openCount;
	}
	/** 返回应用是否已暂停 */
	public get isPause():boolean{
		return this._isPause;
	}
	/** 返回应用内拥有的游戏实例个数 */
	public get gameCount():number{
		return this.games.length;
	}
	
	protected onLoad():void{
		super.onDestroy();
		App._instance=this;
		this.addOpenCount();

		if(this.m_language==Language.AUTO){
			this.initLanguage();
		}
		//标记为“常驻节点”，切换场景时不自动销毁
		cc.game.addPersistRootNode(this.node);
	}
	
	private addOpenCount():void{
		const key:string="applicationOpenCount";
		this._openCount=parseInt(cc.sys.localStorage.getItem(key,0))+1;
		cc.sys.localStorage.setItem(key,this._openCount);
	}
	
	private initLanguage():void{
		var isCN:boolean=cc.sys.language==cc.sys.LANGUAGE_CHINESE;
		this.m_language=isCN?Language.CN:Language.EN;
		//改变语言事件
		this.node.dispatchEvent(new cc.Event.EventCustom(App.CHANGE_LANGUAGE,false));
	}
	
	/** 设置应用暂停/恢复 */
	public setPause(isPause:boolean):void{
		if(this._isPause==isPause)return;
		this._isPause=isPause;
		
		if(this._isPause)cc.game.pause();
		else cc.game.resume();
		
		this.node.dispatchEvent(new cc.Event.EventCustom(App.PAUSE_OR_RESUME,false));
	}
	
	/** 返回指定索引的游戏实例 */
	public getGame<T extends BaseGame>(index:number=0):T{
		return <T>this.games[index];
	}
	
	protected onDestroy():void{
		super.onDestroy();
	}
	
}