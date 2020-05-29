import BaseBehaviour from "./BaseBehaviour";
import BaseGame from "./BaseGame";

const {ccclass, property} = cc._decorator;

export enum Language{AUTO,CN,EN};

/** 整个应用程序的单例 */
@ccclass
export default class App extends BaseBehaviour{
	
	/** 改变语言事件，回调函数格式：():void */
	public static readonly CHANGE_LANGUAGE:string="changeLanguage";
	/** 暂停或恢复事件，回调函数格式：():void */
	public static readonly PAUSE_OR_RESUME:string="pauseOrResume";
	
	private static s_instance:App;
	public static get instance():App{
		return App.s_instance;
	}
	
	@property({type:cc.Enum(Language),visible:true})
	private _language:Language=Language.AUTO;
	@property({visible:true})
	private _enablePhysics2D:boolean=false;
	@property({visible:true})
	@property({displayName:"　　　Gravity 2D",visible:true})
	private _gravity2D:cc.Vec2=new cc.Vec2(0,-320);
	private _disablePhysics2DDebugDraw:boolean=false;
	@property({type:[BaseGame],visible:true})
	private _games:BaseGame[]=[];
	
	private _openCount:number;
	private _isPause:boolean;
	
	/** 返回应用的语言CN|EN */
	public get language():Language{
		return this._language;
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
		return this._games.length;
	}
	
	protected onLoad():void{
		super.onDestroy();
		App.s_instance=this;
		this.addOpenCount();

		if(this._language==Language.AUTO){
			this.initLanguage();
		}
		if(this._enablePhysics2D){
			this.initPhysics2D();
		}
		//标记为“常驻节点”，切换场景时不自动销毁
		cc.game.addPersistRootNode(this.node);
	}
	
	private addOpenCount():void{
		const key:string="applicationOpenCount";
		this._openCount=parseInt(cc.sys.localStorage.getItem(key,0))+1;
		cc.sys.localStorage.setItem(key,this._openCount);
	}
	
	private initPhysics2D():void{
		let physicsManager:cc.PhysicsManager=cc.director.getPhysicsManager();
		physicsManager.enabled=true;
		physicsManager.gravity=this._gravity2D;//必须在physicsManager.enabled=true;之后设置
		if(!this._disablePhysics2DDebugDraw){
			physicsManager.debugDrawFlags=cc.PhysicsManager.DrawBits.e_jointBit|
										  cc.PhysicsManager.DrawBits.e_shapeBit;
		}
	}
	
	private initLanguage():void{
		let isCN:boolean=cc.sys.language==cc.sys.LANGUAGE_CHINESE;
		this._language=isCN?Language.CN:Language.EN;
		//发送改变语言事件
		this.node.emit(App.CHANGE_LANGUAGE);
	}
	
	/** 设置应用暂停/恢复 */
	public setPause(isPause:boolean):void{
		if(this._isPause==isPause)return;
		this._isPause=isPause;
		
		if(this._isPause)cc.game.pause();
		else cc.game.resume();
		//发送暂停或恢复事件
		this.node.emit(App.PAUSE_OR_RESUME);
	}
	
	/** 返回指定索引的游戏实例 */
	public getGame<T extends BaseGame>(index:number=0):T{
		return <T>this._games[index];
	}
	
	protected onDestroy():void{
		super.onDestroy();
	}
	
}