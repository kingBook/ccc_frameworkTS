export default class NodeUtil{
	
	/**
	 * 获取节点的旋转角在世界坐标系下的旋转角（单位：角度）
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
	 * 获取世界坐标系旋转角在以node为原点的坐标系下的旋转角（单位：角度）
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
	 * 获取 parentNode 坐标系下的 localPosition 位置在世界坐标系下的位置（单位：像素）
	 * @param parentNode 
	 * @param localPosition parentNode 坐标系下的位置
	 */
	public static getWorldPositionV2UnderLocal(parentNode:cc.Node,localPosition:cc.Vec2){
		return parentNode.convertToWorldSpaceAR(localPosition);
	}
	
	/**
	 * 获取 parentNode 坐标系下的 localPosition 位置在世界坐标系下的位置（单位：像素）
	 * @param parentNode 
	 * @param localPosition parentNode 坐标系下的位置
	 */
	public static getWorldPositionV3UnderLocal(parentNode:cc.Node,localPosition:cc.Vec3):cc.Vec3{
		return parentNode.convertToWorldSpaceAR(localPosition);
	}
	
	/**
	 * 获取node原点在世界坐标系下的位置（单位：像素）
	 * @param node 
	 */
	public static getWorldPositionV2(node:cc.Node):cc.Vec2{
		return node.parent.convertToWorldSpaceAR(node.getPosition());
	}
	
	/**
	 * 获取node原点在世界坐标系下的位置（单位：像素）
	 * @param node 
	 */
	public static getWorldPositionV3(node:cc.Node):cc.Vec3{
		return node.parent.convertToWorldSpaceAR(node.position);
	}
	
	/**
	 * 获取世界坐标在以node为原点的坐标系下的位置（单位：像素）
	 * @param node 
	 * @param worldPosition 
	 */
	public static getLocalPositionV2(node:cc.Node,worldPosition:cc.Vec2):cc.Vec2{
		return node.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 获取世界坐标在以node为原点的坐标系下的位置（单位：像素）
	 * @param node 
	 * @param worldPosition 
	 */
	public static getLocalPositionV3(node:cc.Node,worldPosition:cc.Vec3):cc.Vec3{
		return node.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 获取 parentNode 坐标系的 localPosition 位置在 targetNode 坐标系下的位置（单位：像素）
	 * @param parentNode 
	 * @param localPosition parentNode 坐标系下的位置
	 * @param targetNode
	 */
	public static getLocalPositionV2UnderLocal(parentNode:cc.Node,localPosition:cc.Vec2,targetNode:cc.Node):cc.Vec2{
		let worldPosition=parentNode.convertToWorldSpaceAR(localPosition);
		return targetNode.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 获取 parentNode 坐标系的 localPosition 位置在 targetNode 坐标系下的位置（单位：像素）
	 * @param parentNode 
	 * @param localPosition parentNode 坐标系下的位置
	 * @param targetNode
	 */
	public static getLocalPositionV3UnderLocal(parentNode:cc.Node,localPosition:cc.Vec3,targetNode:cc.Node):cc.Vec3{
		let worldPosition=parentNode.convertToWorldSpaceAR(localPosition);
		return targetNode.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 获取originNode在以targetNode为原点的坐标系下的位置（单位：像素）
	 * @param originNode 
	 * @param targetNode 
	 */
	public static getLocalPositionV2UnderNode(originNode:cc.Node,targetNode:cc.Node):cc.Vec2{
		let worldPosition=originNode.parent.convertToWorldSpaceAR(originNode.getPosition());
		return targetNode.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 获取originNode在以targetNode为原点的坐标系下的位置（单位：像素）
	 * @param originNode 
	 * @param targetNode 
	 */
	public static getLocalPositionV3UnderNode(originNode:cc.Node,targetNode:cc.Node):cc.Vec3{
		let worldPosition=originNode.parent.convertToWorldSpaceAR(originNode.position);
		return targetNode.convertToNodeSpaceAR(worldPosition);
	}
	
	/**
	 * 递归查找父节点中第一个匹配指定类型的组件。
	 * @param node 
	 * @param type 
	 */
	public static getComponentInParent<T extends cc.Component>(node:cc.Node, type:{prototype:T}):T{
		let parent=node.parent;
		while(parent){
			if(parent instanceof cc.Scene)break;
			let cpt=parent.getComponent(type);
			if(cpt)return cpt;
			parent=parent.parent;
		}
		return null;
	}
}