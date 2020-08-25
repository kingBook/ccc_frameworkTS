'use strict';
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
			module.exports.onExecute();
		}
	},//end messages
	onExecute(){
		//调用场景脚本 scene-walker.js 的 'test-scene-walker' 方法，并在回调函数中得到结果
		Editor.Scene.callSceneScript("scene-tools","test-scene-walker",{},(result)=>{
			
		});
	}
};