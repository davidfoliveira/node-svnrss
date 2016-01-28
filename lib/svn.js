"use strict";

var
	exec	= require('child_process').exec;


// List the commits of a repo/branch
exports.listCommits = function(repoURL,repoLocalPath,opts,callback){

	// Defaults
	if ( !opts.limit || typeof opts.limit != "number" )
		opts.limit = 10;	

	// Run "svn log" at svnLocalRepo (we do need a local repo for avoiding to authenticate)
	var svn = exec('svn log "'+repoURL+'" --limit '+opts.limit,{cwd:repoLocalPath},function(err,stdout,stderr){
		if ( err )
			return callback(err,null);

		// Convert stdout buffer into a string
		stdout = stdout.toString();

		// Parse the svn output with dirty magic
		var
			match = true,
			state = "nothing",
			commitList = [],
			curCommit = null;

		while ( match ) {
			match = false;
			stdout = stdout.replace(/^(.*)\r?\n/,function(all,row){
				match = true;
				if ( state.match(/^(nothing|descr)$/) && row.match(/^\s*\-+\s*$/) ) {
					state = "new_commit";
				}
				else if ( state == "new_commit" && row.match(/^\s*(\w+)\s*\|\s*([^|]+)\s*\|\s*([^|]+?)\s*\|/) ) {
					curCommit = { rev: RegExp.$1, user: RegExp.$2, date: RegExp.$3, descr: "" };
					commitList.push(curCommit);
					state = "descr"
				}
				else if ( state == "descr" ) {
					curCommit.descr += row+"\n";
				}
				return "";
			});
		}

		// Return the commit list
		return callback(null,commitList);

		// Build an RSS feed based on the commit list
		var
			feed = new RSS({title: "SVN RSS feed for "+svnProj+"/"+svnPath});

		// Transform the commit list into an RSS item list
		commitList.forEach(function(commit){
			feed.item({title: "Commit by "+commit.user, description: commit.descr, date: commit.date});
		});

		// Send the output
		spritz.text(req,res,feed.xml({indent:true}),200,{'content-type':'text/xml; charset=utf-8'});
	});

};
