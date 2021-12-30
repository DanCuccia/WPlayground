define(["lib/jquery"], function($)
{
	"use strict";

	if( ! _DEBUG_ )
	{
		return { Log: nullfn, Warn: nullfn, Critical: nullfn, Info: nullfn };
	}

	var _el;

	var Logger = function()
	{
		_el = $("<div>", {
			id: "logContainer"
		});
		_el.addClass("logContainer");
		$("#titleBar").append( _el );

		/** Shared amongst a few logs */
		var _normalMessage = function( msg, className, time )
		{
			var log = $("<div>", {
				text: msg
			});
			log.addClass(className);
			_el.append(log);

			setTimeout( (function( element )
			{
				return function(){
					$(element).animate({
						opacity: 0.0,
						"margin-left": "100px"
					}, {
						duration: 500,
						complete: function(){
							var nextLog = element.next();
							nextLog.css("margin-top", element.outerHeight());
							element.remove();
							nextLog.animate({ "margin-top": "0px" }, { duration: 150 });
						}
					});
				};
			})( log ), 
			typeof time === "number" ? time : 5000 );
		};

		/**
		 * present a msg to the screen
		 */
		this.Log = function( msg, time )
		{
			_normalMessage(msg, "logMessage", time );
		};

		/**
		 * present a warning msg to the screen
		 */
		this.Warn = function( msg, time )
		{
			_normalMessage(msg, "warnMessage", time );
		};

		/**
		 * present a info msg to the screen
		 */
		this.Info = function( msg, time )
		{
			_normalMessage(msg, "infoMessage", time );
		};

		/**
		 * present a critical msg to the screen
		 */
		this.Critical = function( msg, time )
		{
			var log = $("<div>", {
				text: msg
			});
			log.addClass("criticalMessage");
			_el.append(log);

			log.animate({ opacity: 0.1 }, {
				duration: 150,
				complete: function(){
					log.animate({opacity: 1.0 }, {
						duration: 150,
						complete: function(){
							log.animate({ opacity: 0.1 }, {
								duration: 150,
								complete: function(){
									log.animate({opacity: 1.0 }, {
										duration: 150,
										complete: function(){
											log.animate({opacity: 0.1}, {
												duration: 150,
												complete: function(){
													log.animate({ opacity: 1.0 }, {
														duration: 150,
														complete: function(){
															setTimeout( function(){
																log.animate({
																	opacity: 0.0,
																	"margin-left": "100px"
																}, {
																	duration: 500,
																	complete: function(){
																		var nextLog = log.next();
																		nextLog.css("margin-top", log.outerHeight());
																		log.remove();
																		nextLog.animate({ "margin-top": "0px" }, { duration: 150 });
																	}
																});
															}, typeof time === "number" ? time : 5000 );
														}
													})
												}
											})
										}
									})
								}
							})
						}
					})
				}
			});
		};
	};

	return new Logger();
});