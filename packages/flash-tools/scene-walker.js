module.exports={
	/** 返回场景中最后一个节点的uuid */
	'get-last-node-uuid':function(event){
		let scene=cc.director.getScene();
		let childrenCount=scene.childrenCount;
		let lastNode=scene.children[childrenCount-1];
		if (event.reply) {
			event.reply(lastNode.uuid);
		}
	}
};