define(["require", "lib/jquery"],
	function(require, $)
{
	"use strict";

	// ==============================================================================
	// ====================================KeyMaps===================================
	// ==============================================================================

	var KeyMap = {
		A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, 
		R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
		"0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
		Escape: 27, Space: 32, Left: 37, Up: 38, Right: 39, Down: 40, Enter: 13
	};

	var Mouse = {
		LeftButton: 1,
		MiddleButton: 2,
		RightButton: 3,
		Move: "move",
		ScrollUp: "scrollUp",
		ScrollDown: "scrollDown"
	};

	var ButtonState = {
		Press: 1, Hold: 2, Release: 3
	};

	// ==============================================================================
	// ==============================KeyboardManager=================================
	// ==============================================================================

	/** Manages all Keyboard handlers and is the entry point of all keyboard events */
	var KeyboardManager = function()
	{
		var _active = true;
		var _createQueue = [];
		var _removeQueue = [];
		var _activeHandlers = [];
		var _activeKeys = [];
		var _gotoQueue = false;

		/** move queued handlers to the active list */
		var procQueues = function()
		{
			var count = _createQueue.length;
			for( var i = 0; i < count; i++ )
			{
				_activeHandlers.push( _createQueue[i] );
			}
			_createQueue.length = 0;

			var count = _removeQueue.length;
			for( var i = 0; i < count; i++ )
			{
				_activeHandlers.remove( _removeQueue[i] );
			}
			_removeQueue.length = 0;
		};

		/** document on key down entry point */
		var onKeyDown = function( event )
		{
			_gotoQueue = true;

			var key = _activeKeys.where( function(obj){ return obj.keyCode === event.keyCode; }, true );

			if( key === null )
			{
				var count = _activeHandlers.length;
				for( var i = 0; i < count; i++ )
				{
					if( _activeHandlers[i].active === true )
					{
						_activeHandlers[i].Event( event.keyCode, ButtonState.Press, 0 );
					}
				}
				_activeKeys.push( { timestamp: Date.now(), keyCode: event.keyCode } );

				procQueues();
			}
			
			_gotoQueue = false;
		};

		/** document on key up entry point */
		var onKeyUp = function( event )
		{
			_gotoQueue = true;
			
			var key = _activeKeys.where( function(obj) { return obj.keyCode === event.keyCode; }, true);

			if( key !== null )
			{
				var now = Date.now();
				var count = _activeHandlers.length;
				for( var i = 0; i < count; i++ )
				{
					if( _activeHandlers[i].active === true )
					{
						_activeHandlers[i].Event( event.keyCode, ButtonState.Release, now - key.timestamp );
					}
				}

				_activeKeys.remove( function(obj){ return obj.keyCode === event.keyCode; } );

				procQueues();
			}

			_gotoQueue = false;
		};

		$(document).on("keydown", onKeyDown);
		$(document).on("keyup", onKeyUp);

		/** suspend all events from firing */
		this.SuspendInput = function( val )
		{
			if( typeof val !== "boolean" )
				val = true;

			_active = !val;
		};

		/** handlers register themselves during ctor for events */
		this.RegisterHandler = function( handler )
		{
			if( _gotoQueue === false )
				_activeHandlers.push( handler );
			else _createQueue.push( handler );
		};

		/** handlers detatch themselves during .dispose() from events */
		this.RemoveHandler = function( handler )
		{
			if( _gotoQueue === false )
				_activeHandlers.remove( function(obj) { return obj.id === handler.id } );
			else _removeQueue.push( handler );
		};

		/** per-cycle logic used for hold events */
		this.Update = function( time )
		{
			var count = _activeKeys.length; 
			var hCount = _activeHandlers.length;
			for( var i = 0; i < count; i++ )
			{
				for( var h = 0; h < hCount; h++ )
				{
					_activeHandlers[h].Event( _activeKeys[i].keyCode, ButtonState.Hold, time.now - _activeKeys[i].timestamp );
				}
			}
		};
	};

	KeyboardManager = new KeyboardManager();

	/** Manages a single handler listening to the manager's events */
	var KeyboardHandler = function( id )
	{
		this.id = id; id = null;
		this.active = true;
		this.listeners = [];
		KeyboardManager.RegisterHandler( this );
	};

	/** add a key listener */
	Object.defineProperty( KeyboardHandler.prototype, "addListener", {
		enumerable: false, configurable: false,
		value: function( key, state, handler )
		{
			this.listeners.push({
				keyCode: key,
				state: state,
				handler: handler
			});
		}
	});

	/** remove a handler by key and state */
	Object.defineProperty( KeyboardHandler.prototype, "removeListener", {
		enumerable: false, configurable: false,
		value: function( key, state )
		{
			this.listeners.remove( function(obj){ return obj.keyCode === KeyMap[ key ] && obj.state === state; } );
		}
	})

	/** Recieve an event from the Manager */
	Object.defineProperty( KeyboardHandler.prototype, "Event", {
		enumerable: false, configurable: false,
		value: function( key, state, time )
		{
			var count = this.listeners.length;
			for( var i = 0; i < count; i++ )
			{
				if( this.listeners[i].keyCode === key && this.listeners[i].state === state )
					this.listeners[i].handler( time );
			}
		}
	});

	/** remove members and detatch from manager's events */
	Object.defineProperty( KeyboardHandler.prototype, "dispose", {
		enumerable: false, configurable: false,
		value: function() {
			KeyboardManager.RemoveHandler( this );
			this.id = this.active = this.listeners = null;
		}
	});


	// ==============================================================================
	// =============================MouseManager=====================================
	// ==============================================================================
	
	/**
	 * All mouse events originate here
	 */
	var MouseManager = function()
	{
		var _active = true;
		var _gotoQueue = false;
		var _createQueue = [];
		var _removeQueue = [];
		var _activeHandlers = [];
		var _activeKeys = [];
		var _currentMouse = {x: 0, y: 0, dx: 0, dy: 0};
		var _moveAttached = false;
		var _moveListeners = 0;

		/** move queued handlers to the active handler list */
		var procQueues = function()
		{
			var count = _createQueue.length;
			for( var i = 0; i < count; i++ )
			{
				_activeHandlers.push( _createQueue[i] );
			}
			_createQueue.length = 0;

			var count = _removeQueue.length;
			for( var i = 0; i < count; i++ )
			{
				_activeHandlers.remove( _removeQueue[i] );
			}
			_removeQueue.length = 0;
		};

		/** mouse move event entry point */
		var onMouseMove = function( ev )
		{
			_currentMouse.dx = ev.pageX - _currentMouse.x;
			_currentMouse.dy = ev.pageY - _currentMouse.y;
			_currentMouse.x = ev.pageX;
			_currentMouse.y = ev.pageY;

			if( _active === false )
				return;
			
			var count = _activeHandlers.length;
			for( var i = 0; i < count; i++ )
			{
				if( _activeHandlers[i].active === true )
				{
					_activeHandlers[i].Event( Mouse.Move, null, _currentMouse );
				}
			}
		};

		/** scroll move entry point */
		var onScrollMove = function( ev )
		{
			if( _active === false )
				return;

			// TODO
		};

		/** document event mouse down entry point */
		var onMouseDown = function( event )
		{
			if( _active === false )
				return;

			_gotoQueue = true;

			var key = _activeKeys.where( function(obj){ return obj.keyCode === event.which; }, true );

			if( key === null )
			{
				var count = _activeHandlers.length;
				for( var i = 0; i < count; i++ )
				{
					_activeHandlers[i].Event( event.which, ButtonState.Press, 0 );
				}

				_activeKeys.push({
					keyCode: event.which,
					timestamp: Date.now()
				});

				procQueues();
			}

			_gotoQueue = false;
		};

		/** document event mouse up entry point */
		var onMouseUp = function( event )
		{
			if( _active === false )
				return;
			
			_gotoQueue = true;
			
			var key = _activeKeys.where( function(obj) { return obj.keyCode === event.which; }, true);

			if( key !== null )
			{
				var now = Date.now();
				var count = _activeHandlers.length;
				for( var i = 0; i < count; i++ )
				{
					if( _activeHandlers[i].active === true )
					{
						_activeHandlers[i].Event( event.which, ButtonState.Release, now - key.timestamp );
					}
				}

				_activeKeys.remove( function(obj){ return obj.keyCode === event.which; } );

				procQueues();
			}

			_gotoQueue = false;
		};

		$(document).on( "scroll", onScrollMove );
		$(document).on( "mousedown", onMouseDown );
		$(document).on( "mouseup", onMouseUp );
		$(document).on( "mousemove", onMouseMove );

		/** suspend all events from firing */
		this.SuspendInput = function( val )
		{
			if( typeof val !== "boolean" )
				val = true;
			
			_active = !val;
		};

		/** Called during handler ctor - registers for manager events */
		this.RegisterHandler = function( handler )
		{
			if( _gotoQueue === false )
				_activeHandlers.push( handler );
			else _createQueue.push( handler );
		};

		/** called during handler .dispose() - detatch from manager events */ 
		this.RemoveHandler = function( handler )
		{
			if( _gotoQueue === false )
				_activeHandlers.remove( handler );
			else _removeQueue.push( handler );
		};

		/** get the last reported mouse position */
		this.GetXY = function()
		{
			return _currentMouse;
		};

		/** Persycle logic for ButtonState.Hold events */
		this.Update = function( time )
		{
			var count = _activeKeys.length; 
			var hCount = _activeHandlers.length;
			for( var i = 0; i < count; i++ )
			{
				for( var h = 0; h < hCount; h++ )
				{
					_activeHandlers[h].Event( _activeKeys[i].keyCode, ButtonState.Hold, time.now - _activeKeys[i].timestamp );
				}
			}
		};

		/** Determine if a key is down */
		this.IsKeyDown = function( key )
		{
			var count = _activeKeys.length;
			for( var i = 0; i < count; i++ )
			{
				if( _activeKeys[i].keyCode === key )
					return true;
			}
			return false;
		};
	};

	MouseManager = new MouseManager();

	/** Front-end logic creates Handlers which listen to the manager's events */
	var MouseHandler = function( id )
	{
		this.id = id; id = null;
		this.active = true;
		this.listeners = [];

		MouseManager.RegisterHandler( this );
	};

	/** called to disengage from the manager, and nullify members */
	Object.defineProperty( MouseHandler.prototype, "dispose", {
		enumerable: false, configurable: false,
		value: function(){
			MouseManager.RemoveHandler( this );
			this.id = this.active = this.listeners = null;
		}
	});

	/** add a listener */
	Object.defineProperty( MouseHandler.prototype, "addListener", {
		enumerable: false, configurable: false,
		value: function(key, state, handler) {
			this.listeners.push({
				keyCode: key,
				state: state,
				handler: handler
			});
		}
	});

	/** remove a listener */
	Object.defineProperty( MouseHandler.prototype, "removeListener", {
		enumerable: false, configurable: false,
		value: function(key, state) {
			this.listeners.remove(function(obj) { return obj.keyCode === key && obj.state === state; });
		}
	});

	/** called when an event is fired from the manager */
	Object.defineProperty( MouseHandler.prototype, "Event", {
		enumerable: false, configurable: false,
		value: function(key, state, timeDown) {
			var count = this.listeners.length;
			for( var i = 0; i < count; i++ )
			{
				if( typeof key !== "string" ) {
					if( this.listeners[i].keyCode === key && this.listeners[i].state === state )
						this.listeners[i].handler( timeDown );
				} else {
					if( this.listeners[i].keyCode === key )
						this.listeners[i].handler( timeDown );
				}
			}
		}
	});

	// ==============================================================================
	// ==============================Module API======================================
	// ==============================================================================

	return {

		/** Proxy to create a new MouseHandler */
		CreateMouseHandler: function( id ) { return new MouseHandler( id ); },

		/** Proxy to create a new KeyboardHandler */
		CreateKeyboardHandler: function( id ) { return new KeyboardHandler( id ); },

		/** Get {x,y} last reported mouse position */
		GetMousePosition: function() { return MouseManager.GetXY(); },

		/** Determine if a mouse key is down */
		IsMouseButtonDown: function(key) { return MouseManager.IsKeyDown(key); },

		/** Per-cycle update for buttonState.Hold logic */
		Update: function(t)
		{
			KeyboardManager.Update(t);
			MouseManager.Update(t);
		},

		/** suspend all input events from firing */
		SuspendInput: function( val )
		{
			KeyboardManager.SuspendInput( val );
			MouseManager.SuspendInput( val );
		},

		/** Keyboard Keys */
		KeyMap: KeyMap,

		/** Mouse Buttons */
		Mouse: Mouse,

		/* ButtonState */
		ButtonState: ButtonState
	};

});