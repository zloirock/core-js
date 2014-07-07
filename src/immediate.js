/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || !function(postMessage, MessageChannel,
    ONREADYSTATECHANGE, IMMEDIATE_PREFIX, counter, queue, defer, channel){
  setImmediate = function(fn){
    var id   = IMMEDIATE_PREFIX + ++counter
      , args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[id] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args)
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
  if(isNode){
    defer = function(id){
      process.nextTick(part.call(run, id));
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
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      var el = document[CREATE_ELEMENT]('script');
      el[ONREADYSTATECHANGE] = function(){
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
}(global.postMessage, global.MessageChannel, 'onreadystatechange', symbol('immediate'), 0, {});
$defineTimer('setImmediate', setImmediate);
$defineTimer('clearImmediate', clearImmediate);