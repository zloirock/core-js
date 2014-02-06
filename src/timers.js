/**
 * ie9- setTimeout & setInterval additional parameters fix
 * on ie8- work only as (global|window).setTimeout, instead of setTimeout
 * http://www.w3.org/TR/html5/webappapis.html#timers
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
 * Alternatives:
 * https://developer.mozilla.org/ru/docs/Web/API/Window.setTimeout#IE_Only_Fix
 */
!function(navigator){
  function wrap(set){
    return function(fn, time /*, args...*/){
      return set(part.apply(isFunction(fn) ? fn : Function(fn), $slice(arguments, 2)), time || 1)
    }
  }
  // ie9- dirty check
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    global.setTimeout  = wrap(setTimeout);
    global.setInterval = wrap(setInterval);
  }
}(global.navigator);