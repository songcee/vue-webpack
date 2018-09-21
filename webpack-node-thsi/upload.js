var through = require('through2');
var colors = require('colors');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var http = require("http");
var querystring = require("querystring");
var open = require("open");

var PLUGIN_NAME = '[admin-thsi]';

var projectName ,remotePath ,filePathList ,fileLength ,ifReplace ,htmlAddress, openWindow;

var resourceList = [],fileNameList = [];

String.prototype.indexLast = function(tg){
	var self = this.toString();
	var i = -1;
	while(i<self.length){
		var res_index = self.indexOf(tg,i+1);
		if(res_index===-1){
			result_i = i;
			break;
		}else{
			i=res_index;
		}
	}
	return result_i;
}

//处理为二进制流数据
function toBuffer(Cookie, filePathList,ifLast) {
	getNowList(Cookie,function(rst){
		var lineFile = JSON.parse(rst).results;
		console.log('开始上传...'.green);
		for(let i=0;i<filePathList.length;i++){
			(function(i){
				setTimeout(function(){
					var filePath = filePathList[i];
					var fileName = filePath.slice(filePath.indexLast('/')+1);
					for(let j=0;j<lineFile.length;j++){
						if(lineFile[j]['name']===fileName){
							console.log((fileName+'--此文件已存在，将不再上传覆盖！').red);
							fileName = '';
							break;
						}
					}
					var file = path.resolve(filePath);
					var datas = new Buffer(0);
					var fileContent = fs.readFileSync(file);  
					datas = Buffer.concat([datas,fileContent]);
					doUpload(Cookie, filePath, datas, fileName, filePathList,ifLast);
				},i*3000);
			})(i);
		}
	})
	
}

//上传文件
function doUpload(Cookie, filePath, datas, fileName, filePathList,ifLast) {
	if(!fileName){
		fileLength++;
		openAndReplace(filePath,ifLast);
		return;
	}
	var boundary = "---------------------------leon";
	var packagePath = remotePath + projectName;
	var formStr = '--' + boundary + '\r\n' + 
		'Content-Disposition: form-data; name="file"; filename="' +
		fileName + '"'  + '\r\n' + 'Content-Type: application/javascript' + '\r\n\r\n';
	// 在 formStr 和  formEnd 中间需要插入文件的内容（buffer处理后的二进制内容）
	var formEnd = '\r\n' + '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="path"' + '\r\n\r\n' +
	packagePath + '\r\n' + '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="zipFlag"' +
		'\r\n\r\n' + '\r\n--' + boundary + '--\r\n';
	var contentLength = formStr.length + datas.length + formEnd.length;
	// console.log((PLUGIN_NAME+' 文件长度:'+contentLength).green);
	var options = {
		host: "admin.thsi.cn",
		port: 80,
		method: "POST",
		path: "/index.php?controller=file&action=upload",
		headers: {
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": "zh-CN,zh;q=0.9",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"Content-Type": "multipart/form-data; boundary=" + boundary,
			"Content-Length": contentLength,
			"Cookie": Cookie,
			"Referer": "http://admin.thsi.cn/index.php?controller=file&action=index",
			"Upgrade-Insecure-Requests": 1,
			"User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
		}
	};

	var req = http.request(options, function(res) {
		res.on("data", function(data) {
			var sData = data.toString();
			console.log((PLUGIN_NAME+' 返回值:'+sData).green);
			openAndReplace(filePath,ifLast);
		});
		res.on("end", function() {
			fileLength++;
			req.end();
		});
	});
	req.write(formStr, 'utf8');
	req.write(datas);
	req.write(formEnd, 'utf8');

}

// 完成上传后，判断是否打开浏览器，是否替换html
function openAndReplace(filePath,ifLast){
	if(fileLength===filePathList.length-1){
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		var http_first = '';
		if(remotePath.indexOf('html/s')>-1){
			http_first = 'http://s.thsi.cn/';
		}else if(remotePath.indexOf('html/i')>-1){
			http_first = 'http://i.thsi.cn/';
		}
		for(let i=0;i<filePathList.length;i++){
			//node-open插件 封装的调用系统浏览器的方法
			let link = http_first+remotePath.slice(8)+projectName+'/'+filePathList[i].slice(filePath.indexLast('/')+1);
			resourceList.push(link);
			fileNameList.push(filePathList[i].slice(filePath.indexLast('/')+1));
		}
		if(ifLast==='last'){
			if(ifReplace){
				console.log(resourceList);
				for(let i=0;i<htmlAddress.length;i++){
					replaceHtml(htmlAddress[i],resourceList,fileNameList);
				}
			}
			if(openWindow){
				for(let i=0;i<resourceList.length;i++){
					open(resourceList[i],'chrome');
				}
			}
			setTimeout(function(){
				process.exit();
			},3000);
		}
	}
}

