'use strict';
var $       = require('./$')
  , cof     = require('./$.cof')
  , invoke  = require('./$.invoke')
  , partial = require('./$.partial')
  , setTask = $.g.setImmediate
  , clrTask = $.g.clearImmediate;
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
$.isFunction(setTask) && $.isFunction(clrTask) || function(ONREADYSTATECHANGE){
  var postMessage      = $.g.postMessage
    , addEventListener = $.g.addEventListener
    , MessageChannel   = $.g.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke($.isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clrTask = function(id){
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
  if(cof($.g.process) == 'process'){
    defer = function(id){
      $.g.process.nextTick(partial.call(run, id));
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
module.exports = {
  set:   setTask,
  clear: clrTask
};