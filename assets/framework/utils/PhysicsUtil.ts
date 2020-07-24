export default class PhysicsUtil{
	
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
	
}