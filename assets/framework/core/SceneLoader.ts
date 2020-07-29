import BaseBehaviour from "./BaseBehaviour";
import SceneProgressBar from "./SceneProgressBar";

const {ccclass,property}=cc._decorator;

@ccclass
export default class SceneLoader extends BaseBehaviour{
	
	@property({type:SceneProgressBar,visible:true})
	private _sceneProgressBar:SceneProgressBar=null;
	
	private _frameCount:number;
	private _isLoading:boolean=false;
	private _virtualProgress;//假的加载进度[0,0.9]
	private _sceneName:string;
	
	/**
	 * 通过场景名称进行加载场景。
	 * @param sceneName 加载场景的名称
	 * @param progressVisible 默认为 false，是否显示进度条
	 * @param isDestroyCurrentSceneChildren 默认为 true，是否删除当前逻辑场景的所有非常驻节点
	 * @param onLaunched 场景启动时的回调函数
	 * @returns 如果出错则返回false
	 */
	public load(sceneName:string,progressVisible:boolean=false,isDestroyCurrentSceneChildren:boolean=true,onLaunched?:Function):boolean{
		if(isDestroyCurrentSceneChildren)this.destroyCurrentLogicSceneChildren(false);
		if(progressVisible){
			this._sceneName=sceneName;
			this._sceneProgressBar.node.active=true;
			this._sceneProgressBar.setProgress(0);
			this._sceneProgressBar.setText("Loading scene "+this._sceneName+".fire 0%...");
			//初始设置虚拟进度
			this._isLoading=true;
			this._frameCount=0;
			this._virtualProgress=0;
		}
		//
		let isErr:boolean=cc.director.loadScene(sceneName,()=>{
			if(progressVisible){
				this._sceneProgressBar.node.active=false;
				this._isLoading=false;//结束计算虚拟进度
			}
			if(onLaunched)onLaunched();
		});
		return isErr;
	}
	
	/**
	 * 异步加载场景
	 * @param sceneName 加载场景的名称
	 * @param progressVisible 默认为 true，是否显示进度条
	 * @param isDestroyCurrentSceneChildren 默认为 true，是否删除当前逻辑场景的所有非常驻节点
	 * @param isLaunchOnLoaded 默认为 true，加载场景完成时是否启动场景
	 * @param onProgress 加载过程中的回调函数，格式：(completedCount:number,totalCount:number,item:any):void
	 * @param onLoaded 场景加载完成时的回调函数，格式：(error:Error):void
	 */
	public preload(sceneName:string,progressVisible:boolean=true,isDestroyCurrentSceneChildren:boolean=true,isLaunchOnLoaded:boolean=true,onProgress?:(completedCount:number,totalCount:number,item:any)=>void, onLoaded?:(error:Error)=>void):void{
		if(isDestroyCurrentSceneChildren)this.destroyCurrentLogicSceneChildren(false);
		if(progressVisible){
			this._sceneName=sceneName;
			this._sceneProgressBar.node.active=true;
			this._sceneProgressBar.setProgress(0);
			this._sceneProgressBar.setText("Loading scene "+this._sceneName+".fire 0%...");
			//初始设置虚拟进度
			this._isLoading=true;
			this._frameCount=0;
			this._virtualProgress=0;
		}
		//
		cc.director.preloadScene(sceneName,
			(completedCount:number,totalCount:number,item:any)=>{
				if(progressVisible){
					let progress:number=Math.max(this._virtualProgress,completedCount/totalCount);
					this._sceneProgressBar.setProgress(progress);
					this._sceneProgressBar.setText("Loading scene "+this._sceneName+".fire "+Math.floor(progress*100)+"%...");
					this._virtualProgress=progress;
				}
				if(onProgress)onProgress(completedCount,totalCount,item);
			},
			(error:Error)=>{
				if(progressVisible){
					this._sceneProgressBar.node.active=false;
					this._isLoading=false;//结束计算虚拟进度
				}
				if(isLaunchOnLoaded)cc.director.loadScene(sceneName);//启动场景
				if(onLoaded)onLoaded(error);
			}
		);
	}
	
	protected update(dt:number):void{
		super.update(dt);
		if(this._isLoading){
			this._frameCount++;
			if(this._frameCount%2==0){
				this._frameCount=0;
				this._virtualProgress=Math.min(this._virtualProgress+0.01,0.9);
				this._sceneProgressBar.setProgress(this._virtualProgress);
				this._sceneProgressBar.setText("Loading scene "+this._sceneName+".fire "+Math.floor(this._virtualProgress*100)+"%...");
			}
		}
	}
	
	private destroyCurrentLogicSceneChildren(isDestroyPersistRootNode:boolean){
		let children=cc.director.getScene().children;
		let i=children.length;
		while(--i>=0){
			let child=children[i];
			if(!isDestroyPersistRootNode && cc.game.isPersistRootNode(child))continue;
			child.destroy();
		}
	}
}
