import BaseBehaviour from "../core/BaseBehaviour";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Random extends BaseBehaviour{
	
	/** 返回区间 [0,1) 的随机浮点数 */
	public static get value():number{ 
		return Math.random(); 
	}
	
	/** 返回随机的true或false */
	public static get boolean():Boolean{
		return Math.random()<0.5;
	}
	
	/** 返回随机的1或-1 */
	public static get wave():number{
		return Math.random()<0.5?1:-1;
	}
	
	/** 返回区间 [0,val) 的随机浮点数 */
	public static randomFloat(val:number):number{
		return Math.random()*val;
	}
	
	/** 返回区间 [0,val) 的随机整数 */
	public static randomInt(val:number):number{
		return Math.floor(Math.random()*val);
	}
	
	/** 返回区间 [min,max) 的随机整数 */
	public static rangeInt(min:number,max:number):number{
		min=Math.floor(min);
		max=Math.floor(max);
		return Math.floor(Math.random()*(max-min)+min);
	}
	
	/** 返回 [min,max) 的随机浮点数 */
	public static rangeFloat(min:number,max:number):number{
		return Math.random()*(max-min)+min;
	}
	
}
