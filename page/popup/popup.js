"use strict";
define(function (){
	var popup = function(val, time) {
		if ($("#popup").length > 0) {
			return;
		}
		var time = time || 3000
			, windowWidth = $(window).width()
			, windowHeight = $(window).height()
			;
		$("body").append('<section id="popup"><div class="tips rubberBand animated">' + val + '</div></section>');
		$('#popup').height(windowHeight).width(windowWidth);
		var tips = $('#popup>.tips');
		var _hei = tips.height()/2
			, _wid = tips.width()/2
			;
		tips.css({'margin': -_hei+'px 0 0 -'+_wid+'px'});
		setTimeout(function () {
			tips.addClass('bounceOutDown');
			setTimeout(function(){
				$('#popup').remove();
			}, 700);
		}, time);
	}
	return popup;
});