//创建文件夹
function createFolder(Cookie,ifLast) {
	var contents = querystring.stringify({
		path: remotePath,
		name: projectName
	});
	var options = {
		host: "admin.thsi.cn",
		port: 80,
		method: "POST", 
		path: "/index.php?controller=file&action=diradd",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"Content-Length": contents.length,
			"Cookie": Cookie
		}
	};

	var req = http.request(options, function(res) {
		res.on("data", function(data) {
			var sData = data.toString();
			var tipText;

			console.log((PLUGIN_NAME+' 新建文件夹:'+sData).red);
			if(sData.indexOf('权限开通申请流程')>-1){
				console.log('验证失败，请检查账号密码'.red);
				return;
			}
			toBuffer(Cookie, filePathList,ifLast);
		});
		res.on("end", function(data) {
		});
	});
	req.write(contents);
	req.end();

}
//查找当前列表文件信息(附加)--在开始上传之前检查是否有同名文件，有则不上传并提示
function getNowList(Cookie,callback){
	
	var contents = querystring.stringify({
		path: remotePath + projectName
	});
	var options = {
		host: "admin.thsi.cn",
		port: 80,
		method: "POST",
		path: "/index.php?controller=file&action=list",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"Content-Length": contents.length,
			"Cookie": Cookie
		}
	};
	var req = http.request(options, function(res) {
		res.on("data", function(data) {
			var sData = data.toString();
			callback(sData);
		});
	});
	req.write(contents);
	req.end();
}

//main入口
function autoLoginUpload(config) {
	var config = config || {};
	
    projectName = config.projectName; 
    remotePath = config.remotePath;
	filePathList = config.filePath;
	ifReplace = config.ifReplace;
	htmlAddress = config.replaceHtml;
	openWindow = config.openWindow;
	fileLength = 0;

	var contents = querystring.stringify({
		password: config.pass,
		user_name: config.user,
		controller: "login",
		action: "in"
	});

	var options = {
		host: "admin.thsi.cn",
		path: "/",
		method: "post",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"Content-Length": contents.length
		}
	};
	//发起登陆请求
	var req = http.request(options, function(res) {
		res.setEncoding("utf8");
		var headers = res.headers;
		var cookies = headers["set-cookie"]; // 返回是一个对象
		if (cookies[0].indexOf('PHPSESSID=') >= 0) {
            if (projectName) {
				console.log('登陆成功'.green);
                createFolder(cookies[0],config.ifLast); //检查是否需要新建文件夹
            } else {
                console.log('登陆失败'.red);
            }
		}
	});
	req.write(contents);
	req.end();

}
//替换指定的html中的资源内容
function replaceHtml(htmlAddress,resourceList,fileNameList){
	var buffer;
	try{
		buffer = fs.readFileSync(htmlAddress);
	}catch(e){
		console.log('请检查可能为替换文件地址错误'.red);
		return;
	}
	var html = buffer.toString();
	var reg_for_script = /<script[^>]*?>.*?<\/script>/g;
	var reg_for_link = /<link[^>]*?>/g;
	var result = [].concat(html.match(reg_for_script),html.match(reg_for_link));
	if(!result){
		console.log('文件中未匹配到可替换的地址');
		return
	}
	var result_exec = /(src|href)=("|')(.*)("|')/;
	for(let i=0;i<result.length;i++){
		for(let j=0;j<fileNameList.length;j++){
			if(result[i].indexOf(fileNameList[j])>-1){
				var match = result_exec.exec(result[i]);
				html = html.replace(match[3],resourceList[j]);
			}
		}
	}
	fs.writeFileSync(htmlAddress,html);
}

module.exports = autoLoginUpload;