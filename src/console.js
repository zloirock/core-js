!function(console, enabled){
  var _console = {
    enable: function(){ enabled = true },
    disable: function(){ enabled = false }
  };
  // Methods from:
  // https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
  // https://developer.mozilla.org/en-US/docs/Web/API/console
  forEach.call(array('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
      'groupCollapsed,groupEnd,info,isIndependentlyComposed,log,markTimeline,profile,' +
      'profileEnd,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'),
    function(key){
      var fn = console[key];
      _console[key] = function(){
        if(enabled && fn)return apply.call(fn, console, arguments);
      };
    }
  );
  // console methods in some browsers are not configurable
  try {
    framework && delete global.console;
  } catch(e){}
  $define(GLOBAL + FORCED, {console: _console});
}(global.console || {}, true);