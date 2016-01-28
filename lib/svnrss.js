"use strict";

var
	svn = require('./svn'),
	RSS = require('rss');


// Get the RSS of a repo
exports.getRepoRSS = function(repoURL,repoLocalPath,opts,callback){

	// Get the commit list
	svn.listCommits(repoURL,repoLocalPath,opts,function(err,commitList){
		if ( err )
			return callback(err,null);

		// Build an RSS feed based on the commit list
		var
			feed = new RSS({title: "SVN RSS feed for "+opts.rssTitle});

		// Transform the commit list into an RSS item list
		commitList.forEach(function(commit){
			feed.item({title: "Commit by "+commit.user, description: commit.descr, date: commit.date});
		});

		// Return the RSS
		return callback(null,feed.xml(opts));
	});

};
