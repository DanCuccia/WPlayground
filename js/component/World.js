define([], function()
{
	"use strict";

	/** Wraps a single object in the world */
	var Child = function( id, drawable, body, proxy )
	{
		this.id = id; id = null;
		this.drawable = drawable; drawable = null;
		this.body = body; body = null;
		this.proxy = proxy; proxy = null;
	};

	/** remove all references */
	Child.prototype.dispose = function()
	{
		this.id = this.drawable = this.body = this.proxy = null;
	}

	/**
	 * Container wrapping a THREE scene, and CANNON physics world
	 */
	var World = function( )
	{
		this._scene = new THREE.Scene();
		this._physics = new CANNON.World();
		this._physics.gravity.set( 0, -9.82, 0);
		this._physics.broadphase = new CANNON.NaiveBroadphase();
		this._physics.solver.iterations = 5
		this._children = [];
	};

	var good = function(o){return o !== null && typeof o !== "undefined";};

	/** per-cycle update call */
	World.prototype.update = function( time )
	{
		this._physics.step( 1 / 60 );
		var count = this._children.length;
		for( var i = 0; i < count; i++ )
		{
			this._children[i].proxy( this._children[i].drawable, this._children[i].body );
		}
	};

	/** renders the scene with the argued camera */
	World.prototype.render = function( renderer, camera )
	{
		renderer.render( this._scene, camera );
	};

	/** fully clear the world object */
	World.prototype.dispose = function()
	{
		var count = this._children.length;
		for( var i = 0; i < count; i++ )
		{
			if( this._children[i].drawable !== null )
				this._scene.remove( this._children[i].drawable );
			if( this._children[i].body !== null )
				this._physics.remove( this._children[i].body );
			this._children[i].dispose();
		}
		this._scene = this._physics = this._children = null;
	};

	/** Add an object to the world */
	World.prototype.add = function( id, drawable, body, proxy )
	{
		if( good( id ) )
		{
			var child = new Child( id, drawable, body, proxy );
			if( good( drawable ) )
				this._scene.add( drawable );

			if( good( body ) )
				this._physics.add( body );

			if( ! good( proxy ) && good( body ) ) {
				child.proxy = function( d, b ) {
					b.position.copy( d.position );
					b.quaternion.copy( d.quaternion );
				};
			} else if( ! good( proxy ) ) child.proxy = nullfn;

			this._children.push( child );
		}
	};

	/** remove an object by id */
	World.prototype.removeById = function( id )
	{
		var count = this._children.length;
		for( var i = 0; i < count; i++ )
		{
			if( this._children[i].id === id )
			{
				if( this._children[i].drawable !== null )
					this._scene.remove( this._children[i].drawable );
				if( this._children[i].body !== null )
					this._physics.remove( this._children[i].body );
				this._children[i].dispose();
				this._children.splice(i, 1);
				break;
			}
		}
	};

	/** remove an object by drawable reference */
	World.prototype.removeByDrawable = function( drawable )
	{
		var count = this._children.length;
		for( var i = 0; i < count; i++ )
		{
			if( this._children[i].drawable === drawable )
			{
				if( this._children[i].drawable !== null )
					this._scene.remove( this._children[i].drawable );
				if( this._children[i].body !== null )
					this._physics.remove( this._children[i].body );
				this._children[i].dispose();
				this._children.splice(i, 1);
				break;
			}
		}
	};

	/** remove an object by physics body reference */
	World.prototype.removeByBody = function( body )
	{
		var count = this._children.length;
		for( var i = 0; i < count; i++ )
		{
			if( this._children[i].body === body )
			{
				if( this._children[i].drawable !== null )
					this._scene.remove( this._children[i].drawable );
				if( this._children[i].body !== null )
					this._physics.remove( this._children[i].body );
				this._children[i].dispose();
				this._children.splice(i, 1);
				break;
			}
		}
	};

	return World;	
});