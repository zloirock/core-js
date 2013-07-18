function timersBind(fn,that,args){
  isFunction(fn)||(fn=Function(fn));
  return function(){apply.call(fn,that,args)}
}
// ie9- setTimeout & setInterval .call & additional parameters fix
// on ie8- work only as (global|window).setTimeout, instead of setTimeout
// http://www.w3.org/TR/html5/webappapis.html#timers
// http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
if(global.navigator&&/MSIE .\./.test(navigator.userAgent))!function(setTimeout,setInterval){
  global.setTimeout=function(fn,time/*,args...*/){
    return setTimeout(
      timersBind(fn,this,slice.call(arguments,2)),
      time
    )
  };
  global.setInterval=function(fn,time/*,args...*/){
    return setInterval(
      timersBind(fn,this,slice.call(arguments,2)),
      time
    )
  }
}(setTimeout,setInterval);
// setImmediate
// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
if(!isFunction(global.setImmediate)||!isFunction(global.clearImmediate))!function(){
  if(isFunction(global.postMessage)){
    var msg='setImmediate'+random(),c=0,
        queue={},
        listner=function(e){
          var id=e.data;
          if(own(queue,id)){
            queue[id]();
            delete queue[id]
          }
        }
    global.setImmediate=function(fn/*,args...*/){
      var id=++c+msg;
      queue[id]=timersBind(fn,this,slice1(arguments));
      postMessage(id,'*');
      return c
    }
    global.clearImmediate=function(id){
      delete queue[c+msg]
    }
    if(global.addEventListener)addEventListener('message',listner,false);
    else attachEvent('onmessage',listner)
  }
  else{
    global.setImmediate=function(fn/*,args...*/){
      return setTimeout(timersBind(fn,this,slice1(arguments)),0)
    }
    global.clearImmediate=clearTimeout
  }
}()