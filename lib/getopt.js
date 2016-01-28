"use strict";

// Parse command-line options - old school way (don't want to import more libraries)
exports.parse = function(args) {

	var
		opts = {},
		ptr  = 0;

	// Starting from the third argument
	for ( var x = 2 ; x < args.length ; x++ ) {
		if ( args[x] == null )
			continue;
		if ( args[x].match(/^\-\-(\w+)=(\w+)$/) )
			opts[RegExp.$1] = RegExp.$2;
		else
			opts['#'+(ptr++)] = args[x];
	}

	return opts;

};
