define([ "require", "util/Utility", "lib/stats", "util/Time", "component/Input" ], 
	function( require, Util, Stats, Time, Input )
{
	"use strict";

	/** internal wrapper */
	var State = function( id, state, params )
	{
		this.id = id; id = null;
		this.state = state; state = null;
		this.params = params; params = null;
	};

	var _stateList = [];
	var _renderer = null;
	var _stats = null;
	var _time = null;
	var _pause = false;

	/** Calls the argued method name if available to all registered controllers */
	function fireEvent( ev )
	{
		var count = _stateList.length;
		for( var i = 0; i < count; i++ )
		{
			if( "function" === typeof _stateList[ i ].state[ ev ] )
				_stateList[ i ].state[ ev ]();
		}
	}

	/** Application Driver */
	var AppController = function()
	{
		/** Called on Document.Ready to initialize core components */
		this.Initialize = function()
		{
			_time = new Time();

			_renderer = new THREE.WebGLRenderer();
			_renderer.setSize( window.innerWidth, window.innerHeight );
			_renderer.shadowMapEnabled = true;

			var renderDiv = $("<div>", { id: "layer3D" });
			renderDiv.addClass("layer3D");
			renderDiv.append( _renderer.domElement );
			$("#innerBody").append( renderDiv );

			if( _DEBUG_ )
			{
				_stats = new Stats();
				_stats.setMode(0);
				_stats.domElement.style.position = "absolute";
				_stats.domElement.style.left = _stats.domElement.style.top = 2;
				$("#titleBar").prepend( _stats.domElement );
			}

			requestAnimationFrame( AppController.Update );
		};
		
		/**
		 * called on page close to clean up core components
		 */
		this.Shutdown = function()
		{
			_stateList.remove(
				function(){ return true;} ,
				function(o){ o.state.Release(); }
			);
			_renderer = null;
			_stats = null;
			_time = null;
		};

		/**
		 * Main Update loop
		 */
		this.Update = function()
		{
			_stats&&_stats.begin();
			
			_time.Update();

			Input.Update( _time );
			TWEEN.update();

			var count = _stateList.length;
			for( var i = 0; i < count; i++ )
			{
				_stateList[i].state.Update( _time );
				_stateList[i].state.Render( _renderer );
			}

			_stats&&_stats.end();

			if( false === _pause ) {
				requestAnimationFrame( AppController.Update );
			}
		};

		/** check and default the optional parameters sent to PushController() */
		var _defaultParams = function( params )
		{
			if( typeof params === "undefined" )
				params = {};

			if( typeof params.suspendInput !== "boolean" )
				params.suspendInput = false;

			return params;
		};

		/**
		 * Add a controller to the scene
		 * @param {string} id - name of the controller
		 * @param {object} params - controller initializing parameters
		 */
		this.PushController = function( id, state, params )
		{
			var nextState = new State( id, state, _defaultParams( params ) );
			var start = Date.now();

			if( nextState.params.suspendInput === true )
			{
				Input.SuspendInput( true );
			}

			nextState.state.Initialize( function( success )
			{
				if( success === true )
				{
					var animInComplete = function()
					{
						if( nextState.params.blockInput === true )
							Input.SuspendInput( false );

						if( _DEBUG_ )
						{
							var Logger = require("util/Logger");
							Logger.Info("Controller: \'" + id + "\' | Process Time: " + (Date.now() - start) + "ms");
						}
					};

					_stateList.push( nextState );

					if( "function" === typeof nextState.state.AnimateIn ) 
						nextState.state.AnimateIn( animInComplete );
					else animInComplete();
				}
			});
		};

		/**
		 * Remove/animate out a controller from the scene
		 * @param {string} id - optionally argue name or pop whatever is focused
		 */
		this.PopController = function( id )
		{
			var onComplete = function()
			{
				_stateList.remove( 
					function(obj) { return obj.id === id; }, 
					function(obj){ obj.state.Release(); } 
				);
			};

			if( "string" === typeof id )
			{
				var count = _stateList.length;
				for( var i = 0; i < count; i++ )
				{
					if( _stateList[i].id === id )
					{
						if( typeof _stateList[i].state.AnimateOut === "function" )
							_stateList[i].state.AnimateOut( onComplete );
						else onComplete();
						return true;
					}
				}
				return false;
			} 
			else 
			{
				if( _stateList.length ) 
				{
					count = _stateList.length;
					_stateList[ count -1 ].state.Release();
					return _stateList.splice( count -1, 1 ).length > 0;
				}
			}
		};

		/**
		 * Callback when the window begins to resize (managed by Utility.ResizeController)
		 */
		this.onResizeStart = function()
		{
			AppController.Pause( true );
		};
		
		/**
		 * Callback when the window size changes (managed by Utility.ResizeController)
		 */
		this.onResizeChange = function( dx, dy ) { };

		/**
		 * Callback when the window stops resizing (managed by Utility.ResizeController)
		 */
		this.onResizeEnd = function()
		{
			if( _renderer !== null ) _renderer.setSize( window.innerWidth, window.innerHeight );

			fireEvent( "OnResize" );
			
			AppController.Pause( false );
		};

		/**
		 *  pause or resume the AppController
		 */
		this.Pause = function( val )
		{
			if( "boolean" === typeof val ) {
				if( true === _pause && false === val )
					requestAnimationFrame( AppController.Update );
				_pause = val;
			} else _pause = true;
		};

		/**
		 * Determine if the application is in a paused or running state
		 */
		this.IsPaused = function() { return _pause; };
	};

	AppController = new AppController();

	return AppController;
});