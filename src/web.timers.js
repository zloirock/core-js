// ie9- setTimeout & setInterval additional parameters fix
!function(MSIE, A){
  function wrap(set){
    return MSIE ? function(fn, time /*, ...args */){
      return set(invoke(partial, A.slice.call(arguments, 2), isFunction(fn) ? fn : Function(fn)), time);
    } : set;
  }
  $define(GLOBAL + BIND + FORCED * MSIE, {
    setTimeout:  wrap(setTimeout),
    setInterval: wrap(setInterval)
  });
  // ie9- dirty check
}(!!global.navigator && /MSIE .\./.test(navigator.userAgent), []);