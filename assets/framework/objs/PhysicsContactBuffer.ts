import BaseBehaviour from "../core/BaseBehaviour";

const{ccclass,requireComponent}=cc._decorator;
/** 物理接触缓存器，用于每帧保存刚体的所有接触（需要开启cc.RigidBody.enabledContactListener） */
@ccclass
@requireComponent(cc.RigidBody)
export default class PhysicsContactBuffer extends BaseBehaviour{
	
	private _contacts:cc.PhysicsContact[]=[];
	
	/** 当前帧的物理接触列表 */
	public get contacts():cc.PhysicsContact[]{ return this._contacts; }
	
	protected onLoad():void{
		super.onLoad();
		let body=this.getComponent(cc.RigidBody);
		if(!body.enabledContactListener){
			cc.warn("cc.RigidBody.enabledContactListener为false，将无法获取contacts");
		}
	}
	
	/** 只在两个碰撞体开始接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onBeginContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onBeginContact(contact,selfCollider,otherCollider);
		this._contacts.push(contact);
	}

	/** 只在两个碰撞体结束接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onEndContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onEndContact(contact,selfCollider,otherCollider);
		let index=this._contacts.indexOf(contact);
		if(index>-1)this._contacts.splice(index,1);
	}

	/** 每次将要处理碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPreSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onPreSolve(contact,selfCollider,otherCollider);
		if(this._contacts.indexOf(contact)<0)this._contacts.push(contact);
	}

	/** 每次处理完碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPostSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		super.onPostSolve(contact,selfCollider,otherCollider);
		if(this._contacts.indexOf(contact)<0)this._contacts.push(contact);
	}
}