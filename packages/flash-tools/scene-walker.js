module.exports={
	/** 返回场景中最后一个节点的uuid */
	'set-last-node':function(event,animData){
		let scene=cc.director.getScene();
		let childrenCount=scene.childrenCount;
		let lastNode=scene.children[childrenCount-1];
		
		lastNode.anchorX=parseFloat(animData.curveData.props.anchorX[0].value);
		lastNode.anchorY=parseFloat(animData.curveData.props.anchorY[0].value);
		
		let sprite=lastNode.addComponent(cc.Sprite);
		let animation=lastNode.addComponent(cc.Animation);
		
		if (event.reply) {
			event.reply(lastNode.uuid,sprite.uuid,animation.uuid);
		}
	}
};