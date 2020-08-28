var fs=require('fs');
const EditorUtil={
	
	/**
	 * 设置指定Sprite组件的spriteFrame属性
	 * @param {string} compUuid Sprite组件的uuid，如：'faJTfw1jhEL5RQg86wyXeq'
	 * @param {string} spriteFrameUuid 精灵帧资源uuid，如：'1fb8c1b2-31f2-41ba-95ec-dd7a6d7d921c'
	 */
	setSpriteFrame(compUuid,spriteFrameUuid){
		Editor.Ipc.sendToPanel('scene','scene:set-property',{
			id:compUuid,
			path:"spriteFrame",
			type:"cc.SpriteFrame",
			value:{uuid:spriteFrameUuid},
			isSubProp:false
		});
	},
	
	/**
	 * 
	 * @param {string[]} sceneUrls 场景文件url列表，如：['db://assets/_bundleLevel1/level1.fire', ...]
	 * @param {(scene,index:number)=>void} handleSceneCallback 操作已打开的场景的回调函数 
	 * @param {number} handleSceneDelay 操作已打开的场景的时间<毫秒>，默认为:200（经过这个时间才关闭并保存场景，然后打开下一个场景）
	 * @param {number} openSceneInterval 打开场景的间隔时间<毫秒>，默认为:1000（这个间隔时间是为了当前场景保存完成后才打开下一个）
	 */
	foreachOpenScenes(sceneUrls,handleSceneCallback,handleSceneDelay=200,openSceneInterval=1000){
		const self=this;
		const len=sceneUrls.length;
		let i=0;
		let intervalId=setInterval(()=>{
			let sceneUrl=sceneUrls[i];
			self.openScene(sceneUrl,(scene)=>{
				handleSceneCallback(scene,i);
				setTimeout(()=>{
					self.saveCurrentScene();
				},handleSceneDelay);
				//
				i++;
				if(i>=len)clearInterval(intervalId);
			});
		}, handleSceneDelay+openSceneInterval);
	},
	
	/**
	 * 实例化预制件到多个场景
	 * @param {string} prefabUuid 预制件uuid，如：'5eb41fac-5e4c-47ec-b199-632719dc08fc'
	 * @param {string[]} sceneUrls 场景文件url列表，如：['db://assets/_bundleLevel1/level1.fire', ...]
	 * @param {string} parentPath 父节点路径，如：'Canvas/Level'（当为null或""时，以当前打开的场景根节点为父节点）
	 */
	instantiatePrefabWithScenes:function(prefabUuid,sceneUrls,parentPath){
		this.foreachOpenScenes(sceneUrls,(scene)=>{
			let parent=scene;
			if(parentPath){
				parent=cc.find(parentPath);
				if(!parent){
					Editor.error("未找到 "+parentPath+" 节点");
				}
			}
			if(parent){
				let parentUuid=parent.uuid;
				Editor.Ipc.sendToPanel("scene","scene:create-nodes-by-uuids",[prefabUuid],parentUuid,{unlinkPrefab:null});
			}
		});
	},
	
	/**
	 * 编辑器打开指定场景
	 * @param {string} url 如：'db://assets/_bundleLevel1/level1.fire'
	 * @param {(scene)=>void} callback 打开场景完成后回调
	 */
	openScene:function(url,callback){
		const uuid=this.urlToUuid(url);
		_Scene.loadSceneByUuid(uuid,(error)=>{
			_Scene.updateTitle();
			if(callback)callback(cc.director.getScene());
		});
	},
	
	/**
	 * 保存编辑器当前打开的场景（有延迟）
	 */
	saveCurrentScene:function(){
		Editor.Ipc.sendToPanel('scene','scene:stash-and-save',()=>{});
	},
	
	/**
	 * 复制资源到指定的url目录
	 * @param {string} assetUuid 要复制的资源uuid，如：'5df90458-d5bd-48b4-a7b7-e70f4c59c2d1'
	 * @param {string} newName 新资源的名称，如：'level5'
	 * @param {string} targetUrl 新资源的文件夹url，如：'db://assets/_bundleLevel5'
	 * @param {()=>void} callback 完成后的回调函数
	 */
	copyAssetToUrl(assetUuid,newName,targetUrl,callback=null){
		const assetInfo=Editor.assetdb.assetInfoByUuid(assetUuid);//info.path,info.url,info.type,info.isSubAsset
		const assetPath=assetInfo.path;
		
		const assetName=assetPath.substr(assetPath.lastIndexOf('\\')+1);//如：level4.fire
		const assetExtension=assetName.substr(assetName.lastIndexOf('.'));//如：.fire
		
		const destFolderPath=Editor.assetdb.urlToFspath(targetUrl);
		const assetDestPath=destFolderPath+"\\"+assetName;
		
		fs.copyFileSync(assetPath,assetDestPath,fs.constants.COPYFILE_EXCL);//复制资源
		fs.copyFileSync(assetPath+'.meta',assetDestPath+'.meta',fs.constants.COPYFILE_EXCL);//复制资源的.meta文件
		
		const newNameDestPath=destFolderPath+"\\"+newName+assetExtension;
		fs.renameSync(assetDestPath,newNameDestPath);//重命名资源
		fs.renameSync(assetDestPath+'.meta',newNameDestPath+'.meta');//重命名资源的.meta文件
		
		//读取新的.meta文件
		const nMetaDestPath=newNameDestPath+'.meta';
		let metaStrings=fs.readFileSync(nMetaDestPath,'utf8');
		const metaData=JSON.parse(metaStrings);
		metaData.uuid=Editor.Utils.UuidUtils.decompressUuid(Editor.Utils.UuidUtils.uuid());
		metaStrings=JSON.stringify(metaData,null,"\t");
		
		//重新保存.meta
		const data=new Uint8Array(Buffer.from(metaStrings));
		fs.writeFileSync(nMetaDestPath,data,'utf8');
		
		//刷新资源
		const nAssetDestUrl=Editor.assetdb.fspathToUrl(newNameDestPath);
		Editor.assetdb.refresh(nAssetDestUrl,(err,results)=>{});
		
		if(callback)callback();
	},
	
	/**
	 * 转换url为uuid
	 * @param {string} url 
	 */
	urlToUuid(url){
		return Editor.remote.assetdb.urlToUuid(url);
	}
}
module.exports=EditorUtil;