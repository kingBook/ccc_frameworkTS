const{ccclass,property}=cc._decorator;
const b2=window["b2"];
const tempB2Vec2=new b2.Vec2();
const tempV2=cc.v2();
/**
 * 扩展的鼠标关节，当isManual=true时，设置connectedBody后需要调用一次apply()方法初始化，然后在鼠标移动时设置target
 * ```
 * //当isManual=true,使用代码示例:
 * private tempV2:cc.Vec2=cc.v2();
 * private mouseJoint:PhysicsMouseJoint=null;
 * 
 * private onTouchStart(event:cc.Event.EventTouch):void{
 * 	let camera=cc.Camera.main;
 * 	if(camera){
 * 		camera.getScreenToWorldPoint(event.touch.getLocation(),this.tempV2);
 * 	}else{
 * 		this.tempV2.set(event.touch.getLocation());
 * 	}
 * 	this.mouseJoint=this.node.addComponent(PhysicsMouseJoint);
 * 	this.mouseJoint.isManual=true;
 * 	this.mouseJoint.target=this.tempV2;
 * 	this.mouseJoint.connectedBody=targetRigidBody;//设置需要拖动的刚体（类型只能为动态）
 * 	this.mouseJoint.apply();//初始化生成内部box2d关节
 * }
 * 
 * private onTouchMove(event:cc.Event.EventTouch):void{
 * 	let camera=cc.Camera.main;
 * 	if(camera){
 * 		camera.getScreenToWorldPoint(event.touch.getLocation(),this.tempV2);
 * 	}else{
 * 		this.tempV2.set(event.touch.getLocation());
 * 	}
 * 	this.mouseJoint.target=this.tempV2;
 * }
 * 
 * private onTouchEnd(event::cc.Event.EventTouch):void{
 * 	this.node.removeComponent(this.mouseJoint);
 * 	this.mouseJoint=null;
 * }
 * ```
 */
@ccclass
export default class PhysicsMouseJoint extends cc.Joint{
	
	@property
	private _isManual:boolean=false;
	@property({visible:true,tooltip:"开启手动模式，当isManual=true时不再侦听Touch输入，需要手动设置target的位置（设置connectedBody后需要调用一次apply()生成内部box2d的关节）"})
	public set isManual(value:boolean){
		let self:any=this;
		if(value===false&&self._isManual!==value){
			self.offTouchListener();
		}
		self._isManual=value;
	}
	public get isManual():boolean{
		return this._isManual;
	}
	
	@property({override:true,visible:false})
	public anchor:cc.Vec2=cc.v2(0,0);//不使用
	
	@property({override:true,visible:false})
	public connectedAnchor:cc.Vec2=cc.v2(0,0);//不使用
	
	@property({type:cc.RigidBody,override:true,visible:true,tooltip:"拖动的刚体,isManual=false时不能为null（在resetInEditor和start函数中如果发现为null将会设置为当前节点的动态刚体）"})
	public connectedBody=null;
	
	@property({override:true,visible:false})
	public collideConnected:boolean=false;
	
	@property
	private _target:cc.Vec2=cc.v2(0,0);
	@property({visible:false,tooltip:"鼠标的位置，isManual=false时自动设置，isManual=true时需要手动设置，注意：设置target时必须使用target=value形式赋值"})
	
	public set target(value:cc.Vec2){
		this._target=value;
		let self:any=this;
		if(self._joint){
			tempB2Vec2.x=value.x/cc.PhysicsManager.PTM_RATIO;
			tempB2Vec2.y=value.y/cc.PhysicsManager.PTM_RATIO;
			self._joint.SetTarget(tempB2Vec2);
		}
	}
	/** 鼠标的位置，isManual=false时自动设置，isManual=true时需要手动设置，注意：设置target时必须使用target=value形式赋值（已经重写了set不会改变target自身的引用）*/
	public get target():cc.Vec2{
		return this._target;
	}
	
	@property
	private _frequency:number=5;
	@property({visible:true})
	public set frequency(value:number){
		this._frequency=value;
		let self:any=this;
		if(self._joint){
			self._joint.SetFrequency(value);
		}
	}
	public get frequency():number{
		return this._frequency;
	}
	
