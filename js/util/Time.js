define([], function(){
	
	var Time = function()
	{
		this._startTime = this._lastTime = this._now = Date.now();
	};

	Time.prototype.Update = function(){
		this._lastTime = this._now;
		this._now = Date.now();
	};

	Object.defineProperty( Time.prototype, "elapsedMillies", {
		enumerable: false, configurable: false,
		get: function(){
			return this._now - this._lastTime;
		},
		set: nullfn
	});

	Object.defineProperty( Time.prototype, "elapsedSeconds", {
		enumerable: false, configurable: false,
		get: function(){
			return (this._now - this._lastTime) / 1000;
		},
		set: nullfn
	});

	Object.defineProperty( Time.prototype, "totalMillies", {
		enumerable: false, configurable: false, 
		get: function(){
			return this._now - this._startTime;
		},
		set: nullfn
	});

	Object.defineProperty( Time.prototype, "totalSeconds", {
		enumerable: false, configurable: false,
		get: function(){
			return ( this._now - this._startTime) / 1000;
		},
		set: nullfn
	});

	Object.defineProperty( Time.prototype, "now", {
		enumerable: false, configurable: false,
		get: function(){
			return this._now;
		},
		set: nullfn
	});

	return Time;
});