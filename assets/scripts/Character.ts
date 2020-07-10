import BaseBehaviour from "../framework/core/BaseBehaviour";
import PhysicsContactBuffer from "../framework/objs/physics/PhysicsContactBuffer";
import NodeUtil from "../framework/utils/NodeUtil";
import Random from "../framework/utils/Random";

const{ccclass,property}=cc._decorator;

/** 人行为组件 */
@ccclass
export default class Character extends BaseBehaviour{
	
	/** 落地事件 */
	public static readonly ON_DROP_GROUND:string="onDropGround";
	
	@property({visible:true})
	private _speedX:number=250;
	@property({visible:true})
	private _jumpImpluseY:number=1100;
	@property({visible:true})
	private _frictionX:number=0.9;
	@property({visible:true,tooltip:"动画外观默认的朝向：1（右）/-1（左）"})
	private _skinFaceOrientation:number=1;
	@property({visible:true})
	private _idleClipKey:string="";
	@property({visible:true})
	private _walkClipKey:string="";
	@property({visible:true})
	private _pushClipKey:string="";
	@property({visible:true})
	private _dropClipKey:string="";
	@property({visible:true})
	private _jumpUpClipKey:string="";
	@property({visible:true})
	private _attackClipKey:string="";
	@property({visible:true})
	private _carClipKey:string="";
	@property({visible:true})
	private _deadClipKey:string="";
	@property({type:cc.Node,visible:true})
	private _worldMinNode:cc.Node=null;
	@property({type:cc.Node,visible:true})
	private _worldMaxNode:cc.Node=null;
	
	private _animation:cc.Animation;
	private _rigidBody:cc.RigidBody;
	private _isInAir:boolean;
	private _faceOrientation:number;
	private _physicsContactBuffer:PhysicsContactBuffer;
	private _onLoadTime:number;
	private _physicsCollider:cc.PhysicsCollider;
	private _isDead:boolean;
	private _isJumping:boolean;
	
	public get isInAir():boolean{ return this._isInAir; }
	public get linearVelocity():cc.Vec2{ return this._rigidBody.linearVelocity; }
	public get isDead():boolean{ return this._isDead; }
	
	
	protected onLoad():void{
		super.onLoad();
		this._rigidBody=this.getComponent(cc.RigidBody);
		this._animation=this.getComponent(cc.Animation);
		this._physicsContactBuffer=this.getComponent(PhysicsContactBuffer);
		this._physicsCollider=this.getComponent(cc.PhysicsCollider);
		
		this.setFaceOrientation(this._skinFaceOrientation);
		this.playAnimationClip(this._idleClipKey);
		
		this._onLoadTime=cc.director.getTotalTime();
	}
	
	protected update(dt:number):void{
		super.update(dt);
		
		this.checkInAir();
		
		//cc.log(this._animation.currentClip.name);
	}
	
	/** 只在两个碰撞体开始接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onBeginContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onBeginContact(contact,selfCollider,otherCollider);
		this.removeFrictionVertical(contact,selfCollider,otherCollider);
	}
	
	/** 只在两个碰撞体结束接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onEndContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onEndContact(contact,selfCollider,otherCollider);
		this.removeFrictionVertical(contact,selfCollider,otherCollider);
	}
	
	/** 每次将要处理碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPreSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onPreSolve(contact,selfCollider,otherCollider);
		this.removeFrictionVertical(contact,selfCollider,otherCollider);
		if(this._isDead){
			contact.disabled=true;
		}
	}
	
	/** 每次处理完碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPostSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onPostSolve(contact,selfCollider,otherCollider);
		this.removeFrictionVertical(contact,selfCollider,otherCollider);
	}
	
	private checkInAir():void{
		let inAir:boolean=true;
		let i=this._physicsContactBuffer.contacts.length;
		while(--i>=0){
			let contact=this._physicsContactBuffer.contacts[i];
			if(!contact.isTouching())continue;
			if(contact.disabled)continue;
			let otherCollider:cc.PhysicsCollider=contact.colliderA.body==this._rigidBody?contact.colliderB:contact.colliderA;
			if(otherCollider.sensor)continue;
			let worldManifold=contact.getWorldManifold();
			let normal=worldManifold.normal;
			if(contact.colliderA.body!=this._rigidBody)normal.mulSelf(-1);
			if(normal.y>0.7){
				inAir=false;
				break;
			}
		}
		if(inAir){
			inAir=this.getRaycastInAir();
		}
		if(this._isInAir!=inAir){
			if(this._isInAir&&!inAir){
				//落地时
				this.onDropGround();
			}else{
				//离开地面时
				this.onLeaveGround();
			}
		}
		this._isInAir=inAir;
	}
	
	private getRaycastInAir():boolean{
		let groups=["Wall","SwitcherMovie","Stone"];
		let p1=NodeUtil.getWorldPositionV2(this.node);
		let p2=p1.add(cc.v2(0,-45));
		let results=cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.AllClosest);
		for(let i=0,len=results.length;i<len;i++){
			let result=results[i];
			if(result.collider.sensor)continue;
			if(groups.indexOf(result.collider.node.group)>-1){
				return false;
			}
		}
		return true;
	}
	
	
	/** 落地时 */
	private onDropGround():void{
		/*if(cc.director.getTotalTime()-this._onLoadTime>1000){
			cc.loader.loadRes("sounds/12_落地",cc.AudioClip,(error:Error,audioClip:cc.AudioClip)=>{
				if(cc.isValid(this.node)){
					cc.audioEngine.playEffect(audioClip,false);
				}
			});
		}*/
		this._isJumping=false;
		this.node.emit(Character.ON_DROP_GROUND);
	}
	
