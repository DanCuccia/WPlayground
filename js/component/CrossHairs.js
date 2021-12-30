define(["util/Utility"], function(Util)
{
	/** Wrapper to create on-screen cross hairs */
	var CrossHairs = function(x,y,z)
	{
		this.x = typeof x === "number" ? x : 5; x = null;
		this.y = typeof y === "number" ? y : 5; y = null;
		this.z = typeof z === "number" ? z : 5; z = null;
		this._parts = [];
		this.position = new Util.V3Proxy(this, "position", function(prop, val){
			if( typeof val === "number" && this._parts.length > 0 )
				for( var i = 0; i < 3; i++ )
					this._parts[i].position[prop] = val;
			else return this.position[prop];
		});
		this.rotation = new Util.V3Proxy(this, "rotation", function(prop, val){
			if( typeof val === "number" && this._parts.length > 0 )
				for( var i = 0; i < 3; i++ )
					this._parts[i].rotation[prop] = val;
			else return this.rotation[prop];
		});
	};

	/** Initialize or re-initialize the scene */
	Object.defineProperty( CrossHairs.prototype, "Initialize", {
		enumerable: false, configurable: false,
		value: function( scene )
		{
			// X axis
			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(-this.x, 0, 0),
				new THREE.Vector3(this.x, 0, 0)
			);
			var drawable = new THREE.Line( geometry, new THREE.LineBasicMaterial( {color: 0x00ff00 }) );
			scene.add( drawable );
			this._parts.push( drawable );

			// Y axis
			geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(0, -this.y, 0),
				new THREE.Vector3(0, this.y, 0)
			);
			drawable = new THREE.Line( geometry, new THREE.LineBasicMaterial( {color: 0x0000ff }) );
			scene.add( drawable );
			this._parts.push( drawable );

			// Z axis
			geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(0, 0, -this.z),
				new THREE.Vector3(0, 0, this.z)
			);
			drawable = new THREE.Line( geometry, new THREE.LineBasicMaterial( {color: 0xff0000 }) );
			scene.add( drawable );
			this._parts.push( drawable );
		}
	});

	/** dispose members */
	Object.defineProperty( CrossHairs.prototype, "dispose", {
		enumerable: false, configurable: false,
		value: function( scene )
		{
			var count = this._parts.length;
			for( var i = 0; i < count; i++ )
				scene.remove( this._parts[i] );
			this._parts.length = 0;
		}
	});

	/** render the crosshairs */
	Object.defineProperty( CrossHairs.prototype, "render", {
		enumerable: false, configurable: false,
		value: function( renderer, camera )
		{
			if( this.scene ) renderer.render( this.scene, camera );
		}
	})

	return CrossHairs;
});