'use strict';
var fs=require('fs');
var xml2js = require('xml2js');

module.exports={
	
	load(){
		//当 package 被正确加载的时候执行
	},
	
	unload(){
		//当 package 被正确卸载的时候执行
	},
	
	messages:{
		'asset-db:assets-created'(){
			module.exports.queryAtlasAndCreateAnim();
		},
		'create-anim'(){
			module.exports.queryAtlasAndCreateAnim();
		}
	},//end messages
	
	/** 查询纹理集并创建动画 */
	queryAtlasAndCreateAnim(){
		Editor.assetdb.queryAssets('db://assets/textures/**\/*','sprite-atlas',function(err,results){
			results.forEach(function(result){
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
	
	/**
	* 根据指定的纹理集Url创建动画
	* @param strAtlasUrl 如："db://assets/textures/xx.plist"
	*/
	createAnimationWithAtlasUrl(strAtlasUrl){
		let plistString=fs.readFileSync(Editor.url(strAtlasUrl,'utf8'),'utf8');
		
		let parseString=xml2js.parseString;
		parseString(plistString,function(err,result){
			let name=strAtlasUrl.substring(strAtlasUrl.lastIndexOf("/")+1,strAtlasUrl.lastIndexOf('.'));
			let animData=module.exports.createAnimationData(result,name,strAtlasUrl);
			if(animData!=null){
				let animUrl=strAtlasUrl.substring(0,strAtlasUrl.lastIndexOf('.'))+".anim";
				module.exports.createAnimationClipFile(animUrl,JSON.stringify(animData,null,"\t"));
			}
		});
	},
	
	/**
	* 创建动画数据
	* @param objPlist:Object 转换成对象后的.plist
	* @param strName:String 文件名
	* @param strAtlasUrl:String .plist的url，如："db://assets/textures/xx.plist"
	* @return 返回动画数据对象（如果参数指定的plist不是帧动画数据则返回null）
	*/
	createAnimationData(objPlist,strName,strAtlasUrl){
		if(objPlist.plist.dict[0].key[0]!="frames")return null;
		
		let frameDatas=objPlist.plist.dict[0].dict[0];
		let keys=frameDatas.key;
		
		if(!keys)return null;
		
		//Editor.log(JSON.stringify(frameDatas,null,"\t"));
		//Editor.log(JSON.stringify(frameDatas.dict,null,"\t"));
		
		if(keys.length<2)return null;//只有一帧不创建动画
		
		let animData={
			"__type__":"cc.AnimationClip",
			"_name":strName,
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
		animData._duration=interval*keys.length;
		for(let i=0;i<keys.length;i++){
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
				let anchorXObj={"frame":frameTime,"value":Number(anchorStr.substring(1,anchorStrDotIndex))};
				let anchorYObj={"frame":frameTime,"value":Number(anchorStr.substring(anchorStrDotIndex+1,anchorStr.length-1))};
				anchorXList[i]=anchorXObj;
				anchorYList[i]=anchorYObj;
			}
		}
		return animData;
	},
	
	/**
	* 创建.anim文件
	* @param strAnimUrl:string 如："db://assets/textures/xx.anim"
	* @param strData:string 内容字符串
	*/
	createAnimationClipFile(strAnimUrl,strData){
		Editor.assetdb.create(strAnimUrl,strData,function (err,results){});
	}
	
};