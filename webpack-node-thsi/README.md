webpack-node-thsi
=
基于[webpack]的资源文件上传同花顺资源服务器脚本

# 使用

1. 找到需要嵌入的webpack的config文件，如webpack.release.conf.js；
2. 在plugin数组最后调用concat方法: 
    .concat(
        new uploadFileThsi({ 
            "user":"XXX",
            "pwd":"XXX",
            "line":["/html/s/js/XXX","/html/s/css/dzl/XXX"],
            "local":["./html/static/js","./html/static/css"],
            "openWindow":true,
            "ifReplace":true,
            "replaceHtml":["./html/index.html"]
        })
    )

# 配置

| 属性	| 类型	| 说明 |
| --- | --- | --- |
|user |	str |  登陆资源服务器的用户名 |
|pwd |	str | 登陆资源服务器的密码 |
|line	| array | 资源地址配置，精确到文件所在目录，以'/html/s/'或'/html/i/'开头，对应为's.thsi.cn'和'i.thsi.cn'的地址 |
|local	| array |本地地址，可以为相对地址，也可为绝对地址，node脚本均能识别，如'D:/exersice/node-thsi/src/' |
|ifReplace	| boolean | 将项目下相应html文件的本地引用地址替换为线上地址，true为开启此功能，false为关闭 |
|replaceHtml |	array | 配置所需替换资源的html文件，默认为 ["./index.html"] |
|openWindow |  boolean | 是否在上传完成后在浏览器中打开该文件 |

# 其他

1.注意line和local中的index需对应，即本地和线上目录对应
