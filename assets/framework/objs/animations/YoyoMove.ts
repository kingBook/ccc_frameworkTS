import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,property}=cc._decorator;

/** Yoyo移动 */
@ccclass
export default class YoyoMove extends BaseBehaviour{
	
	@property({range:[-180,180],slide:true})
	public angle:number=90;
	@property({range:[1,100]})
	public distance:number=2;
	@property({range:[0.1,3]})
	public duration:number=0.8;
	@property({visible(){return this.node.getComponent(cc.Widget);},tooltip:"当绑定有Widget组件时，是否先调用widget.updateAlignment();"})
	public isUpdateAlignment:boolean=true;
	
	protected start():void{
		super.start();
		//
		if(this.isUpdateAlignment){
			let widget=this.node.getComponent(cc.Widget);
			if(widget)widget.updateAlignment();
		}
		
		let pos:cc.Vec3=this.node.position;
		let offset:cc.Vec3=new cc.Vec3(Math.cos(this.angle*Math.PI/180)*this.distance,
									   Math.sin(this.angle*Math.PI/180)*this.distance,
									   0);
		let dir:number=Math.random()>0.5?1:-1;
		let startPos=pos.add(offset.mul(dir));
		let endPos:cc.Vec3=pos.add(offset.mul(-dir));
		this.node.setPosition(startPos);
		
		let t=cc.tween(this.node);
		t.repeatForever(
			t.to(this.duration,{position:endPos})
			 .to(this.duration,{position:startPos})
		).start();;
	}
}