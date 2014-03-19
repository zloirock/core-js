/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || !function(process, postMessage, MessageChannel, onreadystatechange){
  var IMMEDIATE_PREFIX = symbol('immediate')
    , counter = 0
    , queue   = {}
    , defer, channel;
  setImmediate = function(fn){
    var id   = IMMEDIATE_PREFIX + ++counter
      , args = $slice(arguments, 1);
    queue[id] = function(){
      (isFunction(fn) ? fn : Function(fn)).apply(undefined, args);
    }
    defer(id);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[IMMEDIATE_PREFIX + id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(classof(process) == 'process'){
    defer = function(id){
      process.nextTick(part.call(run, id));
    }
  // Modern browsers with native Promise
  } else if($Promise && isFunction($Promise.resolve)){
    defer = function(id){
      $Promise.resolve(id).then(run);
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel();
    channel.port1.onmessage = listner;
    defer = ctx(channel.port2.postMessage, channel.port2);
  // IE8-
  // always run before timers, like nextTick => some problems with recursive call
  } else if(document && onreadystatechange in document.createElement('script')){
    defer = function(id){
      var el = document.createElement('script');
      el[onreadystatechange] = function(){
        el.parentNode.removeChild(el);
        run(id);
      }
      document.documentElement.appendChild(el);
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
  }
}(global.process, global.postMessage, global.MessageChannel, 'onreadystatechange');
$define(GLOBAL, {
  setImmediate: setImmediate,
  clearImmediate: clearImmediate
});