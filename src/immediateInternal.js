/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
var isSetImmediate = isFunction(setImmediate) && isFunction(clearImmediate);
// Node.js 0.9+ and IE10+ has native setImmediate, else:
isSetImmediate || !function(process, postMessage, addEventListener, MessageChannel, onreadystatechange){
  var prefix  = 'i' + random()
    , counter = 0
    , queue   = {}
    , run, channel;
  setImmediate = function(fn){
    var id     = prefix + ++counter
      , length = arguments.length
      , args   = Array(length - 1)
      , i      = 1;
    while(length > i)args[i - 1] = arguments[i++];
    queue[id] = function(){
      (isFunction(fn) ? fn : Function(fn)).apply(global, args)
    }
    run(id);
    return counter
  }
  clearImmediate = function(id){
    delete queue[prefix + id]
  }
  function task(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn()
    }
  }
  function listner(event){
    if(event.source === global)task(event.data)
  }
  // Node.js 0.8-
  if(classof(process) == 'process'){
    run = function(id){
      process.nextTick(part.call(task, id))
    }
  // Modern browsers
  // IE8 has postMessage, but it's sync & typeof postMessage is object
  } else if(isFunction(postMessage)){
    run = function(id){
      postMessage(id, '*')
    }
    if(addEventListener)addEventListener('message', listner, false);
    else attachEvent('onmessage', listner)
  // WebWorkers
  //} else if(isFunction(MessageChannel)){
  //  channel = new MessageChannel();
  //  channel.port1.onmessage = function(event){
  //    task(event.data)
  //  };
  //  run = tie.call(channel.port2, 'postMessage')
  // IE8-
  // use DOM => use after onload
  // always run before timers, like nextTick => some problems with recursive call
  } else if(document && onreadystatechange in document.createElement('script')){
    run = function(id){
      var el = document.createElement('script');
      el[onreadystatechange] = function(){
        el.parentNode.removeChild(el);
        task(id)
      }
      document.documentElement.appendChild(el)
    }
  // Rest old browsers
  } else run = function(id){
      setTimeout(part.call(task, id), 0)
    }
}(global.process, global.postMessage, global.addEventListener, global.MessageChannel, 'onreadystatechange');