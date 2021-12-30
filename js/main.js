
var _DEBUG_ = true;
var nullfn = function(){};

require([ "lib/jquery",
	"util/Utility",
	"util/Logger",
	"component/AppController",
	"lib/cannon",
	"lib/three",
	"lib/tween",
	"lib/sound",
	"lib/spin",
	"component/Input",
	"component/CrossHairs",
	"controller/Test",
	"controller/MessageBox" ], 
	function( jQuery,
		Utility,
		Logger,
		AppController, 
		Cannon, 
		Three,
		Tween,
		Sound,
		Spin,
		Input,
		CrossHairs,
		Test,
		MessageBox )
{
	"use strict";

	Utility.OnResize( 300, 1000, AppController.onResizeStart, AppController.onResizeChange, AppController.onResizeEnd );

	$().unload( AppController.Shutdown );
	
	$().ready( function(){
		AppController.Initialize();
		AppController.PushController("test", new Test());
	});
});