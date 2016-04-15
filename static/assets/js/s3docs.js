AWS.config.update({accessKeyId: AWS_AccessKeyId, secretAccessKey: AWS_SecretAccessKey});
AWS.config.region = AWS_Region;
var bucket = new AWS.S3({params: {Bucket: AWS_BucketName}});

function listObjects(node, prefix) {
	$('#overlay').show();
	$('#status').html('<div id="statusimg"></div>Loading...');
		
	bucket.listObjects({MaxKeys: AWS_MaxKeys, Prefix : prefix, Delimiter : '/' },function (err, data) {
		if (err) {
			$('#status').html('<img src="/assets/images/exclamation-red.png"> Could not load objects from S3');
		} else {
			//Load folders...
			//Set breadcrumbs..
			var truncated = data.IsTruncated;
			var nextMarker = data.NextMarker;
			var currentFolder = '<a href="javascript:listObjects(\'\')"><span class="path">root</span></a>';
			var icon = '';
			if  (prefix !== '') {
				currentFolder += '/';
				var folders = prefix.split('/');
				var parent = '';
				var slash = '';
				var topFolder = '';
				for (var i = 0; i < folders.length - 1; i++) {
					if (folders[i] !== '') {
						var path = '';
						parent += slash + folders[i];
						if ( i > 0 ) {
							path = parent;
						} else {
							path = folders[i];
						}
						if ( i !== (folders.length - 2)) { 
							topFolder = path;
						}
						currentFolder += slash + '<a href="javascript:listObjects(\'' + path + '/\')"><span class="path">' + folders[i] + '</span></a>';
						slash = '/';
					}
				}
			}

            /**
			if (typeof topFolder != 'undefined') {
				if (topFolder !== '') {
					topFolder += '/';
				}
				//icon = '<img src="/assets/images/arrow-090.png"/>'
                icon = '<i class="fa fa-level-up fa-2x"></i>'
				listObjects($('#objects').append('<li><a href="javascript:listObjects(\'' + topFolder + '\')">' + icon + '<span>...</span></a></li>'), 'topFolder\');
                
			}
            */
			$('#breadcrumb').html('Current folder is : ' + currentFolder + data.CommonPrefixes.length);
			//Set folders...
			var countFolders = 0;
			for (var i = 0; i < data.CommonPrefixes.length; i++) {
				var currentPrefix = data.CommonPrefixes[i].Prefix;
				var name = (currentPrefix.replace(prefix, '')).replace('/','');
                icon = '<i style="color:RGB(240, 238, 130)" class="fa fa-folder-open fa-2x"></i>'
                 $('#breadcrumb').html('Current ' + currentPrefix);
				if (prefix !== currentPrefix) {
                    $('#breadcrumb').html('Current folde');
					countFolders++;
                    newnode = node.append('<li><a href="javascript:listObjects(\'' + currentPrefix + '\')">' + icon + '<span>' + name + '</span></a></li>');
                    listObjects(newnode,currentPrefix+'\\');
				}
			}
			
			renderObjects(data.Contents, countFolders, 0, prefix, truncated, nextMarker);
		}
		$('#overlay').hide();
	});
};

function renderObjects(contents, countFolders, currentCountFiles, prefix, truncated, nextMarker) {
	//Load files...
	var countFiles = currentCountFiles;
	for (var i = 0; i < contents.length; i++) {
		var key = contents[i].Key;
		var size = Math.ceil(contents[i].Size / 1024);
		var fileName = key.replace(prefix, '');
		icon = '<img src="/assets/images/document.png"/>'
		if (prefix !== key) {
			countFiles++;
			var params = {Bucket: 'bucket', Key: 'key'};
			$('#objects').append('<li><a href="javascript:getObject(\'' + key + '\')">' + icon + '<span>' + fileName + '</span><span class="size">' + size + 'K</span></a></li>');
		}
	}
	if (truncated) {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), showing ' + countFiles + ' item(s) from S3, <a href="javascript:scrollToBottomListObjects()"><img src="/assets/images/arrow-270.png">Go to the bottom of the list to load more items.</a>');
		icon = '<img src="/assets/images/plus-circle.png"/>'
		$('#objects').append('<li id="moreobjects"><a href="javascript:listMoreObjects(\'' + nextMarker + '\',\'' + prefix + '\',' + countFiles + ',' + countFolders + ')">' + icon + '<span>Get more items...</span></a></li>');
	} else {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), ' + countFiles + ' item(s) from S3');
	}			
}

function getObject(key) {
	var params = {Bucket: AWS_BucketName, Key: key, Expires: AWS_SignedUrl_Expires};
	var url = bucket.getSignedUrl('getObject', params);
	window.open(url, url);
}

function init() {
    $('#objects').empty();
}

$( document ).ready(function() {
	init();
	listObjects($('#objects'), AWS_Prefix);
});