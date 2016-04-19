"use strict";
define(function (){
	var Util = {
		inputChange : function( ele, cb ) {
			var dom = $("#"+ele)[0];
			if( "\v" == "v" ) {
				dom.onpropertychange = cb;
			}else{
				dom.addEventListener("input", cb, false);
			}
			return cb;
		},
		generateUUID : function(){
		    var d = new Date().getTime();
		    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		        var r = (d + Math.random()*16)%16 | 0;
		        d = Math.floor(d/16);
		        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		    });
		    return uuid;
		},
		isInt : function( val ) {
			var patrn = /^[0-9]\d*$/;
			if (!patrn.exec(val)) return false; 
			return true; 
		},
		isIDCard : function( val ) {
			var patrn = /^\d{15}(\d{2}[A-Za-z0-9])?$/;
			if (!patrn.exec(val)) return false; 
			return true; 
		},
		isPhone : function( val ) {
			var patrn = /^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/;
			if (!patrn.exec(val)) return false; 
			return true; 
		},
		isMobile : function( val ) {
			var patrn = /^0?1[2-9]\d{9}$/;
			if (!patrn.exec(val)) return false; 
			return true; 
		},
		numberFormat : function( value ) {
    		value = value.replace(/[^\d.]/g, "");
        	value = value.replace(/^\./g, "").replace(/\.{2,}/g, ".");
        	value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d)*$/, '$1$2');
			return value;
		},
		floatFormat : function( value ) {
    		value = value.replace(/[^\d.]/g, "");
        	value = value.replace(/^\./g, "").replace(/\.{2,}/g, ".");
        	value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
        	return value;
		},
		loadJs : function( url, callback ) {
			if( !$.isArray(url) ){
				url = [url];
			}
			var index = 0;
			function loadS( index ) {
				var done = false;
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.language = 'javascript';
				script.src = url[index];
				script.onload = script.onreadystatechange = function(){ 
					if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
						done = true;
						script.onload = script.onreadystatechange = null;
						index++;
						if( index == url.length ){
							if (callback){
								callback.call(script);
							}
						}else{
							loadS( index );
						}
						
					}
				};
				document.getElementsByTagName("head")[0].appendChild(script);
			}
			loadS( index );
		},
		loadCss : function( url, callback ) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.media = 'screen';
			link.href = url;
			document.getElementsByTagName('head')[0].appendChild(link);
			if (callback){
				callback.call(link);
			}
		},
		// 判断图片是否全部加载完成 imgObj需要查找的img  callback回调函数
		isImgLoad : function(imgObj, callback){
			var t_img // 定时器
            	, isLoad = true // 控制变量
            	;
            var isImgLoad = function(){         // 判断图片加载的函数
                imgObj.each(function(){
                    // 找到为0就将isLoad设为false，并退出each
                    if(this.height === 0){
                        isLoad = false;
                        return false;
                    }
                });
                if(isLoad){ // 为true，没有发现为0的。加载完毕
                    clearTimeout(t_img); // 清除定时器
                    // 回调函数
                    callback();
                }else{
                    isLoad = true;
                    t_img = setTimeout(function(){
                        isImgLoad(callback); // 递归扫描
                    },17);
                }
            }
            isImgLoad();
		},
		// 获取几分钟前、几小时前、几天前等时间差
		timeDifference : function(publishTime){
			var d_seconds
			  , d_minutes
			  , d_hours
			  , d_days
			  , timeNow = Date.parse(new Date())
			  , d = (timeNow - publishTime)/1000
			  ;
			d_days = parseInt(d/86400);   // 天
			d_hours = parseInt(d/3600);   // 时   
			d_minutes = parseInt(d/60);   // 分
			d_seconds = parseInt(d);      // 秒

			if(d_days > 0 && d_days < 4) {       
				return d_days+"天前";       
			}
			else if(d_days <= 0 && d_hours > 0) {       
				return d_hours + "小时前";       
			}
			else if(d_hours <= 0 && d_minutes > 0) {       
				return d_minutes+"分钟前";       
			}
			else if(d_minutes <= 0 && d_seconds >= 0) {       
				return d_seconds+"秒前";       
			}
			else{       
				var s = new Date(publishTime);
				return s.getFullYear() + '年' + (s.getMonth() + 1) + "月" + s.getDate() + "日 " + s.getHours() + ':' + ':' + s.getMinutes() + ':' + s.getSeconds();
			}
		},
		// 获取时间倒计时
		getSetTimeout: function(time, cb){
			// callback 会返回两个参数(count, gaps)
			// count: 表示经过了多少段时间间隔
			// gaps: 少执行了多少次
			function interval(callback, intv){
				var self = this,
					st = new Date().getTime(),
					count = 0,
					excuteCount = 0,
					span,
					fn;
					
				fn = function(){
					span = new Date().getTime() - st;
					count = Math.floor(span/intv);
					span = intv - (span % intv);

					self._timer = setTimeout(function(){
						if(self._stop) return;
						count++;
						excuteCount++;
						fn();
						callback(count, count - excuteCount);
					}, span);
				};

				this.stop = function(){
					this._stop = true;
				};

				fn(0);
			}; // end interval
			var item = function(count, gaps){
				var newTime = time - count;
				cb(newTime);
				if(newTime < 0){
					timer.stop();
					cb({flg: true});
				};
			};
			var timer = new interval(item, 1000);
			item(0, 0);
		},
		formatDate: function (date) {
			var newTime = Util.getStringDate(date, true);

			var str = newTime.year + '.' + newTime.month + '.' + newTime.day + ' ' +
				  newTime.hour + ':' + newTime.minute + ':' + newTime.second;
			return str;
		},
		// 返回年月日单独字符串 可以自由组合 time为时间戳; 月、日、时、分、秒小于10是否前面补0
		getStringDate: function(time, flg){
			var newDate = new Date(time);
			var  obj = {
				year: newDate.getFullYear(),             // 年
				month: newDate.getMonth() + 1,           // 月
				day: newDate.getDate(),                  // 日
				hour: newDate.getHours(),                // 时
				minute: newDate.getMinutes(),            // 分
				second: newDate.getSeconds(),            // 秒
				milliseconds: newDate.getMilliseconds()  // 毫秒
			};
			//  月、日、时、分、秒小于10是否前面补0
			if(flg){
				// 月
				if (obj.month < 10) {
					obj.month = "0" + obj.month;
				}
				// 日
				if (obj.day < 10) {
					obj.day = "0" + obj.day;
				}
				// 时
				if (obj.hour < 10) {
					obj.hour = "0" + obj.hour;
				}
				// 分
				if (obj.minute < 10) {
					obj.minute = "0" + obj.minute;
				}
				// 秒
				if (obj.second < 10) {
					obj.second = "0" + obj.second;
				}
			}
			return obj;
		}
	};
	return Util;
});