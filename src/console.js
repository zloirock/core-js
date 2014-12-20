!function(console, enabled){
  var exports  = core.console = framework ? console || (global.console = {}) : {}
    , _console = console || {};
  var $console = turn.call(
    /**
     * Methods from:
     * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
     * https://developer.mozilla.org/en-US/docs/Web/API/console
     */
    array('assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,' +
      'groupEnd,info,isIndependentlyComposed,log,markTimeline,profile,profileEnd,' +
      'table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'),
    function(memo, key){
      var fn = _console[key];
      if(!(NODE && key in _console))hidden(memo, key, function(){
        if(enabled && fn)return apply.call(fn, console, arguments);
      });
    }, assignHidden(exports, {
      enable: function(){
        enabled = true;
      },
      disable: function(){
        enabled = false;
      }
    })
  );
}(global.console, true);