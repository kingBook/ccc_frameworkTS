const b2=window["b2"];
export default class AABBQueryCallback{
	
	_point=new b2.Vec2();
	_isPoint=false;
	_fixtures=[];
	
	init(point?){
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
		var body=fixture.GetBody();
		if (this._isPoint){
			if (fixture.TestPoint(this._point)){
				this._fixtures.push(fixture);
			}
		}else{
			this._fixtures.push(fixture);
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