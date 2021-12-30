define(["lib/jquery"], function($)
{
	"use strict";
	

	/**
	 * Outputs the timestamp in a human readable string
	 */
	Object.defineProperty( Date.prototype, "logTime", {
		configurable: false, enumerable: false,
		get: function( ) {
			return [
				(this.getHours() > 12 ? (this.getHours() * 0.5).toFixed(0) : this.getHours()),
				this.getMinutes(),
				this.getSeconds(),
				this.getMilliseconds()
			].join();
		}
	});
	
	/**
	 * Determine if the argued value is within the array
	 */
	Object.defineProperty( Array.prototype, "contains", {
		configurable: false, writable: false, enumerable: false,
		value: function( val ) {
			var l = this.length;
			for( var i = 0; i < l; i++ )
			{
				if( this[i] === val )
				{
					return true;
				}
			}
			return false;
		}
	});
	
	/** cool remove functionality. */
	Object.defineProperty( Array.prototype, "remove", {
		configurable: false, writable: false, enumerable: false,
		value: function( validator, callMethod ) {
			var proc = function( obj )
			{
				if( typeof callMethod === "string" && typeof obj[callMethod] === "function" )
					obj[ callMethod ]( );
				else if( typeof callMethod === "function" )
					callMethod( obj );
			};

			var count = this.length;
			for( var i = 0; i < count; i++ )
			{
				if( typeof validator === "function" )
				{
					if( validator( this[i] ) === true )
					{
						proc( this[ i ] );
						this.splice(i, 1);
						count = this.length;
						i--;
					}
				}
				else
				{
					if( this[i] === validator )
					{
						proc( this[ i ] );
						this.splice(i, 1);
						return;
					}
				}
			}
		}
	});

	Object.defineProperty( Array.prototype, "where", {
		enumerable: false, configurable: false,
		value: function( cb, single ) {
			var output = [];
			var count = this.length;
			for( var i = 0; i < count; i++ )
			{
				if( cb( this[i] ) === true )
				{
					if( single === true )
						return this[i];
					else output.push( this[i] );
				}
			}
			return output.length ? output : null;
		}
	})

	/** Convert degrees to radians */
	Object.defineProperty( Math, "toRadians", {
		enumerable: false, configurable: false,
		value: function(input) {
			if( typeof input === "number" ) {
				return input * (Math.PI / 180);
			} else return input;
		}
	});

	/** Convert radians to degrees */
	Object.defineProperty( Math, "toDegrees", {
		enumerable: false, configurable: false,
		value: function(input) {
			if( typeof input === "number" ) {
				return input * (180 / Math.PI);
			} else return input;
		}
	});
	

	/**
	 * Module for generating document.resize start/end events
	 */
	var ResizeController = (function(){

		var _isTesting = false,
			_threshold,
			_interval,
			_cbStart,
			_cbChange,
			_cbEnd,
			_lastProc,
			_width,
			_height;

		function proc() {
			var now = Date.now();
			if( now - _lastProc > _threshold )
			{
				if( typeof _cbEnd === "function" )
				{
					_isTesting = false;
					_lastProc = null;
					_cbEnd();
				}
			}
			else
			{
				_lastProc = now;
				setTimeout( proc, _interval );
			}
		};

		// RESIZE MODULE API
		return {

			/** Document Resize event entry point */
			DocResize: function() 
			{
				if( _isTesting === false )
				{
					_isTesting = true;
					_lastProc = Date.now();
					_width = window.innerWidth;
					_height = window.innerHeight;

					if( typeof _cbStart === "function" )
					{
						_cbStart();
					}

					setTimeout( proc, _interval );
				}
				else
				{
					_lastProc = Date.now();
					if( typeof _cbChange === "function" )
					{
						_cbChange( window.innerWidth - _width, window.innerHeight - _height );
						_width = window.innerWidth;
						_height = window.innerHeight;
					}
				}
			},

			/** Front-end hookup */
			OnResize: function(threshold, interval, start, change, end) 
			{
				_threshold = typeof threshold === "number" ? threshold : 25;
				_interval = typeof interval === "number" ? interval : 5;
				_cbStart = typeof start === "function" ? start : nullfn;
				_cbChange = typeof change === "function" ? change : nullfn;
				_cbEnd = typeof end === "function" ? end : nullfn;
			}
		};

	})();

	$( window ).resize( ResizeController.DocResize );

	/** Proxy into a vector3 container, with optional callbacks which set and return */
	var V3Proxy = function(p, prop, cb)
	{
		this.owner = p; p = null;
		this.prop = prop; prop = null;
		this.proxy = cb; cb = null;
	};
	Object.defineProperty( V3Proxy.prototype, "x", { enumerable: true, configurable: false,
		get: function() { return typeof this.proxy === "function" ?  this.proxy.call(this.owner, "x") : this.owner[ this.prop ].x; },
		set: function(val) { if( typeof this.proxy === "function" ) this.proxy.call(this.owner, "x", val); else this.owner[ this.prop ].x = val; }
	});
	Object.defineProperty( V3Proxy.prototype, "y", { enumerable: true, configurable: false,
		get: function() { return typeof this.proxy === "function" ?  this.proxy.call(this.owner, "y") : this.owner[ this.prop ].y; },
		set: function(val) { if( typeof this.proxy === "function" ) this.proxy.call(this.owner, "y", val); else this.owner[ this.prop ].y = val; }
	});
	Object.defineProperty( V3Proxy.prototype, "z", { enumerable: true, configurable: false,
		get: function() { return typeof this.proxy === "function" ?  this.proxy.call(this.owner, "z") : this.owner[ this.prop ].z; },
		set: function(val) { if( typeof this.proxy === "function" ) this.proxy.call(this.owner, "z", val); else this.owner[ this.prop ].z = val; }
	});
	

	// UTILITY MODULE API
	return {
		
		/**
		 * Determine if the browser is supported
		 * @return {boolean} invalidates for IE6, IE7, IE8
		 */
		IsBrowserSupported: function() 
		{
			return ! $("html").is(".ie6, .ie7, .ie8");
		},

		/**
		 * Proxy to the ResizeController module.
		 * @param {number} threshold - under how many millies is the resize considered "still going"
		 * @param {number} interval - how many millies to repeat the test process
		 * @param {function} start - callback when change starts
		 * @param {function} change - callback when any change occurs
		 * @param {function} end - allback when changes end
		 */
		OnResize: function( threshold, interval, start, change, end ) 
		{
			ResizeController.OnResize( threshold, interval, start, change, end );
		},

		/** clear the given three scene from all renderables */
		ClearScene: function( scene )
		{
			if( scene )
			{
				while( scene.children.length > 0 )
					scene.remove( children[0] );
			}
		},

		V3Proxy: V3Proxy
	}
});