#!/usr/bin/env node

var
	spritz	= require('spritz'),
	svnrss	= require('../lib/svnrss'),
	getopt	= require('../lib/getopt'),
	opts	= {},
	repoURLPrefix,
	repoLocalPathPrefix;


// Parse command-line options
opts = getopt.parse(process.argv);
repoURLPrefix		= opts['#0'];
repoLocalPathPrefix	= opts['#1'];
if ( !repoURLPrefix || !repoLocalPathPrefix ) {
	console.log("Syntax error: svnrss_server.js SVNURLPREFIX SVNLOCALPREFIX [--port=XXXX]");
	return process.exit(-1);
}

// Start the HTTP server
spritz.start({
	port:		parseInt(opts.port || 8090),
	processes:	1
});


// Listen on a static route
spritz.on(/^\/svn_rss\/(\w+)(\/trunk|branches\/\w+)$/,function(req,res){

	var
		svnProj		= RegExp.$1,
		svnPath		= RegExp.$2,
		repoURL		= repoURLPrefix+svnProj+svnPath,
		localPath	= repoLocalPathPrefix+"/"+svnProj+"/"+svnPath;

	// Get the RSS feed of a repo
	svnrss.getRepoRSS(repoURL,localPath,{limit: 20, rssTitle: "SVN RSS feed for "+svnProj+"/"+svnPath},function(err,rssContent){
		if ( err ) {
			if ( err.toString().match(/ENOENT/) )
				return spritz.text(req,res,"Can't find your repo/path: "+repoURL+" ("+localPath+")",404);
			console.log("Error calling SVN: "+err.toString());
			return spritz.text(req,res,"Error calling SVN: "+err.toString(),500);
		}

		// Send the output
		spritz.text(req,res,rssContent,200,{'content-type':'text/xml; charset=utf-8'});
	});

});
