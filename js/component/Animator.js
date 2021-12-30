define([], function()
{
	/** Wraps a currently active animation - stored within Animator */
	var ActiveAnim = function( start, end, params )
	{
		this.start = start; start = null;
		this.end = end; end = null;
		this.params = params; params = null;
	};

	/** API for the front-end to control a current animation */
	var AnimController = function( activeAnim )
	{
		this._activeAnim = activeAnim; activeAnim = null;
	};

	/** pause an active animation from interpolating */
	AnimController.prototype.pause = function()
	{

	};

	/** resume an active animation from a paused state */
	AnimController.prototype.resume = function()
	{

	};

	/** completely stop an active animation - removing from Animator */
	AnimController.prototype.stop = function()
	{

	};

	/** reset an active animation back to beginning values */
	AnimController.prototype.reset = function()
	{

	};

	/** Singleton object, controlling all aspects of animation */
	var Animator = function()
	{
		this.beginAnimation = function( obj, end, params )
		{

		};
	};

	Animator = new Animator();

	return Animator;
});