	@property
	private _dampingRatio:number=0.7;
	@property({visible:true})
	public set dampingRatio(value:number){
		this._dampingRatio=value;
		let self:any=this;
		if(self._joint){
			self._joint.SetDampingRatio(value);
		}
	}
	public get dampingRatio():number{
		return this._dampingRatio;
	}
	
	@property
	private _maxForce:number=0;
	@property({visible:false})
	public set maxForce(value:number){
		this._maxForce=value;
		let self:any=this;
		if(self._joint){
			self._joint.SetMaxForce(value);
		}
		
	}
	public get maxForce():number{
		return this._maxForce;
	}
	
	private _inited:boolean=false;
	
	protected resetInEditor():void{
		if(!this.isManual){
			if(!this.connectedBody){
				let body=this.getComponent(cc.RigidBody);
				if(body && body.type===cc.RigidBodyType.Dynamic){
					this.connectedBody=body;
				}
			}
		}
	}
	
	protected onEnable():void{
		//覆盖父类代码 
	}
	
	protected start():void{ 
		if(!this.isManual){
			if(!this.connectedBody){
				let body=this.getComponent(cc.RigidBody);
				if(body && body.type===cc.RigidBodyType.Dynamic){
					this.connectedBody=body;
				}
			}
			if(this.connectedBody.type!==cc.RigidBodyType.Dynamic){
				cc.error("connectedBody只能设置Dynamic刚体");
				this.connectedBody=null;
			}else{
				let connectedNode=this.connectedBody.node;
				connectedNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
				connectedNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
				connectedNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
				connectedNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
			}
		}
	}
	
	private offTouchListener():void{
		if(!this.isManual){
			let connectedNode=this.connectedBody.node;
			if(connectedNode && cc.isValid(connectedNode,true)){
				connectedNode.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
				connectedNode.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
				connectedNode.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
				connectedNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
			}
		}
	}
	
	protected onDestroy(){
		this.offTouchListener();
	}

	protected __init():void{
		let self:any=this;
		if(self._inited)return;
		if(!self._isValid())return;
		
		if(self.maxForce<=0){
			self.maxForce=1000*self.connectedBody.getMass();
		}
		
		let physicsManager:any=cc.director.getPhysicsManager();
		
		let groundB2BodyDef=new b2.BodyDef();
		let groundB2Body=physicsManager._world.CreateBody(groundB2BodyDef);
		
		let def=self._createJointDef();
		def.bodyA=groundB2Body;
		def.bodyB=self.connectedBody._getBody();
		def.collideConnected=self.collideConnected;
		physicsManager._addJoint(self,def);
		self._inited=true;
	}
	
	protected __destroy():void{
		let self:any=this;
		if(!self._inited)return;
		
		let physicsManager:any=cc.director.getPhysicsManager();
		physicsManager._world.DestroyBody(self._joint.GetBodyA());
		physicsManager._removeJoint(self);
		self._joint=null;
		self._inited=false;
	}
	
	protected _isValid():boolean{
		let connectedBody:any=this.connectedBody;
		return connectedBody&&connectedBody._getBody();
	}
	
	protected _createJointDef():any{
		let self:any=this;
		let def=new b2.MouseJointDef();
		tempB2Vec2.x=self.target.x/cc.PhysicsManager.PTM_RATIO;
		tempB2Vec2.y=self.target.y/cc.PhysicsManager.PTM_RATIO;
		def.target=tempB2Vec2;
		def.maxForce=self.maxForce;
		def.dampingRatio=self.dampingRatio;
		def.frequencyHz=self.frequency;
		return def;
	}
	
	private setTargetWithTouch(touch:cc.Touch):void{
		let camera=cc.Camera.main;
		if(camera){
			camera.getScreenToWorldPoint(touch.getLocation(),tempV2);
		}else{
			tempV2.set(touch.getLocation());
		}
		this.target=tempV2;
	}
	
	private onTouchStart(event:cc.Event.EventTouch):void{
		let self:any=this;
		self.setTargetWithTouch(event.touch);
		self._init();
	}
	
	private onTouchMove(event:cc.Event.EventTouch):void{
		this.setTargetWithTouch(event.touch);
	}
	
	private onTouchEnd(event:cc.Event.EventTouch):void{
		let self:any=this;
		self._destroy();
	}
	
}