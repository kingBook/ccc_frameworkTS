'use strict';

const EditorUtil = require('./EditorUtil');

module.exports={
	load(){
		//当 package 被正确加载的时候执行
	},
	unload(){
		//当 package 被正确卸载的时候执行
	},
	messages:{
		//执行菜单'Tools/Execute scene-tools'时调用
		'scene-tools:menu-execute-scene-tools'(){
			this.onExecute();
		}
	},//end messages
	
	onExecute(){
		Editor.log("==onExecute==");
		//调用场景脚本 scene-walker.js 的 'test-scene-walker' 方法，并在回调函数中得到结果
		Editor.Scene.callSceneScript("scene-tools","test-scene-walker",{},(result)=>{});
		
		//复制指定资源到多个文件夹里
		this.copyAssetToUrls();
		
	},
	
	copyAssetToUrls(){
		/*for(let i=5;i<=30;i++){
			module.exports.copyAssetToUrl("5df90458-d5bd-48b4-a7b7-e70f4c59c2d1","level"+i,"db://assets/_bundleLevel"+i);
		}*/
	}
	
};