# widget listloading组件

# API
使用官方iscroll5.js封装

iscroll创建的必要条件为 id元素必须要在内容没有生成之前定义好高度 否则无法创建iscroll

考虑到请求完毕之后才能知道用户操作是否完成

设置三个基本回调函数 defaultLoader、pullUpAction、pullDownAction

回调完毕必须要调用调用发布订阅方法告知组件

id  (必须)

defaultLoader   (必须)默认加载函数 加载完毕之后需要调用 publishEvents.trigger('defaultLoader');

pullDownAction  (必须)下拉更新函数 加载完毕之后需要调用 publishEvents.trigger('pullDown');

pullUpAction    (可选)上拉加载更多函数 加载完毕之后需要调用 publishEvents.trigger('pullUp');

内容改变的时候调用 publishEvents.trigger('iscrollChange')   

isTime  是否显示时间
