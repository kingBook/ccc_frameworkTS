import BaseBehaviour from "./BaseBehaviour";
import SceneProgressBar from "./SceneProgressBar";

const{ccclass,property}=cc._decorator;
@ccclass
export default class SubpackageLoader extends BaseBehaviour{
	
	@property({type:SceneProgressBar,visible:true})
	private _sceneProgressBar:SceneProgressBar=null;
	
	private _isLoading:boolean;
	private _frameCount:number;
	private _virtualProgress:number;//假的加载进度[0,0.9]
	private _subpackageName:string;
	
	public loadSubpackage(subpackageName:string,completeCallback:(error:Error)=>void,progressVisible:boolean=true):void{
		if(progressVisible){
			this._subpackageName=subpackageName;
			this._sceneProgressBar.node.active=true;
			this._sceneProgressBar.setProgress(0);
			this._sceneProgressBar.setText("Loading subpackage "+subpackageName+" 0%...");
			//初始设置虚拟进度
			this._isLoading=true;
			this._frameCount=0;
			this._virtualProgress=0;
		}
		cc.loader.downloader.loadSubpackage(subpackageName,(err:Error)=>{
			if(progressVisible){
				this._sceneProgressBar.node.active=false;
				this._isLoading=false;//结束计算虚拟进度
			}
			completeCallback(err);
		});
	}
	
	protected update(dt:number):void{
		super.update(dt);
		if(this._isLoading){
			this._frameCount++;
			if(this._frameCount%2==0){
				this._frameCount=0;
				this._virtualProgress=Math.min(this._virtualProgress+0.01,0.9);
				this._sceneProgressBar.setProgress(this._virtualProgress);
				this._sceneProgressBar.setText("Loading subpackage "+this._subpackageName+" "+Math.floor(this._virtualProgress*100)+"%...");
			}
		}
	}
	
}