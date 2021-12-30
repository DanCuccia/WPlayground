define([], function()
{
	/** 
	 * Wraps the logic of a MessageBox 
	 * @param {string} text - question to display
	 * @param {array} options - array of {text,callback} options depicting different button options the user can choose
	 */
	var MessageBox = function( text, options, animMode )
	{
		this._text = text; text = null;
		this._options = options; options = null;
		this._animMode = animMode !== undefined ? animMode : MessageBox.AnimationMode.None; animMode = null;
	};

	MessageBox.prototype.Initialize = function( world, onComplete )
	{
		onComplete( true );
	};

	MessageBox.prototype.Release = function()
	{
		this._text = this._options = this._animMode = null;
	};

	MessageBox.prototype.Update = function( time )
	{

	};

	MessageBox.prototype.AnimateIn = function( onComplete )
	{
		this._animMode.AnimateIn( this, onComplete );
	};

	MessageBox.prototype.AnimateOut = function( onComplete )
	{
		this._animMode.AnimateOut( this, onComplete );
	};

	/** Pre-made animate in/out modes */
	MessageBox.AnimationMode = 
	{
		None: {
			AnimateIn: function( mBox, onComplete )
			{
				onComplete( true );
			},
			AnimateOut: function( mBox, onComplete )
			{
				onComplete( true );
			}
		}
	};

	return MessageBox;
});