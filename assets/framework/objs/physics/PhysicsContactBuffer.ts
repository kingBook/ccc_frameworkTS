import BaseBehaviour from "../../core/BaseBehaviour";

const{ccclass,requireComponent}=cc._decorator;
const b2=window["b2"];
/**
 * ```
 * {
 * 	normal:b2Vec2,
 * 	points:b2Vec2[],
 * 	separations:number[]
 * }
 * ```
 */
const tempWorldManifold=new b2.WorldManifold();
/**
 * ```
 * {
 * 	prev:b2ContactEdge,
 * 	next:b2ContactEdge,
 * 	contact:b2Contact
 * }
 * ```
 */
type b2ContactEdge=typeof b2.ContactEdge;

/** 物理接触缓存器，用于每帧保存刚体的所有接触（需要开启cc.RigidBody.enabledContactListener） */
@ccclass
@requireComponent(cc.RigidBody)
export default class PhysicsContactBuffer extends BaseBehaviour{
	
	private _rigidBody:cc.RigidBody;
	
	/** 当前帧的物理接触列表 */
	public getContactList():b2ContactEdge{
		let b2Body=this._rigidBody["_getBody"]();
		return b2Body?b2Body.GetContactList():null;
	}
	
	protected onLoad():void{
		super.onLoad();
		this._rigidBody=this.node.getComponent(cc.RigidBody);
	}
	
	protected start():void{
		super.start();
	}
	
	/*protected update():void{
		let b2Body=this._rigidBody["_getBody"]();
		for(let c=b2Body.GetContactList();c;c=c.next){
			let contact=c.contact;
			//contact._contact:cc.PhysicsContact; //ccPhysicsContact._b2contact:b2Contact
			//contact.GetWorldManifold(tempWorldManifold):void; //不需要反转法线
			//contact.GetManifold():b2Manifold;
			//contact.IsTouching():boolean;
			//contact.SetEnabled(boolean);
			//contact.IsEnabled():boolean;
			//contact.GetNext():b2Contact;
			//contact.GetFixtureA():b2Fixture;
			//contact.GetChildIndexA():number;
			//contact.GetFixtureB():b2Fixture;
			//contact.GetChildIndexB():number;
			//contact.FlagForFiltering():void;
			//contact.SetFriction(number):number;
			//contact.GetFriction():number;
			//contact.ResetFriction():void;
			//contact.SetRestitution(number):void;
			//contact.GetRestitution():number;
			//contact.ResetRestitution():void;
			//contact.SetTangentSpeed(number):void;
			//contact.GetTangentSpeed():number;
			//contact.Rest(fixtureA, indexA, fixtureB, indexB):void;
			//contact.Update(listener):void;
			//contact.ComputeTOI(sweepA, sweepB):number;
		}
	}*/
	
	

	
}