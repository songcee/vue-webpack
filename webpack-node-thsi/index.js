
var autoLoginUpload = require('./upload');
var fs = require('fs');
//公共的方法
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
var thsi = {
    getName:function(str){
        if(str.indexLast('/')===str.length-1){
            str = str.slice(0,-1) 
        }
        return str.slice(str.indexLast('/')+1)
    },
    getPath:function(str){
        if(str.indexLast('/')===str.length-1){
            str = str.slice(0,-1) 
        }
        return str.slice(0,str.indexLast('/')+1)
    },
    filterFile: function(outArr){
        var regFileType = /(.jpg|.png|.gif|.css|.js|.html|.swf)$/;
        for(let i=0;i<outArr.length;i++){
            if(!regFileType.test(outArr[i])){
                outArr.splice(i,1);
                i--;
            }
        }
        return outArr;
    },
    explorer: function(path){
        var outArr = [];
        var self = this;
        return new Promise(function(resolve,reject){
            fs.readdir(path, function(err, files){
                console.log(files);
                //err 为错误 , files 文件名列表包含文件夹与文件
                if(err){
                    console.log('error:\n' + err);
                    return;
                }
                files.forEach(function(file,index){
                    fs.stat(path + '/' + file, function(err, stat){
                        console.log(stat);
                        console.log(stat.isDirectory());
                        if(err){console.log(err); return;}
                        if(stat.isDirectory()){					
                            self.explorer(path + '/' + file).then(function(inner){
                                outArr = outArr.concat(inner); // 往外层outArr合并
                                // console.log(outArr);
                                if((outArr.length-inner.length+1)===files.length && files.length>=1){
                                    // 读出包含文件，则以 初始上一层的outArr + 1 作为比较量，因为files长度只算了文件夹
                                    resolve(self.filterFile(outArr));
                                }
                            });
                        }else{
                            // 读出所有的文件-如果全是文件，则以 outArr.length 作为比较量
                            outArr.push(path + '/' + file);
                            if(outArr.length===files.length && files.length>=1){
                                outArr = self.filterFile(outArr);
                                resolve(self.filterFile(outArr));
                            }
                        }				
                    });
                });
            });
        });
    }
};
  
function uploadFileThsi(option){
    var options = {
        "openWindow":true,
        "ifReplace":false,
        "replaceHtml":["./html/index.html"]
    };
    for(let k in option){
        if(option[k]!==undefined){
            options[k] = option[k];
        }
    }
    this.params = options;
    this.up = async function(local_path,line_location,ifLast){
        var file_path = await thsi.explorer(local_path)
        var cf = {
            filePath:file_path,
            remotePath: thsi.getPath(line_location), //上传的目录配置
            projectName: thsi.getName(line_location), //项目名称或版本号
            ifLast:ifLast,
            user: this.params.user,
            pass: this.params.pwd,
            openWindow:this.params.openWindow,
            ifReplace:this.params.ifReplace,
            replaceHtml:this.params.replaceHtml
        };
        autoLoginUpload(cf);
        console.log('文件目录：');
        console.log(file_path);
    } 
}

uploadFileThsi.prototype.apply = function(compiler){
    const s = this;
    compiler.plugin('emit', function(compilation, callback) {
        setTimeout(function(){
            //do it
            (async ()=>{
                if(!s.params.user || !s.params.pwd){
                    console.log('缺少用户名和密码参数，请与webpack.release.conf.js中配置；或查看readme.md中相关说明');
                    return
                }
                var line_location = s.params.line;
                var local_path =s.params.local;
                if(!line_location || !local_path){
                    console.log('请配置line和local的地址');
                    return
                }
                for(let i=0;i<local_path.length;i++){
                    (function(i){
                        setTimeout(async function(){
                            if(i===local_path.length-1){
                                console.log('开始执行第'+(i+1)+'个地址上传任务','这也是最后一个任务');
                                await s.up(local_path[i],line_location[i],'last');
                            }else{
                                console.log('开始执行第'+(i+1)+'个地址上传任务','下个任务将在8秒后执行');
                                await s.up(local_path[i],line_location[i],'notLast');
                            }
                        },8000*i);
                    })(i);
                }
            })();
        },5000);
        callback();
      });
};

module.exports = uploadFileThsi;