	/** 离开地面时 */
	private onLeaveGround():void{
		
	}
	
	private playAnimationClip(clipKey:string):void{
		let currentClip:cc.AnimationClip=this._animation.currentClip;
		if(currentClip!=null){
			if(currentClip.name==clipKey) return;
		}
		this._animation.play(clipKey);
	}
	
	
	private removeFrictionVertical(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		if(contact.isTouching()){
			let worldManifold=contact.getWorldManifold();
			let normal=worldManifold.normal;
			if(contact.colliderB==selfCollider)normal.mulSelf(-1);
			if(Math.abs(normal.x)>0.7){
				contact.setFriction(0);
			}
		}
	}
	
	/** 设置脸的朝向：1/-1 */
	private setFaceOrientation(value:number):void{
		value=this._skinFaceOrientation*value;
		if(this._faceOrientation==value)return;
		this._faceOrientation=value;
		this.node.scaleX=Math.abs(this.node.scaleX)*this._faceOrientation;
	}
	
	/** 空中坠落 */
	/*public drop():void{
		this.playAnimationClip(this._dropClipKey);
	}*/
	
	/** 移动x轴 */
	public moveX(dirX:number):void{
		let velocity:cc.Vec2=this._rigidBody.linearVelocity;
		velocity.x=dirX*this._speedX;
		this._rigidBody.linearVelocity=velocity;
		
		if(!this._isInAir&&!this._isJumping){
			this.playAnimationClip(this._walkClipKey);
		}
		//设置脸朝向
		this.setFaceOrientation(dirX);
		//限制移出世界范围
		this.limitMoveOutWorld();
	}
	
	/** 跳跃 */
	public jump():void{
		if(this._isInAir)return;
		if(this._isJumping)return;
		this._isJumping=true;
		let impluse=new cc.Vec2(0,this._jumpImpluseY*this._rigidBody.getMass());
		this._rigidBody.applyLinearImpulse(impluse,this._rigidBody.getWorldCenter(),true);
		this.playAnimationClip(this._jumpUpClipKey);
	}
	
	/** 停止移动x并且减速开始摩擦减速 */
	public stopMoveSlowX():void{
		let velocity:cc.Vec2=this._rigidBody.linearVelocity;
		velocity.x*=this._frictionX;
		this._rigidBody.linearVelocity=velocity;
		//在地面切换到待机
		if(!this._isInAir&&!this._isJumping){
			this.playAnimationClip(this._idleClipKey);
		}
	}
	
	/** 限制向左/右/上移动时超出世界范围 */
	private limitMoveOutWorld():void{
		const offsetWidth=20;
		let worldMinPos=NodeUtil.getWorldPositionV2(this._worldMinNode);
		let worldMaxPos=NodeUtil.getWorldPositionV2(this._worldMaxNode);
		let myWorldPos=NodeUtil.getWorldPositionV2(this.node);
		let velocity:cc.Vec2=this._rigidBody.linearVelocity;
		if(velocity.x<0){
			if(myWorldPos.x-offsetWidth<=worldMinPos.x){
				velocity.x=0;
			}
		}else if(velocity.x>0){
			if(myWorldPos.x+offsetWidth>=worldMaxPos.x){
				velocity.x=0;
			}
		}
		if(velocity.y>0){
			if(myWorldPos.y>=worldMaxPos.y){
				velocity.y=0;
			}
		}
		this._rigidBody.linearVelocity=velocity;
	}
	
	
	/**
	 * 死亡
	 * @param completeCallback 死亡完成回调
	 * @param thisTarget 绑定到回调的this
	 */
	public death(completeCallback:()=>void,thisTarget:any=null):void{
		this._rigidBody.linearVelocity=new cc.Vec2(Random.wave*150,400);
		//this._physicsCollider.sensor=true; 无效
		this._isDead=true;
		if(thisTarget){
			completeCallback=completeCallback.bind(thisTarget);
		}
		this.scheduleOnce(completeCallback,2);
	}
	
	protected onDestroy():void{
		this.unscheduleAllCallbacks();
		super.onDestroy();
	}
}