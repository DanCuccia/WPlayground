define(["require", "component/CrossHairs", "component/World"], 
	function(require, CrossHairs, World)
{
	"use strict";

	/* A controller to test stuff with */
	var Controller = function()
	{
		this._camera = null;
		this._msHandler = null;
		this._kbHandler = null;
		this._light = null;
		this._world = null;
	};

	Controller.prototype.initBoxGroup = function()
	{
		var center = {x: -10, z: 0};
		var count = 7;
		for( var x = 0; x < count; x++ )
		{
			for( var y = 0; y < count; y++ )
			{
				var drawable = new THREE.Mesh( 
					new THREE.BoxGeometry(0.5, 0.5, 0.5), 
					new THREE.MeshPhongMaterial({ color: 0xeeeeee }) 
				);
				drawable.position.x = -count * 0.5 + x + 0.5 + center.x;
				drawable.position.z = -count * 0.5 + y + 0.5 + center.z;
				drawable.position.y = 1;
				drawable.castShadow = true;
				drawable.receiveShadow = true;
				this._world.add("shadowBox", drawable);
			}
		}
		
		// directional light
		this._light = new THREE.SpotLight( 0xeeeeee, 1, 100 );
		this._light.position.y = 6;
        this._light.target.position.x = center.x;
        this._light.target.position.z = center.z;
		this._light.shadowCameraVisible = _DEBUG_ ? true : false;
		this._light.castShadow = true;
		this._light.shadowCameraNear = 0.1;
        this._light.shadowCameraFar = 20;
        this._light.shadowMapWidth = 1024;
        this._light.shadowMapHeight = 1024;
        this._light.shadowCameraFov = 75;
        this._light.shadowDarkness = 0.25;
		this._world.add("rotLight", this._light);
	}

	Controller.prototype.initPhysicsGroup = function( )
	{
		var center = {x: 10, z: 0};

		var drawable, actorShape, actorBody;

		// splot light
		drawable = new THREE.SpotLight( 0xeeeeee, 1, 100 );
		drawable.position.y = 12;
		drawable.position.x = center.x;
        drawable.target.position.x = center.x;
        drawable.target.position.z = center.z;
		drawable.shadowCameraVisible = _DEBUG_ ? true : false;
		drawable.castShadow = true;
		drawable.shadowCameraNear = 0.1;
        drawable.shadowCameraFar = 20;
        drawable.shadowMapWidth = 1024;
        drawable.shadowMapHeight = 1024;
        drawable.shadowCameraFov = 80;
        drawable.shadowDarkness = 0.25;
		this._world.add("spot light", drawable);

		// top bumper
		drawable = new THREE.Mesh( 
			new THREE.BoxGeometry(3, 0.2, 5), 
			new THREE.MeshPhongMaterial({ color: 0xeeeeee }) 
		);
		drawable.castShadow = true;
		drawable.receiveShadow = true;
		drawable.rotation.z = Math.toRadians( 20 );
		actorShape = new CANNON.Box( new CANNON.Vec3(1.5, 0.5, 3) );
		actorBody = new CANNON.RigidBody(0, actorShape);
		actorBody.position.x = center.x + 1;
		actorBody.position.y = 5;
		actorBody.position.copy( drawable.position );
		actorBody.quaternion.setFromAxisAngle( { x: 0, y: 0, z: 1 }, Math.toRadians( 20 ) );
		this._world.add("bumper1", drawable, actorBody);

		// middle bumper
		drawable = new THREE.Mesh( 
			new THREE.BoxGeometry(3, 0.2, 5), 
			new THREE.MeshPhongMaterial({ color: 0xeeeeee }) 
		);
		drawable.castShadow = true;
		drawable.receiveShadow = true;
		drawable.rotation.z = Math.toRadians( -20 );
		actorShape = new CANNON.Box( new CANNON.Vec3(1.5, 0.5, 3) );
		actorBody = new CANNON.RigidBody(0, actorShape);
		actorBody.position.x = center.x - 2;
		actorBody.position.y = 3;
		actorBody.position.copy( drawable.position );
		actorBody.quaternion.setFromAxisAngle( { x: 0, y: 0, z: 1 }, Math.toRadians( -20 ) );
		this._world.add("bumper2", drawable, actorBody);

		// bottom bumper
		drawable = new THREE.Mesh( 
			new THREE.BoxGeometry(3, 0.2, 5), 
			new THREE.MeshPhongMaterial({ color: 0xeeeeee }) 
		);
		drawable.castShadow = true;
		drawable.receiveShadow = true;
		drawable.rotation.z = Math.toRadians( 20 );
		actorShape = new CANNON.Box( new CANNON.Vec3(1.5, 0.5, 3) );
		actorBody = new CANNON.RigidBody(0, actorShape);
		actorBody.position.x = center.x + 1;
		actorBody.position.y = 1;
		actorBody.quaternion.setFromAxisAngle( { x: 0, y: 0, z: 1 }, Math.toRadians( 20 ) );
		actorBody.position.copy( drawable.position );
		this._world.add("bumper3", drawable, actorBody);

		// spawn particles
		var Input = require("component/Input");
		this._kbHandler.addListener( Input.KeyMap.F, Input.ButtonState.Hold, (function(world){

			var last = Date.now();
			return function( timeDown ) 
			{
				var now = Date.now();
				if( now - last > 250 )
				{
					var drawable = new THREE.Mesh(
						new THREE.SphereGeometry( 0.25, 10, 10, 1 ),
						new THREE.MeshPhongMaterial({ color: 0xeeeeee })
					);
					drawable.castShadow = true;

					var body = new CANNON.RigidBody( 5, new CANNON.Sphere( 0.25 ) );
					body.position.x = center.x;
					body.position.z = center.z;
					body.position.y = 8;
					body.velocity.z = (1 * Math.random()) - 0.5;

					body.position.copy( drawable.position );

					world.add( "particle", drawable, body, function( drawable, body ){
						body.position.copy( drawable.position );
						drawable.position.y -= 0.5;
						body.quaternion.copy( drawable.quaternion );
					});

					setTimeout( function(){
						world.removeByDrawable( drawable );
					}, 7000);

					last = now;
				}
			};
			
		})(this._world));
	}

	Controller.prototype.initInput = function()
	{
		var Input = require("component/Input");

		this._msHandler = Input.CreateMouseHandler( "test" );
		this._kbHandler = Input.CreateKeyboardHandler( "test" );

		this._kbHandler.addListener(Input.KeyMap.W, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateZ( -0.1 ); };
		})(this._camera) );
		this._kbHandler.addListener(Input.KeyMap.S, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateZ( 0.1 ); };
		})(this._camera) );
		this._kbHandler.addListener(Input.KeyMap.A, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateX( -0.1 ); };
		})(this._camera) );
		this._kbHandler.addListener(Input.KeyMap.D, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateX( 0.1 ); };
		})(this._camera) );
		this._kbHandler.addListener(Input.KeyMap.E, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateY( 0.1 ); };
		})(this._camera) );
		this._kbHandler.addListener(Input.KeyMap.Q, Input.ButtonState.Hold, (function(camera){
			return function(timeDown){ camera.translateY( -0.1 ); };
		})(this._camera) );

		this._msHandler.addListener( Input.Mouse.Move, null, (function(camera){
			return function(ms){
				if( Input.IsMouseButtonDown( Input.Mouse.LeftButton ) === true ) {
					camera.rotation.x += ms.dy * -0.001;
					camera.rotation.y += ms.dx * -0.001;
				}
			};
		})(this._camera) );

		this._kbHandler.addListener( Input.KeyMap.P, Input.ButtonState.Release, function( timeDown ){
			var AC = require("component/AppController");
			AC.Pause( ! AC.IsPaused() );
		});

		this._kbHandler.addListener( Input.KeyMap.M, Input.ButtonState.Release, function( timeDown ) {
			var MBox = require("controller/MessageBox");
			var AppController = require("component/AppController");
			var options = [
				{
					text: "Yes!",
					callback: function() { AppController.PopController(); }
				},
				{
					text: "No!",
					callback: function() { AppController.PopController(); }
				},
				{
					text: "Ew.",
					callback: function() { AppController.PopController(); }
				}
			];
			var msg = new MBox("Hello there, friend.\nWould you like to have a diet coke?", options, MBox.AnimationMode.None );
			AppController.PushController( "message", msg, {
				suspendInput: true
			} );
		});
	}

	/** Initialize all members for runtime */
	Controller.prototype.Initialize = function( onComplete )
	{
		this._camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000.0 );
		this._camera.eulerOrder = "YXZ";
		this._camera.position.z = 11;
		this._camera.position.y = 2;

		this._world = new World();
		
		var drawable = new THREE.Mesh(
			new THREE.BoxGeometry( 50, 0.25, 50 ),
			new THREE.MeshPhongMaterial( { color: 0xeeeeee } )
		);
		drawable.receiveShadow = true;
		
		var actorShape = new CANNON.Box( new CANNON.Vec3(50, 0.25, 50) );
		var actorBody = new CANNON.RigidBody(0, actorShape);
		this._world.add("floor", drawable, actorBody, function(drawable, body){
			body.position.copy( drawable.position );
			drawable.position.y -= 0.25;
		});

		drawable = new THREE.PointLight( 0xfdffe3, 0.7, 2000 );
		drawable.castShadow = false;
		drawable.position.y = 1000;
		this._world.add("ambience", drawable);
		
		this.initBoxGroup( );
		this.initInput( );
		this.initPhysicsGroup( );

		onComplete( true );
	};

	/** Release All members */
	Controller.prototype.Release = function()
	{
		this._scene = this._camera = null;
		
		this._msHandler.dispose();
		this._msHandler = null;
		
		this._kbHandler.dispose();
		this._kbHandler = null;
		
		this._world.dispose();
	};

	/** Optional call to animate the state in after .Initialize has completed */
	Controller.prototype.AnimateIn = function( onComplete )
	{
		onComplete( true );
	};

	/** Optional call to aniate the state out before .Release is called */
	Controller.prototype.AnimateOut = function( onComplete )
	{
		onComplete( true );
	};

	var _lightAngle = 0;
	var _boxScene = {x: -10, z: 0};
	var _physicsScene = {x: 10, z: 0};

	/** Called once per-frame - to be kept to a minimum */
	Controller.prototype.Update = function( time )
	{
		_lightAngle += Math.toRadians( 1 );
		this._light.position.x = _boxScene.x + Math.sin( _lightAngle ) * 5;
		this._light.position.z = _boxScene.z + Math.cos( _lightAngle ) * 5;

		this._world.update( time );
	};

	/** respond to a window size change event */
	Controller.prototype.OnResize = function()
	{
		this._camera.aspect = window.innerWidth / window.innerHeight;
		this._camera.updateProjectionMatrix();
	};

	/** Called to render the scene */
	Controller.prototype.Render = function( renderer )
	{
		this._world.render( renderer, this._camera );
	};

	return Controller;
});