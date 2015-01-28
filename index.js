var request = require("request");
var jsSHA = require('jssha');

function WxSDKCheck(appid,appSecret,options) {
    this.appId = appid;
    this.appSecret = appSecret;

    this._accessToken = "";
    this._jsapiTicket = "";

    this._accessTokenExpireTime = 0;
    this._jsapiTicketExpireTime = 0;

    options = options||{};
    this._bufferTime = parseInt(options.bufferTime)||60;
}
// 获取access token
WxSDKCheck.prototype._getAccessToken = function(callback) {
    if ((+new Date())/1000 <= this._accessTokenExpireTime && this._accessToken) {
        callback();
        return;
    }
    else {
        var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + this.appId + "&secret=" + this.appSecret;
        var _this = this;
        request.get(url, function (error, response, body) {
            if (!error) {
                var result = {};
                try{
                    result = JSON.parse(body);
                }
                catch(e){
                    callback(e);
                    return;
                }
                if (result.access_token) {
                    _this.access_token = result.access_token;
                    _this._accessTokenExpireTime = (+new Date())/1000 + result["expires_in"] - _this._bufferTime;//有一分钟缓冲时间
                    callback && callback();
                }
                else {
                    callback(result);
                }
            }
            else {
                callback(error);
            }
        })
    }
}
// 获取js api ticket
WxSDKCheck.prototype._getJsApiTicket = function(callback) {
    if ((+new Date())/1000 <= this.jsapiTicketExpireTime && this._jsapiTicket) {
        callback();
        return;
    }
    else {
        var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + this.access_token + "&type=jsapi";
        var _this = this;
        request.get(url, function (error, response, body) {
            if (!error) {
                var result = {};
                try{
                    result = JSON.parse(body);
                }
                catch(e){
                    callback(e);
                    return;
                }
                if (result.errcode == 0) {
                    _this._jsapiTicket = result.ticket;
                    _this._jsapiTicketExpireTime = (+new Date())/1000 + result["expires_in"] - _this._bufferTime;//有一分钟缓冲时间
                    callback && callback();
                }
                else {
                    callback(result);
                }
            }
            else {
                callback(error);
            }
        })
    }
}
WxSDKCheck.prototype._createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
}
WxSDKCheck.prototype._createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
}
WxSDKCheck.prototype._raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}
// 签名
WxSDKCheck.prototype._sign = function (url) {
    var ret = {
        jsapi_ticket: this._jsapiTicket,
        nonceStr: this._createNonceStr(),
        timestamp: this._createTimestamp(),
        url: url
    };
    var string = this._raw(ret);
    shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');

    return ret;
}
// 传入，获取js api sdk的配置数据
WxSDKCheck.prototype.getJSConfig = function(url,callback) {
    var _this = this;
    this._getAccessToken(function(aError){
        if (aError) {
            callback(aError);
            return;
        }
        _this._getJsApiTicket(function(jError){
            if (jError) {
                callback(jError);
                return;
            };
            var ret = _this._sign(url);
            ret.appId = _this.appId;
            delete ret["jsapi_ticket"];
            callback(null,ret);
        });
    })
}

module.exports = WxSDKCheck;