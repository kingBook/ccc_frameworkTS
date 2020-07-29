const b2=window["b2"];
export default class AABBQueryCallback{
	
	_aabb=null;
	_point=new b2.Vec2();
	_isPoint=false;
	_fixtures=[];
	
	init(aabb,point?){
		this._aabb=aabb;
		if(point){
			this._isPoint=true;
			this._point.x=point.x;
			this._point.y=point.y;
		}else {
			this._isPoint=false;
		}
		this._fixtures.length=0;
	}
	
	ReportFixture(fixture){
		if (this._isPoint){
			if (fixture.TestPoint(this._point)){
				this._fixtures.push(fixture);
			}
		}else{
			var isOverlap=false;
			var shape=fixture.GetShape();
			var childCount=shape.GetChildCount();
			for (var childIndex=0;childIndex<childCount;childIndex++){
				var aabb=fixture.GetAABB(childIndex);
				const aabbOverlap=b2.TestOverlapAABB(this._aabb,aabb);
				if(aabbOverlap){
					isOverlap=true;
					break;
				}
			}
			if(isOverlap){
				this._fixtures.push(fixture);
			}
		}
		return true;
	}
	
	getFixture(){
		return this._fixtures[0];
	}
	
	getFixtures(){
		return this._fixtures;
	}
}