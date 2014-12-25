!function(console, apply, enabled){
  try { delete global.console }
  catch(e){}
  // console methods in some browsers are not configurable
  $define(GLOBAL + FORCED, {console: turn.call(
    // Methods from:
    // https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
    // https://developer.mozilla.org/en-US/docs/Web/API/console
    array('assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,' +
      'groupEnd,info,isIndependentlyComposed,log,markTimeline,profile,profileEnd,' +
      'table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'),
    function(memo, key){
      var fn = console[key];
      if(!(NODE && key in console))memo[key] = function(){
        if(enabled && fn)return apply.call(fn, console, arguments);
      };
    }, {
      enable: function(){ enabled = true },
      disable: function(){ enabled = false }
    }
  )});
}(global.console || {}, FunctionProto.apply, true);