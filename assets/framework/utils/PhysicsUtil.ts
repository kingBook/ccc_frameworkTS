let b2=window['b2'];
export default class PhysicsUtil{
	
	/**
	 * 获取多个物理碰撞器的包围框
	 * @param colliders 物理碰撞器列表
	 */
	public static getCollidersAABB(colliders:cc.PhysicsCollider[]):cc.Rect{
		let aabb:cc.Rect;
		let i=colliders.length;
		while(--i>=0){
			if(i>0){
				aabb.union(aabb,colliders[i].getAABB());
			}else{
				aabb=colliders[i].getAABB();
			}
		}
		return aabb;
	}
	
	/**
	 * 获取动态刚体在接下来 n 次数调用 Step() 的位置和角度（只在周围没有任何刚体阻挡的理想状态下有效）,
	 * 此方法必须在applyLinearImpulse、applyAngularImpulse、applyForce、linearVelocity、angularVelocity等设置之后，注意：此方法只作用于动态刚体
	 * @param body 
	 * @param n 默认为1，预测Step的次数
	 * @returns 返回的数据格式：{ position:cc.Vec2, angle:number }
	 * 
	 */
	public static getBodyNextStep(body:cc.RigidBody,n:number=1):any[]{
		let results=[];
		let b=body['_getBody']();
		if (b.m_type !== b2.BodyType.b2_dynamicBody)return results;
		
		let dt=1/cc.game.getFrameRate();
		if(cc.director.getPhysicsManager().enabledAccumulator){
			dt=cc.PhysicsManager.FIXED_TIME_STEP;
		}
		let world=cc.director.getPhysicsManager()["_getWorld"]();
		
		let positionX=b.m_xf.p.x;
		let positionY=b.m_xf.p.y;
		let linearVelocityX=b.m_linearVelocity.x
		let linearVelocityY=b.m_linearVelocity.y;
		let angle=b.m_sweep.a;
		let angularVelocity=b.m_angularVelocity;
		let gravity=world.m_gravity;
		
		for(let i=0;i<n;i++){
			linearVelocityX += dt * (b.m_gravityScale * gravity.x + b.m_invMass * b.m_force.x);
			linearVelocityY += dt * (b.m_gravityScale * gravity.y + b.m_invMass * b.m_force.y);
			angularVelocity += dt * b.m_invI * b.m_torque;
			
			linearVelocityX *= 1.0 / (1.0 + dt * b.m_linearDamping);
			linearVelocityY *= 1.0 / (1.0 + dt * b.m_linearDamping);
			angularVelocity *= 1.0 / (1.0 + dt * b.m_angularDamping);
			
			positionX+=linearVelocityX*dt;
			positionY+=linearVelocityY*dt;
			angle+=angularVelocity*dt;
			
			results[i]={
				position:new cc.Vec2(positionX*cc.PhysicsManager.PTM_RATIO, positionY*cc.PhysicsManager.PTM_RATIO),
				angle:angle*180/Math.PI
			};
		}
		return results;
	}
	
}