"use strict";
define(function (){
	var Alert = function(obj){
		if( obj == undefined ) return;
		var title = obj.title || ''
			, content = obj.content || ''
			, buttons = obj.buttons || [{cls : 'cancel', text : '取消'}, {cls : 'determine', text : '确定'}]
			, len = buttons.length
			, buttonsFn = new Array(len)
			, i = 0
			, html = ''
			;
			html += '\
			<section id="Alert" class="in">\
				<div id="AlertDialog" class="animated">\
					<h3 id="AlertDialogH3">' + title + '</h3>';
			html += content ? '<div id="AlertDialogcont">' + content + '</div>' : '';
			html += '<div id="AlertDialogbtn">';
			for( ; i < len ; i++ ){
				var arrFn = buttons[i]
					, fn = arrFn.fn
					;
				if($.isFunction(fn)) buttonsFn[i] = fn;
				html += '<a href="javascript:void(0);" data-number="' + i + '" class="' + ( arrFn.cls || '' ) + '">' + ( arrFn.text || '' ) + '</a>';
			}
			html += '</div>\
				</div>\
			</section>\
		';
		$('body').append(html);
		// 删除alert
		var removeAlert = function(){
			cont.addClass('bounceOut');
			$('#Alert').addClass('out');
			setTimeout(function(){
				$('#Alert').remove();
			}, 760);
		}
		// 判断回调函数
		var isCallBack = function(cb){
			if($.isFunction(cb)){
				var cbFn = cb();
				if(!cbFn){
					// 删除alert
					removeAlert();
				}
			}else{
				// 删除alert
				removeAlert();
			}
		}
		var cont = $('#AlertDialog')
			, hei = cont.height()/2
			;
		cont.css('margin-top', -hei)
			.addClass('bounceIn')
			.find('a').on('click', function(){
				// 自定义
				if(obj.buttons && obj.buttons.length > 0){
					var number = $(this).attr('data-number')
						, fn = buttonsFn[number]
						;
					// 判断回调函数
					isCallBack(fn);
				}else{
					// 判断回调函数
					isCallBack(obj.ok);   // 默认确定按钮回调
					isCallBack(obj.cancel); // 默认取消按钮回调
				}
			});
	}
	return Alert;
});