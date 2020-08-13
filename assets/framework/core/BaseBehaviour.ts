/** 所有脚本组件的基类 */
export default abstract class BaseBehaviour extends cc.Component{
	
	/** 当该组件被第一次添加到节点上或用户点击了它的 Reset 菜单时调用（只会在编辑器下调用） */
	protected resetInEditor():void{
		//super.resetInEditor();
	}
	
	/** 当附加到一个激活的节点上或者其节点第一次激活时在onEnable和start之前调用 */
	protected onLoad():void{
		//super.onLoad();
	}
	
	/** 当该组件被启用，并且它的节点也激活时在onLoad之后start之前调用 */
	protected onEnable():void{
		//super.onEnable();
	}
	
	/** 如果该组件第一次启用，则在所有组件的update之前onLoad、onEnable之后调用 */
	protected start():void{
		//super.start();
	}
	
	/** 如果该组件启用，则每帧调用 */
	protected update(dt:number):void{
		//super.update(dt);
	}
	
	/** 如果该组件启用，则每帧在update之后调用 */
	protected lateUpdate(dt:number):void{
		//super.lateUpdate(dt);
	}
	
	
	/** 只在两个碰撞体开始接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onBeginContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		//super.onBeginContact(contact,selfCollider,otherCollider);
	}

	/** 每次将要处理碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPreSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		//super.onPreSolve(contact,selfCollider,otherCollider);
	}

	/** 每次处理完碰撞体接触逻辑时被调用（需要开启cc.RigidBody.enabledContactListener） */
	protected onPostSolve(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		//super.onPostSolve(contact,selfCollider,otherCollider);
	}
	
	/** 只在两个碰撞体结束接触时被调用一次（需要开启cc.RigidBody.enabledContactListener） */
	protected onEndContact(contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider):void{
		//super.onEndContact(contact,selfCollider,otherCollider);
	}
	
	/** 是否正在调度中... */
	protected isScheduling(callback:Function):boolean{
		return cc.director.getScheduler().isScheduled(callback,this);
	}
	
	/** 当该组件被禁用或节点变为无效时调用 */
	protected onDisable():void{
		//super.onDisable();
	}
	
	/** 当销毁时调用 */
	protected onDestroy():void{
		//super.onDestroy();
	}
	
}