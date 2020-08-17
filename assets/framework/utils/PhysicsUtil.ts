const PTM_RATIO=cc.PhysicsManager.PTM_RATIO;
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
	
	//#region box2d预测
	
	/**
	 * 获取动态刚体在接下来 n 次数调用 Step() 的位置和角度（只在周围没有任何刚体阻挡的理想状态下有效）,
	 * 此方法必须在applyLinearImpulse、applyAngularImpulse、applyForce、linearVelocity、angularVelocity等设置之后，注意：此方法只作用于动态刚体
	 * @param body 
	 * @param n 默认为1，预测Step的次数
	 * @returns 返回的数据格式：{ position:cc.Vec2, angle:number }
	 * 
	 */
	/*public static getBodyNextStep(body:cc.RigidBody,n:number=1):{position:cc.Vec2, angle:number}[]{
		let results=[];
		let b=body['_getBody']();
		if (b.m_type!==b2.BodyType.b2_dynamicBody)return results;
		
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
			linearVelocityX+=dt*(b.m_gravityScale*gravity.x+b.m_invMass*b.m_force.x);
			linearVelocityY+=dt*(b.m_gravityScale*gravity.y+b.m_invMass*b.m_force.y);
			angularVelocity+=dt*b.m_invI*b.m_torque;
			
			linearVelocityX*=1.0/(1.0+dt*b.m_linearDamping);
			linearVelocityY*=1.0/(1.0+dt*b.m_linearDamping);
			angularVelocity*=1.0/(1.0+dt*b.m_angularDamping);
			
			positionX+=linearVelocityX*dt;
			positionY+=linearVelocityY*dt;
			angle+=angularVelocity*dt;
			
			results[i]={
				position:new cc.Vec2(positionX*PTM_RATIO, positionY*PTM_RATIO),
				angle:angle*180/Math.PI
			};
		}
		return results;
	}*/
	
	/**
	 * 获取动态刚体在接下来 n 次数调用 Step() 的位置和角度（只在周围没有任何刚体阻挡的理想状态下有效）,
	 * 此方法必须在 applyLinearImpulse、applyAngularImpulse、applyForce、linearVelocity、angularVelocity 等设置之后。
	 * 注意：此方法只作用于动态刚体，必须在start()函数及之后调用此方法，使用前需要确保刚体的gravityScale，linearVelocity，angularVelocity等与运行时一致
	 * @param body 刚体
	 * @param n 默认为1，预测 Step 的次数
	 * @param addLinearVelocityX 默认为0，添加的 linearVelocityX，b2World单位
	 * @param addLinearVelocityY 默认为0，添加的 linearVelocityY，b2World单位
	 * @param addAngularVelocity 默认为0，添加的 angularVelocity，b2World单位
	 * @param addForceX 默认为0，添加的 forceX，b2World单位
	 * @param addForceY 默认为0，添加的 forceY，b2World单位
	 * @param addTorque 默认为0，添加的 torque，b2World单位
	 */
	public static getBodyNextStep(body:cc.RigidBody,n:number=1,addLinearVelocityX:number=0,addLinearVelocityY:number=0,addAngularVelocity:number=0,addForceX:number=0,addForceY:number=0,addTorque:number=0):{position:cc.Vec2, angle:number}[]{
		let results=[];
		let b=body['_getBody']();
		if (b.m_type!==b2.BodyType.b2_dynamicBody)return results;
		
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
		let forceX=b.m_force.x;
		let forceY=b.m_force.y;
		let torque=b.m_torque;
		
		linearVelocityX+=addLinearVelocityX;
		linearVelocityY+=addLinearVelocityY;
		angularVelocity+=addAngularVelocity;
		forceX+=addForceX;
		forceY+=addForceY;
		torque+=addTorque;
		
		let gravity=world.m_gravity;
		
		for(let i=0;i<n;i++){
			linearVelocityX+=dt*(b.m_gravityScale*gravity.x+b.m_invMass*forceX);
			linearVelocityY+=dt*(b.m_gravityScale*gravity.y+b.m_invMass*forceY);
			angularVelocity+=dt*b.m_invI*torque;
			
			linearVelocityX*=1.0/(1.0+dt*b.m_linearDamping);
			linearVelocityY*=1.0/(1.0+dt*b.m_linearDamping);
			angularVelocity*=1.0/(1.0+dt*b.m_angularDamping);
			
			positionX+=linearVelocityX*dt;
			positionY+=linearVelocityY*dt;
			angle+=angularVelocity*dt;
			
			results[i]={
				position:new cc.Vec2(positionX*PTM_RATIO, positionY*PTM_RATIO),
				angle:angle*180/Math.PI
			};
		}
		return results;
	}
	
	public static getApplyForce(body:cc.RigidBody,force:cc.Vec2,point:cc.Vec2):{forceX:number,forceY:number,torque:number}{
		let forceX=force.x/PTM_RATIO;
		let forceY=force.y/PTM_RATIO;
		let pointX=point.x/PTM_RATIO;
		let pointY=point.y/PTM_RATIO;
		
		let result={forceX:0, forceY:0, torque:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.forceX+=forceX;
			result.forceY+=forceY;
			result.torque+=(pointX-b.m_sweep.c.x)*forceY-(pointY-b.m_sweep.c.y)*forceX;
		}
		return result;
	}
	
	public static getApplyForceToCenter(body:cc.RigidBody,force:cc.Vec2):{forceX:number,forceY:number}{
		let forceX=force.x/PTM_RATIO;
		let forceY=force.y/PTM_RATIO;
		
		let result={forceX:0, forceY:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.forceX+=forceX;
			result.forceY+=forceY;
		}
		return result;
	}
	
	public static getApplyTorque(body:cc.RigidBody,torque:number):{torque:number}{
		torque=torque/PTM_RATIO;
		
		let result={torque:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.torque+=torque;
		}
		return result;
	}
	
	public static getApplyLinearImpulse(body:cc.RigidBody,impulse:cc.Vec2,point:cc.Vec2):{linearVelocityX:number,linearVelocityY:number,angularVelocity:number}{
		let impulseX=impulse.x/PTM_RATIO;
		let impulseY=impulse.y/PTM_RATIO;
		let pointX=point.x/PTM_RATIO;
		let pointY=point.y/PTM_RATIO;
		
		let result={linearVelocityX:0, linearVelocityY:0, angularVelocity:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.linearVelocityX+=b.m_invMass*impulseX;
			result.linearVelocityY+=b.m_invMass*impulseY;
			result.angularVelocity+=b.m_invI*((pointX-b.m_sweep.c.x)*impulseY-(pointY-b.m_sweep.c.y)*impulseY);
		}
		return result;
	}
	
	public static getApplyLinearImpulseToCenter(body:cc.RigidBody,impulse:cc.Vec2):{linearVelocityX:number,linearVelocityY:number}{
		let impulseX=impulse.x/PTM_RATIO;
		let impulseY=impulse.y/PTM_RATIO;
		
		let result={linearVelocityX:0, linearVelocityY:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.linearVelocityX+=b.m_invMass*impulseX;
			result.linearVelocityY+=b.m_invMass*impulseY;
		}
		return result;
	}
	
	public static getApplyAngularImpulse(body:cc.RigidBody,impulse:number):{angularVelocity:number}{
		impulse=impulse/PTM_RATIO/PTM_RATIO;
		
		let result={angularVelocity:0};
		let b=body['_getBody']();
		if(b.m_type===b2.BodyType.b2_dynamicBody){
			result.angularVelocity+=b.m_invI*(impulse);
		}
		return result;
	}
	//#endregion  box2d预测
	
	/**
	 * 返回圆角矩形逆时针顺序顶点列表
	 * @param extentsX 圆角矩形宽的一半
	 * @param extentsY 圆角矩形高的一半
	 * @param cornerRadius 圆角半径
	 * @param t 光滑插值[0,1]
	 */
	public static getRoundRectangleCcwPoints(extentsX:number=50,extentsY:number=50,cornerRadius:number=10,t:number=0.1):cc.Vec2[]{
		t=t<0?0:t>1?1:t;
		cornerRadius=Math.min(cornerRadius,Math.min(extentsX,extentsY));
		
		let vertices:cc.Vec2[]=[];
		let x:number,y:number,startAngle:number;
		
		x=-extentsX, y=-extentsY;
		startAngle=Math.PI;
		PhysicsUtil.calculteRoundCornerPoints(x+cornerRadius,y+cornerRadius,cornerRadius,startAngle,t,vertices);
		
		x=extentsX, y=-extentsY;
		startAngle=-Math.PI*0.5;
		PhysicsUtil.calculteRoundCornerPoints(x-cornerRadius,y+cornerRadius,cornerRadius,startAngle,t,vertices);
		
		x=extentsX, y=extentsY;
		startAngle=0;
		PhysicsUtil.calculteRoundCornerPoints(x-cornerRadius,y-cornerRadius,cornerRadius,startAngle,t,vertices);
		
		x=-extentsX, y=extentsY;
		startAngle=Math.PI*0.5;
		PhysicsUtil.calculteRoundCornerPoints(x+cornerRadius,y-cornerRadius,cornerRadius,startAngle,t,vertices);
		return vertices;
	}
	
	private static calculteRoundCornerPoints(centerX:number,centerY:number,cornerRadius:number,startAngle:number,t:number,out:cc.Vec2[]):void{
		let arcLen=((Math.PI*0.5)*cornerRadius)|0;
		let count=((arcLen-2)*t+2)|0;//[2,arcLen]
		let x:number,y:number;
		for(let i=0;i<=count;i++){
			let angle=startAngle+(Math.PI*0.5)*(i/count);
			x=centerX+Math.cos(angle)*cornerRadius;
			y=centerY+Math.sin(angle)*cornerRadius;
			out.push(new cc.Vec2(x,y));
		}	
	}
}