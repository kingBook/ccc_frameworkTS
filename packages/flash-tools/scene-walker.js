module.exports={
	/** 返回场景中最后一个节点的uuid */
	'set-last-node':function(event,animData){
		let scene=cc.director.getScene();
		let childrenCount=scene.childrenCount;
		let lastNode=scene.children[childrenCount-1];
		//设置node的anchor与第一帧相同
		if(animData.curveData && animData.curveData.props){
			if(animData.curveData.props.anchorX){
				lastNode.anchorX=parseFloat(animData.curveData.props.anchorX[0].value);
			}
			if(animData.curveData.props.anchorY){
				lastNode.anchorY=parseFloat(animData.curveData.props.anchorY[0].value);
			}
		}
		
		let sprite=lastNode.addComponent(cc.Sprite);
		let animation=lastNode.addComponent(cc.Animation);
		
		if (event.reply) {
			event.reply(lastNode.uuid,sprite.uuid,animation.uuid);
		}
	}
};