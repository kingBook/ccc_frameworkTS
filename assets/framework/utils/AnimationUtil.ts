export default class AnimationUtil{
	/**
	 * 播放动画到指定的sprite帧，并停止
	 * @param animation cc.Animation组件
	 * @param frameNO 帧编号（大于0的整数）
	 * @param clipName 不填写时播放默认动画剪辑
	 */
	public static gotoAndStop(animation:cc.Animation,frameNO:number,clipName?:string):void{
		let frameNO_int=frameNO|0;
		if(frameNO_int!==frameNO||frameNO<1){
			frameNO=Math.max(frameNO_int,1);
			cc.warn("参数 frameNO 应传入正整数");
		}
		let animState=animation.play(clipName);
		const speedRecord=animState.speed;
		animState.speed=0;
		let spriteFrameDatas:any[]=animState.clip.curveData['comps']['cc.Sprite']['spriteFrame'];
		frameNO=Math.min(frameNO,spriteFrameDatas.length);
		let frameTime:number=spriteFrameDatas[frameNO-1].frame;
		animation.setCurrentTime(frameTime);
		animState.stop();
		animState.speed=speedRecord;
	}
	
}