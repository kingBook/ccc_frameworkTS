'use strict';

module.exports = {
	load () {
		// 当 package 被正确加载的时候执行
	},

	unload () {
		// 当 package 被正确卸载的时候执行
	},

	messages: {
		'say-hello' () {
			Editor.log('Hello World!');
		},
		
		'asset-db:assets-created'(){
			Editor.log("asset-created");
			Editor.assetdb.queryAssets('db://assets/**\/*', 'texture', function (err, results) {
				results.forEach(function (result) {
				// result.url
				// result.path
				// result.uuid
				// result.type
				// result.isSubAsset
				
				Editor.log(result.path);
				
				
				});
			});
		}
	},
};