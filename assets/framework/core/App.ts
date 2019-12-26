import BaseGame from "./BaseGame";
import BaseBehaviour from "./BaseBehaviour";

const {ccclass, property} = cc._decorator;

enum Language{AUTO,CN,EN}

@ccclass
export default class App extends BaseBehaviour{
	public static readonly CHANGE_LANGUAGE:string="changeLanguage";
	public static readonly PAUSE_OR_RESUME:string="pauseOrResume";
	
	private static m_instance:App;
	public static get instance():App{
		return App.m_instance;
	}
	
	@property({type:cc.Enum(Language),displayName:"Language"})
	private m_language:Language=Language.AUTO;
	@property({type:[BaseGame]})
	private games:BaseGame[]=[];
	
	private m_isFirstOpen:boolean;
	private m_isPause:boolean;
	
	
	public get language():Language{
		return this.m_language;
	}
	public get isFirstOpen():boolean{
		return this.m_isFirstOpen;
	}
	public get isPause():boolean{
		return this.m_isPause;
	}
	public get gameCount():number{
		return this.games.length;
	}
	
	
	protected onLoad():void{
		super.onDestroy();
		App.m_instance=this;
		this.initFirstOpenApp();

		if(this.m_language==Language.AUTO){
			this.initLanguage();
		}
	}
	
	private initFirstOpenApp():void{
		const key:string="isFirstOpenApp";
		this.m_isFirstOpen=cc.sys.localStorage.getItem(key,1)==1;
		if(this.m_isFirstOpen) {
			cc.sys.localStorage.setItem(key,0);
		}
	}
	
	private initLanguage():void{
		var isCN:boolean=cc.sys.language==cc.sys.LANGUAGE_CHINESE;
		this.m_language=isCN?Language.CN:Language.EN;
		//改变语言事件
		this.node.dispatchEvent(new cc.Event.EventCustom(App.CHANGE_LANGUAGE,false));
	}
	
	public setPause(isPause:boolean):void{
		if(this.m_isPause==isPause)return;
		this.m_isPause=isPause;
		
		if(this.m_isPause)cc.game.pause();
		else cc.game.resume();
		
		this.node.dispatchEvent(new cc.Event.EventCustom(App.PAUSE_OR_RESUME,false));
	}
	
	public getGame(index:number=0):BaseGame{
		return this.games[index];
	}
	
	protected onDestroy():void{
		super.onDestroy();
	}
	
}