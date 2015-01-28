# weixinJsSdkConfig

微信js sdk服务端签名生成接口

## 使用方法

		/* 初始化 */
		var WxJSConfig = require("wxjssdkconfig");
		var wxJsConfig = new WxJSConfig("AppId","AppSecrect");
		
		/* 传入url，获取签名数据 
		   
		   callback 回调函数参数:
					error:若无错误，error为null，否则为错误对象
					data:签名数据，json格式
		*/
		wxJsConfig.getJSSConfig(url,callback);
		
		
## 注意

* 必须在全局环境下实例该对象，引用认证获取的token和ticket字段需要缓存在应用中(两小时)，若每次请求签名都重新实例化WxJSConfig会导致缓存不可用。

## 代码示例(express)

		var WxJSConfig = require("wxjssdkconfig");
		//该实例化不要放在下面的路由函数中，需要保证每次都是同一个对象调用getJSSConfig方法
		var wxJsConfig = new WxJSConfig("AppId","AppSecrect");
		var router = express.Router();
		
		router.get('/api/wxJsToken',function(req, res){
            var url = decodeURIComponent(req.query.url);

            wxJsConfig.getJSSConfig(url,function(error,configData){
                var result = {
                    errNo:0,
                    errObj:null,
                    data:null
                }
                if (error) {
                    result.errNo = 1;
                    result.errObj = error;
                }
                else {
                    result.data = configData;
                }
                res.end(JSON.stringify(result));
            });
        });



