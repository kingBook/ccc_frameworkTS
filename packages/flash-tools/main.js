'use strict';
var fs=require('fs');
var xml2js = require('xml2js');
const { createCipher } = require('crypto');
/** 单帧是否创建动画 */
var isSingleFrameCreateAnim=true;

module.exports={
	
	load(){
		//当 package 被正确加载的时候执行
	},
	
	unload(){
		//当 package 被正确卸载的时候执行
	},
	
	messages:{
		//所有资源创建完成时调用
		'asset-db:assets-created'(){
			module.exports.queryAndCreateAnim();
		},
		//执行菜单'Tools/Create anim with config'时调用
		'flash-tools:menu-create-anim'(){
			module.exports.queryAndCreateAnim();
		},
		//执行菜单'Tools/Create node with .anim'时调用
		'flash-tools:menu-create-node-with-anim'(){
			let selections=Editor.Selection.curSelection("asset");//当前选中资源的uuid列表
			module.exports.createAnimNodeWithSelections(selections);
		}
	},//end messages
	
	/**
	 * 根据当前选中项创建动画节点
	 * @param {string[]} selections 当前选中资源的uuid列表（并不一定是.anim文件）
	 */
	createAnimNodeWithSelections(selections){
		for(let i=0,len=selections.length;i<len;i++){
			let uuid=selections[i];
			let info=Editor.assetdb.assetInfoByUuid(uuid);//info.path,info.url,info.type,info.isSubAsset
			if(info.type==="animation-clip"){
				module.exports.createAnimNodeWithUuid(uuid,info);
			}
		}
	},
	
	/**
	 * 根据uuid创建动画节点
	 * @param {string} uuid 类型必须是'animation-clip'
	 * @param {any} info 
	 */
	createAnimNodeWithUuid(uuid,info){
		Editor.Ipc.sendToPanel("scene","scene:create-node-by-classid","xin");
		
		//let nodeUuids=Editor.Selection.curSelection('node');
		//Editor.log(Editor.Selection.curActivate("node"));
		//Editor.log(Editor.Selection.curGlobalActivate());
		//添加一个组件：
		//Editor.Ipc.sendToPanel('scene', 'scene:add-component', nodeID, 'cc.Animation');
		// 修改精灵纹理
		/*Editor.Ipc.sendToPanel('scene', 'scene:set-property',{
			id: compObj.uuid,
			path: "spriteFrame",//要修改的属性
			type: "cc.SpriteFrame",
			value: {uuid:spriteFrameUuid},
			isSubProp: false,
			});*/
		Editor.Scene.callSceneScript("flash-tools","get-last-node-uuid",(lastNodeUuid)=>{
			Editor.log(lastNodeUuid);
			Editor.Ipc.sendToPanel("scene","scene:add-component",lastNodeUuid,"cc.Sprite");
			Editor.Ipc.sendToPanel("scene","scene:add-component",lastNodeUuid,"cc.Animation");
		});
	},
	
	queryAndCreateAnim(){
		this.queryMultipleImageConfigAndCreateAnim();
		
		this.queryAtlasAndCreateAnim();
		
		//this.queryAtlasAndMergeToRawTextureMeta();
	},
	
	/** 查询多张图动画配置文件(.multipleImageAnim)并创建动画 */
	queryMultipleImageConfigAndCreateAnim(){
		Editor.assetdb.queryAssets('db://assets/textures/**\/*','asset',(err,results)=>{
			results.forEach((result)=>{
				// result.url
				// result.path
				// result.uuid
				// result.type
				// result.isSubAsset
				//Editor.log(JSON.stringify(result,null,"\t"));
				if(result.path.indexOf(".multipleImageAnim")>-1){
					let animPath=result.path.replace(".multipleImageAnim",".anim");
					//删除.multipleImageAnim
					Editor.assetdb.delete([result.url]);
					if(!fs.existsSync(animPath)){
						module.exports.createAnimationWithMultipleImageConfigUrl(result.url,result.path);
					}
				}
			});
		});
	},
	
	/**
	 * 根据多张图动画配置文件(.multipleImageAnim)创建动画
	 * @param {string} configUrl 如：db://assets/textures/xx.multipleImageAnim
	 * @param {string} configPath 如：D:\ccc_test\assets\textures\xx.multipleImageAnim
	 */
	createAnimationWithMultipleImageConfigUrl(configUrl,configPath){
		let multipleImageAnimStrings=fs.readFileSync(Editor.url(configUrl,'utf8'),'utf8');
		xml2js.parseString(multipleImageAnimStrings,function(err,result){
			let configName=configUrl.substring(configUrl.lastIndexOf("/")+1,configUrl.lastIndexOf('.'));
			let animData=module.exports.createAnimationWithMultipleImageConfigData(result,configName,configUrl,configPath);
			if(animData){
				let animUrl=configUrl.substring(0,configUrl.lastIndexOf('.'))+".anim";
				module.exports.createAnimationClipFile(animUrl,JSON.stringify(animData,null,"\t"));
			}
		});
	},
	
	/**
	 * 根据转换成对象的.multipleImageAnim创建动画
	 * @param {any} data 转换成对象后的.multipleImageAnim
	 * @param {string} configName .multipleImageAnim文件名称
	 * @param {string} configUrl 如：db://assets/textures/xx.multipleImageAnim
	 * @param {string} configPath 如：D:\ccc_test\assets\textures\xx.multipleImageAnim
	 * @returns {any} 返回.anim数据对象
	 */
	createAnimationWithMultipleImageConfigData(data,configName,configUrl,configPath){
		//Editor.log(JSON.stringify(data,null,"\t"));
		//Editor.log(data['root']['name']);
		let frameNames=data['root']['name'];
		let frameDatas=[];
		let isExistEmptyFrame=false;
		let deleteUrls=[];
		for(let i=0,len=frameNames.length;i<len;i++){
			let frameName=frameNames[i];
			let framePlistUrl=configUrl.replace(configName+'.multipleImageAnim',frameName+'.plist');
			let framePlistPath=configPath.replace(configName+'.multipleImageAnim',frameName+'.plist');
			let framePngMetaPath=configPath.replace(configName+'.multipleImageAnim',frameName+'.png.meta');
			
			//如果存在帧.plist文件，则将.png的导入格式设置为Sprite，并将.plist数据设置到Sprite
			if(fs.existsSync(framePlistPath)){
				let framePlistStrings=fs.readFileSync(framePlistPath,'utf8');
				xml2js.parseString(framePlistStrings,(err,result)=>{
					let frameData=result.plist.dict[0].dict[0];
					frameDatas[i]=frameData;
					//Editor.log(frameData);
					module.exports.updatePngMetaWithFrameData(framePngMetaPath,frameData);
				});	
				deleteUrls.push(framePlistUrl);
			}else{
				//不存在帧.plist文件时
				isExistEmptyFrame=true;
			}
		}
		//删除.plist
		Editor.assetdb.delete(deleteUrls);
		//根据frameDatas列表创建动画
		if(!isExistEmptyFrame){
			return module.exports.createAnimationWithFrameDatas(frameDatas,configName,configUrl);
		}else{
			Editor.error(configUrl+" There are empty frames, the creation of .anim has been canceled.");
		}
		return null;
	},
	
	/**
	 * 根据多帧数据列表创建动画
	 * @param {Array} frameDatas 多帧动画数据列表
	 * @param {string} name .anim文件名
	 * @param {string} configUrl 如：db://assets/textures/xx.multipleImageAnim
	 * @returns {any} 返回.anim数据对象
	 */
	createAnimationWithFrameDatas(frameDatas,name,configUrl){
		let animData={
			"__type__":"cc.AnimationClip",
			"_name":name,
			"_objFlags":0,
			"_native":"",
			"_duration":0,
			"sample":24,
			"speed":1,
			"wrapMode":2,
			"curveData":{
				"comps":{
					"cc.Sprite":{
						"spriteFrame":[]
					}
				},
				"props":{
					"anchorX":[],
					"anchorY":[]
				}
			},
			"events":[]
		};
		
		let spriteFrameList=animData["curveData"]["comps"]["cc.Sprite"]["spriteFrame"];
		let anchorXList=animData["curveData"]["props"]["anchorX"];
		let anchorYList=animData["curveData"]["props"]["anchorY"];
		let interval=1/animData.sample;
		let frameDatasLength=frameDatas.length;
		animData._duration=interval*frameDatasLength;
		
		for(let i=0;i<frameDatasLength;i++){
			let frameData=frameDatas[i];
			//Editor.log(JSON.stringify(frameData,null,'\t'));
			let keyName=frameData.key[0];
			let spriteFrameUrl=configUrl.replace(name+'.multipleImageAnim',keyName+'.png/'+keyName);// 如：db://assets/textures/xxx.png/xxx
			let frameTime=interval*i;
			//spriteFrame
			let spriteFrameUuid=Editor.assetdb.urlToUuid(spriteFrameUrl);
			let obj={
				"frame":frameTime,
				"value":{
					"__uuid__":spriteFrameUuid
				}
			};
			spriteFrameList[i]=obj;
			//anchor
			let anchorStr=frameData.dict[0].string[4];// "{0.5,0.5}"
			if(anchorStr){
				let anchorStrDotIndex=anchorStr.indexOf(',');
				let anchorX=Number(anchorStr.substring(1,anchorStrDotIndex));
				let anchorY=Number(anchorStr.substring(anchorStrDotIndex+1,anchorStr.length-1));
				let anchorXObj={frame:frameTime, value:anchorX, curve:"constant"};
				let anchorYObj={frame:frameTime, value:anchorY, curve:"constant"};
				anchorXList[i]=anchorXObj;
				anchorYList[i]=anchorYObj;
			}
		}
		return animData;
	},
	
	/**
	 * 根据帧数据更新.png.meta文件
	 * @param {string} framePngMetaPath .meta文件路径
	 * @param {any} frameData 解析.plist文件后的帧数据
	 */
	updatePngMetaWithFrameData(framePngMetaPath,frameData){
		//Editor.log(JSON.stringify(frameData,null,'\t'));
		let frameName=frameData['key'][0];
		
		let pngMetaStrings=fs.readFileSync(framePngMetaPath,'utf8');
		let pngMetaData=JSON.parse(pngMetaStrings);
		
		let frameString=frameData.dict[0].string[0];//如：'{{5,5},{294,261}}'
			frameString=frameString.substring(1,frameString.length-1);//去外大括号：'{5,5},{294,261}'
		let trimString=frameString.substring(1,frameString.indexOf('}'));//如：'5,5'
		let sizeString=frameString.substring(frameString.lastIndexOf('{')+1,frameString.length-1);//如:'294,261'
		let trimX=Number(trimString.substring(0,trimString.indexOf(',')));
		let trimY=Number(trimString.substring(trimString.indexOf(',')+1));
		let width=Number(sizeString.substring(0,sizeString.indexOf(',')));
		let height=Number(sizeString.substring(sizeString.indexOf(',')+1));
		
		let offsetString=frameData.dict[0].string[1];//如：'{0,0}'
			offsetString=offsetString.substring(1,offsetString.length-1);//去大括号：'0,0'
		let offsetX=Number(offsetString.substring(0,offsetString.indexOf(',')));
		let offsetY=Number(offsetString.substring(offsetString.indexOf(',')+1));
		
		//Editor.log(pngMetaData);
		pngMetaData['type']='sprite';
		if(!pngMetaData['subMetas']){
			pngMetaData['subMetas']={};
		}
		let subMetas=pngMetaData['subMetas'];
		if(!subMetas[frameName]){
			subMetas[frameName]={
				"ver": "1.0.4",
				"uuid": module.exports.getNewUuid(),
				"rawTextureUuid": pngMetaData.uuid,
				"trimType": "custom",
				"trimThreshold": 1,
				"rotated": false,
				"offsetX": offsetX,
				"offsetY": offsetY,
				"trimX": trimX,
				"trimY": trimY,
				"width": width,
				"height": height,
				"rawWidth": pngMetaData.width,
				"rawHeight": pngMetaData.height,
				"borderTop": 0,
				"borderBottom": 0,
				"borderLeft": 0,
				"borderRight": 0,
				"subMetas": {}
			};
		}else{
			let frameNameObj=subMetas[frameName];
			if(!frameNameObj.uuid)frameNameObj.uuid=module.exports.getNewUuid();
			frameNameObj.rawTextureUuid=pngMetaData.uuid;
			frameNameObj.offsetX=offsetX;
			frameNameObj.offsetY=offsetY;
			frameNameObj.trimX=trimX;
			frameNameObj.trimY=trimY;
			frameNameObj.width=width;
			frameNameObj.height=height;
			frameNameObj.rawWidth=pngMetaData.width;
			frameNameObj.rawHeight=pngMetaData.height;
		}
		let pngMetaDataStrings=JSON.stringify(pngMetaData,null,"\t");
		Editor.assetdb.saveMeta(pngMetaData.uuid,pngMetaDataStrings,(err,meta)=>{});
	},
	
	/**
	 * 返回一个新的uuid
	 * @returns {string}
	 */
	getNewUuid(){
		let uuid=Editor.Utils.UuidUtils.uuid();
		let decompressUuid=Editor.Utils.UuidUtils.decompressUuid(uuid);
		return decompressUuid;
	},
	
	/** 查询纹理集（.plist文件）并创建动画 */
	queryAtlasAndCreateAnim(){
		Editor.assetdb.queryAssets('db://assets/textures/**\/*','sprite-atlas',(err,results)=>{
			results.forEach((result)=>{
				// result.url
				// result.path
				// result.uuid
				// result.type
				// result.isSubAsset
				let animPath=result.path.replace(".plist",".anim");
				if(!fs.existsSync(animPath)){
					module.exports.createAnimationWithAtlasUrl(result.url);
				}
			});
		});
	},
	
	/** 查询纹理集（.plist文件）并合并到.png.meta */
	/*queryAtlasAndMergeToRawTextureMeta(){
		Editor.assetdb.queryAssets('db://assets/textures/**\/*','sprite-atlas',(err,results)=>{
			results.forEach((result)=>{
				// result.url
				// result.path
				// result.uuid
				// result.type
				// result.isSubAsset
				Editor.log(result.path);
				//读取.plist.meta
				let plistMetaPath=result.path+".meta"
				let plistMetaStrings=fs.readFileSync(plistMetaPath,'utf8');
				let plistMetaData=JSON.parse(plistMetaStrings);
				//Editor.log(plistMetaData);
				//Editor.log(plistMetaData.rawTextureUuid);
				//Editor.log(plistMetaData.subMetas);
				
				//读取图集（.plist）的源图像的.png.meta
				let rawTextureUuid=plistMetaData.rawTextureUuid;
				let rawTextureMetaPath=Editor.assetdb.uuidToFspath(rawTextureUuid)+".meta";
				if(fs.existsSync(rawTextureMetaPath)){
					let rawTextureMetaStrings=fs.readFileSync(rawTextureMetaPath,'utf8');
					let rawTextureMetaData=JSON.parse(rawTextureMetaStrings);
					Editor.log(rawTextureMetaData);
					if(rawTextureMetaData.type=="raw"){
						rawTextureMetaData.type="sprite";
						rawTextureMetaData.subMetas=plistMetaData.subMetas;
						//保存.png.meta到本地
						rawTextureMetaStrings=JSON.stringify(rawTextureMetaData,null,"\t");
						Editor.assetdb.saveMeta(rawTextureMetaData.uuid,rawTextureMetaStrings,(err,meta)=>{});
						//删除.plist和.plist.meta
						Editor.assetdb.delete([result.url]);
					}
				}
			});
		});
	},*/
	
	/**
	 * 根据指定的纹理集Url创建动画
	 * @param {string} strAtlasUrl 如："db://assets/textures/xx.plist"
	 */
	createAnimationWithAtlasUrl(strAtlasUrl){
		let plistString=fs.readFileSync(Editor.url(strAtlasUrl,'utf8'),'utf8');
		
		xml2js.parseString(plistString,(err,result)=>{
			let name=strAtlasUrl.substring(strAtlasUrl.lastIndexOf("/")+1,strAtlasUrl.lastIndexOf('.'));
			let animData=module.exports.createAnimationWithPlistData(result,name,strAtlasUrl);
			if(animData){
				let animUrl=strAtlasUrl.substring(0,strAtlasUrl.lastIndexOf('.'))+".anim";
				module.exports.createAnimationClipFile(animUrl,JSON.stringify(animData,null,"\t"));
			}
		});
	},
	

	/**
	 * 根据转换成对象的.plist创建动画
	 * @param {any} data  转换成对象后的.plist
	 * @param {string} name .anim文件名
	 * @param {string} strAtlasUrl .plist的url，如："db://assets/textures/xx.plist"
	 * @returns {any} 返回动画数据对象（如果参数指定的plist不是帧动画数据则返回null）
	 */
	createAnimationWithPlistData(data,name,strAtlasUrl){
		if(data.plist.dict[0].key[0]!="frames")return null;
		
		let frameDatas=data.plist.dict[0].dict[0];
		let keys=frameDatas.key;
		
		if(!keys)return null;
		
		//Editor.log(JSON.stringify(frameDatas,null,"\t"));
		//Editor.log(JSON.stringify(frameDatas.dict,null,"\t"));
		
		if(!isSingleFrameCreateAnim&&keys.length<=1)return null;//单帧不创建动画
		
		let animData={
			"__type__":"cc.AnimationClip",
			"_name":name,
			"_objFlags":0,
			"_native":"",
			"_duration":0,
			"sample":24,
			"speed":1,
			"wrapMode":2,
			"curveData":{
				"comps":{
					"cc.Sprite":{
						"spriteFrame":[]
					}
				},
				"props":{
					"anchorX":[],
					"anchorY":[]
				}
			},
			"events":[]
		};
		
		let spriteFrameList=animData["curveData"]["comps"]["cc.Sprite"]["spriteFrame"];
		let anchorXList=animData["curveData"]["props"]["anchorX"];
		let anchorYList=animData["curveData"]["props"]["anchorY"];
		let interval=1/animData.sample;
		let keysLength=keys.length;
		animData._duration=interval*keysLength;
		for(let i=0;i<keysLength;i++){
			let keyName=keys[i];
			let spriteFrameUrl=strAtlasUrl+"/"+keyName;// 如：db://assets/textures/xx.plist/00000
			let frameTime=interval*i;
			//spriteFrame
			let spriteFrameUuid=Editor.assetdb.urlToUuid(spriteFrameUrl);
			let obj={
				"frame":frameTime,
				"value":{
					"__uuid__":spriteFrameUuid
				}
			};
			spriteFrameList[i]=obj;
			//anchor
			let anchorStr=frameDatas.dict[i].string[4];// "{0.5,0.5}"
			if(anchorStr){
				let anchorStrDotIndex=anchorStr.indexOf(',');
				let anchorX=Number(anchorStr.substring(1,anchorStrDotIndex));
				let anchorY=Number(anchorStr.substring(anchorStrDotIndex+1,anchorStr.length-1));
				let anchorXObj={frame:frameTime, value:anchorX, curve:"constant"};
				let anchorYObj={frame:frameTime, value:anchorY, curve:"constant"};
				anchorXList[i]=anchorXObj;
				anchorYList[i]=anchorYObj;
			}
		}
		return animData;
	},
	
	/**
	 * 创建.anim文件
	 * @param {string} strAnimUrl 如："db://assets/textures/xx.anim"
	 * @param {string} strData 内容字符串
	 */
	createAnimationClipFile(strAnimUrl,strData){
		Editor.assetdb.create(strAnimUrl,strData,(err,results)=>{});
	}
	
};