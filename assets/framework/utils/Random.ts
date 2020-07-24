export default class Random{
	
	/** 返回 [0,1) 的随机浮点数 */
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
	
	/** 返回 [0,val) 的随机浮点数 */
	public static randomFloat(val:number):number{
		return Math.random()*val;
	}
	
	/** 返回 [0,val) 的随机整数 */
	public static randomInt(val:number):number{
		return Math.floor(Math.random()*val);
	}
	
	/** 返回 [min,max) 的随机整数 */
	public static rangeInt(min:number,max:number):number{
		min=Math.floor(min);
		max=Math.floor(max);
		return Math.floor(Math.random()*(max-min)+min);
	}
	
	/** 返回 [min,max) 的随机浮点数 */
	public static rangeFloat(min:number,max:number):number{
		return Math.random()*(max-min)+min;
	}
	
	/** 随机打乱一个数组的所有元素，并返回一个打乱后的新数组*/
	public static randomArrayElements(array:any[]):any[]{
		let len=array.length;
		let randomIndices=Random.getRandomUniqueIntList(0,len,len);
		let tempArray=[];
		for(let i=0;i<len;i++){
			let randomIndex=randomIndices[i];
			tempArray[i]=array[randomIndex];
		}
		return tempArray;
	}
	
	/**
	 * 返回一个指定长度的随机int数组，数组元素范围是在[min,max)区间内(包括min,排除max)不重复的整数。
	 * 注意：参数length的取值范围必须在[1,max-min]区间内，length小于1时取值：1，length大于max-min时取值：max-min。
	 * 例：
	 * ```
	 * getRandomUniqueIntList(0,10,10); //返回元素在[0,10)之间，长度为10的数组
	 * ```
	 * @param min int
	 * @param max int
	 * @param length int
	 */
	public static getRandomUniqueIntList(min:number,max:number,length:number):number[]{
		min|=0;
		max|=0;
		length|=0;
		
		let sourceLength=max-min;
		length=Math.min(Math.max(length,1),sourceLength);

		let results=[];
		
		let sourceList=[];
		let i=0;
		for(i=0;i<sourceLength;i++){
			sourceList[i]=min+i;
		}

		let randomIndex=0;
		for(i=0;i<length;i++){
			randomIndex=Random.rangeInt(0,sourceList.length);
			results[i]=sourceList[randomIndex];
			sourceList.splice(randomIndex,1);
		}
		return results;
	}
	
}
