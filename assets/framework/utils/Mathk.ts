
const {ccclass, property} = cc._decorator;

@ccclass
export default class Mathk extends cc.Component {
	
	public static clamp(val:number,min:number,max:number):number{
		return val < min ? min : val > max ? max : val;
	}
	
	public static clamp01(val:number):number{
		return val < 0 ? 0 : val > 1 ? 1 : val;
	}
}
