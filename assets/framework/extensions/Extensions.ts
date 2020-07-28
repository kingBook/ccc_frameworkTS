/**
 * 需要在程序第一个执行的.ts导入此文件，如：
 * ```
 * import "../extensions/Extensions";
 * const {ccclass, property} = cc._decorator;
 * @ccclass
 * export default class Main extends cc.Component{ }
 */
import AABBQueryCallback from "./AABBQueryCallback";

const b2=window["b2"];
var b2_aabb_tmp=new b2.AABB();
var b2_vec2_tmp1=new b2.Vec2();
var aabbQueryCallback=new AABBQueryCallback();

cc.PhysicsManager.prototype['testPoint2']=function(point){
	const PTM_RATIO=cc.PhysicsManager.PTM_RATIO;
	var x=b2_vec2_tmp1.x=point.x/PTM_RATIO;
	var y=b2_vec2_tmp1.y=point.y/PTM_RATIO;
	
	var d=0.2/PTM_RATIO;
	b2_aabb_tmp.lowerBound.x=x-d;
	b2_aabb_tmp.lowerBound.y=y-d;
	b2_aabb_tmp.upperBound.x=x+d;
	b2_aabb_tmp.upperBound.y=y+d;
	
	var callback=aabbQueryCallback;
	callback.init(b2_vec2_tmp1);
	this._world.QueryAABB(callback,b2_aabb_tmp);
	
	var fixtures=callback.getFixtures();
	var colliders=fixtures.map(function(fixture){
		return fixture.collider;
	});
	return colliders;
}

cc.PhysicsManager.prototype['testAABB2']=function(rect){
	const PTM_RATIO=cc.PhysicsManager.PTM_RATIO;
	b2_aabb_tmp.lowerBound.x=rect.xMin/PTM_RATIO;
	b2_aabb_tmp.lowerBound.y=rect.yMin/PTM_RATIO;
	b2_aabb_tmp.upperBound.x=rect.xMax/PTM_RATIO;
	b2_aabb_tmp.upperBound.y=rect.yMax/PTM_RATIO;
	
	var callback=aabbQueryCallback;
	callback.init();
	this._world.QueryAABB(callback,b2_aabb_tmp);
	
	var fixtures=callback.getFixtures();
	var colliders=fixtures.map(function(fixture){
		return fixture.collider;
	});
	return colliders;
}