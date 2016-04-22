"use strict";
define(["../../js/util", "../../js/event", "../../js/comm", "../../jslib/iscroll"], function (util, evt, comm){
	var timeDifference = util.timeDifference
		, publishEvents = comm.publishEvents
		;
	var Listloading = {
		setOption : function(obj) {
			var listLoadingIscroll 
			, pullDownOffset
			, pullUpOffset
			, pullUpEl
			, pullDownEl
			, count = 0 // 拖动n次只执行最后一次
			, id = obj.id
			, isTime = obj.isTime  // 是否需要显示时间
			, uploadmoretxt = '上拉加载更多...'
			, pullDrefreshtxt = '下拉加载更多...'
			, clickloadmoretxt = '努力加载中...'
			, loadertxt = '努力加载中...'
			, Realtimetxt = '松开刷新...'
			, loaderendtxt = '已显示完全部'
			, uprefreshtxt = '努力加载中...'
			, loading_gif = '<img src="../../images/wheel.gif" class="loading-gif" width="28" height="28" />'
			, __flg = true   // 防止多次拖拽
			, __idHeight = $(id).height()
			, __endDate = Date.parse(new Date())
			, __children = $($(id).get(0).children[0])
			, IScrollTopAanimated
			, _idReplace = id.replace('#', '')
			, _idReplace = _idReplace.replace('.', '')
			, pullUpId = 'pullUp-' + _idReplace
			, pullDownId = 'pullDown-' + _idReplace
			, clickDownId = 'clickDown-' + _idReplace
			;
			publishEvents.remove('defaultLoader');
			publishEvents.remove('pullUp');
			publishEvents.remove('pullDown');
			publishEvents.remove('iscrollChange');
			// 防止拖动点击
			$(id).addClass('rel');
			// 是否显示上拉加载更多
			var __isShowRefreshDow = function(){
				// 如果加载更多存在 则不再去load pullUp
				if(pullUpEl) return;
				// 设置滚动
				var __childrenHeight = $(__children).height()
					, __minScrollHeight = __idHeight + pullDownOffset   // 最小滚动高度
					;
				
				if(!obj.clickDownAction && obj.pullUpAction && __childrenHeight > __minScrollHeight){
					$(__children).append('<div id="' + pullUpId + '" data-class="pullUpId"><span class="inlineblock-span">' + loading_gif + '<span class="pullUpLabel">' + uploadmoretxt + '</span></span></div>');
					pullUpEl = $('#' + pullUpId);
					pullUpOffset = pullUpEl.get(0).offsetHeight;
				}else{
					$(__children).css('min-height', __minScrollHeight);
				}
			}
			// iscroll内容改变
			publishEvents.listen('iscrollChange',function(data){
				var __childrenHeight = $(__children).height()
					, __minScrollHeight = __idHeight + pullDownOffset   // 最小滚动高度
					;
				if(__childrenHeight <= __minScrollHeight && pullUpEl){
					pullUpEl.remove();
					pullUpEl = null;
				}
				// 是否显示上拉加载更多
				__isShowRefreshDow();
				listLoadingIscroll.refresh();
			});
			// 默认创建listLoading
			var	__creatIScrollFn = function(){
				var __timeHtml = isTime ? '<span class="time">最后更新时间：<em id="time-em"></em></span>' : ''
					, pullDownHtml = '<div id="' + pullDownId + '" data-class="pullDownId">' +
								     '	<span class="inlineblock-span">' + loading_gif + 
								     '		<span class="pullDownLabel">' + pullDrefreshtxt + '</span>' + 
								     '	</span>' +
								     	__timeHtml + 
								     '</div>';
				$(pullDownHtml).prependTo($(__children));

				pullDownEl = $('#' + pullDownId);

				pullDownOffset = pullDownEl.get(0) ? pullDownEl.get(0).offsetHeight : 0;

				
				// 是否显示上拉加载更多
				__isShowRefreshDow();
				
				// 点击加载更多
				if( obj.clickDownAction && $.isFunction(obj.clickDownAction) ){
					$(__children).append('<div id="' + clickDownId + '" data-class="clickDownId"><span class="clickDownLabel">' + clickloadmoretxt + '</span></div>');
					evt.bind($("body"), "#" + clickDownId, "click", function(){
						$('.clickDownLabel').html(loadertxt);
						if(__flg){ // 防止多次点击
							publishEvents.listen('clickDown',function(){
								publishEvents.remove('clickDown');
								listLoadingIscroll.refresh();		// 数据加载完成后，调用界面更新方法
								$('.clickDownLabel').html(clickloadmoretxt);
								__flg = true; // 防止多次点击		
							});
						}
						__flg = false;
						obj.clickDownAction();
					});
				}
			};
			// 设置class和提示
			var __toggleTextFn = function(obj, cls, labelCls, text){
				obj.attr('class', cls).find('.' + labelCls).text(text);
			}
			// 复位动画
			var __animateFn = function(hei){
				listLoadingIscroll.scrollTo(0, hei, 300, IScrollTopAanimated);
			}
			// 创建action
			var __loaderFn = function(){
				var __timeStart = 0
					, __timeEnd = 0
					, __totaltime = 0
					;
				
				// 开始
				listLoadingIscroll.on('scrollStart', function(){
					__timeStart = new Date().getTime();
					$('#' + pullUpId + ' .loading-gif').removeClass('dn');
					// 时间
					if(isTime && timeDifference) $('#time-em').html(timeDifference(__endDate));

					if( pullDownEl.hasClass('loading') ) {
						// 设置class和提示
						__toggleTextFn(pullDownEl, '', 'pullDownLabel', pullDrefreshtxt);
					} else if( pullUpEl && pullUpEl.hasClass('loading') ) {
						// 设置class和提示
						__toggleTextFn(pullUpEl, '', 'pullUpLabel', uploadmoretxt);
					}
				});
				// 移动
				listLoadingIscroll.on('scrollMove', function(){
					var __y = this.y
						, __number = 5
						, __pullDownElCls = pullDownEl.hasClass('flip')
						, __pullUpElCls = pullUpEl && pullUpEl.hasClass('flip')
						, __maxScrollY = this.maxScrollY
						;
					// 防止拖动点击 添加一个遮罩层
					$(__children).addClass('scroll');   
					
					if ( __y > __number && !__pullDownElCls ) {
						// 设置class和提示
						__toggleTextFn(pullDownEl, 'flip', 'pullDownLabel', Realtimetxt);
					}
					else if (__y < __number && __pullDownElCls) {
						// 设置class和提示
						__toggleTextFn(pullDownEl, '', 'pullDownLabel', pullDrefreshtxt);
					} 
					else if (pullUpEl && __y < (__maxScrollY - __number) && !__pullUpElCls) {
						// 设置class和提示
						__toggleTextFn(pullUpEl, 'flip', 'pullUpLabel', Realtimetxt);
					} 
					else if (pullUpEl && __y > (__maxScrollY + __number) && __pullUpElCls) {
						// 设置class和提示
						__toggleTextFn(pullUpEl, '', 'pullUpLabel', uploadmoretxt);
					}
				});
				// 结束
				listLoadingIscroll.on('scrollEnd', function(){
					// 滚动到底自动加载更多
					if(this.y === this.maxScrollY && pullUpEl){
						__toggleTextFn(pullUpEl, 'flip', 'pullUpLabel', Realtimetxt);
					}
					__timeEnd = new Date().getTime();
					__totaltime = __timeEnd - __timeStart;
					__endDate = Date.parse(new Date());
					// quadratic | circular | back | bounce | elastic
					IScrollTopAanimated = IScroll.utils.ease.quadratic;

					// 删除遮罩层 
					$(__children).removeClass('scroll');
					
					// 防止拖动过快卡屏
					if( __totaltime < 200 ) {
						if(this.y > -pullDownOffset && this.y < 1){
							// 隐藏加载完毕文字
							__animateFn(-pullDownOffset);
						}
						return false;
					}
					if (pullDownEl.hasClass('flip')) {
						// 设置class和提示
						__toggleTextFn(pullDownEl, 'loading', 'pullDownLabel', loadertxt);	
						// 下拉刷新		
						__pullDownAction();
					}
					else if (pullUpEl && pullUpEl.hasClass('flip')) {
						// 设置class和提示
						__toggleTextFn(pullUpEl, 'loading', 'pullUpLabel', loadertxt);
						// 上拉加载更多
						__pullUpAction();
					}
					// 
					else if( this.y > -pullDownOffset && this.y < 1 ){
						// 隐藏加载完毕文字
						__animateFn(-pullDownOffset);
					}
				});
			}
			// 上拉加载更多
			var __pullUpAction = function(){
				if( $.isFunction(obj.pullUpAction) && __flg ) {
					publishEvents.listen('pullUp', function(data){
						// console.log(data)
						var loaderText = loaderendtxt;
						// 数据全部加载完毕
						if( data != undefined && data.end ){
							pullUpEl.find('.loading-gif').addClass('dn');
							// 复位
							count++;
							setTimeout(function(){
								if(--count !== 0) return;
								__animateFn(listLoadingIscroll.y + pullUpOffset);
							}, 700);								
						}else{
							loaderText = uploadmoretxt;
						}
						pullUpEl.find('.pullUpLabel').text(loaderText);
						// 数据加载完成后，调用界面更新方法
						listLoadingIscroll.refresh();
						publishEvents.remove('pullUp');
						// 防止多次拖拽
						__flg = true; 
					});
					obj.pullUpAction();
				}
				// 防止多次拖拽
				__flg = false; 
			}
			// 下拉刷新
			var __pullDownAction = function() {
				if( $.isFunction(obj.pullDownAction) && __flg ) {
					publishEvents.listen('pullDown',function(data){
						if( pullUpEl ) pullUpEl.find('.pullUpLabel').text(uploadmoretxt);
						// 复位
						count++;
						// 是否显示上拉加载更多
						__isShowRefreshDow();
						setTimeout(function(){
							if(--count !== 0) return;
							__animateFn(-pullDownOffset);
						}, 10);
						// 数据加载完成后，调用界面更新方法
						listLoadingIscroll.refresh();
						// 删除
						publishEvents.remove('pullDown');
						// 防止多次拖拽
						__flg = true; 
					});
					obj.pullDownAction();
				}
				// 防止多次拖拽
				__flg = false; 
			}
			// 默认加载
			if( $.isFunction(obj.defaultLoader) ){
				// 默认加载
				publishEvents.listen('defaultLoader',function(){
					// 滚动区域必须要大于它父元素 才会创建listloading  data
					// if( $(__children).height() < __idHeight ) return;

					// 默认创建listLoading
					__creatIScrollFn();  
					// 创建IScroll
					listLoadingIscroll = new IScroll(id,{
						// preventDefault为false这行就是解决onclick失效问题
		                // 为true就是阻止事件冒泡,所以onclick没用
		                // preventDefault: false,
						startY : -pullDownOffset,
						listLoading: true // iscroll中_move  433行  刷新bug
					});
					__loaderFn();
					// 返回IScroll
					publishEvents.trigger('getISCroll', listLoadingIscroll);  
					publishEvents.remove('defaultLoader');
				});
				obj.defaultLoader(listLoadingIscroll);
			}
		}
	};
	return Listloading;
});