var task = {
  set:   $.g.setImmediate,
  clear: $.g.clearImmediate
};
// Node.js 0.9+ & IE10+ has setImmediate, else:
$.isFunction(task.set) && $.isFunction(task.clear) || function(ONREADYSTATECHANGE){
  var postMessage      = $.g.postMessage
    , addEventListener = $.g.addEventListener
    , MessageChannel   = $.g.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  task.set = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke($.isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  task.clear = function(id){
    delete queue[id];
  }
  function run(id){
    if($.has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      process.nextTick(partial.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && $.isFunction(postMessage) && !$.g.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if($.isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = $.ctx(port.postMessage, port, 1);
  // IE8-
  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
    defer = function(id){
      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
        $.html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(partial.call(run, id), 0);
    }
  }
}('onreadystatechange');