export default class NodeUtil{
	
	/**
	 * 获取节点的旋转角在世界坐标下的值（单位：角度）
	 * @param node 
	 */
	public static getWorldAngle(node:cc.Node):number{
		let angle=node.angle;
		let parent=node.parent;
		while(parent){
			angle+=parent.angle;
			parent=parent.parent;
		}
		angle%=360;
		if     (angle>180) angle-=360;
		else if(angle<-180)angle+=360;
		return angle;
	}
	
	/**
	 * 获取世界坐标系旋转角在以node为原点的坐标系下的值（单位：角度）
	 * @param node 
	 * @param worldAngle 
	 */
	public static getLocalAngle(node:cc.Node, worldAngle:number){
		let angle=worldAngle;
		let parent=node;
		while(parent){
			angle-=parent.angle;
			parent=parent.parent;
		}
		angle%=360;
		if     (angle>180) angle-=360;
		else if(angle<-180)angle+=360;
		return angle;
	}
	
	/**
	 * 获取node原点在世界坐标系下的值
	 * @param node 
	 */
	public static getWorldPositionV2(node:cc.Node):cc.Vec2{
		return node.parent.convertToWorldSpaceAR(node.getPosition());
	}
	
	/**
	 * 获取node原点在世界坐标系下的值
	 * @param node 
	 */
	public static getWorldPositionV3(node:cc.Node):cc.Vec3{
		return node.parent.convertToWorldSpaceAR(node.position);
	}
	
	/**
	 * 获取世界坐标在以node为原点的坐标系下的值
	 * @param node 
	 * @param worldPosition 
	 */
	public static getLocalPositionV2(node:cc.Node,worldPosition:cc.Vec2):cc.Vec2{
		return node.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 *获取世界坐标在以node为原点的坐标系下的值
	 * @param node 
	 * @param worldPosition 
	 */
	public static getLocalPositionV3(node:cc.Node,worldPosition:cc.Vec3):cc.Vec3{
		return node.convertToNodeSpaceAR(worldPosition);
	}
}