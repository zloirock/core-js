!function(navigator, setTimeout, setInterval, postMessage, setImmediate, clearImmediate, addEventListener){
  function timersBind(fn, args){
    return part.apply(isFunction(fn) ? fn : Function(fn), args);
  }
  /**
   * ie9- setTimeout & setInterval additional parameters fix
   * on ie8- work only as (global|window).setTimeout, instead of setTimeout
   * http://www.w3.org/TR/html5/webappapis.html#timers
   * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
   */
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    global.setTimeout = function(fn, time /*, args...*/){
      return setTimeout(timersBind(fn, slice.call(arguments, 2)), time)
    };
    global.setInterval = function(fn, time /*, args...*/){
      return setInterval(timersBind(fn, slice.call(arguments, 2)), time)
    }
  }
  /**
   * setImmediate
   * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
   */
  if(!isFunction(global[setImmediate]) || !isFunction(global[clearImmediate])){
    if(isFunction(postMessage)){
      var msg     = setImmediate + random()
        , counter = 0
        , queue   = {}
        , listner = function(e){
            var id = e.data;
            if(id in queue){
              queue[id]();
              delete queue[id]
            }
          }
      global[setImmediate] = function(fn /*, args...*/){
        var id = ++counter + msg;
        queue[id] = timersBind(fn, slice1(arguments));
        postMessage(id, '*');
        return counter
      }
      global[clearImmediate] = function(id){
        delete queue[id + msg]
      }
      if(addEventListener)addEventListener('message', listner, false);
      else attachEvent('onmessage', listner)
    }
    else{
      global[setImmediate] = function(fn /*, args...*/){
        return setTimeout(timersBind(fn, slice1(arguments)), 0)
      }
      global[clearImmediate] = clearTimeout
    }
  }
}(global.navigator, setTimeout, setInterval, global.postMessage, 'setImmediate', 'clearImmediate', global.addEventListener);