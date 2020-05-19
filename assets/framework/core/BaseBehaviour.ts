const {ccclass, property} = cc._decorator;

/** 所有脚本组件的基类 */
@ccclass
export default class BaseBehaviour extends cc.Component{
	
	/** 当附加到一个激活的节点上或者其节点第一次激活时在onEnable和start之前调用 */
	protected onLoad():void{
		
	}
	
	/** 当该组件被启用，并且它的节点也激活时在onLoad之后start之前调用 */
	protected onEnable():void{
		
	}
	
	/** 如果该组件第一次启用，则在所有组件的update之前onLoad、onEnable之后调用 */
	protected start():void{
		
	}
	
	/** 如果该组件启用，则每帧调用 */
	protected update(dt:number):void{
		
	}
	
	/** 如果该组件启用，则每帧在update之后调用 */
	protected lateUpdate(dt:number):void{
		
	}
	
	/** 当该组件被禁用或节点变为无效时调用 */
	protected onDisable():void{
		
	}
	
	/** 当销毁时调用 */
	protected onDestroy():void{
		
	}
}