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
		'flash-tools:menu-create-anim-with-config'(){
			module.exports.queryAndCreateAnim();
		},
		//执行菜单'Tools/Create anim with images'时调用
		'flash-tools:menu-create-anim-with-images'(){
			let selections=Editor.Selection.curSelection("asset");//当前选中资源的uuid列表
			module.exports.createAnimWithImages(selections);
		},
		//执行菜单'Tools/Create node with .anim'时调用
		'flash-tools:menu-create-node-with-anim'(){
			let selections=Editor.Selection.curSelection("asset");//当前选中资源的uuid列表
			module.exports.createAnimNodeWithSelections(selections);
		}
	},//end messages
	
	/**
	 * 根据当前选中项创建动画
	 * @param {string[]} selections 当前选中资源的uuid列表（并不一定全是texture）
	 */
	createAnimWithImages(selections){
		let imageDatas=[];
		for(let i=0,len=selections.length;i<len;i++){
			let assetUuid=selections[i];
			let assetInfo=Editor.assetdb.assetInfoByUuid(assetUuid);//info.path,info.url,info.type,info.isSubAsset
			if(assetInfo.type==="texture"){
				let assetName=assetInfo.url.substring(assetInfo.url.lastIndexOf('/')+1);
				let dotIndex=assetName.lastIndexOf('.');
				if(dotIndex>-1)assetName=assetName.substring(0,dotIndex);//去除后缀名
				
				let assetNumString=assetName.match(/\d+/);
				let noNumAssetName=assetName.replace(assetNumString,'');
				
				if(Editor.assetdb.containsSubAssetsByUuid(assetUuid)){
					let subAssetInfos=Editor.assetdb.subAssetInfosByUuid(assetUuid);
					if(subAssetInfos.length==1){
						let subAssetInfo=subAssetInfos[0];
						if(subAssetInfo.type==="sprite-frame"){
							//修改trimType为None
							let assetMetaStrings=fs.readFileSync(assetInfo.path+".meta","utf8");
							let assetMetaData=JSON.parse(assetMetaStrings);
							for(let key in assetMetaData.subMetas){
								let spriteFrameMetaData=assetMetaData.subMetas[key];
								spriteFrameMetaData.trimType="none";
								spriteFrameMetaData.offsetX=0;
								spriteFrameMetaData.offsetY=0;
								spriteFrameMetaData.trimX=0;
								spriteFrameMetaData.trimY=0;
								spriteFrameMetaData.width=spriteFrameMetaData.rawWidth;
								spriteFrameMetaData.height=spriteFrameMetaData.rawHeight;
								spriteFrameMetaData.borderTop=0;
								spriteFrameMetaData.borderBottom=0;
								spriteFrameMetaData.borderLeft=0;
								spriteFrameMetaData.borderRight=0;
								break;//只设置第一个，因为只有一个spriteFrame
							}
							let assetMetaDataStrings=JSON.stringify(assetMetaData,null,"\t");
							Editor.assetdb.saveMeta(assetInfo.uuid,assetMetaDataStrings,(err,meta)=>{});
							
							imageDatas.push({
								spriteFrameUuid:subAssetInfo.uuid,
								assetName:assetName, 
								noNumAssetName:noNumAssetName, 
								assetUrl:assetInfo.url,
								num:parseInt(assetNumString) 
							});
						}
					}
				}
			}
		}
		
		if(imageDatas.length>0){
			if(!isSingleFrameCreateAnim && imageDatas.length==1)return;
			
			imageDatas.sort((a,b)=>a.num-b.num);
			
			let frameDatas=[];
			for(let i=0,len=imageDatas.length;i<len;i++){
				frameDatas[i]={spriteFrameUuid:imageDatas[i].spriteFrameUuid};
			}
		
			let zeroNoNumName=imageDatas[0].noNumAssetName;
			let zeroUrl=imageDatas[0].assetUrl;
			
			let animUrl=zeroUrl.substr(0,zeroUrl.lastIndexOf('/')+1);
			animUrl+=zeroNoNumName+".anim";
			module.exports.createSequenceFrameAnimationClip(zeroNoNumName,frameDatas,animUrl)
		}
	},
	
	
	
	/**
	 * 根据当前选中项创建动画节点
	 * @param {string[]} selections 当前选中资源的uuid列表（并不一定全是.anim）
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
	 * 根据.anim文件的uuid和信息创建动画节点
	 * @param {string} animFileUuid .anim文件的uuid
	 * @param {any} info .anim文件信息 
	 * ```
	 * { path:string, url:string, type:string, isSubAsset:boolean }
	 * ```
	 */
	createAnimNodeWithUuid(animFileUuid,info){
		let animStrings=fs.readFileSync(info.path,"utf8");
		let animData=JSON.parse(animStrings);
		//创建新节点
		Editor.Ipc.sendToPanel("scene","scene:create-node-by-classid",animData._name);
		//调用场景脚本scene-walker.js
		Editor.Scene.callSceneScript("flash-tools","set-last-node",animData,(lastNodeUuid,spriteComponentUuid,animationComponentUuid)=>{
			//设置Sprite组件的spriteFrame属性
			Editor.Ipc.sendToPanel("scene","scene:set-property",{
				id:spriteComponentUuid,
				path:"spriteFrame",
				type:"cc.SpriteFrame",
				value:{uuid:animData["curveData"]["comps"]["cc.Sprite"]["spriteFrame"][0]["value"]["__uuid__"]},
				isSubProp:false
			});
			
			//设置Animation组件的defaultClip
			Editor.Ipc.sendToPanel("scene","scene:set-property",{
				id:animationComponentUuid,
				path:"defaultClip",
				type:"cc.AnimationClip",
				value:{uuid:animFileUuid},
				isSubProp:false
			});
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
	 * 创建序列帧动画
	 * @param {string} animFileName 创建后的.anim文件的名称（不包含后缀名）
	 * @param {any[]} frameDatas 帧数据列表，元素格式：
	 * ```
	 * { spriteFrameUuid:xxxx-xxxx-xxxx-xxxx-xxxx, anchor:{x:0.5,y:0.5} }
	 * ```
	 * 当anchor为undefined时，忽略anchor
	 * @param {string} animUrl 如："db://assets/textures/xx.anim"
	 */
	createSequenceFrameAnimationClip(animFileName,frameDatas,animUrl){
		let frameCount=frameDatas.length;
		
		let animData={
			"__type__":"cc.AnimationClip",
			"_name":animFileName,
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
				}
			},
			"events":[]
		};
		
		let interval=1/animData.sample;
		animData._duration=interval*frameCount;
		
		let spriteFrameList=animData["curveData"]["comps"]["cc.Sprite"]["spriteFrame"];
		
		for(let i=0;i<frameCount;i++){
			let frameData=frameDatas[i];
			let frameTime=interval*i;
			//spriteFrame
			spriteFrameList[i]={
				"frame":frameTime,
				"value":{
					"__uuid__":frameData.spriteFrameUuid
				}
			};
			//anchor
			if(frameData.anchor){
				if(!animData.curveData["props"]){
					animData.curveData["props"]={
						"anchorX":[],
						"anchorY":[]
					};
				}
				animData.curveData["props"]["anchorX"][i]={frame:frameTime, value:frameData.anchor.x, curve:"constant"};
				animData.curveData["props"]["anchorY"][i]={frame:frameTime, value:frameData.anchor.y, curve:"constant"};
			}
		}
		let animDataStrings=JSON.stringify(animData,null,"\t");
		module.exports.createAnimationClipFile(animUrl,animDataStrings);
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