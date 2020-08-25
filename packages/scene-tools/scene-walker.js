module.exports={
	'test-scene-walker':function(event,data){
		let scene=cc.director.getScene();
		//回调
		if (event.reply) {
			let result={};
			event.reply(result);
		}
	}
};