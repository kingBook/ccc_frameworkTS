import BaseBehaviour from "../../core/BaseBehaviour";
import App, { Language } from "../../core/App";

const{ccclass,property}=cc._decorator;
/**
 * 根据当前应用程序的语言激活/吊销列表中的Node
 */
@ccclass
export default class LanguageSwitcher extends BaseBehaviour{
	
	@property({type:[cc.Node],visible:true,tooltip:"英文时，需要激活的Node列表"})
	private _enNodes:cc.Node[]=[];
	@property({type:[cc.Node],visible:true,tooltip:"中文时，需要激活的Node列表"})
	private _cnNodes:cc.Node[]=[];
	
	protected start():void{
		super.start();
		this.activeWithLanguage(App.instance.language);
		App.instance.node.on(App.CHANGE_LANGUAGE,this.onChangeLanguage,this);
	}
	
	private activeWithLanguage(language:Language):void{
		if(language==Language.AUTO)return;
		let activeNodes:cc.Node[]=null;
		let deactiveNodes:cc.Node[]=null;
		if(language==Language.EN){
			activeNodes=this._enNodes;
			deactiveNodes=this._cnNodes;
		}else if(language==Language.CN){
			activeNodes=this._cnNodes;
			deactiveNodes=this._enNodes;
		}
		
		let i=activeNodes.length;
		while(--i>=0){
			activeNodes[i].active=true;
		}
		i=deactiveNodes.length;
		while(--i>=0){
			deactiveNodes[i].active=false;
		}
	}
	
	private onChangeLanguage(language:Language):void{
		this.activeWithLanguage(language);
	}
	
	public addToCnNodes(node:cc.Node):void{
		let index=this._cnNodes.indexOf(node);
		if(index<0)this._cnNodes.push(node);
	}
	
	public addToEnNodes(node:cc.Node):void{
		let index=this._enNodes.indexOf(node);
		if(index<0)this._enNodes.push(node);
	}
	
	protected onDestroy():void{
		App.instance.node.off(App.CHANGE_LANGUAGE,this.onChangeLanguage,this);
		super.onDestroy();
	}
}