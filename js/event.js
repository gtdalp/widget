define(function (){
	window.scorllAnitimate = true;
    var startTime = null;
    /******************BROWSER Event Mode**********************/
    var touchable = "ontouchstart" in window;
    var clickEvent = touchable ? "touchstart" : "click",
        mouseDownEvent = touchable ? "touchstart" : "mousedown",
        mouseUpEvent = touchable ? "touchend" : "mouseup",
        mouseMoveEvent = touchable ? "touchmove" : "mousemove",
        mouseMoveOutEvent = touchable ? "touchleave" : "mouseout";
    window.iscrollMoveFlg = false;
    var _returnData = function(evt){
        var neweEvt = {};
        var cev = evt.originalEvent;
        if( cev == undefined ) {
            cev = evt;
        }
        if(cev.changedTouches){
            neweEvt.pageX = cev.changedTouches[0].pageX;
            neweEvt.pageY = cev.changedTouches[0].pageY;
            neweEvt.clientX = cev.changedTouches[0].clientX;
            neweEvt.clientY = cev.changedTouches[0].clientY;
        }else{
            neweEvt.pageX = evt.pageX;
            neweEvt.pageY = evt.pageY;
            neweEvt.clientX = evt.clientX;
            neweEvt.clientY = evt.clientY;
        }
        neweEvt.evt = evt;
        return neweEvt;
    };
    var getTouchPos = function(e){
        return { x : e.clientX , y: e.clientY };
    }
    //计算两点之间距离
    var getDist = function(p1 , p2){
        if(!p1 || !p2) return 0;
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    };
    //获取swipe的方向
    var getSwipeDirection = function(p2,p1){
        var dx = p2.x - p1.x;
        var dy = -p2.y + p1.y;
        var angle = Math.atan2(dy , dx) * 180 / Math.PI;

        if(angle < 45 && angle > -45) return "right";
        if(angle >= 45 && angle < 135) return "top";
        if(angle >= 135 || angle < -135) return "left";
        if(angle >= -135 && angle <= -45) return "bottom";
    };
    var getAngle = function(p2,p1){
        var dx = p2.x - p1.x;
        var dy = -p2.y + p1.y;
        var angle = Math.atan2(dy , dx) * 180 / Math.PI;
        return angle;
    };
    var _onClick = function(dom, evt, callback){
        //startTime = Date.parse(new Date());
        var neweEvt = _returnData(evt);
        callback(dom, neweEvt);
    };
    var _onClickDown = function(dom, evt, callback){
        var neweEvt = _returnData(evt);
        callback(dom, neweEvt);
    };
    var _onClickUp = function(dom, evt, callback){
        var neweEvt = _returnData(evt);
        callback(dom, neweEvt);
    };
    var _onMove = function(dom, evt, callback){
        var neweEvt = _returnData(evt);
        callback(dom, neweEvt);
    };
    var _onOut = function(evt, callback){
        var neweEvt = _returnData(evt);
        callback(dom, neweEvt);
    };
    var Events = {
        bind : function(rootEle, element, type, eventHandle, flg){
            if( flg == undefined ) {
                flg = true;
            }
            switch(type){
                case "mousemove" :
                case "touchmove" :
                    if( flg ) {
                        rootEle.off(mouseMoveEvent, element);
                    }
                    rootEle.on(mouseMoveEvent, element, function(e){
                        _onMove($(this), e, eventHandle);
                    });
                    break;
                case "click" :
                case "tap" :
                    //按下松开之间的移动距离小于20，认为发生了tap
                    var TAP_DISTANCE = 20;
                    var pt_pos;
                    var ct_pos;
                    var startEvtHandler = function(e){
                        var ev = _returnData(e);
                        ct_pos = getTouchPos(ev);
                    };
                    var endEvtHandler = function(dom_,e, fn){
                        // e.stopPropagation();
                        var ev = _returnData(e);
                        var now = Date.now();
                        var pt_pos = getTouchPos(ev);
                        var dist = getDist(ct_pos , pt_pos);
                        dom_.removeClass("buy-active");
                        // console.info(window.iscrollMoveFlg);
                        if(dist < TAP_DISTANCE) {
                            _onClick(dom_, e, eventHandle);
                        }else{
                            window.iscrollMoveFlg = true;
                        }
                    };
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        //TODO:this have bug!all input element attach blur function will trigger!
                        //$("input").blur();
                        //$("input").blur();
                        startEvtHandler(e);
                    });
                    rootEle.on(mouseUpEvent, element, function(e){
                        // if( window.iscrollMoveFlg ){
                        //     return;
                        // }
                        var $this = $(this);
                        endEvtHandler($this,e,eventHandle);
                    });
                    break;
                case "mousedown" :
                case "touchstart" :
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        _onClickDown($(this), e, eventHandle);
                    });
                    break;
                case "mouseup" :
                case "touchend" :
                    if( flg ) {
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseUpEvent, element, function(e){
                        _onClickUp($(this), e, eventHandle);
                    });
                    break;
                case "mouseout" :
                    if( flg ) {
                        rootEle.off(mouseMoveOutEvent, element);
                    }
                    rootEle.on(mouseMoveOutEvent, element, function(e){
                        endEvtHandler(e, eventHandle);
                    });
                    break;
                case "swipe":
                    var arg = eventHandle();
                    var startEvent = arg["sCallback"],
                        moveEvent = arg["mCallback"],
                        endEvent = arg["eCallback"];
                    //按下之后移动30px之后就认为swipe开始
                    var SWIPE_DISTANCE = 30;
                    //swipe最大经历时间
                    var SWIPE_TIME = 500;
                    var pt_pos;
                    var ct_pos;
                    var pt_time;
                    var pt_up_time;
                    var pt_up_pos;
                    var pt_move_pos;
                    var startEvtHandler = function(dom_, e){
                        e.stopPropagation();
                        var ev = _returnData(e);
                        pt_pos = ct_pos = getTouchPos(ev);
                        pt_move_pos = pt_pos;
                        pt_time = Date.now();
                        startEvent(dom_, ev);
                    }
                    var moveEvtHandler = function(dom_, e){
                        e.stopPropagation();
                        e.preventDefault();
                        var ev = _returnData(e);
                        ct_pos = getTouchPos(ev);
                        if(pt_pos == undefined) {
                            return;
                        }
                        var dir = getSwipeDirection(ct_pos,pt_pos);
                        var dist = getDist(pt_pos,ct_pos);
                        var angle = getAngle(ct_pos,pt_move_pos);
                        ev.dir = dir;
                        ev.angle = angle;
                        ev.dist = getDist(pt_pos,pt_up_pos);
                        moveEvent(dom_, ev);
                        pt_move_pos = ct_pos;
                    }
                    var endEvtHandler = function(dom_, e){
                        e.stopPropagation();
                        var dir;
                        var ev = _returnData(e);
                        pt_up_pos = ct_pos;
                        pt_up_time = Date.now();
                        if(getDist(pt_pos,pt_up_pos) > SWIPE_DISTANCE){
                            //pt_up_time - pt_time
                            dir = getSwipeDirection(pt_up_pos,pt_pos);
                            ev.dir = dir;
                            ev.dist = getDist(pt_pos,pt_up_pos);
                            ev.tm = pt_up_time - pt_time;
                            endEvent(dom_, ev);
                        }
                        pt_pos = undefined;
                    }
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                        rootEle.off(mouseMoveEvent, element);
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        var $this = $(this);
                        startEvtHandler($this, e);
                    });
                    rootEle.on(mouseMoveEvent, element, function(e){
                        var $this = $(this);
                        moveEvtHandler($this, e);
                    });
                    rootEle.on(mouseUpEvent, element, function(e){
                        var $this = $(this);
                        endEvtHandler($this, e);
                    });
                    break;
                case "hold" :
                    //按下松开之间的移动距离小于20，认为点击生效
                    var HOLD_DISTANCE = 20;
                    //按下两秒后hold触发
                    var HOLD_TIME = 2000;
                    var holdTimeId;
                    var pt_pos;
                    var ct_pos;
                    var startEvtHandler = function(dom_,e,fn){
                        e.stopPropagation();
                        var ev = _returnData(e);
                        var touches = e.touches;
                        if(!touches || touches.length == 1){//鼠标点击或者单指点击
                            pt_pos = ct_pos = getTouchPos(ev);
                            pt_time = Date.now();
                            holdTimeId = setTimeout(function(){
                                if(touches && touches.length != 1) return;
                                if(getDist(pt_pos,ct_pos) < HOLD_DISTANCE){
                                    fn(dom_, ev);
                                }
                            },HOLD_TIME);
                        }
                    }
                    var endEvtHandler = function(e){
                        e.stopPropagation();
                        clearTimeout(holdTimeId);
                    }
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        var $this = $(this);
                        startEvtHandler($this,e,eventHandle);
                    });
                    rootEle.on(mouseUpEvent, element, function(e){
                        endEvtHandler(e);
                    });
                    break;
                    default:
                    rootEle.off(type, element).on(type, element, function(e){
                        eventHandle($(this), e);
                    });
                    break;
                }
        },
        trigger : function(ele, type) {
            var evt = clickEvent;
            switch( type ) {
                case "click":
                case "tap":
                    evt = mouseUpEvent;
                    break;
                case "mousedown":
                    evt = mouseDownEvent;
                    break;
                case "mousemove":
                    evt = mouseMoveEvent;
                    break;
            }
            $(ele).trigger(evt);
        }
    };
    var EMG = {};
    EMG.events = {};
    EMG.interceptors = {};
    EMG.Constant = {
        SCOPE: " __ALL__ "
    };
    EMG.registerEvent = function(eventalias, event, scope) {
        if (typeof(scope) == 'undefined') {
            scope = EMG.Constant.SCOPE
        }
        if (EMG.events[scope] == null) {
            EMG.events[scope] = {}
        }
        EMG.events[scope][eventalias] = event
    };
    EMG.unregisterEvent = function(eventalias, scope) {
        if (typeof(scope) == 'undefined') {
            scope = EMG.Constant.SCOPE
        }
        EMG.events[scope][eventalias] = null
    };
    EMG.Interceptor = {
        BEFORE: " before ",
        AFTER: " after "
    };
    EMG.clear = function(scope) {
        if (typeof(scope) == 'undefined') {
            EMG.events = {};
            EMG.interceptors = {}
        } else {
            EMG.events[scope] = null;
            EMG.interceptors[scope] = null
        }
    };
    EMG.directyinvoke = function(eventalias, dom, ev, scope) {
        if (typeof(scope) == 'undefined') {
            scope = EMG.Constant.SCOPE
        }
        if (EMG.events[scope] == null) {
            return
        }
        var bindevent = EMG.events[scope][eventalias];
        if (bindevent != null) {
            EMG.invokeInterceptor(eventalias, EMG.Interceptor.BEFORE, dom, ev, scope);
            bindevent.call(this, dom, ev);
            EMG.invokeInterceptor(eventalias, EMG.Interceptor.AFTER, dom, ev, scope)
        }
    };
    EMG.invoke = function(eventalias, params, scope) {
        EMG.directyinvoke(eventalias, params.current, params.ev, scope)
    };
    EMG.invokeInterceptor = function(eventalias, type, dom, ev, scope) {
        if (EMG.interceptors[scope] == null) {
            return
        }
        var interceptors = EMG.interceptors[scope][eventalias];
        if (typeof(interceptors) == 'undefined') {
            return
        }
        var typeInterceptors = interceptors[type];
        if (typeInterceptors == null) {
            return
        }
        for (var i = 0; i < typeInterceptors.length; i++) {
            typeInterceptors[i].call(this, dom, ev)
        }
    };
    EMG.addBeforeInterceptor = function(eventalias, interceptor, scope) {
        EMG.addInterceptor(eventalias, interceptor, EMG.Interceptor.BEFORE, scope)
    };
    EMG.removeBeforeInterceptor = function(eventalias, interceptor, scope) {
        EMG.removeInterceptor(eventalias, interceptor, EMG.Interceptor.BEFORE, scope)
    };
    EMG.addAfterInterceptor = function(eventalias, interceptor, scope) {
        EMG.addInterceptor(eventalias, interceptor, EMG.Interceptor.AFTER, scope)
    };
    EMG.removeAfterInterceptor = function(eventalias, interceptor, scope) {
        EMG.removeInterceptor(eventalias, interceptor, EMG.Interceptor.AFTER, scope)
    };
    EMG.addInterceptor = function(eventalias, interceptor, type, scope) {
        if (typeof(scope) == 'undefined') {
            scope = EMG.Constant.SCOPE
        }
        if (EMG.interceptors[scope] == null) {
            EMG.interceptors[scope] = {}
        }
        var interceptors = EMG.interceptors[scope][eventalias];
        if (interceptors == null) {
            interceptors = {}
        }
        if (interceptors[type] == null) {
            interceptors[type] = new Array()
        }
        if (EMG.interceptors[scope][eventalias] == undefined) {
            interceptors[type].push(interceptor);
            EMG.interceptors[scope][eventalias] = interceptors
        }
    };
    EMG.removeInterceptor = function(eventalias, interceptor, type, scope) {
        if (typeof(scope) == 'undefined') {
            scope = EMG.Constant.SCOPE
        }
        if (EMG.interceptors[scope] == null) {
            return
        }
        var interceptors = EMG.events[scope][eventalias];
        if (interceptors == null) {
            return
        }
        if (interceptors[type] == null) {
            return
        }
        interceptors[type].pop(interceptor);
        EMG.interceptors[scope][eventalias] = interceptors
    };
	return Events;
});