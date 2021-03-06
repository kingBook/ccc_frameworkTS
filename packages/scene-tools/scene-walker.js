const EditorUtil=require("./EditorUtil");
module.exports={
	'test-scene-walker':function(event,data){
		// 替换多个关卡场景的某个节点的Sprite
		this.replaceSpriteFrameWithLevelScenes();
		
		//回调
		if (event.reply) {
			let result={};
			event.reply(result);
		}
		
	},
	
	'removeCurrentNodeAllPhysicsColliders':function(event,data){
		EditorUtil.foreachCurrentSelectionNodes((node)=>{
			let colliders=node.getComponents(cc.PhysicsCollider);
			for(let i=0,len=colliders.length;i<len;i++){
				node.removeComponent(colliders[i]);
			}
			return true;
		});
		//删除一个组件：
		//Editor.Ipc.sendToPanel('scene', 'scene:remove-component', nodeID, compID);
		
		if (event.reply) {
			let result={};
			event.reply(result);
		}
	},
	
	/**
	 * 替换多个关卡场景的某个节点的Sprite
	 */
	replaceSpriteFrameWithLevelScenes(){
		/*const startLevel=5;
		const endLevel=30;
		let sceneUrls=[];
		for(let i=startLevel;i<=endLevel;i++)sceneUrls.push("db://assets/_bundleLevel"+i+"/level"+i+".fire");
		EditorUtil.foreachOpenScenes(sceneUrls,(scene,index)=>{
			let level=index+startLevel;
			let sprite=cc.find("Canvas/Level/Wall").getComponent(cc.Sprite);
			let spriteFrameUuid=EditorUtil.urlToUuid("db://assets/_bundleLevel"+level+"/lv"+level+".png/lv"+level);
			EditorUtil.setSpriteFrame(sprite.uuid,spriteFrameUuid);
			Editor.log("complete:"+level);
			return true;
		});*/
	}
	
	
	
	
};